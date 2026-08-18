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
      // --- ACT I: THE VILLAGE WELCOME (Stage 0: 0% - 5%) ---
      // 0. Meet Mayor Barnaby
      {
        id: 'meet_mayor',
        targetType: 'npc',
        targetId: 'mayor',
        title: 'Welcome! Walk over and say hello to Mayor Barnaby at Town Hall.',
        corruptedTitle: 'Approach Mayor Barnaby',
        targetCorruption: 0.0
      },
      // 1. Ring Morning Festival Bell
      {
        id: 'ring_bell',
        targetType: 'bell',
        title: 'Ring the Morning Festival Bell at Town Hall to announce the festival!',
        corruptedTitle: 'Ring the Morning Bell',
        targetCorruption: 0.8
      },
      // 2. Check Town Bulletin Board
      {
        id: 'check_notice',
        targetType: 'noticeboard',
        title: 'Check the Town Square Bulletin Board for today’s festival events.',
        corruptedTitle: 'Read the Festival Notice',
        targetCorruption: 1.6
      },
      // 3. Make a Wish at Town Fountain
      {
        id: 'wish_fountain',
        targetType: 'fountain',
        title: 'Toss a shiny coin and make a wish at the sparkling Town Fountain.',
        corruptedTitle: 'Toss a Coin in the Basin',
        targetCorruption: 2.5
      },
      // 4. Talk to Daisy at Plaza
      {
        id: 'talk_daisy_start',
        targetType: 'npc',
        targetId: 'daisy',
        title: 'Speak with Daisy at the Plaza to help prepare the Grand Summer Bouquet.',
        corruptedTitle: 'Greet Daisy at the Plaza',
        targetCorruption: 3.5
      },
      // 5. Fetch Daisy's Watering Can
      {
        id: 'fetch_watering_can',
        targetType: 'watering_can',
        title: 'Fetch Daisy’s green watering can from near the East Planter.',
        corruptedTitle: 'Retrieve the Watering Can',
        targetCorruption: 4.5
      },
      // 6. Water Planter / Deliver Can to Daisy
      {
        id: 'water_planter',
        targetType: 'npc',
        targetId: 'daisy',
        title: 'Bring the watering can back to Daisy to water the golden blossoms.',
        corruptedTitle: 'Return Can to Daisy',
        targetCorruption: 5.5
      },

      // --- ACT II: THE SUMMER BOUQUET & PET YARD (Stage 0: 5% - 15%) ---
      // 7. Pick Sunflower 1
      {
        id: 'pick_flower_1',
        targetType: 'flower',
        title: 'Pick 3 fresh Golden Sunflowers around the plaza (0/3).',
        corruptedTitle: 'Collect Golden Sunflowers (0/3)',
        targetCorruption: 7.0
      },
      // 8. Pick Sunflower 2
      {
        id: 'pick_flower_2',
        targetType: 'flower',
        title: 'Pick 3 fresh Golden Sunflowers around the plaza (1/3).',
        corruptedTitle: 'Collect Golden Sunflowers (1/3)',
        targetCorruption: 8.5
      },
      // 9. Pick Sunflower 3
      {
        id: 'pick_flower_3',
        targetType: 'flower',
        title: 'Pick 3 fresh Golden Sunflowers around the plaza (2/3).',
        corruptedTitle: 'Collect Golden Sunflowers (2/3)',
        targetCorruption: 10.0
      },
      // 10. Deliver Sunflowers to Daisy
      {
        id: 'deliver_daisy',
        targetType: 'npc',
        targetId: 'daisy',
        title: 'Deliver all 3 Golden Sunflowers back to Daisy at the Plaza.',
        corruptedTitle: 'Bring Bouquet to Daisy',
        targetCorruption: 11.5
      },
      // 11. Find Dog Ball on Sunny Lawn
      {
        id: 'find_dog_ball',
        targetType: 'ball',
        title: 'Find Buster the dog’s lost red squeaky toy ball on the sunny lawn.',
        corruptedTitle: 'Find the Red Ball',
        targetCorruption: 13.0
      },
      // 12. Bring Ball to Dog
      {
        id: 'bring_ball_dog',
        targetType: 'dog',
        targetId: 'dog',
        title: 'Bring the squeaky toy ball to Buster the dog in the Pet Yard.',
        corruptedTitle: 'Hand Toy to Buster',
        targetCorruption: 14.5
      },
      // 13. Pet Buster the Dog
      {
        id: 'pet_dog_1',
        targetType: 'dog',
        targetId: 'dog',
        title: 'Give Buster gentle head pats in the pet yard (0/3).',
        corruptedTitle: 'Pet Buster (0/3)',
        targetCorruption: 16.0
      },

      // --- ACT III: BAKERY PREPARATIONS & ERRANDS (Stage 0 -> 1: 16% - 28%) ---
      // 14. Visit Baker Benny
      {
        id: 'talk_baker',
        targetType: 'npc',
        targetId: 'baker',
        title: 'Visit Baker Benny at Sunshine Bakery to help with festival baking.',
        corruptedTitle: 'Visit Baker Benny',
        targetCorruption: 17.5
      },
      // 15. Fetch Flour Sack near Happy Mart
      {
        id: 'fetch_flour_sack',
        targetType: 'flour_sack',
        title: 'Pick up the bakery flour sack stacked outside Happy Mart.',
        corruptedTitle: 'Pick up Flour Sack',
        targetCorruption: 19.0
      },
      // 16. Deliver Flour to Baker Benny
      {
        id: 'deliver_flour',
        targetType: 'npc',
        targetId: 'baker',
        title: 'Deliver the sack of flour to Baker Benny at Sunshine Bakery.',
        corruptedTitle: 'Give Flour to Benny',
        targetCorruption: 20.5
      },
      // 17. Fetch Wildberry Basket
      {
        id: 'fetch_berry_basket',
        targetType: 'berry_basket',
        title: 'Collect the basket of ripe wildberries near the orchard trees.',
        corruptedTitle: 'Collect Berry Basket',
        targetCorruption: 22.0
      },
      // 18. Deliver Berries to Baker Benny
      {
        id: 'deliver_berries',
        targetType: 'npc',
        targetId: 'baker',
        title: 'Deliver the wildberries to Baker Benny to finish the special Berry Tart.',
        corruptedTitle: 'Give Berries to Benny',
        targetCorruption: 23.5
      },
      // 19. Deliver Tart to Little Timmy
      {
        id: 'deliver_timmy',
        targetType: 'npc',
        targetId: 'timmy',
        title: 'Deliver the warm Berry Tart to little Timmy near Happy Mart.',
        corruptedTitle: 'Give Tart to Timmy',
        targetCorruption: 25.0
      },
      // 20. Ask Old Man Gregory for Blessing
      {
        id: 'talk_gregory',
        targetType: 'npc',
        targetId: 'gregory',
        title: 'Ask Old Man Gregory on the plaza bench for his Festival Blessing.',
        corruptedTitle: 'Speak with Gregory',
        targetCorruption: 26.5
      },
      // 21. Find Mayor's Lost Golden Pocket Watch
      {
        id: 'find_mayor_watch',
        targetType: 'watch',
        title: 'Find Mayor Barnaby’s Golden Pocket Watch on the plaza display stand.',
        corruptedTitle: 'Retrieve Pocket Watch',
        targetCorruption: 28.0
      },

      // --- ACT IV: THE GOLDEN HOUR & FESTIVAL ILLUMINATION (Stage 1 -> 2: 28% - 52%) ---
      // 22. Return Watch to Mayor Barnaby
      {
        id: 'deliver_mayor_watch',
        targetType: 'npc',
        targetId: 'mayor',
        title: 'Return the shiny Golden Pocket Watch to Mayor Barnaby at Town Hall.',
        corruptedTitle: 'Return Watch to Mayor',
        targetCorruption: 30.0
      },
      // 23. Light the 4 Festival Lanterns (Any Order)
      {
        id: 'light_lamps',
        targetType: 'lamp',
        title: 'Light the 4 festive lanterns around town (0/4).',
        corruptedTitle: 'Ignite the Black Flames (0/4)',
        targetCorruption: 42.0
      },
      // 24. Check in on Little Timmy
      {
        id: 'check_timmy',
        targetType: 'npc',
        targetId: 'timmy',
        title: 'Speak with little Timmy near Happy Mart as the afternoon golden light settles in.',
        corruptedTitle: 'Talk to Timmy',
        targetCorruption: 45.0
      },
      // 25. Visit Baker Benny for Evening Pastries
      {
        id: 'check_baker',
        targetType: 'npc',
        targetId: 'baker',
        title: 'Visit Baker Benny at Sunshine Bakery to check on the evening pastries.',
        corruptedTitle: 'Check on Baker Benny',
        targetCorruption: 48.0
      },
      // 26. Read Updated Notice on Bulletin Board
      {
        id: 'check_notice_evening',
        targetType: 'noticeboard',
        title: 'Read the updated evening note pinned to the Town Notice Board.',
        corruptedTitle: 'Read Evening Notice',
        targetCorruption: 52.0
      },

      // --- ACT V: THE CREEPING STILLNESS & TWILIGHT TRANSITION (Stage 2 -> 3: 52% - 76%) ---
      // 27. Speak with Daisy at Plaza
      {
        id: 'talk_daisy_twilight',
        targetType: 'npc',
        targetId: 'daisy',
        title: 'Speak with Daisy at the Plaza as twilight begins to settle over the valley.',
        corruptedTitle: 'Gaze upon Daisy',
        targetCorruption: 57.0
      },
      // 28. Pet Buster the Dog
      {
        id: 'pet_dog_twilight',
        targetType: 'dog',
        targetId: 'dog',
        title: 'Check on Buster the dog in the pet yard... he seems unusually still.',
        corruptedTitle: 'Observe the Dog',
        targetCorruption: 62.0
      },
      // 29. Talk to Old Man Gregory on the bench
      {
        id: 'talk_gregory_twilight',
        targetType: 'npc',
        targetId: 'gregory',
        title: 'Talk with Old Man Gregory on the bench as the valley falls quiet.',
        corruptedTitle: 'Speak with Gregory',
        targetCorruption: 67.0
      },
      // 30. Retrieve Timmy's Red Balloon
      {
        id: 'find_balloon',
        targetType: 'balloon',
        title: 'Timmy’s Red Balloon drifted near the edge of Whispering Woods. Retrieve it!',
        corruptedTitle: 'Follow the Red Balloon',
        targetCorruption: 72.0
      },
      // 31. Return Balloon to Timmy
      {
        id: 'return_balloon',
        targetType: 'npc',
        targetId: 'timmy',
        title: 'Return the retrieved Red Balloon to Timmy near Happy Mart.',
        corruptedTitle: 'Return Balloon to Timmy',
        targetCorruption: 76.0
      },

      // --- ACT VI: THE AWAKENING & CLIMAX (Stage 3 -> 4: 76% - 100%) ---
      // 32. Speak with Old Man Gregory
      {
        id: 'talk_gregory_final',
        targetType: 'npc',
        targetId: 'gregory',
        title: 'Speak with Old Man Gregory on the bench before the final festival gathering.',
        corruptedTitle: 'Face Gregory on the Bench',
        targetCorruption: 82.0
      },
      // 33. Return to Mayor Barnaby for Ceremony
      {
        id: 'talk_mayor_ceremony',
        targetType: 'npc',
        targetId: 'mayor',
        title: 'Confront Mayor Barnaby at Town Hall for the Grand Festival Gathering.',
        corruptedTitle: 'Approach Mayor Barnaby',
        targetCorruption: 90.0
      },
      // 34. Inspect the Boarded Well in Whispering Woods
      {
        id: 'inspect_well',
        targetType: 'well',
        title: 'Investigate the Boarded Well in deep Whispering Woods.',
        corruptedTitle: 'Investigate the Boarded Well in the woods.',
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
  }

  initNoticeBoardListener() {
    const modal = document.getElementById('notice-board-modal');
    const closeBtn = document.getElementById('notice-board-close-btn');

    const closeModal = () => {
      if (modal && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        try {
          const wrap = document.getElementById('canvas-wrapper');
          wrap?.requestPointerLock?.()?.catch?.(() => {});
        } catch (e) {}

        if (this.currentStep === 2) {
          this.hasReadNotice = true;
          this.hud.showToast("Festival schedule noted! Next, make a wish at the Town Fountain 🪙");
          this.advanceStep(this.goals[2].targetCorruption);
        } else if (this.currentStep === 26) {
          this.hud.showToast("The evening notice was read. Speak with Daisy at the Plaza! 🌻");
          this.advanceStep(this.goals[26].targetCorruption);
        }
      }
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    window.addEventListener('keydown', (e) => {
      if (modal && !modal.classList.contains('hidden')) {
        if (e.code === 'KeyE' || e.code === 'Escape' || e.code === 'Enter') {
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
        if (state && typeof state.currentStep === 'number' && state.currentStep > 0) {
          this.currentStep = state.currentStep;
          this.flowersPicked = state.flowersPicked || 0;
          this.petDogCount = state.petDogCount || 0;
          if (Array.isArray(state.litLamps)) this.litLamps = state.litLamps;
          if (this.corruption && state.targetCorruption) {
            this.corruption.setCorruption(state.targetCorruption);
          }
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
      this.hud.showToast("Ding-dong! The morning festival bell rings across the valley! Next, check the Notice Board 📜");
      this.advanceStep(this.goals[1].targetCorruption);
    } else {
      this.hud.showToast("The festival bell rings merrily across the valley!");
    }
  }

  readNoticeBoard(target) {
    if (this.audio) this.audio.playPageFlip();
    const modal = document.getElementById('notice-board-modal');
    if (modal) {
      modal.classList.remove('hidden');
      try {
        document.exitPointerLock?.();
      } catch (e) {}
    }
  }

  interactFountain(target) {
    if (this.audio) {
      this.audio.playWaterSplash();
      setTimeout(() => this.audio.playSparkle(), 150);
    }

    if (this.currentStep === 3) {
      this.hasWishedFountain = true;
      this.hud.showToast("You tossed a shiny coin into the fountain! Next, talk to Daisy at the flowerbeds 🌻");
      this.advanceStep(this.goals[3].targetCorruption);
    } else {
      this.hud.showToast("You gaze into the sparkling fountain water.");
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
      this.hud.showToast("Picked up Daisy’s watering can! Bring it back to Daisy 🌻");
      this.advanceStep(this.goals[5].targetCorruption);
    } else {
      this.hud.showToast("Picked up Daisy’s green watering can!");
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
      this.hud.showToast("Picked up the bakery flour sack! Deliver it to Baker Benny! 🌾");
      this.advanceStep(this.goals[15].targetCorruption);
    } else {
      this.hud.showToast("Picked up a sack of bakery flour! Saved in bag. 🌾");
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
      this.hud.showToast("Collected fresh wildberries! Deliver them to Baker Benny! 🫐");
      this.advanceStep(this.goals[17].targetCorruption);
    } else {
      this.hud.showToast("Collected ripe wildberries! Saved in bag. 🫐");
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
      this.hud.showToast("Found Mayor Barnaby’s Golden Pocket Watch! Return it to him! ⏱️");
      this.advanceStep(this.goals[21].targetCorruption);
    } else {
      this.hud.showToast("Found a shiny Golden Pocket Watch! Saved in bag. ⏱️");
    }
  }

  lightStreetLamp(lampObj) {
    const lampIdx = lampObj.userData?.lampIndex ?? 0;
    if (this.litLamps[lampIdx]) return;
    this.litLamps[lampIdx] = true;

    if (window.worldScene) {
      window.worldScene.lightStreetLamp(lampIdx);
    }
    if (this.audio) this.audio.playSparkle();

    const litCount = this.litLamps.filter(Boolean).length;
    this.hud.showToast(`Lit Festival Lantern! 🏮 (${litCount}/4)`);

    if (litCount >= 4) {
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
      this.hud.showToast("Found the squeaky toy ball! Bring it to Buster in the Pet Yard! 🐶");
      this.advanceStep(this.goals[11].targetCorruption);
    } else {
      this.hud.showToast("Found a squeaky red ball in the garden! Saved in your bag. 🎾");
    }
  }

  onTalkedToMayor() {
    if (this.currentStep === 0) {
      this.hud.showToast("Mayor Barnaby: Ring the Morning Festival Bell at Town Hall! 🔔");
      if (this.audio) this.audio.playSparkle();
      this.advanceStep(this.goals[0].targetCorruption);
    } else if (this.currentStep === 22 && this.hasMayorWatch) {
      this.hasMayorWatch = false;
      this.hud.showToast("Mayor Barnaby: Thank you for finding my watch! Please light the 4 street lanterns around the plaza! 🏮");
      if (this.audio) this.audio.playFanfare();
      this.advanceStep(this.goals[22].targetCorruption);
    } else if (this.currentStep === 33) {
      this.hud.showToast("Mayor Barnaby: The festival gathering is beginning... Head to the Boarded Well in the woods! 🗝️");
      if (this.audio) this.audio.playGlitchStab();
      this.advanceStep(this.goals[33].targetCorruption);
    } else {
      this.hud.showToast("Mayor Barnaby: Have a wonderful sunny day in Sunnyville! 🎩");
    }
  }

  onTalkedToDaisy() {
    if (this.currentStep < 4) {
      this.hud.showToast("Daisy: Hi there! Make sure to ring the festival bell and make a wish at the fountain first! 🪙");
      return;
    }

    if (this.currentStep === 4) {
      if (this.hasWateringCan) {
        this.currentStep = 6;
        this.hud.showToast("Daisy: You brought my watering can! Let's water the plaza blossoms! 🚿");
        this.advanceStep(this.goals[6].targetCorruption);
      } else {
        this.hud.showToast("Daisy: Fetch my green watering can from near the East Planter! 🚿");
        this.advanceStep(this.goals[4].targetCorruption);
      }
    } else if (this.currentStep === 6 && this.hasWateringCan) {
      this.hasWateringCan = false;
      if (this.flowersPicked >= 3) {
        this.hasBouquet = true;
        this.currentStep = 10;
        this.hud.showToast("Daisy: You already picked all 3 Golden Sunflowers! Grand bouquet complete! 💐");
        if (this.audio) this.audio.playFanfare();
        this.advanceStep(this.goals[10].targetCorruption);
      } else {
        this.currentStep = 7 + this.flowersPicked;
        this.hud.showToast("Daisy: Planter watered! Now pick 3 Golden Sunflowers around town! 🌻");
        if (this.audio) this.audio.playSparkle();
        this.renderCurrentGoal();
      }
    } else if ((this.currentStep >= 7 && this.currentStep <= 10) && this.flowersPicked >= 3) {
      this.hasBouquet = true;
      if (this.audio) this.audio.playFanfare();
      if (this.hasDogBall) {
        this.currentStep = 12;
        this.hud.showToast("Daisy: Bouquet ready! You already found Buster's squeaky ball! Bring it to him in the Pet Yard! 🐶");
      } else {
        this.currentStep = 11;
        this.hud.showToast("Daisy: Bouquet ready! Buster the dog lost his toy in the Gazebo Garden. 🎾");
      }
      if (this.corruption) this.corruption.setTargetCorruption(this.goals[10].targetCorruption);
      this.renderCurrentGoal();
    } else if (this.currentStep === 27) {
      this.hud.showToast("Daisy: 'The flowers feel cold... Buster the dog is waiting in the yard.' 🐶");
      if (this.audio) this.audio.playGlitchStab();
      this.advanceStep(this.goals[27].targetCorruption);
    } else {
      this.hud.showToast("Daisy: The flowers smell wonderful today! 🌻");
    }
  }

  pickSunflower(flowerObj) {
    if (!flowerObj || flowerObj.userData.isPicked) return;

    flowerObj.userData.isPicked = true;
    flowerObj.userData.interactable = false;
    flowerObj.visible = false;

    if (window.worldScene && window.worldScene.interactableObjects) {
      const idx = window.worldScene.interactableObjects.indexOf(flowerObj);
      if (idx !== -1) window.worldScene.interactableObjects.splice(idx, 1);
    }

    this.flowersPicked++;
    if (this.audio) this.audio.playSparkle();

    if (this.flowersPicked >= 3) {
      this.hud.showToast("Collected all 3 Sunflowers! Bring them to Daisy at the Plaza! 💐");
      if (this.currentStep >= 6 && this.currentStep <= 9) {
        this.currentStep = 10; // Deliver Sunflowers
        if (this.corruption) this.corruption.setTargetCorruption(this.goals[9].targetCorruption);
      }
    } else {
      this.hud.showToast(`Sunflower Picked! 🌻 (${this.flowersPicked}/3)`);
      if (this.currentStep >= 7 && this.currentStep <= 9) {
        this.currentStep = 7 + this.flowersPicked;
        if (this.corruption) this.corruption.setTargetCorruption(this.goals[6 + this.flowersPicked].targetCorruption);
      }
    }
    this.renderCurrentGoal();
  }

  onTalkedToGregory() {
    if (this.currentStep === 20) {
      this.hud.showToast("Gregory: Blessed festival! Mayor Barnaby dropped his golden watch near the fountain. ⏱️");
      if (this.audio) this.audio.playSparkle();
      this.advanceStep(this.goals[20].targetCorruption);
    } else if (this.currentStep === 29) {
      this.hud.showToast("Gregory: 'Timmy’s red balloon slipped away into the woods... please retrieve it for the boy.' 🎈");
      if (this.audio) this.audio.playGlitchStab();
      this.advanceStep(this.goals[29].targetCorruption);
    } else if (this.currentStep === 32) {
      this.hud.showToast("Gregory: 'The evening has arrived. Go to Mayor Barnaby at Town Hall for the ceremony.' 🎩");
      if (this.audio) this.audio.playGlitchStab();
      this.advanceStep(this.goals[32].targetCorruption);
    }
  }

  onTalkedToBaker() {
    if (this.currentStep === 14) {
      if (this.hasFlourSack) {
        this.currentStep = 16;
        this.hud.showToast("Baker Benny: You brought the flour! Now let's get a basket of wildberries from the orchard! 🫐");
        this.advanceStep(this.goals[16].targetCorruption);
      } else {
        this.hud.showToast("Baker Benny: Fetch the flour sack from outside Happy Mart so I can bake the festival batch! 🌾");
        this.advanceStep(this.goals[14].targetCorruption);
      }
    } else if (this.currentStep === 16 && this.hasFlourSack) {
      this.hasFlourSack = false;
      if (this.hasBerryBasket) {
        this.hasBerryBasket = false;
        this.hasTart = true;
        this.currentStep = 19;
        this.hud.showToast("Baker Benny: Fresh Berry Tart ready! Deliver to Timmy near Happy Mart. 🎈");
        if (this.audio) this.audio.playFanfare();
        this.advanceStep(this.goals[18].targetCorruption);
      } else {
        this.hud.showToast("Baker Benny: Flour received! Collect a basket of wildberries near the orchard trees! 🫐");
        if (this.audio) this.audio.playSparkle();
        this.advanceStep(this.goals[16].targetCorruption);
      }
    } else if (this.currentStep === 18 && this.hasBerryBasket) {
      this.hasBerryBasket = false;
      this.hasTart = true;
      this.hud.showToast("Baker Benny: Fresh Berry Tart is ready! Deliver to little Timmy near Happy Mart! 🎈");
      if (this.audio) this.audio.playFanfare();
      this.advanceStep(this.goals[18].targetCorruption);
    } else if (this.currentStep === 25) {
      this.hud.showToast("Baker Benny: Check the bulletin board for the evening festival schedule! 📋");
      if (this.audio) this.audio.playSparkle();
      this.advanceStep(this.goals[25].targetCorruption);
    }
  }

  onTalkedToTimmy() {
    if (this.currentStep === 19 && this.hasTart) {
      this.hasTart = false;
      this.hud.showToast("Timmy: Yummy berry tart! Ask Old Man Gregory on the bench for his blessing! 👴");
      if (this.audio) this.audio.playFanfare();
      this.advanceStep(this.goals[19].targetCorruption);
    } else if (this.currentStep === 24) {
      this.hud.showToast("Timmy: The lanterns look so pretty! Go check on Baker Benny's evening pastries! 🧁");
      this.audio.playSparkle();
      this.advanceStep(this.goals[24].targetCorruption);
    } else if (this.currentStep === 31 && this.hasBalloon) {
      this.hasBalloon = false;
      this.hud.showToast("Timmy: Thank you for finding my balloon! Speak with Gregory on the bench... 👴");
      if (this.audio) this.audio.playGlitchStab();
      this.advanceStep(this.goals[31].targetCorruption);
    }
  }

  petDog() {
    if (this.audio) this.audio.playDogBark();

    const dogNameplate = window.entityManager?.getNPC?.('dog')?.nameplate;
    if (dogNameplate) {
      const origY = dogNameplate.position.y;
      dogNameplate.position.y = origY + 0.35;
      setTimeout(() => { dogNameplate.position.y = origY; }, 250);
    }

    if (this.currentStep === 12 || (this.currentStep === 11 && this.hasDogBall)) {
      this.hasDogBall = false;
      this.currentStep = 13;
      this.hud.showToast("Buster happily caught the red ball! Give him gentle head pats! 🐶 (0/3)");
      if (this.audio) this.audio.playToySqueak();
      if (this.corruption) this.corruption.setTargetCorruption(this.goals[12].targetCorruption);
      this.renderCurrentGoal();
      return;
    }

    if (this.currentStep === 13) {
      this.petDogCount++;
      if (this.petDogCount < 3) {
        this.hud.showToast(`*Woof!* Buster loves head scratches! 🐶 (${this.petDogCount}/3)`);
        this.renderCurrentGoal();
      } else {
        this.hud.showToast("Buster happily wags his tail! Now visit Baker Benny at Sunshine Bakery! 🧁");
        this.advanceStep(this.goals[13].targetCorruption);
      }
      return;
    }

    if (this.currentStep === 28) {
      this.hud.showToast("Buster stares past your shoulder into the dusk. Speak with Old Man Gregory on the bench... 👴");
      if (this.audio) this.audio.playGlitchStab();
      this.advanceStep(this.goals[28].targetCorruption);
      return;
    }

    this.hud.showToast("*Woof!* Buster wags his bushy tail! 🐶");
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

    if (this.currentStep === 30) {
      this.hud.showToast("Retrieved Red Balloon! Return it to Timmy near Happy Mart! 🎈");
      this.advanceStep(this.goals[30].targetCorruption);
    } else {
      this.hud.showToast("Found a floating Red Balloon! Kept it safely in your bag. 🎈");
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
