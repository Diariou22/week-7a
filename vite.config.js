import { VitePWA } from 'vite-plugin-pwa'
export default defineConfig({
  plugins: [
    VitePWA({ 
      strategies: 'injectMajifest', 
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      }
    })
  ]
})
import {createHandlerBoundToURL} from 'workbox-precaching';
import {NavigationRoute, registerRoute} from 'workbox-routing';

// This assumes /app-shell.html has been precached.
var handler = createHandlerBoundToURL('/app-shell.html');
const navigationRoute = new NavigationRoute(handler, {
  allowlist: [new RegExp('/blog/')],
  denylist: [new RegExp('/blog/restricted/')],
});
registerRoute(navigationRoute);
import {setDefaultHandler} from 'workbox-routing';

setDefaultHandler(({url, event, params}) => {
  // ...
});
import {setCatchHandler} from 'workbox-routing';

setCatchHandler(({url, event, params}) => {
  
});
import {offlineFallback} from 'workbox-recipes';
import {setDefaultHandler} from 'workbox-routing';
import {NetworkOnly} from 'workbox-strategies';

setDefaultHandler(new NetworkOnly());

offlineFallback();
import {setCatchHandler, setDefaultHandler} from 'workbox-routing';
import {NetworkOnly} from 'workbox-strategies';

const pageFallback = 'offline.html';
const imageFallback = false;
const fontFallback = false;

setDefaultHandler(new NetworkOnly());

self.addEventListener('install', event => {
  const files = [pageFallback];
  if (imageFallback) {
    files.push(imageFallback);
  }
  if (fontFallback) {
    files.push(fontFallback);
  }

  event.waitUntil(
    self.caches
      .open('workbox-offline-fallbacks')
      .then(cache => cache.addAll(files))
  );
});

const handler = async options => {
  const dest = options.request.destination;
  const cache = await self.caches.open('workbox-offline-fallbacks');

  if (dest === 'document') {
    return (await cache.match(pageFallback)) || Response.error();
  }

  if (dest === 'image' && imageFallback !== false) {
    return (await cache.match(imageFallback)) || Response.error();
  }

  if (dest === 'font' && fontFallback !== false) {
    return (await cache.match(fontFallback)) || Response.error();
  }

  return Response.error();
};

setCatchHandler(handler);
import {warmStrategyCache} from 'workbox-recipes';
import {CacheFirst} from 'workbox-strategies';

// This can be any strategy, CacheFirst used as an example.
var strategy = new CacheFirst();
var urls = ['/offline.html'];

warmStrategyCache({urls, strategy});
import {CacheFirst} from 'workbox-strategies';
// This can be any strategy, CacheFirst used as an example.
var strategy = new CacheFirst();
var urls = ['/offline.html'];

self.addEventListener('install', event => {
  // handleAll returns two promises, the second resolves after all items have been added to cache.
  const done = urls.map(
    path =>
      strategy.handleAll({
        event,
        request: new Request(path),
      })[1]
  );

  event.waitUntil(Promise.all(done));
});
import {imageCache} from 'workbox-recipes';

imageCache();
import {registerRoute} from 'workbox-routing';
import {CacheFirst} from 'workbox-strategies';
import {CacheableResponsePlugin} from 'workbox-cacheable-response';
import {ExpirationPlugin} from 'workbox-expiration';

const cacheName = 'images';
const matchCallback = ({request}) => request.destination === 'image';
const maxAgeSeconds = 30 * 24 * 60 * 60;
const maxEntries = 60;

registerRoute(
  matchCallback,
  new CacheFirst({
    cacheName,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries,
        maxAgeSeconds,
      }),
    ],
  })
);