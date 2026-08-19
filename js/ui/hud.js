/**
 * In-Game HUD, Toast Notification System & UI Coordinator
 */

export class HUDManager {
  constructor() {
    this.toastContainer = document.getElementById('toast-container');
    this.questPanel = document.getElementById('quest-panel');
    this.soundBtn = document.getElementById('sound-btn');
    this.fullscreenBtn = document.getElementById('fullscreen-btn');

    this.initEventListeners();
  }

  initEventListeners() {
    if (this.soundBtn) {
      this.soundBtn.addEventListener('click', () => {
        if (window.audioManager) {
          const muted = window.audioManager.toggleMute();
          this.soundBtn.textContent = muted ? '🔇' : '🔊';
          this.showToast(muted ? "Sound Muted 🔇" : "Sound Unmuted 🔊");
        }
      });
    }

    if (this.fullscreenBtn) {
      this.fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.().catch(() => {});
        } else {
          document.exitFullscreen?.().catch(() => {});
        }
      });
    }
  }

  showToast(message, isUrgent = false) {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${isUrgent ? 'horror-toast' : ''}`;
    toast.innerHTML = `<span>${message}</span>`;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3200);
  }

  updateCurrentGoal(goalText, isCompleted = false) {
    const goalTextEl = document.getElementById('goal-text');
    const goalCheckboxEl = document.getElementById('goal-checkbox');
    if (goalTextEl) {
      goalTextEl.textContent = goalText;
    }
    if (goalCheckboxEl) {
      if (isCompleted) {
        goalCheckboxEl.classList.add('checked');
      } else {
        goalCheckboxEl.classList.remove('checked');
      }
    }
  }

  updateStageLabel(label) {
    const stageEl = document.getElementById('stage-indicator');
    if (stageEl) {
      stageEl.textContent = label;
    }
  }

  updateGoalDistance(distMeters) {
    const distEl = document.getElementById('goal-distance');
    if (!distEl) return;
    if (distMeters !== null && distMeters !== undefined && distMeters > 0) {
      distEl.textContent = `📍 ${Math.round(distMeters)}m`;
      distEl.style.display = 'inline-flex';
    } else {
      distEl.style.display = 'none';
    }
  }
}
