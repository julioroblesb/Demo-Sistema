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
 add('supabase/functions/_shared/outreach-contact.mjs',(root/'supabase/functions/_shared/outreach-contact.mjs').read_bytes())
 add('Actualizar-Nexo.cmd',(root/'scripts/sales-kit/Actualizar-Nexo.cmd').read_bytes().replace(bytes([13,10]),bytes([10])).replace(bytes([10]),bytes([13,10])))
 add('LEEME.txt','''Nexo: actualizar correo, WhatsApp y campañas.
Guía desde cualquier navegador: https://nexoamedida.com/SKYROTE13/campanas/

Desde Windows:
1. Extrae TODO este ZIP en una carpeta.
2. Abre Actualizar-Nexo.cmd. Necesitas Node.js LTS (https://nodejs.org).
3. Autoriza Supabase en el navegador. El instalador actualiza crm-email y crm-whatsapp.
4. Cuando confirme ambos despliegues, vuelve al CRM y recarga.

Se conservan los secretos, contactos, campañas e historial.
No se ejecutan SQL ni migraciones, ni se cambian DNS o claves.
La cola conserva su funcionamiento actual: necesita una sesión del CRM abierta.
No hay credenciales incluidas. No se envían mensajes al extraer este ZIP.
''')
print('Paquete de función privada generado, sin secretos.')`],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status||1);
