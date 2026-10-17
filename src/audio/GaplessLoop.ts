/** One decoded buffer, looped by the audio render thread without file restarts. */
export class GaplessLoop {
  private context: AudioContext | null = null;
  private buffer: AudioBuffer | null = null;
  private loading: Promise<AudioBuffer> | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gain: GainNode | null = null;
  private abort = new AbortController();
  private generation = 0;
  private offset = 0;
  private startedAt = 0;
  private disposed = false;
  private deadline: number | null = null;

  constructor(private url: string, private onPlaying: (playing: boolean) => void) {}

  private audioContext() {
    if (this.context) return this.context;
    const Constructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Constructor) throw new Error('This browser does not support continuous audio.');
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (session) { try { session.type = 'playback'; } catch { /* Optional capability. */ } }
    const context = new Constructor();
    this.context = context;
    this.gain = context.createGain();
    this.gain.connect(context.destination);
    context.onstatechange = () => this.onPlaying(Boolean(this.source) && context.state === 'running');
    return context;
  }

  async play(restart = false) {
    if (this.disposed) return false;
    const context = this.audioContext();
    // Resume inside the tap, before downloading or decoding, for Safari's user gesture.
    const resumed = context.resume();
    const generation = ++this.generation;
    if (!this.loading) {
      this.loading = fetch(this.url, { signal: this.abort.signal })
        .then(response => { if (!response.ok) throw new Error('Sound unavailable'); return response.arrayBuffer(); })
        .then(bytes => context.decodeAudioData(bytes))
        .then(buffer => { this.buffer = buffer; return buffer; })
        .catch(error => { this.loading = null; throw error; });
    }
    const [, buffer] = await Promise.all([resumed, this.loading]);
    if (this.disposed || generation !== this.generation) return false;
    if (context.state !== 'running') throw new Error('Audio is paused by the browser.');
    if (this.deadline !== null && this.deadline <= Date.now()) { this.stop(); return false; }
    if (this.source) return true;
    if (restart) this.offset = 0;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.loopStart = 0;
    source.loopEnd = buffer.duration;
    source.connect(this.gain!);
    this.startedAt = context.currentTime;
    this.source = source;
    this.applyTimer();
    source.start(this.startedAt, this.offset % buffer.duration);
    this.onPlaying(true);
    return true;
  }

  pause() {
    ++this.generation;
    if (this.source && this.context && this.buffer) {
      this.offset = (this.offset + this.context.currentTime - this.startedAt) % this.buffer.duration;
      this.source.stop(); this.source.disconnect(); this.source = null;
    }
    this.onPlaying(false);
  }

  stop() { this.pause(); this.offset = 0; this.deadline = null; }
  setDeadline(deadline: number | null) { this.deadline = deadline; this.applyTimer(); }

  private applyTimer() {
    if (!this.context || !this.gain) return;
    const now = this.context.currentTime;
    const parameter = this.gain.gain;
    parameter.cancelScheduledValues(now);
    parameter.setValueAtTime(.65, now);
    if (this.deadline !== null) {
      const end = now + Math.max(0, (this.deadline - Date.now()) / 1000);
      // Silence on the audio thread even if JavaScript timers are throttled.
      parameter.setValueAtTime(.65, Math.max(now, end - .1));
      parameter.linearRampToValueAtTime(0, end);
    }
  }

  dispose() {
    this.disposed = true; this.stop(); this.abort.abort();
    if (this.context) { this.context.onstatechange = null; void this.context.close().catch(() => {}); }
    this.buffer = null; this.loading = null;
  }
}
