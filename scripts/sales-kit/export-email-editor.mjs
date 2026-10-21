import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
const root=new URL('../../',import.meta.url);
await build({entryPoints:[fileURLToPath(new URL('supabase/functions/crm-email/index.ts',root))],outfile:fileURLToPath(new URL('public/SKYROTE13/whatsapp/crm-email-editor.txt',root)),bundle:true,platform:'neutral',format:'esm',target:'es2022',external:['npm:*','node:*'],legalComments:'none',banner:{js:'// Nexo: función privada crm-email. Pegar todo el contenido en index.ts del editor de Supabase.\n// No contiene secretos.'}});
console.log('Función Zoho de archivo único preparada, sin credenciales.');
