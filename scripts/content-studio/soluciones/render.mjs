import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {chromium} from '@playwright/test';

const folder='public/estudio-6e94b8f2c731/soluciones';
const content=JSON.parse(readFileSync('scripts/content-studio/soluciones/content.json','utf8'));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const lines=s=>esc(s).replaceAll('\n','<br>');
const logo=readFileSync('public/brand/nexo-logo.svg','utf8');
const image=s=>'data:image/svg+xml;base64,'+Buffer.from(s).toString('base64');
const logos={light:image(logo),dark:image(logo.replaceAll('#202730','#ffffff').replaceAll('#247459','#ffffff'))};
const fonts=['manrope','dm-sans'].map(name=>`@font-face{font-family:${name==='manrope'?'Manrope':'DM'};src:url(data:font/woff2;base64,${readFileSync('src/fonts/'+name+'-latin.woff2').toString('base64')})}`).join('');
const icon=type=>`<svg viewBox="0 0 240 190" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${{
 rental:'<path d="M67 75V18h106v57M66 140v34h108v-34M53 143H29V77h182v66h-25M83 115h74M83 135h74M83 154h49"/><path d="M44 77V59h151v18"/><circle cx="184" cy="98" r="3" fill="currentColor"/>',
 dispatch:'<path d="M28 54 91 22l64 32-64 33zM28 54v71l63 33V87M155 54v44M91 158l30-15M59 38l64 33"/><path d="M130 117h58l26 24v27h-84zM163 117v25h51"/><circle cx="150" cy="172" r="12"/><circle cx="194" cy="172" r="12"/>',
 service:'<path d="M43 33h102l28 28v103H43zM145 33v31h28M67 83h56M67 105h39M67 128h29"/><path d="m129 157 34-34a30 30 0 0 0 38-38l-22 22-17-17 22-22a30 30 0 0 0-38 38l-34 34z"/>',
 build:'<path d="M38 32h154v136H38zM38 62h154M99 62v106M99 122h93M135 62v60M53 78h29M53 99h29"/><path d="m151 147 58-58 17 17-58 58-24 7zM200 98l17 17"/>',
 invoice:'<path d="M57 19h126v157l-16-10-16 10-15-10-16 10-16-10-16 10-15-10-16 10zM81 47h78M81 71h49M81 100h78M81 125h28M139 125h20"/><circle cx="46" cy="130" r="25"/><path d="m33 130 9 9 16-19"/>',
 academy:'<path d="m20 64 100-46 100 46-100 46zM57 85v50c36 27 90 27 126 0V85M220 64v66"/><path d="M75 176h90M120 152v24"/><circle cx="220" cy="142" r="11"/>',
}[type]}</svg>`;
const arrow='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
const check='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>';

function art(post,slide){
 if(slide.kind==='cover'){
  const labels={rental:['Reserva','Alquiler','Revisión'],dispatch:['Ventas','Almacén','Reparto'],service:['Equipo','Orden de trabajo','Reporte'],build:['Solicitud','Aprobación','Recepción'],invoice:['Servicio','Factura','Pago'],academy:['Alumno','Pago validado','Grupo']}[post.symbol];
  return `<div class="cover-art ${post.symbol}"><div class="object">${icon(post.symbol)}</div><div class="cover-links">${labels.map((s,i)=>`<div><span class="dot">${i+1}</span><span>${esc(s)}</span></div>`).join('')}</div></div><div class="visual-caption"><strong>${esc(slide.visualTitle)}</strong><p>${esc(slide.visualNote)}</p></div>`;
 }
 if(slide.kind==='friction')return `<div class="friction-list">${slide.steps.map(([role,note])=>`<div class="friction-row"><span>${esc(role)}</span><strong>${esc(note)}</strong></div>`).join('')}</div><p class="note">${esc(slide.note)}</p>`;
 if(slide.kind==='flow')return `<ol class="flow-list">${slide.steps.map(([name,note],i)=>`<li><span class="number">${i+1}</span><strong>${esc(name)}</strong><p>${esc(note)}</p></li>`).join('')}</ol><p class="note">${esc(slide.note)}</p>`;
 if(slide.kind==='data'){
  let data='';
  if(slide.numbers)data=`<div class="calculation ${post.id==='C04'?'money':''}">${slide.numbers.map(([value,label])=>`<div class="calculation-row"><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`).join('')}<div class="result"><strong>${esc(slide.result[0])}</strong><span>${esc(slide.result[1])}</span></div></div>`;
  if(slide.milestones)data=`<div class="milestones">${slide.milestones.map(([n,label])=>`<div><strong>${esc(n)}</strong><p>${esc(label)}</p></div>`).join('')}</div><p class="formula">${esc(slide.formula)}</p>`;
  if(slide.record)data=`<dl class="record">${slide.record.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`;
  return data+`<p class="note">${esc(slide.note)}</p>`;
 }
 return `<div class="contrast"><div><span>Antes</span><p>${esc(slide.before)}</p></div><div><span>${check}Con Nexo</span><p>${esc(slide.after)}</p></div></div><div class="cta"><h2>${esc(slide.cta)}</h2><p>${esc(slide.subcta)}</p><strong>WhatsApp · +51 936 755 465</strong></div>`;
}
const css=`${fonts}
@page{size:1080px 1080px;margin:0}*{box-sizing:border-box}body{margin:0;color:#202730;background:#eef2ee;font-family:DM,sans-serif}
h1,h2,h3,p,ol,dl,dd{margin:0}h1,h2,h3{font-family:Manrope,sans-serif;letter-spacing:-.035em}svg{flex:none}
.slide{width:1080px;height:1080px;background:#fff;position:relative;break-after:page;--green:#247459;--muted:#52675b;--line:#cad8ce;--soft:#eef2ee;--surface:#fff}
.slide:last-child{break-after:auto}.slide.sage{background:#eef2ee;--surface:#f9fbf9;--line:#b9ccbf}
.slide.forest,.slide.green{color:white;--green:#fff;--muted:#e2ede6;--line:#759b85;--soft:#294b3a;--surface:#294b3a}
.slide.forest{background:#20352b}.slide.green{background:#247459;--soft:#1e634b;--surface:#1e634b;--line:#82b6a3}
header{position:absolute;left:62px;right:62px;top:45px;display:flex;justify-content:space-between;align-items:center;gap:28px}
header img{display:block;width:205px;height:71px;object-fit:contain;object-position:left}
header .sector{font-size:28px;line-height:1.35;color:var(--muted);text-align:right;max-width:550px}
header .sector span{font-size:25px;display:block;margin-top:3px}
.main{position:absolute;top:151px;bottom:128px;left:62px;right:62px;display:flex;flex-direction:column;gap:24px}
h1{font-size:65px;font-weight:700;line-height:1.14;text-wrap:pretty}
.kind-cover h1{font-size:73px;line-height:1.12}
.lead{font-size:36px;line-height:1.43;color:var(--muted);max-width:940px;text-wrap:pretty}
.art{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;gap:26px}
footer{position:absolute;left:62px;right:62px;bottom:46px;border-top:1px solid var(--line);padding-top:20px;display:flex;justify-content:space-between;align-items:center;gap:25px;font-size:28px;line-height:1.4;color:var(--muted)}
footer>span:last-child{display:flex;align-items:center;gap:14px;color:var(--green);white-space:nowrap}footer svg{width:28px;height:28px}footer b{font-weight:550;margin-left:7px}
.cover-art{display:grid;grid-template-columns:1fr 1.15fr;gap:38px;align-items:center;position:relative}
.object{height:255px;color:var(--green);display:grid;place-items:center;border-right:1px solid var(--line);padding-right:32px}
.object svg{width:285px;height:226px}
.cover-links{display:grid;gap:21px;position:relative;padding-left:5px}
.cover-links>div{font-size:37px;display:flex;align-items:center;gap:20px;position:relative}
.dot{width:44px;height:44px;display:grid;place-items:center;border:1.5px solid var(--green);border-radius:50%;color:var(--green);font-size:25px}
.visual-caption{border-top:1px solid var(--line);padding-top:22px}
.visual-caption strong{font-size:36px;line-height:1.4;font-weight:550;display:block}.visual-caption p{font-size:30px;line-height:1.45;color:var(--muted);margin-top:8px}
.dispatch .object{border:1px solid var(--line);border-radius:50%;height:250px;width:285px;margin-left:20px;padding:0}.dispatch .object svg{width:230px;height:183px}
.service .object{transform:rotate(-5deg);background:#fff;border:1px solid var(--line);height:280px;padding:20px;border-radius:8px}
.build .object{background-image:linear-gradient(#d9e5dc 1px,transparent 1px),linear-gradient(90deg,#d9e5dc 1px,transparent 1px);background-size:26px 26px;border:1px solid var(--line);padding:0}
.invoice .object{border:none;transform:rotate(5deg)}.invoice .object svg{width:300px;height:238px}
.academy .object{background:#fff;border-radius:140px 140px 12px 12px;border:1px solid var(--line);padding:0}
.friction-list{border-top:1px solid var(--line)}
.friction-row{display:grid;grid-template-columns:235px 1fr;align-items:center;gap:25px;border-bottom:1px solid var(--line);padding:25px 0}
.friction-row>span{font-size:30px;line-height:1.35;color:var(--muted)}.friction-row>strong{font-size:37px;font-weight:500;line-height:1.4}
.note{font-size:33px;line-height:1.43;color:var(--muted);border-left:3px solid var(--green);padding-left:22px;text-wrap:pretty}
.flow-list{list-style:none;padding:0;position:relative}
.flow-list::before{content:'';position:absolute;top:30px;bottom:35px;left:25px;border-left:1.5px solid var(--line)}
.flow-list li{display:grid;grid-template-columns:52px 235px 1fr;gap:22px;align-items:center;padding:15px 0;position:relative;min-height:94px}
.flow-list .number{display:grid;place-items:center;border:1.5px solid var(--green);border-radius:50%;width:52px;height:52px;background:var(--surface);color:var(--green);font-size:29px;z-index:1}
.flow-list strong{font:600 35px/1.35 Manrope,sans-serif;letter-spacing:-.02em}.flow-list p{font-size:35px;line-height:1.4;color:var(--muted)}
.calculation{background:var(--soft);padding:24px 32px;border-radius:8px}
.calculation-row{display:grid;grid-template-columns:320px 1fr;gap:30px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)}
.calculation-row strong{font:600 54px/1.25 Manrope,sans-serif;letter-spacing:-.035em;white-space:nowrap}.calculation-row span{font-size:33px;line-height:1.4;color:var(--muted)}
.calculation.money .calculation-row strong{font-size:48px}
.result{display:grid;grid-template-columns:320px 1fr;gap:30px;align-items:center;padding-top:20px;color:var(--green)}
.result strong{font:650 68px/1.2 Manrope,sans-serif;letter-spacing:-.04em;white-space:nowrap}.result span{font:600 36px/1.35 Manrope,sans-serif;letter-spacing:-.025em}
.calculation.money .result strong{font-size:60px}
.milestones{display:grid;grid-template-columns:1fr 1fr 1fr;gap:26px}
.milestones>div{border-top:3px solid var(--green);padding-top:22px}.milestones strong{font:650 78px/1.15 Manrope,sans-serif;color:var(--green);letter-spacing:-.045em}
.milestones p{font-size:36px;line-height:1.4;margin-top:15px;max-width:235px}
.formula{padding:22px 26px;background:var(--soft);font-size:38px;line-height:1.4;color:var(--green);border-radius:5px}
.record{border-top:1px solid var(--line)}.record>div{display:grid;grid-template-columns:215px 1fr;gap:24px;align-items:center;padding:20px 0;border-bottom:1px solid var(--line)}
.record dt{font-size:29px;color:var(--muted);line-height:1.4}.record dd{font-size:35px;line-height:1.4}
.contrast{display:grid;grid-template-columns:1fr 1fr;gap:28px}.contrast>div{border-top:2px solid var(--line);padding-top:20px}
.contrast>div:last-child{border-color:var(--green)}.contrast span{font-size:29px;color:var(--muted);display:flex;align-items:center;gap:12px}.contrast>div:last-child span{color:var(--green)}.contrast svg{width:28px;height:28px}
.contrast p{font-size:36px;line-height:1.4;margin-top:15px;text-wrap:pretty}
.cta{background:#20352b;color:#fff;padding:28px 30px;border-radius:8px;margin-top:4px}
.cta h2{font-size:43px;line-height:1.25;font-weight:650}.cta p{font-size:33px;line-height:1.4;margin-top:12px}.cta strong{display:block;font-size:30px;line-height:1.4;margin-top:17px;font-weight:500;color:#e2ede6}
@media print{body{background:white}.slide{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
`;

function renderSlide(post,slide,i){
 const theme=slide.kind==='cover'?post.theme:(slide.kind==='flow'?'sage':'white');
 const dark=['forest','green'].includes(theme);
 return `<article class="slide ${theme} kind-${slide.kind}" data-id="${post.id}-${i+1}" aria-label="${esc(post.sector)}, lámina ${i+1} de 5"><header><img src="${dark?logos.dark:logos.light}" alt="Nexo"><p class="sector">${esc(post.sector)}<span>Sistemas a medida</span></p></header><div class="main"><h1>${lines(slide.title)}</h1><p class="lead">${esc(slide.lead)}</p><div class="art">${art(post,slide)}</div></div><footer><span>nexoamedida.com</span><span>${i===4?'Conversemos':'Desliza'} ${arrow}<b>${String(i+1).padStart(2,'0')} / 05</b></span></footer></article>`;
}
const html='<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Nexo | Seis procesos que merecen un nexo</title><style>'+css+'</style></head><body>'+content.posts.flatMap(post=>post.slides.map((s,i)=>renderSlide(post,s,i))).join('')+'</body></html>';
mkdirSync(folder+'/archivos',{recursive:true});
writeFileSync(folder+'/laminas.html',html);
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:1080,height:1080},deviceScaleFactor:1});
 await page.setContent(html);await page.evaluate(()=>document.fonts.ready);
 const errors=await page.evaluate(()=>[...document.querySelectorAll('.slide')].flatMap(slide=>{
  const footer=slide.querySelector('footer').getBoundingClientRect();
  const main=slide.querySelector('.main').getBoundingClientRect();
  const elements=[...slide.querySelectorAll('.main h1,.main .lead,.art>*')];
  return elements.filter(el=>el.getBoundingClientRect().bottom>footer.top-24||el.scrollWidth>el.clientWidth+1||el.getBoundingClientRect().right>main.right+1).map(el=>({id:slide.dataset.id,text:el.textContent.slice(0,70),bottom:el.getBoundingClientRect().bottom-main.top,limit:footer.top-main.top}));
 }));
 if(errors.length)throw new Error('Contenido fuera de formato: '+JSON.stringify(errors));
 for(const post of content.posts){
  mkdirSync(`${folder}/archivos/${post.id}-${post.slug}`,{recursive:true});
  for(let i=0;i<post.slides.length;i++){
   const filename=`archivos/${post.id}-${post.slug}/${String(i+1).padStart(2,'0')}-1080x1080.jpg`;
   await page.locator(`[data-id="${post.id}-${i+1}"]`).screenshot({path:folder+'/'+filename,type:'jpeg',quality:94});
   post.slides[i].file=filename;
  }
  console.log(`${post.id}: 5 JPG cuadrados exportados.`);
 }
 await page.pdf({path:folder+'/archivos/Nexo-6-carruseles-vista-completa.pdf',width:'1080px',height:'1080px',printBackground:true,tagged:true,margin:{top:'0',right:'0',bottom:'0',left:'0'}});
 writeFileSync(folder+'/contenido.json',JSON.stringify(content,null,2)+'\n');
} finally {await browser.close();}
console.log('Exportadas las 30 láminas y el PDF de revisión.');
