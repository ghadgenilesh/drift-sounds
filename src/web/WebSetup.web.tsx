import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Control, typeSize as t } from '../ui/Control';
import { enableWebMotion } from './motion';

type OfflineManifest = { cache: string; audio: string[]; bytes: number };
export function WebSetup() {
  const [status, setStatus] = useState('Save your sounds to listen without Wi-Fi.');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [supported, setSupported] = useState(true);
  const [installed, setInstalled] = useState(false);
  const [motion, setMotion] = useState('Enable tilt effects');
  useEffect(() => {
    setInstalled(window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    if (!window.isSecureContext || !('serviceWorker' in navigator) || !('caches' in window)) {
      setSupported(false); setStatus('Offline saving needs the secure app link opened in Safari.'); return;
    }
    let alive = true;
    const check = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
        await navigator.serviceWorker.ready;
        const response = await fetch('/offline-manifest.json');
        const manifest: OfflineManifest = await response.json();
        const cache = await caches.open(manifest.cache);
        const saved = await Promise.all(manifest.audio.map(url => cache.match(url)));
        if (alive) {
          const complete = saved.every(Boolean); setReady(complete);
          setStatus(complete ? `All ${manifest.audio.length} sounds are saved on this device.` : `Save all ${manifest.audio.length} sounds for offline nights · ${Math.ceil(manifest.bytes / 1e6)} MB`);
        }
      } catch { if (alive) setStatus('Connect to the internet to set up offline listening.'); }
    };
    void check(); window.addEventListener('pageshow', check);
    return () => { alive = false; window.removeEventListener('pageshow', check); };
  }, []);
  async function save() {
    if (saving) return;
    setSaving(true); setReady(false);
    try {
      await navigator.serviceWorker.ready;
      const response = await fetch('/offline-manifest.json');
      const manifest: OfflineManifest = await response.json();
      const cache = await caches.open(manifest.cache);
      for (let i = 0; i < manifest.audio.length; i++) {
        setStatus(`Saving sound ${i + 1} of ${manifest.audio.length}… Keep this app open.`);
        const url = manifest.audio[i];
        if (await cache.match(url)) continue;
        const sound = await fetch(url);
        if (!sound.ok || sound.status === 206 || !(sound.headers.get('content-type') || '').includes('audio/')) throw new Error('Download failed');
        await cache.put(url, sound);
      }
      await navigator.storage?.persist?.().catch(() => false);
      setReady(true); setStatus(`All ${manifest.audio.length} sounds are saved on this device.`);
    } catch { setStatus('Couldn’t save everything. Check your connection and free storage, then retry.'); }
    finally { setSaving(false); }
  }
  return <View style={s.box}>
    <Text style={s.title}>{installed ? 'Your pocket of quiet' : 'Take your quiet with you'}</Text>
    {!installed && <Text style={s.copy}>On iPhone: open in Safari, tap Share, then Add to Home Screen. Open the new icon and save your sounds there.</Text>}
    <Text accessibilityLiveRegion="polite" style={s.copy}>{status}</Text>
    {supported && !ready && <Control accessibilityRole="button" disabled={saving} onPress={save} style={s.button}><Text style={s.label}>{saving ? 'Saving sounds…' : 'Save sounds for offline'}</Text></Control>}
    {ready && <Text style={s.note}>Ready for offline nights. Clearing website data or low device storage can remove saved sounds.</Text>}
    <Control accessibilityRole="button" onPress={async () => setMotion(await enableWebMotion())} style={s.motion}><Text style={s.label}>{motion}</Text></Control>
  </View>;
}
const s = StyleSheet.create({box:{marginTop:22,padding:18,borderRadius:18,backgroundColor:'#ffffff06',borderWidth:1,borderColor:'#ffffff12'},title:{color:'#E8E2D8',fontSize:t(17),marginBottom:8},copy:{color:'#A4AFBF',fontSize:t(14),lineHeight:t(21),marginBottom:10},note:{color:'#B3BECE',fontSize:t(14),lineHeight:t(21)},button:{padding:14,borderRadius:12,backgroundColor:'#343D51',alignItems:'center'},label:{color:'#ECE7DF',fontSize:t(14)},motion:{minHeight:48,paddingVertical:12,marginTop:12,borderRadius:12,backgroundColor:'#253146',alignItems:'center'}});
