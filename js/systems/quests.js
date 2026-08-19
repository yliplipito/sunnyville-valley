/**
 * SUNNYVILLE VALLEY - 23-Step Festival Storyline & Quest State Machine
 * Handles:
 * - Multi-act storyline progression
 * - Early item collection (sunflowers, dog toy ball, balloon)
 * - Safe turn-in and non-blocking dialogue
 * - Resilient progression state machine
 */

export class QuestManager {
  constructor(audioManager, corruptionManager, hudManager) {
    this.audio = audioManager;
    this.corruption = corruptionManager;
    this.hud = hudManager;

    this.currentStep = 0;
    this.hasWateringCan = false;
    this.hasFlourSack = false;
    this.hasBerryBasket = false;
    this.hasMayorWatch = false;
    this.hasTart = false;
    this.hasBouquet = false;
    this.hasBalloon = false;
    this.hasDogBall = false;
    this.hasRungBell = false;
    this.hasWishedFountain = false;
    this.hasReadNotice = false;
    this.litLamps = [false, false, false, false];
    this.flowersPicked = 0;
    this.petDogCount = 0;

    this.initNoticeBoardListener();

    this.goals = [
      // --- ACT I: FESTIVAL DAWN (Stage 0: 0% - 5%) ---
      // 0. Meet Mayor Barnaby
      {
        id: 'talk_mayor_start',
        targetType: 'npc',
        targetId: 'mayor',
        title: 'Walk over and talk to Mayor Barnaby at Town Hall.',
        targetCorruption: 0.0
      },
      // 1. Ring Morning Festival Bell
      {
        id: 'ring_bell',
        targetType: 'bell',
        title: 'Ring the festival bell on the Town Hall plaza.',
        targetCorruption: 0.8
      },
      // 2. Check Town Bulletin Board
      {
        id: 'check_notice',
        targetType: 'noticeboard',
        title: 'Read the festival schedule on the Town Notice Board.',
        targetCorruption: 1.6
      },
      // 3. Make a Wish at Town Fountain
      {
        id: 'wish_fountain',
        targetType: 'fountain',
        title: 'Toss a coin into the town fountain.',
        targetCorruption: 2.5
      },
      // 4. Talk to Daisy at Plaza
      {
        id: 'talk_daisy_start',
        targetType: 'npc',
        targetId: 'daisy',
        title: 'Speak with Daisy at the flowerbeds.',
        targetCorruption: 3.5
      },
      // 5. Fetch Daisy's Watering Can
      {
        id: 'fetch_watering_can',
        targetType: 'watering_can',
        title: 'Pick up Daisy’s watering can near the east planter.',
        targetCorruption: 4.5
      },
      // 6. Deliver Can to Daisy
      {
        id: 'water_planter',
        targetType: 'npc',
        targetId: 'daisy',
        title: 'Deliver the watering can to Daisy.',
        targetCorruption: 5.5
      },

      // --- ACT II: THE SUMMER BOUQUET & PET YARD (Stage 0: 5% - 15%) ---
      // 7. Pick Sunflower 1
      {
        id: 'pick_flower_1',
        targetType: 'flower',
        title: 'Pick 3 Golden Sunflowers around the plaza (0/3).',
        targetCorruption: 7.0
      },
      // 8. Pick Sunflower 2
      {
        id: 'pick_flower_2',
        targetType: 'flower',
        title: 'Pick 3 Golden Sunflowers around the plaza (1/3).',
        targetCorruption: 8.5
      },
      // 9. Pick Sunflower 3
      {
        id: 'pick_flower_3',
        targetType: 'flower',
        title: 'Pick 3 Golden Sunflowers around the plaza (2/3).',
        targetCorruption: 10.0
      },
      // 10. Deliver Sunflowers to Daisy
      {
        id: 'deliver_daisy',
        targetType: 'npc',
        targetId: 'daisy',
        title: 'Deliver the 3 Golden Sunflowers to Daisy.',
        targetCorruption: 11.5
      },
      // 11. Find Dog Ball on Park Lawn
      {
        id: 'find_dog_ball',
        targetType: 'ball',
        title: 'Find Buster’s lost red squeaky ball on the park lawn.',
        targetCorruption: 13.0
      },
      // 12. Bring Ball to Dog
      {
        id: 'bring_ball_dog',
        targetType: 'dog',
        targetId: 'dog',
        title: 'Bring the squeaky ball to Buster in the Pet Yard.',
        targetCorruption: 14.5
      },
      // 13. Pet Buster the Dog
      {
        id: 'pet_dog_1',
        targetType: 'dog',
        targetId: 'dog',
        title: 'Give Buster gentle head pats in the pet yard (0/3).',
        targetCorruption: 16.0
      },

      // --- ACT III: BAKERY PREPARATIONS & ERRANDS (Stage 0 -> 1: 16% - 28%) ---
      // 14. Visit Baker Benny
      {
        id: 'talk_baker',
        targetType: 'npc',
        targetId: 'baker',
        title: 'Visit Baker Benny at Sunshine Bakery.',
        targetCorruption: 17.5
      },
      // 15. Fetch Flour Sack near Timmy
      {
        id: 'fetch_flour_sack',
        targetType: 'flour_sack',
        title: 'Pick up the flour sack near Little Timmy.',
        targetCorruption: 19.0
      },
      // 16. Deliver Flour to Baker Benny
      {
        id: 'deliver_flour',
        targetType: 'npc',
        targetId: 'baker',
        title: 'Deliver the flour sack to Baker Benny.',
        targetCorruption: 20.5
      },
      // 17. Fetch Blueberries Basket
      {
        id: 'fetch_berry_basket',
        targetType: 'berry_basket',
        title: 'Collect the basket of blueberries near the gazebo.',
        targetCorruption: 22.0
      },
      // 18. Deliver Berries to Baker Benny
      {
        id: 'deliver_berries',
        targetType: 'npc',
        targetId: 'baker',
        title: 'Deliver the blueberries to Baker Benny.',
        targetCorruption: 23.5
      },
      // 19. Deliver Tart to Little Timmy
      {
        id: 'deliver_timmy',
        targetType: 'npc',
        targetId: 'timmy',
        title: 'Deliver the warm blueberry tart to Little Timmy.',
        targetCorruption: 25.0
      },
      // 20. Talk to Old Man Gregory
      {
        id: 'talk_gregory',
        targetType: 'npc',
        targetId: 'gregory',
        title: 'Talk to Old Man Gregory on the plaza bench.',
        targetCorruption: 26.5
      },
      // 21. Find Gregory's Pocket Watch
      {
        id: 'find_mayor_watch',
        targetType: 'watch',
        title: 'Find Old Man Gregory’s pocket watch on the fountain stand.',
        targetCorruption: 28.0
      },

      // --- ACT IV: THE GOLDEN HOUR & FESTIVAL ILLUMINATION (Stage 1 -> 2: 28% - 52%) ---
      // 22. Return Watch to Old Man Gregory
      {
        id: 'deliver_mayor_watch',
        targetType: 'npc',
        targetId: 'gregory',
        title: 'Return the pocket watch to Old Man Gregory.',
        targetCorruption: 30.0
      },
      // 23. Light the 4 Festival Lanterns (Any Order)
      {
        id: 'light_lamps',
        targetType: 'lamp',
        title: 'Light the 4 festive lanterns around the plaza (0/4).',
        targetCorruption: 42.0
      },
      // 24. Check in on Little Timmy
      {
        id: 'check_timmy',
        targetType: 'npc',
        targetId: 'timmy',
        title: 'Speak with Little Timmy near Happy Mart.',
        targetCorruption: 45.0
      },
      // 25. Visit Baker Benny for Evening Pastries
      {
        id: 'check_baker',
        targetType: 'npc',
        targetId: 'baker',
        title: 'Check on Baker Benny at Sunshine Bakery.',
        targetCorruption: 48.0
      },
      // 26. Read Updated Notice on Bulletin Board
      {
        id: 'check_notice_evening',
        targetType: 'noticeboard',
        title: 'Read the updated evening note on the Town Notice Board.',
        targetCorruption: 52.0
      },

      // --- ACT V: THE CREEPING STILLNESS & TWILIGHT TRANSITION (Stage 2 -> 3: 52% - 76%) ---
      // 27. Speak with Daisy at Plaza
      {
        id: 'talk_daisy_twilight',
        targetType: 'npc',
        targetId: 'daisy',
        title: 'Speak with Daisy at the plaza.',
        targetCorruption: 57.0
      },
      // 28. Check on Buster the Dog
      {
        id: 'pet_dog_twilight',
        targetType: 'dog',
        targetId: 'dog',
        title: 'Check on Buster the dog in the pet yard.',
        targetCorruption: 62.0
      },
      // 29. Talk to Old Man Gregory on the bench
      {
        id: 'talk_gregory_twilight',
        targetType: 'npc',
        targetId: 'gregory',
        title: 'Talk with Old Man Gregory on the bench.',
        targetCorruption: 67.0
      },
      // 30. Retrieve Timmy's Red Balloon
      {
        id: 'find_balloon',
        targetType: 'balloon',
        title: 'Retrieve the red balloon from the orchard meadow.',
        targetCorruption: 72.0
      },
      // 31. Return Balloon to Timmy
      {
        id: 'return_balloon',
        targetType: 'npc',
        targetId: 'timmy',
        title: 'Return the red balloon to Little Timmy.',
        targetCorruption: 76.0
      },

      // --- ACT VI: THE AWAKENING & CLIMAX (Stage 3 -> 4: 76% - 100%) ---
      // 32. Speak with Old Man Gregory
      {
        id: 'talk_gregory_final',
        targetType: 'npc',
        targetId: 'gregory',
        title: 'Speak with Old Man Gregory on the bench.',
        targetCorruption: 82.0
      },
      // 33. Return to Mayor Barnaby for Ceremony
      {
        id: 'talk_mayor_ceremony',
        targetType: 'npc',
        targetId: 'mayor',
        title: 'Speak with Mayor Barnaby at Town Hall.',
        targetCorruption: 90.0
      },
      // 34. Inspect the Boarded Well in Whispering Woods
      {
        id: 'inspect_well',
        targetType: 'well',
        title: 'Investigate the Boarded Well in deep Whispering Woods.',
        targetCorruption: 100.0
      }
    ];

    this.renderCurrentGoal();
  }

  isInteractableActive(target) {
    if (!target || !target.userData) return false;
    const data = target.userData;

    // Humanoid NPCs and Dog are always interactable for talking/petting
    if (data.id === 'mayor' || data.id === 'daisy' || data.id === 'baker' || data.id === 'timmy' || data.id === 'gregory' || data.id === 'dog') {
      return true;
    }

    const current = this.goals[this.currentStep];
    if (!current) return false;

    if (data.type === current.targetType) {
      if (data.type === 'lamp') return !data.isLit && current.id === 'light_lamps';
      if (data.type === 'flower') return !data.isPicked;
      return true;
    }

    return false;
  }

  getCurrentObjectivePosition() {
    const goal = this.goals[this.currentStep];
    if (!goal) return null;

    const em = window.entityManager;
    const ws = window.worldScene;

    // 1. NPC Targets
    if (goal.targetType === 'npc') {
      const npc = em?.getNPC?.(goal.targetId);
      if (npc?.group) {
        return {
          x: npc.group.position.x,
          y: (goal.targetId === 'timmy' ? 1.8 : 2.2),
          z: npc.group.position.z
        };
      }
      const npcMap = {
        mayor: { x: 0, y: 2.2, z: 18.0 },
        daisy: { x: 6.2, y: 2.2, z: 4.2 },
        baker: { x: 24.5, y: 2.2, z: 1.8 },
        timmy: { x: -16.5, y: 1.8, z: 2.2 },
        gregory: { x: 0, y: 2.2, z: 9.2 }
      };
      return npcMap[goal.targetId] || null;
    }

    // 2. Dog Target
    if (goal.targetType === 'dog') {
      const dog = em?.getNPC?.('dog');
      if (dog?.group) {
        return { x: dog.group.position.x, y: 1.4, z: dog.group.position.z };
      }
      return { x: -22.0, y: 1.4, z: -12.5 };
    }

    // 3. Notice Board
    if (goal.targetType === 'noticeboard') {
      if (ws?.townNoticeBoardGroup) {
        return { x: ws.townNoticeBoardGroup.position.x, y: 2.2, z: ws.townNoticeBoardGroup.position.z };
      }
      return { x: 6.8, y: 2.2, z: 11.2 };
    }

    // 4. Town Bell
    if (goal.targetType === 'bell') {
      if (ws?.townBellGroup) {
        return { x: ws.townBellGroup.position.x, y: 2.6, z: ws.townBellGroup.position.z };
      }
      return { x: 0, y: 2.6, z: 23.6 };
    }

    // 5. Fountain
    if (goal.targetType === 'fountain') {
      if (ws?.fountainGroup) {
        return { x: ws.fountainGroup.position.x, y: 1.6, z: ws.fountainGroup.position.z };
      }
      return { x: 0, y: 1.6, z: 0 };
    }

    // 6. Watering Can
    if (goal.targetType === 'watering_can') {
      if (ws?.wateringCanGroup) {
        return { x: ws.wateringCanGroup.position.x, y: 0.8, z: ws.wateringCanGroup.position.z };
      }
      return { x: 8.2, y: 0.8, z: 5.2 };
    }

    // 7. Sunflowers (First visible unpicked flower)
    if (goal.targetType === 'flower') {
      if (ws?.pickableFlowers && ws.pickableFlowers.length > 0) {
        const unpicked = ws.pickableFlowers.find(f => !f.userData?.isPicked && f.visible);
        if (unpicked) {
          return { x: unpicked.position.x, y: 0.9, z: unpicked.position.z };
        }
      }
      const flowerCoords = [
        { x: 9.5, y: 0.9, z: 6.5 },
        { x: -9.5, y: 0.9, z: 6.0 },
        { x: 9.5, y: 0.9, z: -6.5 }
      ];
      return flowerCoords[(this.flowersPicked || 0) % flowerCoords.length] || flowerCoords[0];
    }

    // 8. Dog Toy Ball
    if (goal.targetType === 'ball') {
      if (ws?.dogBallGroup) {
        return { x: ws.dogBallGroup.position.x, y: 0.7, z: ws.dogBallGroup.position.z };
      }
      return { x: -8.0, y: 0.7, z: 16.0 };
    }

    // 9. Flour Sack
    if (goal.targetType === 'flour_sack') {
      if (ws?.flourSackGroup) {
        return { x: ws.flourSackGroup.position.x, y: 0.8, z: ws.flourSackGroup.position.z };
      }
      return { x: -20.5, y: 0.8, z: 2.8 };
    }

    // 10. Blueberries Basket
    if (goal.targetType === 'berry_basket') {
      if (ws?.berryBasketGroup) {
        return { x: ws.berryBasketGroup.position.x, y: 0.8, z: ws.berryBasketGroup.position.z };
      }
      return { x: 26.5, y: 0.8, z: -6.8 };
    }

    // 11. Golden Pocket Watch
    if (goal.targetType === 'watch') {
      if (ws?.goldenWatchGroup) {
        return { x: ws.goldenWatchGroup.position.x, y: 1.2, z: ws.goldenWatchGroup.position.z };
      }
      return { x: 5.6, y: 1.2, z: 2.2 };
    }

    // 12. Street Lamps
    if (goal.targetType === 'lamp') {
      const lampPositions = [
        { x: -8, y: 3.8, z: 8 },
        { x: 8, y: 3.8, z: 8 },
        { x: 8, y: 3.8, z: -8 },
        { x: -8, y: 3.8, z: -8 }
      ];
      for (let i = 0; i < this.litLamps.length; i++) {
        if (!this.litLamps[i]) {
          return lampPositions[i] || lampPositions[0];
        }
      }
      return lampPositions[0];
    }

    // 13. Lost Red Balloon
    if (goal.targetType === 'balloon') {
      if (ws?.balloonGroup) {
        return { x: ws.balloonGroup.position.x, y: 2.5, z: ws.balloonGroup.position.z };
      }
      return { x: 18.5, y: 2.5, z: -16.0 };
    }

    // 14. Boarded Well
    if (goal.targetType === 'well') {
      if (ws?.wellGroup) {
        return { x: ws.wellGroup.position.x, y: 2.2, z: ws.wellGroup.position.z };
      }
      return { x: 0, y: 2.2, z: -44.0 };
    }

    return null;
  }

  renderCurrentGoal(isDone = false) {
    const titleEl = document.getElementById('quest-panel-title');
    const current = this.goals[this.currentStep];

    if (titleEl) {
      titleEl.textContent = "Festival Task";
    }

    let text = "All festival preparations complete! 🌟";
    if (current) {
      text = current.title;

      if (current.id.startsWith('pick_flower_')) {
        text = `Pick 3 Golden Sunflowers around town (${this.flowersPicked}/3)`;
      } else if (current.id === 'pet_dog_1') {
        text = `Give Buster gentle head pats (${this.petDogCount}/3)`;
      } else if (current.id === 'light_lamps') {
        const litCount = this.litLamps.filter(Boolean).length;
        text = `Light the 4 festive lanterns around town (${litCount}/4)`;
      }
    }

    if (this.hud && this.hud.updateCurrentGoal) {
      this.hud.updateCurrentGoal(text, isDone);
    }

    const pos = this.getCurrentObjectivePosition();
    if (window.worldScene && window.worldScene.setWaypointTarget) {
      window.worldScene.setWaypointTarget(pos);
    }
  }

  initNoticeBoardListener() {
    const modal = document.getElementById('notice-board-modal');
    const closeBtn = document.getElementById('notice-board-close-btn');
    this.noticeModalOpenedTime = 0;

    const closeModal = () => {
      if (modal && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        window.lastDialogueClosedTime = Date.now();
        try {
          const wrap = document.getElementById('canvas-wrapper');
          wrap?.requestPointerLock?.()?.catch?.(() => {});
        } catch (e) {}

        if (this.currentStep === 2) {
          this.hasReadNotice = true;
          this.advanceStep(this.goals[2].targetCorruption);
        } else if (this.currentStep === 26) {
          if (this.corruption) this.corruption.triggerMilestoneAnomaly('board_evening');
          this.advanceStep(this.goals[26].targetCorruption);
        }
      }
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    window.addEventListener('keydown', (e) => {
      if (modal && !modal.classList.contains('hidden')) {
        if (Date.now() - this.noticeModalOpenedTime < 250) return;
        if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          closeModal();
        }
      }
    });
  }

  saveProgress() {
    try {
      const state = {
        currentStep: this.currentStep,
        targetCorruption: this.corruption?.targetCorruption || 0,
        flowersPicked: this.flowersPicked,
        petDogCount: this.petDogCount,
        litLamps: this.litLamps
      };
      localStorage.setItem('sunnyville_valley_save', JSON.stringify(state));
    } catch (e) {}
  }

  loadProgress() {
    try {
      const raw = localStorage.getItem('sunnyville_valley_save');
      if (raw) {
        const state = JSON.parse(raw);
        if (state && typeof state.currentStep === 'number' && state.currentStep > 0 && state.currentStep < 34) {
          this.currentStep = state.currentStep;
          this.flowersPicked = state.flowersPicked || 0;
          this.petDogCount = state.petDogCount || 0;
          if (Array.isArray(state.litLamps)) this.litLamps = state.litLamps;
          if (this.corruption && state.targetCorruption) {
            this.corruption.setCorruption(state.targetCorruption);
          }
        } else if (state && state.currentStep >= 34) {
          localStorage.removeItem('sunnyville_valley_save');
        }
      }
    } catch (e) {}
  }

  advanceStep(targetCorruption) {
    this.currentStep++;
    if (this.corruption && targetCorruption !== undefined) {
      this.corruption.setTargetCorruption(targetCorruption);
    }
    this.renderCurrentGoal(false);
    this.saveProgress();
  }

  // --- Resilient Interactive Prop & NPC Handlers ---

  ringBell(target) {
    if (this.audio) this.audio.playBellChime();
    if (this.currentStep === 1) {
      this.hasRungBell = true;
      this.advanceStep(this.goals[1].targetCorruption);
    }
  }

  readNoticeBoard(target) {
    if (this.audio) this.audio.playPageFlip();
    const modal = document.getElementById('notice-board-modal');
    const grid = modal?.querySelector('.notice-board-grid');

    if (grid) {
      if (this.currentStep >= 26) {
        // Evening Notice Board Flyers
        grid.innerHTML = `
          <div class="notice-paper flyer-festival">
            <span class="pin-badge">📌</span>
            <h3>🏮 Evening Gathering</h3>
            <p>Lanterns are lit. Gather near the woods path as dusk deepens.</p>
            <p class="notice-signature">— Mayor Barnaby</p>
          </div>
          <div class="notice-paper flyer-bakery">
            <span class="pin-badge">📌</span>
            <h3>🧁 Bakery Notice</h3>
            <p>Wildberry tarts finished. Ovens resting for the night.</p>
            <p class="notice-signature">— Baker Benny</p>
          </div>
          <div class="notice-paper flyer-flowers">
            <span class="pin-badge">📌</span>
            <h3>🌻 Flowerbed Advisory</h3>
            <p>Sunflowers have closed their petals. Check on Daisy.</p>
            <p class="notice-signature">— Daisy</p>
          </div>
          <div class="notice-paper flyer-reminder">
            <span class="pin-badge">📌</span>
            <h3>🌲 Woods Notice</h3>
            <p>Deep trail beyond the well is closed. Stay in the plaza.</p>
            <p class="notice-signature">— Committee</p>
          </div>
        `;
      } else {
        // Sunny Morning Festival Flyers
        grid.innerHTML = `
          <div class="notice-paper flyer-festival">
            <span class="pin-badge">📌</span>
            <h3>🌞 Summer Festival</h3>
            <p>Welcome neighbors! Celebrate the sunny season in our town plaza.</p>
            <p class="notice-signature">— Mayor Barnaby</p>
          </div>
          <div class="notice-paper flyer-bakery">
            <span class="pin-badge">📌</span>
            <h3>🧁 Bakery Special</h3>
            <p>Hot wildberry tarts all afternoon outside Sunshine Bakery!</p>
            <p class="notice-signature">— Baker Benny</p>
          </div>
          <div class="notice-paper flyer-flowers">
            <span class="pin-badge">📌</span>
            <h3>🌻 Flowerbed Care</h3>
            <p>Please water the town sunflowers in the plaza planters!</p>
            <p class="notice-signature">— Daisy</p>
          </div>
          <div class="notice-paper flyer-reminder">
            <span class="pin-badge">📌</span>
            <h3>🌲 Woods Notice</h3>
            <p>Northern woods trail past the old well is closed.</p>
            <p class="notice-signature">— Committee</p>
          </div>
        `;
      }
    }

    if (modal) {
      this.noticeModalOpenedTime = Date.now();
      modal.classList.remove('hidden');
      try {
        document.exitPointerLock?.();
      } catch (e) {}
    }
  }

  interactFountain(target) {
    if (this.audio) {
      this.audio.playWaterSplash();
    }

    if (this.currentStep === 3) {
      this.hasWishedFountain = true;
      this.advanceStep(this.goals[3].targetCorruption);
    }
  }

  collectWateringCan(canObj) {
    if (this.hasWateringCan) return;
    this.hasWateringCan = true;

    if (canObj) {
      canObj.visible = false;
      canObj.userData.interactable = false;
      if (window.worldScene && window.worldScene.interactableObjects) {
        const idx = window.worldScene.interactableObjects.indexOf(canObj);
        if (idx !== -1) window.worldScene.interactableObjects.splice(idx, 1);
      }
    }

    if (this.audio) this.audio.playSparkle();

    if (this.currentStep === 5) {
      this.advanceStep(this.goals[5].targetCorruption);
    }
  }

  collectFlourSack(sackObj) {
    if (this.hasFlourSack) return;
    this.hasFlourSack = true;

    if (sackObj) {
      sackObj.visible = false;
      sackObj.userData.interactable = false;
      if (window.worldScene && window.worldScene.interactableObjects) {
        const idx = window.worldScene.interactableObjects.indexOf(sackObj);
        if (idx !== -1) window.worldScene.interactableObjects.splice(idx, 1);
      }
    }

    if (this.audio) this.audio.playSparkle();

    if (this.currentStep === 15) {
      this.advanceStep(this.goals[15].targetCorruption);
    }
  }

  collectBerryBasket(basketObj) {
    if (this.hasBerryBasket) return;
    this.hasBerryBasket = true;

    if (basketObj) {
      basketObj.visible = false;
      basketObj.userData.interactable = false;
      if (window.worldScene && window.worldScene.interactableObjects) {
        const idx = window.worldScene.interactableObjects.indexOf(basketObj);
        if (idx !== -1) window.worldScene.interactableObjects.splice(idx, 1);
      }
    }

    if (this.audio) this.audio.playSparkle();

    if (this.currentStep === 17) {
      this.advanceStep(this.goals[17].targetCorruption);
    }
  }

  collectGoldenWatch(watchObj) {
    if (this.hasMayorWatch) return;
    this.hasMayorWatch = true;

    if (watchObj) {
      watchObj.visible = false;
      watchObj.userData.interactable = false;
      if (window.worldScene && window.worldScene.interactableObjects) {
        const idx = window.worldScene.interactableObjects.indexOf(watchObj);
        if (idx !== -1) window.worldScene.interactableObjects.splice(idx, 1);
      }
    }

    if (this.audio) this.audio.playSparkle();

    if (this.currentStep === 21) {
      this.advanceStep(this.goals[21].targetCorruption);
    }
  }

  lightStreetLamp(lampObj) {
    const lampIdx = typeof lampObj === 'number' ? lampObj : (lampObj?.userData?.lampIndex ?? 0);
    if (this.litLamps[lampIdx]) return;
    this.litLamps[lampIdx] = true;

    if (window.worldScene) {
      window.worldScene.lightStreetLamp(lampIdx);
    }
    if (this.audio) this.audio.playSparkle();

    const litCount = this.litLamps.filter(Boolean).length;
    if (litCount >= 4) {
      if (this.corruption) this.corruption.triggerMilestoneAnomaly('lanterns_lit');
      this.advanceStep(this.goals[23].targetCorruption);
    } else {
      this.renderCurrentGoal();
    }
  }

  collectDogBall(ballObj) {
    if (this.hasDogBall) return;
    this.hasDogBall = true;

    if (ballObj) {
      ballObj.visible = false;
      ballObj.userData.interactable = false;
      if (window.worldScene && window.worldScene.interactableObjects) {
        const idx = window.worldScene.interactableObjects.indexOf(ballObj);
        if (idx !== -1) window.worldScene.interactableObjects.splice(idx, 1);
      }
    }

    if (this.audio) this.audio.playToySqueak();

    if (this.currentStep === 11) {
      this.advanceStep(this.goals[11].targetCorruption);
    }
  }

  onTalkedToDaisy() {
    if (this.currentStep === 4) {
      if (this.hasWateringCan) {
        this.currentStep = 6;
        this.advanceStep(this.goals[6].targetCorruption);
      } else {
        this.advanceStep(this.goals[4].targetCorruption);
      }
    } else if (this.currentStep === 6 && this.hasWateringCan) {
      this.hasWateringCan = false;
      if (this.flowersPicked >= 3) {
        this.hasBouquet = true;
        this.currentStep = 10;
        if (this.audio) this.audio.playFanfare();
        this.advanceStep(this.goals[10].targetCorruption);
      } else {
        this.currentStep = 7 + this.flowersPicked;
        if (this.audio) this.audio.playSparkle();
        this.renderCurrentGoal();
      }
    } else if ((this.currentStep >= 7 && this.currentStep <= 10) && this.flowersPicked >= 3) {
      this.hasBouquet = true;
      if (this.audio) this.audio.playFanfare();
      if (this.hasDogBall) {
        this.currentStep = 12;
      } else {
        this.currentStep = 11;
      }
      if (this.corruption) this.corruption.setTargetCorruption(this.goals[10].targetCorruption);
      this.renderCurrentGoal();
    } else if (this.currentStep === 27) {
      this.advanceStep(this.goals[27].targetCorruption);
    }
  }

  pickSunflower(flowerObj) {
    if (flowerObj) {
      if (flowerObj.userData?.isPicked) return;
      flowerObj.userData.isPicked = true;
      flowerObj.userData.interactable = false;
      flowerObj.visible = false;

      if (window.worldScene && window.worldScene.interactableObjects) {
        const idx = window.worldScene.interactableObjects.indexOf(flowerObj);
        if (idx !== -1) window.worldScene.interactableObjects.splice(idx, 1);
      }
    }

    this.flowersPicked = (this.flowersPicked || 0) + 1;
    if (this.audio) this.audio.playSparkle();

    if (this.flowersPicked >= 3) {
      if (this.currentStep >= 6 && this.currentStep <= 9) {
        this.currentStep = 10; // Deliver Sunflowers
        if (this.corruption) this.corruption.setTargetCorruption(this.goals[9].targetCorruption);
      }
    } else {
      if (this.currentStep >= 7 && this.currentStep <= 9) {
        this.currentStep = 7 + this.flowersPicked;
        if (this.corruption) this.corruption.setTargetCorruption(this.goals[6 + this.flowersPicked].targetCorruption);
      }
    }
    this.renderCurrentGoal();
  }

  onTalkedToMayor() {
    if (this.currentStep === 0) {
      if (this.audio) this.audio.playSparkle();
      this.advanceStep(this.goals[0].targetCorruption);
    } else if (this.currentStep === 33) {
      if (this.corruption) this.corruption.triggerMilestoneAnomaly('mayor_dusk');
      this.advanceStep(this.goals[33].targetCorruption);
    }
  }

  onTalkedToGregory() {
    if (this.currentStep === 20) {
      if (this.audio) this.audio.playSparkle();
      this.advanceStep(this.goals[20].targetCorruption);
    } else if (this.currentStep === 22 && this.hasMayorWatch) {
      this.hasMayorWatch = false;
      if (this.audio) this.audio.playFanfare();
      if (this.corruption) this.corruption.triggerMilestoneAnomaly('watch_returned');
      this.advanceStep(this.goals[22].targetCorruption);
    } else if (this.currentStep === 29) {
      this.advanceStep(this.goals[29].targetCorruption);
    } else if (this.currentStep === 32) {
      this.advanceStep(this.goals[32].targetCorruption);
    }
  }

  onTalkedToBaker() {
    if (this.currentStep === 14) {
      if (this.hasFlourSack) {
        this.currentStep = 16;
        this.advanceStep(this.goals[16].targetCorruption);
      } else {
        this.advanceStep(this.goals[14].targetCorruption);
      }
    } else if (this.currentStep === 16 && this.hasFlourSack) {
      this.hasFlourSack = false;
      if (this.hasBerryBasket) {
        this.hasBerryBasket = false;
        this.hasTart = true;
        this.currentStep = 19;
        if (this.audio) this.audio.playFanfare();
        this.advanceStep(this.goals[18].targetCorruption);
      } else {
        if (this.audio) this.audio.playSparkle();
        this.advanceStep(this.goals[16].targetCorruption);
      }
    } else if (this.currentStep === 18 && this.hasBerryBasket) {
      this.hasBerryBasket = false;
      this.hasTart = true;
      if (this.audio) this.audio.playFanfare();
      this.advanceStep(this.goals[18].targetCorruption);
    } else if (this.currentStep === 25) {
      if (this.audio) this.audio.playSparkle();
      this.advanceStep(this.goals[25].targetCorruption);
    }
  }

  onTalkedToTimmy() {
    if (this.currentStep === 19 && this.hasTart) {
      this.hasTart = false;
      if (this.audio) this.audio.playFanfare();
      this.advanceStep(this.goals[19].targetCorruption);
    } else if (this.currentStep === 24) {
      this.advanceStep(this.goals[24].targetCorruption);
    } else if (this.currentStep === 31 && this.hasBalloon) {
      this.hasBalloon = false;
      this.advanceStep(this.goals[31].targetCorruption);
    }
  }

  petDog() {
    if (this.audio) this.audio.playDogBark();

    const dog = window.entityManager?.getNPC?.('dog');
    if (dog && window.entityManager?.spawnHeartParticles) {
      window.entityManager.spawnHeartParticles(dog.group.position.x, dog.group.position.y, dog.group.position.z);
    }

    if (this.currentStep === 12 || (this.currentStep === 11 && this.hasDogBall)) {
      this.hasDogBall = false;
      this.currentStep = 13;
      if (this.audio) this.audio.playToySqueak();
      if (this.corruption) this.corruption.setTargetCorruption(this.goals[12].targetCorruption);
      this.renderCurrentGoal();
      return;
    }

    if (this.currentStep === 13) {
      this.petDogCount++;
      if (this.petDogCount >= 3) {
        this.advanceStep(this.goals[13].targetCorruption);
      } else {
        this.renderCurrentGoal();
      }
      return;
    }

    if (this.currentStep === 28) {
      this.advanceStep(this.goals[28].targetCorruption);
      return;
    }
  }

  collectBalloon(balloonObj) {
    if (this.hasBalloon) return;

    this.hasBalloon = true;
    if (balloonObj) {
      balloonObj.visible = false;
      balloonObj.userData.interactable = false;
      if (window.worldScene && window.worldScene.interactableObjects) {
        const idx = window.worldScene.interactableObjects.indexOf(balloonObj);
        if (idx !== -1) window.worldScene.interactableObjects.splice(idx, 1);
      }
    }

    if (this.audio) this.audio.playSparkle();
    if (this.corruption) this.corruption.triggerMilestoneAnomaly('balloon_found');

    if (this.currentStep === 30) {
      this.advanceStep(this.goals[30].targetCorruption);
    }
  }

  inspectWell() {
    if (this.currentStep >= 34) {
      if (window.scareManager) {
        window.scareManager.triggerFullEndingClimax();
      }
    } else {
      this.hud.showToast("An old boarded stone well. A gentle draft rises from below. 🕳️");
    }
  }
}
