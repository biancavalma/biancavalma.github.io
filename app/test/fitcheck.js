// page must fit on normal phones, and must be able to scroll when it does not (small phone / large text)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [n,w,h] of [['se',375,667],['mini',375,812],['i15',393,852],['max',430,932],['ipad',820,1180]]){const p=await b.newPage({viewport:{width:w,height:h},isMobile:true,hasTouch:true});
await p.goto('http://localhost:5199/');await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{const o=document.documentElement.scrollHeight-innerHeight;window.scrollTo(0,9999);return {overflow:o,canScroll:o<=0||scrollY>0}});
console.log(n,JSON.stringify(r));await p.close()}
await b.close()})();
