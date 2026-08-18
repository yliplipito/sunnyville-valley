import * as THREE from 'three';

/**
 * SUNNYVILLE VALLEY - Dynamic Atmosphere & Environmental Progression System
 * Features:
 * - Smooth frame-by-frame lerping
 * - Dynamic environmental progression tied to player's quest journey
 * - Spatial audio effects and dynamic visual shifts
 */

export class CorruptionManager {
  constructor(audioManager, scene3D, entityManager, scareManager, hudManager) {
    this.audio = audioManager;
    this.scene = scene3D;
    this.entities = entityManager;
    this.scares = scareManager;
    this.hud = hudManager;

    this.corruption = 0.0; // 0.0 to 100.0 (smooth continuous float)
    this.targetCorruption = 0.0;
    this.stage = 0; // 0 to 4

    this.anomalyTimer = null;

    this.stageDescriptions = [
      "Stage 0 - Sunny Meadows (Morning Serenity)",
      "Stage 1 - Gentle Breeze (Subtle Shifts)",
      "Stage 2 - Overcast Haze (Twilight Ambience)",
      "Stage 3 - Surreal Twilight (Atmospheric Shift)",
      "Stage 4 - Midnight Eclipse (Grand Transformation)"
    ];

    window.currentStage = 0;
    this.scheduleNextRandomAnomaly();
  }

  setCorruption(val) {
    this.corruption = Math.max(0, Math.min(100, val));
    this.targetCorruption = this.corruption;
    this.applyCorruptionEffects();

    const slider = document.getElementById('corruption-slider');
    const valText = document.getElementById('debug-corruption-val');
    const badge = document.getElementById('debug-stage-badge');

    if (slider) slider.value = Math.round(this.corruption);
    if (valText) valText.textContent = `${Math.round(this.corruption)}%`;
    if (badge) badge.textContent = `Current: ${this.stageDescriptions[this.stage]}`;
  }

  setTargetCorruption(val) {
    this.targetCorruption = Math.max(0, Math.min(100, val));
  }

  setSpeed(speedMultiplier) {
    this.lerpSpeed = 0.04 * speedMultiplier;
  }

  scheduleNextRandomAnomaly() {
    if (this.anomalyTimer) clearTimeout(this.anomalyTimer);

    // Randomized intervals completely independent of player action
    if (this.stage === 0) {
      // In Stage 0: Pure peace, check again after 45s
      this.anomalyTimer = setTimeout(() => {
        this.scheduleNextRandomAnomaly();
      }, 45000);
      return;
    }

    let minDelay = 45000;
    let maxDelay = 80000;

    if (this.stage === 2) {
      minDelay = 30000;
      maxDelay = 55000;
    } else if (this.stage === 3) {
      minDelay = 20000;
      maxDelay = 38000;
    } else if (this.stage >= 4) {
      minDelay = 10000;
      maxDelay = 20000;
    }

    const delay = minDelay + Math.random() * (maxDelay - minDelay);

    this.anomalyTimer = setTimeout(() => {
      this.triggerRandomOrganicAnomaly();
      this.scheduleNextRandomAnomaly();
    }, delay);
  }

  triggerRandomOrganicAnomaly() {
    if (!window.gameStarted || window.inNightmareEnding) return;

    const roll = Math.random();

    if (this.stage === 0) {
      // Stage 0: 100% serene and normal
      return;
    } else if (this.stage === 1) {
      // Subtle, rare hallucinations that make player question what they heard
      if (roll < 0.40) {
        if (this.audio) this.audio.playPhantomKnocking();
      } else if (roll < 0.75) {
        if (this.audio) this.audio.playPhantomFootstep();
      } else {
        if (this.audio) this.audio.playTapeWarble();
      }
    } else if (this.stage === 2) {
      // Creeping unease: fleeting whisper, subtle knock, ear pop pressure drop
      if (roll < 0.35) {
        if (this.audio) this.audio.playBinauralWhisper();
      } else if (roll < 0.65) {
        if (this.audio) this.audio.playPhantomKnocking();
      } else if (roll < 0.85) {
        if (this.audio) this.audio.playSubtlePressureDrop();
      } else {
        this.scares.triggerScreenTwitch(50);
      }
    } else if (this.stage === 3) {
      // Uncanny reality break: whisper, stalker silhouette in peripheral vision, pressure drop
      if (roll < 0.30) {
        if (this.audio) this.audio.playBinauralWhisper();
      } else if (roll < 0.55) {
        if (window.gameCamera && this.entities) {
          const camPos = window.gameCamera.position;
          const sx = camPos.x + (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 10);
          const sz = camPos.z + (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 10);
          this.entities.spawnStalkerAt(sx, sz);
        }
      } else if (roll < 0.75) {
        if (this.audio) this.audio.playSubtlePressureDrop();
      } else if (roll < 0.90) {
        if (this.audio) this.audio.playTapeWarble();
      } else {
        this.scares.triggerScreenTwitch(90);
      }
    } else if (this.stage >= 4) {
      this.scares.triggerScreenTwitch(140);
      if (this.entities && this.entities.stalkerEntity) {
        this.entities.isStalkerChasing = true;
        if (!this.entities.stalkerEntity.isVisible && window.gameCamera) {
          const camPos = window.gameCamera.position;
          this.entities.spawnStalkerAt(camPos.x, camPos.z - 18);
        }
      }
    }
  }

  update(delta) {
    if (!window.gameStarted || window.inNightmareEnding) return;

    // Smooth continuous lerp from current corruption to target corruption
    if (Math.abs(this.corruption - this.targetCorruption) > 0.01) {
      this.corruption = THREE.MathUtils.lerp(this.corruption, this.targetCorruption, delta * 0.35);
      this.applyCorruptionEffects();
    }
  }

  applyCorruptionEffects() {
    const ratio = this.corruption / 100.0;

    // Determine Stage
    let newStage = 0;
    if (this.corruption >= 80) newStage = 4;
    else if (this.corruption >= 50) newStage = 3;
    else if (this.corruption >= 25) newStage = 2;
    else if (this.corruption >= 10) newStage = 1;

    if (newStage !== this.stage) {
      this.stage = newStage;
      window.currentStage = newStage;
      if (this.hud?.updateStageLabel) this.hud.updateStageLabel(this.stageDescriptions[newStage]);
      if (window.questManager) window.questManager.renderCurrentGoal();
    }

    if (this.audio) this.audio.setCorruption(ratio);
    if (this.scene) this.scene.setCorruption(ratio);
    if (this.entities) this.entities.setCorruption(ratio);

    // Cinematic lighting, contrast, and atmospheric dread
    const root = document.documentElement;
    if (root) {
      const sat = Math.max(75, Math.round(100 - ratio * 25)); // Natural rich colors
      const bright = Math.max(80, Math.round(100 - ratio * 20));
      const contrast = Math.round(100 + ratio * 20);

      root.style.setProperty('--desat-filter', `saturate(${sat}%) brightness(${bright}%) contrast(${contrast}%)`);
      root.style.setProperty('--vignette-opacity', (ratio * 0.85).toFixed(2));
      root.style.setProperty('--corruption-ratio', ratio.toFixed(2));
    }

    const glitchEl = document.getElementById('glitch-overlay');
    if (glitchEl) {
      glitchEl.style.opacity = (ratio * 0.75).toFixed(2);
    }
  }
}
