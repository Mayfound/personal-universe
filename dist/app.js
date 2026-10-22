'use strict';
const $ = s => document.querySelector(s);
const icon = name => `<svg aria-hidden="true"><use href="#${name}"/></svg>`;
const arrow = icon('arrow');
const content = {
  home:{title:'A little <em>chaos.</em><br>A lot of curiosity.',copy:'我是林间，一名在设计、代码与日常之间探索的<br class="desktop-break">独立创造者。欢迎降落我的小小宇宙。',index:'01'},
  works:{title:'Selected<span class="block"> <em>works.</em></span>',copy:'一些认真完成的作品，和一些还在生长的念头。',index:'01'},
  about:{title:'Always<span class="block"> <em>becoming.</em></span>',copy:'不急着被定义。<br>在创造的路上，慢慢成为自己。',index:'02'},
  notes:{title:'Little<span class="block"> <em>sparks.</em></span>',copy:'把偶然遇见的灵感，<br>放进一个不会丢失的口袋。',index:'03'},
  contact:{title:'Good things<span class="block"> <em>begin here.</em></span>',copy:'一个想法，一次聊天，<br>也许就是下一个故事的开始。',index:'04'}
};
const projects = [
  {name:'Between',desc:'城市缝隙里的独立文化刊物',category:'EDITORIAL',year:'2025',role:'艺术指导 / 编辑设计',tools:'InDesign · 摄影 · 纸张实验',body:'Between 是一本关于城市边缘与日常缝隙的概念刊物。从凌晨的花市到即将消失的旧书店，我们用走路的速度重新阅读一座城市。版面以大面积留白、未裁切的影像和细小的脚注，保留了观察发生时的呼吸感。',idea:'好的设计，有时候只是给一段故事留出足够的空间。'},
  {name:'Lunar Radio',desc:'给深夜的一封声音来信',category:'AUDIO',year:'2024',role:'概念策划 / 交互设计',tools:'Web Audio · Creative Coding',body:'把午夜的声音寄到月球。Lunar Radio 是一个虚构的声音实验：在不同频率之间，偶遇雨声、旧电台与陌生人的短句。每一次收听，都像打开一封不知道来自哪里的信。',idea:'声音没有形状，却能把人带到很远的地方。'},
  {name:'Unfold',desc:'让数字体验多一点温度',category:'INTERACTIVE',year:'2025',role:'产品设计 / 前端实现',tools:'Figma · JavaScript · 动效设计',body:'Unfold 探索了一种更有触感的数字阅读体验。以纸张的折叠为灵感，把信息层级转换成可展开的空间：读者可以决定阅读的节奏，内容也在每一次轻触中逐渐显露。',idea:'交互的意义，是让复杂的事物自然发生。'},
  {name:'Slow Notes',desc:'记录缓慢发生的日常',category:'PHOTOGRAPHY',year:'2024',role:'摄影 / 写作 / 网站设计',tools:'35mm Film · 文字 · 数字档案',body:'一项没有截止日期的个人记录。用胶片和短句收集窗边的光、散步的路径与季节变化。不是为了完成什么，只是提醒自己：那些看起来没有发生的日子，也有值得记住的部分。',idea:'当我们慢下来，生活会说得更多。'}
];
const notes=[
  {id:'n1',type:'观察',title:'把散步当作一种工作方法。',text:'街道是没有目录的图书馆。今天的路线，交给好奇心。',date:'OCT 18, 2026'},
  {id:'n2',type:'摘录',title:'“注意力，是最稀有的慷慨。”',text:'一本书的页边笔记。留一点专注，给眼前正在发生的事。',date:'OCT 12, 2026'},
  {id:'n3',type:'想法',title:'如果网页也有天气呢？',text:'让颜色随着时间变化，让光标像风一样穿过文字。一个尚未完成的小念头。',date:'OCT 06, 2026'},
  {id:'n4',type:'观察',title:'傍晚六点，影子比人更自由。',text:'记于一次没有目的地的城市漫游。',date:'SEP 28, 2026'}
];
let view='home',mode='map',paused=false,noteFilter='全部',audioContext=null,audioNodes=[],soundOn=false,toastTimer,contactType='一个有趣的项目';
let saved = new Set();
try{saved=new Set(JSON.parse(localStorage.getItem('mayday-saved-notes')||'[]'));}catch{}
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
paused=reduced;
const destinations=[['works','01','作品集','Selected works'],['about','02','关于我','Always becoming'],['notes','03','灵感碎片','Little sparks'],['contact','04','发射信号','Let’s talk']];

function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3800);}
function renderWorks(){return `<p class="pane-caption">SELECTED EXPLORATIONS / 2024 — 2026</p>`+projects.map((p,i)=>`<button class="work-row" data-project="${i}" aria-label="查看作品 ${p.name}"><span class="work-index">0${i+1}</span><span><strong class="work-name">${p.name}</strong><span class="work-desc">${p.desc}</span></span><span class="work-meta">${p.category} · ${p.year}</span><span class="circle">${arrow}</span></button>`).join('');}
function renderAbout(){return `<p class="pane-caption">A HUMAN, NOT A FINISHED PRODUCT.</p><h2 class="about-title">你好，我是林间。<br>设计师，也是一名好奇心收藏家。</h2><p class="about-text">目前生活在上海，喜欢做有温度的数字体验。白天在像素里寻找秩序，傍晚带着相机出门，让偶然发生。</p><p class="about-text">相信好的作品来自认真生活，也相信设计、代码和艺术之间，没有真正的边界。</p><div class="about-tags"><span>数字体验</span><span>创意编程</span><span>胶片摄影</span><span>城市漫游</span></div><div class="timeline-row"><time>2024 — NOW</time><p>独立设计与创意探索</p></div><div class="timeline-row"><time>2022 — 2024</time><p>数字产品设计师 · 某个充满想法的工作室</p></div><div class="timeline-row"><time>始终</time><p>学习、观察，和保持一点天真</p></div><p class="small-label">此人物经历为展示内容，可替换为你的真实故事。</p>`;}
function renderNotes(){const rows=notes.filter(n=>noteFilter==='全部'||(noteFilter==='已收藏'?saved.has(n.id):n.type===noteFilter));return `<div class="notes-toolbar"><div class="notes-filters">${['全部','观察','想法','已收藏'].map(f=>`<button class="${noteFilter===f?'active':''}" data-filter="${f}" aria-pressed="${noteFilter===f}">${f}</button>`).join('')}</div><span class="saved-count">${saved.size} SAVED</span></div>`+rows.map(n=>`<article class="note-row"><div class="note-content"><span class="note-type">${n.type} / ${n.date}</span><h3>${n.title}</h3><p>${n.text}</p></div><button class="save-note" data-save="${n.id}" aria-pressed="${saved.has(n.id)}" aria-label="${saved.has(n.id)?'取消收藏':'收藏'}：${n.title}">${saved.has(n.id)?'✦':'✧'}</button></article>`).join('')+(rows.length?'':'<p class="empty-results">口袋还是空的。点击灵感旁的星星，收藏第一片火花。</p>');}
function renderContact(){return `<p class="pane-caption">OPEN FOR GOOD CONVERSATIONS</p><h2 class="contact-heading">让下一件有趣的事，<br>从一句「你好」开始。</h2><p class="small-label">示例联系邮箱</p><div class="email-box"><span class="email-address">hello@mayday.example</span><button class="copy-email" id="copy-email">复制邮箱</button></div><p class="contact-message">你想聊点什么？</p><div class="contact-options">${['一个有趣的项目','交换一点灵感','只是打个招呼'].map(t=>`<button class="${t===contactType?'active':''}" data-topic="${t}" aria-pressed="${t===contactType}">${t}</button>`).join('')}</div><p class="contact-note" id="contact-note">${contactResponse()}</p><p class="small-label">邮箱与人物均为示例。替换为真实信息后，即可用于你的个人主页。</p>`;}
function contactResponse(){return {'一个有趣的项目':'带上你的想法，哪怕它现在只有一句话。好作品，往往从一个小小的「如果」开始。','交换一点灵感':'最近读到的书、路过的展览、突然冒出的想法——都可以成为一场好聊天。','只是打个招呼':'你好，来自地球的朋友。谢谢你经过我的小小宇宙，愿你今天遇见一点好事。'}[contactType];}
function renderList(){return `<p class="pane-caption">CHOOSE YOUR NEXT COORDINATE</p><div class="list-overview">${destinations.map(d=>`<button class="destination-row" data-view="${d[0]}"><span class="dest-num">${d[1]}</span><strong>${d[2]}</strong>${arrow}</button>`).join('')}</div>`;}
function setView(next,{focus=false}={}){if(!content[next])next='home';view=next;$('#main').dataset.currentView=view;const c=content[view];$('#hero-title').innerHTML=c.title;$('#intro-copy').innerHTML=c.copy;$('#page-index').textContent=c.index;
  $('#main').classList.toggle('is-content',view!=='home'||mode==='list');
  const pane=$('#content-pane');pane.hidden=view==='home'&&mode==='map';
  if(!pane.hidden)pane.innerHTML=view==='home'?renderList():view==='works'?renderWorks():view==='about'?renderAbout():view==='notes'?renderNotes():renderContact();
  pane.scrollTop=0;
  $('#primary-action').innerHTML=(view==='home'?'探索我的宇宙':'返回宇宙')+arrow;
  $('#secondary-action').innerHTML=(view==='home'?'随机漫游':'下一个坐标')+icon(view==='home'?'shuffle':'arrow');
  document.querySelectorAll('.nav-link').forEach(b=>{const active=b.dataset.view===view;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  $('#intro-content').classList.remove('animate-intro');void $('#intro-content').offsetWidth;$('#intro-content').classList.add('animate-intro');
  history.replaceState(null,'',view==='home'?'#home':'#'+view);
  if(focus){$('#hero-title').tabIndex=-1;$('#hero-title').focus({preventScroll:true});}
  if(innerWidth<=600)window.scrollTo({top:0,behavior:reduced?'instant':'smooth'});
}
function setMode(next){mode=next;$('#map-mode').classList.toggle('selected',mode==='map');$('#list-mode').classList.toggle('selected',mode==='list');$('#map-mode').setAttribute('aria-pressed',mode==='map');$('#list-mode').setAttribute('aria-pressed',mode==='list');setView('home');}
function togglePause(){paused=!paused;applyPause();toast(paused?'轨道已暂停。给这一刻，多一点停留。':'轨道继续运行。探索没有终点。');}
function applyPause(){$('#scene').classList.toggle('paused',paused);$('#orbit-control').setAttribute('aria-pressed',paused);$('#orbit-control').setAttribute('aria-label',paused?'继续轨道':'暂停轨道');$('#orbit-control').innerHTML=icon(paused?'play':'pause')+`<span>SPACE ${paused?'继续':'暂停'}轨道</span>`;}
function showProject(i){const p=projects[i];$('#project-detail').innerHTML=`<span class="project-category">${p.category} / ${p.year} / CONCEPT PROJECT</span><h2 id="project-title">${p.name}</h2><p class="project-subtitle">${p.desc}</p><div class="project-facts"><div><span>MY ROLE</span><p>${p.role}</p></div><div><span>TOOLBOX</span><p>${p.tools}</p></div></div><div class="project-body"><p>${p.body}</p><p>「${p.idea}」</p><p class="small-label">这是用于填充网站的虚构概念项目，等待被你的真实作品替换。</p></div><button class="outline" data-next-project="${(i+1)%projects.length}">下一个作品 ${arrow}</button>`;if(!$('#project-dialog').open)$('#project-dialog').showModal();else $('#project-dialog').scrollTop=0;}
async function toggleSound(){try{if(!audioContext){audioContext=new (window.AudioContext||window.webkitAudioContext)();[110,164.81,220].forEach((freq,i)=>{const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.value=.006/(i+1);osc.connect(gain);gain.connect(audioContext.destination);osc.start();audioNodes.push(osc);});}if(soundOn){await audioContext.suspend();soundOn=false;}else{await audioContext.resume();soundOn=true;}$('#sound-toggle').setAttribute('aria-pressed',soundOn);$('#sound-toggle').setAttribute('aria-label',soundOn?'关闭环境声音':'开启环境声音');toast(soundOn?'声音已开启 · 月球频率 110 Hz':'环境声音已关闭');}catch{toast('此浏览器暂不支持环境声音。');}}
const commandDialog=$('#command-dialog');
function renderCommands(){const q=$('#command-input').value.trim().toLowerCase(),items=[['home','00','返回宇宙','home universe'],...destinations].filter(d=>(d[2]+d[3]).toLowerCase().includes(q));$('#command-results').innerHTML=items.length?items.map(d=>`<button class="command-item" data-command="${d[0]}"><span>${d[1]}</span>${d[2]}<span class="command-arrow">↗</span></button>`).join(''):'<div class="empty-results">暂时没有这个坐标。试试「作品」或「灵感」。</div>';}
function openCommands(){if(commandDialog.open)return;$('#command-input').value='';renderCommands();commandDialog.showModal();$('#command-input').focus();}
document.addEventListener('click',async e=>{
 const v=e.target.closest('[data-view]');if(v){setView(v.dataset.view);return;}
 const p=e.target.closest('[data-project]');if(p){showProject(Number(p.dataset.project));return;}
 const np=e.target.closest('[data-next-project]');if(np){showProject(Number(np.dataset.nextProject));return;}
 const f=e.target.closest('[data-filter]');if(f){noteFilter=f.dataset.filter;$('#content-pane').innerHTML=renderNotes();return;}
 const s=e.target.closest('[data-save]');if(s){const id=s.dataset.save;saved.has(id)?saved.delete(id):saved.add(id);try{localStorage.setItem('mayday-saved-notes',JSON.stringify([...saved]));}catch{}$('#content-pane').innerHTML=renderNotes();toast(saved.has(id)?'一片灵感，已收入你的口袋。':'已从收藏中移除。');return;}
 const t=e.target.closest('[data-topic]');if(t){contactType=t.dataset.topic;$('#content-pane').innerHTML=renderContact();return;}
 const c=e.target.closest('[data-command]');if(c){commandDialog.close();setView(c.dataset.command,{focus:true});return;}
 if(e.target.closest('#copy-email')){try{await navigator.clipboard.writeText('hello@mayday.example');toast('示例邮箱已复制：hello@mayday.example');}catch{toast('示例邮箱：hello@mayday.example');}}
});
$('#primary-action').addEventListener('click',()=>view==='home'?setView('works'):setView('home'));
$('#secondary-action').addEventListener('click',()=>{const order=['works','about','notes','contact'];const next=view==='home'?order[Math.floor(Math.random()*4)]:order[(order.indexOf(view)+1)%4];setView(next);if(view!=='home')toast('已抵达新的坐标。');});
$('#map-mode').addEventListener('click',()=>setMode('map'));$('#list-mode').addEventListener('click',()=>setMode('list'));
$('#orbit-control').addEventListener('click',togglePause);$('#sound-toggle').addEventListener('click',toggleSound);
$('#moon').addEventListener('click',()=>{const messages=['宇宙来信 01 / 保持一点混乱，也保持很多好奇。','宇宙来信 02 / 你不必成为星星，才值得被看见。','宇宙来信 03 / 每一次绕远路，都可能遇见新的自己。','宇宙来信 04 / 认真生活，就是最好的创作素材。'];toast(messages[Math.floor(Math.random()*messages.length)]);});
$('.dialog-close').addEventListener('click',()=>$('#project-dialog').close());$('#command-trigger').addEventListener('click',openCommands);$('#command-close').addEventListener('click',()=>commandDialog.close());$('#command-input').addEventListener('input',renderCommands);
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
document.addEventListener('keydown',e=>{const typing=e.target.matches('input,textarea,[contenteditable]');if((e.key==='/'&&!typing)||((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k')){e.preventDefault();openCommands();}if(e.key==='Enter'&&e.target===$('#command-input')){e.preventDefault();const first=$('.command-item');if(first)first.click();}if(e.code==='Space'&&!typing&&!e.target.closest('button')&&!document.querySelector('dialog[open]')){e.preventDefault();togglePause();}});
$('#scene').addEventListener('pointermove',e=>{if(reduced||e.pointerType==='touch')return;const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty('--mx',((e.clientX-r.left)/r.width-.5).toFixed(2));e.currentTarget.style.setProperty('--my',((e.clientY-r.top)/r.height-.5).toFixed(2));});
$('#scene').addEventListener('pointerleave',e=>{e.currentTarget.style.setProperty('--mx',0);e.currentTarget.style.setProperty('--my',0);});
let seed=42;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};let stars='';for(let i=0;i<92;i++){const x=rand()*800,y=rand()*820,r=rand()*1.1+.25;stars+=`<circle class="${i%7===0?'twinkle':''}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#e8e8dd" opacity="${(rand()*.55+.15).toFixed(2)}" style="animation-delay:-${i%5}s"/>`;}[[80,160],[660,60],[730,715],[130,680],[630,540]].forEach(([x,y])=>stars+=`<path class="twinkle" d="M${x-6} ${y}h12M${x} ${y-11}v22" stroke="#e8e8dd" stroke-width=".65"/>`);$('#starfield').innerHTML=stars;
window.addEventListener('hashchange',()=>{const next=location.hash.slice(1);setView(content[next]?next:'home');});
applyPause();const initial=location.hash.slice(1);setView(content[initial]?initial:'home');

