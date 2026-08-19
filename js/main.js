import * as THREE from 'three';
window.THREE = THREE;
import { AudioManager } from './engine/audio.js';
import { Controls3D } from './engine/controls3d.js';
import { WorldScene3D } from './world/scene3d.js';
import { EntityManager3D } from './world/entities3d.js';
import { DialogueSystem } from './world/dialogue.js';
import { HUDManager } from './ui/hud.js';
import { ScareManager } from './systems/effects.js';
import { CorruptionManager } from './systems/atmosphere.js';
import { QuestManager } from './systems/quests.js';
import { DebugManager } from './ui/debug.js';

class GameApp {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.canvasWrapper = document.getElementById('canvas-wrapper');

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // High precision frame delta timer (Zero deprecation warnings)
    this.lastTime = performance.now();

    this.audio = null;
    this.controls = null;
    this.world = null;
    this.entities = null;
    this.dialogue = null;
    this.hud = null;
    this.scares = null;
    this.corruption = null;
    this.quests = null;
    this.debug = null;

    this.gameStartTime = Date.now();
    this.isNightmareEnding = false;
    this.wellHoldProgress = 0.0;

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 300);
    window.camera = this.camera;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.audio = new AudioManager();
    window.audioManager = this.audio;

    this.hud = new HUDManager();
    window.hudManager = this.hud;
    window.isPaused = false;

    this.world = new WorldScene3D(this.scene, this.renderer);
    this.world.buildWorld();
    window.worldScene = this.world;

    this.scares = new ScareManager(this.audio, this.world);
    window.scareManager = this.scares;

    this.entities = new EntityManager3D(this.scene);
    this.entities.spawnAllEntities();
    window.entityManager = this.entities;

    this.controls = new Controls3D(this.camera, this.canvasWrapper, this.scene, this.world);
    window.gameControls = this.controls;
    window.gameCamera = this.camera;

    this.corruption = new CorruptionManager(
      this.audio,
      this.world,
      this.entities,
      this.scares,
      this.hud
    );

    this.quests = new QuestManager(this.audio, this.corruption, this.hud);
    window.questManager = this.quests;

    this.dialogue = new DialogueSystem(this.audio);
    window.dialogueSystem = this.dialogue;

    this.debug = new DebugManager(
      this.corruption,
      this.scares,
      this.entities,
      this.audio
    );
    window.debugManager = this.debug;

    window.onInteract = (target) => this.handleInteraction(target);
    window.triggerNightmareEnding = () => this.triggerNightmareEnding();

    window.addEventListener('resize', () => this.onWindowResize());
    this.initWelcomeModal();
    this.initCreditsRestart();

    this.lastTime = performance.now();
    this.animate();
  }

  initWelcomeModal() {
    const startBtn = document.getElementById('start-game-btn');
    const welcomeModal = document.getElementById('welcome-modal');
    const mobileControls = document.getElementById('mobile-controls');

    const resumeAudio = () => {
      if (this.audio?.ctx && this.audio.ctx.state === 'suspended') {
        this.audio.ctx.resume().catch(() => {});
      }
    };
    window.addEventListener('touchstart', resumeAudio, { passive: true });
    window.addEventListener('pointerdown', resumeAudio, { passive: true });

    if (startBtn && welcomeModal) {
      const handleStart = (e) => {
        if (e) e.preventDefault();
        welcomeModal.classList.add('hidden');
        window.gameStarted = true;
        this.gameStartTime = Date.now();

        this.audio.init();

        const isTouch = ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches);
        if (isTouch) {
          document.body.classList.add('is-touch-device');
          if (mobileControls) mobileControls.classList.remove('hidden');
        } else {
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().then(() => {
              this.canvasWrapper.requestPointerLock?.()?.catch?.(() => {});
            }).catch(() => {
              this.canvasWrapper.requestPointerLock?.()?.catch?.(() => {});
            });
          } else {
            this.canvasWrapper.requestPointerLock?.()?.catch?.(() => {});
          }
        }

        this.hud.showToast("Welcome to Sunnyville! 🎈 Meet Mayor Barnaby at Town Hall!");
      };

      startBtn.addEventListener('click', handleStart);
      startBtn.addEventListener('touchend', handleStart);
    }
  }

  initCreditsRestart() {
    const restartBtn = document.getElementById('restart-game-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        restartBtn.disabled = true;
        restartBtn.textContent = 'RESTARTING... 🎈';
        restartBtn.style.opacity = '0.6';

        try {
          localStorage.removeItem('sunnyville_valley_save');
          sessionStorage.clear();
        } catch (err) {}

        const blackOverlay = document.getElementById('pitch-black-overlay');
        if (blackOverlay) {
          blackOverlay.style.transition = 'opacity 0.6s ease';
          blackOverlay.classList.add('active');
        }

        setTimeout(() => {
          window.location.reload();
        }, 650);
      });
    }
  }

  handleInteraction(target) {
    if (window.inDialogue || window.inNightmareEnding) return;

    const data = target.userData;
    if (!data) return;

    // Inanimate Items & Interactions
    if (data.type === 'bell') {
      this.quests.ringBell(target);
      return;
    }

    if (data.type === 'noticeboard') {
      this.quests.readNoticeBoard(target);
      return;
    }

    if (data.type === 'fountain') {
      this.quests.interactFountain(target);
      return;
    }

    if (data.type === 'ball') {
      this.quests.collectDogBall(target);
      return;
    }

    if (data.type === 'watering_can') {
      this.quests.collectWateringCan(target);
      return;
    }

    if (data.type === 'flour_sack') {
      this.quests.collectFlourSack(target);
      return;
    }

    if (data.type === 'berry_basket') {
      this.quests.collectBerryBasket(target);
      return;
    }

    if (data.type === 'watch') {
      this.quests.collectGoldenWatch(target);
      return;
    }

    if (data.type === 'lamp') {
      this.quests.lightStreetLamp(target);
      return;
    }

    if (data.type === 'flower') {
      this.quests.pickSunflower(target);
      return;
    }

    if (data.type === 'balloon') {
      this.quests.collectBalloon(target);
      return;
    }

    if (data.id === 'dog') {
      this.quests.petDog();
      const lines = this.dialogue.getDialogueFor('dog', this.corruption.stage);
      this.dialogue.showDialogue(data.name || "Buster", data.avatar || "🐶", lines, 520, () => {
        this.quests.petDog();
      });
      return;
    }

    if (data.type === 'well') {
      this.quests.inspectWell();
      return;
    }

    // Humanoid NPCs always use rich dialogue modal
    if (data.id) {
      const npcId = data.id;
      const pitch = this.entities.npcPitchMap[npcId] || 400;
      const lines = this.dialogue.getDialogueFor(npcId, this.corruption.stage);

      this.dialogue.showDialogue(data.name, data.avatar, lines, pitch, () => {
        if (npcId === 'mayor') {
          this.quests.onTalkedToMayor();
        } else if (npcId === 'daisy') {
          this.quests.onTalkedToDaisy();
        } else if (npcId === 'gregory') {
          this.quests.onTalkedToGregory();
        } else if (npcId === 'baker') {
          this.quests.onTalkedToBaker();
        } else if (npcId === 'timmy') {
          this.quests.onTalkedToTimmy();
        }
      });
    }
  }

  triggerNightmareEnding() {
    this.scares.triggerFullEndingClimax();
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (this.scares && this.scares.resizeCanvas) {
      this.scares.resizeCanvas();
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const now = performance.now();
    let delta = (now - this.lastTime) / 1000;
    this.lastTime = now;
    delta = Math.min(delta, 0.05);

    if (window.isPaused) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    const interactables = [
      ...this.world.interactableObjects,
      ...this.entities.interactables
    ];

    if (window.gameStarted && !window.inDialogue && !window.inNightmareEnding) {
      this.controls.update(delta, interactables);
    }

    // Update live distance to active quest objective
    if (this.quests && this.hud && this.camera && window.gameStarted) {
      const objPos = this.quests.getCurrentObjectivePosition();
      if (objPos) {
        const dist = Math.hypot(this.camera.position.x - objPos.x, this.camera.position.z - objPos.z);
        this.hud.updateGoalDistance(dist);
      } else {
        this.hud.updateGoalDistance(null);
      }
    }

    // Heavy breathing proximity audio when approaching the well
    if (this.audio && this.camera && this.quests && window.gameStarted) {
      this.audio.updateWellProximityBreathing(this.camera.position, this.quests.currentStep);
    }

    // Hold [E] or Mobile Interact to Unseal Well on Step 34
    const isAimingAtWell = this.controls?.hoveredObject?.userData?.type === 'well';
    const isAtWellStep = (this.quests?.currentStep || 0) >= 34;
    const holdBar = document.getElementById('interact-hold-bar');
    const holdFill = document.getElementById('interact-hold-fill');
    const promptText = document.getElementById('interact-text');
    const mobileHoldRing = document.getElementById('mobile-hold-ring');
    const mobileRingFill = document.getElementById('mobile-ring-fill');
    const mobileInteractLabel = document.getElementById('mobile-interact-label');

    if (isAimingAtWell && isAtWellStep && !window.inNightmareEnding) {
      if (holdBar) holdBar.classList.remove('hidden');
      if (mobileHoldRing) mobileHoldRing.classList.remove('hidden');
      if (promptText) promptText.textContent = 'Hold [E] to Pry Open Boarded Well';
      if (mobileInteractLabel) mobileInteractLabel.textContent = 'Hold to Unseal';

      if (this.controls?.isHoldingE) {
        this.wellHoldProgress += delta / 1.15; // fills in ~1.15s
        const pct = Math.min(100, this.wellHoldProgress * 100);
        if (holdFill) holdFill.style.width = pct + '%';
        if (mobileRingFill) mobileRingFill.style.strokeDashoffset = 106.8 * (1 - this.wellHoldProgress);

        // Minor physical effort tremor
        if (this.camera) {
          this.camera.position.x += (Math.random() - 0.5) * 0.02 * this.wellHoldProgress;
          this.camera.position.y += (Math.random() - 0.5) * 0.02 * this.wellHoldProgress;
        }

        if (this.wellHoldProgress >= 1.0) {
          this.wellHoldProgress = 0.0;
          if (holdFill) holdFill.style.width = '0%';
          if (holdBar) holdBar.classList.add('hidden');
          if (mobileHoldRing) mobileHoldRing.classList.add('hidden');
          this.scares.triggerFullEndingClimax();
        }
      } else {
        if (this.wellHoldProgress > 0) {
          this.wellHoldProgress = Math.max(0, this.wellHoldProgress - delta * 3.0);
          const pct = Math.min(100, this.wellHoldProgress * 100);
          if (holdFill) holdFill.style.width = pct + '%';
          if (mobileRingFill) mobileRingFill.style.strokeDashoffset = 106.8 * (1 - this.wellHoldProgress);
        }
      }
    } else {
      if (holdBar) holdBar.classList.add('hidden');
      if (mobileHoldRing) mobileHoldRing.classList.add('hidden');
      this.wellHoldProgress = 0.0;
      if (holdFill) holdFill.style.width = '0%';
      if (mobileRingFill) mobileRingFill.style.strokeDashoffset = '106.8';
    }

    this.corruption.update(delta);
    this.world.update(delta);
    this.entities.update(delta, this.camera.position);

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
