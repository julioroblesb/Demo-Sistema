-- Nexo CRM · ejecutar completo en SQL Editor del proyecto indicado.
-- No contiene contraseñas. No elimina registros existentes; se puede repetir.
begin;
create table if not exists public.crm_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.crm_records (
  owner_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('companies','contacts','deals','tasks','activities','payments','milestones','settings')),
  id text not null check (id ~ '^[A-Za-z0-9_-]{1,100}$'),
  data jsonb not null check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 60000 and data->>'id' = id),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, kind, id)
);
create index if not exists crm_records_company on public.crm_records(owner_id,kind,(data->>'company_id'));
create index if not exists crm_records_deal on public.crm_records(owner_id,kind,(data->>'deal_id'));
alter table public.crm_members enable row level security;
alter table public.crm_records enable row level security;
drop policy if exists crm_members_read on public.crm_members;
create policy crm_members_read on public.crm_members for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists crm_records_read on public.crm_records;
create policy crm_records_read on public.crm_records for select to authenticated using (
  owner_id = (select auth.uid()) and exists(select 1 from public.crm_members m where m.user_id = (select auth.uid()))
);
revoke all on public.crm_members, public.crm_records from anon, authenticated;
grant select on public.crm_members, public.crm_records to authenticated;
-- Las escrituras solo pasan por esta transacción. Un enlace secreto NO sustituye al acceso personal.
create or replace function public.crm_commit(operations jsonb) returns setof public.crm_records
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  operation jsonb; payload jsonb; category text; record_id text;
  previous public.crm_records%rowtype; entry public.crm_records%rowtype;
  expected integer; company text; deal text; total numeric;
begin
  if actor is null or not exists(select 1 from public.crm_members where user_id = actor) then
    raise exception 'Esta cuenta no está autorizada en Nexo CRM.' using errcode = '42501';
  end if;
  if jsonb_typeof(operations) <> 'array' or jsonb_array_length(operations) not between 1 and 180 then
    raise exception 'Envía entre 1 y 180 registros por transacción.';
  end if;
  -- Serializa operaciones del mismo propietario, incluso desde dos dispositivos.
  perform pg_advisory_xact_lock(hashtextextended(actor::text, 0));
  for operation in select value from jsonb_array_elements(operations) loop
    category := operation->>'type'; payload := operation->'record'; record_id := payload->>'id';
    if category is null or category not in ('companies','contacts','deals','tasks','activities','payments','milestones','settings') or
       jsonb_typeof(payload) <> 'object' or record_id is null or record_id !~ '^[A-Za-z0-9_-]{1,100}$' then
      raise exception 'Registro inválido.';
    end if;
    if not (operation ? 'expected') or jsonb_typeof(operation->'expected') <> 'number' then raise exception 'Falta la versión del registro.'; end if;
    expected := (operation->>'expected')::integer;
    select * into previous from public.crm_records where owner_id=actor and kind=category and id=record_id;
    if coalesce(previous.version,0) <> expected then raise exception 'CONFLICT_UI: Este registro cambió en otro dispositivo.'; end if;
    if category='payments' and previous.id is not null and
       (previous.data->'amount_cents' is distinct from payload->'amount_cents' or previous.data->'deal_id' is distinct from payload->'deal_id') then
      raise exception 'Un cobro se anula; su importe y venta no se reescriben.';
    end if;
    if category='deals' and previous.id is not null and previous.data->>'currency' is distinct from payload->>'currency' and
       exists(select 1 from public.crm_records where owner_id=actor and kind='payments' and data->>'deal_id'=record_id and coalesce((data->>'voided')::boolean,false)=false) then
      raise exception 'No cambies la moneda de una venta con cobros.';
    end if;
    if category in ('companies','contacts') and coalesce(length(trim(payload->>'name')),0) not between 1 and 180 then raise exception 'Escribe un nombre válido.'; end if;
    if category in ('deals','tasks','milestones') and coalesce(length(trim(payload->>'title')),0) not between 1 and 220 then raise exception 'Escribe un título válido.'; end if;
    if category in ('contacts','deals','activities') and coalesce(payload->>'company_id','')='' then raise exception 'Selecciona una empresa.'; end if;
    if category in ('payments','milestones') and coalesce(payload->>'deal_id','')='' then raise exception 'Selecciona una oportunidad.'; end if;
    if category='activities' and coalesce(length(trim(payload->>'body')),0) not between 1 and 12000 then raise exception 'Escribe la actividad.'; end if;
    if category='companies' and coalesce(payload->>'status','') not in ('nueva','investigada','contactada','conversacion','calificada','cliente','no_encaja','no_contactar') then raise exception 'Estado de empresa inválido.'; end if;
    if category='tasks' and (coalesce(payload->>'status','') not in ('pendiente','progreso','hecha','cancelada') or coalesce(payload->>'due_date','') !~ '^\d{4}-\d{2}-\d{2}$') then raise exception 'Revisa el estado y fecha de la tarea.'; end if;
    if category='deals' then
      if coalesce(payload->>'stage','') not in ('diagnostico','demo','propuesta','negociacion','ganada','perdida') or coalesce(payload->>'currency','') not in ('PEN','USD') then raise exception 'Etapa o moneda inválida.'; end if;
      if coalesce(payload->>'amount_cents','') !~ '^\d+$' or coalesce(payload->>'paid_cents','') !~ '^\d+$' or (payload->>'amount_cents')::numeric > 100000000000 then raise exception 'Importe inválido.'; end if;
      if payload->>'stage'='ganada' and ((payload->>'amount_cents')::numeric<=0 or coalesce(payload->>'closed_date','') !~ '^\d{4}-\d{2}-\d{2}$') then raise exception 'La venta necesita importe y fecha de cierre.'; end if;
      if payload->>'stage'='perdida' and coalesce(length(trim(payload->>'lost_reason')),0)=0 then raise exception 'Indica el motivo de pérdida.'; end if;
    end if;
    if category='payments' and (coalesce(payload->>'amount_cents','') !~ '^[1-9]\d*$' or jsonb_typeof(payload->'voided') is distinct from 'boolean') then raise exception 'Cobro inválido.'; end if;
    if category='milestones' and jsonb_typeof(payload->'done') is distinct from 'boolean' then raise exception 'Hito inválido.'; end if;
    if category='settings' and (record_id<>'preferences' or coalesce(payload->>'target_companies','') !~ '^\d+$' or (payload->>'target_companies')::numeric not between 1 and 100000) then raise exception 'Meta inválida.'; end if;
    payload := payload - 'version' - 'created_at' - 'updated_at';
    insert into public.crm_records(owner_id,kind,id,data,version) values(actor,category,record_id,payload,1)
    on conflict(owner_id,kind,id) do update set data=excluded.data,version=public.crm_records.version+1,updated_at=now();
  end loop;
  -- Valida relaciones y saldos SOBRE el resultado completo, dentro de la misma transacción.
  for entry in select * from public.crm_records where owner_id=actor loop
    company := nullif(entry.data->>'company_id',''); deal := nullif(entry.data->>'deal_id','');
    if company is not null and not exists(select 1 from public.crm_records where owner_id=actor and kind='companies' and id=company) then raise exception 'La empresa vinculada no existe.'; end if;
    if deal is not null and not exists(select 1 from public.crm_records where owner_id=actor and kind='deals' and id=deal) then raise exception 'La oportunidad vinculada no existe.'; end if;
    if deal is not null and company is not null and not exists(select 1 from public.crm_records where owner_id=actor and kind='deals' and id=deal and data->>'company_id'=company) then raise exception 'La oportunidad pertenece a otra empresa.'; end if;
    if entry.kind='deals' then
      select coalesce(sum((data->>'amount_cents')::numeric),0) into total from public.crm_records where owner_id=actor and kind='payments' and data->>'deal_id'=entry.id and (data->>'voided')::boolean=false;
      if total > (entry.data->>'amount_cents')::numeric or total <> (entry.data->>'paid_cents')::numeric then raise exception 'El saldo no coincide con los cobros o supera el importe de venta.'; end if;
      if total>0 and entry.data->>'stage'<>'ganada' then raise exception 'Los cobros requieren una venta ganada.'; end if;
    end if;
  end loop;
  return query select r.* from public.crm_records r where r.owner_id=actor and exists(select 1 from jsonb_array_elements(operations) o where o->>'type'=r.kind and o->'record'->>'id'=r.id);
end;
$$;
revoke all on function public.crm_commit(jsonb) from public, anon;
grant execute on function public.crm_commit(jsonb) to authenticated;
do $$ begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime') and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='crm_records') then
    alter publication supabase_realtime add table public.crm_records;
  end if;
end $$;
commit;
-- Falta autorizar tu usuario PERSONAL. En Authentication → Users crea tu usuario,
-- copia su UUID y ejecuta la segunda consulta que genera la pantalla del CRM.
