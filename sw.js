/* Fuel Log PWA — Service Worker
   只缓存自己域名下的外壳文件；Apps Script 的 iframe 内容始终走网络 */

var CACHE = 'fuel-log-pwa-v1';
var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c){ return c.addAll(ASSETS); })
      .then(function(){ return self.skipWaiting(); })
      .catch(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k !== CACHE) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;

  /* 只处理 GET，且只处理自己域名下的请求
     （Apps Script 的 iframe 是跨域的，交给浏览器正常走网络） */
  if(req.method !== 'GET') return;
  var url = new URL(req.url);
  if(url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(req).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(req, copy); }).catch(function(){});
      return res;
    }).catch(function(){
      return caches.match(req).then(function(hit){
        return hit || caches.match('./index.html');
      });
    })
  );
});
