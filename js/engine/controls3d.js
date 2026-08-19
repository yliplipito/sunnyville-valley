import * as THREE from 'three';

/**
 * SUNNYVILLE VALLEY - 3D FPS & Adventure Controller
 * Features:
 * - Smooth mouse look with pointer lock
 * - Sliding collision physics against boxes, cylinders, and fences
 * - Dynamic FOV shift during sprint & movement states
 * - Surface-aware head bobbing & procedural footsteps
 * - Accurate raycasting reticle with distance scaling
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

    // Mouse Look (Facing North towards Plaza, Town Hall & Mayor Barnaby)
    this.euler = new THREE.Euler(0, Math.PI, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(this.euler);
    this.mouseSensitivity = 0.0022;
    this.isLocked = false;

    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 9.0;
    this.rayOrigin = new THREE.Vector2(0, 0);
    this.hoveredObject = null;

    this.initEventListeners();
  }

  initEventListeners() {
    this.domElement.addEventListener('click', () => {
      if (!this.isLocked && !window.inDialogue && !window.inNightmareEnding && !window.isPaused) {
        try {
          this.domElement.requestPointerLock?.()?.catch?.(() => {});
        } catch (e) {}
        return;
      }

      if (this.isLocked && this.hoveredObject && !window.inDialogue && window.onInteract) {
        const timeSinceClose = Date.now() - (window.lastDialogueClosedTime || 0);
        if (timeSinceClose > 300) {
          window.onInteract(this.hoveredObject);
        }
      }
    });

    document.addEventListener('pointerlockchange', () => {
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
        const modalOpen = !document.getElementById('notice-board-modal')?.classList.contains('hidden');
        const timeSinceCloseE = Date.now() - (window.lastDialogueClosedTime || 0);
        if (this.hoveredObject && timeSinceCloseE > 300 && !modalOpen && window.onInteract) {
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
    }
  }

  update(delta, interactables = []) {
    if (window.inNightmareEnding) return;
    delta = Math.min(delta || 0.016, 0.05);

    // Damping & Gravity
    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;
    this.velocity.y -= this.gravity * delta;

    // Direction calculation
    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();

    const speed = this.isSprinting ? this.sprintSpeed : this.walkSpeed;

    if (this.moveForward || this.moveBackward) {
      this.velocity.z -= this.direction.z * speed * 10.0 * delta;
    }
    if (this.moveLeft || this.moveRight) {
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
    this.targetFov = (this.isSprinting && (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight))
      ? 76
      : (window.currentStage >= 4 ? 64 : this.baseFov);
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, this.targetFov, delta * 6.0);
    this.camera.updateProjectionMatrix();

    // 3. Head bobbing & footsteps (Visual offset added only on solid ground)
    let bobOffset = 0;
    const isMoving = (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight);
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
          // Find closest point on box to circle center
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
              // Deep inside, push out to nearest edge
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
    if (!this.raycaster || !interactables || interactables.length === 0 || window.inDialogue) {
      this.hoveredObject = null;
      const promptEl = document.getElementById('interact-prompt');
      const crosshair = document.getElementById('crosshair');
      if (promptEl) promptEl.classList.add('hidden');
      if (crosshair) crosshair.classList.remove('hovering-target');
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

    const crosshair = document.getElementById('crosshair');
    const promptEl = document.getElementById('interact-prompt');
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
        if (crosshair) crosshair.classList.add('hovering-target');
        if (promptEl && promptText) {
          promptEl.classList.remove('hidden');
          promptText.textContent = target.userData.promptText || 'Interact';
        }
        return;
      }
    }

    this.hoveredObject = null;
    if (crosshair) crosshair.classList.remove('hovering-target');
    if (promptEl) promptEl.classList.add('hidden');
  }
}
