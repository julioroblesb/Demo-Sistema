import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';

// Un único archivo para el editor web de Edge Functions. Los secretos siguen
// leyéndose con Deno.env en Supabase; nunca se sustituyen durante la compilación.
const root=new URL('../../',import.meta.url);
await build({
 entryPoints:[fileURLToPath(new URL('supabase/functions/crm-whatsapp/index.ts',root))],
 outfile:fileURLToPath(new URL('public/SKYROTE13/whatsapp/crm-whatsapp-editor.txt',root)),
 bundle:true,platform:'neutral',format:'esm',target:'es2022',
 external:['npm:*','node:*'],legalComments:'none',
 banner:{js:'// Nexo: pegar el contenido completo en index.ts del editor de Supabase.\n// Nombre de función: crm-whatsapp. Los secretos se leen solo en el servidor.'},
});
console.log('Función de archivo único preparada para el editor web, sin credenciales.');
