-- Nexo: tabla adicional de intentos. No cambia ni borra las empresas existentes.
begin;
create table if not exists public.crm_whatsapp_jobs (
 id uuid primary key,
 owner_id uuid not null references auth.users(id),
 company_id text not null,
 recipient text not null check(recipient ~ '^\+[1-9][0-9]{7,14}$'),
 caption text not null check(length(caption) between 1 and 1024),
 payload_hash text not null check(payload_hash ~ '^[a-f0-9]{64}$'),
 contact_id text not null default '',
 consent jsonb not null check(jsonb_typeof(consent)='object' and coalesce(consent->'confirmed'='true'::jsonb,false)),
 email_evidence jsonb not null,
 image_sha256 text not null,
 status text not null default 'prepared' check(status in('prepared','validating','validated','submitting','queued','processing','sent','failed','uncertain','cancelled')),
 provider_message_id uuid,
 provider_whatsapp_id text,
 error_code text,
 error_message text,
 lease_until timestamptz,
 sent_at timestamptz,
 logged_at timestamptz,
 version integer not null default 1 check(version>0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists crm_whatsapp_owner_company on public.crm_whatsapp_jobs(owner_id,company_id,created_at desc);
create unique index if not exists crm_whatsapp_pending_recipient on public.crm_whatsapp_jobs(owner_id,company_id,recipient)
 where status in('prepared','validating','validated','submitting','queued','processing','uncertain');
alter table public.crm_whatsapp_jobs enable row level security;
drop policy if exists crm_whatsapp_read_own on public.crm_whatsapp_jobs;
create policy crm_whatsapp_read_own on public.crm_whatsapp_jobs for select to authenticated
 using(owner_id=(select auth.uid()) and exists(select 1 from public.crm_members where user_id=(select auth.uid())));
revoke all on public.crm_whatsapp_jobs from public,anon,authenticated;
grant select on public.crm_whatsapp_jobs to authenticated;
grant all on public.crm_whatsapp_jobs to service_role;

create or replace function public.crm_whatsapp_prepare(actor uuid,job jsonb) returns public.crm_whatsapp_jobs
language plpgsql security definer set search_path='' as $$
declare existing public.crm_whatsapp_jobs%rowtype; result public.crm_whatsapp_jobs%rowtype; target public.crm_records%rowtype;
begin
 if actor is null or not exists(select 1 from public.crm_members where user_id=actor) then raise exception 'NOT_AUTHORIZED' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended(actor::text,0));
 select * into target from public.crm_records where owner_id=actor and kind='companies' and id=job->>'company_id';
 if target.id is null then raise exception 'COMPANY_NOT_FOUND';end if;
 if coalesce((target.data->>'archived')::boolean,false) or target.data->>'status' in('no_contactar','no_encaja') or target.data->>'pipeline_stage'='perdida' then raise exception 'CONTACT_BLOCKED';end if;
 select * into existing from public.crm_whatsapp_jobs where id=(job->>'id')::uuid;
 if existing.id is not null then
  if existing.owner_id<>actor then raise exception 'JOB_NOT_FOUND';end if;
  if existing.payload_hash<>job->>'payload_hash' then raise exception 'IDEMPOTENCY_CONFLICT';end if;
  return existing;
 end if;
 select * into existing from public.crm_whatsapp_jobs where owner_id=actor and company_id=job->>'company_id' and recipient=job->>'recipient'
  and (status in('prepared','validating','validated','submitting','queued','processing','uncertain') or (status='sent' and payload_hash=job->>'payload_hash'))
  order by created_at desc limit 1;
 if existing.id is not null then
  if existing.payload_hash<>job->>'payload_hash' then raise exception 'JOB_PENDING';end if;
  return existing;
 end if;
 insert into public.crm_whatsapp_jobs(id,owner_id,company_id,recipient,caption,payload_hash,contact_id,consent,email_evidence,image_sha256)
 values((job->>'id')::uuid,actor,job->>'company_id',job->>'recipient',job->>'caption',job->>'payload_hash',coalesce(job->>'contact_id',''),job->'consent',job->'email_evidence',job->>'image_sha256') returning * into result;
 return result;
end;$$;

create or replace function public.crm_whatsapp_claim(actor uuid,job_id uuid,expected integer,is_dry_run boolean) returns public.crm_whatsapp_jobs
language plpgsql security definer set search_path='' as $$
declare result public.crm_whatsapp_jobs%rowtype; target public.crm_records%rowtype; contact public.crm_records%rowtype; phone text;
begin
 if actor is null or not exists(select 1 from public.crm_members where user_id=actor) then raise exception 'NOT_AUTHORIZED' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended(actor::text,0));
 select * into result from public.crm_whatsapp_jobs where id=job_id and owner_id=actor for update;
 if result.id is null then raise exception 'JOB_NOT_FOUND';end if;
 if result.version<>expected then raise exception 'JOB_BUSY';end if;
 if result.error_code in('RATE_LIMITED','QUEUE_LIMIT') and result.lease_until>now() then raise exception 'RATE_LIMITED';end if;
 select * into target from public.crm_records where owner_id=actor and kind='companies' and id=result.company_id;
 if target.id is null or coalesce((target.data->>'archived')::boolean,false) or target.data->>'status' in('no_contactar','no_encaja') or target.data->>'pipeline_stage'='perdida' then raise exception 'CONTACT_BLOCKED';end if;
 if result.contact_id<>'' then
  select * into contact from public.crm_records where owner_id=actor and kind='contacts' and id=result.contact_id and data->>'company_id'=result.company_id;
  if contact.id is null then raise exception 'RECIPIENT_CHANGED';end if;
  phone:=coalesce(contact.data->>'phone','');
 else phone:=coalesce(target.data->>'phone','');end if;
 phone:=regexp_replace(phone,'[^0-9]','','g');if left(phone,2)='00' then phone:=substring(phone from 3);end if;
 if phone ~ '^9[0-9]{8}$' then phone:='51'||phone;end if;
 if '+'||phone<>result.recipient then raise exception 'RECIPIENT_CHANGED';end if;
 if result.status not in('prepared','validated') and not(result.status='uncertain' and result.provider_message_id is null and not is_dry_run and coalesce(result.lease_until,now())<=now()) then raise exception 'JOB_BUSY';end if;
 update public.crm_whatsapp_jobs set status=case when is_dry_run then 'validating' else 'submitting' end,lease_until=now()+interval '3 minutes',error_code=null,error_message=null,version=version+1,updated_at=now()
 where id=job_id returning * into result;
 return result;
end;$$;
revoke all on function public.crm_whatsapp_prepare(uuid,jsonb),public.crm_whatsapp_claim(uuid,uuid,integer,boolean) from public,anon,authenticated;
grant execute on function public.crm_whatsapp_prepare(uuid,jsonb),public.crm_whatsapp_claim(uuid,uuid,integer,boolean) to service_role;
commit;
