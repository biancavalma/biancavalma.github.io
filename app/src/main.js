import './style.css';
import * as api from './api.js';

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
    if(x.m===y.m&&x.y===y.y)return x.d+' to '+y.d+' '+M3[x.m];
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
    if(i===0)return '<svg role="img" aria-label="You" width="'+size+'" height="'+size+'" viewBox="0 0 40 40" style="flex:none;display:block">'
      +'<circle cx="20" cy="20" r="'+(ring?18.5:20)+'" fill="#B9AEFF"'+(ring?' stroke="var(--ring)" stroke-width="3"':'')+'/>'
      +'<circle cx="14" cy="18" r="2.6" fill="#2A2350"/><circle cx="26" cy="18" r="2.6" fill="#2A2350"/>'
      +'<path d="M14 24.5c2 3 10 3 12 0" fill="none" stroke="#2A2350" stroke-width="2.6" stroke-linecap="round"/>'
      +'<circle cx="9.5" cy="23" r="2.6" fill="#8B7CF6" opacity=".6"/><circle cx="30.5" cy="23" r="2.6" fill="#8B7CF6" opacity=".6"/></svg>';
    var t=lab(i);
    return '<svg role="img" aria-label="'+esc(people[i].n)+'" width="'+size+'" height="'+size+'" viewBox="0 0 40 40" style="flex:none;display:block">'
      +'<circle cx="20" cy="20" r="'+(ring?18.5:20)+'" fill="'+COL[i%COL.length]+'"'+(ring?' stroke="var(--ring)" stroke-width="3"':'')+'/>'
      +'<text x="20" y="'+(t.length>1?26.5:27.5)+'" text-anchor="middle" font-family="Fredoka,Nunito,sans-serif" font-weight="600" font-size="'+(t.length>1?18:22)+'" fill="#2A2350">'+esc(t)+'</text></svg>';
  }
  var HEART='<svg width="12" height="12" viewBox="0 0 24 24" fill="#2A2350" aria-hidden="true"><path d="M12 21s-8-5.2-8-11.2A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 8 2.8C20 15.8 12 21 12 21z"/></svg>';

  var n0=new Date(), T=iso(n0.getFullYear(),n0.getMonth(),n0.getDate());
  var tab='ov', selC=null, selP=null, selD=null, q='', vy=n0.getFullYear(), vm=n0.getMonth(), sheet=null, trip=null;
  var saved=true, UP=[], uid=null, myCode='', requests=[], booted=false;

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
    return selC?where(p,d)===selC:!!tripAt(p,d);
  }
  /* a day counts as an overlap when you and a friend are in the same city and at least one of you travelled */
  function hit(d){
    var L=where(0,d);if(!L||(selC&&L!==selC))return false;
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

  function renderTop(){
    $('me').innerHTML=face(0,36,false)+'<span><b>This is you</b><i>'+(people[0].home?esc(people[0].home)+' home base':'Set home base')+'</i></span>';
    $('note').textContent='Only friends you accept see your plans.';
  }
  $('me').onclick=function(){sheet='home';selD=null;renderSheet()};

  function renderTabs(){
    ['ov','cal','fr'].forEach(function(t){$('t-'+t).className='tab'+(tab===t?' on':'');$('v-'+t).hidden=tab!==t});
  }
  $('t-ov').onclick=function(){tab='ov';renderAll()};

  /* the overlap feed: every run of days in the next 6 months where a friend and you are in the same city and one of you travels */
  var WA='<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.4.1.1.1.7-.1 1.3z"/></svg>';
  function overlaps(){
    var runs=[], open={}, d=T, end=iso(n0.getFullYear(),n0.getMonth()+6,n0.getDate());
    while(d<=end){
      var L=where(0,d);
      for(var f=1;f<people.length;f++){
        var k=f+'|'+L, ok=L&&where(f,d)===L&&(tripAt(0,d)||tripAt(f,d));
        if(ok){ if(open[k]&&open[k].b===prev(d))open[k].b=d; else {open[k]={p:f,city:L,a:d,b:d,home:!tripAt(0,d)};runs.push(open[k])} }
      }
      d=next(d);
    }
    return runs.sort(function(x,y){return x.a<y.a?-1:x.a>y.a?1:0});
  }
  /* first guesses for the welcome screen: the name from the sign-in email, the city from the phone's time zone */
  function guessName(){
    var u=String(gEmail||'').split('@')[0].replace(/[0-9_]+/g,' ').split(/[.\-\s]+/).filter(function(w){return w.length>1}).slice(0,2);
    return u.map(function(w){return w.charAt(0).toUpperCase()+w.slice(1)}).join(' ');
  }
  function guessCity(){
    try{var z=Intl.DateTimeFormat().resolvedOptions().timeZone||'';var c=z.split('/').pop().replace(/_/g,' ');return /^[A-Za-z ]+$/.test(c)&&z.indexOf('/')>0&&!/^(UTC|GMT)/.test(z)?c:''}catch(e){return ''}
  }
  function cleanPhone(v){v=String(v||'').trim();var plus=v.charAt(0)==='+';v=v.replace(/\D/g,'');if(!v)return '';if(!plus&&v.indexOf('00')===0)v=v.slice(2);return '+'+v.slice(0,15)}
  function prev(s){var p=parts(s),x=new Date(p.y,p.m,p.d-1,12);return iso(x.getFullYear(),x.getMonth(),x.getDate())}
  function waText(r){
    var who=people[r.p].n;
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
        var em=emoFor(r.p,r.city);
        h+='<div class="ovc">'+face(r.p,40,false)+'<span class="tx"><b>'+esc(people[r.p].n)+' \u00b7 '+em+' '+esc(r.city)+'</b><i>'+range(r.a,r.b)+(r.home?', in your city':', with you')+'</i></span>'
          +'<a class="wa" href="https://wa.me/'+(people[r.p].phone||'').replace(/\D/g,'')+'?text='+encodeURIComponent(waText(r))+'" target="_blank" rel="noopener">'+WA+'Message</a></div>';
      });
    }
    $('ovlist').innerHTML=h;
    if($('ovinv'))$('ovinv').onclick=function(){sheet='invite';renderSheet()};
  }
  $('ovlist').addEventListener('click',function(e){if(e.target.closest('[data-home]')){sheet='home';renderSheet()}});
  $('add2').onclick=function(){$('add').click()};
  $('ovlist').addEventListener('click',function(e){var a=e.target.closest('a.wa');if(a&&api.native){e.preventDefault();api.openExternal(a.href)}});
  $('t-cal').onclick=function(){tab='cal';renderAll()};
  $('t-fr').onclick=function(){tab='fr';renderAll()};

  var cq='';
  function renderPills(){
    var h='', c='', cs=cities(), v=cq.toLowerCase();
    if(selC&&cs.indexOf(selC)<0)selC=null;
    if(selP!==null)h+='<button type="button" class="pillb who on" data-x="1" aria-label="Stop showing only '+esc(people[selP].n)+'">'+face(selP,24,false)+esc(people[selP].n)+' ×</button>';
    h+='<button type="button" class="pillb'+(selC?'':' on')+'" data-c="">All</button>';
    cs.forEach(function(k){if(!v||k.toLowerCase().indexOf(v)>=0||k===selC)c+='<button type="button" class="pillb city'+(selC===k?' on':'')+'" data-c="'+esc(k)+'">'+esc(k)+'</button>'});
    if(!c)c='<span class="pillb city" style="background:transparent;color:var(--soft)">No city yet</span>';
    $('pa').innerHTML=h;$('pc').innerHTML=c;
  }
  $('cq').addEventListener('input',function(){cq=this.value.trim();renderPills()});
  $('cq').addEventListener('keydown',function(e){if(e.key==='Enter')this.blur()});
  $('pills').addEventListener('click',function(e){
    var b=e.target.closest('button.pillb');if(!b)return;
    if(b.getAttribute('data-x')){selP=null}
    else{var c=b.getAttribute('data-c')||null;selC=selC===c?null:c;if(selC)jump()}
    selD=null;renderAll();
  });

  function renderGrid(){
    $('mlabel').textContent=MN[vm]+' '+vy;
    var far=vy!==n0.getFullYear()||vm!==n0.getMonth();
    $('tod').hidden=!far;$('mlabel').parentNode.classList.toggle('far',far);
    var lead=(new Date(vy,vm,1).getDay()+6)%7, n=new Date(vy,vm+1,0).getDate(), h='', i, p;
    for(i=0;i<lead;i++)h+='<span></span>';
    for(i=1;i<=n;i++){
      var d=iso(vy,vm,i), who=[], col=(lead+i-1)%7, bar='';
      /* with no filter on, a friend only appears on days you are in the same city and one of you travelled */
      var L0=where(0,d);
      if(d>=T)for(p=1;p<people.length;p++){
        if(selP===null&&!selC){if(L0&&where(p,d)===L0&&(tripAt(0,d)||tripAt(p,d)))who.push(p)}
        else if(shows(p,d))who.push(p);
      }
      var st=d>=T&&shows(0,d)?stayAt(0,d):null;
      if(st){who.unshift(0);bar='<span class="cn">'+esc(st.city)+'</span>'}
      else if(selP&&who.length)bar='<span class="cn">'+esc(where(selP,d)||'')+'</span>';
      var cls='cell'+(d<T?' past':'')+(d===T?' today':'')+(d>=T&&hit(d)?' hit':'')+(d===selD?' sel':'');
      h+='<button type="button" class="'+cls+'" data-d="'+d+'"><span class="n">'+i+'</span><span class="faces">';
      who.slice(0,who.length>3?2:3).forEach(function(x){h+=x===0&&st?'<span class="em" role="img" aria-label="You">'+(st.e||emoFor(0,st.city))+'</span>':face(x,who.length>3?16:who.length>2?17:20,true)});
      if(who.length>3)h+='<span class="more">+'+(who.length-2)+'</span>';
      h+='</span>'+bar+'</button>';
    }
    $('grid').innerHTML=h;
  }
  $('grid').addEventListener('click',function(e){
    var c=e.target.closest('.cell');if(!c)return;
    selD=c.getAttribute('data-d');sheet='day';renderGrid();renderSheet();
  });
  function move(k){vm+=k;if(vm<0){vm=11;vy--}if(vm>11){vm=0;vy++}selD=null;renderGrid();renderList()}
  $('tod').onclick=function(){vy=n0.getFullYear();vm=n0.getMonth();selD=null;renderGrid();renderList()};
  $('prev').onclick=function(){move(-1)};$('nextm').onclick=function(){move(1)};

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
      title='Who’s tripping in '+MN[vm]+'?';
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
      else{a=esc(people[s.p].n);b=ec(s.p,s.city,so)+', '+range(s.a,s.b)}
      h+=row(s.p,a,b,'data-p="'+s.p+'" data-i="'+s.i+'"',shared(s));
    });
    LT=title;LB=h;cnt+=st.length;
    $('list').innerHTML='<button type="button" class="row" data-open="1"><span class="hd" style="flex:1;margin:0;font-size:16.5px;line-height:1.2">'+title+'</span><span class="cnt">'+cnt+' ›</span></button>';
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
      h+='<button type="button" class="fcard" data-p="'+i+'">'+face(i,46,false)+'<span class="tx"><span><span class="hd" style="display:block">'+esc(p.n)+'</span><i>'+esc(status(i))+'</i></span><span class="pl">';
      st.forEach(function(s){var w=shared(s);h+='<span'+(w?' class="hit"':'')+'>'+(w?HEART:'')+esc(s.city)+', '+range(s.a,s.b)+'</span>'});
      h+='</span></span></button>';
    });
    if(people.length<2)h='<div class="card list"><div class="hd">No friends here yet</div><p class="hint">People whose plans you can see show up here, with where they are and where they are going next.</p></div>';
    $('friends').innerHTML=h||'<p class="empty">No friend or city matches that.</p>';
  }
  var selF=null;
  $('friends').addEventListener('click',function(e){
    var c=e.target.closest('.fcard');if(!c)return;
    selF=+c.getAttribute('data-p');sheet='friend';selD=null;renderSheet();
  });
  $('invite').onclick=function(){sheet='invite';selD=null;renderSheet()};
  $('q').addEventListener('input',function(){q=this.value.trim();renderFriends()});
  $('q').addEventListener('keydown',function(e){if(e.key==='Enter')this.blur()});

  function close(){sheet=null;selD=null;trip=null;edit=null;selF=null;renderGrid();renderSheet()}
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
          h+='<button type="button" class="row mine" id="mine">'+face(0,36,false)+'<span class="tx"><b>You</b><i>'+(away?ec(0,c,stayAt(0,selD)):esc(c)+', home')+'</i></span><span class="edt">'+(away?'Edit ›':'+ Add trip')+'</span></button>';
          return;
        }
        h+='<div class="row">'+face(i,36,false)+'<span class="tx"><b>'+esc(x.n)+'</b><i>'+(away?ec(i,c,stayAt(i,selD)):esc(c)+', home')+'</i></span>'+(w?'<span class="tag">'+HEART+'with you</span>':'')+'</div>';
      });
      if(!where(0,selD)&&selD>=T)h+='<button type="button" class="ghost" id="mine" style="margin-top:4px">Add a trip from this day</button>';
      else if(!any)h+='<p class="empty">Nobody has shared plans for this day.</p>';
    }else if(sheet==='mineday'){
      var hs=people[0].home;
      h+=head('You on '+day(selD))
        +'<p class="hint">You are at home in '+esc(hs)+' this day.</p>'
        +'<button type="button" class="add hd" id="trip1">Add a trip from this day</button>'
        +'<button type="button" class="ghost" id="home1">Change home city</button>';
    }else if(sheet==='list'){
      h+=head(LT)+LB;
    }else if(sheet==='add'){
      h+=head(edit!==null?'Edit your trip':'Where will you be?')
        +'<div class="f"><label for="fc">City</label><input id="fc" type="text" maxlength="30" placeholder="Florence" autocomplete="off" autocapitalize="words"><div class="sug" id="sug"></div>'
        +'<p class="when" id="when"></p><div class="pk"><div class="pkh"><button type="button" id="pkp" aria-label="Previous month"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button><div class="hd" id="pkl"></div><button type="button" id="pkn" aria-label="Next month"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button></div><div class="pkg" id="pkg"></div></div>'
        +'<p class="err" id="err"></p><button type="button" class="add hd" id="save">'+(edit!==null?'Save changes':'Add to my calendar')+'</button>'
        +(edit!==null?calLinks(people[0].stays[edit])+'<button type="button" class="ghost" id="del">Remove this trip</button>':'')+'</div>';
    }else if(sheet==='hello'){
      h+='<div class="shd"><span></span><button type="button" class="x" id="x" aria-label="Close">×</button></div>'
        +'<div class="wel">'+document.querySelector('.brand svg').outerHTML+'<div class="hd">Welcome to Overlap</div><p class="hint">Tell friends who you are and which city you live in. You show up there every day, and any trip you add takes over while you travel.</p></div>'
        +'<div class="f"><label for="fn">Your name</label><input id="fn" type="text" maxlength="40" placeholder="Bianca" autocomplete="given-name" autocapitalize="words" value="'+esc(people[0].full||guessName())+'"><label for="fp">WhatsApp number</label><input id="fp" type="tel" inputmode="tel" maxlength="20" placeholder="+41 79 123 45 67" autocomplete="tel" value="'+esc(people[0].phone||'')+'"><label for="fw">Your city</label><input id="fw" type="text" maxlength="30" placeholder="Zurich" autocomplete="off" autocapitalize="words" enterkeyhint="done" value="'+esc(guessCity())+'"><button type="button" class="link" id="gps" style="margin:6px 2px 0;font-size:13.5px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true" style="vertical-align:-2px"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg> Use my location</button><div class="sug" id="wsug"></div>'
        +'<p class="err" id="err"></p><button type="button" class="add hd" id="savew">Start</button></div>';
    }else if(sheet==='share'){
      h+=head('Your plans as text')
        +'<p class="hint">Copy it and paste it into any chat, for friends who are not on Overlap.</p>'
        +'<textarea class="ptx" id="ptx" readonly></textarea>'
        +'<button type="button" class="add hd" id="copy" style="margin-top:8px">Copy text</button>'
        +(navigator.share?'<button type="button" class="ghost" id="nshare">Send with…</button>':'');
    }else if(sheet==='invite'){
      h+=head('Invite a friend')
        +'<p class="hint">Send your personal link. When they join, you see each other\u2019s plans. People you invite never see each other unless they are friends too.</p>'
        +'<div class="f"><input id="ilink" type="text" readonly aria-label="Your invite link"></div>'
        +'<button type="button" class="add hd" id="icopy">Copy link</button>'
        +(navigator.share?'<button type="button" class="ghost" id="ishare">Send with\u2026</button>':'')
        +'<div class="sep"></div><div class="f"><label for="iem">Or add them by email</label><input id="iem" type="email" inputmode="email" autocomplete="off" autocapitalize="off" placeholder="friend@email.com" enterkeyhint="send"></div>'
        +'<p class="err" id="err"></p><button type="button" class="ghost" id="isend">Send request</button>';
    }else if(sheet==='friend'){
      var fr=people[selF];
      h+=head(esc(fr?fr.full||fr.n:''))
        +'<div class="row">'+face(selF,46,false)+'<span class="tx"><b>'+esc(fr?fr.n:'')+'</b><i>'+esc(fr?status(selF):'')+'</i></span></div>'
        +'<button type="button" class="add hd" id="fsee">See their plans</button>'
        +'<button type="button" class="ghost danger" id="unf">Stop sharing with '+esc(fr?fr.n:'')+'</button>';
    }else if(sheet==='install'){
      h+=head('Add Overlap to your Home Screen')+installSteps()
        +'<p class="hint" style="margin-top:8px">Then open Overlap from its icon. Alerts only work from there.</p>'
        +'<button type="button" class="add hd" id="ok">Got it</button>';
    }else if(sheet==='home'){
      var ps=api.pushState();
      h+=head('Your settings')
        +'<div class="f"><label for="fn">Your name</label><input id="fn" type="text" maxlength="40" placeholder="Bianca" autocomplete="given-name" autocapitalize="words" value="'+esc(me.full||'')+'">'
        +'<label for="fp">WhatsApp number</label><input id="fp" type="tel" inputmode="tel" maxlength="20" placeholder="+41 79 123 45 67" autocomplete="tel" value="'+esc(me.phone||'')+'"><label for="fh">Where you live</label><input id="fh" type="text" maxlength="30" placeholder="Zurich" autocomplete="off" autocapitalize="words" value="'+esc(me.home)+'">'
        +'<p class="hint" style="margin-top:8px">You show up here every day. Add a trip whenever you travel and it takes over for those days.</p>'
        +'<p class="err" id="err"></p><button type="button" class="add hd" id="saveh">Save</button></div>'
        +'<div class="sep"></div>'
        +'<div class="frow"><span class="tx">Overlap alerts<i style="display:block;font-style:normal;font-weight:600;font-size:12.5px;color:var(--soft)">'+(ps==='granted'?'On for this phone':ps==='denied'?'Blocked in your phone settings':ps==='install'?'Add Overlap to your Home Screen first':ps==='unsupported'?'Not available in this browser':'Off')+'</i></span>'
        +(ps==='granted'?'<button type="button" id="poff">Turn off</button>':ps==='default'?'<button type="button" id="pon">Turn on</button>':ps==='install'?'<button type="button" id="phow">How</button>':'')+'</div>'
        +'<button type="button" class="ghost" id="out">Sign out</button>'
        +'<button type="button" class="link danger" id="delme">Delete my account</button>';
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
    if(sheet==='mineday'){
      $('trip1').onclick=function(){openAdd(selD)};
      $('home1').onclick=function(){sheet='home';renderSheet()};
    }
    if(sheet==='add'){
      if(edit!==null&&me.stays[edit])$('fc').value=me.stays[edit].city;
      $('save').onclick=saveTrip;renderSug();renderPick();
      $('pkp').onclick=function(){rm--;if(rm<0){rm=11;ry--}renderPick()};
      $('pkn').onclick=function(){rm++;if(rm>11){rm=0;ry++}renderPick()};
      $('pkg').onclick=function(e){
        var b=e.target.closest('button');if(!b||b.disabled)return;
        var d=b.getAttribute('data-d');
        if(!ra||rb||d<ra){ra=d;rb=null}else{rb=d}
        $('err').textContent='';renderPick();
      };
      $('fc').addEventListener('input',renderSug);
      $('sug').onclick=function(e){var b=e.target.closest('button');if(!b)return;$('fc').value=b.getAttribute('data-c');$('err').textContent='';renderSug()};
    }
    if(sheet==='home'){
      $('saveh').onclick=saveHome;
      if($('pon'))$('pon').onclick=function(){turnOnAlerts().then(function(){renderSheet()})};
      if($('poff'))$('poff').onclick=function(){api.disablePush().then(function(){toast('Alerts off');renderAll()})};
      if($('phow'))$('phow').onclick=function(){sheet='install';renderSheet()};
      $('delme').onclick=function(){
        var b=this;
        if(!b.dataset.sure){b.dataset.sure='1';b.textContent='Tap again to delete your account and all your plans';return}
        b.disabled=true;
        api.deleteAccount().then(function(){try{localStorage.clear()}catch(e){}location.replace('/')},function(){b.disabled=false;toast('Could not delete, try again.')});
      };
      $('out').onclick=function(){api.disablePush().catch(function(){}).then(api.signOut).then(function(){location.replace('/')})};
    }
    if(sheet==='invite'){
      var link=location.origin+'/?i='+encodeURIComponent(myCode);
      $('ilink').value=link;
      $('icopy').onclick=function(){copyText(link,this,'Copy link')};
      if($('ishare'))$('ishare').onclick=function(){try{navigator.share({title:'Overlap',text:'Join me on Overlap, so we know when we are in the same city:',url:link}).catch(function(){})}catch(e){}};
      $('isend').onclick=function(){
        var em=String($('iem').value||'').trim();
        if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){$('err').textContent='Check the email address.';return}
        var b=this;b.disabled=true;
        api.requestByEmail(em).then(function(){$('iem').value='';b.disabled=false;toast('Request sent. They see it when they sign in.')},function(){b.disabled=false;$('err').textContent='Could not send that request.'});
      };
    }
    if(sheet==='friend'){
      $('unf').onclick=function(){
        var f=people[selF];if(!f)return;
        if(!this.dataset.sure){this.dataset.sure='1';this.textContent='Tap again to stop sharing with '+f.n;return}
        api.unfriend(f.id).then(function(){close();reload()},function(){toast('Could not remove, try again.')});
      };
      $('fsee').onclick=function(){var i=selF;sheet=null;selP=i;selC=null;selD=null;tab='cal';jump();renderAll();window.scrollTo(0,0)};
    }
    if(sheet==='install')$('ok').onclick=close;
    if(sheet==='share'){
      var tx=plainPlans();$('ptx').value=tx;
      $('copy').onclick=function(){
        var b=this,done=function(){b.textContent='Copied ✓';setTimeout(function(){if(b.isConnected)b.textContent='Copy text'},1800)};
        var old=function(){var t=$('ptx');t.focus();t.select();t.setSelectionRange(0,tx.length);var ok=false;try{ok=document.execCommand('copy')}catch(e){}t.blur();if(ok)done();else b.textContent='Select the text above and copy'};
        try{navigator.clipboard.writeText(tx).then(done,old)}catch(e){old()}
      };
      if($('nshare'))$('nshare').onclick=function(){try{navigator.share({title:'My plans',text:tx}).catch(function(){})}catch(e){}};
    }
    if(sheet==='hello'){
      var ws=function(){var v=$('fw').value.trim().toLowerCase();$('wsug').innerHTML=COMMON.filter(function(c){return !v||c.toLowerCase().indexOf(v)===0}).slice(0,6).map(function(c){return '<button type="button" data-c="'+esc(c)+'">'+esc(c)+'</button>'}).join('')};
      ws();$('fw').addEventListener('input',function(){$('err').textContent='';ws()});
      $('gps').onclick=function(){
        var b=this;if(!navigator.geolocation){b.textContent='Location not available here';return}
        b.textContent='Finding you…';
        navigator.geolocation.getCurrentPosition(function(p){
          fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en&latitude='+p.coords.latitude+'&longitude='+p.coords.longitude)
            .then(function(r){return r.json()}).then(function(j){var c=j.city||j.locality||'';if(c){$('fw').value=cap(c);ws();b.textContent='Found you ✓'}else b.textContent='City not found, type it'},function(){b.textContent='City not found, type it'});
        },function(){b.textContent='Location is off, type your city'},{timeout:10000,maximumAge:600000});
      };
      $('fw').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();saveWelcome()}});
      $('wsug').onclick=function(e){var b=e.target.closest('button');if(!b)return;$('fw').value=b.getAttribute('data-c');$('err').textContent='';ws()};
      $('savew').onclick=saveWelcome;
    }
    if(sheet==='add'&&$('del'))$('del').onclick=function(){var s=people[0].stays.splice(edit,1)[0];if(s&&s.id)keep(api.deleteTrip(s.id));edit=null;index();close();renderAll()};
  }
  /* suggestions: your own past cities first, then where friends are going, then a few common ones */
  var COMMON=['Florence','Milan','London','Paris','Rome','Barcelona','Lisbon','Munich'];
  var pe=null;
  function renderSug(){
    var el=$('sug');if(!el)return;
    var v=$('fc').value.trim().toLowerCase(), count={}, list=[], seen={};
    people[0].stays.forEach(function(s){if(!count[s.city]){count[s.city]=0;list.push(s.city)}count[s.city]++});
    list.sort(function(x,y){return count[y]-count[x]});
    UP.forEach(function(s){if(s.p>0)list.push(s.city)});
    list=list.concat(COMMON).filter(function(c){
      var k=c.toLowerCase();
      if(seen[k]||c===people[0].home||k===v||(v&&k.indexOf(v)!==0))return false;
      seen[k]=1;return true;
    }).slice(0,5);
    el.innerHTML=list.map(function(c){return '<button type="button" data-c="'+esc(c)+'">'+esc(c)+'</button>'}).join('');
  }
  /* one calendar for both dates: first tap is the arrival, second tap is the last day */
  var ra=null, rb=null, ry=n0.getFullYear(), rm=n0.getMonth(), edit=null;
  /* tapping your own day opens the same calendar, already filled in, so a trip can be moved, renamed or removed */
  /* add a trip to the phone's own calendar: Google Calendar link, or an .ics file for Apple and Outlook */
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
    sheet='add';renderSheet();
  }
  function openAdd(d){
    edit=null;trip=null;pe=null;ra=d&&d>=T?d:null;rb=null;
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
      h+='<button type="button" data-d="'+d+'"'+(cls.length?' class="'+cls.join(' ')+'"':'')+(d<T?' disabled':'')+'>'+i+'</button>';
    }
    $('pkg').innerHTML=h;$('pkl').textContent=MN[rm]+' '+ry;
    $('pkp').disabled=ry===n0.getFullYear()&&rm===n0.getMonth();
    $('when').textContent=!ra?'Tap the day you arrive, then your last day':!rb?'From '+day(ra)+'. Now tap your last day':range(ra,rb);
  }
  function known(c){return cities().filter(function(k){return k.toLowerCase()===c.toLowerCase()})[0]||c}
  function saveTrip(){
    var c=cap($('fc').value), a=ra||'', b=rb||a;
    if(!c){$('err').textContent='Add a city.';return}
    if(!ISO.test(a)){$('err').textContent='Tap the day you arrive in the calendar.';return}
    if(!ISO.test(b)||b<a){$('err').textContent='The last day is before the first one.';return}
    c=known(c);
    var e=emoFor(0,c), ns={city:c,a:a,b:b,e:e}, old=edit!==null?people[0].stays[edit]:null;
    if(old){ns.id=old.id;people[0].stays[edit]=ns;keep(api.updateTrip(old.id,ns))}
    else{people[0].stays.push(ns);keep(api.addTrip(ns).then(function(id){ns.id=id}))}
    pe=null;
    edit=null;index();
    selC=null;selP=null;sheet=null;selD=null;var p=parts(a);vy=p.y;vm=p.m;renderAll();window.scrollTo(0,0);
  }
  function saveWelcome(){
    var n=String($('fn').value||'').trim().slice(0,40), c=cap($('fw').value);
    if(!n){$('err').textContent='Add your name, so friends know who you are.';return}
    if(!c){$('err').textContent='Type your city or tap one above.';return}
    people[0].home=known(c);people[0].full=n;
    people[0].phone=cleanPhone($('fp')&&$('fp').value);keep(api.saveProfile(uid,{name:n,home:people[0].home,phone:people[0].phone}));index();sheet=null;renderAll();window.scrollTo(0,0);
  }
  /* the first time someone opens the page without a home city, ask for it before anything else */
  var asked=false, ready=false;
  function welcome(){
    if(asked||!ready||(people[0].home&&people[0].full)||sheet)return;
    asked=true;sheet='hello';selD=null;renderSheet();
  }
  /* your plans as plain text: home base, then every upcoming trip in date order */
  function dayY(s){var x=parts(s);return x.d+' '+M3[x.m]+(x.y!==n0.getFullYear()?' '+x.y:'')}
  function plainPlans(){
    var me=people[0], st=me.stays.filter(function(s){return s.b>=T}).sort(function(x,y){return x.a<y.a?-1:x.a>y.a?1:0});
    var l=['My plans'];
    if(me.home)l.push('Home base: '+me.home);
    l.push('');
    if(!st.length)l.push(me.home?'No trips planned yet, so I am in '+me.home+'.':'No trips planned yet.');
    st.forEach(function(s){
      var x=parts(s.a),y=parts(s.b),r;
      if(s.a===s.b)r=dayY(s.a);
      else if(x.m===y.m&&x.y===y.y)r=x.d+' to '+dayY(s.b);
      else r=(x.y===y.y?x.d+' '+M3[x.m]:dayY(s.a))+' to '+dayY(s.b);
      l.push((s.e||emoFor(0,s.city))+' '+s.city+': '+r);
    });
    if(st.length&&me.home)l.push('','Otherwise in '+me.home+'.');
    return l.join('\n');
  }
  $('share').onclick=function(){sheet='share';selD=null;renderSheet()};
  function saveHome(){
    var n=String($('fn').value||'').trim().slice(0,40), c=cap($('fh').value);
    if(!n){$('err').textContent='Add your name.';return}
    if(!c){$('err').textContent='Add the city where you live.';return}
    people[0].home=known(c);people[0].full=n;
    people[0].phone=cleanPhone($('fp')&&$('fp').value);keep(api.saveProfile(uid,{name:n,home:people[0].home,phone:people[0].phone}));index();sheet=null;renderAll();
  }
  $('add').onclick=function(){sheet='add';edit=null;pe=null;selD=null;ra=rb=null;ry=vy;rm=vm;if(iso(ry,rm,28)<T){ry=n0.getFullYear();rm=n0.getMonth()}renderSheet()};

  /* ---------- real data ---------- */

  function toast(t){var el=$('toast');el.textContent=t;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){el.hidden=true},2600)}
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
    }).join('');
  }
  $('reqs').addEventListener('click',function(e){
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

  function apply(d){
    var me=d.me;
    people[0].id=me.id;people[0].home=me.home||'';people[0].full=me.name||'';people[0].phone=me.phone||'';people[0].stays=me.stays;
    myCode=me.invite_code||'';requests=d.requests;
    people=[people[0]].concat(d.friends.map(function(f){
      return {id:f.id,n:String(f.name||'Friend').trim().split(' ')[0].slice(0,20)||'Friend',full:f.name||'',home:f.home||'',phone:f.phone||'',stays:f.stays};
    }));
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
  function gate(h){$('gate').hidden=false;$('app').hidden=true;$('gbody').innerHTML=h}
  function inviteLine(name){return name?'<div class="hd">'+esc(name)+' invited you</div><p class="hint">Overlap shows when friends will be in the same city as you. Only friends you accept see your plans.</p>':'<div class="hd">See when friends overlap</div><p class="hint">Share where you will be, and find out when friends are in the same city as you.</p>'}

  function showEmail(name){
    gate(inviteLine(name)
      +'<div class="f"><label for="gem">Your email</label><input id="gem" type="email" inputmode="email" autocomplete="email" autocapitalize="off" placeholder="you@email.com" enterkeyhint="go" value="'+esc(gEmail)+'"></div>'
      +'<p class="err" id="err"></p><button type="button" class="add hd" id="gsend">Send me a code</button>'
      +'<p class="hint" style="margin-top:8px">No password. We email you a 6 digit code.</p>');
    var go=function(){
      var em=String($('gem').value||'').trim().toLowerCase();
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){$('err').textContent='Check your email address.';return}
      gEmail=em;try{localStorage.setItem('ov-email',em)}catch(e){}
      $('gsend').disabled=true;$('gsend').textContent='Sending…';
      api.sendCode(em).then(function(){showCode()},function(e){
        $('gsend').disabled=false;$('gsend').textContent='Send me a code';
        $('err').textContent=/rate|seconds/i.test(e&&e.message||'')?'Too many tries. Wait a minute and try again.':'Could not send the code. Try again.'+(e&&e.message?' ('+String(e.message).slice(0,120)+')':'');
      });
    };
    $('gsend').onclick=go;
    $('gem').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();go()}});
  }
  function showCode(){
    gate('<div class="hd">Check your email</div><p class="hint">We sent a 6 digit code to '+esc(gEmail)+'.</p>'
      +'<div class="f"><input id="gcode" class="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="······" aria-label="Code"></div>'
      +'<p class="err" id="err"></p><button type="button" class="add hd" id="gok">Sign in</button>'
      +'<button type="button" class="link" id="gback">Use a different email</button>');
    var go=function(){
      var c=String($('gcode').value||'').replace(/\D/g,'');
      if(c.length<6){$('err').textContent='Type the code from the email.';return}
      $('gok').disabled=true;
      api.verifyCode(gEmail,c).then(function(s){start(s)},function(){$('gok').disabled=false;$('err').textContent='That code did not work. Check it or ask for a new one.'});
    };
    $('gok').onclick=go;
    $('gcode').addEventListener('input',function(){if(this.value.replace(/\D/g,'').length===6)go()});
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
      ready=true;welcome();
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
