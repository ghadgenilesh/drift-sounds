import { useEffect, useRef, useState } from 'react';
import { Asset } from 'expo-asset';
import { Mood } from '../moods';
import { sleepDeadline } from './sleepTimer';
import { GaplessLoop } from './GaplessLoop';
import { recordPlay } from '../soundHistory';
import { soundMetadata } from './mediaMetadata';

export function useNightPlayer(initialMood: Mood) {
  const engine = useRef<GaplessLoop | null>(null);
  const currentMood = useRef(initialMood);
  const deadline = useRef<number | null>(null);
  const operation = useRef(0);
  const activeRef = useRef(false);
  const pausedRef = useRef(false);
  const busyRef = useRef(false);
  const minutesRef = useRef(0);
  const mounted = useRef(true);
  const [minutes, setMinutes] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [active, setActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function end() {
    ++operation.current; engine.current?.stop(); deadline.current = null;
    activeRef.current = false; pausedRef.current = false; busyRef.current = false;
    setActive(false); setPlaying(false); setBusy(false); setRemaining(null);
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'none';
  }

  function start(mood: Mood, restart: boolean) {
    if (!mounted.current) return;
    if (!engine.current || currentMood.current.id !== mood.id) {
      const previous = engine.current;
      engine.current = null; previous?.dispose();
      currentMood.current = mood;
      const player = new GaplessLoop(Asset.fromModule(mood.source).uri, value => {
        if (!mounted.current || engine.current !== player) return;
        setPlaying(value);
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = value ? 'playing' : activeRef.current ? 'paused' : 'none';
      });
      engine.current = player;
    }
    const player = engine.current;
    if (restart) {
      player.stop(); deadline.current = null;
      activeRef.current = false; setActive(false); setPlaying(false); setRemaining(null);
    }
    pausedRef.current = false; busyRef.current = true; setBusy(true); setError(null);
    if ('mediaSession' in navigator && typeof MediaMetadata !== 'undefined') {
      try { navigator.mediaSession.metadata = new MediaMetadata(soundMetadata(mood, window.location.origin)); }
      catch { /* Optional platform metadata must never block playback. */ }
    }
    const attempt = ++operation.current;
    // Called directly by a tile tap, preserving Safari's audio permission gesture.
    void player.play(restart).then(started => {
      if (!mounted.current || engine.current !== player || attempt !== operation.current) return;
      if (!started) return;
      if (restart) recordPlay(mood.id);
      if (restart || !activeRef.current) {
        deadline.current = sleepDeadline(minutesRef.current, true);
        player.setDeadline(deadline.current);
        setRemaining(minutesRef.current ? minutesRef.current * 60 : null);
      }
      activeRef.current = true; setActive(true);
    }).catch(() => {
      if (!mounted.current || engine.current !== player || attempt !== operation.current) return;
      end(); setError('Couldn’t load the sound. Check your connection or saved sounds, then tap the tile to retry.');
    }).finally(() => {
      if (mounted.current && engine.current === player && attempt === operation.current) { busyRef.current = false; setBusy(false); }
    });
  }

  function pause() {
    ++operation.current; engine.current?.pause(); pausedRef.current = true;
    busyRef.current = false; setBusy(false);
  }

  useEffect(() => {
    mounted.current = true;
    const tick = () => {
      if (deadline.current !== null) {
        const seconds = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
        setRemaining(seconds); if (!seconds) end();
      }
    };
    const resume = () => {
      if (busyRef.current) return;
      if (deadline.current !== null && deadline.current <= Date.now()) { end(); return; }
      start(currentMood.current, false);
    };
    if ('mediaSession' in navigator) {
      for (const [action, handler] of [['play', resume], ['pause', pause], ['stop', end]] as const) {
        try { navigator.mediaSession.setActionHandler(action, handler); } catch { /* Optional capability. */ }
      }
    }
    const interval = setInterval(tick, 500);
    const visible = () => {
      tick();
      if (document.visibilityState === 'visible' && activeRef.current && !pausedRef.current && !busyRef.current) resume();
    };
    document.addEventListener('visibilitychange', visible); window.addEventListener('pageshow', tick);
    return () => {
      mounted.current = false; ++operation.current; clearInterval(interval);
      document.removeEventListener('visibilitychange', visible); window.removeEventListener('pageshow', tick);
      const previous = engine.current; engine.current = null; previous?.dispose();
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        for (const action of ['play', 'pause', 'stop'] as const) navigator.mediaSession.setActionHandler(action, null);
      }
    };
  }, []);

  function setTimer(value: number) {
    minutesRef.current = value; setMinutes(value);
    deadline.current = sleepDeadline(value, activeRef.current);
    engine.current?.setDeadline(deadline.current);
    setRemaining(activeRef.current && value ? value * 60 : null);
  }

  function select(mood: Mood) {
    if (currentMood.current.id === mood.id && activeRef.current && !pausedRef.current && playing) return;
    start(mood, currentMood.current.id !== mood.id || !activeRef.current);
  }
  function toggle() { if (activeRef.current || busyRef.current) end(); else start(currentMood.current, true); }
  return { active, playing, loaded: true, busy, error, minutes, remaining, toggle, setTimer, select, end };
}
