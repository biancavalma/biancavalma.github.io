/* look: glass (a) */
document.documentElement.setAttribute('data-look','a');
import './style.css';
import * as api from './api.js';
/* updates arrive at once: phones keep the old page for a few minutes, so compare with the newest build number and reload when it changed */
function checkUpdate(){
  try{fetch('/version.json?t='+Date.now(),{cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(d){
    if(!d||!d.v||d.v===__BUILD__)return;var u=new URL(location.href);if(u.searchParams.get('v')===d.v)return;
    u.searchParams.set('v',d.v);location.replace(u.toString());
  }).catch(function(){})}catch(e){}
}
if(import.meta.env.PROD){checkUpdate();document.addEventListener('visibilitychange',function(){if(!document.hidden)checkUpdate()})}

  var COL=['#9fe3c9','#ffc59e','#cbb8ff','#a6d4ff','#ffb0d0','#d3e98a','#ffd98a','#b5ead7'];
  var MN=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var M3=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var DW=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  function $(id){return document.getElementById(id)}
  function pad(x){return x<10?'0'+x:''+x}
  function iso(y,m,d){return y+'-'+pad(m+1)+'-'+pad(d)}
  function parts(s){var a=s.split('-');return {y:+a[0],m:+a[1]-1,d:+a[2]}}
  function next(s){var p=parts(s),d=new Date(p.y,p.m,p.d+1,12);return iso(d.getFullYear(),d.getMonth(),d.getDate())}
  function day(s){var x=parts(s);return x.d+' '+M3[x.m]}
  function range(a,b){
    var x=parts(a),y=parts(b);
    if(a===b)return day(a);
    var TO=' to ';
    if(x.m===y.m&&x.y===y.y)return x.d+TO+y.d+' '+M3[x.m];
    return day(a)+' to '+day(b);
  }
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function byStart(x,y){return x.a<y.a?-1:x.a>y.a?1:x.p-y.p}
  function cap(s){s=String(s||'').trim().slice(0,30);return s?s.charAt(0).toUpperCase()+s.slice(1):''}
  var ISO=/^\d{4}-\d{2}-\d{2}$/;
  /* every place gets a picture: the one you chose for that city before, else a suggestion, else a pin */
  /* Overlap picks the picture for each place itself: a big list of cities, regions and countries, then a few word clues, then a pin */
  var EMO={
    venice:'🛶',venezia:'🛶',florence:'🌻',firenze:'🌻',rome:'🏛️',roma:'🏛️',milan:'🛍️',milano:'🛍️',naples:'🍕',napoli:'🍕',turin:'🍫',torino:'🍫',
    bologna:'🍝',genoa:'⚓',genova:'⚓',verona:'💌',siena:'🐎',pisa:'🗼',lucca:'🚲',como:'⛵','lake como':'⛵','lago di como':'⛵',garda:'⛵',
    portofino:'⛵','cinque terre':'🌈',amalfi:'🍋',positano:'🍋',capri:'🍋',sorrento:'🍋',puglia:'🫒',bari:'🫒',lecce:'🫒',
    sicily:'🍋',sicilia:'🍋',palermo:'🍋',catania:'🌋',taormina:'🌋',sardinia:'🏝️',sardegna:'🏝️',cagliari:'🏝️',tuscany:'🍷',toscana:'🍷',
    chianti:'🍷',montalcino:'🍷',montepulciano:'🍷',maremma:'🍷',forte:'🏖️','forte dei marmi':'🏖️',viareggio:'🏖️',elba:'🏝️',
    trento:'🏔️',bolzano:'🏔️',dolomites:'🏔️',dolomiti:'🏔️',cortina:'⛷️','cortina d ampezzo':'⛷️',courmayeur:'⛷️',cervinia:'⛷️',
    zurich:'🏔️',zurigo:'🏔️',geneva:'⛲',ginevra:'⛲',bern:'🐻',basel:'🎨',lucerne:'🏔️',luzern:'🏔️',lugano:'⛵',locarno:'⛵',
    zermatt:'🏔️','st moritz':'⛷️','sankt moritz':'⛷️',verbier:'⛷️',davos:'⛷️',gstaad:'⛷️',lausanne:'⛵',interlaken:'🏔️',engadin:'⛷️',
    switzerland:'🏔️',svizzera:'🏔️',italy:'🍝',italia:'🍝',
    paris:'🥐',parigi:'🥐',nice:'🌊',nizza:'🌊',cannes:'🎬',marseille:'⚓',lyon:'🍷',bordeaux:'🍷',provence:'💜',chamonix:'⛷️',corsica:'🏝️',
    'saint tropez':'⛵','st tropez':'⛵',monaco:'🏎️',france:'🥐',francia:'🥐',
    london:'💂',londra:'💂',edinburgh:'🏰',dublin:'🍀',manchester:'⚽',uk:'💂',england:'💂',scotland:'🏰',ireland:'🍀',
    barcelona:'🌞',madrid:'🐂',seville:'💃',sevilla:'💃',valencia:'🥘',malaga:'☀️',ibiza:'🎶',mallorca:'☀️',majorca:'☀️',palma:'☀️',
    menorca:'🏖️',minorca:'🏖️',formentera:'🏖️','san sebastian':'🍤',bilbao:'🎨',canaries:'🌋',tenerife:'🌋','gran canaria':'🌋',spain:'🌞',spagna:'🌞',
    lisbon:'🚋',lisbona:'🚋',porto:'🍷',algarve:'🏖️',madeira:'🌺',azores:'🐋',portugal:'🚋',portogallo:'🚋',comporta:'🏖️',
    munich:'🥨',monaco_di_baviera:'🥨',berlin:'🐻',berlino:'🐻',hamburg:'⚓',frankfurt:'🏦',cologne:'⛪',vienna:'🎻',wien:'🎻',salzburg:'🎶',
    innsbruck:'⛷️',prague:'🏰',praga:'🏰',budapest:'♨️',krakow:'🏰',warsaw:'🏙️',amsterdam:'🚲',rotterdam:'⚓',brussels:'🧇',bruxelles:'🧇',
    copenhagen:'🧜',stockholm:'🛶',oslo:'🛶',helsinki:'🛶',reykjavik:'🌋',iceland:'🌋',athens:'🏛️',atene:'🏛️',santorini:'🌅',mykonos:'🏖️',
    crete:'🏝️',greece:'🏛️',grecia:'🏛️',istanbul:'🕌',croatia:'⛵',split:'⛵',dubrovnik:'🏰',hvar:'⛵',malta:'⛵',cyprus:'🏖️',
    'new york':'🗽',nyc:'🗽','los angeles':'🌴',la:'🌴','san francisco':'🌉',miami:'🌴',chicago:'🏙️',boston:'🦞','las vegas':'🎰',
    hawaii:'🌺',mexico:'🌮','mexico city':'🌮',tulum:'🌴',cancun:'🏖️','costa rica':'🦥',cuba:'🚗',havana:'🚗','buenos aires':'💃',
    'rio de janeiro':'🏖️','sao paulo':'🏙️',brazil:'🏖️',brasile:'🏖️',rio:'🏖️',peru:'🦙',lima:'🦙',cusco:'🦙',chile:'🏔️',patagonia:'🏔️',colombia:'☕',cartagena:'🌴',toronto:'🍁',
    montreal:'🍁',vancouver:'🍁',canada:'🍁',usa:'🗽',
    tokyo:'🍣',kyoto:'⛩️',osaka:'🍜',japan:'🗾',giappone:'🗾',seoul:'🏙️',beijing:'🏯',shanghai:'🏙️','hong kong':'🌃',singapore:'🦁',
    bangkok:'🛺',phuket:'🏝️','koh samui':'🏝️',thailand:'🛺',bali:'🌴',ubud:'🌴',canggu:'🏄',uluwatu:'🏄',lombok:'🏝️',indonesia:'🌴',
    vietnam:'🍜',hanoi:'🍜','ho chi minh':'🍜',sri:'🐘','sri lanka':'🐘',india:'🕌',goa:'🏖️',delhi:'🕌',mumbai:'🌆',nepal:'🏔️',kathmandu:'🏔️',
    maldives:'🐠',maldive:'🐠',mauritius:'🐠',seychelles:'🐠',zanzibar:'🏝️',dubai:'🌆','abu dhabi':'🕌',doha:'🌆',oman:'🏜️',
    marrakech:'🐪',marrakesh:'🐪',morocco:'🐪',cairo:'🐪',egypt:'🐪','cape town':'🏔️',kenya:'🦒',tanzania:'🦒',safari:'🦒',
    sydney:'🦘',melbourne:'☕',australia:'🦘','new zealand':'🥝',auckland:'🥝',tel:'🌊','tel aviv':'🌊',jerusalem:'🕍'};
  var CLUE=[[/\b(ski|skiing|chalet|neve|snow)\b/,'⛷️'],[/\b(beach|spiaggia|mare|sea|coast|costa|playa|plage|bay)\b/,'🏖️'],
    [/\b(island|isola|isla|ile|koh|ko|nusa|islands|isole)\b/,'🏝️'],[/\b(lake|lago|lac|see)\b/,'⛵'],[/\b(mount|monte|mont|berg|alp|alps|valley|val)\b/,'🏔️'],
    [/\b(san|santa|saint|st)\b/,'⛪'],[/\b(wedding|matrimonio)\b/,'💍'],[/\b(festival|concert)\b/,'🎶'],[/\b(work|office|conference)\b/,'💼']];
  function norm(c){return String(c||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z ]+/g,' ').replace(/\s+/g,' ').trim()}
  function guess(city){
    var k=norm(city);if(!k)return '📍';
    if(EMO[k])return EMO[k];
    var w=k.split(' '),i,j;
    for(i=w.length;i>0;i--)for(j=0;j+i<=w.length;j++){var sub=w.slice(j,j+i).join(' ');if(sub.length>2&&EMO[sub])return EMO[sub]}
    for(i=0;i<CLUE.length;i++)if(CLUE[i][0].test(k))return CLUE[i][1];
    return '📍';
  }
  function emoFor(p,city){
    var k=norm(city), st=people[p]?people[p].stays:[], i;
    if(!k)return '📍';
    for(i=st.length-1;i>=0;i--)if(st[i].e&&norm(st[i].city)===k)return st[i].e;
    return guess(city);
  }
  function ec(p,city,s){return (s&&s.e?s.e:emoFor(p,city))+' '+esc(city)}

  /* people[0] is always the person looking at the page */
  var people=[{id:null,n:'You',home:'',stays:[]}];
  /* friends are a letter, two letters when two friends share an initial; the viewer is a pink face, with the city written under it on every day away */
  function lab(i){
    var n=String(people[i].n||'?').trim(), c=n.charAt(0).toUpperCase(), k, j, same=[];
    for(k=1;k<people.length;k++)if(k!==i){var o=String(people[k].n||'').trim().toLowerCase();if(o.charAt(0).toUpperCase()===c)same.push(o)}
    if(!same.length)return c;
    /* two friends share an initial: add the first letter where this name differs from theirs, Mariechen Mr and Masha Ms */
    var low=n.toLowerCase();
    for(j=1;j<low.length;j++)if(same.every(function(o){return o.charAt(j)!==low.charAt(j)}))return c+low.charAt(j);
    return c+(low.charAt(1)||'');
  }
  function face(i,size,ring){
    var av=people[i]&&people[i].av;
    if(av)return '<img class="avimg'+(ring?' ring':'')+'" src="'+esc(av)+'" alt="'+esc(i===0?'You':people[i].n)+'" width="'+size+'" height="'+size+'" style="width:'+size+'px;height:'+size+'px">';
    if(i===0)return '<svg role="img" aria-label="You" width="'+size+'" height="'+size+'" viewBox="0 0 40 40" style="flex:none;display:block">'
      +'<circle cx="20" cy="20" r="'+(ring?18.5:20)+'" style="fill:var(--brand)"'+(ring?' stroke="var(--ring)" stroke-width="3"':'')+'/>'
      +'<circle cx="14" cy="18" r="2.6" style="fill:var(--face)"/><circle cx="26" cy="18" r="2.6" style="fill:var(--face)"/>'
      +'<path d="M14 24.5c2 3 10 3 12 0" fill="none" style="stroke:var(--face)" stroke-width="2.6" stroke-linecap="round"/>'
      +'<circle cx="9.5" cy="23" r="2.6" style="fill:var(--brand2)" opacity=".6"/><circle cx="30.5" cy="23" r="2.6" style="fill:var(--brand2)" opacity=".6"/></svg>';
    var t=lab(i);
    return '<svg role="img" aria-label="'+esc(people[i].n)+'" width="'+size+'" height="'+size+'" viewBox="0 0 40 40" style="flex:none;display:block">'
      +'<circle cx="20" cy="20" r="'+(ring?18.5:20)+'" fill="'+COL[i%COL.length]+'"'+(ring?' stroke="var(--ring)" stroke-width="3"':'')+'/>'
      +'<text x="20" y="'+(t.length>1?26.5:27.5)+'" text-anchor="middle" font-family="Fredoka,Nunito,sans-serif" font-weight="600" font-size="'+(t.length>1?18:22)+'" style="fill:var(--face)">'+esc(t)+'</text></svg>';
  }
  var HEART='<svg width="12" height="12" viewBox="0 0 24 24" style="fill:var(--face)" aria-hidden="true"><path d="M12 21s-8-5.2-8-11.2A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 8 2.8C20 15.8 12 21 12 21z"/></svg>';

  var n0=new Date(), T=iso(n0.getFullYear(),n0.getMonth(),n0.getDate());
  var setEdit=false, onlyMe=false, tab='cal', selC=null, selP=null, selD=null, q='', vy=n0.getFullYear(), vm=n0.getMonth(), sheet=null, trip=null;
  var saved=true, UP=[], uid=null, myCode='', requests=[], booted=false, tripInv=[], guests=[], invOk=false, wfSel=[], meetups=[], closeIds=[], v10=false, visSel='all', meetF=0, meetD='', meetC='', meetA='', meetB='';

  function index(){
    UP=[];
    people.forEach(function(p,pi){p.stays.forEach(function(s,si){if(s.b>=T)UP.push({p:pi,i:si,city:s.city,a:s.a,b:s.b})})});
    UP.sort(byStart);
    if(selP!==null&&!people[selP])selP=null;
  }
  function tripAt(p,d){var st=people[p].stays;for(var i=0;i<st.length;i++)if(st[i].a<=d&&st[i].b>=d)return st[i].city;return null}
  function stayAt(p,d){var st=people[p].stays;for(var i=0;i<st.length;i++)if(st[i].a<=d&&st[i].b>=d)return st[i];return null}
  function where(p,d){return tripAt(p,d)||people[p].home||null}
  function shows(p,d){
    if(selP!==null&&selP!==p)return false;
    if(selC)return where(p,d)===selC;
    return !!tripAt(p,d)||(selP!==null&&p>0&&!!where(p,d)&&where(p,d)===where(0,d));
  }
  /* a day counts as an overlap when you and a friend are in the same city and at least one of you travelled */
  function hit(d){
    var L=where(0,d);if(onlyMe||!L||(selC&&L!==selC))return false;
    for(var f=1;f<people.length;f++){
      if(selP&&selP!==f)continue;
      if(where(f,d)===L&&(tripAt(0,d)||tripAt(f,d)))return true;
    }
    return false;
  }
  function shared(s){
    if(s.p===0)return false;
    var d=s.a<T?T:s.a,k=0;
    while(d<=s.b&&k++<200){if(where(0,d)===s.city)return true;d=next(d)}
    return false;
  }
  function match(s){return (!selC||s.city===selC)&&(selP===null||s.p===selP)}
  /* city chips: your home first, then the cities you go to most, then the ones only friends use */
  function cities(){
    var seen={},l=[],mine={},all={};
    people.forEach(function(p,pi){
      if(p.home&&!seen[p.home]){seen[p.home]=1;l.push(p.home)}
      p.stays.forEach(function(s){all[s.city]=(all[s.city]||0)+1;if(pi===0)mine[s.city]=(mine[s.city]||0)+1});
    });
    UP.forEach(function(s){if(!seen[s.city]){seen[s.city]=1;l.push(s.city)}});
    var home=people[0].home, pos={};
    l.forEach(function(c,i){pos[c]=i});
    return l.sort(function(x,y){
      if((x===home)!==(y===home))return x===home?-1:1;
      return (mine[y]||0)-(mine[x]||0)||(all[y]||0)-(all[x]||0)||pos[x]-pos[y];
    });
  }
  function jump(){var f=UP.filter(match)[0];if(f){var p=parts(f.a>T?f.a:T);vy=p.y;vm=p.m}}

  /* photo: shrink to a 320px square on the phone, then upload */
  function shrink(file){return new Promise(function(ok,no){var u=URL.createObjectURL(file),im=new Image();im.onload=function(){var S=320,c=document.createElement('canvas'),k=Math.min(im.width,im.height);c.width=c.height=S;c.getContext('2d').drawImage(im,(im.width-k)/2,(im.height-k)/2,k,k,0,0,S,S);URL.revokeObjectURL(u);c.toBlob(function(b){b?ok(b):no(new Error('photo'))},'image/jpeg',.85)};im.onerror=function(){no(new Error('photo'))};im.src=u})}
  /* older iPhone app versions close if you pick the camera: ask to update first */
  document.addEventListener('click',function(e){
    if(!e.target.closest('.avpick'))return;
    if(api.native&&!(window.OverlapNative&&window.OverlapNative.photo)){e.preventDefault();e.stopPropagation();toast('To add a photo, first update Overlap: open TestFlight and tap Update.')}
  },true);
  document.addEventListener('change',function(e){
    if(e.target.id!=='avin'||!e.target.files||!e.target.files[0])return;
    if(people[0].avCol===false){toast('Run the database update first (sql.html).');return}
    toast('Uploading photo…');
    shrink(e.target.files[0]).then(function(b){return api.uploadAvatar(people[0].id,b)}).then(function(url){people[0].av=url;renderAll();toast('Photo saved')},function(err){var m=String(err&&(err.message||err.error||err.statusCode)||'').slice(0,90);toast('Could not save the photo'+(m?': '+m:'. Try again.'));try{console.error(err)}catch(e){}});
  });
  document.addEventListener('click',function(e){
    if(!e.target.closest('#avrm'))return;
    api.removeAvatar(people[0].id).then(function(){people[0].av='';renderAll();toast('Photo removed')},function(){toast('Could not remove it, try again.')});
  });
  /* the logo always takes you home: the calendar, at today */
  document.querySelector('#app .brand').onclick=function(){sheet=null;selD=null;renderSheet();if(tab!=='cal')$('t-cal').click();vy=n0.getFullYear();vm=n0.getMonth();lastKey=vy+'-'+vm;window.scrollTo({top:0,behavior:'smooth'})};
  $('yearb').onclick=function(){yv=vy;sheet='year';selD=null;renderSheet()};
  document.addEventListener('click',function(e){if(e.target.closest('#aboutb')){sheet='about';selD=null;renderSheet()}});
  function renderTop(){
    $('me').innerHTML='<span class="tbi">'+face(0,40,false)+'</span><b>You</b>';
    $('note').textContent='Only friends you accept see your plans.';
  }
  $('addf').onclick=function(){sheet=null;selD=null;tab='fr';renderAll();setTimeout(function(){var i=$('q');if(i){i.focus();i.scrollIntoView({block:'nearest'})}},50)};
  $('me').onclick=function(){setEdit=false;sheet='home';selD=null;renderSheet()};

  /* on an iPhone browser, suggest the app (until it is dismissed for a week) */
  (function(){
    if(api.native||!api.isIOS||!api.TESTFLIGHT)return;
    var t=0;try{t=+localStorage.getItem('ov-getapp-x')||0}catch(e){}
    if(Date.now()-t<7*864e5)return;
    $('getappgo').href=api.TESTFLIGHT;
    /* people who already use the iPhone app don't see it */
    var tries=0;(function check(){if(!uid){if(++tries<20)setTimeout(check,500);return}api.hasPhoneApp().then(function(has){$('getapp').hidden=has})})();
    $('getappx').onclick=function(){$('getapp').hidden=true;try{localStorage.setItem('ov-getapp-x',String(Date.now()))}catch(e){}};
  })();
  var TI={"ov": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 21s-7-4.6-7-10.2A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 7 3.8C19 16.4 12 21 12 21z\"/></svg>", "cal": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3.5\" y=\"5\" width=\"17\" height=\"15.5\" rx=\"3.5\"/><path d=\"M3.5 10h17M8 3v4M16 3v4\"/></svg>", "fr": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"9\" cy=\"8.5\" r=\"3.5\"/><path d=\"M2.8 19.5c.8-3.3 3.3-5.2 6.2-5.2s5.4 1.9 6.2 5.2\"/><circle cx=\"17\" cy=\"9.5\" r=\"2.7\"/><path d=\"M16.5 14.4c2.5.2 4.2 1.8 4.8 4.6\"/></svg>"};
  function renderTabs(){
    ['ov','cal','fr'].forEach(function(t){$('t-'+t).className='tab'+(tab===t?' on':'');$('v-'+t).hidden=tab!==t});$('app').classList.toggle('oncal',tab==='cal');
    var nov=overlaps().length;
    $('t-ov').innerHTML='<span class="ti">'+TI.ov+(nov?'<b class="badge">'+nov+'</b>':'')+'</span><span class="tl">Overlaps</span>';
    $('t-cal').innerHTML='<span class="ti">'+TI.cal+'</span><span class="tl">Calendar</span>';
    $('t-fr').innerHTML='<span class="ti">'+TI.fr+'</span><span class="tl">Friends</span>';
  }
  $('t-ov').onclick=function(){tab='ov';renderAll()};

  /* the overlap feed: every run of days in the next 6 months where a friend and you are in the same city and one of you travels */
  var WA='<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.4.1.1.1.7-.1 1.3z"/></svg>';
  function overlaps(){
    var runs=[], open={}, d=T, end=iso(n0.getFullYear(),n0.getMonth()+6,n0.getDate());
    while(d<=end){
      var L=where(0,d);
      for(var f=1;f<people.length;f++){
        var W=where(f,d), trav=tripAt(0,d)||tripAt(f,d), k=f+'|'+L+'|'+W, dk=0;
        var ok=L&&W&&trav&&(W===L||(dk=km(L,W))<=NEAR);
        if(ok){ if(open[k]&&open[k].b===prev(d))open[k].b=d; else {open[k]={p:f,city:L,fc:W,km:W===L?0:dk,a:d,b:d,home:!tripAt(0,d)};runs.push(open[k])} }
      }
      d=next(d);
    }
    return runs.sort(function(x,y){return x.a<y.a?-1:x.a>y.a?1:0});
  }
  /* first guesses for the welcome screen: the name from the sign-in email, the city from the phone's time zone */
  function guessName(){
    var u=String(gEmail||'').split('@')[0].replace(/[0-9_]+/g,' ').split(/[.\-\s]+/).filter(function(w){return w.length>1}).slice(0,1);
    return u.map(function(w){return w.charAt(0).toUpperCase()+w.slice(1)}).join(' ');
  }
  function cleanPhone(v){v=String(v||'').trim();var plus=v.charAt(0)==='+';v=v.replace(/\D/g,'');if(!v)return '';if(!plus&&v.indexOf('00')===0)v=v.slice(2);return '+'+v.slice(0,15)}
  function prev(s){var p=parts(s),x=new Date(p.y,p.m,p.d-1,12);return iso(x.getFullYear(),x.getMonth(),x.getDate())}
  function waHref(r){return 'https://wa.me/'+(people[r.p].phone||'').replace(/\D/g,'')+'?text='+encodeURIComponent(waText(r))}
  function waText(r){
    var who=people[r.p].n;
    if(r.km)return 'Hi '+who+'! I saw on Overlap you\u2019ll be in '+r.fc+' '+range(r.a,r.b)+'. I\u2019ll be in '+r.city+', only about '+r.km+' km away. Shall we meet?';
    return r.home?'Hi '+who+'! I saw on Overlap you\u2019ll be in '+r.city+' '+range(r.a,r.b)+'. I\u2019m home then, let\u2019s meet?'
      :'Hi '+who+'! I\u2019ll be in '+r.city+' too, '+range(r.a,r.b)+'. Shall we meet? (from Overlap)';
  }
  function renderOverlaps(){
    var rs=overlaps(), h='';
    if(!people[0].home){h='<div class="card list"><div class="hd">Start with where you live</div><p class="hint">You show up in your home city every day. Add a trip whenever you travel.</p><button type="button" class="ghost" data-home="1" style="margin:0 0 6px">Set my home city</button></div>'}
    else if(!rs.length){h='<div class="card list"><div class="hd">No overlaps yet</div><p class="hint">'+(people.length<2?'Invite a friend, then you see here when you are in the same city.':'Add your next trip and you see here who will be there too.')+'</p>'+(people.length<2?'<button type="button" class="ghost" id="ovinv" style="margin:0 0 6px">Invite a friend</button>':'')+'</div>'}
    else{
      h='<p class="ovh">Coming up</p>';
      rs.forEach(function(r){
        var em=emoFor(r.p,r.fc);
        h+='<div class="ovc'+(r.km?' near':'')+'">'+face(r.p,40,false)+'<span class="tx"><b>'+esc(people[r.p].n)+' \u00b7 '+em+' '+esc(r.fc)+'</b><i>'+range(r.a,r.b)+(r.km?', '+r.km+' km from you in '+esc(r.city):r.home?', in your city':', with you')+'</i>'+(function(){var fs=stayAt(r.p,r.a);return fs&&fs.note?'<i class="note">\u201c'+esc(fs.note)+'\u201d</i>':''})()+'</span>'
          +'<a class="wa" href="https://wa.me/'+(people[r.p].phone||'').replace(/\D/g,'')+'?text='+encodeURIComponent(waText(r))+'" target="_blank" rel="noopener">'+WA+(people[r.p].phone?'Message':'Pick chat')+'</a></div>';
      });
    }
    $('ovlist').innerHTML=h;
    if($('ovinv'))$('ovinv').onclick=function(){sheet='invite';renderSheet()};
  }
  
  $('ovlist').addEventListener('click',function(e){if(e.target.closest('[data-home]')){sheet='home';renderSheet()}});
  $('add2').onclick=function(){$('add').click()};
  $('tadd').onclick=function(){$('add').click()};
  $('ovlist').addEventListener('click',function(e){var a=e.target.closest('a.wa');if(a&&api.native){e.preventDefault();api.openExternal(a.href)}});
  $('t-cal').onclick=function(){tab='cal';renderAll()};
  $('t-fr').onclick=function(){tab='fr';renderAll()};

  var cq='';
  /* filters: everyone, only me, one city, one friend */
  /* one filter button: it says what you are looking at, tap it to choose */
  function renderPills(){
    var cs=cities();if(selC&&cs.indexOf(selC)<0)selC=null;
    var lab=onlyMe?'🙋 Just me':selC?'📍 '+esc(selC):selP!==null?face(selP,22,false)+esc(people[selP].n):'👥 Everyone';
    var on=onlyMe||selC||selP!==null;
    $('pills').innerHTML='<button type="button" class="pillb on fsel" data-f="menu">'+lab+' <span class="car">▾</span></button>'
      +(on?'<button type="button" class="pillb fclr" data-f="all" aria-label="Show everyone">×</button>':'');
  }
  $('pills').addEventListener('click',function(e){
    var b=e.target.closest('button.pillb');if(!b)return;var f=b.getAttribute('data-f');
    if(f==='all'){onlyMe=false;selC=null;selP=null;selD=null;renderAll();return}
    sheet='filter';selD=null;renderSheet();
  });

  /* the calendar is one long list of months: scroll down to go forward, no left and right */
  var NM=12, lastKey='', scrolling=false;
  function monthCells(y,m){
    var lead=(new Date(y,m,1).getDay()+6)%7, n=new Date(y,m+1,0).getDate(), h='', i, p;
    for(i=0;i<lead;i++)h+='<span></span>';
    for(i=1;i<=n;i++){
      var d=iso(y,m,i), who=[], col=(lead+i-1)%7, bar='';
      /* with no filter on, a friend only appears on days you are in the same city and one of you travelled */
      var L0=where(0,d);
      if(d>=T&&!onlyMe)for(p=1;p<people.length;p++){
        if(selP===null&&!selC){if(L0&&where(p,d)===L0&&(tripAt(0,d)||tripAt(p,d)))who.push(p)}
        else if(shows(p,d))who.push(p);
      }
      var st=d>=T&&shows(0,d)?stayAt(0,d):null;
      if(st){who.unshift(0);bar='<span class="cn">'+esc(st.city)+'</span>'}
      else if(selP&&who.length)bar='<span class="cn">'+esc(where(selP,d)||'')+'</span>';
      var isH=d>=T&&hit(d), soft=isH&&who.length>0&&who.every(function(x){return x===0||oftenSet[x]})&&who.some(function(x){return x>0}), isHp=isH&&col>0&&i>1&&iso(y,m,i-1)>=T&&hit(iso(y,m,i-1));
      var cls='cell'+(col>4?' we'+(col===5?' sat':''):'')+(d<T?' past':'')+(d===T?' today':'')+(isH?' hit'+(soft?' soft':'')+(isHp?' hp':'')+(col<6&&i<n&&hit(iso(y,m,i+1))?' hn':''):'')+(d===selD||d===gs?' sel':'');
      var mt=meetups.some(function(m){return m.day===d&&m.status==='yes'});
      h+='<button type="button" class="'+cls+'" data-d="'+d+'"><span class="n">'+i+'</span>'+(mt?'<span class="mt" aria-label="Meeting">\ud83e\udd42</span>':'')+'<span class="faces">';
      who.slice(0,who.length>2?1:2).forEach(function(x){
        if(x===0&&st){h+='<span class="em" role="img" aria-label="You">'+(st.e||emoFor(0,st.city))+'</span>';return}
        if(selP!==null&&x===selP){var fc=where(x,d),fs=stayAt(x,d);h+='<span class="em" role="img" aria-label="'+esc(people[x].n+' in '+fc)+'">'+((fs&&fs.e)||emoFor(x,fc))+'</span>';return}
        h+=face(x,20,true)});
      if(who.length>2)h+='<span class="more">+'+(who.length-1)+'</span>';
      h+='</span>'+bar+'</button>';
    }
    return h;
  }
  /* friends you share many days with (a partner, a flatmate) get a soft yellow; meeting someone new stays bright */
  var oftenSet={};
  function calcOften(){oftenSet={};var cnt={},lim=addDays(T,90);overlaps().forEach(function(r){if(r.a>lim)return;var a=r.a<T?T:r.a,b=r.b>lim?lim:r.b;var n=Math.round((new Date(b+'T12:00')-new Date(a+'T12:00'))/864e5)+1;cnt[r.p]=(cnt[r.p]||0)+n});for(var k in cnt)if(cnt[k]>=20)oftenSet[k]=true}
  function startYM(){var y=n0.getFullYear(),m=n0.getMonth();if(vy<y||(vy===y&&vm<m)){y=vy;m=vm}return [y,m]}
  function renderGrid(){
    calcOften();var s0=startYM(), h='', k;
    for(k=0;k<NM;k++){var y=s0[0]+Math.floor((s0[1]+k)/12), m=(s0[1]+k)%12;
      h+='<section class="mon" data-y="'+y+'" data-m="'+m+'"><div class="mhd">'+MN[m]+(y!==n0.getFullYear()?' '+y:'')+'</div><div class="grid">'+monthCells(y,m)+'</div></section>'}
    $('grid').innerHTML=h;
    var key=vy+'-'+vm;
    if(key!==lastKey){lastKey=key;var sec=$('grid').querySelector('.mon[data-y="'+vy+'"][data-m="'+vm+'"]');
      if(sec&&!(vy===n0.getFullYear()&&vm===n0.getMonth()))requestAnimationFrame(function(){scrolling=true;toSec(sec);setTimeout(function(){scrolling=false},100)})}
    topLabel();
  }
  function stickH(){var s=document.querySelector('.calcard .stick'),t=document.querySelector('#app .top');return (s?s.offsetHeight+4:60)+(t?t.offsetHeight:0)}
  /* the month bar sticks right under the header, whatever its height on this phone */
  function setHdr(){var t=document.querySelector('#app .top');if(t)document.documentElement.style.setProperty('--hdr',t.offsetHeight+'px')}
  window.addEventListener('resize',setHdr);setTimeout(setHdr,0);setTimeout(setHdr,600);
  /* the month name on top follows the month you are looking at */
  /* full year: twelve small months, arrows for other years, tap a month to jump there */
  var yv=null;
  function yearView(){
    var y=yv, h='<div class="shd"><div class="yhd"><button type="button" class="yar" id="ypr" aria-label="Previous year">‹</button><div class="hd">'+y+'</div><button type="button" class="yar" id="ynx" aria-label="Next year">›</button></div><button type="button" class="x" id="x" aria-label="Close">×</button></div><div class="yg">';
    for(var m=0;m<12;m++){
      var lead=(new Date(y,m,1).getDay()+6)%7, n=new Date(y,m+1,0).getDate(), cur=(y===n0.getFullYear()&&m===n0.getMonth());
      h+='<button type="button" class="ym'+(cur?' cur':'')+'" data-ym="'+y+'-'+m+'"><b>'+MN[m]+'</b><span class="yd">';
      for(var i=0;i<lead;i++)h+='<i></i>';
      for(i=1;i<=n;i++){var d=iso(y,m,i);h+='<i class="'+(d===T?'t':d>=T&&hit(d)?'h':d>=T&&stayAt(0,d)?'s':d<T?'p':'')+'">'+i+'</i>'}
      h+='</span></button>';
    }
    return h+'</div>';
  }
  function goMonth(y,m){
    var s0=startYM(), want=(y-s0[0])*12+(m-s0[1]);
    if(want+3>NM)NM=Math.min(240,want+6);
    vy=y;vm=m;lastKey='';sheet=null;selD=null;renderAll();
  }
  var curSec=null;
  function topLabel(){
    var secs=$("grid").querySelectorAll(".mon"), stk=document.querySelector('.calcard .stick'), lim=(stk?stk.getBoundingClientRect().bottom:60)+8, cur=secs[0];
    for(var i=0;i<secs.length;i++){if(secs[i].getBoundingClientRect().top<=lim)cur=secs[i];else break}
    if(!cur)return;
    var y=+cur.getAttribute('data-y'), m=+cur.getAttribute('data-m');
    if(!scrolling){vy=y;vm=m;lastKey=vy+'-'+vm}
    if(cur!==curSec){if(curSec)curSec.classList.remove('cur');cur.classList.add('cur');curSec=cur}
    $('mlabel').textContent=MN[m]+' '+y;
    var far=y!==n0.getFullYear()||m!==n0.getMonth();
    $('tod').hidden=!far;$('mlabel').parentNode.classList.toggle('far',far);
  }
  /* one simple rule everywhere: the whole page scrolls, the small month bar sticks on top */
  function toSec(sec){var gd=sec.querySelector('.grid')||sec;window.scrollTo(0,gd.getBoundingClientRect().top+window.scrollY-stickH()+2)}
  /* more months load by themselves when the last one gets close */
  var tlT=0;document.addEventListener('scroll',function(){cancelAnimationFrame(tlT);tlT=requestAnimationFrame(function(){if($('v-cal').hidden)return;topLabel();
    var last=$('grid').lastElementChild;if(NM<120&&last&&last.getBoundingClientRect().top<window.innerHeight*3){NM+=6;renderGrid()}})},{passive:true,capture:true});
  /* like booking a flight: tap the first day, then the last day, and the trip form opens with both */
  var pkHide=false, gs=null, gbar=document.createElement('div');gbar.className='gbar';gbar.hidden=true;document.body.appendChild(gbar);
  function showBar(){
    gbar.hidden=!gs;if(!gs)return;
    var mc=where(0,gs), ms=stayAt(0,gs), fr=[], names=[];
    for(var i=1;i<people.length;i++){var c=where(i,gs);if(c){fr.push(i);if(tripAt(i,gs)||c===mc)names.push(people[i].n+' '+(c===mc?'\u2764\ufe0f':'in '+c))}}
    var ovr=overlaps().filter(function(r){return r.a<=gs&&gs<=r.b})[0]||null;
    var line1=day(gs)+' \u00b7 '+(mc?(ms?(ms.e||emoFor(0,mc))+' ':'')+mc:'')+(ms&&ms.note?' \u00b7 '+ms.note:'');
    gbar.innerHTML='<button type="button" class="gi" id="gwho"><b>'+esc(line1)+'</b><i>'+(names.length?esc(names.slice(0,2).join(', '))+(names.length>2?' +'+(names.length-2):'')+' \u203a':'Tap your last day to add a trip')+'</i></button>'
      +(ovr?'<a class="g1 gwa" id="gwa" href="'+waHref(ovr)+'" target="_blank" rel="noopener">'+WA+esc(people[ovr.p].n)+'</a>':'<button type="button" class="g1" id="g1">Just this day</button>')+'<button type="button" class="x" id="gx" aria-label="Clear">\u00d7</button>';
    $('gwho').onclick=function(){if(!fr.length)return;selD=gs;gs=null;showBar();sheet='day';renderGrid();renderSheet()};
    if($('g1'))$('g1').onclick=function(){openRange(gs,gs)};
    if($('gwa'))$('gwa').onclick=function(e){if(api.native){e.preventDefault();api.openExternal(this.href)}};
    $('gx').onclick=function(){gs=null;showBar();renderGrid()};
  }
  function openRange(a,d){
    gs=null;showBar();pkHide=true;
    edit=null;trip=null;pe=null;ra=a;rb=d;var p=parts(a);ry=p.y;rm=p.m;
    wfSel=[];sheet='add';renderGrid();renderSheet();
  }
  $('grid').addEventListener('click',function(e){
    var pr=e.target.closest('.lprev .row[data-p]');if(pr){pickRow(pr);return}
    if(Date.now()-swiped<400)return;
    var c=e.target.closest('.cell');if(!c)return;
    var d=c.getAttribute('data-d');
    /* tapping a day shows who is where; new trips are added with the + button */
    gs=null;showBar();selD=d;sheet='day';renderGrid();renderSheet();
  });
  $('tod').onclick=function(){vy=n0.getFullYear();vm=n0.getMonth();lastKey=vy+'-'+vm;selD=null;window.scrollTo({top:0,behavior:'smooth'})};
  var swiped=0;

  function row(p,a,b,attrs,tagged){
    return '<button type="button" class="row" '+attrs+'>'+face(p,36,false)+'<span class="tx"><b>'+a+'</b><i>'+b+'</i></span>'+(tagged?'<span class="tag">'+HEART+'with you</span>':'')+'</button>';
  }
  var LT='',LB='';
  function renderList(){
    var st=UP.filter(match), title, h='', homes='', cnt=0;
    if(!people[0].home&&!people[0].stays.length){
      LT=LB='';
      $('list').innerHTML='<div class="hd">Start with where you live</div><p class="hint">You show up in your home city every day. Add a trip whenever you travel.</p><button type="button" class="ghost" data-home="1" style="margin:0 0 6px">Set my home city</button>';
      return;
    }
    if(selP!==null&&selC)title=(selP===0?'You':esc(people[selP].n))+' in '+esc(selC);
    else if(selP!==null)title='Where '+(selP===0?'you':esc(people[selP].n))+' will be';
    else if(selC)title='Who will be in '+esc(selC);
    else{
      title='Coming up in '+MN[vm];
      var m0=iso(vy,vm,1), m1=iso(vy,vm,new Date(vy,vm+1,0).getDate());
      st=st.filter(function(s){return s.a<=m1&&s.b>=m0});
    }
    people.forEach(function(p,i){
      if(!p.home||(selP!==null&&selP!==i))return;
      if(selC?p.home===selC:selP!==null)cnt++,homes+=row(i,selP!==null?esc(p.home):esc(p.n),selP!==null?'Home':'Lives here','data-p="'+i+'" data-h="1"',false);
    });
    h=homes;
    if(!st.length&&!homes)h+='<p class="empty">'+(selC||selP!==null?'No plans shared here yet.':'No trips this month yet.')+'</p>';
    st.forEach(function(s){
      var a,b;
      var so=people[s.p].stays[s.i];
      if(selP!==null){a=ec(s.p,s.city,so);b=range(s.a,s.b)}
      else if(selC){a=esc(people[s.p].n);b=range(s.a,s.b)}
      else{a=ec(s.p,s.city,so);b=range(s.a,s.b)}
      h+=row(s.p,a,b,'data-p="'+s.p+'" data-i="'+s.i+'"',shared(s));
    });
    LT=title;LB=h;cnt+=st.length;
    $('list').innerHTML='<button type="button" class="row" data-open="1"><span class="hd" style="flex:1;margin:0;font-size:16.5px;line-height:1.2">'+title+'</span><span class="cnt">'+cnt+' ›</span></button>'
      +'<div class="lprev">'+h+'</div>';
    
  }
  function pickRow(r){
    var p=+r.getAttribute('data-p');
    if(p===0){
      if(r.getAttribute('data-h')){sheet='home'}else{trip=+r.getAttribute('data-i');sheet='trip'}
      selD=null;renderSheet();return;
    }
    sheet=null;
    if(selP!==p){selP=p;selD=null;jump()}
    renderAll();window.scrollTo(0,0);
  }
  $('sheet').addEventListener('click',function(e){
    if(sheet!=='list')return;
    var r=e.target.closest('.row[data-p]');if(r)pickRow(r);
  });
  $('list').addEventListener('click',function(e){
    if(e.target.closest('[data-home]')){sheet='home';renderSheet();return}
    var pr=e.target.closest('.lprev .row[data-p]');if(pr){pickRow(pr);return}
    if(e.target.closest('[data-open]')){sheet='list';selD=null;renderSheet()}
  });

  function status(p){
    var now=tripAt(p,T), st=UP.filter(function(s){return s.p===p&&s.a>T});
    if(now){var cur=UP.filter(function(s){return s.p===p&&s.a<=T})[0];return 'In '+now+(cur?' until '+day(cur.b):'')}
    if(people[p].home)return 'At home in '+people[p].home+(st.length?', next '+st[0].city+' from '+day(st[0].a):'');
    return st.length?'Next in '+st[0].city+', from '+day(st[0].a):'No plans shared';
  }
  function renderFriends(){
    var h='', v=q.toLowerCase();
    people.forEach(function(p,i){
      if(i===0)return;
      var st=UP.filter(function(s){return s.p===i});
      if(v&&p.n.toLowerCase().indexOf(v)<0&&p.home.toLowerCase().indexOf(v)<0&&!st.some(function(s){return s.city.toLowerCase().indexOf(v)>=0}))return;
      h+='<div class="fline"><button type="button" class="fcard" data-p="'+i+'">'+face(i,46,false)+'<span class="tx"><span><span class="hd" style="display:block">'+esc(p.n)+'</span><i>'+esc(status(i))+'</i></span><span class="pl">';
      st.forEach(function(s){var w=shared(s);h+='<span'+(w?' class="hit"':'')+'>'+(w?HEART:'')+esc(s.city)+', '+range(s.a,s.b)+'</span>'});
      h+='</span></span></button><button type="button" class="fsw on" data-mute="'+esc(p.id)+'" aria-label="Hide '+esc(p.n)+' from my calendar" aria-pressed="true"><span class="sw"></span></button></div>';
    });
    var off=allF.filter(function(f){return MUTE[f.id]});
    if(off.length){h+='<p class="fsub">Switched off</p>';off.forEach(function(f){
      h+='<div class="fline off"><span class="fcard"><span class="tx"><span><span class="hd" style="display:block">'+esc(f.n)+'</span><i>Not on your calendar</i></span></span></span><button type="button" class="fsw" data-unmute="'+esc(f.id)+'" aria-label="Show '+esc(f.n)+' again" aria-pressed="false"><span class="sw"></span></button></div>'})}
    if(people.length<2&&!allF.length)h='<div class="card list"><div class="hd">No friends here yet</div><p class="hint">People whose plans you can see show up here, with where they are and where they are going next.</p></div>';
    if(v.length>=2)h+='<p class="fsub">People on Overlap</p><div id="people"><p class="empty">Searching\u2026</p></div>';
    $('friends').innerHTML=h||'<p class="empty">No friend or city matches that.</p>';
    if(v.length>=2)findPeople(q);
  }
  var pt=null, pn=0;
  function findPeople(t){
    clearTimeout(pt);var my=++pn;
    pt=setTimeout(function(){api.searchPeople(t).then(function(r){
      if(my!==pn||!$('people'))return;
      r=r.filter(function(x){return x.status!=='friend'});
      $('people').innerHTML=r.length?r.map(function(x){
        var b=x.status==='sent'?'<button type="button" class="padd done" disabled>Requested</button>':'<button type="button" class="padd" data-req="'+esc(x.id)+'">'+(x.status==='asked you'?'Accept':'Add')+'</button>';
        return '<div class="pcard"><span class="pav">'+esc(String(x.name||'?').trim().charAt(0).toUpperCase()||'?')+'</span><span class="tx"><b>'+esc(x.name||'')+'</b><i>'+(x.username?'@'+esc(x.username):'')+'</i></span>'+b+'</div>'}).join('')
        :'<p class="empty">Nobody found. Invite them below.</p>';
    },function(){if($('people'))$('people').innerHTML='<p class="empty">Search will work after the last database update.</p>'})},300);
  }
  var selF=null;
  $('friends').addEventListener('click',function(e){
    var rq=e.target.closest('[data-req]');
    if(rq){rq.disabled=true;api.requestUser(rq.getAttribute('data-req')).then(function(st){rq.textContent=st==='friend'?'Friends!':'Requested';rq.classList.add('done');if(st==='friend')reload()},function(){rq.disabled=false;toast('Could not send that. Try again.')});return}
    var m=e.target.closest('[data-mute]'),u=e.target.closest('[data-unmute]');
    if(m){setMute(m.getAttribute('data-mute'),true);return}
    if(u){setMute(u.getAttribute('data-unmute'),false);return}
    var c=e.target.closest('button.fcard');if(!c)return;
    selF=+c.getAttribute('data-p');sheet='friend';selD=null;renderSheet();
  });
  $('invite').onclick=function(){sheet='invite';selD=null;renderSheet()};
  $('q').addEventListener('input',function(){q=this.value.trim();renderFriends()});
  $('q').addEventListener('keydown',function(e){if(e.key==='Enter')this.blur()});

  function close(){setEdit=false;pkHide=false;gs=null;showBar();sheet=null;selD=null;trip=null;edit=null;selF=null;renderGrid();renderSheet()}
  $('veil').onclick=close;
  function head(t){return '<div class="shd"><div class="hd">'+t+'</div><button type="button" class="x" id="x" aria-label="Close">×</button></div>'}
  function renderSheet(){
    var el=$('sheet');
    $('veil').hidden=!sheet;el.hidden=!sheet;
    if(!sheet)return;
    var h='<div class="in">', me=people[0];
    if(sheet==='day'){
      var p=parts(selD), wd=DW[(new Date(p.y,p.m,p.d).getDay()+6)%7], any=false;
      h+=head(wd+' '+day(selD));
      people.forEach(function(x,i){
        var c=where(i,selD);if(!c)return;any=true;
        var away=!!tripAt(i,selD), w=i>0&&c===where(0,selD)&&(away||tripAt(0,selD));
        if(i===0){
          h+=(away?'<button type="button" class="row mine" id="mine">':'<div class="row">')+face(0,36,false)+'<span class="tx"><b>You</b><i>'+(away?ec(0,c,stayAt(0,selD)):esc(c)+', home')+'</i></span>'+(away?'<span class="edt">Edit \u203a</span></button>':'</div>');
          return;
        }
        var ov=i>0?overlaps().filter(function(r){return r.p===i&&r.a<=selD&&selD<=r.b})[0]:null;
        var tag=ov?(ov.km?' \u00b7 \ud83d\udccd '+ov.km+' km from you':' \u00b7 '+HEART+'with you'):'';
        h+='<div class="row">'+face(i,36,false)+'<span class="tx"><b>'+esc(x.n)+'</b><i>'+(away?ec(i,c,stayAt(i,selD)):esc(c)+', home')+tag+'</i></span>'
          +(ov&&v10?'<button type="button" class="meetb" data-meet="'+i+'" aria-label="Let\u2019s meet?">\ud83e\udd42</button>':'')
          +(ov?'<a class="wa dwa" href="'+waHref(ov)+'" target="_blank" rel="noopener" data-ext="1">'+WA+'</a>':'')+'</div>';
      });
      meetups.filter(function(m){return m.day===selD}).forEach(function(m){var o=m.from_user===people[0].id?m.to_user:m.from_user,k=pidx(o);if(k<1)return;
        h+='<div class="mline">\ud83e\udd42 '+(m.status==='yes'?'Meeting '+esc(people[k].n)+' in '+esc(m.city):(m.from_user===people[0].id?'Waiting for '+esc(people[k].n)+' to answer':esc(people[k].n)+' asked to meet in '+esc(m.city)))+(m.note?'<i>'+esc(m.note)+'</i>':'')+'</div>'});
      if(!any)h+='<p class="empty">Nobody has shared plans for this day.</p>';
      if(selD>=T)h+='<button type="button" class="add hd addday" id="addday">+ Add a trip from this day</button>';
    }else if(sheet==='mineday'){
      var hs=people[0].home;
      h+=head('You on '+day(selD))
        +'<p class="hint">You are at home in '+esc(hs)+' this day.</p>'
        +'<button type="button" class="add hd" id="trip1">Add a trip from this day</button>'
        +'<button type="button" class="ghost" id="home1">Change home city</button>';
    }else if(sheet==='list'){
      h+=head(LT)+LB;
    }else if(sheet==='add'){
      h+=head(edit!==null?'Edit your trip':'When are you away?')
        +'<div class="f"><div class="whenrow"><p class="when" id="when"></p><button type="button" class="chg" id="chg"'+(pkHide?'':' hidden')+'>Change</button></div><div class="pk"'+(pkHide?' hidden':'')+'><div class="pkh"><button type="button" id="pkp" aria-label="Previous month"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button><div class="hd" id="pkl"></div><button type="button" id="pkn" aria-label="Next month"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button></div><div class="pkg" id="pkg"></div></div>'
        +'<label for="fc" style="margin-top:14px">Where?</label><input id="fc" type="text" maxlength="30" placeholder="Florence" autocomplete="off" autocapitalize="words" enterkeyhint="done"><div class="sug" id="sug"></div>'
        +withFriends()
        +'<div class="xtra"><input id="fnote" type="text" maxlength="200" placeholder="Note (optional)" autocomplete="off" value="'+esc(edit!==null?(people[0].stays[edit].note||''):'')+'">'
        +(function(){var st=edit!==null?people[0].stays[edit]:null;visSel=st&&st.priv?'me':st&&st.close?'close':'all';
          var opts=[['all','\ud83d\udc65 All friends'],['close','\u2b50 Close friends'],['me','\ud83d\udd12 Only me']].filter(function(o){return o[0]!=='close'||v10});
          return '</div><div class="vis"><div class="vish">Who sees it</div><div class="visb" id="fvis">'+opts.map(function(o){return '<button type="button" data-vis="'+o[0]+'"'+(o[0]===visSel?' class="on"':'')+'>'+o[1]+'</button>'}).join('')+'</div></div>'})()
        +'<p class="err" id="err"></p><button type="button" class="add hd" id="save">'+(edit!==null?'Save changes':'Add to my calendar')+'</button>'
        +(edit!==null?'<button type="button" class="ghost" id="share1">'+SHARE_I+'Share this trip</button>'+calLinks(people[0].stays[edit])+'<button type="button" class="ghost" id="del">Remove this trip</button>':'')+'</div>'
        +(edit===null?'<div class="imp"><button type="button" id="ipaste">\ud83d\udccb Paste plans</button>'+(api.calendarSupported?'<button type="button" id="ical">\ud83d\udcc5 From my calendar</button>':'')+'</div>':'');
    }else if(sheet==='hello'){
      h+='<div class="shd"><span></span><button type="button" class="x" id="x" aria-label="Close">×</button></div>'
        +'<div class="wel">'+document.querySelector('.brand svg').outerHTML+'<div class="hd">Welcome to Overlap</div><p class="hint">Tell friends who you are and which city you live in. You show up there every day, and any trip you add takes over while you travel.</p></div>'
        +'<div class="f"><label for="fn">Your name</label><input id="fn" type="text" maxlength="40" placeholder="Bianca" autocomplete="given-name" autocapitalize="words" value="'+esc(people[0].full||guessName())+'">'+(people[0].userCol?'<label for="fu">Username</label><div class="ufield"><span>@</span><input id="fu" type="text" maxlength="20" placeholder="bianca" autocomplete="off" autocapitalize="none" spellcheck="false" value="'+esc(people[0].user||slug(people[0].full||guessName()))+'"></div>':'')+'<label for="fp">WhatsApp number</label><input id="fp" type="tel" inputmode="tel" maxlength="20" placeholder="+41 79 123 45 67" autocomplete="tel" value="'+esc(people[0].phone||'')+'"><label for="fw">Your city</label><input id="fw" type="text" maxlength="30" placeholder="Zurich" autocomplete="off" autocapitalize="words" enterkeyhint="done"><div class="sug" id="wsug"></div>'
        +'<p class="err" id="err"></p><button type="button" class="add hd" id="savew">Start</button></div>';
    }else if(sheet==='import'){
      h+=head(imp.mode==='cal'?'From my calendar':'Paste your plans');
      if(imp.mode==='paste'&&!imp.list)h+='<p class="hint">Paste or type your trips, one per line. For example:<br><b>London 2-4 Dec</b><br><b>Ibiza 9/12-13/12</b><br><b>Paris 28 Dec - 2 Jan</b></p><div class="f"><textarea id="ptxt" rows="5" placeholder="London 2-4 Dec"></textarea></div><p class="err" id="err"></p><button type="button" class="add hd" id="pfind">Find my trips</button>';
      else if(!imp.list)h+='<p class="hint">Looking for trips in your calendar\u2026</p>';
      else{
        h+=imp.list.length?'<p class="hint">Tap the ones to add.</p><div class="ilist">'+imp.list.map(function(t,i){return '<div class="irow"><span class="tx"><b>'+emoFor(0,t.city)+' '+esc(t.city)+'</b><i>'+range(t.a,t.b)+(t.from?' \u00b7 '+esc(t.from):'')+'</i></span><button type="button" class="padd'+(t.done?' done':'')+'" data-i="'+i+'"'+(t.done?' disabled':'')+'>'+(t.done?'Added':'Add')+'</button></div>'}).join('')+'</div>'
          +(imp.list.some(function(t){return !t.done})?'<button type="button" class="add hd" id="iall">Add all</button>':'<button type="button" class="add hd" id="idone">Done</button>')
          :'<p class="hint">'+esc(imp.msg||'No trips found.')+'</p>'+(imp.mode==='paste'?'<button type="button" class="ghost" id="iback">Try again</button>':'');
      }
    }else if(sheet==='pickc'||sheet==='pickf'){
      h+=head(sheet==='pickc'?'See a city':'See a friend')+'<div class="picks">';
      if(sheet==='pickc')cities().forEach(function(c){h+='<button type="button" class="pickb" data-c="'+esc(c)+'">'+emoFor(0,c)+' '+esc(c)+'</button>'});
      else for(var pf=1;pf<people.length;pf++)h+='<button type="button" class="pickb" data-p="'+pf+'">'+face(pf,26,false)+esc(people[pf].n)+'</button>';
      h+='</div>'+((sheet==='pickf'&&people.length<2)?'<p class="hint">No friends yet. Invite one from the Friends tab.</p>':'');
    }else if(sheet==='delete'){
      h+='<div class="shd"><span></span><button type="button" class="x" id="x" aria-label="Close">\u00d7</button></div>'
        +'<div class="sure"><div style="font-size:44px">\u26a0\ufe0f</div><div class="big hd">Are you sure?</div><p>This deletes your account, your trips and your friends on Overlap. It cannot be undone.</p>'
        +'<button type="button" class="dangerbtn" id="delyes">Yes, delete my account</button><button type="button" class="ghost" id="delno">No, keep it</button></div>';
    }else if(sheet==='share'){
      h+=head('Your plans as text')
        +'<p class="hint">Copy it and paste it into any chat, for friends who are not on Overlap.</p>'
        +'<div class="sug" id="plang">'+[['en','English'],['it','Italiano'],['de','Deutsch'],['fr','Français'],['es','Español']].map(function(o){return '<button type="button" data-l="'+o[0]+'"'+(o[0]===plang?' class="on"':'')+'>'+o[1]+'</button>'}).join('')+'</div>'
        +'<div class="ptxv" id="ptxv"></div><textarea class="ptx" id="ptx" readonly aria-hidden="true" tabindex="-1"></textarea>'
        +'<div class="shb"><button type="button" class="add" id="copy">Copy text</button>'
        +'<button type="button" class="ghost wa2" id="nwa">'+WA+'WhatsApp</button>'
        +(api.canShare?'<button type="button" class="ghost" id="nshare">Send with\u2026</button>':'')+'</div>'
        +myTripsCal();
    }else if(sheet==='year'){
      h+=yearView();
    }else if(sheet==='meet'){
      var fm=people[meetF], days=[], dd=meetA<T?T:meetA;
      for(var q=0;q<7&&dd<=meetB;q++){days.push(dd);dd=addDays(dd,1)}
      h+=head('Let\u2019s meet?')
        +'<div class="row">'+face(meetF,40,false)+'<span class="tx"><b>'+esc(fm.n)+'</b><i>'+esc(meetC)+'</i></span></div>'
        +'<div class="f"><label>Which day?</label><div class="sug" id="mdays">'+days.map(function(x){return '<button type="button" data-md="'+x+'"'+(x===meetD?' class="on"':'')+'>'+day(x)+'</button>'}).join('')+'</div>'
        +'<label for="mnote">Where or when? (optional)</label><input id="mnote" maxlength="200" placeholder="Aperitivo at 7?">'
        +'<button type="button" class="add hd" id="msend">Send to '+esc(fm.n)+'</button></div>';
    }else if(sheet==='filter'){
      var cur=onlyMe?'me':selC?'city':selP!==null?'friend':'all';
      var ops=[['all','👥','Everyone','All your friends and you'],['me','🙋','Just me','Only your own trips'],['city','📍','A city ›',selC?selC:'Who will be in one city'],['friend','🧑','A friend ›',selP!==null?people[selP].n:'Only one friend’s plans']];
      h+=head('Show on the calendar')+ops.map(function(o){return '<button type="button" class="fopt'+(o[0]===cur?' on':'')+'" data-fo="'+o[0]+'"><span class="fe">'+o[1]+'</span><span class="tx"><b>'+o[2]+'</b><i>'+esc(o[3])+'</i></span>'+(o[0]===cur?'<span class="fck">✓</span>':'')+'</button>'}).join('');
    }else if(sheet==='about'){
      h+=head('About Overlap')
        +'<div class="about"><div class="wel">'+document.querySelector('.brand svg').outerHTML+'</div>'
        +'<p><b>Overlap shows when you and your friends are in the same place.</b></p>'
        +'<p>Add where you\u2019ll be: your home city, and the trips you plan. Your friends do the same.</p>'
        +'<p>When two of you are in the same city on the same days, or close by, Overlap tells you. Then you can send a message and meet.</p>'
        +'<p>Only friends you accept see your plans. Trips marked Private are only for you.</p>'
        +'<p class="hint">Made with love by Bianca.</p><p class="hint"><a href="/privacy.html" data-ext="1" target="_blank" rel="noopener">Privacy</a> \u00b7 <a href="/support.html" data-ext="1" target="_blank" rel="noopener">Help and contact</a></p></div>';
    }else if(sheet==='invite'){
      h+=head('Invite a friend')
        +'<p class="hint">Send your personal link. When they join, you see each other\u2019s plans. People you invite never see each other unless they are friends too.</p>'
        +(me.user?'<p class="hint">Or tell them your username <b>@'+esc(me.user)+'</b>: they can search it in Friends.</p>':'')
        +'<div class="f"><input id="ilink" type="text" readonly aria-label="Your invite link"></div>'
        +'<button type="button" class="add hd" id="icopy">Copy link</button>'
        +'<button type="button" class="ghost wa2" id="iwa">'+WA+'Send on WhatsApp</button>'
        +(api.canShare?'<button type="button" class="ghost" id="ishare">Send with\u2026</button>':'')
        +'<div class="sep"></div><div class="f"><label for="iem">Or add them by email</label><input id="iem" type="email" inputmode="email" autocomplete="off" autocapitalize="off" placeholder="friend@email.com" enterkeyhint="send"></div>'
        +'<p class="err" id="err"></p><button type="button" class="ghost" id="isend">Send request</button>';
    }else if(sheet==='friend'){
      var fr=people[selF];
      h+=head(esc(fr?fr.full||fr.n:''))
        +'<div class="row">'+face(selF,46,false)+'<span class="tx"><b>'+esc(fr?fr.n:'')+'</b><i>'+esc(fr?status(selF):'')+'</i></span></div>'
        +(v10?'<button type="button" class="priv'+(closeIds.indexOf(fr.id)>=0?' on':'')+'" id="fclose"><span class="sw"></span><span class="pl"><b>\u2b50 Close friend</b><i>Sees your trips for close friends</i></span></button>':'')
        +'<button type="button" class="add hd" id="fsee">See their plans</button>'
        +'<button type="button" class="ghost danger" id="unf">Stop sharing with '+esc(fr?fr.n:'')+'</button>'
        +'<div class="brow"><button type="button" class="linkb" id="fblock">Block</button><button type="button" class="linkb" id="frep">Report</button></div>'
        +'<div class="repbox" id="repbox" hidden><label for="repwhy">What happened? (optional)</label><textarea id="repwhy" maxlength="500" rows="3"></textarea><p class="hint">We look at every report. Reporting also blocks them.</p><button type="button" class="ghost danger" id="repsend">Send report and block</button></div>';
    }else if(sheet==='install'){
      h+=head('Add Overlap to your Home Screen')+installSteps()
        +'<p class="hint" style="margin-top:8px">Then open Overlap from its icon. Alerts only work from there.</p>'
        +'<button type="button" class="add hd" id="ok">Got it</button>';
    }else if(sheet==='home'){
      var ps=api.pushState();
      h+=head('Your settings')
        +'<div class="avrow"><span class="avbig">'+face(0,72,false)+'</span><div class="avbtns"><label class="ghost avpick">'+(people[0].av?'Change photo':'Add a photo')+'<input id="avin" type="file" accept="image/*" hidden></label>'+'<span class="avnote">Only your friends see it</span>'+(people[0].av?'<button type="button" class="linkb" id="avrm">Remove photo</button>':'')+'</div></div>'
        +'<div class="f'+(setEdit?'':' locked')+'" id="setf"><label for="fn">Your name</label><input id="fn" type="text" maxlength="40" placeholder="Bianca" autocomplete="given-name" autocapitalize="words" value="'+esc(me.full||'')+'">'
        +(!people[0].userCol||!people[0].phoneCol?'<p class="err" style="margin:0 0 10px">The database update has not been run yet, so your username and number cannot be saved. See the steps in the chat with Claude.</p>':'')
        +'<label for="fu">Username</label><div class="ufield"><span>@</span><input id="fu" type="text" maxlength="20" placeholder="bianca" autocomplete="off" autocapitalize="none" spellcheck="false" value="'+esc(me.user||'')+'"></div>'
        +'<label for="fp">WhatsApp number</label><input id="fp" type="tel" inputmode="tel" maxlength="20" placeholder="+41 79 123 45 67" autocomplete="tel" value="'+esc(me.phone||'')+'"><label for="fh">Where you live</label><input id="fh" type="text" maxlength="30" placeholder="Zurich" autocomplete="off" autocapitalize="words" value="'+esc(me.home)+'"><div class="sug" id="hsug"></div>'+palPicker()
        +'<p class="hint" style="margin-top:8px">You show up here every day. Add a trip whenever you travel and it takes over for those days.</p>'
        +'<p class="err" id="err"></p>'+(setEdit?'<button type="button" class="add hd" id="saveh">Save</button>':'<button type="button" class="add hd" id="edith">Edit</button>')+'</div>'
        +'<div class="sep"></div>'
        +'<div class="frow"><span class="tx">Overlap alerts<i style="display:block;font-style:normal;font-weight:600;font-size:12.5px;color:var(--soft)">'+(ps==='granted'?'On for this phone':ps==='denied'?'Blocked in your phone settings':ps==='install'?'Add Overlap to your Home Screen first':ps==='unsupported'?'Not available in this browser':'Off')+'</i></span>'
        +(ps==='granted'?'<button type="button" id="poff">Turn off</button>':ps==='default'?'<button type="button" id="pon">Turn on</button>':ps==='install'?'<button type="button" id="phow">How</button>':'')+'</div>'
        +'<button type="button" class="ghost" id="out">Sign out</button>'
        +'<button type="button" class="link danger" id="delme">Delete my account</button>'
        +'<button type="button" class="ghost" id="aboutb">About Overlap</button>'
        +'<p class="hint" style="text-align:center"><a href="/privacy.html" data-ext="1" target="_blank" rel="noopener">Privacy</a> \u00b7 <a href="/support.html" data-ext="1" target="_blank" rel="noopener">Help and contact</a></p>';
    }else{
      if(!me.stays[trip]){sheet=null;renderSheet();return}
      openEdit(trip);return;
    }
    el.innerHTML=h+'</div>';
    $('x').onclick=close;
    if(sheet==='day'&&$('mine'))$('mine').onclick=function(){
      
      var s=stayAt(0,selD);
      if(s){openEdit(people[0].stays.indexOf(s));return}
      openAdd(selD);
    };
    if(sheet==='day'&&$('addday'))$('addday').onclick=function(){openAdd(selD)};
    if(sheet==='mineday'){
      $('trip1').onclick=function(){openAdd(selD)};
      $('home1').onclick=function(){sheet='home';renderSheet()};
    }
    if(sheet==='add'){
      if(edit!==null&&me.stays[edit])$('fc').value=me.stays[edit].city;
      $('save').onclick=saveTrip;renderPick();
      if($('wfnew'))$('wfnew').onclick=function(){var t=tripInviteText();if(api.canShare)api.shareText(t);else api.openExternal('https://wa.me/?text='+encodeURIComponent(t))};
      document.querySelectorAll('[data-wf]').forEach(function(b){b.onclick=function(){var id=b.getAttribute('data-wf'),k=wfSel.indexOf(id);if(k>=0)wfSel.splice(k,1);else wfSel.push(id);b.classList.toggle('on',k<0)}});
      if($('share1'))$('share1').onclick=function(){var t=oneTripText(me.stays[edit]);if(api.canShare)api.shareText(t);else api.openExternal('https://wa.me/?text='+encodeURIComponent(t))};
      $('pkp').onclick=function(){rm--;if(rm<0){rm=11;ry--}renderPick()};
      $('pkn').onclick=function(){rm++;if(rm>11){rm=0;ry++}renderPick()};
      $('pkg').onclick=function(e){
        var b=e.target.closest('button');if(!b||b.disabled)return;
        var d=b.getAttribute('data-d');
        if(!ra||rb||d<ra){ra=d;rb=null}else{rb=d}
        $('err').textContent='';renderPick();
        if(rb&&edit===null){pkHide=true;document.querySelector('.pk').hidden=true;$('chg').hidden=false}
      };
      if($('frep'))$('frep').onclick=function(e){var b=e.target.closest('button');if(!b)return;[].forEach.call(this.children,function(x){x.classList.toggle('on',x===b)});$('rephint').hidden=b.getAttribute('data-r')==='0'};
      if($('ipaste'))$('ipaste').onclick=function(){imp={mode:'paste',list:null};sheet='import';renderSheet()};
      if($('ical'))$('ical').onclick=function(){imp={mode:'cal',list:null};sheet='import';renderSheet();fromCalendar()};
      $('fvis').onclick=function(e){var b=e.target.closest('[data-vis]');if(!b)return;visSel=b.getAttribute('data-vis');[].forEach.call(this.children,function(x){x.classList.toggle('on',x===b)})};
      $('chg').onclick=function(){pkHide=false;document.querySelector('.pk').hidden=false;$('chg').hidden=true};
      citySug($('fc'),$('sug'),tripCities,function(){$('err').textContent=''});
      $('fc').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();saveTrip()}});
    }
    if(sheet==='home'){
      if(!setEdit)[].forEach.call(document.querySelectorAll('#setf input'),function(i){i.readOnly=true;i.tabIndex=-1;i.placeholder='Not set'});
      if($('edith'))$('edith').onclick=function(){setEdit=true;renderSheet();var f=$('fn');if(f)f.focus()};
      $('pals').onclick=function(e){var b=e.target.closest('button');if(!b)return;setPal(b.getAttribute('data-p'));[].forEach.call($('pals').children,function(x){x.classList.toggle('on',x===b)})};
      if($('saveh')){$('saveh').onclick=saveHome;citySug($('fh'),$('hsug'),homeList,null,true)}
      if($('pon'))$('pon').onclick=function(){turnOnAlerts().then(function(){renderSheet()})};
      if($('poff'))$('poff').onclick=function(){api.disablePush().then(function(){toast('Alerts off');renderAll()})};
      if($('phow'))$('phow').onclick=function(){sheet='install';renderSheet()};
      $('delme').onclick=function(){sheet='delete';renderSheet()};
      $('out').onclick=function(){api.disablePush().catch(function(){}).then(api.signOut).then(function(){location.replace('/')})};
    }
    if(sheet==='year'){
      $('ypr').onclick=function(){yv--;renderSheet()};$('ynx').onclick=function(){yv++;renderSheet()};
      document.querySelectorAll('[data-ym]').forEach(function(b){b.onclick=function(){var a=b.getAttribute('data-ym').split('-');var y=+a[0],m=+a[1];goMonth(y,m);if(y===n0.getFullYear()&&m===n0.getMonth())window.scrollTo(0,0)}});
    }
    if(sheet==='invite'){
      var link=location.origin+'/?i='+encodeURIComponent(myCode);
      $('ilink').value=link;
      $('icopy').onclick=function(){copyText(link,this,'Copy link')};
      if($('ishare'))$('ishare').onclick=function(){api.shareText('Join me on Overlap, so we know when we are in the same city: '+link)};
      if($('iwa'))$('iwa').onclick=function(){api.openExternal('https://wa.me/?text='+encodeURIComponent('Join me on Overlap, so we know when we are in the same city: '+link))};
      $('isend').onclick=function(){
        var em=String($('iem').value||'').trim();
        if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){$('err').textContent='Check the email address.';return}
        var b=this;b.disabled=true;
        api.requestByEmail(em).then(function(){$('iem').value='';b.disabled=false;toast('Request sent. They see it when they sign in.')},function(){b.disabled=false;$('err').textContent='Could not send that request.'});
      };
    }
    if(sheet==='friend'&&$('fclose'))$('fclose').onclick=function(){var b=this,on=!b.classList.contains('on'),id=people[selF].id;b.classList.toggle('on',on);
      if(on)closeIds.push(id);else closeIds=closeIds.filter(function(x){return x!==id});
      api.setClose(people[0].id,id,on).then(function(){toast(on?'Added to close friends':'Removed from close friends')},function(){b.classList.toggle('on',!on);toast('Could not save. Run the database update (sql.html).')})};
    if(sheet==='day')document.querySelectorAll('[data-meet]').forEach(function(b){b.onclick=function(){var k=+b.getAttribute('data-meet'),r=overlaps().filter(function(x){return x.p===k&&x.a<=selD&&selD<=x.b})[0];if(!r)return;
      meetF=k;meetD=selD;meetC=r.km?(r.fc||r.city):r.city;meetA=r.a;meetB=r.b;sheet='meet';renderSheet()}});
    if(sheet==='filter')document.querySelectorAll('[data-fo]').forEach(function(b){b.onclick=function(){var f=b.getAttribute('data-fo');
      if(f==='all'){onlyMe=false;selC=null;selP=null;close();renderAll()}
      else if(f==='me'){onlyMe=true;selC=null;selP=null;close();renderAll()}
      else if(f==='city'){sheet='pickc';renderSheet()}
      else{sheet='pickf';renderSheet()}}});
    if(sheet==='meet'){
      $('mdays').onclick=function(e){var b=e.target.closest('[data-md]');if(!b)return;meetD=b.getAttribute('data-md');[].forEach.call(this.children,function(x){x.classList.toggle('on',x===b)})};
      $('msend').onclick=function(){var b=this;b.disabled=true;var note=String($('mnote').value||'').trim();
        api.proposeMeetup(people[meetF].id,meetD,meetC,note).then(function(){meetups.push({id:'tmp'+Date.now(),from_user:people[0].id,to_user:people[meetF].id,day:meetD,city:meetC,note:note,status:'pending'});close();toast('Sent to '+people[meetF].n);renderGrid()},
          function(){b.disabled=false;toast('Could not send. Run the database update (sql.html).')})};
    }
    if(sheet==='friend'){
      $('unf').onclick=function(){
        var f=people[selF];if(!f)return;
        if(!this.dataset.sure){this.dataset.sure='1';this.textContent='Tap again to stop sharing with '+f.n;return}
        api.unfriend(f.id).then(function(){close();reload()},function(){toast('Could not remove, try again.')});
      };
      $('fblock').onclick=function(){
        var f=people[selF];if(!f)return;
        if(!this.dataset.sure){this.dataset.sure='1';this.textContent='Tap again to block '+f.n;return}
        api.blockUser(f.id).then(function(){close();toast('Blocked');reload()},function(){toast('Could not block. Run the database update (sql.html).')});
      };
      $('frep').onclick=function(){$('repbox').hidden=false;$('repwhy').focus()};
      $('repsend').onclick=function(){
        var f=people[selF];if(!f)return;this.disabled=true;
        api.reportUser(f.id,$('repwhy').value).then(function(){close();toast('Thanks, we got your report');reload()},function(){toast('Could not send. Run the database update (sql.html).')});
      };
      $('fsee').onclick=function(){var i=selF;sheet=null;selP=i;selC=null;selD=null;tab='cal';jump();renderAll();window.scrollTo(0,0)};
    }
    if(sheet==='install')$('ok').onclick=close;
    if(sheet==='pickc'||sheet==='pickf'){
      document.querySelector('.picks').onclick=function(e){var b=e.target.closest('.pickb');if(!b)return;onlyMe=false;
        if(b.getAttribute('data-c')){selC=b.getAttribute('data-c');selP=null;sheet=null;jump()}else{selP=+b.getAttribute('data-p');selC=null;sheet=null}
        selD=null;renderAll()};
    }
    if(sheet==='delete'){
      $('delno').onclick=function(){sheet='home';renderSheet()};
      $('delyes').onclick=function(){var b=this;b.disabled=true;b.textContent='Deleting\u2026';
        api.deleteAccount().then(function(){try{localStorage.clear()}catch(e){}location.replace('/')},function(){b.disabled=false;b.textContent='Yes, delete my account';toast('Could not delete, try again.')})};
    }
    if(sheet==='import'){
      function addOne(t){if(t.done)return;t.done=true;addMine({city:t.city,a:t.a,b:t.b,e:emoFor(0,t.city),note:'',priv:false})}
      if($('pfind'))$('pfind').onclick=function(){
        var found=parsePlans($('ptxt').value);
        if(!found.length){$('err').textContent='No dates found. Try "London 2-4 Dec".';return}
        this.disabled=true;this.textContent='Finding…';
        resolveAll(found).then(function(r){imp.list=r;imp.msg='Those trips are already in your calendar, or the cities were not found.';renderSheet()});
      };
      if($('iback'))$('iback').onclick=function(){imp.list=null;renderSheet()};
      var il=document.querySelector('.ilist');
      if(il)il.onclick=function(e){var b=e.target.closest('[data-i]');if(!b)return;addOne(imp.list[+b.getAttribute('data-i')]);index();renderAll()};
      if($('iall'))$('iall').onclick=function(){imp.list.forEach(addOne);index();sheet=null;renderAll();toast('Trips added')};
      if($('idone'))$('idone').onclick=function(){sheet=null;renderAll()};
    }
    if(sheet==='share'){
      var tx=plainPlans(plang);$('ptx').value=tx;$('ptxv').textContent=tx;
      $('plang').onclick=function(e){var b=e.target.closest('button');if(!b)return;plang=b.getAttribute('data-l');try{localStorage.setItem('ovlang',plang)}catch(x){}renderSheet()};
      $('copy').onclick=function(){
        var b=this,done=function(){b.textContent='Copied ✓';setTimeout(function(){if(b.isConnected)b.textContent='Copy text'},1800)};
        var old=function(){var t=$('ptx');t.focus();t.select();t.setSelectionRange(0,tx.length);var ok=false;try{ok=document.execCommand('copy')}catch(e){}t.blur();if(ok)done();else b.textContent='Select the text above and copy'};
        try{navigator.clipboard.writeText(tx).then(done,old)}catch(e){old()}
      };
      if($('nshare'))$('nshare').onclick=function(){api.shareText(tx)};
      $('nwa').onclick=function(){api.openExternal('https://wa.me/?text='+encodeURIComponent(tx))};
    }
    if(sheet==='hello'){
      if(!$('fw').value)$('fw').value=tzCity();
      citySug($('fw'),$('wsug'),homeList,function(){$('err').textContent=''},true);
      $('fw').addEventListener('input',function(){$('err').textContent=''});
      $('fw').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();saveWelcome()}});
      $('savew').onclick=saveWelcome;
    }
    if(sheet==='add'&&$('del'))$('del').onclick=function(){var s=people[0].stays.splice(edit,1)[0];if(s&&s.id)keep(api.deleteTrip(s.id));edit=null;index();close();renderAll();
      if(s)undoToast('Trip removed',function(){var cp={city:s.city,a:s.a,b:s.b,e:s.e,note:s.note,priv:s.priv,close:s.close};addMine(cp);index();renderAll()})};
  }
  /* suggestions: your own past cities first, then where friends are going, then a few common ones */
  var COMMON=['Florence','Milan','London','Paris','Rome','Barcelona','Lisbon','Munich'];
  var KNOWN=['Zurich','Geneva','Basel','Bern','Venice','Turin','Naples','Bologna','Madrid','Berlin','Vienna','Amsterdam','New York','Los Angeles','Bali','Athens','Copenhagen','Stockholm','Brussels','Prague','Dublin','Edinburgh','Nice','Monaco','Genoa','Verona','Pisa','Siena','Lucca','Como','Palermo','Bari','Cagliari'];
  var pe=null;
  function tripCities(){
    var count={}, list=[], seen={};
    people[0].stays.forEach(function(s){if(!count[s.city]){count[s.city]=0;list.push(s.city)}count[s.city]++});
    list.sort(function(x,y){return count[y]-count[x]});
    UP.forEach(function(s){if(s.p>0)list.push(s.city)});
    return list.concat(COMMON).filter(function(c){var k=c.toLowerCase();if(seen[k]||c===people[0].home)return false;seen[k]=1;return true});
  }
  /* one calendar for both dates: first tap is the arrival, second tap is the last day */
  var ra=null, rb=null, ry=n0.getFullYear(), rm=n0.getMonth(), edit=null;
  /* tapping your own day opens the same calendar, already filled in, so a trip can be moved, renamed or removed */
  /* add a trip to the phone's own calendar: Google Calendar link, or an .ics file for Apple and Outlook */
  /* my upcoming trips into Google Calendar (one by one) or Apple Calendar (all at once) */
  function icsOf(list){
    var ev=list.map(function(st,i){var a=st.a.replace(/-/g,''),b=next(st.b).replace(/-/g,'');
      return 'BEGIN:VEVENT\r\nUID:'+a+i+st.city.replace(/\W/g,'')+'@overlap\r\nDTSTAMP:'+a+'T000000Z\r\nDTSTART;VALUE=DATE:'+a+'\r\nDTEND;VALUE=DATE:'+b+'\r\nSUMMARY:'+(st.e||emoFor(0,st.city))+' '+st.city+(st.note?' ('+st.note.replace(/[\r\n,;]/g,' ')+')':'')+'\r\nEND:VEVENT\r\n'}).join('');
    return 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Overlap//EN\r\n'+ev+'END:VCALENDAR\r\n';
  }
  function myTripsCal(){
    var st=people[0].stays.filter(function(x){return x.b>=T}).sort(function(x,y){return x.a<y.a?-1:1});
    if(!st.length)return '';
    var b64=btoa(unescape(encodeURIComponent(icsOf(st)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    var h='<div class="sep"></div><div class="hd" style="font-size:17px;margin:2px 0 6px">Add to my calendar</div>'
      +'<a class="add shbl" style="display:flex;align-items:center;justify-content:center;text-decoration:none" data-ext="1" target="_blank" rel="noopener" href="'+location.origin+'/ics.html#'+b64+'">\ud83d\udcc5 Apple Calendar, all trips</a>'
      +'<p class="hint" style="margin:8px 0 4px">Google Calendar, one trip at a time:</p><div class="gcl">';
    st.forEach(function(x){var a=x.a.replace(/-/g,''),b=next(x.b).replace(/-/g,'');
      h+='<a data-ext="1" target="_blank" rel="noopener" href="https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent((x.e||emoFor(0,x.city))+' '+x.city)+'&dates='+a+'/'+b+'&details='+encodeURIComponent(x.note||'Added from Overlap')+'">'+(x.e||emoFor(0,x.city))+' '+esc(x.city)+' <i>'+range(x.a,x.b)+'</i><b>Google ›</b></a>'});
    return h+'</div>';
  }
  function calLinks(st){
    if(!st)return '';
    var a=st.a.replace(/-/g,''), b=next(st.b).replace(/-/g,''), t=(st.e||emoFor(0,st.city))+' '+st.city;
    var g='https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(t)+'&dates='+a+'/'+b+'&details='+encodeURIComponent('Added from Overlap');
    var ics='BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Overlap//EN\r\nBEGIN:VEVENT\r\nUID:'+a+st.city.replace(/\W/g,'')+'@overlap\r\nDTSTAMP:'+a+'T000000Z\r\nDTSTART;VALUE=DATE:'+a+'\r\nDTEND;VALUE=DATE:'+b+'\r\nSUMMARY:'+t+'\r\nEND:VEVENT\r\nEND:VCALENDAR';
    return '<div class="cal2"><a href="'+g+'" target="_blank" rel="noopener" data-ext="1">Google Calendar</a><a href="data:text/calendar;charset=utf-8,'+encodeURIComponent(ics)+'" download="overlap-trip.ics">Apple / Outlook</a></div>';
  }
  $('sheet').addEventListener('click',function(e){var a=e.target.closest('a[data-ext]');if(a&&api.native){e.preventDefault();api.openExternal(a.href)}});
  function openEdit(i){
    var s=people[0].stays[i];if(!s)return;
    edit=i;trip=null;ra=s.a;rb=s.b;pe=s.e||null;
    var p=parts(s.a<T?T:s.a);ry=p.y;rm=p.m;
    wfSel=[];sheet='add';renderSheet();
  }
  function openAdd(d){
    edit=null;trip=null;pe=null;wfSel=[];ra=d&&d>=T?d:null;rb=null;
    var p=parts(ra||T);ry=p.y;rm=p.m;
    sheet='add';renderSheet();
  }
  function renderPick(){
    var lead=(new Date(ry,rm,1).getDay()+6)%7, n=new Date(ry,rm+1,0).getDate(), h='', i;
    'MTWTFSS'.split('').forEach(function(x){h+='<em>'+x+'</em>'});
    for(i=0;i<lead;i++)h+='<span></span>';
    for(i=1;i<=n;i++){
      var d=iso(ry,rm,i), end=rb||ra, cls=[];
      if(ra&&d===ra)cls.push('a');
      if(ra&&d===end)cls.push('b');
      if(ra&&rb&&d>ra&&d<rb)cls.push('in');
      var bz=people[0].stays.filter(function(x,j){return j!==edit&&x.a<=d&&d<=x.b})[0];
      if(bz&&d>=T)cls.push('busy');
      h+='<button type="button" data-d="'+d+'"'+(cls.length?' class="'+cls.join(' ')+'"':'')+(d<T?' disabled':'')+(bz&&d>=T?' title="'+esc(bz.city)+'"':'')+'>'+i+(bz&&d>=T?'<i class="bz">'+(bz.e||emoFor(0,bz.city))+'</i>':'')+'</button>';
    }
    $('pkg').innerHTML=h;$('pkl').textContent=MN[rm]+' '+ry;
    $('pkp').disabled=ry===n0.getFullYear()&&rm===n0.getMonth();
    $('when').textContent=!ra?'Tap the day you arrive, then your last day':!rb?'From '+day(ra)+'. Now tap your last day':range(ra,rb);
  }

  /* ---------- one name per city ----------
     Cities come from a free world list (Photon, OpenStreetMap), always in English, so
     "Zurigo", "Zürich" and "zurich" all become "Zurich". Each city's position is kept on
     this phone so nearby cities (under NEAR km) also count as an overlap. */
  var NEAR=60, GEO={};
  try{GEO=JSON.parse(localStorage.getItem('ovgeo')||'{}')||{}}catch(e){GEO={}}
  function saveGeo(){try{localStorage.setItem('ovgeo',JSON.stringify(GEO))}catch(e){}}
  function fold(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
  var SKIP={country:1,state:1,region:1,province:1,county:1,continent:1,archipelago:1,ocean:1,sea:1,municipality:0};
  function photon(q,n){
    return fetch('https://photon.komoot.io/api/?q='+encodeURIComponent(q)+'&limit='+(n||6)+'&lang=en&osm_tag=place')
      .then(function(r){return r.json()}).then(function(j){
        var out=[],seen={};
        (j.features||[]).forEach(function(f){
          var p=f.properties||{}, nm=p.name;
          if(!nm||SKIP[p.osm_value]||seen[fold(nm)])return;seen[fold(nm)]=1;
          var c=f.geometry&&f.geometry.coordinates;
          if(c&&!GEO[nm]){GEO[nm]=[c[1],c[0]];saveGeo()}
          out.push({c:nm,w:p.state&&p.state!==nm?p.state:(p.country||'')});
        });
        return out;
      }).catch(function(){var e=[];e.offline=true;return e});
  }
  function lev(a,b){var m=a.length,n=b.length,d=[],i,j;for(i=0;i<=m;i++)d[i]=[i];for(j=0;j<=n;j++)d[0][j]=j;
    for(i=1;i<=m;i++)for(j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n]}
  /* text typed -> one canonical city name, or '' when nothing real matches */
  function nice(t){return String(t).trim().replace(/\s+/g,' ').split(' ').map(function(w){return w.charAt(0).toUpperCase()+w.slice(1)}).join(' ')}
  function resolveCity(t){
    var f=fold(t);if(!f)return Promise.resolve('');
    var mine=cities().concat(COMMON,KNOWN,Object.keys(GEO)), hit=mine.filter(function(k){return fold(k)===f})[0];
    if(hit)return Promise.resolve(hit);
    var close=mine.filter(function(k){return f.length>3&&lev(fold(k),f)<=Math.min(2,Math.floor(f.length/4))})[0];
    /* if the city service cannot be reached, trust what the person typed instead of blocking them */
    function tryQ(q,left){return photon(q,1).then(function(r){if(r.offline)return nice(t);return r[0]?r[0].c:left>0&&q.length>4?tryQ(q.slice(0,-1),left-1):''})}
    return tryQ(t.trim(),3).then(function(c){return c||close||''});
  }
  /* never correct a city silently: if the list knows it under another name, ask first */
  function checkCity(inp,t,go){
    resolveCity(t).then(function(r){
      var e=$('err');
      if(!r){e.textContent='We could not find "'+t+'". Check the spelling or tap a city in the list.';return}
      if(fold(r)===fold(t))return go(r);
      e.innerHTML='Did you mean <b>'+esc(r)+'</b>? <button type="button" class="ghost" id="cyes" style="margin:8px 0 0">Yes, '+esc(r)+'</button>';
      $('cyes').onclick=function(){inp.value=r;e.textContent='';go(r)};
    });
  }
  function geo(c){
    if(GEO[c])return GEO[c];
    if(!geo.busy[c]){geo.busy[c]=1;photon(c,1).then(function(r){
      if(r[0]&&!GEO[c]&&GEO[r[0].c]){GEO[c]=GEO[r[0].c];saveGeo()}
      if(GEO[c])renderAll();
    })}
    return null;
  }
  geo.busy={};
  function km(a,b){
    if(a===b)return 0;var p=geo(a),q=geo(b);if(!p||!q)return 1e9;
    var r=Math.PI/180,x=Math.sin((q[0]-p[0])*r/2),y=Math.sin((q[1]-p[1])*r/2);
    return Math.round(12742*Math.asin(Math.sqrt(x*x+Math.cos(p[0]*r)*Math.cos(q[0]*r)*y*y)));
  }
  /* live suggestions under a city box: your own cities first, then the world list */
  /* ---------- quicker ways to add trips ---------- */
  function addDays(d,n){var p=parts(d);var x=new Date(p.y,p.m,p.d+n);return iso(x.getFullYear(),x.getMonth(),x.getDate())}

  var SHARE_I='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-right:6px;vertical-align:-3px"><path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>';
  /* friends you can bring on a trip: tap their faces, they get an invite to Join */
  function withFriends(){
    if(!invOk)return '';
    var st=edit!==null?people[0].stays[edit]:null, g={};
    if(st&&st.id)guests.forEach(function(x){if(x.trip_id===st.id)g[x.to_user]=x.status});
    var h='<div class="wf"><div class="wfh">Bring friends <i>they get an invite to add it to their calendar</i></div><div class="wfl">';
    for(var i=1;i<people.length;i++){var id=people[i].id,stt=g[id];
      h+='<button type="button" class="wfb'+(stt?' done':wfSel.indexOf(id)>=0?' on':'')+'" data-wf="'+id+'"'+(stt?' disabled':'')+'>'+face(i,34,false)+'<b>'+esc(people[i].n)+'</b>'+(stt?'<i>'+(stt==='accepted'?'joined':stt==='declined'?'not now':'invited')+'</i>':'')+'</button>'}
    return h+'<button type="button" class="wfb wfnew" id="wfnew"><span class="wfplus">+</span><b>Invite</b><i>new friend</i></button></div></div>';
  }
  function sendInvites(tripId,ids,city){
    if(!ids.length||!tripId)return;
    api.inviteToTrip(tripId,ids).then(function(){
      ids.forEach(function(u){guests.push({trip_id:tripId,to_user:u,status:'pending'})});
      toast(ids.length===1?'Invite sent':'Invites sent')},function(){toast('Could not send the invite. Run the database update (sql.html).')});
  }
  /* invite someone who is not on Overlap yet to the trip being added */
  function tripInviteText(){
    var c=String(($('fc')&&$('fc').value)||'').trim(), link=location.origin+'/?i='+encodeURIComponent(myCode), n=people[0].n||'I';
    var when=ra?(rb?range(ra,rb):day(ra)):'';
    return 'Join me on Overlap! '+(c||when?n+' will be '+(c?'in '+(emoFor(0,c)+' ')+c+' ':'')+(when?when:'')+'. ':'')+'Add your trips and we will see when we are in the same city: '+link;
  }
  function oneTripText(st){
    var link=location.origin+'/?i='+encodeURIComponent(myCode);
    return 'I’ll be in '+(st.e||emoFor(0,st.city))+' '+st.city+', '+range(st.a,st.b)+'.'+(st.note?' '+st.note:'')+'\nJoin me on Overlap, so we know when we are in the same city: '+link;
  }
  function pidx(id){for(var k=0;k<people.length;k++)if(people[k].id===id)return k;return -1}
  function addMine(ns){people[0].stays.push(ns);var pr=api.addTrip(ns).then(function(id){ns.id=id;return id});keep(pr);return pr}
  function covered(c,a,b){return people[0].stays.some(function(s){return s.city===c&&s.a<=b&&s.b>=a})}
  var imp=null;
  var MON={gen:0,jan:0,ene:0,feb:1,fev:1,fév:1,mar:2,mär:2,mrz:2,apr:3,avr:3,abr:3,mag:4,may:4,mai:4,giu:5,jun:5,jui:5,lug:6,jul:6,ago:7,aug:7,aou:7,aoû:7,set:8,sep:8,ott:9,oct:9,okt:9,nov:10,dic:11,dec:11,déc:11,dez:11};
  function mon(w){w=String(w||'').toLowerCase().slice(0,3);if(w==='jui')return null;return MON[w]!==undefined?MON[w]:null}
  function nextDate(d,m){var y=n0.getFullYear(),x=iso(y,m,d);if(x<addDays(T,-1))x=iso(y+1,m,d);return x}
  /* "Londra 2-4 dic", "Paris 28 Dec - 2 Jan", "Ibiza 9/12-13/12", "Rome 5 dic" -> {city text, a, b} */
  function parsePlans(t){
    var out=[];
    String(t||'').split(/\n|;|,(?![^(]*\))/).forEach(function(line){
      var L=line.trim();if(!L)return;var m,a,b,rest;
      if((m=L.match(/(\d{1,2})\s*([a-zà-ü]{3,})\.?\s*(?:-|–|—|to|al|bis|au|a)\s*(\d{1,2})\s*([a-zà-ü]{3,})/i))&&mon(m[2])!==null&&mon(m[4])!==null){a=nextDate(+m[1],mon(m[2]));b=nextDate(+m[3],mon(m[4]));if(b<a)b=iso(+b.slice(0,4)+1,mon(m[4]),+m[3])}
      else if((m=L.match(/(\d{1,2})\s*(?:-|–|—|to|al|bis|au|a)\s*(\d{1,2})\s*([a-zà-ü]{3,})/i))&&mon(m[3])!==null){a=nextDate(+m[1],mon(m[3]));b=nextDate(+m[2],mon(m[3]))}
      else if(m=L.match(/(\d{1,2})[.\/](\d{1,2})(?:[.\/]\d{2,4})?\s*(?:-|–|—|to|al|bis|au|a)\s*(\d{1,2})[.\/](\d{1,2})(?:[.\/]\d{2,4})?/)){a=nextDate(+m[1],+m[2]-1);b=nextDate(+m[3],+m[4]-1)}
      else if((m=L.match(/(\d{1,2})\s*([a-zà-ü]{3,})/i))&&mon(m[2])!==null){a=b=nextDate(+m[1],mon(m[2]))}
      if(!m||!a)return;
      rest=L.replace(m[0],' ').replace(/\b(dal|dall'|al|from|to|in|a|à|en|nach|von|bis|del|le|il|the|on)\b/gi,' ').replace(/[:\-–—()]/g,' ').replace(/\s+/g,' ').trim();
      if(rest.length<2)return;
      out.push({t:rest,a:a,b:b<a?a:b});
    });
    return out;
  }
  function resolveAll(list){
    return Promise.all(list.map(function(x){return resolveCity(x.t).then(function(c){return c?{city:c,a:x.a,b:x.b,from:x.t}:null})})).then(function(r){
      return r.filter(function(x){return x&&!covered(x.city,x.a,x.b)});
    });
  }
  /* calendar events -> trips: events whose place is in another city, joined when they follow each other */
  function fromCalendar(){
    api.calendarEvents().then(function(r){
      if(!r||r.state!=='granted'){imp.list=[];imp.msg=r&&r.state==='denied'?'Overlap can’t see your calendar. You can allow it in iPhone Settings, Overlap, Calendars.':'Could not read your calendar.';renderSheet();return}
      var evs=(r.events||[]).filter(function(e){return e.location&&e.location.trim()});
      var locs={};evs.forEach(function(e){locs[e.location.trim()]=1});
      var keys=Object.keys(locs).slice(0,40);
      Promise.all(keys.map(function(k){return photonCity(k).then(function(c){locs[k]=c})})).then(function(){
        var home=people[0].home, trips=[];
        evs.forEach(function(e){
          var c=locs[e.location.trim()];if(!c||c===home)return;
          var a=e.start.slice(0,10), b=e.end.slice(0,10);
          if(e.allDay&&b>a)b=addDays(b,-1);
          if(b<a)b=a;
          var last=trips.filter(function(t){return t.city===c})[0];
          if(last&&a<=addDays(last.b,1)&&b>=addDays(last.a,-1)){if(a<last.a)last.a=a;if(b>last.b)last.b=b}
          else trips.push({city:c,a:a,b:b,from:e.title||e.location});
        });
        imp.list=trips.filter(function(t){return t.b>=T&&!covered(t.city,t.a,t.b)}).sort(function(x,y){return x.a<y.a?-1:1});
        if(!imp.list.length)imp.msg='No trips found in your calendar for the next 6 months.';
        renderSheet();
      });
    });
  }
  function photonCity(q){
    return fetch('https://photon.komoot.io/api/?q='+encodeURIComponent(q)+'&limit=1&lang=en').then(function(r){return r.json()}).then(function(j){
      var f=(j.features||[])[0];if(!f)return '';var p=f.properties||{};
      var c=p.city||(p.osm_key==='place'&&!SKIP[p.osm_value]?p.name:'')||'';
      if(c&&f.geometry&&!GEO[c]){GEO[c]=[f.geometry.coordinates[1],f.geometry.coordinates[0]];saveGeo()}
      return c;
    }).catch(function(){return ''});
  }
  /* colour palettes: each person picks their own, kept on this phone */
  var PALS={"lampone": ["Lampone", "#FFF6F9", "#FF8FB8", "#FFE14D"], "matcha": ["Matcha", "#F4F7EE", "#A8D672", "#FF9FB2"], "albicocca": ["Albicocca", "#FFF7EC", "#FFB86B", "#6FA3FF"], "cielo": ["Cielo", "#F1F7FF", "#8EC5FF", "#FF9F5A"], "sabbia": ["Sabbia", "#F6F1E8", "#F2C14E", "#3E8E63"], "fucsia": ["Fucsia", "#FFF0FA", "#FF7FD1", "#2FD9C0"], "corallo": ["Corallo", "#FFF5F0", "#FF8A65", "#4FD1C5"], "lavanda": ["Lavanda", "#F3F0FF", "#B9AEFF", "#7DDCB5"]};
  function curPal(){var p=document.documentElement.getAttribute('data-pal');return PALS[p]?p:'lampone'}
  function setPal(p){document.documentElement.setAttribute('data-pal',p);try{localStorage.setItem('ovpal',p)}catch(e){}
    var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content',PALS[p][1])}
  function palPicker(){var c=curPal();return '<label class="palsl">Colours</label><div class="pals" id="pals">'+Object.keys(PALS).map(function(k){var v=PALS[k];
    return '<button type="button" data-p="'+k+'"'+(k===c?' class="on"':'')+'><i><b style="background:'+v[2]+'"></b><b style="background:'+v[3]+'"></b></i>'+v[0]+'</button>'}).join('')+'</div>'}
  /* city from the phone's time zone (Europe/Zurich -> Zurich), no location needed */
  function tzCity(){try{var z=Intl.DateTimeFormat().resolvedOptions().timeZone||'';var c=z.split('/').pop().replace(/_/g,' ');return /^[A-Z]/.test(c)&&z.indexOf('/')>0&&!/^Etc/.test(z)?c:''}catch(e){return ''}}
  function homeList(){var t=tzCity();return (t?[t]:[]).concat(COMMON.filter(function(c){return c!==t}))}
  /* one-off: ask the phone where it is and turn that into a city name */
  function locate(btn,done){
    var e=$('err'),old=btn.textContent;
    if(!navigator.geolocation){e.textContent='Location is not available here. Tap a city instead.';return}
    btn.textContent='📍 Finding you…';
    navigator.geolocation.getCurrentPosition(function(p){
      var la=p.coords.latitude,lo=p.coords.longitude;
      fetch('https://photon.komoot.io/reverse?lat='+la+'&lon='+lo+'&lang=en').then(function(r){return r.json()}).then(function(j){
        var f=(j.features||[])[0],q=f&&f.properties||{},c=q.city||q.town||q.village||(q.osm_key==='place'?q.name:'');
        btn.textContent=old;
        if(!c){e.textContent='Could not tell your city. Tap one instead.';return}
        GEO[c]=GEO[c]||[la,lo];saveGeo();e.textContent='';done(c);
      }).catch(function(){btn.textContent=old;e.textContent='Could not tell your city. Tap one instead.'});
    },function(){btn.textContent=old;e.textContent='Location is off for Overlap. Tap a city instead.'},{timeout:10000,maximumAge:600000});
  }
  function citySug(inp,box,local,pick,loc){
    var tm=null, n=0;
    function chips(list){box.innerHTML=(loc?'<button type="button" class="loc" data-loc="1">\ud83d\udccd Use my location</button>':'')+list.slice(0,6).map(function(o){return '<button type="button" data-c="'+esc(o.c)+'"'+(fold(o.c)===fold(inp.value)?' class="on"':'')+'>'+esc(o.c)+(o.w?' <small>'+esc(o.w)+'</small>':'')+'</button>'}).join('')}
    function run(){
      var v=fold(inp.value), all=local(), exact=all.some(function(c){return fold(c)===v}), base=all.filter(function(c){return !v||exact||fold(c).indexOf(v)===0}).map(function(c){return {c:c}});
      chips(base);clearTimeout(tm);
      if(v.length<2||exact)return;
      var my=++n;
      tm=setTimeout(function(){photon(inp.value.trim(),6).then(function(r){
        if(my!==n)return;var seen={};base.forEach(function(o){seen[fold(o.c)]=1});
        chips(base.concat(r.filter(function(o){return !seen[fold(o.c)]})));
      })},250);
    }
    inp.addEventListener('input',run);
    box.onclick=function(e){var b=e.target.closest('button');if(!b)return;
      if(b.getAttribute('data-loc')){locate(b,function(c){inp.value=c;run();if(pick)pick()});return}
      inp.value=b.getAttribute('data-c');run();if(pick)pick()};
    run();
  }
  function saveTrip(){
    var c=cap($('fc').value), a=ra||'', b=rb||a;
    if(!c){$('err').textContent='Add a city.';return}
    if(!ISO.test(a)){$('err').textContent='Tap the day you arrive in the calendar.';return}
    if(!ISO.test(b)||b<a){$('err').textContent='The last day is before the first one.';return}
    var bt=$('save');
    bt.disabled=false;
    checkCity($('fc'),c,function(r){
    c=r;
    var e=emoFor(0,c), ns={city:c,a:a,b:b,e:e,note:String($('fnote').value||'').trim().slice(0,200),priv:visSel==='me',close:visSel==='close'}, old=edit!==null?people[0].stays[edit]:null;
    var inv=ns.priv?[]:wfSel.slice();wfSel=[];
    if(old){ns.id=old.id;var ei=edit;people[0].stays[ei]=ns;keep(api.updateTrip(old.id,ns));sendInvites(old.id,inv,c);
      undoToast('Trip saved',function(){var k=people[0].stays.indexOf(ns);if(k<0)return;people[0].stays[k]=old;keep(api.updateTrip(old.id,old));index();renderAll()})}
    else{
      var ron=$('frep')&&$('frep').querySelector('.on'), every=ron?+ron.getAttribute('data-r'):0;
      var made=addMine(ns);made.then(function(id){sendInvites(id,inv,c)});
      undoToast('Trip added',function(){var k=people[0].stays.indexOf(ns);if(k>=0)people[0].stays.splice(k,1);made.then(function(id){if(id)keep(api.deleteTrip(id))});index();renderAll()});
      if(every){var lim=addDays(a,92);for(var k=every;addDays(a,k)<=lim;k+=every){var cp={city:c,a:addDays(a,k),b:addDays(b,k),e:e,note:ns.note,priv:ns.priv,close:ns.close};addMine(cp)}}
    }
    pe=null;
    edit=null;index();
    selC=null;selP=null;sheet=null;selD=null;var p=parts(a);vy=p.y;vm=p.m;renderAll();
    });
  }
  /* username is required once the database has the column; returns true when nothing is left to save */
  function userOk(again){
    if(!$('fu')||!people[0].userCol)return true;
    var un=String($('fu').value||'').trim().replace(/^@/,'').toLowerCase();
    if(un===(people[0].user||'')&&un)return true;
    if(!/^[a-z0-9._]{3,20}$/.test(un)){$('err').textContent='Pick a username: 3 to 20 letters, numbers, dots or underscores.';return false}
    api.setUsername(uid,un).then(function(){people[0].user=un;again()},function(e){$('err').textContent=e&&e.code==='23505'?'@'+un+' is taken. Try another.':'Could not save the username.'});
    return false;
  }
  function saveWelcome(){
    var n=String($('fn').value||'').trim().slice(0,40), c=cap($('fw').value);
    if(!n){$('err').textContent='Add your name, so friends know who you are.';return}
    if(!c){$('err').textContent='Type your city or tap one above.';return}
    var ph=cleanPhone($('fp')&&$('fp').value);
    if(!ph||ph.replace(/\D/g,'').length<7){$('err').textContent='Add your WhatsApp number, so friends can message you.';return}
    if(!userOk(saveWelcome))return;
    checkCity($('fw'),c,function(r){
    people[0].home=r;people[0].full=n;people[0].phone=ph;keep(api.saveProfile(uid,{name:n,home:people[0].home,phone:people[0].phone}));index();sheet=null;renderAll();
    });
  }
  /* the first time someone opens the page without a home city, ask for it before anything else */
  var asked=false, ready=false;
  function welcome(){
    if(asked||!ready||(people[0].home&&people[0].full&&(people[0].user||!people[0].userCol)&&(people[0].phone||!people[0].phoneCol))||sheet)return;
    asked=true;sheet='hello';selD=null;renderSheet();
  }
  /* your plans as plain text: home base, then every upcoming trip in date order */
  var PL={
    en:{j:'Join me on Overlap',f:'',t:'My plans',h:'Home base: ',none:'No trips planned yet.',noneH:'No trips planned yet, so I am in {c}.',to:' to ',oth:'Otherwise in {c}.'},
    it:{j:'Unisciti a me su Overlap',f:'dal ',t:'I miei piani',h:'Casa: ',none:'Nessun viaggio in programma.',noneH:'Nessun viaggio in programma, quindi sono a {c}.',to:' al ',oth:'Per il resto sono a {c}.'},
    de:{j:'Komm zu mir auf Overlap',f:'',t:'Meine Pläne',h:'Zuhause: ',none:'Noch keine Reisen geplant.',noneH:'Noch keine Reisen geplant, ich bin also in {c}.',to:' bis ',oth:'Sonst bin ich in {c}.'},
    fr:{j:'Rejoins-moi sur Overlap',f:'du ',t:'Mes plans',h:'À la maison : ',none:'Aucun voyage prévu.',noneH:'Aucun voyage prévu, je suis donc à {c}.',to:' au ',oth:'Sinon je suis à {c}.'},
    es:{j:'Únete a mí en Overlap',f:'del ',t:'Mis planes',h:'Casa: ',none:'Aún no hay viajes.',noneH:'Aún no hay viajes, así que estoy en {c}.',to:' al ',oth:'El resto del tiempo estoy en {c}.'}
  };
  var plang=(function(){try{var v=localStorage.getItem('ovlang');if(PL[v])return v}catch(e){}var n=(navigator.language||'en').slice(0,2);return PL[n]?n:'en'})();
  function plainPlans(lg){
    lg=PL[lg]?lg:'en';var w=PL[lg], me=people[0];
    var mf=new Intl.DateTimeFormat(lg,{month:'short'});
    function mon(x){return mf.format(new Date(x.y,x.m,1)).replace('.','')}
    function dayY(s){var x=parts(s);return x.d+' '+mon(x)+(x.y!==n0.getFullYear()?' '+x.y:'')}
    var st=me.stays.filter(function(s){return s.b>=T}).sort(function(x,y){return x.a<y.a?-1:x.a>y.a?1:0});
    var l=[w.t];
    l.push('');
    if(!st.length)l.push(me.home?w.noneH.replace('{c}',me.home):w.none);
    st.forEach(function(s){
      var x=parts(s.a),y=parts(s.b),r;
      if(s.a===s.b)r=dayY(s.a);
      else if(x.m===y.m&&x.y===y.y)r=w.f+x.d+w.to+dayY(s.b);
      else r=w.f+(x.y===y.y?x.d+' '+mon(x):dayY(s.a))+w.to+dayY(s.b);
      l.push((s.e||emoFor(0,s.city))+' '+s.city+': '+r);
    });
    if(st.length&&me.home)l.push('',w.oth.replace('{c}',me.home));
    if(myCode)l.push('',w.j+': '+location.origin+'/?i='+encodeURIComponent(myCode));
    return l.join('\n');
  }
  $('share').onclick=function(){sheet='share';selD=null;renderSheet()};
  function saveHome(){
    var n=String($('fn').value||'').trim().slice(0,40), c=cap($('fh').value);
    if(!n){$('err').textContent='Add your name.';return}
    if(!c){$('err').textContent='Add the city where you live.';return}
    var ph=cleanPhone($('fp')&&$('fp').value);
    if(!ph||ph.replace(/\D/g,'').length<7){$('err').textContent='Add your WhatsApp number, so friends can message you.';return}
    if(!userOk(saveHome))return;
    checkCity($('fh'),c,function(r){
    people[0].home=r;people[0].full=n;people[0].phone=ph;keep(api.saveProfile(uid,{name:n,home:people[0].home,phone:people[0].phone}));index();sheet=null;renderAll();
    });
  }
  $('add').onclick=function(){sheet='add';edit=null;wfSel=[];pe=null;selD=null;ra=rb=null;ry=vy;rm=vm;if(iso(ry,rm,28)<T){ry=n0.getFullYear();rm=n0.getMonth()}renderSheet()};

  /* ---------- real data ---------- */

  function toast(t){var el=$('toast');el.textContent=t;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){el.hidden=true},2600)}
  /* a message with Undo, like Gmail: 6 seconds to take back what you just did */
  function undoToast(t,fn){var el=$('toast');el.innerHTML='<span>'+esc(t)+'</span><button type="button" class="undo">Undo</button>';el.hidden=false;clearTimeout(toast.t);
    el.querySelector('.undo').onclick=function(){el.hidden=true;clearTimeout(toast.t);fn()};toast.t=setTimeout(function(){el.hidden=true},6000)}
  /* show changes straight away; if the save fails, say so and reload what is really saved */
  function keep(p){return p.catch(function(){toast('Could not save. Check your connection.');reload()})}
  function copyText(tx,b,label){
    var done=function(){b.textContent='Copied ✓';setTimeout(function(){if(b.isConnected)b.textContent=label},1800)};
    try{navigator.clipboard.writeText(tx).then(done,function(){b.textContent='Select the text and copy'})}catch(e){b.textContent='Select the text and copy'}
  }
  var SHARE_IC='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-label="Share"><path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>';
  var DOTS_IC='<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-label="Menu"><circle cx="5" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="19" cy="12" r="2.2"/></svg>';
  var PLUS_IC='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 8v8M8 12h8"/></svg>';
  function installSteps(){
    if(api.isIOS)return '<ol class="steps"><li><span>Tap '+SHARE_IC+' at the bottom of Safari</span></li><li><span>Scroll down, tap '+PLUS_IC+' Add to Home Screen</span></li><li><span>Tap Add, then open Overlap from its icon</span></li></ol>';
    return '<ol class="steps"><li><span>Tap '+DOTS_IC+' in your browser</span></li><li><span>Tap Install app or Add to Home screen</span></li><li><span>Open Overlap from its icon</span></li></ol>';
  }

  function renderReqs(){
    $('reqs').innerHTML=requests.map(function(r){
      return '<div class="req"><span class="tx">'+esc(r.from_name)+' wants to share plans with you</span><button type="button" class="no" data-no="'+r.id+'">Not now</button><button type="button" class="yes" data-yes="'+r.id+'">Accept</button></div>';
    }).join('')+tripInv.map(function(r){var fi=-1;for(var k=1;k<people.length;k++)if(people[k].id===r.from_user)fi=k;
      return '<div class="req tinv">'+(fi>0?face(fi,30,false):'')+'<span class="tx">'+esc(String(r.from_name||'A friend').split(' ')[0])+' invites you to '+(r.emoji||emoFor(0,r.city))+' '+esc(r.city)+'<i>'+range(r.start_date,r.end_date)+'</i></span><button type="button" class="no" data-tno="'+r.id+'">Not now</button><button type="button" class="yes" data-tyes="'+r.id+'">Join</button></div>';
    }).join('')+meetups.filter(function(m){return m.status==='pending'&&m.to_user===people[0].id}).map(function(m){var k=pidx(m.from_user);if(k<1)return '';
      return '<div class="req tinv">'+face(k,30,false)+'<span class="tx">'+esc(people[k].n)+': let\u2019s meet in '+esc(m.city)+'?<i>'+day(m.day)+(m.note?' \u00b7 '+esc(m.note):'')+'</i></span><button type="button" class="no" data-mno="'+m.id+'">No</button><button type="button" class="yes" data-myes="'+m.id+'">Yes</button></div>';
    }).join('');
    renderOnb();
  }
  /* first steps for new people: where you live, a first trip, a friend */
  function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
  function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  function renderOnb(){
    var el=$('onb');if(!el)return;
    var st=[[!!people[0].home,'Set where you live','onbhome'],[people[0].stays.length>0,'Add your first trip','onbtrip'],[people.length>1,'Invite a friend','onbinv'],[!!people[0].av,'Add your photo','onbpic']];
    var done=st.filter(function(x){return x[0]}).length;
    if(done===st.length||lsGet('ov-onb-x')){el.hidden=true;el.innerHTML='';}else{
      el.hidden=false;
      el.innerHTML='<div class="onbh"><b>Get started</b><span>'+done+' of '+st.length+'</span><button type="button" class="x" id="onbx" aria-label="Close">\u00d7</button></div><div class="onbbar"><i style="width:'+Math.round(done/st.length*100)+'%"></i></div>'
        +st.map(function(x){return '<button type="button" class="onbs'+(x[0]?' ok':'')+'" id="'+x[2]+'"'+(x[0]?' disabled':'')+'><span class="ck">'+(x[0]?'\u2713':'')+'</span>'+x[1]+(x[0]?'':'<span class="go">\u203a</span>')+'</button>'}).join('');
    }
    var tip=$('ctip');
    if(tip){tip.hidden=!!lsGet('ov-tip')||people.length<2;}
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest('#onbx,#onbhome,#onbtrip,#onbinv,#onbpic,#ctipok');if(!b)return;
    if(b.id==='onbx'){lsSet('ov-onb-x','1');renderOnb()}
    else if(b.id==='onbhome'){setEdit=true;sheet='home';selD=null;renderSheet()}
    else if(b.id==='onbtrip'){openAdd(null)}
    else if(b.id==='onbinv'){sheet='invite';renderSheet()}
    else if(b.id==='onbpic'){setEdit=false;sheet='home';selD=null;renderSheet()}
    else if(b.id==='ctipok'){lsSet('ov-tip','1');renderOnb()}
  });
  $('reqs').addEventListener('click',function(e){
    var my=e.target.closest('[data-myes]'),mn=e.target.closest('[data-mno]');
    if(my||mn){var mid=(my||mn).getAttribute(my?'data-myes':'data-mno');meetups=meetups.map(function(m){if(m.id===mid)m.status=my?'yes':'no';return m}).filter(function(m){return m.status!=='no'});renderReqs();renderGrid();
      api.answerMeetup(mid,!!my).then(function(){toast(my?'See you there 🥂':'Answered')},function(){toast('Could not answer, try again.')});return}
    var ty=e.target.closest('[data-tyes]'), tn=e.target.closest('[data-tno]');
    if(ty||tn){var tid=(ty||tn).getAttribute(ty?'data-tyes':'data-tno');(ty||tn).disabled=true;tripInv=tripInv.filter(function(r){return r.id!==tid});renderReqs();api.answerTripInvite(tid,!!ty).then(function(){if(ty){toast('Added to your calendar');reload()}},function(){toast('Could not answer, try again.')});return}
    var y=e.target.closest('[data-yes]'), n=e.target.closest('[data-no]');
    if(y){y.disabled=true;api.acceptRequest(y.getAttribute('data-yes')).then(function(){toast('Friend added');reload()},function(){y.disabled=false;toast('Could not accept, try again.')})}
    if(n){var id=n.getAttribute('data-no');requests=requests.filter(function(r){return r.id!==id});renderReqs();api.ignoreRequest(id)}
  });

  /* nudge to turn alerts on, because they are what brings people back */
  var alertsHidden=false;
  try{alertsHidden=localStorage.getItem('ov-alerts-later')===T}catch(e){}
  function renderAlerts(){
    var ps=api.pushState(), el=$('alerts');
    if(alertsHidden||!(ps==='default'||ps==='install')||!people[0].home){el.hidden=true;return}
    el.hidden=false;
    el.innerHTML='<span class="tx">Get told when you overlap<i>'+(ps==='install'?'Add Overlap to your Home Screen to turn on alerts':'One alert when a friend will be in your city')+'</i></span>'
      +'<button type="button" id="aon">'+(ps==='install'?'How':'Turn on')+'</button>';
    $('aon').onclick=function(){if(ps==='install'){sheet='install';renderSheet()}else turnOnAlerts()};
  }
  function turnOnAlerts(){
    return api.enablePush().then(function(r){
      if(r==='granted')toast('Alerts on');
      else if(r==='denied'){toast('Alerts are blocked in your phone settings');try{localStorage.setItem('ov-alerts-later',T)}catch(e){}alertsHidden=true}
      renderAlerts();
    },function(){toast('Could not turn on alerts, try again.')});
  }

  /* friends switched off stay friends, but leave your calendar and overlaps (kept on this phone) */
  var allF=[], lastD=null, MUTE={};
  try{MUTE=JSON.parse(localStorage.getItem('ovmute')||'{}')||{}}catch(e){MUTE={}}
  function setMute(id,off){if(off)MUTE[id]=1;else delete MUTE[id];try{localStorage.setItem('ovmute',JSON.stringify(MUTE))}catch(e){}if(lastD)apply(lastD);renderAll()}
  /* @username: made from the first name once, changeable in settings */
  var userTried=false;
  function slug(t){return fold(t).replace(/\s+/g,'').replace(/[^a-z0-9._]/g,'').slice(0,16)}
  function autoUser(me){
    if(userTried||me.username===undefined||me.username||!me.name)return;userTried=true;
    var base=slug(String(me.name).split(' ')[0]);if(base.length<3)base=(base+'overlap').slice(0,8);
    var tries=[base,base+Math.floor(10+Math.random()*90),base+Math.floor(100+Math.random()*900)];
    (function next(i){if(i>=tries.length)return;api.setUsername(uid,tries[i]).then(function(){people[0].user=tries[i]},function(){next(i+1)})})(0);
  }
  function apply(d){
    var me=d.me;
    people[0].id=me.id;people[0].home=me.home||'';people[0].full=me.name||'';people[0].phone=me.phone||'';people[0].phoneCol=me.phone!==undefined;people[0].av=me.avatar_url||'';people[0].avCol=me.avatar_url!==undefined;people[0].stays=me.stays;
    people[0].user=me.username||'';people[0].userCol=me.username!==undefined;autoUser(me);
    myCode=me.invite_code||'';requests=d.requests;tripInv=d.tripInvites||[];guests=d.guests||[];invOk=!!d.invitesReady;meetups=d.meetups||[];closeIds=d.close||[];v10=!!d.v10;
    allF=d.friends.map(function(f){
      return {id:f.id,n:String(f.name||'Friend').trim().split(' ')[0].slice(0,20)||'Friend',full:f.name||'',home:f.home||'',phone:f.phone||'',av:f.avatar_url||'',stays:f.stays};
    });
    lastD=d;
    people=[people[0]].concat(allF.filter(function(f){return !MUTE[f.id]}));
    index();
  }
  var loading=null;
  function reload(){
    if(loading)return loading;
    loading=api.loadAll(uid).then(function(d){
      loading=null;
      var open=sheet==='add'||sheet==='home'||sheet==='hello'||sheet==='invite';
      apply(d);
      if(open){renderTop();renderReqs();renderAlerts();renderPills();renderGrid();renderList();renderFriends()}else renderAll();
    },function(){loading=null});
    return loading;
  }

  /* ---------- before signing in ---------- */

  var qs=new URLSearchParams(location.search), invite=qs.get('i')||'';
  try{if(invite)localStorage.setItem('ov-invite',invite);else invite=localStorage.getItem('ov-invite')||''}catch(e){}
  var gEmail='';try{gEmail=localStorage.getItem('ov-email')||''}catch(e){}
  var spT0=Date.now();
  function splashOff(){var sp=$('splash');if(!sp||sp.classList.contains('go'))return;setTimeout(function(){sp.classList.add('go');setTimeout(function(){sp.remove()},700)},Math.max(0,900-(Date.now()-spT0)))}
  setTimeout(splashOff,6000);
  function gate(h){splashOff();$('gate').hidden=false;$('app').hidden=true;$('gbody').innerHTML=h}
  function inviteLine(name){return name?'<div class="hd">'+esc(name)+' invited you</div><p class="hint">Overlap shows when friends will be in the same city as you. Only friends you accept see your plans.</p>':'<div class="hd">See when friends overlap</div><p class="hint">Share where you will be, and find out when friends are in the same city as you.</p>'}

  function showEmail(name){
    gate(inviteLine(name)
      +'<div class="hd">Log in or sign up</div>'
      +'<div class="f"><label for="gem">Your email</label><input id="gem" type="email" inputmode="email" autocomplete="email" autocapitalize="off" placeholder="you@email.com" enterkeyhint="go" value="'+esc(gEmail)+'"></div>'
      +'<p class="err" id="err"></p><button type="button" class="add hd" id="gsend">Send me a code</button>'
      +'<p class="hint" style="margin-top:8px">No password. We email you a code.<br>Sorry for the extra step: we just need to check it\u2019s really your email, to keep your plans private.</p>');
    var go=function(){
      var em=String($('gem').value||'').trim().toLowerCase();
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){$('err').textContent='Check your email address.';return}
      gEmail=em;try{localStorage.setItem('ov-email',em)}catch(e){}
      if(em===api.REVIEW_EMAIL){showPassword();return}
      $('gsend').disabled=true;$('gsend').textContent='Sending…';
      api.sendCode(em).then(function(){showCode()},function(e){
        $('gsend').disabled=false;$('gsend').textContent='Send me a code';
        $('err').textContent=/rate|seconds/i.test(e&&e.message||'')?'Too many tries. Wait a minute and try again.':'Could not send the code. Try again.'+(e&&e.message?' ('+String(e.message).slice(0,120)+')':'');
      });
    };
    $('gsend').onclick=go;
    $('gem').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();go()}});
  }
  function showPassword(){
    gate('<div class="hd">Test account</div><div class="f"><label for="gpw">Password</label><input id="gpw" type="password" autocomplete="current-password" enterkeyhint="go"></div>'
      +'<p class="err" id="err"></p><button type="button" class="add hd" id="gok">Sign in</button><button type="button" class="link" id="gback">Use a different email</button>');
    var go=function(){$('gok').disabled=true;api.signInPassword(gEmail,$('gpw').value).then(function(s){start(s)},function(){$('gok').disabled=false;$('err').textContent='That password did not work.'})};
    $('gok').onclick=go;$('gpw').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();go()}});
    $('gback').onclick=function(){showEmail()};
  }
  function showCode(){
    gate('<div class="hd">Check your email</div><p class="hint">We sent a code to '+esc(gEmail)+'. The newest email has the right one.</p>'
      +'<div class="f"><input id="gcode" class="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="········" aria-label="Code"></div>'
      +'<p class="err" id="err"></p><button type="button" class="add hd" id="gok">Sign in</button>'
      +'<button type="button" class="link" id="gnew">Send me a new code</button>'
      +'<button type="button" class="link" id="gback">Use a different email</button>');
    var go=function(){
      var c=String($('gcode').value||'').replace(/\D/g,'');
      if(c.length<6){$('err').textContent='Type the code from the email.';return}
      $('gok').disabled=true;
      api.verifyCode(gEmail,c).then(function(s){start(s)},function(){$('gok').disabled=false;$('err').textContent='That code did not work. Check it, or tap \u201cSend me a new code\u201d below.'});
    };
    $('gok').onclick=go;
    $('gcode').addEventListener('input',function(){if(this.value.replace(/\D/g,'').length===8)go()});
    $('gnew').onclick=function(){var b=this;b.disabled=true;b.textContent='Sending\u2026';
      api.sendCode(gEmail).then(function(){b.textContent='New code sent. Check your email';$('gcode').value='';$('err').textContent='';setTimeout(function(){b.disabled=false;b.textContent='Send me a new code'},60000)},
        function(){b.disabled=false;b.textContent='Send me a new code';$('err').textContent='Wait a minute, then try again.'})};
    $('gback').onclick=function(){showEmail(null)};
    setTimeout(function(){try{$('gcode').focus()}catch(e){}},50);
  }
  /* on iPhone, alerts only work from the Home Screen icon, so we ask people to add it first.
     Their email is kept with the invite, so the request is waiting for them inside the app. */
  function showInstall(name){
    gate(inviteLine(name)
      +'<div class="f"><label for="gem">Your email</label><input id="gem" type="email" inputmode="email" autocomplete="email" autocapitalize="off" placeholder="you@email.com" value="'+esc(gEmail)+'"></div>'
      +'<p class="err" id="err"></p><button type="button" class="add hd" id="gnext">Next</button>');
    $('gnext').onclick=function(){
      var em=String($('gem').value||'').trim().toLowerCase();
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){$('err').textContent='Check your email address.';return}
      gEmail=em;try{localStorage.setItem('ov-email',em)}catch(e){}
      var after=function(){
        if(api.TESTFLIGHT){
          gate('<div class="hd">Get the Overlap app</div><p class="hint">Overlap is in testing, so it installs through TestFlight, Apple\u2019s app for trying new apps.</p>'
            +'<ol class="steps"><li><span>Tap the button below and install TestFlight</span></li><li><span>Come back to the same link and tap Install</span></li><li><span>Open Overlap and sign in with '+esc(em)+'</span></li></ol>'
            +'<a class="add hd" style="display:flex;align-items:center;justify-content:center;text-decoration:none;margin-top:8px" href="'+esc(api.TESTFLIGHT)+'" target="_blank" rel="noopener">Get Overlap</a>'
            +'<button type="button" class="link" id="gweb">Use it in the browser instead</button>');
          $('gweb').onclick=function(){showEmail(name)};
          return;
        }
        gate('<div class="hd">Add Overlap to your Home Screen</div><p class="hint">So it opens like an app and can tell you when you overlap.</p>'+installSteps()
          +'<p class="hint" style="margin-top:10px">Then open it from the icon and sign in with '+esc(em)+'.</p>'
          +'<button type="button" class="link" id="gweb">Continue in the browser instead</button>');
        $('gweb').onclick=function(){showEmail(name)};
      };
      if(invite){$('gnext').disabled=true;api.requestByCode(invite,em).then(after,after)}else after();
    };
  }

  /* ---------- start ---------- */

  function start(s){
    uid=s.user.id;
    if(!booted){booted=true;api.watch(reload);document.addEventListener('visibilitychange',function(){if(!document.hidden)reload()})}
    var acc=invite?api.acceptCode(invite).catch(function(){}):Promise.resolve();
    return acc.then(function(){try{localStorage.removeItem('ov-invite')}catch(e){}invite='';return api.loadAll(uid)}).then(function(d){
      apply(d);
      $('gate').hidden=true;$('app').hidden=false;
      var d0=qs.get('d');if(d0&&ISO.test(d0)){var p=parts(d0);vy=p.y;vm=p.m}
      if(location.search)history.replaceState(null,'','/');
      renderAll();
      ready=true;splashOff();welcome();
      if(qs.get('add')==='1'&&!sheet&&people[0].home)$('add').click();
      api.syncPush().then(function(){renderAlerts();if(sheet==='home')renderSheet()},function(){});
    },function(){gate('<div class="hd">Could not load Overlap</div><p class="hint">Check your connection and try again.</p><button type="button" class="add hd" id="gretry">Try again</button>');$('gretry').onclick=function(){location.reload()}});
  }
  function boot(){
    if(!api.configured){gate('<div class="hd">Almost there</div><p class="hint">Overlap is not connected to its database yet. Follow SETUP.md.</p>');return}
    if(!api.native&&'serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(function(){});
    api.session().then(function(s){
      if(s)return start(s);
      var nm=invite?api.inviteName(invite):Promise.resolve(null);
      nm.then(function(name){
        if(api.isIOS&&!api.standalone)showInstall(name);else showEmail(name);
      });
    });
  }

  /* Safari zooms into any field whose text renders under 16px on screen. Scale field text so it never does. */
  function fit(){
    var o=window.orientation,land=(screen.orientation&&/landscape/.test(screen.orientation.type))||o===90||o===-90;
    var sw=land?Math.max(screen.width,screen.height):Math.min(screen.width,screen.height);
    var ratio=sw&&window.innerWidth>sw?window.innerWidth/sw:1;
    var inp=Math.min(26,Math.ceil(17*ratio));
    document.documentElement.style.setProperty('--inp',inp+'px');
    document.documentElement.style.setProperty('--ps',(12.5/inp).toFixed(3));
  }
  fit();window.addEventListener('resize',fit);window.addEventListener('orientationchange',fit);

  function renderAll(){renderTop();renderReqs();renderAlerts();renderTabs();renderOverlaps();renderPills();renderGrid();renderList();renderFriends();renderSheet()}
  $('keyh').innerHTML=HEART;
  boot();
