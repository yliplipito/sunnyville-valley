import * as THREE from 'three';

/**
 * SUNNYVILLE VALLEY - Cinematic FX & Dynamic Visual Effects Director
 * Manages atmospheric visuals, subtle subliminal cues, and the dramatic story climax sequence.
 */

export class ScareManager {
  constructor(audioManager, worldScene) {
    this.audio = audioManager;
    this.world = worldScene;

    this.scareCanvas = document.getElementById('scare-canvas');
    this.scareCtx = this.scareCanvas ? this.scareCanvas.getContext('2d') : null;
    this.glitchOverlay = document.getElementById('glitch-overlay');
    this.bloodOverlay = document.getElementById('blood-splatter-overlay');
    this.flashOverlay = document.getElementById('flash-overlay');
    this.blackOverlay = document.getElementById('pitch-black-overlay');
    this.endingCard = document.getElementById('ending-card');

    this.originalTitle = "Sunnyville Valley 3D 🌞";
    this.initBrowserTabTricks();
    this.initNoisePattern();

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  initNoisePattern() {
    this.noiseCanvas = document.createElement('canvas');
    this.noiseCanvas.width = 128;
    this.noiseCanvas.height = 128;
    const nCtx = this.noiseCanvas.getContext('2d');
    const imgData = nCtx.createImageData(128, 128);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      d[i] = v;
      d[i + 1] = v;
      d[i + 2] = v;
      d[i + 3] = Math.floor(Math.random() * 40 + 10);
    }
    nCtx.putImageData(imgData, 0, 0);
  }

  resizeCanvas() {
    if (!this.scareCanvas) return;
    this.scareCanvas.width = window.innerWidth;
    this.scareCanvas.height = window.innerHeight;
  }

  initBrowserTabTricks() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (window.currentStage >= 2) {
          const creepyTitles = [
            "👁️ WHY DID YOU LEAVE ME?",
            "DO NOT LOOK BEHIND YOU",
            "COME BACK TO THE VALLEY",
            "I CAN SEE YOUR ROOM",
            "THE WELL IS OPEN"
          ];
          document.title = creepyTitles[Math.floor(Math.random() * creepyTitles.length)];
        }
      } else {
        if (window.currentStage < 3) {
          document.title = this.originalTitle;
        } else {
          document.title = "👁️ THE LOOP NEVER ENDS";
        }
      }
    });
  }

  playBinauralWhisper() {
    if (this.audio) this.audio.playBinauralWhisper();
  }

  playPhantomKnocking() {
    if (this.audio) this.audio.playPhantomKnocking();
  }

  triggerScreenTwitch(durationMs = 80) {
    const canvasWrap = document.getElementById('canvas-wrapper');
    if (canvasWrap) {
      canvasWrap.classList.add('active-twitch');
      setTimeout(() => canvasWrap.classList.remove('active-twitch'), durationMs);
    }
  }

  /**
   * Subliminal 1-Frame Flicker
   * STRICTLY SILENT: No loud synthesizer sound to ruin the subconscious visual effect.
   */
  triggerSubliminalFlash(type = 'face') {
    if (!this.scareCtx || !this.scareCanvas) return;

    const w = this.scareCanvas.width;
    const h = this.scareCanvas.height;
    this.scareCtx.clearRect(0, 0, w, h);

    if (type === 'face') {
      this.drawUncannyPhotorealisticFace(w, h);
    } else {
      this.drawVeinedEye(w, h);
    }

    this.scareCanvas.style.opacity = '1';
    this.triggerScreenTwitch(65);

    // Completely silent 1-2 frame flash (70ms)
    setTimeout(() => {
      if (this.scareCanvas) this.scareCanvas.style.opacity = '0';
    }, 70);
  }

  drawUncannyPhotorealisticFace(w, h) {
    const ctx = this.scareCtx;
    const cx = w / 2;
    const cy = h / 2;

    // 1. Deep Black Void Background with Blood Vignette
    const bgGrad = ctx.createRadialGradient(cx, cy, 60, cx, cy, Math.max(w, h) * 0.8);
    bgGrad.addColorStop(0, '#0c0202');
    bgGrad.addColorStop(0.5, '#040101');
    bgGrad.addColorStop(1, '#000000');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.save();

    // 2. Anatomical Human Skull / Face Silhouette with Deep Contouring
    ctx.beginPath();
    ctx.moveTo(cx - 160, cy - 190);
    ctx.bezierCurveTo(cx - 200, cy - 50, cx - 185, cy + 80, cx - 125, cy + 200);
    ctx.bezierCurveTo(cx - 70, cy + 280, cx + 70, cy + 280, cx + 125, cy + 200);
    ctx.bezierCurveTo(cx + 185, cy + 80, cx + 200, cy - 50, cx + 160, cy - 190);
    ctx.bezierCurveTo(cx + 120, cy - 290, cx - 120, cy - 290, cx - 160, cy - 190);
    ctx.closePath();

    // Sickly Pale Shaded Skin Gradient (Subsurface Bruised Undertone)
    const skinGrad = ctx.createRadialGradient(cx, cy - 40, 30, cx, cy + 40, 300);
    skinGrad.addColorStop(0, '#B0A698');
    skinGrad.addColorStop(0.35, '#73695D');
    skinGrad.addColorStop(0.68, '#3D352D');
    skinGrad.addColorStop(0.90, '#17130F');
    skinGrad.addColorStop(1, '#050403');
    ctx.fillStyle = skinGrad;
    ctx.fill();

    // 3. Realistic Cheekbone & Temple Hollows
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(cx - 120, cy + 50, 45, 80, -0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 120, cy + 50, 45, 80, 0.28, 0, Math.PI * 2);
    ctx.fill();

    // Forehead Wrinkles & Worry Creases
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 2.0;
    for (let l = -2; l <= 2; l++) {
      ctx.beginPath();
      ctx.moveTo(cx - 90, cy - 190 + l * 18);
      ctx.quadraticCurveTo(cx, cy - 205 + l * 18, cx + 90, cy - 190 + l * 18);
      ctx.stroke();
    }

    // Nasal Bridge & Nostril Shadows
    const noseGrad = ctx.createLinearGradient(cx, cy - 60, cx, cy + 45);
    noseGrad.addColorStop(0, '#8C8276');
    noseGrad.addColorStop(0.7, '#50473D');
    noseGrad.addColorStop(1, '#1A1410');
    ctx.fillStyle = noseGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - 50);
    ctx.lineTo(cx + 15, cy - 50);
    ctx.lineTo(cx + 28, cy + 42);
    ctx.lineTo(cx - 28, cy + 42);
    ctx.closePath();
    ctx.fill();

    // Dark Nostril Cavities
    ctx.fillStyle = '#050202';
    ctx.beginPath();
    ctx.ellipse(cx - 14, cy + 38, 8, 12, -0.2, 0, Math.PI * 2);
    ctx.ellipse(cx + 14, cy + 38, 8, 12, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 4. Photorealistic Sockets & Staring Dilated Eyes
    this.drawDeepEyeSocket(ctx, cx - 72, cy - 65, true);
    this.drawDeepEyeSocket(ctx, cx + 72, cy - 65, false);

    // 5. Agonized Stretched Jaw with Individual Teeth
    this.drawUncannyMouth(ctx, cx, cy + 130);

    ctx.restore();

    // 6. Analog VHS Scanlines & Chromatic Grain Noise
    this.applyAnalogStaticOverlay(ctx, w, h);
  }

  drawDeepEyeSocket(ctx, ex, ey, isLeft) {
    // 1. Deep orbital bony cavity shadow
    const socketGrad = ctx.createRadialGradient(ex, ey, 5, ex, ey, 62);
    socketGrad.addColorStop(0, '#000000');
    socketGrad.addColorStop(0.55, '#120908');
    socketGrad.addColorStop(0.85, '#382A25');
    socketGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = socketGrad;
    ctx.beginPath();
    ctx.arc(ex, ey, 62, 0, Math.PI * 2);
    ctx.fill();

    // 2. Yellowed Bloodshot Sclera
    ctx.beginPath();
    ctx.ellipse(ex, ey, 34, 25, 0, 0, Math.PI * 2);
    const scleraGrad = ctx.createRadialGradient(ex, ey, 8, ex, ey, 34);
    scleraGrad.addColorStop(0, '#EAE0D5');
    scleraGrad.addColorStop(0.7, '#C8B29E');
    scleraGrad.addColorStop(1, '#662222');
    ctx.fillStyle = scleraGrad;
    ctx.fill();

    // 3. Dense Realistic Blood Capillaries (Arborescent red veins)
    ctx.strokeStyle = 'rgba(185, 28, 28, 0.8)';
    ctx.lineWidth = 1.0;
    for (let v = 0; v < 14; v++) {
      const angle = (v / 14) * Math.PI * 2;
      const startR = 14 + Math.random() * 6;
      const endR = 30 + Math.random() * 4;
      ctx.beginPath();
      ctx.moveTo(ex + Math.cos(angle) * startR, ey + Math.sin(angle) * startR);
      const midAngle = angle + (Math.random() - 0.5) * 0.4;
      ctx.quadraticCurveTo(
        ex + Math.cos(midAngle) * (startR + 8),
        ey + Math.sin(midAngle) * (startR + 8),
        ex + Math.cos(angle) * endR,
        ey + Math.sin(angle) * endR
      );
      ctx.stroke();
    }

    // 4. Pitch Black Pinprick / Void Dilated Pupil
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(ex, ey, 13, 0, Math.PI * 2);
    ctx.fill();

    // 5. Glossy Wet Specular Glint
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(ex - 4, ey - 4, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawUncannyMouth(ctx, mx, my) {
    // 1. Dark Void Oral Cavity
    ctx.beginPath();
    ctx.ellipse(mx, my, 85, 48, 0, 0, Math.PI * 2);
    const mouthGrad = ctx.createRadialGradient(mx, my, 5, mx, my, 85);
    mouthGrad.addColorStop(0, '#000000');
    mouthGrad.addColorStop(0.7, '#1A0404');
    mouthGrad.addColorStop(1, '#450A0A');
    ctx.fillStyle = mouthGrad;
    ctx.fill();

    // 2. Upper Teeth (Individual Ivory Teeth with Staining)
    const upperY = my - 24;
    for (let t = -7; t <= 7; t++) {
      const tx = mx + t * 9.5;
      const tHeight = 16 - Math.abs(t) * 0.8 + (Math.random() * 2);
      ctx.fillStyle = t % 2 === 0 ? '#E2DDD2' : '#C5BBAA';
      ctx.beginPath();
      ctx.roundRect(tx - 3.8, upperY, 7.6, tHeight, [2, 2, 4, 4]);
      ctx.fill();
      ctx.strokeStyle = '#2B170E';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 3. Lower Teeth
    const lowerY = my + 14;
    for (let t = -6; t <= 6; t++) {
      const tx = mx + t * 9.5;
      const tHeight = 14 - Math.abs(t) * 0.7 + (Math.random() * 2);
      ctx.fillStyle = t % 2 === 0 ? '#DBD4C5' : '#BEB4A2';
      ctx.beginPath();
      ctx.roundRect(tx - 3.5, lowerY - tHeight, 7.0, tHeight, [4, 4, 2, 2]);
      ctx.fill();
      ctx.strokeStyle = '#2B170E';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  drawVeinedEye(w, h) {
    const ctx = this.scareCtx;
    const cx = w / 2;
    const cy = h / 2;

    ctx.fillStyle = '#050101';
    ctx.fillRect(0, 0, w, h);

    // Giant Bloodshot Eye filling screen
    const eyeRadius = Math.min(w, h) * 0.38;
    const eyeGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, eyeRadius);
    eyeGrad.addColorStop(0, '#EAE0D5');
    eyeGrad.addColorStop(0.65, '#991B1B');
    eyeGrad.addColorStop(1, '#000000');

    ctx.beginPath();
    ctx.arc(cx, cy, eyeRadius, 0, Math.PI * 2);
    ctx.fillStyle = eyeGrad;
    ctx.fill();

    // Massive Iris & Pupil
    const irisGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, eyeRadius * 0.45);
    irisGrad.addColorStop(0, '#000000');
    irisGrad.addColorStop(0.7, '#7F1D1D');
    irisGrad.addColorStop(1, '#370707');

    ctx.beginPath();
    ctx.arc(cx, cy, eyeRadius * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = irisGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, eyeRadius * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();
  }

  applyAnalogStaticOverlay(ctx, w, h) {
    // 1. Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 2);
    }

    // 2. High-performance GPU noise pattern tile
    if (this.noiseCanvas) {
      ctx.save();
      ctx.globalAlpha = 0.45;
      const pat = ctx.createPattern(this.noiseCanvas, 'repeat');
      if (pat) {
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.restore();
    }
  }

  /**
   * THE DEFINITIVE 3D ANIMATED CLIMAX ENDING:
   * 1. 3D Camera lock & glide looking into the well void
   * 2. Physical 3D wood splintering (Well planks shake and snap flying apart)
   * 3. Shadow Stalker emergence sequence
   * 4. Dynamic camera FOV collapse (70° down to 38°) + screen tremor
   * 5. First-person collapse animation
   * 6. Plunge into pitch blackness (#000000)
   * 7. Sustained continuous tone
   * 8. Fade into silence, revealing the restart card
   */
  triggerFullEndingClimax() {
    if (window.inNightmareEnding) return;
    window.inNightmareEnding = true;

    if (document.pointerLockElement) {
      try { document.exitPointerLock?.(); } catch (e) {}
    }

    const hud = document.getElementById('hud-overlay');
    if (hud) hud.style.display = 'none';
    const prompt = document.getElementById('interact-prompt');
    if (prompt) prompt.classList.add('hidden');
    const crosshair = document.getElementById('crosshair');
    if (crosshair) crosshair.style.display = 'none';
    const pill = document.getElementById('resume-pill');
    if (pill) pill.classList.add('hidden');

    const camera = window.gameCamera;
    const controls = window.gameControls;
    const world = window.worldScene;
    const entities = window.entityManager;

    // Phase 1: Smooth Cinematic Camera Track to Well Rim
    const startTime = performance.now();
    const targetCamPos = new THREE.Vector3(0, 1.65, -41.2);
    const startCamPos = camera ? camera.position.clone() : new THREE.Vector3(0, 1.65, -41.2);

    // Position Shadow Specter inside the well depth
    let stalkerGroup = null;
    if (entities && entities.stalkerEntity) {
      stalkerGroup = entities.stalkerEntity.group;
      stalkerGroup.position.set(0, -1.8, -44.0);
      stalkerGroup.rotation.y = 0; // Facing North toward player at -41.2
      entities.stalkerEntity.isVisible = true;
    }

    const wellPlanks = world?.wellPlanks || [];

    const animateEnding = () => {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;

      // 0s to 1.4s: Cinematic Glide & Well Planks Splinter
      if (elapsed < 1.4) {
        const t = elapsed / 1.4;
        const ease = t * t * (3 - 2 * t); // Smooth Hermite interpolation
        if (camera) {
          camera.position.lerpVectors(startCamPos, targetCamPos, ease);
          camera.lookAt(0, 0.8, -44.0);
        }

        // Subtly vibrate wooden planks before shattering
        wellPlanks.forEach((plank, idx) => {
          if (plank) {
            plank.rotation.z = Math.sin(now * 0.03 + idx) * 0.05;
            plank.position.y = 1.52 + Math.sin(now * 0.04 + idx) * 0.02;
          }
        });

        requestAnimationFrame(animateEnding);
        return;
      }

      // 1.4s to 2.8s: Planks Fly Outward & Specter Emerges from Well
      if (elapsed < 2.8) {
        const lungeProgress = (elapsed - 1.4) / 1.4;
        const lungeEase = Math.pow(lungeProgress, 1.6);

        // Planks fly outward and spin
        wellPlanks.forEach((plank, idx) => {
          if (plank) {
            plank.position.y += 0.08;
            plank.position.x += (idx === 0 ? -0.05 : 0.05);
            plank.rotation.x += 0.05;
            plank.rotation.z += 0.04;
          }
        });

        // Shadow Specter smoothly rises from the well towards player
        if (stalkerGroup) {
          const sz = THREE.MathUtils.lerp(-44.0, -41.5, lungeEase);
          const sy = THREE.MathUtils.lerp(-1.0, 1.4, lungeEase);
          stalkerGroup.position.set(0, sy, sz);

          if (entities.stalkerEntity.armL && entities.stalkerEntity.armR) {
            entities.stalkerEntity.armL.rotation.x = THREE.MathUtils.lerp(0, -Math.PI / 2.5, lungeEase);
            entities.stalkerEntity.armR.rotation.x = THREE.MathUtils.lerp(0, -Math.PI / 2.5, lungeEase);
          }
        }

        // Dramatic FOV collapse
        if (camera) {
          camera.fov = THREE.MathUtils.lerp(70, 42, lungeEase);
          camera.updateProjectionMatrix();
          camera.lookAt(0, 1.4, -41.5);
        }

        requestAnimationFrame(animateEnding);
        return;
      }

      // 2.8s: FATAL IMPACT & IMMEDIATE CINEMATIC BLACKOUT
      if (this.audio) {
        this.audio.playBluntImpact();
      }

      // Immediate clean plunge into Pitch Blackness
      if (this.blackOverlay) {
        this.blackOverlay.classList.add('active');
      }

      if (this.audio) {
        this.audio.startFlatlineBeep();
      }

      // Sustains in eerie darkness for 4.2s, then reveals restart card
      setTimeout(() => {
        if (this.audio) {
          this.audio.stopFlatlineBeep(2.2);
        }

        if (this.endingCard) {
          this.endingCard.classList.remove('hidden');
        }
      }, 4200);
    };

    requestAnimationFrame(animateEnding);
  }
}
