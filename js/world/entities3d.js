import * as THREE from 'three';

/**
 * SUNNYVILLE VALLEY - Stylized 3D Character Models & Dynamic Animations
 * High-quality low-poly Nintendo / Animal Crossing aesthetic with expressive details,
 * articulated limbs, idle breathing, eye-tracking, smooth proximity-faded nameplates, and dynamic character transitions.
 */
export class EntityManager3D {
  constructor(scene) {
    this.scene = scene;
    this.npcs = [];
    this.interactables = [];
    this.stalkerEntity = null;
    this.isStalkerChasing = false;
    this.corruptionRatio = 0.0;

    this.npcPitchMap = {
      mayor: 290,
      daisy: 540,
      baker: 380,
      timmy: 640,
      dog: 450,
      gregory: 220,
      stalker: 110
    };
  }

  getNPC(id) {
    return this.npcs.find(n => n.id === id) || null;
  }

  spawnAllEntities() {
    // 1. Mayor Barnaby (North Plaza Steps, X: 0, Z: 18)
    const mayor = this.createMayor(0, 18);
    this.npcs.push(mayor);
    this.interactables.push(mayor.group);

    // 2. Daisy the Flower Girl (Plaza Walkway, X: 6.2, Z: 4.2)
    const daisy = this.createDaisy(6.2, 4.2);
    this.npcs.push(daisy);
    this.interactables.push(daisy.group);

    // 3. Baker Benny (Outside Sunshine Bakery Counter, X: 24.5, Z: 1.8)
    const baker = this.createBaker(24.5, 1.8);
    this.npcs.push(baker);
    this.interactables.push(baker.group);

    // 4. Little Timmy (Open Walkway near Happy Mart, X: -16.5, Z: 2.2)
    const timmy = this.createTimmy(-16.5, 2.2);
    this.npcs.push(timmy);
    this.interactables.push(timmy.group);

    // 5. Buster the Dog (In Pet Yard, X: -22, Z: -12.5)
    const dog = this.createDog(-22, -12.5);
    this.npcs.push(dog);
    this.interactables.push(dog.group);

    // 6. Old Man Gregory (Sitting on Plaza Bench, X: 0, Z: 9.2)
    const gregory = this.createGregory(0, 9.2);
    this.npcs.push(gregory);
    this.interactables.push(gregory.group);

    // 7. The Shadow Stalker Entity (Whispering Woods)
    this.createShadowStalker();
  }

  createNameplateSprite(nameText, emojiIcon, bgColor = '#FF6B8B') {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 110;
    const ctx = canvas.getContext('2d');

    const drawNameplate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;

      ctx.fillStyle = bgColor;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 5;

      const r = 32;
      const x = 14, y = 14, w = 372, h = 82;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emojiIcon + ' ' + nameText, canvas.width / 2, 55);
    };

    drawNameplate();

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: true, depthWrite: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.2, 0.6, 1);
    sprite.userData = { canvas, ctx, texture, drawNameplate, nameText, emojiIcon };

    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (sprite.userData && sprite.userData.drawNameplate) {
          sprite.userData.drawNameplate();
          sprite.userData.texture.needsUpdate = true;
        }
      }).catch(() => {});
    }

    return sprite;
  }

  spawnHeartParticles(x, y, z) {
    const heartMat = new THREE.MeshLambertMaterial({ color: 0xF472B6 });
    for (let i = 0; i < 6; i++) {
      const heart = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14, 0), heartMat);
      heart.position.set(
        x + (Math.random() - 0.5) * 0.8,
        y + 1.2 + (Math.random() - 0.5) * 0.3,
        z + (Math.random() - 0.5) * 0.8
      );
      this.scene.add(heart);

      const startTime = performance.now();
      const vx = (Math.random() - 0.5) * 0.012;
      const vz = (Math.random() - 0.5) * 0.012;

      const anim = () => {
        const elapsed = (performance.now() - startTime) / 1000;
        if (elapsed < 0.75) {
          heart.position.y += 0.018;
          heart.position.x += vx;
          heart.position.z += vz;
          heart.scale.multiplyScalar(0.96);
          requestAnimationFrame(anim);
        } else {
          this.scene.remove(heart);
          heart.geometry.dispose();
        }
      };
      requestAnimationFrame(anim);
    }
  }

  // --- MAYOR BARNABY ---
  createMayor(x, z) {
    const group = new THREE.Group();
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xFCD5B5 });
    const navyMat = new THREE.MeshLambertMaterial({ color: 0x1E3A8A });
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xF59E0B });
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    const redMat = new THREE.MeshLambertMaterial({ color: 0xDC2626 });
    const shoeMat = new THREE.MeshLambertMaterial({ color: 0x111827 });

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.48, 18, 18), skinMat);
    head.position.y = 1.8;
    head.castShadow = true;
    group.add(head);

    // Distinguished Handlebar Mustache
    const mustacheL = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.38, 8), whiteMat);
    mustacheL.position.set(-0.16, 1.66, 0.44);
    mustacheL.rotation.z = Math.PI / 2.5;
    mustacheL.rotation.x = -Math.PI / 4.5;
    group.add(mustacheL);

    const mustacheR = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.38, 8), whiteMat);
    mustacheR.position.set(0.16, 1.66, 0.44);
    mustacheR.rotation.z = -Math.PI / 2.5;
    mustacheR.rotation.x = -Math.PI / 4.5;
    group.add(mustacheR);

    this.addCuteEyes(head, 0.06, 0.44);

    // Monocle with dangling gold chain
    const monocle = new THREE.Mesh(new THREE.RingGeometry(0.09, 0.13, 16), goldMat);
    monocle.position.set(0.2, 1.86, 0.46);
    group.add(monocle);

    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 6), goldMat);
    chain.position.set(0.28, 1.72, 0.44);
    chain.rotation.z = 0.4;
    group.add(chain);

    // Stovepipe Top Hat
    const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.06, 18), navyMat);
    hatBrim.position.y = 2.18;
    group.add(hatBrim);

    const hatCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.48, 0.82, 18), navyMat);
    hatCrown.position.y = 2.6;
    hatCrown.castShadow = true;
    group.add(hatCrown);

    const goldBand = new THREE.Mesh(new THREE.CylinderGeometry(0.51, 0.51, 0.14, 18), redMat);
    goldBand.position.y = 2.28;
    group.add(goldBand);

    // Tailcoat Body & Red Bowtie
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.60, 1.15, 14), navyMat);
    body.position.y = 1.05;
    body.castShadow = true;
    group.add(body);

    const shirt = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.40, 0.85, 10), whiteMat);
    shirt.position.set(0, 1.15, 0.28);
    shirt.scale.set(0.7, 1, 0.5);
    group.add(shirt);

    const bowtie = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.08), redMat);
    bowtie.position.set(0, 1.48, 0.52);
    group.add(bowtie);

    // Gold Pocket Watch Chain across vest
    const vestChain = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.02, 6, 12, Math.PI), goldMat);
    vestChain.position.set(0, 1.02, 0.52);
    vestChain.rotation.x = Math.PI / 2;
    group.add(vestChain);

    // Articulated Arms & White Gloves
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.65, 8), navyMat);
    armL.position.set(-0.58, 1.12, 0.05);
    armL.rotation.z = 0.22;
    armL.castShadow = true;
    group.add(armL);

    const gloveL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), whiteMat);
    gloveL.position.set(-0.66, 0.76, 0.08);
    group.add(gloveL);

    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.65, 8), navyMat);
    armR.position.set(0.58, 1.12, 0.05);
    armR.rotation.z = -0.22;
    armR.castShadow = true;
    group.add(armR);

    const gloveR = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), whiteMat);
    gloveR.position.set(0.66, 0.76, 0.08);
    group.add(gloveR);

    // Trousers & Dress Shoes
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.5, 8), navyMat);
    legL.position.set(-0.24, 0.28, 0);
    legL.castShadow = true;
    group.add(legL);

    const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.32), shoeMat);
    shoeL.position.set(-0.24, 0.06, 0.08);
    group.add(shoeL);

    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.5, 8), navyMat);
    legR.position.set(0.24, 0.28, 0);
    legR.castShadow = true;
    group.add(legR);

    const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.32), shoeMat);
    shoeR.position.set(0.24, 0.06, 0.08);
    group.add(shoeR);

    const nameplate = this.createNameplateSprite("Mayor Barnaby", "🎩", "#1E3A8A");
    nameplate.position.y = 3.35;
    group.add(nameplate);

    group.position.set(x, 0, z);
    group.rotation.y = Math.PI;
    group.userData = {
      interactable: true,
      id: 'mayor',
      name: 'Mayor Barnaby',
      avatar: '🎩',
      promptText: 'Talk to Mayor Barnaby'
    };

    this.scene.add(group);
    return { id: 'mayor', group, head, nameplate, initialPos: new THREE.Vector3(x, 0, z) };
  }

  // --- DAISY THE FLOWER GIRL ---
  createDaisy(x, z) {
    const group = new THREE.Group();
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xFFE0BD });
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const dressMat = new THREE.MeshLambertMaterial({ color: 0xFF6B8B });
    const apronMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    const strawMat = new THREE.MeshLambertMaterial({ color: 0xFDE68A });
    const flowerMat = new THREE.MeshLambertMaterial({ color: 0xFBBF24 });
    const flowerCoreMat = new THREE.MeshLambertMaterial({ color: 0x78350F });
    const shoeMat = new THREE.MeshLambertMaterial({ color: 0x78350F });

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.45, 18, 18), skinMat);
    head.position.y = 1.68;
    head.castShadow = true;
    group.add(head);

    this.addCuteEyes(head, 0.05, 0.42);
    this.addRosyCheeks(head, -0.04, 0.38);

    // Braided Hair Tufts
    const braidL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.65, 8), hairMat);
    braidL.position.set(-0.42, 1.45, 0.05);
    braidL.rotation.z = -0.15;
    group.add(braidL);

    const braidR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.65, 8), hairMat);
    braidR.position.set(0.42, 1.45, 0.05);
    braidR.rotation.z = 0.15;
    group.add(braidR);

    // Straw Sunhat with Sunflower Badge
    const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.95, 0.06, 18), strawMat);
    hatBrim.position.y = 2.0;
    hatBrim.rotation.x = -0.05;
    group.add(hatBrim);

    const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.52, 0.38, 16), strawMat);
    hatTop.position.y = 2.22;
    hatTop.castShadow = true;
    group.add(hatTop);

    const hatRibbon = new THREE.Mesh(new THREE.CylinderGeometry(0.53, 0.53, 0.09, 16), dressMat);
    hatRibbon.position.y = 2.06;
    group.add(hatRibbon);

    const hatFlower = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12, 0), flowerMat);
    hatFlower.position.set(0.38, 2.08, 0.32);
    group.add(hatFlower);

    // Pinafore Dress & White Apron
    const dress = new THREE.Mesh(new THREE.ConeGeometry(0.62, 1.15, 14), dressMat);
    dress.position.y = 0.98;
    dress.castShadow = true;
    group.add(dress);

    const apron = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.54, 0.75, 10, 1, false, 0, Math.PI), apronMat);
    apron.position.set(0, 0.88, 0.22);
    group.add(apron);

    // Articulated Arms
    const puffL = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), dressMat);
    puffL.position.set(-0.48, 1.25, 0);
    group.add(puffL);

    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.45, 8), skinMat);
    armL.position.set(-0.52, 0.98, 0.12);
    armL.rotation.x = 0.35;
    group.add(armL);

    const puffR = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), dressMat);
    puffR.position.set(0.48, 1.25, 0);
    group.add(puffR);

    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.45, 8), skinMat);
    armR.position.set(0.52, 0.98, 0.12);
    armR.rotation.x = 0.35;
    group.add(armR);

    // Shoes
    const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.10, 0.24), shoeMat);
    shoeL.position.set(-0.20, 0.05, 0.06);
    group.add(shoeL);

    const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.10, 0.24), shoeMat);
    shoeR.position.set(0.20, 0.05, 0.06);
    group.add(shoeR);

    // Wicker Flower Basket filled with Sunflowers
    const basketGroup = new THREE.Group();
    const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.35, 10), new THREE.MeshLambertMaterial({ color: 0x92400E }));
    basket.castShadow = true;
    basketGroup.add(basket);

    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.03, 6, 12, Math.PI), new THREE.MeshLambertMaterial({ color: 0x78350F }));
    handle.position.y = 0.18;
    handle.rotation.x = Math.PI / 2;
    basketGroup.add(handle);

    for (let f = 0; f < 3; f++) {
      const fPetal = new THREE.Mesh(new THREE.CircleGeometry(0.1, 8), flowerMat);
      fPetal.position.set((f - 1) * 0.12, 0.22, (Math.random() - 0.5) * 0.1);
      fPetal.rotation.x = -Math.PI / 3;
      basketGroup.add(fPetal);

      const fCore = new THREE.Mesh(new THREE.CircleGeometry(0.04, 8), flowerCoreMat);
      fCore.position.set((f - 1) * 0.12, 0.225, (Math.random() - 0.5) * 0.1 + 0.01);
      fCore.rotation.x = -Math.PI / 3;
      basketGroup.add(fCore);
    }

    basketGroup.position.set(0.48, 0.95, 0.26);
    group.add(basketGroup);

    const nameplate = this.createNameplateSprite("Daisy", "🌻", "#EC4899");
    nameplate.position.y = 2.75;
    group.add(nameplate);

    group.position.set(x, 0, z);
    group.rotation.y = -Math.PI * 0.75;
    group.userData = {
      interactable: true,
      id: 'daisy',
      name: 'Daisy',
      avatar: '🌻',
      promptText: 'Talk to Daisy'
    };

    this.scene.add(group);
    return { id: 'daisy', group, head, nameplate, initialPos: new THREE.Vector3(x, 0, z) };
  }

  // --- BAKER BENNY ---
  createBaker(x, z) {
    const group = new THREE.Group();
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xFCD5B5 });
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    const blueMat = new THREE.MeshLambertMaterial({ color: 0x0284C7 });
    const crustMat = new THREE.MeshLambertMaterial({ color: 0xD97706 });
    const berryMat = new THREE.MeshLambertMaterial({ color: 0x9333EA });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350F });

    // Head & Cheerful Mustache
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.48, 18, 18), skinMat);
    head.position.y = 1.76;
    head.castShadow = true;
    group.add(head);

    this.addCuteEyes(head, 0.05, 0.44);
    this.addRosyCheeks(head, -0.04, 0.4);

    const bMustache = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.06, 6, 12, Math.PI), woodMat);
    bMustache.position.set(0, 1.62, 0.44);
    bMustache.rotation.z = Math.PI;
    group.add(bMustache);

    // Pleated Chef's Toque Hat
    const hatBase = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.46, 0.28, 14), whiteMat);
    hatBase.position.y = 2.18;
    group.add(hatBase);

    const hatPuff = new THREE.Mesh(new THREE.SphereGeometry(0.62, 14, 14), whiteMat);
    hatPuff.position.y = 2.58;
    hatPuff.scale.set(1.05, 0.85, 1.05);
    hatPuff.castShadow = true;
    group.add(hatPuff);

    // Double-breasted Baker Jacket
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 1.15, 12), whiteMat);
    body.position.y = 1.05;
    body.castShadow = true;
    group.add(body);

    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.82, 0.1), blueMat);
    apron.position.set(0, 0.95, 0.54);
    group.add(apron);

    // Baker Arms
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.55, 8), whiteMat);
    armL.position.set(-0.56, 1.15, 0.18);
    armL.rotation.x = 0.45;
    group.add(armL);

    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.55, 8), whiteMat);
    armR.position.set(0.56, 1.15, 0.18);
    armR.rotation.x = 0.45;
    group.add(armR);

    // Baker Trousers & Clogs
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.13, 0.48, 8), blueMat);
    legL.position.set(-0.24, 0.26, 0);
    group.add(legL);

    const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.28), whiteMat);
    shoeL.position.set(-0.24, 0.06, 0.06);
    group.add(shoeL);

    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.13, 0.48, 8), blueMat);
    legR.position.set(0.24, 0.26, 0);
    group.add(legR);

    const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.28), whiteMat);
    shoeR.position.set(0.24, 0.06, 0.06);
    group.add(shoeR);

    // Baker's Wooden Peel with Warm Fresh Berry Pie
    const peelGroup = new THREE.Group();
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6), woodMat);
    handle.rotation.x = Math.PI / 2;
    handle.position.z = -0.3;
    peelGroup.add(handle);

    const pieGroup = new THREE.Group();
    const pieCrust = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.28, 0.12, 14), crustMat);
    pieCrust.position.set(0, 0.08, 0.5);
    pieGroup.add(pieCrust);

    const pieFilling = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.04, 12), berryMat);
    pieFilling.position.set(0, 0.15, 0.5);
    pieGroup.add(pieFilling);

    peelGroup.add(pieGroup);

    peelGroup.position.set(0, 1.15, 0.4);
    group.add(peelGroup);

    const nameplate = this.createNameplateSprite("Baker Benny", "🧁", "#EA580C");
    nameplate.position.y = 3.35;
    group.add(nameplate);

    group.position.set(x, 0, z);
    group.rotation.y = -Math.PI / 2;
    group.userData = {
      interactable: true,
      id: 'baker',
      name: 'Baker Benny',
      avatar: '🧁',
      promptText: 'Talk to Baker Benny'
    };

    this.scene.add(group);
    return { id: 'baker', group, head, peelGroup, pieGroup, nameplate, initialPos: new THREE.Vector3(x, 0, z) };
  }

  // --- LITTLE TIMMY ---
  createTimmy(x, z) {
    const group = new THREE.Group();
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xFFDFC4 });
    const denimMat = new THREE.MeshLambertMaterial({ color: 0x2563EB });
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0xFBBF24 });
    const capMat = new THREE.MeshLambertMaterial({ color: 0xDC2626 });
    const balloonMat = new THREE.MeshLambertMaterial({ color: 0xEF4444 });
    const sneakerMat = new THREE.MeshLambertMaterial({ color: 0xDC2626 });
    const soleMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), skinMat);
    head.position.y = 1.28;
    head.castShadow = true;
    group.add(head);

    this.addCuteEyes(head, 0.04, 0.35);
    this.addRosyCheeks(head, -0.03, 0.32);

    // Red Baseball Cap worn backwards
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.41, 14, 14, 0, Math.PI * 2, 0, Math.PI / 1.9), capMat);
    cap.position.y = 1.42;
    group.add(cap);

    const capVisor = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.03, 0.28), capMat);
    capVisor.position.set(0, 1.44, -0.32);
    capVisor.rotation.x = 0.2;
    group.add(capVisor);

    // Striped Shirt & Denim Dungarees
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.72, 0.40), denimMat);
    body.position.y = 0.72;
    body.castShadow = true;
    group.add(body);

    const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.32, 0.42), shirtMat);
    shirt.position.set(0, 0.88, 0);
    group.add(shirt);

    // Timmy Arms
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.42, 8), shirtMat);
    armL.position.set(-0.38, 0.78, 0.05);
    armL.rotation.z = 0.2;
    group.add(armL);

    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.42, 8), shirtMat);
    armR.position.set(0.38, 0.88, 0.12);
    armR.rotation.x = 0.6;
    group.add(armR);

    // Sneakers
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, 0.2), denimMat);
    legL.position.set(-0.16, 0.22, 0);
    group.add(legL);

    const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.10, 0.24), sneakerMat);
    shoeL.position.set(-0.16, 0.05, 0.04);
    group.add(shoeL);

    const soleL = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.03, 0.25), soleMat);
    soleL.position.set(-0.16, 0.015, 0.04);
    group.add(soleL);

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, 0.2), denimMat);
    legR.position.set(0.16, 0.22, 0);
    group.add(legR);

    const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.10, 0.24), sneakerMat);
    shoeR.position.set(0.16, 0.05, 0.04);
    group.add(shoeR);

    const soleR = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.03, 0.25), soleMat);
    soleR.position.set(0.16, 0.015, 0.04);
    group.add(soleR);

    // Tethered Floating Red Balloon
    const balloonGroup = new THREE.Group();
    const balloon = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 14), balloonMat);
    balloon.scale.set(1, 1.25, 1);
    balloon.position.y = 2.4;
    balloonGroup.add(balloon);

    const knot = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.08, 6), balloonMat);
    knot.position.y = 1.96;
    knot.rotation.x = Math.PI;
    balloonGroup.add(knot);

    const string = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.1, 4), new THREE.MeshBasicMaterial({ color: 0xFFFFFF }));
    string.position.y = 1.4;
    balloonGroup.add(string);

    balloonGroup.position.set(0.42, 0, 0.2);
    group.add(balloonGroup);

    const nameplate = this.createNameplateSprite("Little Timmy", "🎈", "#0284C7");
    nameplate.position.y = 2.95;
    group.add(nameplate);

    group.position.set(x, 0, z);
    group.rotation.y = Math.PI / 2.2;
    group.userData = {
      interactable: true,
      id: 'timmy',
      name: 'Timmy',
      avatar: '🎈',
      promptText: 'Talk to Little Timmy'
    };

    this.scene.add(group);
    return { id: 'timmy', group, head, balloonGroup, nameplate, initialPos: new THREE.Vector3(x, 0, z) };
  }

  // --- BUSTER THE DOG ---
  createDog(x, z) {
    const group = new THREE.Group();
    const furMat = new THREE.MeshLambertMaterial({ color: 0xF59E0B });
    const whiteFurMat = new THREE.MeshLambertMaterial({ color: 0xFEF3C7 });
    const noseMat = new THREE.MeshLambertMaterial({ color: 0x1F2937 });
    const collarMat = new THREE.MeshLambertMaterial({ color: 0xEF4444 });
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xFBBF24 });
    const tongueMat = new THREE.MeshLambertMaterial({ color: 0xF472B6 });

    // Fluffy Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.72, 1.45), furMat);
    body.position.y = 0.68;
    body.castShadow = true;
    group.add(body);

    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.55, 0.6), whiteFurMat);
    chest.position.set(0, 0.66, 0.45);
    group.add(chest);

    // 4 Paws with pads
    const pawFL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.4, 8), furMat);
    pawFL.position.set(-0.32, 0.2, 0.5);
    pawFL.castShadow = true;
    group.add(pawFL);

    const pawFR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.4, 8), furMat);
    pawFR.position.set(0.32, 0.2, 0.5);
    pawFR.castShadow = true;
    group.add(pawFR);

    const pawBL = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.15, 0.4, 8), furMat);
    pawBL.position.set(-0.32, 0.2, -0.5);
    pawBL.castShadow = true;
    group.add(pawBL);

    const pawBR = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.15, 0.4, 8), furMat);
    pawBR.position.set(0.32, 0.2, -0.5);
    pawBR.castShadow = true;
    group.add(pawBR);

    // Head & Muzzle
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.58, 0.72), furMat);
    head.position.set(0, 1.15, 0.75);
    head.castShadow = true;
    group.add(head);

    const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.32, 0.42), whiteFurMat);
    muzzle.position.set(0, 1.05, 1.14);
    group.add(muzzle);

    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), noseMat);
    nose.position.set(0, 1.14, 1.36);
    group.add(nose);

    // Cute panting tongue
    const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.2), tongueMat);
    tongue.position.set(0, 0.94, 1.25);
    tongue.rotation.x = 0.25;
    group.add(tongue);

    // Floppy Animated Ears
    const earL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.44, 0.24), furMat);
    earL.position.set(-0.36, 1.08, 0.72);
    earL.rotation.z = -0.2;
    group.add(earL);

    const earR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.44, 0.24), furMat);
    earR.position.set(0.36, 1.08, 0.72);
    earR.rotation.z = 0.2;
    group.add(earR);

    // Animated Bushy Tail
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.75, 8), furMat);
    tail.position.set(0, 0.9, -0.85);
    tail.rotation.x = -Math.PI / 3.2;
    group.add(tail);

    // Red Collar with Golden Bone Charm
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.12, 12), collarMat);
    collar.position.set(0, 0.92, 0.52);
    collar.rotation.x = Math.PI / 4;
    group.add(collar);

    const charm = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), goldMat);
    charm.position.set(0, 0.78, 0.72);
    group.add(charm);

    const nameplate = this.createNameplateSprite("Buster the Dog", "🐶", "#D97706");
    nameplate.position.y = 1.95;
    group.add(nameplate);

    group.position.set(x, 0, z);
    group.rotation.y = Math.PI / 2.2;
    group.userData = {
      interactable: true,
      id: 'dog',
      name: 'Buster the Dog',
      avatar: '🐶',
      promptText: 'Pet Buster the Dog'
    };

    this.scene.add(group);
    return { id: 'dog', group, head, tail, earL, earR, body, collar, nameplate, initialPos: new THREE.Vector3(x, 0, z) };
  }

  // --- OLD MAN GREGORY ---
  createGregory(x, z) {
    const group = new THREE.Group();
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xE8D0B8 });
    const hairMat = new THREE.MeshLambertMaterial({ color: 0xF1F5F9 });
    const sweaterMat = new THREE.MeshLambertMaterial({ color: 0x991B1B });
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const caneMat = new THREE.MeshLambertMaterial({ color: 0x451A03 });
    const brassMat = new THREE.MeshLambertMaterial({ color: 0xF59E0B });
    const shoeMat = new THREE.MeshLambertMaterial({ color: 0x271710 });

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.46, 16, 16), skinMat);
    head.position.y = 1.48;
    head.castShadow = true;
    group.add(head);

    // Bushy White Mustache & Beard
    const beard = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.48, 8), hairMat);
    beard.position.set(0, 1.28, 0.38);
    beard.rotation.x = -Math.PI / 5.5;
    group.add(beard);

    const hairL = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), hairMat);
    hairL.position.set(-0.38, 1.48, -0.05);
    group.add(hairL);

    const hairR = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), hairMat);
    hairR.position.set(0.38, 1.48, -0.05);
    group.add(hairR);

    // Round Spectacles
    const glassesL = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.08, 12), brassMat);
    glassesL.position.set(-0.16, 1.50, 0.44);
    group.add(glassesL);

    const glassesR = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.08, 12), brassMat);
    glassesR.position.set(0.16, 1.50, 0.44);
    group.add(glassesR);

    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.015, 0.015), brassMat);
    bridge.position.set(0, 1.50, 0.44);
    group.add(bridge);

    // Tweed Newsboy Flat Cap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.48, 0.18, 12), new THREE.MeshLambertMaterial({ color: 0x78350F }));
    cap.position.set(0, 1.82, -0.04);
    cap.rotation.x = -0.15;
    group.add(cap);

    // Knit Cardigan Torso
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.58, 0.95, 12), sweaterMat);
    body.position.y = 0.92;
    body.castShadow = true;
    group.add(body);

    // Cardigan Arms & Hands
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.55, 8), sweaterMat);
    armL.position.set(-0.52, 0.95, 0.15);
    armL.rotation.x = 0.55;
    group.add(armL);

    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.55, 8), sweaterMat);
    armR.position.set(0.52, 0.95, 0.15);
    armR.rotation.x = 0.55;
    group.add(armR);

    // Seated Trousers & Oxford Shoes
    const legs = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.35, 0.65), pantsMat);
    legs.position.set(0, 0.48, 0.25);
    group.add(legs);

    const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.28), shoeMat);
    shoeL.position.set(-0.22, 0.06, 0.52);
    group.add(shoeL);

    const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.28), shoeMat);
    shoeR.position.set(0.22, 0.06, 0.52);
    group.add(shoeR);

    // Polished Wooden Walking Cane
    const cane = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.15, 6), caneMat);
    cane.position.set(0.48, 0.58, 0.45);
    cane.rotation.x = 0.15;
    group.add(cane);

    const caneHandle = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.035, 6, 12, Math.PI), brassMat);
    caneHandle.position.set(0.48, 1.15, 0.45);
    caneHandle.rotation.y = Math.PI / 2;
    group.add(caneHandle);

    const nameplate = this.createNameplateSprite("Old Man Gregory", "👴", "#475569");
    nameplate.position.y = 2.45;
    group.add(nameplate);

    group.position.set(x, 0, z);
    group.userData = {
      interactable: true,
      id: 'gregory',
      name: 'Old Man Gregory',
      avatar: '👴',
      promptText: 'Talk to Old Man Gregory'
    };

    this.scene.add(group);
    return { id: 'gregory', group, head, nameplate, initialPos: new THREE.Vector3(x, 0, z) };
  }

  // --- THE SPECTRAL SHADOW ENTITY (WHISPERING WOODS) ---
  createShadowStalker() {
    const group = new THREE.Group();
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x09090B, transparent: true, opacity: 0.95 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xF8FAFC });

    const cowl = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.95, 14), shadowMat);
    cowl.position.set(0, 3.85, 0);
    cowl.rotation.x = 0.08;
    group.add(cowl);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 14, 14), shadowMat);
    head.position.set(0, 3.45, 0.08);
    group.add(head);

    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
    eyeL.position.set(-0.13, 3.52, 0.4);
    group.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
    eyeR.position.set(0.13, 3.52, 0.4);
    group.add(eyeR);

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.65, 2.6, 12), shadowMat);
    body.position.y = 2.0;
    group.add(body);

    const lowerDrape = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.4, 12), shadowMat);
    lowerDrape.position.y = 0.7;
    group.add(lowerDrape);

    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.06, 1.8, 8), shadowMat);
    armL.position.set(-0.55, 2.4, 0.1);
    armL.rotation.z = 0.15;
    group.add(armL);

    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.06, 1.8, 8), shadowMat);
    armR.position.set(0.55, 2.4, 0.1);
    armR.rotation.z = -0.15;
    group.add(armR);

    group.position.set(0, -35, 0);
    this.stalkerEntity = { group, head, armL, armR, isVisible: false, spawnTime: 0 };
    this.scene.add(group);
  }

  spawnStalkerAt(x, z) {
    if (!this.stalkerEntity) return;
    this.stalkerEntity.group.position.set(x, 0, z);
    this.stalkerEntity.group.scale.set(1, 1, 1);
    this.stalkerEntity.isVisible = true;
    this.stalkerEntity.spawnTime = Date.now();

    if (this.stalkerTimeout) clearTimeout(this.stalkerTimeout);
    this.stalkerTimeout = setTimeout(() => {
      this.despawnStalker();
    }, 650);
  }

  despawnStalker() {
    if (!this.stalkerEntity) return;
    this.stalkerEntity.isVisible = false;
    this.stalkerEntity.group.position.set(0, -35, 0);
  }

  addCuteEyes(parent, y, z) {
    const eyeGroup = new THREE.Group();
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1E293B });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

    const eyeL = new THREE.Mesh(new THREE.CircleGeometry(0.06, 12), eyeMat);
    eyeL.position.set(-0.16, y, z);
    eyeGroup.add(eyeL);

    const pupL = new THREE.Mesh(new THREE.CircleGeometry(0.022, 8), pupilMat);
    pupL.position.set(-0.15, y + 0.022, z + 0.005);
    eyeGroup.add(pupL);

    const eyeR = new THREE.Mesh(new THREE.CircleGeometry(0.06, 12), eyeMat);
    eyeR.position.set(0.16, y, z);
    eyeGroup.add(eyeR);

    const pupR = new THREE.Mesh(new THREE.CircleGeometry(0.022, 8), pupilMat);
    pupR.position.set(0.17, y + 0.022, z + 0.005);
    eyeGroup.add(pupR);

    parent.add(eyeGroup);
    parent.userData.eyeGroup = eyeGroup;
    return eyeGroup;
  }

  addRosyCheeks(parent, y, z) {
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xFB7185, transparent: true, opacity: 0.75 });
    const blushL = new THREE.Mesh(new THREE.CircleGeometry(0.065, 10), blushMat);
    blushL.position.set(-0.25, y, z);
    parent.add(blushL);

    const blushR = new THREE.Mesh(new THREE.CircleGeometry(0.065, 10), blushMat);
    blushR.position.set(0.25, y, z);
    parent.add(blushR);
  }

  setCorruption(ratio) {
    this.corruptionRatio = ratio;
  }

  update(delta, playerPos) {
    const t = performance.now() * 0.001;

    // 1. NPC Idle Animations & Tracking
    this.npcs.forEach(npc => {
      if (npc.group) {
        npc.group.position.y = npc.initialPos.y + Math.sin(t * 1.8 + (npc.group.id || 0)) * 0.025;
      }

      if (npc.head && playerPos) {
        const dx = playerPos.x - npc.group.position.x;
        const dz = playerPos.z - npc.group.position.z;
        const dist = Math.hypot(dx, dz);

        if (npc.nameplate) {
          if (dist > 22.0) {
            npc.nameplate.material.opacity = 0;
          } else if (dist > 14.0) {
            npc.nameplate.material.opacity = (22.0 - dist) / 8.0;
          } else {
            npc.nameplate.material.opacity = 1.0;
          }
        }

        if (dist < 18.0) {
          const targetWorldAngle = Math.atan2(dx, dz);
          const localTargetAngle = targetWorldAngle - (npc.group.rotation.y || 0);
          const normAngle = Math.atan2(Math.sin(localTargetAngle), Math.cos(localTargetAngle));
          const clampedAngle = Math.max(-1.3, Math.min(1.3, normAngle));
          npc.head.rotation.y = THREE.MathUtils.lerp(npc.head.rotation.y, clampedAngle, delta * 4.0);
        } else {
          npc.head.rotation.y = THREE.MathUtils.lerp(npc.head.rotation.y, 0, delta * 2.0);
        }
      }

      if (npc.id === 'dog' && npc.tail) {
        npc.tail.rotation.z = Math.sin(t * 4.5) * 0.35;
      }

      if (npc.id === 'timmy' && npc.balloonGroup) {
        npc.balloonGroup.position.y = Math.sin(t * 2.0) * 0.08;
        npc.balloonGroup.rotation.z = Math.cos(t * 1.5) * 0.05;
      }

      if (npc.id === 'baker' && npc.pieGroup) {
        const hasGivenPie = window.questManager?.hasTart || (window.questManager?.currentStep || 0) >= 19;
        npc.pieGroup.visible = !hasGivenPie;
      }
    });

    // 2. Stalker Fleeting Peripheral Check
    if (this.stalkerEntity && this.stalkerEntity.isVisible && window.gameCamera) {
      const cam = window.gameCamera;
      const stalkerPos = this.stalkerEntity.group.position;
      const camPos = cam.position;

      const toStalker = new THREE.Vector3().subVectors(stalkerPos, camPos).normalize();
      const camDir = new THREE.Vector3();
      cam.getWorldDirection(camDir);

      const dot = camDir.dot(toStalker);
      if (dot > 0.65) {
        this.despawnStalker();
      }
    }
  }
}
