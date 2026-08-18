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

    if (startBtn && welcomeModal) {
      startBtn.addEventListener('click', () => {
        welcomeModal.classList.add('hidden');
        window.gameStarted = true;
        this.gameStartTime = Date.now();

        this.audio.init();

        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().then(() => {
            this.canvasWrapper.requestPointerLock?.()?.catch?.(() => {});
          }).catch(() => {
            this.canvasWrapper.requestPointerLock?.()?.catch?.(() => {});
          });
        } else {
          this.canvasWrapper.requestPointerLock?.()?.catch?.(() => {});
        }

        this.hud.showToast("Welcome to Sunnyville! 🎈 Meet Mayor Barnaby at Town Hall!");
      });
    }
  }

  initCreditsRestart() {
    const restartBtn = document.getElementById('restart-game-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        try { localStorage.removeItem('sunnyville_valley_save'); } catch (e) {}
        window.location.reload();
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

    this.corruption.update(delta);
    this.world.update(delta);
    this.entities.update(delta, this.camera.position);

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
