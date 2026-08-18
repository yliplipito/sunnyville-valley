/**
 * Developer Control Panel
 * Allows testing of atmosphere stages, sound effects, and simulation sequences.
 */

export class DebugManager {
  constructor(corruptionManager, scareManager, entityManager, audioManager) {
    this.corruption = corruptionManager;
    this.scares = scareManager;
    this.entities = entityManager;
    this.audio = audioManager;

    this.panelEl = document.getElementById('debug-panel');
    this.sliderEl = document.getElementById('corruption-slider');
    this.closeBtn = document.getElementById('debug-close-btn');
    this.toggleBtn = document.getElementById('debug-toggle-btn');
    this.logoClickable = document.getElementById('logo-clickable');
    this.resetBtn = document.getElementById('debug-reset-btn');

    this.clickCount = 0;
    this.clickTimer = null;

    this.initEventListeners();
  }

  initEventListeners() {
    // Secret Key Toggle (`~` Backtick or `F8` or `Backquote`)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Backquote' || e.code === 'F8' || e.key === '`' || e.key === '~') {
        this.togglePanel();
      }
    });

    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.togglePanel());
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.hidePanel());
    }

    // Corruption Slider
    if (this.sliderEl) {
      this.sliderEl.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.corruption.setCorruption(val);
      });
    }

    // Jump to Stage buttons
    document.querySelectorAll('.debug-btn[data-stage]').forEach(btn => {
      btn.addEventListener('click', () => {
        const stage = parseInt(btn.dataset.stage);
        const stageValues = [0, 15, 35, 60, 95];
        this.corruption.setCorruption(stageValues[stage] || 0);
      });
    });

    // Specific Scare Trigger buttons
    document.querySelectorAll('.scare-btn[data-scare]').forEach(btn => {
      btn.addEventListener('click', () => {
        const scareType = btn.dataset.scare;
        this.triggerScare(scareType);
      });
    });

    // Reset button
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        window.location.reload();
      });
    }
  }

  togglePanel() {
    if (!this.panelEl) return;
    this.panelEl.classList.toggle('hidden');
    // Exit pointer lock if opening debug
    if (!this.panelEl.classList.contains('hidden') && document.pointerLockElement) {
      try { document.exitPointerLock?.(); } catch (e) {}
    }
  }

  hidePanel() {
    if (this.panelEl) this.panelEl.classList.add('hidden');
  }

  triggerScare(type) {
    if (type === 'whisper') {
      this.scares.playBinauralWhisper();
    } else if (type === 'knock') {
      this.scares.playPhantomKnocking();
    } else if (type === 'stare') {
      this.corruption.setCorruption(50);
      this.scares.triggerScreenTwitch(120);
    } else if (type === 'face-flash') {
      this.scares.triggerSubliminalFlash('face');
    } else if (type === 'ending-climax') {
      if (window.triggerNightmareEnding) {
        window.triggerNightmareEnding();
      }
    }
  }
}
