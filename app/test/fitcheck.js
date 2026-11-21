// checks that the calendar screen fits without any scrolling on each phone size
const {chromium}=require('playwright');const S='/tmp/claude-0/-home-claude/798aedfa-149f-53a4-8a8e-813244b1cd40/scratchpad/';
(async()=>{const b=await chromium.launch();
for(const [n,w,h] of [['se',375,667],['mini',375,812],['i15',393,852],['max',430,932],['ipad',820,1180]]){const p=await b.newPage({viewport:{width:w,height:h},isMobile:true,hasTouch:true});
await p.goto('http://localhost:5199/');await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{const v=document.getElementById('v-cal');return {page:document.documentElement.scrollHeight-innerHeight,inner:v.scrollHeight-v.clientHeight}});
console.log(n,'page overflow',r.page,'calendar overflow',r.inner);await p.screenshot({path:S+'fit-'+n+'.png'});await p.close()}
await b.close()})();
