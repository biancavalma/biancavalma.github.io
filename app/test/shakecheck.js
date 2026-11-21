// detects layout that keeps changing by itself (shaking)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [w,h] of [[375,667],[393,852],[430,932]]){const p=await b.newPage({viewport:{width:w,height:h},isMobile:true});
await p.goto('http://localhost:5199/?noreq');await p.waitForTimeout(1500);
const r=await p.evaluate(()=>new Promise(res=>{let n=0,last=document.documentElement.scrollHeight;const t=setInterval(()=>{const c=document.documentElement.scrollHeight;if(c!==last)n++;last=c},50);setTimeout(()=>{clearInterval(t);res({changes:n,overflow:document.documentElement.scrollHeight-innerHeight,rows:document.querySelectorAll('.lprev > *').length})},2000)}));
console.log(w,h,JSON.stringify(r));await p.close()}
await b.close()})();
