self.addEventListener('install', (e)=>{
  self.skipWaiting();
  e.waitUntil(caches.open('tasks-cache-v1').then(cache=> cache.addAll([
    '/', '/index.html', '/manifest.webmanifest'
  ])));
});
self.addEventListener('activate', (e)=>{
  e.waitUntil((async()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>!['tasks-cache-v1'].includes(k)).map(k=>caches.delete(k)));
    self.clients.claim();
  })());
});
self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);
  if(url.origin===location.origin){
    e.respondWith((async()=>{
      const cached = await caches.match(e.request);
      if(cached) return cached;
      try{ const res = await fetch(e.request); const cache = await caches.open('tasks-cache-v1'); cache.put(e.request, res.clone()); return res; }
      catch{ return caches.match('/index.html'); }
    })());
  }
});
