// cache-first with background refresh; offline after first visit. Bump CACHE to invalidate.
const CACHE='cg-v1';
self.addEventListener('install',function(e){self.skipWaiting();});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.map(function(k){if(k!==CACHE)return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener('fetch',function(e){
  var r=e.request; if(r.method!=='GET'||!r.url.startsWith(self.location.origin))return;
  e.respondWith(caches.open(CACHE).then(function(c){return c.match(r).then(function(hit){
    var net=fetch(r).then(function(res){if(res&&res.status===200)c.put(r,res.clone());return res;}).catch(function(){return hit;});
    return hit||net;
  });}));
});
