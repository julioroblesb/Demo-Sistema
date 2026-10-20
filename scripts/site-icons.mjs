import { readFileSync, writeFileSync } from 'node:fs';
export const icons = '<link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">';
const pages = {
  'index.html': 'Nexo | Sistemas a medida',
  'public/brand/index.html': 'Nexo | Marca',
  'public/brand/perfiles/index.html': 'Nexo | Perfiles',
  'public/estudio-6e94b8f2c731/index.html': 'Nexo | Contenido',
};
for (const [file, title] of Object.entries(pages)) {
  let html = readFileSync(file, 'utf8');
  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`).replace(/<link\b[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*>/g, '').replace('</head>', icons + '</head>');
  writeFileSync(file, html);
}
