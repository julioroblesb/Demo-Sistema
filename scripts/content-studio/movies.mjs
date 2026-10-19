import { chromium } from '@playwright/test';
import {readFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const dir='public/estudio-6e94b8f2c731/archivos';
mkdirSync('/tmp/nexo-movies/recordings',{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
for(const id of ['P02','P06','P08','P12']){
 await Promise.all(['portrait','feed'].map(async shape=>{
  const height=shape==='portrait'?1920:1350;
  const context=await browser.newContext({viewport:{width:1080,height},recordVideo:{dir:'/tmp/nexo-movies/recordings',size:{width:1080,height}}});
  const page=await context.newPage();
  await page.setContent(readFileSync(`/tmp/nexo-movies/${id}/${shape}.html`,'utf8'));
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>window.startMovie());
  await page.waitForTimeout(24000);
  const video=page.video();await context.close();
  const source=await video.path();
  const duration=Number(execFileSync('ffprobe',['-v','quiet','-show_entries','format=duration','-of','csv=p=0',source],{encoding:'utf8'}).trim());
  const output=`${dir}/${id}-video-1080x${height}.mp4`;
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(Math.max(0,duration-24)),'-i',source,'-t','24','-vf','fps=25,format=yuv420p','-c:v','libx264','-preset','fast','-crf','22','-threads','2','-movflags','+faststart','-an',output]);
  console.log('Encoded '+output);
 }));
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',`${dir}/${id}-video-1080x1350.mp4`,'-vf','fps=6,scale=540:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=64[p];[s1][p]paletteuse=dither=bayer','-loop','0',`${dir}/${id}-animacion.gif`]);
 console.log('GIF '+id);
}
await browser.close();
