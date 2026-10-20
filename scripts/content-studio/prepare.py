import json, pathlib, datetime, shutil
root=pathlib.Path(__file__).resolve().parents[2]
out=root/'public/estudio-6e94b8f2c731'
data=json.loads((root/'scripts/content-studio/plan-base.json').read_text())
schedule={'P03':('2026-10-20','10:00'),'P02':('2026-10-20','13:00'),'P01':('2026-10-20','18:30'),'P05':('2026-10-21','12:30'),'P09':('2026-10-21','18:30'),'P06':('2026-10-22','18:30'),'P04':('2026-10-26','12:30'),'P07':('2026-10-28','18:30'),'P08':('2026-10-30','12:30'),'P10':('2026-11-02','12:30'),'P11':('2026-11-04','18:30'),'P12':('2026-11-06','12:30')}
for p in data['posts']:
 p['date'],p['time']=schedule[p['id']]
 p['launch']=p['id'] in ['P01','P02','P03','P05','P06','P09']
 p['paid']=p['id'] in ['P02','P04','P08']
 p['pinned']=p['id'] in ['P01','P02','P03']
 p['adStatus']='Probar primero' if p['id'] in ['P02','P04'] else 'Reserva' if p['id']=='P08' else 'Orgánico'
 p['assets']=[]
 p['formatType']='carousel' if p['id'] in data['slides'] else 'video' if p['id'] in data['scripts'] else 'image'
 if p['id']=='P06':
  p['visual']='Animación editorial de la ficha EQ-024: devolución, mantenimiento y nuevo alquiler. Datos de demostración; no se presenta como grabación de la aplicación.'
  p['ig']=p['ig'].replace('recorre las tres fechas de EQ-024 en esta demo','mira las tres fechas de EQ-024 en este ejemplo')
 if p['id']=='P02':p['visual']='Explicación visual animada: archivos separados, relación entre registros y ficha conectada. Recreación editorial con datos de demostración, no grabación del software.'
 p['fb']=p['fb'].replace('En esta demo','En este ejemplo').replace('Los datos del video son de demostración.','El video es una explicación visual con datos de demostración.')
 p['ig']=p['ig'].replace('en la demo de Nexo','en este ejemplo de Nexo')
 p['whatsapp']='https://wa.me/51936755465?text='+__import__('urllib.parse',fromlist=['quote']).quote('Hola, vi '+p['keyword']+' de Nexo. Quiero revisar un proceso de mi empresa.')
 p['alt']='Pieza de Nexo: '+p['title']+'. '+p['pain']+' Ejemplo ilustrativo con datos de demostración.'
# Specific visual headlines avoid the ambiguity of the previous landing.
data['posts'][0]['title']='De Excels y carpetas a un sistema para tu empresa'
data['posts'][0]['fb']='Creamos software a medida para conectar clientes, equipos, documentos e historial.\n\nSi para responder una consulta tienes que abrir varios Excels, revisar carpetas y preguntarle a alguien, podemos revisar ese proceso contigo.\n\nEmpezamos por entender cómo trabaja tu empresa y acordar una primera etapa.\n\nMira el ejemplo en https://nexoamedida.com o escríbenos por WhatsApp: https://wa.me/51936755465'
data['posts'][0]['ig']='De Excels y carpetas a un sistema para tu empresa.\n\nEn Nexo creamos software a medida para conectar clientes, equipos, documentos e historial. Empezamos por un proceso concreto de tu negocio.\n\nMira la demo o conversemos por WhatsApp desde los enlaces del perfil.\n\n#PymesPeru #SoftwareAMedida #GestionEmpresarial'
story_dates=['2026-10-23','2026-10-27','2026-10-29','2026-11-03','2026-11-05','2026-11-10','2026-11-12','2026-11-13']
data['storyItems']=[]
for row,date in zip(data['stories'],story_dates):
 data['storyItems'].append({'id':row[2],'date':date,'time':'18:30','title':row[3],'content':row[4],'ig':row[5],'fb':row[6],'assets':[]})
data['timezone']='America/Lima'
data['startDate']='2026-10-20'
data['endDate']='2026-11-13'
data['launchOrder']=['P03','P02','P01','P05','P09','P06']
data['privacy']='Página sin contraseña. Fuera del menú y con noindex. Cualquier persona que tenga el enlace puede acceder; los archivos también son públicos. No guardar información confidencial.'
(out/'plan.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
