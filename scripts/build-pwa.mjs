import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('../dist/', import.meta.url);
async function files(dir, prefix = '') {
  const result = [];
  for (const item of await readdir(dir,{withFileTypes:true})) {
    const name = prefix + item.name;
    if (item.isDirectory()) result.push(...await files(new URL(item.name+'/',dir),name+'/'));
    else result.push('/'+name);
  }
  return result;
}
let html = await readFile(new URL('index.html',root),'utf8');
const origin = new URL(process.env.SITE_ORIGIN || 'https://drift.stacklets.app').origin;
const title = 'Drift — Find your quiet';
const description = 'Rain, ocean, forest, and more. Sixteen free calming soundscapes with continuous playback, sleep timers, and offline listening.';
const preview = `${origin}/social-preview-drift-v5.jpg`;
const escape = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const meta = (attribute, key, value) => `<meta ${attribute}="${key}" content="${escape(value)}">`;
html = html.replace(/<title>.*?<\/title>/s, `<title>${title}</title>`);
html = html.replace(/<meta name="description"[^>]*>/g, '');
html = html.replace(/<meta name="viewport"[^>]*>/, '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">');
const sharing = [
  `<link rel="canonical" href="${origin}/">`,
  meta('name','description',description),
  meta('property','og:type','website'), meta('property','og:site_name','Drift'),
  meta('property','og:title',title), meta('property','og:description',description),
  meta('property','og:url',`${origin}/`), meta('property','og:image',preview),
  meta('property','og:image:secure_url',preview), meta('property','og:image:type','image/jpeg'),
  meta('property','og:image:width','1200'), meta('property','og:image:height','630'),
  meta('property','og:image:alt','Drift. Find your quiet. Free sleep sounds at drift.stacklets.app.'),
  meta('name','twitter:card','summary_large_image'), meta('name','twitter:title',title),
  meta('name','twitter:description',description), meta('name','twitter:image',preview),
  meta('name','twitter:image:alt','Drift. Find your quiet.'),
].join('\n');
html = html.replace('</head>', `<link rel="stylesheet" href="/accessibility.css"><link rel="manifest" href="/manifest.webmanifest"><link rel="apple-touch-icon" href="/icon-180.png"><meta name="theme-color" content="#10151f"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="Drift">\n${sharing}\n</head>`);
await writeFile(new URL('index.html',root),html);
const all = (await files(root)).filter(p => !['/sw.js','/offline-manifest.json','/metadata.json','/_headers','/_redirects'].includes(p) && !p.startsWith('/.openai/') && !p.endsWith('.map'));
const audio = all.filter(p => /\.(wav|m4a|mp3)$/.test(p));
if (audio.length !== 16) throw new Error(`Expected sixteen sounds; got ${audio.length}`);
const shell = all.filter(p => !audio.includes(p));
const audioVersion = createHash('sha256').update(audio.sort().join()).digest('hex').slice(0,12);
const version = createHash('sha256');
for (const file of shell.sort()) version.update(await readFile(new URL(file.slice(1),root)));
const cache = `night-audio-${audioVersion}`;
const manifest = { cache, audio, bytes: (await Promise.all(audio.map(async file => (await stat(new URL(file.slice(1),root))).size))).reduce((a,b)=>a+b,0) };
await writeFile(new URL('offline-manifest.json',root),JSON.stringify(manifest));
shell.push('/offline-manifest.json');
const worker = await readFile(new URL('./service-worker.js',import.meta.url),'utf8');
version.update(worker);
await writeFile(new URL('sw.js',root),`const CACHE=${JSON.stringify('night-shell-'+version.digest('hex').slice(0,12))};\nconst AUDIO_CACHE=${JSON.stringify(cache)};\nconst SHELL=${JSON.stringify(shell)};\nconst AUDIO=${JSON.stringify(audio)};\n${worker}`);
console.log(`PWA built: ${shell.length} shell files, ${audio.length} sounds, ${Math.ceil(manifest.bytes/1e6)} MB offline pack.`);
