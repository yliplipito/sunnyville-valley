import * as THREE from 'three';

/**
 * SUNNYVILLE VALLEY - 3D FPS & Mobile Adventure Controller
 * Features:
 * - Smooth mouse look with pointer lock (Desktop)
 * - Virtual analog joystick and touch camera drag (Mobile / Touch)
 * - Sliding collision physics against boxes, cylinders, and fences
 * - Dynamic FOV shift during sprint & movement states
 * - Surface-aware head bobbing & procedural footsteps
 * - Accurate raycasting reticle and direct tap-to-interact for mobile
 */
export class Controls3D {
  constructor(camera, domElement, scene, world) {
    this.camera = camera;
    this.domElement = domElement;
    this.scene = scene;
    this.world = world;

    // Movement state
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.isSprinting = false;
    this.isJumping = false;
    this.canJump = true;

    // Velocity & Physics
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.playerHeight = 1.65;
    this.playerRadius = 0.55;

    // Scenic Initial Spawn Position (Plaza south walkway looking North toward Town Hall)
    this.camera.position.set(0, this.playerHeight, -15.5);

    this.walkSpeed = 8.5;
    this.sprintSpeed = 15.5;
    this.gravity = 28.0;
    this.jumpStrength = 9.5;

    // Dynamic FOV
    this.baseFov = 70;
    this.targetFov = 70;

    // Head Bobbing & Footsteps
    this.bobTimer = 0;
    this.playerY = this.playerHeight;
    this.baseCameraY = this.playerHeight;
    this.stepTriggered = false;

    // Look Rotation (Facing North towards Plaza, Town Hall & Mayor Barnaby)
    this.euler = new THREE.Euler(0, Math.PI, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(this.euler);
    this.mouseSensitivity = 0.0022;
    this.touchSensitivity = 0.0038;
    this.isLocked = false;

    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 9.0;
    this.rayOrigin = new THREE.Vector2(0, 0);
    this.hoveredObject = null;
    this.isHoldingE = false;

    // Mobile / Touch Controls State
    this.isTouchDevice = ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches);
    this.touchJoystick = {
      active: false,
      identifier: null,
      baseCenterX: 0,
      baseCenterY: 0,
      deltaX: 0,
      deltaY: 0,
      maxRadius: 45
    };
    this.touchLook = {
      active: false,
      identifier: null,
      lastX: 0,
      lastY: 0,
      startX: 0,
      startY: 0,
      startTime: 0
    };

    this.initEventListeners();
    this.initMobileControls();
  }

  initEventListeners() {
    // Pointer lock for Desktop
    this.domElement.addEventListener('click', () => {
      if (this.isTouchDevice) return;
      if (!this.isLocked && !window.inDialogue && !window.inNightmareEnding && !window.isPaused) {
        try {
          this.domElement.requestPointerLock?.()?.catch?.(() => {});
        } catch (e) {}
      }
    });

    document.addEventListener('pointerlockchange', () => {
      if (this.isTouchDevice) return;
      this.isLocked = document.pointerLockElement === this.domElement;
      const resumePill = document.getElementById('resume-pill');
      if (resumePill) {
        if (!this.isLocked && window.gameStarted && !window.inDialogue && !window.inNightmareEnding && !window.isPaused) {
          resumePill.classList.remove('hidden');
        } else {
          resumePill.classList.add('hidden');
        }
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isLocked || window.isPaused || window.inDialogue) return;

      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;

      this.euler.setFromQuaternion(this.camera.quaternion);
      this.euler.y -= movementX * this.mouseSensitivity;
      this.euler.x -= movementY * this.mouseSensitivity;

      // Clamp vertical look angle
      this.euler.x = Math.max(-Math.PI / 2.15, Math.min(Math.PI / 2.15, this.euler.x));

      this.camera.quaternion.setFromEuler(this.euler);
    });

    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  initMobileControls() {
    const mobileControls = document.getElementById('mobile-controls');
    if (!mobileControls) return;

    if (this.isTouchDevice) {
      document.body.classList.add('is-touch-device');
      mobileControls.classList.remove('hidden');
    }

    const joystickZone = document.getElementById('joystick-zone');
    const joystickBase = document.getElementById('joystick-base');
    const joystickKnob = document.getElementById('joystick-knob');
    const touchLookZone = document.getElementById('touch-look-zone');
    const jumpBtn = document.getElementById('mobile-jump-btn');
    const sprintBtn = document.getElementById('mobile-sprint-btn');
    const interactBtn = document.getElementById('mobile-interact-btn');

    // 1. Virtual Joystick
    if (joystickZone && joystickBase && joystickKnob) {
      const startJoystick = (touch) => {
        this.touchJoystick.active = true;
        this.touchJoystick.identifier = touch.identifier;
        const rect = joystickBase.getBoundingClientRect();
        this.touchJoystick.baseCenterX = rect.left + rect.width / 2;
        this.touchJoystick.baseCenterY = rect.top + rect.height / 2;
        joystickBase.classList.add('active');
        moveJoystick(touch);
      };

      const moveJoystick = (touch) => {
        let dx = touch.clientX - this.touchJoystick.baseCenterX;
        let dy = touch.clientY - this.touchJoystick.baseCenterY;
        const distance = Math.hypot(dx, dy);
        const maxR = this.touchJoystick.maxRadius;

        if (distance > maxR) {
          dx = (dx / distance) * maxR;
          dy = (dy / distance) * maxR;
        }

        this.touchJoystick.deltaX = dx;
        this.touchJoystick.deltaY = dy;
        joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      };

      const resetJoystick = () => {
        this.touchJoystick.active = false;
        this.touchJoystick.identifier = null;
        this.touchJoystick.deltaX = 0;
        this.touchJoystick.deltaY = 0;
        joystickBase.classList.remove('active');
        joystickKnob.style.transform = 'translate(-50%, -50%)';
      };

      joystickZone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.touchJoystick.active) return;
        const touch = e.changedTouches[0];
        startJoystick(touch);
      }, { passive: false });

      joystickZone.addEventListener('touchmove', (e) => {
        e.preventDefault();
        e.stopPropagation();
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === this.touchJoystick.identifier) {
            moveJoystick(e.changedTouches[i]);
            break;
          }
        }
      }, { passive: false });

      const onTouchEndJoystick = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === this.touchJoystick.identifier) {
            resetJoystick();
            break;
          }
        }
      };

      joystickZone.addEventListener('touchend', onTouchEndJoystick, { passive: false });
      joystickZone.addEventListener('touchcancel', onTouchEndJoystick, { passive: false });
    }

    // 2. Touch Screen Look Drag & Tap Interaction
    if (touchLookZone) {
      touchLookZone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.touchLook.active || window.inDialogue || window.isPaused) return;

        const touch = e.changedTouches[0];
        this.touchLook.active = true;
        this.touchLook.identifier = touch.identifier;
        this.touchLook.lastX = touch.clientX;
        this.touchLook.lastY = touch.clientY;
        this.touchLook.startX = touch.clientX;
        this.touchLook.startY = touch.clientY;
        this.touchLook.startTime = performance.now();
      }, { passive: false });

      touchLookZone.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!this.touchLook.active || window.inDialogue || window.isPaused) return;

        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === this.touchLook.identifier) {
            const movementX = touch.clientX - this.touchLook.lastX;
            const movementY = touch.clientY - this.touchLook.lastY;

            this.euler.setFromQuaternion(this.camera.quaternion);
            this.euler.y -= movementX * this.touchSensitivity;
            this.euler.x -= movementY * this.touchSensitivity;
            this.euler.x = Math.max(-Math.PI / 2.15, Math.min(Math.PI / 2.15, this.euler.x));
            this.camera.quaternion.setFromEuler(this.euler);

            this.touchLook.lastX = touch.clientX;
            this.touchLook.lastY = touch.clientY;
            break;
          }
        }
      }, { passive: false });

      const onTouchEndLook = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === this.touchLook.identifier) {
            const totalDist = Math.hypot(touch.clientX - this.touchLook.startX, touch.clientY - this.touchLook.startY);
            const duration = performance.now() - this.touchLook.startTime;

            // Direct tap on screen detection (< 15px drift & < 300ms)
            if (totalDist < 15 && duration < 300 && !window.inDialogue && !window.isPaused) {
              this.handleScreenTap(touch.clientX, touch.clientY);
            }

            this.touchLook.active = false;
            this.touchLook.identifier = null;
            break;
          }
        }
      };

      touchLookZone.addEventListener('touchend', onTouchEndLook, { passive: false });
      touchLookZone.addEventListener('touchcancel', onTouchEndLook, { passive: false });
    }

    // 3. Jump Button
    if (jumpBtn) {
      const triggerJump = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.canJump && !window.inDialogue && !window.isPaused) {
          this.velocity.y = this.jumpStrength;
          this.canJump = false;
          this.isJumping = true;
          if (window.audioManager) {
            window.audioManager.playWarmTone(180, 0.08, 'sine', 0.06);
          }
        }
      };
      jumpBtn.addEventListener('touchstart', triggerJump, { passive: false });
      jumpBtn.addEventListener('click', triggerJump);
    }

    // 4. Sprint Button (Toggle)
    if (sprintBtn) {
      const toggleSprint = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.isSprinting = !this.isSprinting;
        sprintBtn.classList.toggle('active', this.isSprinting);
        if (window.audioManager) {
          window.audioManager.playWarmTone(this.isSprinting ? 360 : 240, 0.06, 'triangle', 0.05);
        }
      };
      sprintBtn.addEventListener('touchstart', toggleSprint, { passive: false });
      sprintBtn.addEventListener('click', toggleSprint);
    }

    // 5. Mobile Interact Button
    if (interactBtn) {
      const onInteractStart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.isHoldingE = true;

        if (window.dialogueSystem && window.dialogueSystem.isOpen) {
          window.dialogueSystem.advanceDialogue();
          return;
        }

        const noticeBoard = document.getElementById('notice-board-modal');
        if (noticeBoard && !noticeBoard.classList.contains('hidden')) {
          const closeBtn = document.getElementById('notice-board-close-btn');
          closeBtn?.click();
          return;
        }

        const timeSinceCloseE = Date.now() - (window.lastDialogueClosedTime || 0);
        const isWellOnClimax = this.hoveredObject?.userData?.type === 'well' && (window.questManager?.currentStep || 0) >= 34;

        if (this.hoveredObject && timeSinceCloseE > 300 && !isWellOnClimax && window.onInteract) {
          window.onInteract(this.hoveredObject);
        }
      };

      const onInteractEnd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.isHoldingE = false;
      };

      interactBtn.addEventListener('touchstart', onInteractStart, { passive: false });
      interactBtn.addEventListener('touchend', onInteractEnd, { passive: false });
      interactBtn.addEventListener('touchcancel', onInteractEnd, { passive: false });
      interactBtn.addEventListener('mousedown', onInteractStart);
      interactBtn.addEventListener('mouseup', onInteractEnd);
    }
  }

  handleScreenTap(clientX, clientY) {
    if (!this.world || !this.scene || window.inDialogue) return;

    const tapNdc = new THREE.Vector2(
      (clientX / window.innerWidth) * 2 - 1,
      -(clientY / window.innerHeight) * 2 + 1
    );

    const tapRaycaster = new THREE.Raycaster();
    tapRaycaster.far = 10.0;
    tapRaycaster.setFromCamera(tapNdc, this.camera);

    const interactables = [
      ...(this.world?.interactableObjects || []),
      ...(window.entityManager?.interactables || [])
    ].filter(obj => obj && obj.visible && (!obj.userData || !obj.userData.isPicked));

    const hits = tapRaycaster.intersectObjects(interactables, true);
    for (const hit of hits) {
      let target = hit.object;
      while (target && !target.userData?.interactable && target.parent) {
        target = target.parent;
      }
      if (target && target.visible && target.userData?.interactable) {
        const isActive = window.questManager ? window.questManager.isInteractableActive(target) : true;
        if (isActive && window.onInteract) {
          window.onInteract(target);
          return;
        }
      }
    }
  }

  onKeyDown(e) {
    if (window.inDialogue || window.isPaused) return;

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isSprinting = true;
        break;
      case 'Space':
        if (this.canJump) {
          this.velocity.y = this.jumpStrength;
          this.canJump = false;
          this.isJumping = true;
          if (window.audioManager) {
            window.audioManager.playWarmTone(180, 0.08, 'sine', 0.06);
          }
        }
        break;
      case 'KeyE':
        this.isHoldingE = true;
        const modalOpen = !document.getElementById('notice-board-modal')?.classList.contains('hidden');
        const timeSinceCloseE = Date.now() - (window.lastDialogueClosedTime || 0);
        const isWellOnClimax = this.hoveredObject?.userData?.type === 'well' && (window.questManager?.currentStep || 0) >= 34;
        if (this.hoveredObject && timeSinceCloseE > 300 && !modalOpen && !isWellOnClimax && window.onInteract) {
          window.onInteract(this.hoveredObject);
        }
        break;
    }
  }

  onKeyUp(e) {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isSprinting = false;
        break;
      case 'KeyE':
        this.isHoldingE = false;
        break;
    }
  }

  update(delta, interactables = []) {
    if (window.inNightmareEnding) return;
    delta = Math.min(delta || 0.016, 0.05);

    // Damping & Gravity
    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;
    this.velocity.y -= this.gravity * delta;

    // Movement Direction calculation (Keyboard + Touch Joystick)
    let moveZ = Number(this.moveForward) - Number(this.moveBackward);
    let moveX = Number(this.moveRight) - Number(this.moveLeft);

    if (this.touchJoystick.active) {
      const joyNormX = this.touchJoystick.deltaX / this.touchJoystick.maxRadius;
      const joyNormY = this.touchJoystick.deltaY / this.touchJoystick.maxRadius;
      if (Math.abs(joyNormX) > 0.08 || Math.abs(joyNormY) > 0.08) {
        moveX = joyNormX;
        moveZ = -joyNormY;
      }
    }

    this.direction.set(moveX, 0, moveZ);
    const inputMagnitude = Math.hypot(moveX, moveZ);
    if (inputMagnitude > 1.0) {
      this.direction.normalize();
    }

    const isMoving = inputMagnitude > 0.1;
    const speed = this.isSprinting ? this.sprintSpeed : this.walkSpeed;

    if (isMoving) {
      this.velocity.z -= this.direction.z * speed * 10.0 * delta;
      this.velocity.x += this.direction.x * speed * 10.0 * delta;
    }

    // Camera Yaw movement
    const cameraYaw = this.euler.y;
    const forwardVec = new THREE.Vector3(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
    const rightVec = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));

    const moveStep = new THREE.Vector3();
    moveStep.addScaledVector(forwardVec, -this.velocity.z * delta);
    moveStep.addScaledVector(rightVec, this.velocity.x * delta);

    // Collision Resolution with Obstacles (Sliding X & Z)
    const targetPos = this.camera.position.clone().add(moveStep);
    const resolvedPos = this.resolveCollision(this.camera.position, targetPos);

    this.camera.position.x = resolvedPos.x;
    this.camera.position.z = resolvedPos.z;

    // 2. Vertical Integration & Gravity
    this.playerY += this.velocity.y * delta;

    // Ground & Elevated Platform Collision (e.g. Gazebo stone base at x: 24, z: -14)
    let currentGroundY = this.playerHeight;
    const dxGazebo = this.camera.position.x - 24;
    const dzGazebo = this.camera.position.z - (-14);
    if (dxGazebo * dxGazebo + dzGazebo * dzGazebo < 4.4 * 4.4) {
      currentGroundY = this.playerHeight + 0.65;
    }

    if (this.playerY <= currentGroundY) {
      this.velocity.y = 0;
      this.playerY = currentGroundY;
      this.canJump = true;
      this.isJumping = false;
    } else {
      this.canJump = false;
    }

    // World bounds clamp
    this.camera.position.x = Math.max(-56, Math.min(56, this.camera.position.x));
    this.camera.position.z = Math.max(-56, Math.min(56, this.camera.position.z));

    // Dynamic FOV interpolation
    this.targetFov = (this.isSprinting && isMoving)
      ? 76
      : (window.currentStage >= 4 ? 64 : this.baseFov);
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, this.targetFov, delta * 6.0);
    this.camera.updateProjectionMatrix();

    // 3. Head bobbing & footsteps
    let bobOffset = 0;
    if (isMoving && this.canJump) {
      this.bobTimer += delta * (this.isSprinting ? 15 : 10);
      bobOffset = Math.sin(this.bobTimer) * (this.isSprinting ? 0.07 : 0.035);

      if (Math.sin(this.bobTimer) > 0.95 && !this.stepTriggered) {
        this.stepTriggered = true;
        if (window.audioManager) {
          const isNearStone = Math.abs(this.camera.position.x) < 15 && Math.abs(this.camera.position.z) < 15;
          window.audioManager.playFootstep(isNearStone ? 'stone' : 'grass');
        }
      } else if (Math.sin(this.bobTimer) < 0) {
        this.stepTriggered = false;
      }
    } else {
      this.bobTimer = 0;
    }

    this.camera.position.y = this.playerY + bobOffset;

    this.updateRaycast(interactables);
  }

  resolveCollision(currentPos, targetPos) {
    if (!this.world || !this.world.collisionObstacles || this.world.collisionObstacles.length === 0) {
      return targetPos;
    }

    let px = targetPos.x;
    let pz = targetPos.z;
    const r = this.playerRadius;

    // Run 3 solver passes for smooth corner and multi-obstacle sliding
    for (let pass = 0; pass < 3; pass++) {
      for (const obs of this.world.collisionObstacles) {
        if (obs.type === 'box') {
          const cx = Math.max(obs.minX, Math.min(obs.maxX, px));
          const cz = Math.max(obs.minZ, Math.min(obs.maxZ, pz));

          const dx = px - cx;
          const dz = pz - cz;
          const distSq = dx * dx + dz * dz;

          if (distSq < r * r) {
            const dist = Math.sqrt(distSq);
            if (dist > 0.0001) {
              const overlap = r - dist;
              px += (dx / dist) * overlap;
              pz += (dz / dist) * overlap;
            } else {
              const leftD = Math.abs(px - obs.minX);
              const rightD = Math.abs(obs.maxX - px);
              const topD = Math.abs(pz - obs.minZ);
              const botD = Math.abs(obs.maxZ - pz);
              const minD = Math.min(leftD, rightD, topD, botD);

              if (minD === leftD) px = obs.minX - r;
              else if (minD === rightD) px = obs.maxX + r;
              else if (minD === topD) pz = obs.minZ - r;
              else pz = obs.maxZ + r;
            }
          }
        } else if (obs.type === 'cylinder') {
          const dx = px - obs.x;
          const dz = pz - obs.z;
          const minDist = obs.radius + r;
          const distSq = dx * dx + dz * dz;

          if (distSq < minDist * minDist) {
            const dist = Math.sqrt(distSq);
            if (dist > 0.0001) {
              const overlap = minDist - dist;
              px += (dx / dist) * overlap;
              pz += (dz / dist) * overlap;
            } else {
              px += minDist;
            }
          }
        }
      }
    }

    return new THREE.Vector3(px, currentPos.y, pz);
  }

  updateRaycast(interactables) {
    const promptEl = document.getElementById('interact-prompt');
    const crosshair = document.getElementById('crosshair');
    const mobileInteractBtn = document.getElementById('mobile-interact-btn');
    const mobileInteractLabel = document.getElementById('mobile-interact-label');

    if (!this.raycaster || !interactables || interactables.length === 0 || window.inDialogue) {
      this.hoveredObject = null;
      if (promptEl) promptEl.classList.add('hidden');
      if (crosshair) crosshair.classList.remove('hovering-target');
      if (mobileInteractBtn) mobileInteractBtn.classList.remove('active-target');
      if (mobileInteractLabel) mobileInteractLabel.textContent = 'Interact';
      return;
    }

    const tempPos = new THREE.Vector3();
    const filteredInteractables = interactables.filter(obj => {
      if (!obj || !obj.visible) return false;
      if (obj.userData && obj.userData.interactable === false) return false;
      if (obj.userData && obj.userData.isPicked === true) return false;
      obj.getWorldPosition(tempPos);
      return Math.abs(tempPos.y - this.camera.position.y) < 14;
    });

    this.raycaster.setFromCamera(this.rayOrigin, this.camera);
    const intersects = this.raycaster.intersectObjects(filteredInteractables, true);
    const promptText = document.getElementById('interact-text');

    for (const hit of intersects) {
      let target = hit.object;
      while (target && !target.userData?.interactable && target.parent) {
        target = target.parent;
      }

      if (target && target.visible && target.userData?.interactable && !target.userData?.isPicked) {
        const isActive = window.questManager ? window.questManager.isInteractableActive(target) : true;
        if (!isActive) continue;

        this.hoveredObject = target;
        const text = target.userData.promptText || 'Interact';

        if (crosshair) crosshair.classList.add('hovering-target');
        if (mobileInteractBtn) mobileInteractBtn.classList.add('active-target');
        if (mobileInteractLabel) mobileInteractLabel.textContent = text;

        if (promptEl && promptText) {
          promptEl.classList.remove('hidden');
          promptText.textContent = text;
        }
        return;
      }
    }

    this.hoveredObject = null;
    if (crosshair) crosshair.classList.remove('hovering-target');
    if (mobileInteractBtn) mobileInteractBtn.classList.remove('active-target');
    if (mobileInteractLabel) mobileInteractLabel.textContent = 'Interact';
    if (promptEl) promptEl.classList.add('hidden');
  }
}

