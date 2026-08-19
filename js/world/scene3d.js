import * as THREE from 'three';

/**
 * SUNNYVILLE VALLEY - Visually Rich 3D World Scene & Dynamic Environment Engine
 * High-quality low-poly Nintendo / Animal Crossing aesthetic with detailed buildings,
 * fountain ripples, animated butterflies, chimney smoke, procedural grass tufts,
 * creeping forest mist, and progressive dynamic atmosphere transitions.
 */
export class WorldScene3D {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;

    this.sunLight = null;
    this.ambientLight = null;
    this.skyMesh = null;
    this.fog = null;
    this.sunMesh = null;
    this.fountainWater = null;
    this.fountainParticles = null;
    this.clouds = [];
    this.trees = [];
    this.grassTufts = [];
    this.lampLights = [];
    this.windowMeshes = [];
    this.butterflies = [];
    this.chimneySmoke = [];
    this.forestMistParticles = null;
    this.voidAshParticles = null;

    // Clock tower hands for dynamic time distortion
    this.clockHandH = null;
    this.clockHandM = null;

    // Eclipsed Nightmare Eye
    this.bloodEyeMesh = null;
    this.eyeSclera = null;
    this.eyeIris = null;
    this.eyePupil = null;

    this.pickableFlowers = [];
    this.interactableObjects = [];
    this.collisionObstacles = [];

    this.corruptionRatio = 0.0;
    this.currentSkyColor = new THREE.Color(0x87CEEB);
    this.targetSkyColor = new THREE.Color(0x87CEEB);
    this.currentFogColor = new THREE.Color(0x87CEEB);
    this.targetFogColor = new THREE.Color(0x87CEEB);
  }

  buildWorld() {
    this.initSkyAndLighting();
    this.buildTerrainAndPlaza();
    this.buildProceduralGrassTufts();
    this.buildTownFountain();
    this.buildTownBuildings();
    this.buildFoliage();
    this.buildFlowerBeds();
    this.buildForbiddenWellAndWoods();
    this.buildDecorations();
    this.buildButterfliesAndAmbient();
    this.buildParticleEffects();
    this.buildEclipsedNightmareEye();
    this.buildWaypointBeacon();
  }

  initSkyAndLighting() {
    this.fog = new THREE.FogExp2(0x87CEEB, 0.007);
    this.scene.fog = this.fog;

    this.ambientLight = new THREE.AmbientLight(0xFFFBEB, 1.4);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xFFF3D6, 1.8);
    this.sunLight.position.set(32, 54, 26);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 160;
    this.sunLight.shadow.camera.left = -65;
    this.sunLight.shadow.camera.right = 65;
    this.sunLight.shadow.camera.top = 65;
    this.sunLight.shadow.camera.bottom = -65;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Sky Dome
    const skyGeo = new THREE.SphereGeometry(125, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide });
    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyMesh);

    // Cheerful Sun Mesh
    const sunGroup = new THREE.Group();
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xFFD54F });
    const sunCore = new THREE.Mesh(new THREE.SphereGeometry(4.5, 20, 20), sunMat);
    sunGroup.add(sunCore);

    // Golden Sun Rays
    const rayMat = new THREE.MeshBasicMaterial({ color: 0xFFE082 });
    for (let r = 0; r < 8; r++) {
      const ray = new THREE.Mesh(new THREE.ConeGeometry(0.8, 3.2, 4), rayMat);
      const angle = (r / 8) * Math.PI * 2;
      ray.position.set(Math.cos(angle) * 5.8, Math.sin(angle) * 5.8, 0);
      ray.rotation.z = angle - Math.PI / 2;
      sunGroup.add(ray);
    }

    sunGroup.position.set(40, 68, 34);
    sunGroup.lookAt(0, 0, 0);
    this.sunMesh = sunGroup;
    this.scene.add(sunGroup);

    this.buildClouds();
  }

  buildClouds() {
    const cloudMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.94 });
    for (let i = 0; i < 18; i++) {
      const cloudGroup = new THREE.Group();
      const numPuffs = 4 + Math.floor(Math.random() * 4);
      for (let j = 0; j < numPuffs; j++) {
        const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(2.8 + Math.random() * 2.0, 1), cloudMat);
        puff.position.set((j - numPuffs / 2) * 2.5, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.6);
        cloudGroup.add(puff);
      }
      cloudGroup.position.set(
        (Math.random() - 0.5) * 130,
        34 + Math.random() * 18,
        (Math.random() - 0.5) * 130
      );
      this.clouds.push(cloudGroup);
      this.scene.add(cloudGroup);
    }
  }

  buildTerrainAndPlaza() {
    // Lush rolling green terrain
    const groundGeo = new THREE.PlaneGeometry(160, 160, 32, 32);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x58C472 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.groundMesh = ground;

    // Main Central Plaza with Cobblestone Pavers
    const plazaGeo = new THREE.CircleGeometry(15.2, 36);
    const plazaMat = new THREE.MeshLambertMaterial({ color: 0xEDE8E1 });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = 0.02;
    plaza.receiveShadow = true;
    this.scene.add(plaza);

    // Decorative Stone Curb Ring
    const ringGeo = new THREE.RingGeometry(14.9, 15.6, 36);
    const ringMat = new THREE.MeshLambertMaterial({ color: 0x94A3B8 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.03;
    this.scene.add(ring);

    // Radiating Cobblestone Walkways
    this.buildPath(0, 0, 0, 26, 4.4);    // North to Town Hall
    this.buildPath(0, 0, 24, 0, 3.8);    // East to Bakery
    this.buildPath(0, 0, -24, 0, 3.8);   // West to Happy Mart
    this.buildPath(0, 0, 0, -44, 3.4);   // South to Whispering Woods & Well
    this.buildPath(0, 0, 24, -14, 3.2);  // Southeast to Gazebo
    this.buildPath(0, 0, -24, -14, 3.2); // Southwest to Pet Yard
  }

  buildPath(x1, z1, x2, z2, width) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const length = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dx, dz);

    const path = new THREE.Mesh(
      new THREE.PlaneGeometry(width, length),
      new THREE.MeshLambertMaterial({ color: 0xE2DDD5 })
    );
    path.rotation.x = -Math.PI / 2;
    path.rotation.z = angle;
    path.position.set((x1 + x2) / 2, 0.015, (z1 + z2) / 2);
    path.receiveShadow = true;
    this.scene.add(path);
  }

  createCircularParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.85)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  buildProceduralGrassTufts() {
    const grassBladeGeo = new THREE.ConeGeometry(0.12, 0.65, 3);
    const grassMat1 = new THREE.MeshLambertMaterial({ color: 0x48B862 });
    const grassMat2 = new THREE.MeshLambertMaterial({ color: 0x66CC7A });

    for (let i = 0; i < 110; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 17 + Math.random() * 38;
      const gx = Math.cos(angle) * radius;
      const gz = Math.sin(angle) * radius;

      // Skip areas in buildings or central paths
      if (Math.abs(gx) < 3.2 && gz > -48 && gz < 28) continue;
      if (Math.abs(gz) < 3.2 && Math.abs(gx) < 28) continue;

      const tuftGroup = new THREE.Group();
      const numBlades = 3 + Math.floor(Math.random() * 3);

      for (let b = 0; b < numBlades; b++) {
        const blade = new THREE.Mesh(grassBladeGeo, (b % 2 === 0) ? grassMat1 : grassMat2);
        blade.position.set((Math.random() - 0.5) * 0.25, 0.32, (Math.random() - 0.5) * 0.25);
        blade.rotation.x = (Math.random() - 0.5) * 0.35;
        blade.rotation.z = (Math.random() - 0.5) * 0.35;
        blade.rotation.y = Math.random() * Math.PI * 2;
        tuftGroup.add(blade);
      }

      tuftGroup.position.set(gx, 0, gz);
      this.scene.add(tuftGroup);
      this.grassTufts.push(tuftGroup);
    }
  }

  // --- ORNATE TOWN FOUNTAIN ---
  buildTownFountain() {
    const group = new THREE.Group();
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0xE2E8F0 });
    const darkStoneMat = new THREE.MeshLambertMaterial({ color: 0x94A3B8 });

    // Lower Octagonal Basin
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.8, 1.1, 16), stoneMat);
    basin.position.y = 0.55;
    basin.castShadow = true;
    basin.receiveShadow = true;
    group.add(basin);

    const basinRim = new THREE.Mesh(new THREE.TorusGeometry(4.7, 0.22, 8, 16), darkStoneMat);
    basinRim.position.y = 1.1;
    basinRim.rotation.x = Math.PI / 2;
    group.add(basinRim);

    // Fluted Central Pedestal
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 2.6, 16), stoneMat);
    pillar.position.y = 1.4;
    pillar.castShadow = true;
    group.add(pillar);

    // Upper Tier Basin
    const upperBasin = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.6, 16), stoneMat);
    upperBasin.position.y = 2.65;
    upperBasin.castShadow = true;
    group.add(upperBasin);

    // Golden Dolphin / Spire Finial
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.1, 12), new THREE.MeshLambertMaterial({ color: 0xF59E0B }));
    spire.position.y = 3.5;
    group.add(spire);

    // Sparkling Blue Fountain Water
    const waterGeo = new THREE.CircleGeometry(4.3, 24);
    const waterMat = new THREE.MeshLambertMaterial({
      color: 0x38BDF8,
      transparent: true,
      opacity: 0.9
    });
    this.fountainWater = new THREE.Mesh(waterGeo, waterMat);
    this.fountainWater.rotation.x = -Math.PI / 2;
    this.fountainWater.position.y = 0.98;
    group.add(this.fountainWater);

    // Wish Coins on Basin Floor
    this.fountainCoins = [];
    const coinGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 10);
    const coinMat = new THREE.MeshLambertMaterial({ color: 0xFBBF24 });
    for (let c = 0; c < 6; c++) {
      const cAngle = (c / 6) * Math.PI * 2 + 0.3;
      const cDist = 1.8 + (c % 2) * 1.2;
      const coin = new THREE.Mesh(coinGeo, coinMat.clone());
      coin.position.set(Math.cos(cAngle) * cDist, 0.99, Math.sin(cAngle) * cDist);
      coin.rotation.x = (Math.random() - 0.5) * 0.2;
      coin.rotation.z = (Math.random() - 0.5) * 0.2;
      group.add(coin);
      this.fountainCoins.push(coin);
    }

    // Water Splash Particles
    const count = 45;
    const pGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 0.8;
      pos[i + 1] = 2.8 + Math.random() * 1.4;
      pos[i + 2] = (Math.random() - 0.5) * 0.8;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    if (!this.particleTex) this.particleTex = this.createCircularParticleTexture();
    this.fountainParticles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        map: this.particleTex,
        color: 0xBAE6FD,
        size: 0.35,
        transparent: true,
        opacity: 0.85,
        depthWrite: false
      })
    );
    group.add(this.fountainParticles);

    group.position.set(0, 0, 0);
    group.userData = {
      interactable: true,
      type: 'fountain',
      promptText: 'Toss a Coin in Fountain'
    };
    this.fountainGroup = group;
    this.scene.add(group);
    this.interactableObjects.push(group);

    this.collisionObstacles.push({ type: 'cylinder', x: 0, z: 0, radius: 4.9 });
  }

  buildTownBuildings() {
    this.buildBakery(24, 9);
    this.buildHappyMart(-24, 9);
    this.buildTownHall(0, 30);
    this.buildGazebo(24, -14);
    this.buildPetYard(-24, -14);
  }

  // --- SUNSHINE BAKERY ---
  buildBakery(x, z) {
    const group = new THREE.Group();
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xFEF3C7 });
    const roofMat = new THREE.MeshLambertMaterial({ color: 0xEA580C });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350F });
    const pastryMat = new THREE.MeshLambertMaterial({ color: 0xD97706 });

    // Main Storehouse Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(9.8, 6.8, 8.8), wallMat);
    body.position.y = 3.4;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Warm Shingle Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(7.8, 4.4, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 8.4;
    roof.castShadow = true;
    group.add(roof);

    // Brick Chimney with Drifting Smoke
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.3, 3.4, 1.3), new THREE.MeshLambertMaterial({ color: 0x991B1B }));
    chimney.position.set(2.6, 8.6, 1.6);
    chimney.castShadow = true;
    group.add(chimney);

    // Chimney Smoke Puffs
    for (let s = 0; s < 4; s++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(0.35 + s * 0.15, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.7 - s * 0.15 })
      );
      puff.position.set(2.6 + (Math.random() - 0.5) * 0.2, 10.4 + s * 0.8, 1.6 + (Math.random() - 0.5) * 0.2);
      group.add(puff);
      this.chimneySmoke.push({ mesh: puff, basePosY: 10.4 + s * 0.8, speed: 0.8 + s * 0.2 });
    }

    // Scalloped Red-and-White Striped Awning
    const awning = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.45, 2.5), new THREE.MeshLambertMaterial({ color: 0xF43F5E }));
    awning.position.set(0, 3.9, -4.9);
    awning.rotation.x = 0.22;
    group.add(awning);

    // Bakery Shop Signboard
    const sign = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.3, 0.35), new THREE.MeshLambertMaterial({ color: 0xFDE68A }));
    sign.position.set(0, 5.2, -4.4);
    group.add(sign);

    // Glowing Warm Display Window
    const win = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.5), new THREE.MeshBasicMaterial({ color: 0xFDE047 }));
    win.position.set(1.9, 3.0, -4.42);
    win.rotation.y = Math.PI;
    group.add(win);
    this.windowMeshes.push(win);

    // Pastry Cafe Table with Croissants & Treats
    const table = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.12, 16), woodMat);
    table.position.set(-2.5, 0.95, -6.2);
    group.add(table);

    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.95, 8), woodMat);
    leg.position.set(-2.5, 0.48, -6.2);
    group.add(leg);

    const treat1 = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.08, 6, 12), pastryMat);
    treat1.position.set(-2.3, 1.06, -6.1);
    treat1.rotation.x = Math.PI / 2;
    group.add(treat1);

    const treat2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), new THREE.MeshLambertMaterial({ color: 0xEC4899 }));
    treat2.position.set(-2.7, 1.1, -6.3);
    group.add(treat2);

    group.position.set(x, 0, z);
    this.scene.add(group);

    // Bakery Main Building Collision Obstacle
    this.collisionObstacles.push({
      type: 'box',
      minX: x - 5.2,
      maxX: x + 5.2,
      minZ: z - 5.2,
      maxZ: z + 5.2
    });

    // Solid Bakery Cafe Table Collision Obstacle
    this.collisionObstacles.push({
      type: 'cylinder',
      x: x - 2.5,
      z: z - 6.2,
      radius: 1.35
    });
  }

  // --- HAPPY MART ---
  buildHappyMart(x, z) {
    const group = new THREE.Group();
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xBAE6FD });
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x0284C7 });
    const awningMat = new THREE.MeshLambertMaterial({ color: 0xFBBF24 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(9.8, 6.8, 8.8), wallMat);
    body.position.y = 3.4;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(7.8, 4.0, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 8.2;
    roof.castShadow = true;
    group.add(roof);

    const awning = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.45, 2.5), awningMat);
    awning.position.set(0, 3.9, -4.9);
    awning.rotation.x = 0.22;
    group.add(awning);

    const win = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.6), new THREE.MeshBasicMaterial({ color: 0xFEF08A }));
    win.position.set(1.6, 3.0, -4.42);
    win.rotation.y = Math.PI;
    group.add(win);
    this.windowMeshes.push(win);

    // Retro Soda Vending Machine outside
    const sodaMachine = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.6, 1.2), new THREE.MeshLambertMaterial({ color: 0xEF4444 }));
    sodaMachine.position.set(-2.8, 1.3, -4.9);
    sodaMachine.castShadow = true;
    group.add(sodaMachine);

    const sodaDisplay = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.1), new THREE.MeshBasicMaterial({ color: 0x38BDF8 }));
    sodaDisplay.position.set(-2.8, 1.8, -5.52);
    sodaDisplay.rotation.y = Math.PI;
    group.add(sodaDisplay);

    group.position.set(x, 0, z);
    this.scene.add(group);

    this.collisionObstacles.push({
      type: 'box',
      minX: x - 5.2,
      maxX: x + 5.2,
      minZ: z - 5.2,
      maxZ: z + 5.2
    });
  }

  // --- GRAND TOWN HALL ---
  buildTownHall(x, z) {
    const group = new THREE.Group();
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0xF8FAFC });
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x1E3A8A });
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xF59E0B });

    const body = new THREE.Mesh(new THREE.BoxGeometry(15.5, 8.8, 11.5), stoneMat);
    body.position.y = 4.4;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Grand Entrance Pillars
    for (let i = -5.8; i <= 5.8; i += 3.8) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.68, 8.4, 14), stoneMat);
      p.position.set(i, 4.2, -6.1);
      p.castShadow = true;
      group.add(p);
    }

    const pediment = new THREE.Mesh(new THREE.ConeGeometry(10.8, 4.8, 4), roofMat);
    pediment.rotation.y = Math.PI / 4;
    pediment.position.y = 11.0;
    pediment.castShadow = true;
    group.add(pediment);

    // Clock Tower & Spire
    const tower = new THREE.Mesh(new THREE.BoxGeometry(4.0, 7.8, 4.0), stoneMat);
    tower.position.set(0, 12.5, 0);
    group.add(tower);

    const clock = new THREE.Mesh(new THREE.CircleGeometry(1.4, 18), new THREE.MeshBasicMaterial({ color: 0xFFFFFF }));
    clock.position.set(0, 14.0, -2.02);
    clock.rotation.y = Math.PI;
    group.add(clock);

    const handHGeo = new THREE.BoxGeometry(0.12, 0.65, 0.05);
    handHGeo.translate(0, 0.325, 0);
    this.clockHandH = new THREE.Mesh(handHGeo, new THREE.MeshBasicMaterial({ color: 0x0F172A }));
    this.clockHandH.position.set(0, 14.0, -2.06);
    this.clockHandH.rotation.z = 0.5;
    group.add(this.clockHandH);

    const handMGeo = new THREE.BoxGeometry(0.08, 0.95, 0.05);
    handMGeo.translate(0, 0.475, 0);
    this.clockHandM = new THREE.Mesh(handMGeo, new THREE.MeshBasicMaterial({ color: 0x0F172A }));
    this.clockHandM.position.set(0, 14.0, -2.06);
    this.clockHandM.rotation.z = -1.1;
    group.add(this.clockHandM);

    const spire = new THREE.Mesh(new THREE.ConeGeometry(3.2, 5.8, 4), roofMat);
    spire.rotation.y = Math.PI / 4;
    spire.position.y = 18.6;
    group.add(spire);

    const weatherVane = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 6), goldMat);
    weatherVane.position.y = 22.0;
    group.add(weatherVane);

    const winL = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.0), new THREE.MeshBasicMaterial({ color: 0xFDE047 }));
    winL.position.set(-4.0, 4.6, -5.8);
    winL.rotation.y = Math.PI;
    group.add(winL);
    this.windowMeshes.push(winL);

    const winR = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.0), new THREE.MeshBasicMaterial({ color: 0xFDE047 }));
    winR.position.set(4.0, 4.6, -5.8);
    winR.rotation.y = Math.PI;
    group.add(winR);
    this.windowMeshes.push(winR);

    group.position.set(x, 0, z);
    this.scene.add(group);

    this.collisionObstacles.push({
      type: 'box',
      minX: x - 8.2,
      maxX: x + 8.2,
      minZ: z - 6.8,
      maxZ: z + 6.8
    });
  }

  // --- GARDEN GAZEBO ---
  buildGazebo(x, z) {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x8D6E63 });
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0xE2E8F0 });
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x10B981 });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.7, 0.65, 8), stoneMat);
    base.position.y = 0.32;
    base.receiveShadow = true;
    group.add(base);

    // 8 Individual Columns with accurate thin collision posts
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const px = Math.cos(angle) * 3.8;
      const pz = Math.sin(angle) * 3.8;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 3.8, 8), woodMat);
      post.position.set(px, 2.2, pz);
      post.castShadow = true;
      group.add(post);

      // Add individual post collision so player can walk freely inside!
      this.collisionObstacles.push({
        type: 'cylinder',
        x: x + px,
        z: z + pz,
        radius: 0.38
      });
    }

    const roof = new THREE.Mesh(new THREE.ConeGeometry(5.0, 2.8, 8), roofMat);
    roof.position.y = 5.0;
    roof.castShadow = true;
    group.add(roof);

    group.position.set(x, 0, z);
    this.scene.add(group);
  }

  // --- PET YARD ---
  buildPetYard(x, z) {
    const group = new THREE.Group();
    const postMat = new THREE.MeshLambertMaterial({ color: 0xF8FAFC });
    const railMat = new THREE.MeshLambertMaterial({ color: 0xE2E8F0 });

    // Helper to build connected fence panel between two points (x1, z1) -> (x2, z2)
    const addFenceSegment = (x1, z1, x2, z2, picketsCount = 5) => {
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);
      const midX = (x1 + x2) / 2;
      const midZ = (z1 + z2) / 2;

      // Top rail
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, len), railMat);
      topRail.position.set(midX, 0.95, midZ);
      topRail.rotation.y = angle;
      topRail.castShadow = true;
      group.add(topRail);

      // Bottom rail
      const btmRail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, len), railMat);
      btmRail.position.set(midX, 0.35, midZ);
      btmRail.rotation.y = angle;
      btmRail.castShadow = true;
      group.add(btmRail);

      // Vertical pickets
      for (let i = 0; i <= picketsCount; i++) {
        const t = i / picketsCount;
        const px = x1 + dx * t;
        const pz = z1 + dz * t;
        const picket = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.15, 0.05), postMat);
        picket.position.set(px, 0.58, pz);
        picket.rotation.y = angle;
        picket.castShadow = true;
        group.add(picket);

        // Pointed picket top
        const cap = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.16, 4), postMat);
        cap.position.set(px, 1.20, pz);
        cap.rotation.y = angle + Math.PI / 4;
        group.add(cap);
      }
    };

    // Left fence: (-4.8, 4.0) to (-4.8, -4.8)
    addFenceSegment(-4.8, 4.0, -4.8, -4.8, 9);
    // Right fence: (4.8, 4.0) to (4.8, -4.8)
    addFenceSegment(4.8, 4.0, 4.8, -4.8, 9);
    // Back fence: (-4.8, -4.8) to (4.8, -4.8)
    addFenceSegment(-4.8, -4.8, 4.8, -4.8, 10);
    // Front left fence: (-4.8, 4.0) to (-1.5, 4.0)
    addFenceSegment(-4.8, 4.0, -1.5, 4.0, 4);
    // Front right fence: (1.5, 4.0) to (4.8, 4.0)
    addFenceSegment(1.5, 4.0, 4.8, 4.0, 4);

    // Sturdy gate entrance posts
    [-1.5, 1.5].forEach(gx => {
      const gatePost = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.35, 0.24), postMat);
      gatePost.position.set(gx, 0.68, 4.0);
      gatePost.castShadow = true;
      group.add(gatePost);
      const postCap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), postMat);
      postCap.position.set(gx, 1.42, 4.0);
      group.add(postCap);
    });

    // Dog House
    const doghouse = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, 2.8), new THREE.MeshLambertMaterial({ color: 0xDC2626 }));
    doghouse.position.set(2.4, 1.1, -1.8);
    doghouse.castShadow = true;
    group.add(doghouse);

    const dogRoof = new THREE.Mesh(new THREE.ConeGeometry(2.5, 1.6, 4), new THREE.MeshLambertMaterial({ color: 0x451A03 }));
    dogRoof.rotation.y = Math.PI / 4;
    dogRoof.position.set(2.4, 2.8, -1.8);
    dogRoof.castShadow = true;
    group.add(dogRoof);

    // Dog Doorway Arch
    const doorway = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 0.2), new THREE.MeshLambertMaterial({ color: 0x1E293B }));
    doorway.position.set(2.4, 0.7, -0.38);
    group.add(doorway);

    group.position.set(x, 0, z);
    this.scene.add(group);

    // Fence Perimeter Collision (Leaves open center gate from x-1.6 to x+1.6)
    this.collisionObstacles.push({ type: 'box', minX: x - 5.0, maxX: x - 1.5, minZ: z + 3.8, maxZ: z + 4.2 }); // Front left fence
    this.collisionObstacles.push({ type: 'box', minX: x + 1.5, maxX: x + 5.0, minZ: z + 3.8, maxZ: z + 4.2 }); // Front right fence
    this.collisionObstacles.push({ type: 'box', minX: x - 5.0, maxX: x - 4.6, minZ: z - 5.0, maxZ: z + 4.0 }); // Left fence
    this.collisionObstacles.push({ type: 'box', minX: x + 4.6, maxX: x + 5.0, minZ: z - 5.0, maxZ: z + 4.0 }); // Right fence
    this.collisionObstacles.push({ type: 'box', minX: x - 5.0, maxX: x + 5.0, minZ: z - 5.0, maxZ: z - 4.6 }); // Back fence
    this.collisionObstacles.push({ type: 'box', minX: x + 1.0, maxX: x + 3.8, minZ: z - 3.2, maxZ: z - 0.4 }); // Doghouse
  }

  buildFoliage() {
    const treeCoords = [
      { x: -12, z: 12 }, { x: 12, z: 12 }, { x: -12, z: -12 }, { x: 12, z: -12 },
      { x: -18, z: 20 }, { x: 18, z: 20 }, { x: -32, z: -2 }, { x: 32, z: -2 },
      { x: -35, z: 22 }, { x: 35, z: 22 }, { x: -20, z: -28 }, { x: 20, z: -28 }
    ];

    treeCoords.forEach(pos => {
      this.buildCuteTree(pos.x, pos.z);
      this.collisionObstacles.push({ type: 'cylinder', x: pos.x, z: pos.z, radius: 1.1 });
    });

    // Deep Whispering Woods perimeter with open clearings for the well and balloon
    for (let x = -50; x <= 50; x += 6.5) {
      for (let z = -36; z >= -58; z -= 6.0) {
        const jx = x + (Math.random() - 0.5) * 2.5;
        const jz = z + (Math.random() - 0.5) * 2.5;
        // Keep clear path to Well at (0, -44) and Balloon at (-4, -46)
        const distToWell = Math.hypot(jx - 0, jz - (-44));
        const distToBalloon = Math.hypot(jx - (-4), jz - (-46));
        const inCenterAisle = Math.abs(jx) < 3.2 && jz > -42;

        if (distToWell > 4.5 && distToBalloon > 3.8 && !inCenterAisle) {
          this.buildPineTree(jx, jz);
          this.collisionObstacles.push({ type: 'cylinder', x: jx, z: jz, radius: 1.0 });
        }
      }
    }
  }

  buildCuteTree(x, z) {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.65, 3.6, 8), new THREE.MeshLambertMaterial({ color: 0x78350F }));
    trunk.position.y = 1.8;
    trunk.castShadow = true;
    group.add(trunk);

    const puff1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.7, 1), new THREE.MeshLambertMaterial({ color: 0x22C55E }));
    puff1.position.y = 4.6;
    puff1.castShadow = true;
    group.add(puff1);

    const puff2 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.1, 1), new THREE.MeshLambertMaterial({ color: 0x16A34A }));
    puff2.position.set(0.6, 5.8, 0.4);
    puff2.castShadow = true;
    group.add(puff2);

    group.position.set(x, 0, z);
    this.scene.add(group);
    this.trees.push(group);
  }

  buildPineTree(x, z) {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.54, 4.4, 6), new THREE.MeshLambertMaterial({ color: 0x451A03 }));
    trunk.position.y = 2.2;
    trunk.castShadow = true;
    group.add(trunk);

    const needleMat = new THREE.MeshLambertMaterial({ color: 0x15803D });
    for (let i = 0; i < 3; i++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(3.3 - i * 0.75, 3.6, 7), needleMat);
      cone.position.y = 4.2 + i * 2.2;
      cone.castShadow = true;
      group.add(cone);
    }

    group.position.set(x, 0, z);
    this.scene.add(group);
    this.trees.push(group);
  }

  buildFlowerBeds() {
    // 3 Golden Sunflowers for Bouquet Quest at distinct scenic locations
    const spots = [
      { x: 9.5, z: 6.5, id: 1 },   // Near East Walkway Planter
      { x: -9.5, z: 6.0, id: 2 },  // Near West Walkway Planter
      { x: 9.5, z: -6.5, id: 3 }   // Near South Gazebo Planter
    ];

    spots.forEach(pos => {
      const flower = this.buildPickableSunflower(pos.x, pos.z, pos.id);
      this.pickableFlowers.push(flower);
      this.interactableObjects.push(flower);
    });

    // Elevated Wooden Planter Boxes
    this.buildPlanterBox(9.5, 6.5, 4.5, 2.2);
    this.buildPlanterBox(-9.5, 6.0, 4.5, 2.2);
    this.buildPlanterBox(9.5, -6.5, 4.5, 2.2);
    this.buildPlanterBox(-9.5, -6.5, 4.5, 2.2);
  }

  buildPlanterBox(x, z, width, depth) {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350F });
    const soilMat = new THREE.MeshLambertMaterial({ color: 0x3E2723 });

    const border = new THREE.Mesh(new THREE.BoxGeometry(width, 0.4, depth), woodMat);
    border.position.y = 0.2;
    border.castShadow = true;
    group.add(border);

    const soil = new THREE.Mesh(new THREE.BoxGeometry(width - 0.4, 0.35, depth - 0.4), soilMat);
    soil.position.y = 0.22;
    group.add(soil);

    const flowerColors = [0xEF4444, 0xF43F5E, 0x8B5CF6, 0x38BDF8, 0xF59E0B, 0xEC4899];
    // Structured, non-overlapping decorative flower grid (leaving (0,0) center clear for Sunflower)
    const flowerOffsets = [
      { fx: -1.5, fz: -0.45 },
      { fx: -1.5, fz: 0.45 },
      { fx: -0.75, fz: -0.45 },
      { fx: -0.75, fz: 0.45 },
      { fx: 0.75, fz: -0.45 },
      { fx: 0.75, fz: 0.45 },
      { fx: 1.5, fz: -0.45 },
      { fx: 1.5, fz: 0.45 }
    ];

    flowerOffsets.forEach((pos, idx) => {
      const col = flowerColors[idx % flowerColors.length];
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.45, 6),
        new THREE.MeshLambertMaterial({ color: 0x16A34A })
      );
      stem.position.set(pos.fx, 0.45, pos.fz);
      group.add(stem);

      const blossom = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.14, 0),
        new THREE.MeshLambertMaterial({ color: col })
      );
      blossom.position.set(pos.fx, 0.68, pos.fz);
      group.add(blossom);
    });

    group.position.set(x, 0, z);
    this.scene.add(group);
  }

  buildPickableSunflower(x, z, id) {
    const group = new THREE.Group();
    const stemMat = new THREE.MeshLambertMaterial({ color: 0x16A34A });
    const petalMat = new THREE.MeshLambertMaterial({ color: 0xFBBF24 });
    const centerMat = new THREE.MeshLambertMaterial({ color: 0x78350F });

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.3, 6), stemMat);
    stem.position.y = 0.65;
    group.add(stem);

    const center = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.1, 12), centerMat);
    center.position.set(0, 1.3, 0);
    center.rotation.x = Math.PI / 4;
    group.add(center);

    for (let p = 0; p < 8; p++) {
      const angle = (p / 8) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.48, 0.05), petalMat);
      petal.position.set(Math.cos(angle) * 0.44, 1.3 + Math.sin(angle) * 0.44, 0);
      petal.rotation.z = angle;
      group.add(petal);
    }

    group.position.set(x, 0, z);
    group.userData = {
      interactable: true,
      type: 'flower',
      id: id,
      promptText: 'Pick Golden Sunflower',
      isPicked: false
    };

    this.scene.add(group);
    return group;
  }

  buildForbiddenWellAndWoods() {
    const group = new THREE.Group();
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x64748B });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x3E2723 });

    const wellCylinder = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.1, 1.5, 16), stoneMat);
    wellCylinder.position.y = 0.75;
    wellCylinder.castShadow = true;
    group.add(wellCylinder);

    const voidMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const wellVoid = new THREE.Mesh(new THREE.CircleGeometry(1.7, 16), voidMat);
    wellVoid.rotation.x = -Math.PI / 2;
    wellVoid.position.y = 1.45;
    group.add(wellVoid);

    const post1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.8, 0.2), woodMat);
    post1.position.set(-1.5, 1.9, 0);
    group.add(post1);

    const post2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.8, 0.2), woodMat);
    post2.position.set(1.5, 1.9, 0);
    group.add(post2);

    const wellRoof = new THREE.Mesh(new THREE.ConeGeometry(2.3, 1.3, 4), woodMat);
    wellRoof.rotation.y = Math.PI / 4;
    wellRoof.position.y = 3.8;
    group.add(wellRoof);

    const plank1 = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.1, 0.45), woodMat);
    plank1.position.set(0, 1.52, 0.35);
    group.add(plank1);

    const plank2 = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.1, 0.45), woodMat);
    plank2.position.set(0, 1.52, -0.35);
    group.add(plank2);

    this.wellPlanks = [plank1, plank2];
    this.wellGroup = group;

    // Placed deep in Whispering Woods clearing
    group.position.set(0, 0, -44);
    group.userData = {
      interactable: true,
      type: 'well',
      promptText: 'Inspect Boarded Well'
    };
    this.scene.add(group);
    this.interactableObjects.push(group);

    this.collisionObstacles.push({ type: 'cylinder', x: 0, z: -44, radius: 2.3 });

    // Lost Red Balloon in peaceful meadow orchard near apple trees (far from well)
    this.buildRedBalloon(18.5, -16.0);
  }

  buildRedBalloon(x, z) {
    const group = new THREE.Group();
    const balloon = new THREE.Mesh(
      new THREE.SphereGeometry(0.72, 16, 16),
      new THREE.MeshLambertMaterial({ color: 0xEF4444 })
    );
    balloon.scale.set(1, 1.28, 1);
    balloon.position.y = 2.5;
    group.add(balloon);

    const stringMat = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 1.5, 0),
        new THREE.Vector3(0.1, 0.75, 0),
        new THREE.Vector3(0, 0, 0)
      ]),
      stringMat
    );
    group.add(line);

    group.position.set(x, 0, z);
    group.userData = {
      interactable: true,
      type: 'balloon',
      promptText: 'Retrieve Red Balloon',
      isCollected: false
    };

    this.scene.add(group);
    this.balloonGroup = group;
    this.interactableObjects.push(group);
  }

  buildDecorations() {
    this.streetLamps = [];
    const lampCoords = [{ x: -8, z: 8 }, { x: 8, z: 8 }, { x: 8, z: -8 }, { x: -8, z: -8 }];
    lampCoords.forEach((pos, idx) => {
      const lamp = this.buildStreetLamp(pos.x, pos.z, idx);
      this.scene.add(lamp);
      this.collisionObstacles.push({ type: 'cylinder', x: pos.x, z: pos.z, radius: 0.5 });
    });

    // North Bench where Old Man Gregory sits
    this.buildParkBench(0, 9.2, 0);

    // Town Hall Morning Festival Bell
    this.buildTownBell(0, 23.6);

    // Town Square Notice Board
    this.buildTownNoticeBoard(6.8, 11.2);

    // Squeaky Rubber Toy Ball in Open Park Lawn
    this.buildDogBall(-8.0, 16.0);

    // Daisy's Green Watering Can near East Planter
    this.buildWateringCan(8.2, 5.2);

    // Bakery Flour Sack outside Happy Mart Front Porch (Sitting on Wooden Mini-Pallet)
    this.buildFlourSack(-20.5, 2.8);

    // Fresh Blueberries Basket near Gazebo Picnic Area
    this.buildBerryBasket(26.5, -6.8);

    // Old Man Gregory's Vintage Pocket Watch on Plaza Pedestal (East of fountain)
    this.buildGoldenWatch(5.6, 2.2);

    // Festival Pennant Bunting between Street Lamps
    this.buildFestivalBunting();

    // Courtyard Picnic Table near Bakery
    this.buildPicnicTable(16.5, -6.5);

    // Sunshine Bakery Window Flower Boxes
    this.buildBakeryWindowBoxes(24, 9);
  }

  buildWateringCan(x, z) {
    const group = new THREE.Group();
    const greenMat = new THREE.MeshLambertMaterial({ color: 0x10B981 });
    const metalMat = new THREE.MeshLambertMaterial({ color: 0x64748B });

    // Can Cylinder
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.45, 12), greenMat);
    body.position.y = 0.225;
    body.castShadow = true;
    group.add(body);

    // Spout
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.45, 8), metalMat);
    spout.position.set(0.22, 0.32, 0);
    spout.rotation.z = -Math.PI / 3.5;
    group.add(spout);

    // Handle
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 6, 12, Math.PI), metalMat);
    handle.position.set(-0.12, 0.35, 0);
    handle.rotation.z = -Math.PI / 2;
    group.add(handle);

    group.position.set(x, 0, z);
    group.userData = {
      interactable: true,
      type: 'watering_can',
      promptText: 'Pick up Daisy’s Watering Can',
      isCollected: false
    };

    this.scene.add(group);
    this.wateringCanGroup = group;
    this.interactableObjects.push(group);
  }

  buildFlourSack(x, z) {
    const group = new THREE.Group();
    const sackMat = new THREE.MeshLambertMaterial({ color: 0xF5F5F4 }); // Clean linen flour sack
    const tieMat = new THREE.MeshLambertMaterial({ color: 0x92400E });  // Jute rope tie
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350F }); // Wooden pallet
    const stampMat = new THREE.MeshLambertMaterial({ color: 0xD97706 }); // Golden wheat stamp

    // Wooden delivery pallet base
    const pallet = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.09, 0.95), woodMat);
    pallet.position.y = 0.045;
    pallet.castShadow = true;
    group.add(pallet);

    // Bulging plump sack body
    const basePouch = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), sackMat);
    basePouch.position.y = 0.38;
    basePouch.scale.set(1.1, 0.9, 1.0);
    basePouch.castShadow = true;
    group.add(basePouch);

    const midBody = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.44, 0.45, 12), sackMat);
    midBody.position.y = 0.45;
    midBody.castShadow = true;
    group.add(midBody);

    // Stamped golden wheat badge on sack face
    const stamp = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.02), stampMat);
    stamp.position.set(0, 0.45, 0.44);
    group.add(stamp);

    // Tied Jute Rope Neck
    const neck = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.04, 6, 12), tieMat);
    neck.position.y = 0.68;
    neck.rotation.x = Math.PI / 2;
    group.add(neck);

    // Flared Ruffled Top with white flour dusting
    const flaredTop = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.24, 10), sackMat);
    flaredTop.position.y = 0.80;
    flaredTop.castShadow = true;
    group.add(flaredTop);

    const flourDust = new THREE.Mesh(new THREE.CircleGeometry(0.22, 8), new THREE.MeshBasicMaterial({ color: 0xFFFFFF }));
    flourDust.rotation.x = -Math.PI / 2;
    flourDust.position.y = 0.81;
    group.add(flourDust);

    group.position.set(x, 0, z);
    group.userData = {
      interactable: true,
      type: 'flour_sack',
      promptText: 'Pick up Sack of Flour',
      isCollected: false
    };

    this.scene.add(group);
    this.flourSackGroup = group;
    this.interactableObjects.push(group);
  }

  buildBerryBasket(x, z) {
    const group = new THREE.Group();
    const wickerMat = new THREE.MeshLambertMaterial({ color: 0x92400E });
    const blueMat = new THREE.MeshLambertMaterial({ color: 0x3B82F6 });
    const darkBlueMat = new THREE.MeshLambertMaterial({ color: 0x1E40AF });

    // Woven Wicker Basket
    const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.28, 0.35, 12), wickerMat);
    basket.position.y = 0.175;
    basket.castShadow = true;
    group.add(basket);

    // Mounded Blueberries
    for (let b = 0; b < 12; b++) {
      const angle = (b / 12) * Math.PI * 2;
      const dist = (b % 2 === 0) ? 0.18 : 0.09;
      const berry = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 8, 8),
        (b % 2 === 0) ? blueMat : darkBlueMat
      );
      berry.position.set(Math.cos(angle) * dist, 0.32 + (b % 3) * 0.04, Math.sin(angle) * dist);
      group.add(berry);
    }

    group.position.set(x, 0, z);
    group.userData = {
      interactable: true,
      type: 'berry_basket',
      promptText: 'Pick up Basket of Blueberries',
      isCollected: false
    };

    this.scene.add(group);
    this.berryBasketGroup = group;
    this.interactableObjects.push(group);
  }

  buildGoldenWatch(x, z) {
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0xE2E8F0 });
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xF59E0B });
    const faceMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

    // Permanent Stone Display Pedestal Stand (remains in scene)
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.85, 12), stoneMat);
    pedestal.position.set(x, 0.425, z);
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    this.scene.add(pedestal);

    // Collectable Watch Mesh Group (ONLY the watch item)
    const group = new THREE.Group();

    // Pocket Watch Casing
    const watch = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 14), goldMat);
    watch.position.y = 0.89;
    watch.castShadow = true;
    group.add(watch);

    const face = new THREE.Mesh(new THREE.CircleGeometry(0.16, 14), faceMat);
    face.position.set(0, 0.935, 0);
    face.rotation.x = -Math.PI / 2;
    group.add(face);

    // Fob Chain
    const fob = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 6, 10), goldMat);
    fob.position.set(0.24, 0.89, 0);
    group.add(fob);

    group.position.set(x, 0, z);
    group.userData = {
      interactable: true,
      type: 'watch',
      promptText: 'Pick up Mayor’s Golden Pocket Watch',
      isCollected: false
    };

    this.scene.add(group);
    this.goldenWatchGroup = group;
    this.interactableObjects.push(group);
    this.collisionObstacles.push({ type: 'cylinder', x: x, z: z, radius: 0.45 });
  }

  buildFestivalBunting() {
    this.buntingFlags = [];
    const lampCoords = [
      { x: -8, z: 8 },
      { x: 8, z: 8 },
      { x: 8, z: -8 },
      { x: -8, z: -8 },
      { x: -8, z: 8 } // loop
    ];

    const flagColors = [0xEF4444, 0xF59E0B, 0x10B981, 0x3B82F6, 0xEC4899, 0x8B5CF6];

    // Shared flag shape (cute triangular banner)
    const flagShape = new THREE.Shape();
    flagShape.moveTo(-0.16, 0);
    flagShape.lineTo(0.16, 0);
    flagShape.lineTo(0, -0.38);
    flagShape.closePath();
    const flagGeo = new THREE.ShapeGeometry(flagShape);

    for (let i = 0; i < lampCoords.length - 1; i++) {
      const p1 = lampCoords[i];
      const p2 = lampCoords[i + 1];
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const spanAngle = Math.atan2(dx, dz);

      // 1. Catenary hanging string line
      const stringPoints = [];
      const numSegments = 16;
      for (let s = 0; s <= numSegments; s++) {
        const st = s / numSegments;
        const sx = p1.x + dx * st;
        const sz = p1.z + dz * st;
        const ssag = Math.sin(st * Math.PI) * 0.42;
        stringPoints.push(new THREE.Vector3(sx, 3.85 - ssag, sz));
      }
      const stringGeo = new THREE.BufferGeometry().setFromPoints(stringPoints);
      const stringMat = new THREE.LineBasicMaterial({ color: 0x94A3B8, linewidth: 2 });
      const stringLine = new THREE.Line(stringGeo, stringMat);
      this.scene.add(stringLine);

      // 2. Hanging pennant flags along the curve
      const numFlags = 7;
      for (let f = 1; f <= numFlags; f++) {
        const t = f / (numFlags + 1);
        const fx = p1.x + dx * t;
        const fz = p1.z + dz * t;
        const sag = Math.sin(t * Math.PI) * 0.42;
        const fy = 3.85 - sag;

        const flagMat = new THREE.MeshLambertMaterial({
          color: flagColors[(i * numFlags + f) % flagColors.length],
          side: THREE.DoubleSide
        });

        const flag = new THREE.Mesh(flagGeo, flagMat);
        flag.position.set(fx, fy, fz);
        flag.rotation.y = spanAngle + Math.PI / 2;
        this.scene.add(flag);
        this.buntingFlags.push({ mesh: flag, origY: fy, origColor: flagMat.color.getHex() });
      }
    }
  }

  buildPicnicTable(x, z) {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshLambertMaterial({ color: 0xA16207 });
    const legMat = new THREE.MeshLambertMaterial({ color: 0x451A03 });

    // Tabletop
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 1.3), woodMat);
    top.position.y = 0.85;
    top.castShadow = true;
    group.add(top);

    // Table Legs
    for (let lx of [-0.9, 0.9]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.85, 1.1), legMat);
      leg.position.set(lx, 0.425, 0);
      group.add(leg);
    }

    // Benches
    for (let bz of [-0.95, 0.95]) {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 0.38), woodMat);
      bench.position.set(0, 0.5, bz);
      group.add(bench);
    }

    group.position.set(x, 0, z);
    this.scene.add(group);
    this.collisionObstacles.push({ type: 'box', minX: x - 1.4, maxX: x + 1.4, minZ: z - 1.2, maxZ: z + 1.2 });
  }

  buildBakeryWindowBoxes(bx, bz) {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350F });
    const flowerColors = [0xF472B6, 0xC084FC, 0xFDE047, 0x6EE7B7];

    for (let wx of [bx - 2.8, bx + 2.8]) {
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.24, 0.35), woodMat);
      box.position.set(wx, 1.8, bz - 4.9);
      group.add(box);

      // Cute blossoms inside planter
      for (let fl = 0; fl < 5; fl++) {
        const blossom = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.12, 0),
          new THREE.MeshLambertMaterial({ color: flowerColors[fl % flowerColors.length] })
        );
        blossom.position.set(wx - 0.6 + fl * 0.3, 2.0, bz - 4.9);
        group.add(blossom);
      }
    }

    this.scene.add(group);
  }

  buildTownBell(x, z) {
    const group = new THREE.Group();
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xF59E0B });
    const darkWood = new THREE.MeshLambertMaterial({ color: 0x451A03 });

    // Hanging Beam Mount
    const beam = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.22, 0.22), darkWood);
    beam.position.set(0, 4.6, 0);
    group.add(beam);

    // Bronze Bell Body
    const bellGroup = new THREE.Group();
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.58, 0.72, 16), goldMat);
    bell.position.y = 4.1;
    bell.castShadow = true;
    bellGroup.add(bell);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.08, 8, 16), goldMat);
    rim.position.y = 3.75;
    rim.rotation.x = Math.PI / 2;
    bellGroup.add(rim);

    // Hanging Pull Rope
    const rope = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1.9, 6),
      new THREE.MeshLambertMaterial({ color: 0xD97706 })
    );
    rope.position.y = 2.7;
    bellGroup.add(rope);

    const handle = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0xDC2626 })
    );
    handle.position.y = 1.75;
    bellGroup.add(handle);

    group.add(bellGroup);
    this.bellMesh = bellGroup;
    this.bellRingTime = 0;

    group.position.set(x, 0, z);
    group.userData = {
      interactable: true,
      type: 'bell',
      promptText: 'Ring the Morning Festival Bell'
    };

    this.scene.add(group);
    this.interactableObjects.push(group);
  }

  ringBell() {
    this.bellRingTime = 1.6;
  }

  buildTownNoticeBoard(x, z) {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350F });
    const corkMat = new THREE.MeshLambertMaterial({ color: 0xD97706 });
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x1E3A8A });

    // Two Posts
    const postL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.8, 0.16), woodMat);
    postL.position.set(-1.1, 1.4, 0);
    postL.castShadow = true;
    group.add(postL);

    const postR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.8, 0.16), woodMat);
    postR.position.set(1.1, 1.4, 0);
    postR.castShadow = true;
    group.add(postR);

    // Corkboard Frame & Board
    const board = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.5, 0.08), corkMat);
    board.position.set(0, 1.9, 0);
    group.add(board);

    // Mini Roof Awning
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 0.45), roofMat);
    roof.position.set(0, 2.7, 0);
    roof.rotation.x = 0.15;
    group.add(roof);

    // Pinned Colorful Notes
    const noteColors = [0xFEF08A, 0xBAE6FD, 0xFBCFE8, 0xBBF7D0];
    for (let n = 0; n < 4; n++) {
      const note = new THREE.Mesh(
        new THREE.PlaneGeometry(0.42, 0.38),
        new THREE.MeshBasicMaterial({ color: noteColors[n] })
      );
      note.position.set(-0.6 + (n % 2) * 0.8, 1.6 + Math.floor(n / 2) * 0.5, 0.05);
      group.add(note);
    }

    group.position.set(x, 0, z);
    group.rotation.y = -Math.PI / 6;
    group.userData = {
      interactable: true,
      type: 'noticeboard',
      promptText: 'Read Town Notice Board'
    };

    this.scene.add(group);
    this.interactableObjects.push(group);
    this.collisionObstacles.push({ type: 'cylinder', x: x, z: z, radius: 1.2 });
  }

  buildDogBall(x, z) {
    const group = new THREE.Group();
    const ballMat = new THREE.MeshLambertMaterial({ color: 0xEF4444 });
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 14), ballMat);
    ball.position.y = 0.32;
    ball.castShadow = true;
    group.add(ball);

    // Decorative Yellow Star band
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(0.33, 0.04, 6, 16),
      new THREE.MeshBasicMaterial({ color: 0xFBBF24 })
    );
    band.position.y = 0.32;
    band.rotation.x = Math.PI / 4;
    group.add(band);

    group.position.set(x, 0, z);
    group.userData = {
      interactable: true,
      type: 'ball',
      promptText: 'Pick up Squeaky Toy',
      isCollected: false
    };

    this.scene.add(group);
    this.dogBallGroup = group;
    this.interactableObjects.push(group);
  }

  buildStreetLamp(x, z, index = 0) {
    const group = new THREE.Group();
    const ironMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 4.0, 8), ironMat);
    post.position.y = 2.0;
    post.castShadow = true;
    group.add(post);

    const lanternMat = new THREE.MeshBasicMaterial({ color: 0x64748B });
    const lantern = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.42, 0),
      lanternMat
    );
    lantern.position.y = 4.0;
    group.add(lantern);

    const light = new THREE.PointLight(0xFDE68A, 0.2, 16);
    light.position.y = 4.0;
    group.add(light);
    this.lampLights.push(light);
    group.position.set(x, 0, z);
    group.userData = {
      interactable: true,
      type: 'lamp',
      lampIndex: index,
      isLit: false,
      lanternMesh: lantern,
      pointLight: light,
      promptText: 'Light Festival Lantern'
    };

    this.streetLamps.push(group);
    this.interactableObjects.push(group);
    return group;
  }

  lightStreetLamp(index) {
    const lamp = this.streetLamps?.[index];
    if (!lamp || lamp.userData.isLit) return;
    lamp.userData.isLit = true;
    if (lamp.userData.lanternMesh) {
      lamp.userData.lanternMesh.material.color.setHex(0xFEF08A);
    }
    if (lamp.userData.pointLight) {
      lamp.userData.pointLight.intensity = 1.8;
      lamp.userData.pointLight.distance = 22;
    }
  }

  buildParkBench(x, z, rotY) {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350F });
    const ironMat = new THREE.MeshLambertMaterial({ color: 0x1E293B });

    const seat = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.14, 0.9), woodMat);
    seat.position.y = 0.55;
    group.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.8, 0.12), woodMat);
    back.position.set(0, 1.05, -0.4);
    group.add(back);

    const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 0.9), ironMat);
    leg1.position.set(-1.3, 0.275, 0);
    group.add(leg1);

    const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 0.9), ironMat);
    leg2.position.set(1.3, 0.275, 0);
    group.add(leg2);

    group.position.set(x, 0, z);
    group.rotation.y = rotY;
    this.scene.add(group);

    this.collisionObstacles.push({
      type: 'box',
      minX: x - 1.8,
      maxX: x + 1.8,
      minZ: z - 0.7,
      maxZ: z + 0.7
    });
  }

  buildButterfliesAndAmbient() {
    const bColors = [0xFDE047, 0x38BDF8, 0xF472B6];
    for (let b = 0; b < 6; b++) {
      const bGroup = new THREE.Group();
      const wingMat = new THREE.MeshBasicMaterial({ color: bColors[b % bColors.length], side: THREE.DoubleSide });

      const wingL = new THREE.Mesh(new THREE.CircleGeometry(0.12, 6), wingMat);
      wingL.position.x = -0.1;
      bGroup.add(wingL);

      const wingR = new THREE.Mesh(new THREE.CircleGeometry(0.12, 6), wingMat);
      wingR.position.x = 0.1;
      bGroup.add(wingR);

      const centerPos = (b < 3) ? new THREE.Vector3(9.5, 1.2, 6.5) : new THREE.Vector3(-9.5, 1.2, 6.0);
      bGroup.position.copy(centerPos);

      this.butterflies.push({
        group: bGroup,
        wingL,
        wingR,
        center: centerPos,
        angle: b * 1.2,
        speed: 1.2 + (b % 3) * 0.4
      });

      this.scene.add(bGroup);
    }
  }

  buildParticleEffects() {
    // 1. Forest Mist Particles around the well
    const mistCount = 40;
    const mistGeo = new THREE.BufferGeometry();
    const mistPos = new Float32Array(mistCount * 3);
    for (let m = 0; m < mistCount * 3; m += 3) {
      mistPos[m] = (Math.random() - 0.5) * 45;
      mistPos[m + 1] = 0.4 + Math.random() * 1.8;
      mistPos[m + 2] = -34 - Math.random() * 22;
    }
    mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPos, 3));
    if (!this.particleTex) this.particleTex = this.createCircularParticleTexture();
    this.forestMistParticles = new THREE.Points(
      mistGeo,
      new THREE.PointsMaterial({
        map: this.particleTex,
        color: 0xE2E8F0,
        size: 2.2,
        transparent: true,
        opacity: 0.25,
        depthWrite: false
      })
    );
    this.scene.add(this.forestMistParticles);

    // 2. Twilight / Atmosphere Dust Particles
    const ashCount = 80;
    const ashGeo = new THREE.BufferGeometry();
    const ashPos = new Float32Array(ashCount * 3);
    for (let a = 0; a < ashCount * 3; a += 3) {
      ashPos[a] = (Math.random() - 0.5) * 80;
      ashPos[a + 1] = Math.random() * 25;
      ashPos[a + 2] = (Math.random() - 0.5) * 80;
    }
    ashGeo.setAttribute('position', new THREE.BufferAttribute(ashPos, 3));
    this.voidAshParticles = new THREE.Points(
      ashGeo,
      new THREE.PointsMaterial({
        map: this.particleTex,
        color: 0xEF4444,
        size: 0.35,
        transparent: true,
        opacity: 0.0,
        depthWrite: false
      })
    );
    this.scene.add(this.voidAshParticles);
  }

  buildEclipsedNightmareEye() {
    const group = new THREE.Group();
    const scleraGeo = new THREE.RingGeometry(9, 22, 32);
    const scleraMat = new THREE.MeshBasicMaterial({
      color: 0x7F1D1D,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0
    });
    this.eyeSclera = new THREE.Mesh(scleraGeo, scleraMat);
    group.add(this.eyeSclera);

    const irisGeo = new THREE.CircleGeometry(9, 32);
    const irisMat = new THREE.MeshBasicMaterial({
      color: 0xDC2626,
      transparent: true,
      opacity: 0.0
    });
    this.eyeIris = new THREE.Mesh(irisGeo, irisMat);
    this.eyeIris.position.z = 0.1;
    group.add(this.eyeIris);

    const pupilGeo = new THREE.BoxGeometry(1.8, 14, 0.2);
    const pupilMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.0
    });
    this.eyePupil = new THREE.Mesh(pupilGeo, pupilMat);
    this.eyePupil.position.z = 0.2;
    group.add(this.eyePupil);

    group.position.set(0, 56, -75);
    group.rotation.x = 0.5;
    this.bloodEyeMesh = group;
    this.scene.add(group);
  }

  setCorruption(ratio) {
    this.corruptionRatio = Math.max(0, Math.min(1, ratio));

    // Continuous Multi-Stop Gradient Interpolation (Imperceptible, organic drift)
    // 0.00 -> Serene Morning Sky (0x87CEEB)
    // 0.35 -> Soft Afternoon Blue (0x90C8F2)
    // 0.60 -> Mellow Warm Golden Blue (0x85A8D8)
    // 0.80 -> Twilight Violet Sky (0x4A4E7A)
    // 1.00 -> Pitch Eclipse Void (0x0F0D1A)
    const r = this.corruptionRatio;

    if (r <= 0.35) {
      const f = r / 0.35;
      this.targetSkyColor.lerpColors(new THREE.Color(0x87CEEB), new THREE.Color(0x90C8F2), f);
      this.targetFogColor.lerpColors(new THREE.Color(0x87CEEB), new THREE.Color(0x90C8F2), f);
      if (this.groundMesh) this.groundMesh.material.color.lerpColors(new THREE.Color(0x58C472), new THREE.Color(0x52BC6C), f);
      if (this.fountainWater) this.fountainWater.material.color.lerpColors(new THREE.Color(0x38BDF8), new THREE.Color(0x0284C7), f);
    } else if (r <= 0.65) {
      const f = (r - 0.35) / 0.30;
      this.targetSkyColor.lerpColors(new THREE.Color(0x90C8F2), new THREE.Color(0x85A8D8), f);
      this.targetFogColor.lerpColors(new THREE.Color(0x90C8F2), new THREE.Color(0x85A8D8), f);
      if (this.groundMesh) this.groundMesh.material.color.lerpColors(new THREE.Color(0x52BC6C), new THREE.Color(0x48A85E), f);
      if (this.fountainWater) this.fountainWater.material.color.lerpColors(new THREE.Color(0x0284C7), new THREE.Color(0x0369A1), f);
    } else if (r <= 0.85) {
      const f = (r - 0.65) / 0.20;
      this.targetSkyColor.lerpColors(new THREE.Color(0x85A8D8), new THREE.Color(0x4A4E7A), f);
      this.targetFogColor.lerpColors(new THREE.Color(0x85A8D8), new THREE.Color(0x3E4065), f);
      if (this.groundMesh) this.groundMesh.material.color.lerpColors(new THREE.Color(0x48A85E), new THREE.Color(0x2E683D), f);
      if (this.fountainWater) this.fountainWater.material.color.lerpColors(new THREE.Color(0x0369A1), new THREE.Color(0x1E3A8A), f);
    } else {
      const f = (r - 0.85) / 0.15;
      this.targetSkyColor.lerpColors(new THREE.Color(0x4A4E7A), new THREE.Color(0x0F0D1A), f);
      this.targetFogColor.lerpColors(new THREE.Color(0x3E4065), new THREE.Color(0x09080E), f);
      if (this.groundMesh) this.groundMesh.material.color.lerpColors(new THREE.Color(0x2E683D), new THREE.Color(0x132B1A), f);
      if (this.fountainWater) this.fountainWater.material.color.lerpColors(new THREE.Color(0x1E3A8A), new THREE.Color(0x0A0F1D), f);
    }

    // Update Wish Coins in Fountain
    if (this.fountainCoins) {
      const coinColor = this.corruptionRatio >= 0.75 ? 0x1E293B : (this.corruptionRatio >= 0.45 ? 0x78350F : 0xFBBF24);
      this.fountainCoins.forEach(coin => {
        coin.material.color.setHex(coinColor);
      });
    }

    // Update Festival Bunting Flags
    if (this.buntingFlags) {
      this.buntingFlags.forEach(flagObj => {
        if (this.corruptionRatio >= 0.80) {
          flagObj.mesh.material.color.setHex(0x1E293B);
        } else if (this.corruptionRatio >= 0.55) {
          flagObj.mesh.material.color.setHex(0x64748B);
        } else {
          flagObj.mesh.material.color.setHex(flagObj.origColor);
        }
      });
    }
  }

  buildWaypointBeacon() {
    const group = new THREE.Group();

    // Glowing golden diamond
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xFDE047 });
    const diamond = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), beaconMat);
    diamond.position.y = 2.7;
    group.add(diamond);

    // Downward pointing arrow cone
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.40, 8), beaconMat);
    cone.position.y = 2.2;
    cone.rotation.x = Math.PI;
    group.add(cone);

    // Glowing beam pillar
    const pillarMat = new THREE.MeshBasicMaterial({
      color: 0xFDE047,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide
    });
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.42, 3.2, 8, 1, true), pillarMat);
    pillar.position.y = 1.6;
    group.add(pillar);

    group.visible = false;
    this.waypointBeacon = group;
    this.waypointDiamond = diamond;
    this.scene.add(group);
  }

  setWaypointTarget(pos) {
    if (!this.waypointBeacon) return;
    if (pos) {
      this.waypointBeacon.position.set(pos.x, (pos.y || 0), pos.z);
      this.waypointBeacon.visible = true;
    } else {
      this.waypointBeacon.visible = false;
    }
  }

  update(delta) {
    // Smooth frame-by-frame exponential color lerp
    this.currentSkyColor.lerp(this.targetSkyColor, delta * 0.8);
    this.currentFogColor.lerp(this.targetFogColor, delta * 0.8);

    if (this.skyMesh) this.skyMesh.material.color.copy(this.currentSkyColor);
    if (this.fog) this.fog.color.copy(this.currentFogColor);

    // Animate 3D Waypoint Beacon
    if (this.waypointBeacon && this.waypointBeacon.visible && this.waypointDiamond) {
      const t = performance.now() * 0.001;
      this.waypointDiamond.rotation.y += delta * 2.5;
      this.waypointDiamond.position.y = 2.7 + Math.sin(t * 3.5) * 0.12;
    }

    // Drifting clouds
    this.clouds.forEach(c => {
      c.position.x += delta * 1.4;
      if (c.position.x > 75) c.position.x = -75;
    });

    // Sun & Sun Rays rotation
    if (this.sunMesh) {
      this.sunMesh.rotation.z += delta * 0.1;
      if (this.corruptionRatio >= 0.75) {
        this.sunMesh.visible = false;
      } else {
        this.sunMesh.visible = true;
      }
    }

    // Clock hands time manipulation
    if (this.clockHandM && this.clockHandH) {
      if (this.corruptionRatio < 0.5) {
        this.clockHandM.rotation.z -= delta * 0.2;
        this.clockHandH.rotation.z -= delta * 0.02;
      } else {
        // Corrupted erratic reverse spin!
        this.clockHandM.rotation.z += delta * (2.0 + this.corruptionRatio * 4.0);
        this.clockHandH.rotation.z += delta * (0.8 + this.corruptionRatio * 2.0);
      }
    }

    // Chimney smoke animation
    this.chimneySmoke.forEach(s => {
      s.mesh.position.y += delta * s.speed;
      s.mesh.scale.multiplyScalar(1.0 + delta * 0.2);
      if (s.mesh.position.y > s.basePosY + 3.2) {
        s.mesh.position.y = s.basePosY;
        s.mesh.scale.set(1, 1, 1);
      }
    });

    // Animated butterflies
    const t = Date.now() * 0.003;
    this.butterflies.forEach(b => {
      if (this.corruptionRatio >= 0.7) {
        b.group.visible = false;
        return;
      }
      b.angle += delta * b.speed;
      b.group.position.x = b.center.x + Math.cos(b.angle) * 1.8;
      b.group.position.z = b.center.z + Math.sin(b.angle) * 1.8;
      b.group.position.y = b.center.y + Math.sin(b.angle * 3) * 0.4;
      b.wingL.rotation.y = Math.sin(t * 18) * 0.8;
      b.wingR.rotation.y = -Math.sin(t * 18) * 0.8;
    });

    // Fountain particles
    if (this.fountainParticles) {
      const pos = this.fountainParticles.geometry.attributes.position.array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] += delta * (this.corruptionRatio > 0.8 ? -1.0 : 1.2);
        if (pos[i] > 4.2 || pos[i] < 1.0) pos[i] = 2.6;
      }
      this.fountainParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Forest Mist drift
    if (this.forestMistParticles) {
      const pos = this.forestMistParticles.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i] += Math.sin(t + i) * 0.015;
      }
      this.forestMistParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Void Ash drift
    if (this.voidAshParticles) {
      if (this.corruptionRatio >= 0.6) {
        this.voidAshParticles.material.opacity = Math.min(0.85, (this.corruptionRatio - 0.5) * 1.8);
        const pos = this.voidAshParticles.geometry.attributes.position.array;
        for (let i = 1; i < pos.length; i += 3) {
          pos[i] -= delta * 1.5;
          if (pos[i] < 0.2) pos[i] = 24.0;
        }
        this.voidAshParticles.geometry.attributes.position.needsUpdate = true;
      } else {
        this.voidAshParticles.material.opacity = 0.0;
      }
    }

    if (this.balloonGroup) {
      this.balloonGroup.position.y = Math.sin(Date.now() * 0.0025) * 0.35;
    }

    // Bell swing animation
    if (this.bellMesh && this.bellRingTime > 0) {
      this.bellRingTime -= delta;
      this.bellMesh.rotation.z = Math.sin(Date.now() * 0.018) * (this.bellRingTime * 0.4);
    } else if (this.bellMesh) {
      this.bellMesh.rotation.z = 0;
    }

    // Eclipsed Nightmare Eye awakening in the sky
    if (this.bloodEyeMesh && this.corruptionRatio >= 0.75) {
      const s = 1.0 + Math.sin(Date.now() * 0.004) * 0.12;
      this.bloodEyeMesh.scale.set(s, s, 1);
      const eyeOpacity = Math.min(1.0, (this.corruptionRatio - 0.75) * 4.0);
      if (this.eyeSclera) this.eyeSclera.material.opacity = eyeOpacity * 0.92;
      if (this.eyeIris) this.eyeIris.material.opacity = eyeOpacity * 0.95;
      if (this.eyePupil) this.eyePupil.material.opacity = eyeOpacity;
    }
  }
}
