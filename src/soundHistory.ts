export type SoundHistory = Record<string, { plays: number; lastPlayed: number }>;
export const HISTORY_KEY = 'drift.sound-history.v1';

export function readHistory(): SoundHistory {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(HISTORY_KEY) || '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const history: SoundHistory = {};
    for (const [id, entry] of Object.entries(value)) {
      if (entry && Number.isSafeInteger(entry.plays) && entry.plays > 0 && Number.isFinite(entry.lastPlayed) && entry.lastPlayed >= 0) {
        history[id] = { plays: entry.plays, lastPlayed: entry.lastPlayed };
      }
    }
    return history;
  } catch { return {}; }
}

export function recordPlay(id: string) {
  try {
    const history = readHistory();
    history[id] = { plays: Math.min((history[id]?.plays || 0) + 1, Number.MAX_SAFE_INTEGER), lastPlayed: Date.now() };
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch { /* Playback works even when browser storage is unavailable. */ }
}

export function orderSounds<T extends { id: string }>(sounds: readonly T[], history: SoundHistory): T[] {
  return sounds.map((sound, index) => ({ sound, index })).sort((a, b) =>
    (history[b.sound.id]?.plays || 0) - (history[a.sound.id]?.plays || 0) ||
    (history[b.sound.id]?.lastPlayed || 0) - (history[a.sound.id]?.lastPlayed || 0) || a.index - b.index
  ).map(({ sound }) => sound);
}
