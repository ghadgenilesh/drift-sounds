/* Build injects CACHE, AUDIO_CACHE, SHELL, and AUDIO. */
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(async cache => {
    for (const url of SHELL) {
      const response = await fetch(url);
      if (!response.ok || response.type === 'opaqueredirect') throw new Error('App download failed');
      await cache.put(url, await withoutRedirect(response));
    }
  }));
  // Wait for old windows to close so a new worker never interrupts a night.
});
async function withoutRedirect(response) {
  if (!response.redirected) return response;
  // Cloudflare may redirect /index.html to /. Safari cannot use that cached
  // redirected response for a navigation; return its final HTML as a fresh response.
  const headers = new Headers(response.headers);
  headers.delete('content-encoding');
  headers.delete('content-length');
  return new Response(await response.arrayBuffer(), { status: response.status, statusText: response.statusText, headers });
}
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('night-shell-') && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});
async function ranged(response, range) {
  if (!range) return response;
  const body = await response.arrayBuffer();
  const total = body.byteLength;
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match || (!match[1] && !match[2])) return new Response(null, {status:416, headers:{'Content-Range':`bytes */${total}`}});
  const start = match[1] ? Number(match[1]) : Math.max(0,total-Number(match[2]));
  const end = match[1] ? (match[2] ? Math.min(Number(match[2]),total-1) : total-1) : total-1;
  if (start > end || start >= total) return new Response(null,{status:416,headers:{'Content-Range':`bytes */${total}`}});
  const headers = new Headers(response.headers);
  headers.set('Content-Range',`bytes ${start}-${end}/${total}`);
  headers.set('Content-Length',String(end-start+1)); headers.set('Accept-Ranges','bytes');
  return new Response(body.slice(start,end+1),{status:206,headers});
}
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (AUDIO.includes(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(AUDIO_CACHE);
      const saved = await cache.match(url.pathname);
      return saved ? ranged(saved,event.request.headers.get('range')) : fetch(event.request);
    })());
  } else if (event.request.mode === 'navigate' && (url.pathname === '/' || url.pathname === '/index.html')) {
    event.respondWith(caches.open(CACHE).then(async cache => {
      const response = (await cache.match('/index.html')) || await fetch(event.request);
      return withoutRedirect(response);
    }));
  } else if (SHELL.includes(url.pathname)) {
    event.respondWith(caches.open(CACHE).then(async cache => withoutRedirect((await cache.match(url.pathname)) || await fetch(event.request))));
  }
});
