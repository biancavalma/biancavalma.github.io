// finds anything that can scroll sideways, on 3 iPhone sizes and all 3 tabs
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();let bad=0;
for(const [w,h] of [[375,667],[390,844],[430,932]]){const p=await b.newPage({viewport:{width:w,height:h},hasTouch:true,isMobile:true});
await p.goto('http://localhost:5199/');await p.waitForTimeout(1500);
for(const t of ['t-cal','t-ov','t-fr']){await p.click('#'+t);await p.waitForTimeout(200);
 const r=await p.evaluate(()=>{const out=[];document.querySelectorAll('*').forEach(e=>{const cs=getComputedStyle(e);if(e.closest('.pills,.sug,.emo'))return;
  if(e.scrollWidth>e.clientWidth+1&&['auto','scroll'].includes(cs.overflowX))out.push((e.id||e.className||e.tagName)+' '+e.scrollWidth+'>'+e.clientWidth)});
  if(document.documentElement.scrollWidth>innerWidth)out.push('page '+document.documentElement.scrollWidth);return out});
 if(r.length){bad++;console.log(w,t,r)}}
await p.close()}
console.log(bad?'SIDEWAYS FOUND':'no sideways scrolling');await b.close()})();
