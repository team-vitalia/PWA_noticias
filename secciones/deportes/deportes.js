"use strict";
/* ============ CONFIG ============ */
const API_URL = null; // Ej: "/api/deportes" -> debe devolver { scores:[], news:[] }
const SPORTS = {
  "Fútbol":["futbol","#12A150","#065F2C"],"Básquetbol":["basket","#FF7A1A","#B34700"],
  "Béisbol":["beisbol","#1B3BFF","#0A1670"],"Tenis":["tenis","#B7A800","#6B6200"],
  "Motor":["motor","#FF4D3D","#8E1A10"],"NFL":["nfl","#7A3BFF","#3D1A91"]
};
/* Iconos SVG (trazos de 24x24) */
const ICONS = {
  futbol:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5l3.8 2.8-1.4 4.4H9.6l-1.4-4.4z"/><path d="M12 7.5V3M15.8 10.3l4.2-1.4M14.4 14.7l2.6 3.6M9.6 14.7L7 18.3M8.2 10.3L4 8.9"/>',
  basket:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M5.6 5.6c3 3 3 9.8 0 12.8M18.4 5.6c-3 3-3 9.8 0 12.8"/>',
  beisbol:'<circle cx="12" cy="12" r="9"/><path d="M6.2 5.2c2.6 3.2 2.6 10.4 0 13.6M17.8 5.2c-2.6 3.2-2.6 10.4 0 13.6M7.4 8.5l1.6.6M7.6 12h1.8M7.4 15.5l1.6-.6M16.6 8.5L15 9.1M16.4 12h-1.8M16.6 15.5l-1.6-.6"/>',
  tenis:'<circle cx="12" cy="12" r="9"/><path d="M3.6 9.2c5.4.4 9.6 4.6 10.2 11.2M20.4 14.8c-5.4-.4-9.6-4.6-10.2-11.2"/>',
  motor:'<path d="M5 21V4M5 4h14l-2.5 4L19 12H5"/><path d="M9 4v8M13 4v8" stroke-dasharray="2 2"/>',
  nfl:'<ellipse cx="12" cy="12" rx="10" ry="5.8" transform="rotate(-35 12 12)"/><path d="M9 15l6-6M10.6 10.6l1.2 1.2M12.4 12.4l1.2 1.2"/>',
  trofeo:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 13v4M8 20h8M10 17h4"/>',
  heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'
};
const ic = (k,s=20,fill=false) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="${fill?"currentColor":"none"}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]||ICONS.trofeo}</svg>`;
const SAMPLE = {
  scores:[
    {l:"Liga MX",a:"América",ah:2,b:"Chivas",bh:1,st:"74'",live:true},
    {l:"Liga MX",a:"Cruz Azul",ah:0,b:"Pumas",bh:0,st:"Hoy 20:00"},
    {l:"NBA",a:"Lakers",ah:108,b:"Celtics",bh:104,st:"Final"},
    {l:"MLB",a:"Yankees",ah:3,b:"Dodgers",bh:5,st:"Final"}
  ],
  news:[
    {id:1,c:"Fútbol",t:"Clásico en el Azteca: el líder gana y se escapa en la tabla",s:"Un gol en el segundo tiempo acerca al equipo a la liguilla directa con tres jornadas por jugar.",src:"Redacción",ts:Date.now()-25*6e4,url:"#"},
    {id:2,c:"Básquetbol",t:"Remontada histórica: los locales superan por cuatro puntos",s:"Con 38 puntos de su figura, el equipo da vuelta un marcador adverso en el último cuarto.",src:"Redacción",ts:Date.now()-60*6e4,url:"#"},
    {id:3,c:"Béisbol",t:"Jonrón de oro define la serie y pone el 3-2",s:"El bateador designado conectó en la octava entrada y el bullpen cerró sin sobresaltos.",src:"Redacción",ts:Date.now()-2*36e5,url:"#"},
    {id:4,c:"Tenis",t:"Final de infarto: tres sets y un campeón nuevo",s:"El joven finalista salvó dos puntos de partido antes de levantar el trofeo.",src:"Redacción",ts:Date.now()-3*36e5,url:"#"},
    {id:5,c:"Motor",t:"Pole sorpresa para la carrera de mañana",s:"La clasificación se resolvió por 41 milésimas con pista cambiante.",src:"Redacción",ts:Date.now()-4*36e5,url:"#"},
    {id:6,c:"NFL",t:"Quarterback rompe récord de yardas en una sola mitad",s:"Cuatro pases de touchdown en el segundo cuarto definieron el partido.",src:"Redacción",ts:Date.now()-5*36e5,url:"#"},
    {id:7,c:"Fútbol",t:"Selección anuncia convocados para la próxima fecha FIFA",s:"Regresan dos titulares tras superar lesiones y hay tres debutantes.",src:"Redacción",ts:Date.now()-26*36e5,url:"#"}
  ]
};

/* ============ ESTADO ============ */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const store = {
  get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}
};
const S = {data:{scores:[],news:[]}, view:"news", cat:"Todas", q:"", saved:new Set(store.get("saved",[])), loaded:false};

const ago = ts => {
  const m = Math.max(1,Math.round((Date.now()-ts)/6e4));
  return m<60?`Hace ${m} min`:m<1440?`Hace ${Math.round(m/60)} h`:`Hace ${Math.round(m/1440)} d`;
};
const sport = c => SPORTS[c]||["trofeo","#1B3BFF","#0A1670"];
const colors = c => `--c1:${sport(c)[1]};--c2:${sport(c)[2]}`;
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("on"),2000)}

/* ============ DATOS ============ */
async function load(){
  $("#refresh").classList.add("spin");
  if(!S.loaded) $("#view").innerHTML='<div class="skel" style="height:280px"></div><div class="skel"></div><div class="skel"></div>';
  try{
    if(!API_URL){S.data=SAMPLE}
    else{const r=await fetch(API_URL,{cache:"no-store"});if(!r.ok)throw 0;S.data=await r.json()}
    store.set("cache",S.data);
  }catch{
    const c=store.get("cache");
    if(c){S.data=c;toast("No se pudo actualizar")} else S.data={scores:[],news:[]};
  }
  S.loaded=true;
  $("#refresh").classList.remove("spin");
  render();
}

/* ============ RENDER ============ */
function filtered(){
  const q=S.q.trim().toLowerCase();
  return S.data.news.filter(n=>
    (S.view!=="saved"||S.saved.has(n.id)) &&
    (S.cat==="Todas"||n.c===S.cat) &&
    (!q||`${n.t} ${n.s} ${n.c}`.toLowerCase().includes(q)));
}
function chips(){
  const cats=["Todas",...new Set(S.data.news.map(n=>n.c))];
  $("#chips").innerHTML=cats.map(c=>`<button class="chip" aria-pressed="${c===S.cat}" data-c="${esc(c)}">${c!=="Todas"?ic(sport(c)[0],16):""}${esc(c)}</button>`).join("");
  $("#chips").hidden = S.view==="scores";
}
function card(n){
  const sv=S.saved.has(n.id);
  return `<div class="card" data-id="${n.id}" role="button" tabindex="0">
    <div class="thumb" style="${colors(n.c)}">${ic(sport(n.c)[0],34)}</div>
    <div><h3>${esc(n.t)}</h3><div class="meta">${esc(n.c)} · ${ago(n.ts)}</div></div>
    <button class="save" data-save="${n.id}" aria-pressed="${sv}" aria-label="${sv?"Quitar de guardadas":"Guardar"}">${ic("heart",20,sv)}</button></div>`;
}
function render(){
  chips();
  document.querySelectorAll(".tabbar button").forEach(b=>{b.dataset.view===S.view?b.setAttribute("aria-current","page"):b.removeAttribute("aria-current")});
  const cnt=$("#count");cnt.textContent=S.saved.size;cnt.hidden=!S.saved.size;
  const v=$("#view");
  if(S.view==="scores"){
    const q=S.q.trim().toLowerCase();
    const list=S.data.scores.filter(m=>!q||`${m.a} ${m.b} ${m.l}`.toLowerCase().includes(q));
    if(!list.length){v.innerHTML='<p class="empty">No hay partidos para mostrar.</p>';return}
    const by=list.reduce((o,m)=>((o[m.l]=o[m.l]||[]).push(m),o),{});
    v.innerHTML=Object.entries(by).map(([l,ms])=>`<h2 class="league">${esc(l)}</h2>`+ms.map(m=>`
      <div class="match${m.live?" live":""}"><div class="t"><span>${esc(m.a)}</span><b>${esc(m.ah)}</b></div>
      <div class="t"><span>${esc(m.b)}</span><b>${esc(m.bh)}</b></div><div class="st">${esc(m.st)}</div></div>`).join("")).join("");
    return;
  }
  const items=filtered();
  if(!items.length){v.innerHTML=`<p class="empty">${S.view==="saved"?"Aún no guardas noticias. Toca el corazón en cualquier nota.":"Sin resultados. Prueba otra búsqueda o deporte."}</p>`;return}
  const [h,...rest]=S.view==="news"?items:[null,...items];
  v.innerHTML=(h?`<button class="hero" data-id="${h.id}" style="${colors(h.c)}">
      <span class="hero-ic">${ic(sport(h.c)[0],170)}</span><span class="pill">${esc(h.c)}</span><h2>${esc(h.t)}</h2><p>${esc(h.s)}</p><span class="meta" style="color:#fff;opacity:.8">${esc(h.src)} · ${ago(h.ts)}</span></button>`:"")
    +`<div class="grid">${rest.map(card).join("")}</div>`;
}

/* ============ DETALLE ============ */
function open(id){
  const n=S.data.news.find(x=>x.id==id);if(!n)return;
  const sv=S.saved.has(n.id);
  $("#sheet-body").innerHTML=`<span class="meta">${ic(sport(n.c)[0],14)} ${esc(n.c)} · ${esc(n.src)} · ${ago(n.ts)}</span>
    <h2 id="sheet-title">${esc(n.t)}</h2><p>${esc(n.s)}</p>
    <div class="actions"><a class="btn main" href="${esc(n.url)}" target="_blank" rel="noopener">Leer nota completa</a>
    <button class="btn" data-save="${n.id}">${sv?"Quitar de guardadas":"Guardar"}</button>
    <button class="btn" data-share="${n.id}">Compartir</button><button class="btn" data-close>Cerrar</button></div>`;
  $("#sheet").showModal();
}
async function share(id){
  const n=S.data.news.find(x=>x.id==id);if(!n)return;
  const data={title:n.t,text:n.s,url:n.url==="#"?location.href:n.url};
  try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(`${n.t} ${data.url}`);toast("Enlace copiado")}}catch{}
}
function toggleSave(id){
  id=Number.isNaN(+id)?id:+id;
  S.saved.has(id)?S.saved.delete(id):S.saved.add(id);
  store.set("saved",[...S.saved]);
  toast(S.saved.has(id)?"Guardada":"Quitada de guardadas");
  render();
}

/* ============ EVENTOS ============ */
document.addEventListener("click",e=>{
  const t=e.target;
  const sv=t.closest("[data-save]");if(sv){e.stopPropagation();toggleSave(sv.dataset.save);if($("#sheet").open)open(sv.dataset.save);return}
  const sh=t.closest("[data-share]");if(sh){share(sh.dataset.share);return}
  if(t.closest("[data-close]")||t===$("#sheet")){$("#sheet").close();return}
  const c=t.closest(".chip");if(c){S.cat=c.dataset.c;render();return}
  const tab=t.closest(".tabbar button");if(tab){S.view=tab.dataset.view;render();scrollTo({top:0});return}
  const it=t.closest("[data-id]");if(it)open(it.dataset.id);
});
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.matches(".card"))open(e.target.dataset.id)});
$("#q").addEventListener("input",e=>{S.q=e.target.value;render()});
$("#refresh").addEventListener("click",load);
$("#theme").addEventListener("click",()=>{
  const r=document.documentElement;
  const dark=r.dataset.theme?r.dataset.theme==="dark":matchMedia("(prefers-color-scheme:dark)").matches;
  r.dataset.theme=dark?"light":"dark";store.set("theme",r.dataset.theme);
});
const th=store.get("theme");if(th)document.documentElement.dataset.theme=th;

/* Conexión */
const net=()=>{$("#offline").hidden=navigator.onLine};
addEventListener("online",()=>{net();load()});addEventListener("offline",net);net();

/* Instalación PWA */
let prompt_;
addEventListener("beforeinstallprompt",e=>{e.preventDefault();prompt_=e;$("#install").hidden=false});
$("#install").addEventListener("click",async()=>{if(!prompt_)return;prompt_.prompt();await prompt_.userChoice;prompt_=null;$("#install").hidden=true});
addEventListener("appinstalled",()=>{$("#install").hidden=true;toast("App instalada")});

/* Service worker + actualización automática cada 2 min */
if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
setInterval(()=>{if(navigator.onLine&&!document.hidden)load()},120000);
load();