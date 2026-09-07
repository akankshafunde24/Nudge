const CACHE="nudge-shell-v2";
const SHELL=["/","/icon.svg","/manifest.webmanifest"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));self.skipWaiting()});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",event=>{
 const request=event.request;if(request.method!=="GET")return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin||url.pathname.startsWith("/api/")||url.pathname.startsWith("/_next/webpack")||url.pathname.startsWith("/api/auth/"))return;
 if(request.mode==="navigate"){
  event.respondWith(fetch(request).then(response=>{const copy=response.clone();if(response.ok)caches.open(CACHE).then(c=>c.put(request,copy));return response}).catch(async()=>await caches.match(request)||await caches.match("/")||new Response("Nudge is offline right now.",{status:503,headers:{"content-type":"text/plain"}})));
  return;
 }
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok)caches.open(CACHE).then(c=>c.put(request,response.clone()));return response})));
});
