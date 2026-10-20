from pathlib import Path
import json, zipfile
from PIL import Image

ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'public/estudio-6e94b8f2c731/soluciones'
data=json.loads((OUT/'contenido.json').read_text())
all_ig=[];all_fb=[]
readme='''NEXO · SEIS CARRUSELES 1:1

Cada carpeta contiene cinco JPG de 1080 × 1080 píxeles. Súbelos en orden 01–05 en una misma publicación. La descripción de Instagram y la de Facebook están separadas para copiar la correspondiente.

Instagram: coloca web y WhatsApp en los enlaces del perfil. Facebook: el texto ya incluye los enlaces. Los textos alternativos están en un archivo aparte; no forman parte de la descripción.

El PDF es para revisar la colección. A Instagram subes las imágenes JPG, no el PDF ni el ZIP. Los números C01–C06 organizan los archivos; no son fechas ni una programación automática.

Para la prospección actual de empresas de alquiler, comienza por C01. Publica los seis como contenido orgánico. Ninguna publicación ni anuncio se ha activado desde esta entrega.

Contacto Nexo: nexoamedida.com · +51 936 755 465 · asesoria@nexoamedida.com
'''
(OUT/'archivos/COMO-PUBLICAR.txt').write_text(readme)
for post in data['posts']:
 directory=OUT/'archivos'/f"{post['id']}-{post['slug']}"
 assert len(post['slides'])==5
 for slide in post['slides']:
  with Image.open(OUT/slide['file']) as image:assert image.size==(1080,1080)
  texts=[slide['title'].replace('\n',' '),slide['lead']]
  texts += [item for key in ['steps','numbers','record','milestones'] for row in slide.get(key,[]) for item in row]
  texts += slide.get('result',[])
  texts += [slide.get(key,'') for key in ['note','formula','before','after','cta','subcta','visualTitle','visualNote']]
  slide['alt']='Nexo. '+post['sector']+'. '+'. '.join(text for text in texts if text)+'.'
 (directory/'Descripcion-Instagram.txt').write_text(post['ig']+'\n')
 (directory/'Descripcion-Facebook.txt').write_text(post['fb']+'\n')
 (directory/'Textos-alternativos.txt').write_text('\n\n'.join(f"LÁMINA {i+1}\n{s['alt']}" for i,s in enumerate(post['slides']))+'\n')
 with zipfile.ZipFile(OUT/'archivos'/f"{post['id']}-{post['slug']}.zip",'w',zipfile.ZIP_DEFLATED) as archive:
  for path in sorted(directory.iterdir()):archive.write(path,path.relative_to(directory))
  archive.writestr('COMO-PUBLICAR.txt',readme)
 all_ig.append(post['id']+' · '+post['sector']+'\n\n'+post['ig'])
 all_fb.append(post['id']+' · '+post['sector']+'\n\n'+post['fb'])
(OUT/'archivos/Descripciones-Instagram.txt').write_text('\n\n'.join(all_ig)+'\n')
(OUT/'archivos/Descripciones-Facebook.txt').write_text('\n\n'.join(all_fb)+'\n')
with zipfile.ZipFile(OUT/'archivos/Nexo-6-carruseles-1a1.zip','w',zipfile.ZIP_DEFLATED) as archive:
 for post in data['posts']:
  directory=OUT/'archivos'/f"{post['id']}-{post['slug']}"
  for path in sorted(directory.iterdir()):archive.write(path,path.relative_to(OUT/'archivos'))
 for name in ['COMO-PUBLICAR.txt','Descripciones-Instagram.txt','Descripciones-Facebook.txt','Nexo-6-carruseles-vista-completa.pdf']:
  archive.write(OUT/'archivos'/name,name)
(OUT/'contenido.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
for path in (OUT/'archivos').glob('*.zip'):
 with zipfile.ZipFile(path) as archive:assert archive.testzip() is None
print('Preparados seis ZIP individuales, el paquete completo y las descripciones de ambas redes.')
