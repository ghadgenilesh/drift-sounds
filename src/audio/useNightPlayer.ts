import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Mood } from '../moods';
import { sleepDeadline } from './sleepTimer';

export function useNightPlayer(mood: Mood) {
  const player = useAudioPlayer(mood.source, { updateInterval: 500 });
  const status = useAudioPlayerStatus(player);
  const [minutes, setMinutes] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deadline = useRef<number | null>(null);
  const operation = useRef(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  function end() {
    player.pause();
    if (Platform.OS !== 'web') player.setActiveForLockScreen(false);
    deadline.current = null;
    setRemaining(null);
    setActive(false);
  }

  useEffect(() => {
    player.loop = true;
    player.volume = 0.65;
  }, [player]);

  useEffect(() => {
    const tick = () => {
      if (deadline.current !== null) {
        const seconds = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
        setRemaining(seconds);
        if (seconds === 0) end();
      }
    };
    const interval = setInterval(tick, 500);
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') tick(); });
    return () => { clearInterval(interval); subscription.remove(); };
  }, [player]);

  function setTimer(value: number) {
    setMinutes(value);
    deadline.current = sleepDeadline(value, active);
    setRemaining(active && value ? value * 60 : null);
  }

  async function toggle(target?: Mood) {
    if (operation.current) return;
    operation.current = true;
    setBusy(true);
    setError(null);
    try {
      if (active && !target) { end(); return; }
      if (target) { player.pause(); player.replace(target.source); }
      await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'doNotMix' });
      if (!alive.current) return;
      await player.seekTo(0);
      if (!alive.current) return;
      player.loop = true;
      if (Platform.OS !== 'web') player.setActiveForLockScreen(true, { title: (target ?? mood).name, artist: 'Drift' });
      player.play();
      deadline.current = sleepDeadline(minutes, true);
      setRemaining(minutes ? minutes * 60 : null);
      setActive(true);
    } catch {
      if (alive.current) {
        end();
        setError('Couldn’t start the sound. Please try again.');
      }
    } finally {
      operation.current = false;
      if (alive.current) setBusy(false);
    }
  }
  function select(target: Mood) { void toggle(target); }
  return { active, playing: status.playing, loaded: status.isLoaded, busy, error, minutes, remaining, toggle, setTimer, select, end };
}
