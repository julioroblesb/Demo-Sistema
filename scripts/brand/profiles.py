from pathlib import Path
import io,shutil,zipfile,xml.etree.ElementTree as ET
import cairosvg
from PIL import Image,ImageDraw,ImageFont
REPO=Path(__file__).resolve().parents[2]
DELIVERABLES=REPO.parent/'deliverables'
src=DELIVERABLES/'nexo-identidad/02-Logos/SVG'
out=DELIVERABLES/'Nexo-Perfiles-JPG';out.mkdir(exist_ok=True)
variants=[('verde-sobre-blanco','principal','#FFFFFF','Verde / blanco'),('blanco-sobre-verde','blanco','#247459','Blanco / Verde Nexo'),('blanco-sobre-bosque','blanco','#20352B','Blanco / Tinta bosque'),('principal-sobre-salvia','principal','#EEF2EE','Principal / Salvia'),('negro-sobre-blanco','negro','#FFFFFF','Negro / blanco'),('blanco-sobre-negro','blanco','#000000','Blanco / negro')]
entries=[]
for kind,label in [('isotipo','Isotipo'),('apilado','Logo completo')]:
 for i,(slug,version,bg,title) in enumerate(variants,1):
  svg=src/f'nexo-{kind}-{version}.svg'
  image=Image.open(io.BytesIO(cairosvg.svg2png(url=str(svg),output_width=1800))).convert('RGBA')
  image=image.crop(image.getchannel('A').getbbox())
  image.thumbnail((660,660),Image.Resampling.LANCZOS)
  canvas=Image.new('RGB',(1080,1080),bg)
  canvas.paste(image,((1080-image.width)//2,(1080-image.height)//2),image)
  name=f'nexo-{kind}-{i:02}-{slug}-1080.jpg';canvas.save(out/name,quality=97,subsampling=0,dpi=(96,96))
  entries.append((kind,label,title,name))
fontroot=DELIVERABLES/'nexo-identidad/04-Tipografias/TTF'
font=ImageFont.truetype(str(fontroot/'dm-sans-Medium.ttf'),21)
preview=Image.new('RGB',(1440,2300),'#FAFBFC');draw=ImageDraw.Draw(preview)
head=ImageFont.truetype(str(fontroot/'manrope-Bold.ttf'),42)
draw.text((40,30),'Nexo · Fotos de perfil',font=head,fill='#20352B')
draw.text((42,93),'1080 × 1080 px · JPG · Margen para recorte circular',font=font,fill='#607168')
for idx,(kind,label,title,name) in enumerate(entries):
 x=40+(idx%3)*470;y=155+(idx//3)*530
 im=Image.open(out/name);im.thumbnail((430,430),Image.Resampling.LANCZOS);preview.paste(im,(x,y))
 draw.text((x,y+447),label,font=font,fill='#20352B');draw.text((x,y+478),title,font=font,fill='#607168')
preview=preview.crop((0,0,1440,2300));preview.save(out/'Vista-previa.jpg',quality=94,subsampling=0)
(out/'LEEME.txt').write_text('NEXO — FOTOS DE PERFIL\n\n12 archivos JPG de 1080 x 1080 px, RGB: 6 versiones del isotipo y 6 del logo completo apilado.\n\nTodos están centrados con margen para recorte circular. Sube el archivo completo sin ampliar ni acercar durante el recorte.\n\nRecomendado para perfiles pequeños: nexo-isotipo-02-blanco-sobre-verde-1080.jpg.\nPara mostrar también el nombre: nexo-apilado-02-blanco-sobre-verde-1080.jpg.\n\nLas versiones mantienen las formas y los colores del maestro vectorial del kit de identidad.\n')
archive=DELIVERABLES/'Nexo-Perfiles-JPG.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(out.iterdir()):z.write(p,'Nexo-Perfiles-JPG/'+p.name)
with zipfile.ZipFile(archive) as z:assert z.testzip() is None
public=REPO/'public/brand/perfiles';public.mkdir(exist_ok=True)
for p in out.glob('*.jpg'):shutil.copy(p,public/p.name)
shutil.copy(archive,public.parent/archive.name)
for _,_,_,name in entries:
 im=Image.open(public/name);assert im.size==(1080,1080) and im.mode=='RGB' and im.format=='JPEG'
html='''<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nexo | Perfiles</title><link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><style>@font-face{font-family:DM;src:url(../DM-Sans.woff2);font-weight:100 1000}@font-face{font-family:Manrope;src:url(../Manrope.woff2);font-weight:200 800}*{box-sizing:border-box}body{margin:0;background:#fafbfc;color:#20352b;font-family:DM,sans-serif;line-height:1.6}main{max-width:1100px;padding:35px 24px;margin:auto}h1,h2{font-family:Manrope;letter-spacing:-1px}h1{font-size:38px;margin:35px 0 10px}p{color:#607168}a{color:#247459}.download{display:inline-block;background:#247459;color:white;text-decoration:none;padding:13px 20px;border-radius:7px;margin:15px 0 30px}h2{font-size:25px;margin:25px 0}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}article{border:1px solid #dce5de;background:white;border-radius:10px;overflow:hidden}article img{display:block;width:100%;height:auto;aspect-ratio:1}article a{display:block;padding:13px 16px;font-size:13px;text-decoration:none}article a:hover{text-decoration:underline}a:focus-visible{outline:3px solid #66b493;outline-offset:4px}@media(max-width:650px){.grid{grid-template-columns:1fr 1fr;gap:12px}h1{font-size:30px}article a{font-size:11px;padding:10px}}</style></head><body><main><a href="../">← Kit de identidad</a><h1>Tu marca, en formato de perfil.</h1><p>12 imágenes JPG de 1080 × 1080 px. Centradas y preparadas para recorte circular.</p><a class="download" href="../Nexo-Perfiles-JPG.zip" download>Descargar todas · ZIP</a>'''
for kind,label in [('isotipo','Isotipo · Recomendado para perfiles pequeños'),('apilado','Logo completo · Símbolo y nombre')]:
 html+=f'<h2>{label}</h2><div class="grid">'
 for k,_,title,name in entries:
  if k==kind:html+=f'<article><img src="{name}" alt="Nexo: {title}" width="1080" height="1080"><a href="{name}" download>{title} · Descargar JPG</a></article>'
 html+='</div>'
html+='</main></body></html>'
(public/'index.html').write_text(html)
p=public.parent/'index.html';s=p.read_text();s=s if 'href="perfiles/"' in s else s.replace('<a href="Nexo-Brand-Board.png" download>Descargar lámina · PNG</a>','<a href="Nexo-Brand-Board.png" download>Descargar lámina · PNG</a><a href="perfiles/">Fotos de perfil · JPG</a>');p.write_text(s)
print('PASS: 12 JPG exports, RGB, 1080x1080. ZIP:',archive.stat().st_size,'bytes')
