const posts=JSON.parse(document.getElementById('collection-data').textContent);
const status=document.getElementById('status');let statusTimer;
function announce(message){status.textContent=message;status.hidden=false;clearTimeout(statusTimer);statusTimer=setTimeout(()=>{status.hidden=true;},4500);}
for(const post of posts){
 const section=document.getElementById(post.id);const viewer=section.querySelector('.viewer');let current=0;let network='ig';
 const image=viewer.querySelector('img');const imageLink=viewer.querySelector('.slide-link');const download=viewer.querySelector('[data-download-slide]');
 function showSlide(index){
  current=Math.max(0,Math.min(post.slides.length-1,index));const slide=post.slides[current];
  image.src=slide.file;image.alt=slide.alt;imageLink.href=slide.file;
  imageLink.setAttribute('aria-label',`Abrir lámina ${current+1} de ${post.id} en tamaño completo`);
  download.href=slide.file;download.download=`${post.id}-${String(current+1).padStart(2,'0')}-1080x1080.jpg`;download.textContent=`Descargar lámina ${current+1}`;
  viewer.querySelector('[data-counter]').textContent=`Lámina ${current+1} de ${post.slides.length}`;
  viewer.querySelector('[data-prev]').disabled=current===0;viewer.querySelector('[data-next]').disabled=current===post.slides.length-1;
  viewer.querySelectorAll('[data-slide]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.slide)===current)));
 }
 viewer.querySelector('[data-prev]').addEventListener('click',()=>showSlide(current-1));viewer.querySelector('[data-next]').addEventListener('click',()=>showSlide(current+1));
 viewer.querySelectorAll('[data-slide]').forEach(button=>button.addEventListener('click',()=>showSlide(Number(button.dataset.slide))));
 viewer.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();showSlide(current+1);}if(event.key==='ArrowLeft'){event.preventDefault();showSlide(current-1);}});
 let startX;let swiped=false;imageLink.addEventListener('touchstart',event=>{startX=event.touches[0].clientX;swiped=false;},{passive:true});imageLink.addEventListener('touchend',event=>{const distance=event.changedTouches[0].clientX-startX;if(Math.abs(distance)>65){swiped=true;showSlide(current+(distance<0?1:-1));}startX=undefined;},{passive:true});imageLink.addEventListener('click',event=>{if(swiped){event.preventDefault();swiped=false;}});
 const caption=section.querySelector('.caption');const label=section.querySelector('.copy-label');const captionDownload=section.querySelector('[data-caption-download]');
 function setNetwork(key){network=key;caption.value=post[key];const title=key==='ig'?'Instagram':'Facebook';label.textContent=`Descripción para ${title}`;captionDownload.href=`archivos/${post.id}-${post.slug}/Descripcion-${title}.txt`;section.querySelector('[data-copy-caption]').textContent=`Copiar descripción de ${title}`;section.querySelectorAll('[data-network]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.network===key)));}
 section.querySelectorAll('[data-network]').forEach(button=>button.addEventListener('click',()=>setNetwork(button.dataset.network)));
 section.querySelector('[data-copy-caption]').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(caption.value);announce(`Descripción de ${network==='ig'?'Instagram':'Facebook'} copiada.`);}catch{caption.focus();caption.select();announce('Texto seleccionado. Usa Copiar en tu navegador.');}});
 showSlide(0);setNetwork('ig');
}
