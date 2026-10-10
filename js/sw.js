const V = "jugada-v1";
const SHELL = ["./","index.html","styles.css","app.js","manifest.json","icon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET")return;
  const u=new URL(r.url);
  if(u.origin!==location.origin&&!u.host.includes("fonts.g"))return;
  // Red primero para API; caché primero para el resto (y se actualiza en segundo plano)
  if(u.pathname.startsWith("/api")){
    e.respondWith(fetch(r).catch(()=>caches.match(r)));return;
  }
  e.respondWith(caches.match(r).then(hit=>{
    const net=fetch(r).then(res=>{if(res.ok)caches.open(V).then(c=>c.put(r,res.clone()));return res}).catch(()=>hit);
    return hit||net;
  }));
});