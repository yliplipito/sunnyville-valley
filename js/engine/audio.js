/**
 * SUNNYVILLE VALLEY - Dynamic Audio Engine & Sound Synthesis
 * 
 * Audio Features:
 * - Dynamic spatial sound effects with 3D binaural spatialization
 * - Cheerful acoustic melody & marimba village theme
 * - Dynamic atmospheric filters and continuous progression glide
 * - Procedural Animalese speech synthesis and surface-aware footsteps
 */

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    this.isMuted = false;
    this.masterVolume = 0.85;

    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.ambienceGain = null;

    this.masterFilter = null;
    this.reverbNode = null;
    this.subDroneGain = null;
    this.subDroneOsc = null;
    this.tinnitusGain = null;
    this.tinnitusOsc = null;

    // Heartrate Flatline Node for Climax
    this.flatlineOsc = null;
    this.flatlineGain = null;

    this.isPlaying = false;
    this.tempo = 108;
    this.currentBeat = 0;
    this.musicTimer = null;

    // Smooth Continuous Progression (0.0 strictly in Stage 0)
    this.targetCorruptionRatio = 0.0;
    this.smoothCorruption = 0.0;
    this.pitchWarbleFactor = 1.0;

    // Sliced MP3 Audio Buffers
    this.knockSetA = null; // First set of 3 knocks (0.28s - 1.08s)
    this.knockSetB = null; // Second set of 3 knocks (2.48s - 3.68s)
    this.whisperTrimmed = null; // Short breathy whisper phrase (1.68s - 2.35s)
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0 : this.masterVolume, this.ctx.currentTime);

      this.masterFilter = this.ctx.createBiquadFilter();
      this.masterFilter.type = 'lowpass';
      this.masterFilter.frequency.setValueAtTime(20000, this.ctx.currentTime);

      this.reverbNode = this.createSyntheticReverb(1.6, 0.5);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.28, this.ctx.currentTime);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.45, this.ctx.currentTime);

      this.ambienceGain = this.ctx.createGain();
      this.ambienceGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      // Routing
      this.musicGain.connect(this.masterFilter);
      this.sfxGain.connect(this.masterFilter);
      this.ambienceGain.connect(this.masterFilter);

      if (this.reverbNode) {
        this.masterFilter.connect(this.reverbNode);
        this.reverbNode.connect(this.masterGain);
      }
      this.masterFilter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.initSubDrone();
      this.initTinnitus();
      this.loadAndSliceAudioSamples();

      this.isInitialized = true;
      this.startMusic();
    } catch (e) {
      console.warn('AudioContext init notice:', e);
    }
  }

  /**
   * Load and Slice MP3 Audio Files
   * Analyzes and splits knock.mp3 into Set A (first 3 knocks) and Set B (second 3 knocks).
   * Trims whisper.mp3 to the short chilling breath phrase.
   */
  async loadAndSliceAudioSamples() {
    if (!this.ctx) return;
    try {
      const fetchAndDecode = async (url) => {
        const res = await fetch(url);
        if (!res.ok) return null;
        const arrayBuf = await res.arrayBuffer();
        return await this.ctx.decodeAudioData(arrayBuf);
      };

      const baseUrl = (import.meta.env?.BASE_URL || './').replace(/\/$/, '') + '/';
      const [knockBuf, whisperBuf, bellBuf, waterBuf] = await Promise.all([
        fetchAndDecode(`${baseUrl}audio/knock.mp3`).catch(() => null),
        fetchAndDecode(`${baseUrl}audio/whisper.mp3`).catch(() => null),
        fetchAndDecode(`${baseUrl}audio/bell.mp3`).catch(() => null),
        fetchAndDecode(`${baseUrl}audio/water_splash.mp3`).catch(() => null)
      ]);

      if (bellBuf) this.bellBuffer = bellBuf;
      if (waterBuf) this.waterSplashBuffer = waterBuf;

      if (knockBuf) {
        // Set A: First 3 knocks (0.28s to 1.08s)
        this.knockSetA = this.sliceAudioBuffer(knockBuf, 0.28, 1.08);
        // Set B: Second 3 knocks (2.48s to 3.68s)
        this.knockSetB = this.sliceAudioBuffer(knockBuf, 2.48, 3.68);
      }

      if (whisperBuf) {
        // Multi-variation whisper phrases for natural, eerie depth
        this.whisperVariations = [
          this.sliceAudioBuffer(whisperBuf, 0.2, 1.8),
          this.sliceAudioBuffer(whisperBuf, 2.0, 3.8),
          this.sliceAudioBuffer(whisperBuf, 4.0, 5.8),
          this.sliceAudioBuffer(whisperBuf, 6.0, 8.5)
        ].filter(Boolean);
        this.whisperTrimmed = this.whisperVariations[0] || whisperBuf;
      }
    } catch (e) {}
  }

  /**
   * Slice an AudioBuffer with 6ms anti-pop crossfades
   */
  sliceAudioBuffer(sourceBuffer, startTime, endTime) {
    if (!sourceBuffer || !this.ctx) return null;
    const sampleRate = sourceBuffer.sampleRate;
    const startOffset = Math.floor(startTime * sampleRate);
    const endOffset = Math.min(Math.floor(endTime * sampleRate), sourceBuffer.length);
    const frameCount = endOffset - startOffset;
    if (frameCount <= 0) return null;

    const sliced = this.ctx.createBuffer(sourceBuffer.numberOfChannels, frameCount, sampleRate);
    const fadeLength = Math.min(Math.floor(sampleRate * 0.008), Math.floor(frameCount / 4));

    for (let ch = 0; ch < sourceBuffer.numberOfChannels; ch++) {
      const srcData = sourceBuffer.getChannelData(ch);
      const destData = sliced.getChannelData(ch);
      for (let i = 0; i < frameCount; i++) {
        let sample = srcData[startOffset + i];
        if (i < fadeLength) {
          sample *= (i / fadeLength);
        } else if (i > frameCount - fadeLength) {
          sample *= ((frameCount - i) / fadeLength);
        }
        destData[i] = sample;
      }
    }
    return sliced;
  }

  createSyntheticReverb(duration = 1.6, decay = 0.5) {
    if (!this.ctx) return null;
    try {
      const rate = this.ctx.sampleRate;
      const length = Math.floor(rate * duration);
      const impulse = this.ctx.createBuffer(2, length, rate);
      const left = impulse.getChannelData(0);
      const right = impulse.getChannelData(1);

      for (let i = 0; i < length; i++) {
        const n = i / length;
        const env = Math.exp(-n * decay * 4.5);
        left[i] = (Math.random() * 2 - 1) * env * 0.18;
        right[i] = (Math.random() * 2 - 1) * env * 0.18;
      }

      const convolver = this.ctx.createConvolver();
      convolver.buffer = impulse;
      return convolver;
    } catch (e) {
      return null;
    }
  }

  initSubDrone() {
    if (!this.ctx) return;
    try {
      this.subDroneGain = this.ctx.createGain();
      this.subDroneGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      this.subDroneOsc = this.ctx.createOscillator();
      this.subDroneOsc.type = 'sine';
      this.subDroneOsc.frequency.setValueAtTime(36, this.ctx.currentTime);

      const subFilter = this.ctx.createBiquadFilter();
      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(65, this.ctx.currentTime);

      this.subDroneOsc.connect(subFilter);
      subFilter.connect(this.subDroneGain);
      this.subDroneGain.connect(this.ambienceGain);
      this.subDroneOsc.start();
    } catch (e) {}
  }

  initTinnitus() {
    if (!this.ctx) return;
    try {
      this.tinnitusGain = this.ctx.createGain();
      this.tinnitusGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      this.tinnitusOsc = this.ctx.createOscillator();
      this.tinnitusOsc.type = 'sine';
      this.tinnitusOsc.frequency.setValueAtTime(7600, this.ctx.currentTime);

      this.tinnitusOsc.connect(this.tinnitusGain);
      this.tinnitusGain.connect(this.ambienceGain);
      this.tinnitusOsc.start();
    } catch (e) {}
  }

  /**
   * Set Corruption Target
   */
  setCorruption(ratio) {
    this.targetCorruptionRatio = Math.max(0, Math.min(1, ratio));
  }

  startMusic() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.currentBeat = 0;

    // Nintendo / Animal Crossing Style Warm Cheerful Progression (F - Em7 - Dm7 - C / G7)
    const chords = [
      { bass: 174.61, notes: [220.00, 261.63, 329.63], lead: [349.23, 392.00, 440.00, 523.25] },
      { bass: 164.81, notes: [196.00, 246.94, 329.63], lead: [523.25, 493.88, 392.00, 329.63] },
      { bass: 146.83, notes: [174.61, 220.00, 261.63], lead: [440.00, 392.00, 349.23, 293.66] },
      { bass: 130.81, notes: [196.00, 246.94, 293.66], lead: [349.23, 440.00, 523.25, 587.33] }
    ];

    const playLoop = () => {
      if (!this.isPlaying || !this.ctx) return;

      // In Stage 0 (targetCorruptionRatio == 0): Strictly pristine 0.0 with ZERO pitch drift!
      if (this.targetCorruptionRatio <= 0.001) {
        this.smoothCorruption = 0.0;
      } else {
        // Slow, imperceptible continuous lerp when corruption > 0
        this.smoothCorruption += (this.targetCorruptionRatio - this.smoothCorruption) * 0.025;
      }

      const t = this.ctx.currentTime;

      // Master Low-Pass Filter & Sub-Drones smoothly adapt without steps
      const targetCutoff = 20000 - Math.pow(this.smoothCorruption, 1.4) * 19300;
      this.masterFilter.frequency.setTargetAtTime(Math.max(650, targetCutoff), t, 4.0);

      const targetSubDrone = Math.pow(this.smoothCorruption, 1.6) * 0.45;
      this.subDroneGain.gain.setTargetAtTime(targetSubDrone, t, 4.0);

      // Disable harsh high-pitch ear ringing completely
      this.tinnitusGain.gain.setTargetAtTime(0.0, t, 4.0);

      const targetAmbienceGain = Math.pow(this.smoothCorruption, 1.2) * 0.85;
      this.ambienceGain.gain.setTargetAtTime(targetAmbienceGain, t, 4.0);

      // Tempo smoothly glides from 108 down to 50
      this.tempo = 108 - Math.pow(this.smoothCorruption, 1.2) * 58;

      const chordIndex = Math.floor((this.currentBeat / 4) % chords.length);
      const subBeat = this.currentBeat % 4;
      const currentChord = chords[chordIndex];

      const beatDuration = 60 / this.tempo;

      // Pure pitch in Stage 0; subtle organic tape flutter in higher stages
      let totalPitchFactor = 1.0;
      if (this.smoothCorruption > 0.05) {
        const organicTapeFlutter = 1.0 + Math.sin(this.currentBeat * 0.18) * (this.smoothCorruption * 0.028);
        totalPitchFactor = this.pitchWarbleFactor * organicTapeFlutter;
      }

      // Bass note
      if (subBeat === 0 || subBeat === 2) {
        let bassFreq = currentChord.bass * totalPitchFactor;
        if (this.smoothCorruption >= 0.65) bassFreq *= 0.5;
        this.playWarmTone(bassFreq, beatDuration * 1.5, 'triangle', 0.16);
      }

      // Arpeggio chime
      const chordNote = currentChord.notes[subBeat % currentChord.notes.length];
      let chimeFreq = chordNote * totalPitchFactor;

      if (this.smoothCorruption >= 0.25) {
        const microtonalDrift = Math.cos(this.currentBeat * 0.25) * (this.smoothCorruption * 16);
        chimeFreq += microtonalDrift;
      }
      if (this.smoothCorruption >= 0.70) {
        if (subBeat === 1 || subBeat === 3) chimeFreq *= 0.943;
      }

      this.playSoftBell(chimeFreq, beatDuration * 0.85, 0.10);

      // Lead melody
      const leadNote = currentChord.lead[subBeat];
      let melodyFreq = leadNote * totalPitchFactor;

      if (this.smoothCorruption >= 0.35) {
        melodyFreq += Math.sin(this.currentBeat * 0.3) * (this.smoothCorruption * 20);
      }
      if (this.smoothCorruption >= 0.80) {
        melodyFreq *= 0.5;
      }

      if (Math.random() > (this.smoothCorruption > 0.85 ? 0.35 : 0.05)) {
        this.playSoftBell(melodyFreq, beatDuration * 1.1, 0.12);
      }

      this.currentBeat++;
      this.musicTimer = setTimeout(playLoop, beatDuration * 1000);
    };

    playLoop();
  }

  playWarmTone(freq, duration, type = 'sine', vol = 0.14) {
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration + 0.05);
    } catch (e) {}
  }

  playSoftBell(freq, duration, vol = 0.10) {
    if (!this.ctx || this.isMuted) return;
    try {
      const carrier = this.ctx.createOscillator();
      const mod = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();
      const gain = this.ctx.createGain();

      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(freq, this.ctx.currentTime);

      mod.type = 'triangle';
      mod.frequency.setValueAtTime(freq * 1.414, this.ctx.currentTime);
      modGain.gain.setValueAtTime(freq * 0.40, this.ctx.currentTime);

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      mod.connect(modGain);
      modGain.connect(carrier.frequency);
      carrier.connect(gain);
      gain.connect(this.musicGain);

      carrier.start();
      mod.start();

      carrier.stop(this.ctx.currentTime + duration + 0.05);
      mod.stop(this.ctx.currentTime + duration + 0.05);
    } catch (e) {}
  }

  // ===================================================================
  // REALISTIC HALLUCINATIONS: SET A / B KNOCKS & 3D BINAURAL NECK WHISPER
  // ===================================================================

  /**
   * Ultra-Realistic Acoustic Room Knock (Split Parts)
   * Randomly chooses either Set A (first 3 knocks) or Set B (second 3 knocks) from knock.mp3.
   * Plays ONLY the chosen 3-knock set with zero middle silence, sounding like a knock on your physical room wall/desk.
   */
  playPhantomKnocking() {
    if (!this.ctx || this.isMuted) return;

    // Pick Set A or Set B
    const chosenSet = (Math.random() > 0.5 && this.knockSetB) ? this.knockSetB : this.knockSetA;
    const sidePan = Math.random() > 0.5 ? -0.45 : 0.45;

    if (chosenSet) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = chosenSet;

        const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime;

        // Realistic muffled door knock volume
        gain.gain.setValueAtTime(0.18, t);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, t);

        if (panner) {
          panner.pan.setValueAtTime(sidePan, t);
          source.connect(filter);
          filter.connect(panner);
          panner.connect(gain);
        } else {
          source.connect(filter);
          filter.connect(gain);
        }
        gain.connect(this.masterGain);

        source.start(t);
        return;
      } catch (e) {}
    }

    // Procedural Fallback 3-tap wood knock
    const taps = [0, 180, 360];
    taps.forEach((delay, idx) => {
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;
        try {
          const tapMultiplier = idx === 0 ? 0.9 : (idx === 1 ? 1.0 : 0.85);

          const woodOsc = this.ctx.createOscillator();
          const woodGain = this.ctx.createGain();

          woodOsc.type = 'triangle';
          woodOsc.frequency.setValueAtTime(130, t);
          woodOsc.frequency.exponentialRampToValueAtTime(50, t + 0.055);

          woodGain.gain.setValueAtTime(0.14 * tapMultiplier, t);
          woodGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);

          woodOsc.connect(woodGain);

          const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
          if (panner) {
            panner.pan.setValueAtTime(sidePan, t);
            woodGain.connect(panner);
            panner.connect(this.masterGain);
          } else {
            woodGain.connect(this.masterGain);
          }

          woodOsc.start(t);
          woodOsc.stop(t + 0.06);
        } catch (e) {}
      }, delay);
    });
  }

  /**
   * Realistic 3D Binaural Neck Whisper with multiple phrase variations
   */
  playBinauralWhisper() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    const variations = this.whisperVariations || (this.whisperTrimmed ? [this.whisperTrimmed] : []);
    if (variations.length > 0) {
      try {
        const source = this.ctx.createBufferSource();
        const chosen = variations[Math.floor(Math.random() * variations.length)];
        source.buffer = chosen;

        const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
        if (panner) {
          const startPan = (Math.random() - 0.5) * 0.6;
          panner.pan.setValueAtTime(startPan, t);
        }

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1700, t);
        filter.Q.setValueAtTime(1.2, t);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.22, t + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

        if (panner) {
          source.connect(filter);
          filter.connect(panner);
          panner.connect(gain);
        } else {
          source.connect(filter);
          filter.connect(gain);
        }
        gain.connect(this.masterGain);

        source.start(t);
        source.stop(t + 1.9);
        return;
      } catch (e) {}
    }

    // Procedural Fallback Whisper
    try {
      const dur = 0.36;
      const bSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bSize; i++) {
        const progress = i / bSize;
        const env = Math.sin(Math.pow(progress, 0.55) * Math.PI);
        data[i] = (Math.random() * 2 - 1) * env;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const formant1 = this.ctx.createBiquadFilter();
      formant1.type = 'bandpass';
      formant1.frequency.setValueAtTime(1500, t);
      formant1.frequency.exponentialRampToValueAtTime(950, t + dur);
      formant1.Q.setValueAtTime(3.8, t);

      const formant2 = this.ctx.createBiquadFilter();
      formant2.type = 'bandpass';
      formant2.frequency.setValueAtTime(2700, t);
      formant2.frequency.exponentialRampToValueAtTime(1900, t + dur);
      formant2.Q.setValueAtTime(3.2, t);

      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      noise.connect(formant1);
      noise.connect(formant2);
      formant1.connect(gain);
      formant2.connect(gain);

      if (panner) {
        const startPan = Math.random() > 0.5 ? -0.22 : 0.22;
        panner.pan.setValueAtTime(startPan, t);
        panner.pan.linearRampToValueAtTime(-startPan * 0.6, t + dur);
        gain.connect(panner);
        panner.connect(this.masterGain);
      } else {
        gain.connect(this.masterGain);
      }

      noise.start(t);
    } catch (e) {}
  }

  playTapeWarble() {
    if (!this.ctx || this.isMuted) return;
    this.pitchWarbleFactor = 0.965;
    setTimeout(() => {
      this.pitchWarbleFactor = 1.0;
    }, 180);
  }

  playSubtlePressureDrop() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(40, t);
      osc.frequency.exponentialRampToValueAtTime(26, t + 0.45);

      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.ambienceGain);

      osc.start(t);
      osc.stop(t + 0.5);
    } catch (e) {}
  }

  playPhantomFootstep() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, t);
      osc.frequency.exponentialRampToValueAtTime(32, t + 0.05);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      if (panner) {
        panner.pan.setValueAtTime((Math.random() - 0.5) * 0.8, t);
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.ambienceGain);
      } else {
        osc.connect(gain);
        gain.connect(this.ambienceGain);
      }

      osc.start(t);
      osc.stop(t + 0.06);
    } catch (e) {}
  }

  playGlitchStab() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    try {
      const freqs = [420, 595, 840, 1190];
      freqs.forEach((f) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, t);
        osc.frequency.exponentialRampToValueAtTime(f * 1.3, t + 0.18);

        g.gain.setValueAtTime(0.09, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.20);

        osc.connect(g);
        g.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.22);
      });

      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(95, t);
      subOsc.frequency.exponentialRampToValueAtTime(36, t + 0.35);

      subGain.gain.setValueAtTime(0.40, t);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.40);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);

      subOsc.start(t);
      subOsc.stop(t + 0.42);
    } catch (e) {}
  }

  playBluntImpact() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(28, t + 0.65);

      gain.gain.setValueAtTime(0.85, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.70);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.75);

      const crackOsc = this.ctx.createOscillator();
      const crackGain = this.ctx.createGain();
      crackOsc.type = 'sawtooth';
      crackOsc.frequency.setValueAtTime(2800, t);
      crackOsc.frequency.exponentialRampToValueAtTime(380, t + 0.055);

      crackGain.gain.setValueAtTime(0.70, t);
      crackGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);

      crackOsc.connect(crackGain);
      crackGain.connect(this.masterGain);

      crackOsc.start(t);
      crackOsc.stop(t + 0.065);

      const bSize = Math.floor(this.ctx.sampleRate * 0.30);
      const buffer = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.75, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.30);

      noise.connect(nGain);
      nGain.connect(this.masterGain);
      noise.start(t);
    } catch (e) {}
  }

  playJumpscareRoar() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    try {
      // 1. Sub-bass visceral thud
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sawtooth';
      sub.frequency.setValueAtTime(140, t);
      sub.frequency.exponentialRampToValueAtTime(30, t + 0.8);
      subGain.gain.setValueAtTime(0.95, t);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
      sub.connect(subGain);
      subGain.connect(this.masterGain);
      sub.start(t);
      sub.stop(t + 0.9);

      // 2. Piercing demonic screech / glitch distortion
      const screech = this.ctx.createOscillator();
      const sGain = this.ctx.createGain();
      screech.type = 'sawtooth';
      screech.frequency.setValueAtTime(880, t);
      screech.frequency.linearRampToValueAtTime(2200, t + 0.15);
      screech.frequency.exponentialRampToValueAtTime(160, t + 0.75);
      sGain.gain.setValueAtTime(0.85, t);
      sGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
      screech.connect(sGain);
      sGain.connect(this.masterGain);
      screech.start(t);
      screech.stop(t + 0.85);

      // 3. Harsh distorted white noise blast
      const bSize = Math.floor(this.ctx.sampleRate * 0.7);
      const buffer = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.25));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const nFilter = this.ctx.createBiquadFilter();
      nFilter.type = 'bandpass';
      nFilter.frequency.setValueAtTime(1800, t);
      nFilter.Q.setValueAtTime(2.0, t);
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.9, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
      noise.connect(nFilter);
      nFilter.connect(nGain);
      nGain.connect(this.masterGain);
      noise.start(t);
    } catch (e) {}
  }

  playDogBark() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(650, t);
      filter.Q.setValueAtTime(3.0, t);

      osc.frequency.setValueAtTime(480, t);
      osc.frequency.linearRampToValueAtTime(680, t + 0.06);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.22);

      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.25);
    } catch (e) {}
  }

  playFootstep(surface = 'grass') {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = surface === 'stone' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(surface === 'stone' ? 110 : 75, t);
      osc.frequency.exponentialRampToValueAtTime(28, t + 0.05);

      gain.gain.setValueAtTime(surface === 'stone' ? 0.08 : 0.055, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.06);
    } catch (e) {}
  }

  playFanfare() {
    if (!this.ctx || this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playWarmTone(freq, 0.26, 'triangle', 0.18);
      }, idx * 90);
    });
  }

  playSparkle() {
    if (!this.ctx || this.isMuted) return;
    const notes = [659.25, 880.00, 1174.66];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playSoftBell(freq, 0.32, 0.14);
      }, idx * 70);
    });
  }

  playAnimalese(pitch, charCode) {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const charOffset = (charCode % 12) * 16;
      const freq = pitch + charOffset;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.9, t + 0.045);

      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.055);
    } catch (e) {}
  }

  playBellChime() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    if (this.bellBuffer) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = this.bellBuffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.55, t);
        source.connect(gain);
        gain.connect(this.masterGain);
        source.start(t);
        return;
      } catch (e) {}
    }

    try {
      const harmonics = [440, 880, 1320, 1760, 2200];
      const gains = [0.28, 0.16, 0.09, 0.05, 0.02];
      harmonics.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(gains[idx], t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.8 - idx * 0.3);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 3.0);
      });
    } catch (e) {}
  }

  playToySqueak() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(2800, t + 0.07);
      osc.frequency.exponentialRampToValueAtTime(1800, t + 0.16);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.20);
    } catch (e) {}
  }

  playWaterSplash() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    if (this.waterSplashBuffer) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = this.waterSplashBuffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.50, t);
        source.connect(gain);
        gain.connect(this.masterGain);
        source.start(t);
        return;
      } catch (e) {}
    }

    try {
      const noiseBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.25), this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.06));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, t);
      filter.Q.setValueAtTime(3.0, t);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      noise.start(t);
    } catch (e) {}
  }

  playPageFlip() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.08);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.1);
    } catch (e) {}
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
    }
    return this.isMuted;
  }
}
