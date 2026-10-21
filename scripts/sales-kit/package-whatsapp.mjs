import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const result=spawnSync('python3',['-c',`from pathlib import Path
import zipfile
root=Path(${JSON.stringify(root)})
output=root/'public/SKYROTE13/whatsapp/Nexo-WhatsApp-Supabase.zip'
names=['supabase/config.toml','supabase/migrations/202610200002_whatsapp.sql','supabase/functions/crm-whatsapp/index.ts','supabase/functions/crm-whatsapp/campaign.json','supabase/functions/_shared/lr-whatsapp-client.mjs','supabase/functions/_shared/whatsapp-core.mjs','supabase/functions/_shared/whatsapp-http.mjs','supabase/functions/_shared/whatsapp-store.mjs','supabase/functions/_shared/whatsapp-domain.mjs','supabase/functions/_shared/whatsapp-runtime.mjs','supabase/functions/_shared/sectors.mjs','supabase/functions/_shared/templates.mjs','supabase/functions/_shared/outreach-templates.mjs','supabase/functions/_shared/email-core.mjs','supabase/functions/_shared/campaign-core.mjs','supabase/functions/_shared/campaign-store.mjs','supabase/functions/crm-email/index.ts','supabase/functions/_shared/crm/domain.js','supabase/functions/_shared/crm/prospecting.js']
files=[root/name for name in names]
with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED) as archive:
 def add(name,data):
  info=zipfile.ZipInfo(str(name),(2026,10,20,0,0,0));info.external_attr=0o644<<16
  archive.writestr(info,data,compress_type=zipfile.ZIP_DEFLATED)
 for p in files: add(p.relative_to(root),p.read_bytes())
 add('LEEME.txt','''Nexo WhatsApp: paquete de función privada.
Instalación: https://nexoamedida.com/SKYROTE13/whatsapp/
El paquete actualizado de LR confirma su API publicada. Falta instalar esta función y configurar su clave exclusivamente en los secretos de Supabase.
No hay credenciales incluidas. No se envían mensajes al extraer este ZIP.
''')
print('Paquete de función privada generado, sin secretos.')`],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status||1);
