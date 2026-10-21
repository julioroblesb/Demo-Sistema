import { createClient } from '@supabase/supabase-js';
import { emptyData } from './domain.js';
import { checkOperations, ConflictError } from './repository.js';
const storageKey='nexo-crm-auth';
const storage={getItem:key=>localStorage.getItem(key)||sessionStorage.getItem(key),setItem:(key,value)=>(localStorage.getItem('nexo-crm-remember')==='1'?localStorage:sessionStorage).setItem(key,value),removeItem:key=>{localStorage.removeItem(key);sessionStorage.removeItem(key);}};
const unpack=row=>({...row.data,id:row.id,version:row.version,created_at:row.created_at,updated_at:row.updated_at});
function failure(error){if(error?.message?.includes('CONFLICT_UI'))return new ConflictError();if(['42P01','PGRST205','PGRST202'].includes(error?.code))return new Error('Falta instalar las tablas del CRM. Abre Configurar conexión y ejecuta el SQL en tu proyecto Supabase.');return new Error(error?.message||'No se pudo conectar con Supabase.');}
export class CloudConnection {
 constructor(config){this.client=createClient(config.url,config.publishableKey,{auth:{storageKey,storage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});}
 watchAuth(callback){let active=true,eventSeen=false,last=Symbol();const notify=user=>{if(!active||(user?.id||null)===last)return;last=user?.id||null;callback(user);};this.client.auth.getSession().then(({data,error})=>{if(!eventSeen)notify(error?null:data.session?.user||null);});const {data}=this.client.auth.onAuthStateChange((event,session)=>{if(['SIGNED_IN','SIGNED_OUT','USER_UPDATED'].includes(event)){eventSeen=true;queueMicrotask(()=>notify(session?.user||null));}});return ()=>{active=false;data.subscription.unsubscribe();};}
 async login(email,password,remember=false){await this.client.auth.signOut({scope:'local'});localStorage.setItem('nexo-crm-remember',remember?'1':'0');const {error}=await this.client.auth.signInWithPassword({email,password});if(error)throw failure(error);}
 async logout(){const {error}=await this.client.auth.signOut({scope:'local'});if(error)throw failure(error);}
 async reset(){throw new Error('Por ahora recupera tu acceso desde Supabase → Authentication → Users. No compartas tu contraseña en el chat.');}
 async whatsapp(action,payload={}){const {data,error}=await this.client.functions.invoke('crm-whatsapp',{body:{action,...payload}});if(error){let problem;try{problem=await error.context?.clone().json();}catch{}const failure=new Error(problem?.error?.message||'Falta activar la función privada de WhatsApp. Abre los pasos de activación.');failure.code=problem?.error?.code||'WHATSAPP_FUNCTION_UNAVAILABLE';throw failure;}if(data?.error)throw new Error(data.error.message);return data;}
 async email(action,payload={}){const {data,error}=await this.client.functions.invoke('crm-email',{body:{action,...payload}});if(error){let problem;try{problem=await error.context?.clone().json();}catch{}const failure=new Error(problem?.error?.message||'Falta autorizar Zoho Mail en la función privada.');failure.code=problem?.error?.code||'EMAIL_FUNCTION_UNAVAILABLE';throw failure;}if(data?.error)throw new Error(data.error.message);return data;}
 async close(){await this.client.removeAllChannels();this.client.auth.stopAutoRefresh();}
 repository(user,callback,onError){return new SupabaseRepository(this.client,user,callback,onError);}
}
class SupabaseRepository {
 constructor(client,user,callback,onError){Object.assign(this,{client,user,callback,onError});this.data=emptyData();this.stopped=false;this.request=0;this.realtime=false;this.loaded=false;this.refresh=()=>this.load().catch(onError);this.offline=()=>this.emit(false);this.visible=()=>{if(document.visibilityState==='visible')this.refresh();};}
 emit(connected){if(!this.stopped)this.callback(structuredClone(this.data),{ready:true,connected,demo:false});}
 async start(){
  const {data,error}=await this.client.from('crm_members').select('user_id').eq('user_id',this.user.id);
  if(error)throw failure(error);if(!data?.length)throw new Error('Tu usuario todavía no está autorizado. Abre Configurar conexión y ejecuta la consulta de autorización con tu UUID.');
  await this.load();if(this.stopped)return;
  this.channel=this.client.channel('nexo-crm-'+this.user.id).on('postgres_changes',{event:'*',schema:'public',table:'crm_records',filter:'owner_id=eq.'+this.user.id},payload=>{const row=payload.new;if(!row?.id){this.refresh();return;}if(row.owner_id!==this.user.id||!this.data[row.kind])return;++this.request;const list=this.data[row.kind],index=list.findIndex(item=>item.id===row.id);if(index<0)list.push(unpack(row));else if(row.version>=list[index].version)list[index]=unpack(row);clearTimeout(this.notification);this.notification=setTimeout(()=>this.emit(navigator.onLine),100);}).subscribe(status=>{this.realtime=status==='SUBSCRIBED';if(this.loaded)this.emit(navigator.onLine);if(this.realtime)this.refresh();});
  addEventListener('online',this.refresh);addEventListener('offline',this.offline);document.addEventListener('visibilitychange',this.visible);
  this.timer=setInterval(()=>{if(!this.realtime&&document.visibilityState==='visible')this.refresh();},60000);
 }
 async load(){const request=++this.request;const next=emptyData();let offset=0;while(true){const {data,error}=await this.client.from('crm_records').select('*').order('kind').order('id').range(offset,offset+999);if(error)throw failure(error);for(const row of data)if(next[row.kind])next[row.kind].push(unpack(row));if(data.length<1000)break;offset+=1000;}if(this.stopped||request!==this.request)return;this.data=next;this.loaded=true;this.emit(navigator.onLine);}
 async commit(operations){if(!navigator.onLine)throw new Error('Recupera internet antes de guardar.');checkOperations(this.data,operations);const {data,error}=await this.client.rpc('crm_commit',{operations});if(error)throw failure(error);++this.request;for(const row of data){const list=this.data[row.kind],record=unpack(row),index=list.findIndex(item=>item.id===row.id);if(index<0)list.push(record);else list[index]=record;}this.emit(true);this.load().catch(this.onError);}
 stop(){this.stopped=true;clearInterval(this.timer);clearTimeout(this.notification);if(this.channel)this.client.removeChannel(this.channel);removeEventListener('online',this.refresh);removeEventListener('offline',this.offline);document.removeEventListener('visibilitychange',this.visible);}
}
