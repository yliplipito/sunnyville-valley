/**
 * SUNNYVILLE VALLEY - Village Dialogue & Story Engine
 * Features:
 * - Context-aware NPC speech and story quest progression
 * - Distinct initial quest lines, active quest reminders, and turn-in thank yous
 * - Natural next-quest instructions in NPC dialogues
 * - Expressive Animalese voice synthesis with formant filtering
 */

export class DialogueSystem {
  constructor(audioManager) {
    this.audio = audioManager;
    this.boxEl = document.getElementById('dialogue-box');
    this.avatarEl = document.getElementById('dialogue-avatar');
    this.speakerEl = document.getElementById('dialogue-speaker');
    this.textEl = document.getElementById('dialogue-text');
    this.glitchTextEl = document.getElementById('dialogue-glitch-text');

    this.isOpen = false;
    this.isTyping = false;
    this.currentLines = [];
    this.lineIndex = 0;
    this.targetText = '';
    this.typeIndex = 0;
    this.typeInterval = null;
    this.onCompleteCallback = null;
    this.currentPitch = 400;

    window.lastDialogueClosedTime = 0;

    this.initEventListeners();
  }

  initEventListeners() {
    if (this.boxEl) {
      this.boxEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.advanceDialogue();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;

      if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
        this.advanceDialogue();
      }
    });
  }

  /**
   * Get context-aware NPC dialogue based on current quest state and corruption stage
   */
  getDialogueFor(npcId, stage = 0) {
    const step = window.questManager ? window.questManager.currentStep : 0;

    // --- 1. MAYOR BARNABY ---
    if (npcId === 'mayor') {
      if (step === 0) {
        return [
          "Greetings, traveler! 🎩 Welcome to Sunnyville's Grand Summer Festival!",
          "Could you do the honors and ring the festival bell right behind me?"
        ];
      }
      if (step === 22) {
        return [
          "Splendid afternoon, friend! 🎩",
          "Could you help light the 4 festival lanterns around the town plaza?"
        ];
      }
      if (step === 33) {
        return [
          "The sun has set on the valley, citizen. 🎩",
          "The Boarded Well in the deep woods is unsealed. Go to it now."
        ];
      }
      if (step < 22) {
        return [
          "A splendid sunny day in the valley, citizen! 🎩 Enjoy the festival activities around town!"
        ];
      }
      if (step < 33) {
        return [
          "Look at how quiet the plaza has become... 🎩 The festival will last as long as you stay with us."
        ];
      }
      return [
        "[Mayor Barnaby stands completely still. His black eyes stare unblinkingly through you.]"
      ];
    }

    // --- 2. DAISY THE FLORIST ---
    if (npcId === 'daisy') {
      if (step === 4) {
        return [
          "Hi there, sunshine! 🌻 I'm arranging the Grand Festival Bouquet!",
          "Could you fetch my green watering can from near the planter box right here?"
        ];
      }
      if (step === 6) {
        return [
          "Thank you so much! 🌻 Now could you help me pick 3 golden sunflowers around the plaza?"
        ];
      }
      if (step === 10) {
        return [
          "These sunflowers look radiant! 🌻",
          "Buster the dog lost his red squeaky ball across on the park lawn. Could you find it for him?"
        ];
      }
      if (step === 27) {
        return [
          "The sunflowers... their petals feel like cold stone. 🌻 Have you checked on Buster in his yard?"
        ];
      }
      if (step < 4) {
        return [
          "Hello! 🌻 The flowers love this bright morning light! Make sure to ring the festival bell first!"
        ];
      }
      if (step > 6 && step < 10) {
        return [
          "I'm waiting for 3 fresh golden sunflowers to finish the bouquet! 🌻"
        ];
      }
      if (step > 10 && step < 27) {
        return [
          "The bouquet looks wonderful! 🌻 Baker Benny's pastries smell delicious!"
        ];
      }
      return [
        "[Daisy gazes quietly into the shadows, clutching her frozen bouquet in silence.]"
      ];
    }

    // --- 3. BAKER BENNY ---
    if (npcId === 'baker') {
      if (step === 14) {
        return [
          "Welcome to Sunshine Bakery! 🧁 I'm baking fresh blueberry tarts for the festival!",
          "Could you grab the flour sack sitting outside near Timmy?"
        ];
      }
      if (step === 16) {
        return [
          "Superb! Just what I needed! 🌾",
          "Now, could you grab a fresh basket of blueberries from by the gazebo?"
        ];
      }
      if (step === 18) {
        return [
          "The blueberry tarts are baked to perfection! 🫐",
          "Here, take this warm blueberry tart to Little Timmy near Happy Mart!"
        ];
      }
      if (step === 25) {
        return [
          "The ovens are cooling down... There is a new evening note pinned to the Town Notice Board."
        ];
      }
      if (step < 14) {
        return [
          "Hello! 🧁 Sunshine Bakery will have fresh festival pastries ready very soon!"
        ];
      }
      if (step > 18 && step < 25) {
        return [
          "Timmy is going to love that blueberry tart! 🧁 Enjoy the festival!"
        ];
      }
      return [
        "[Baker Benny stands facing the cold, unlit ovens in total stillness.]"
      ];
    }

    // --- 4. LITTLE TIMMY ---
    if (npcId === 'timmy') {
      if (step === 19) {
        return [
          "Yaaay! 🎈 A warm blueberry tart! Thank you so much!",
          "Old Man Gregory on the bench wanted to speak with you!"
        ];
      }
      if (step === 24) {
        return [
          "Look at the lanterns glow! 🎈 But the shadows look so long... Baker Benny wanted to see you."
        ];
      }
      if (step === 31) {
        return [
          "You found my red balloon! 🎈 Thank you...",
          "The air feels so cold now... Old Man Gregory is waiting on his bench."
        ];
      }
      if (step < 19) {
        return [
          "Hi! 🎈 I love playing with my red balloon! I hope Baker Benny has warm tarts ready soon!"
        ];
      }
      if (step > 19 && step < 24) {
        return [
          "The festival music sounds so happy today! 🎈"
        ];
      }
      return [
        "[Little Timmy stands gripping his balloon string. His eyes are hollow and quiet.]"
      ];
    }

    // --- 5. OLD MAN GREGORY ---
    if (npcId === 'gregory') {
      if (step === 20) {
        return [
          "Ah, welcome young friend. 👴 The breeze feels pleasant on this old bench.",
          "I seem to have left my vintage pocket watch on the display stand by the fountain... Would you mind fetching it for me?"
        ];
      }
      if (step === 22) {
        return [
          "My pocket watch! 👴 You found it! Thank you kindly, young friend.",
          "Mayor Barnaby is preparing to illuminate the plaza for the evening. Go speak with him."
        ];
      }
      if (step === 29) {
        return [
          "The wind has died down completely. 👴",
          "Little Timmy let go of his red balloon by mistake... it drifted toward the edge of Whispering Woods. Could you retrieve it for the boy?"
        ];
      }
      if (step === 32) {
        return [
          "The festival gathering is beginning, child. 👴 Go speak with Mayor Barnaby at Town Hall. He is waiting."
        ];
      }
      if (step < 20) {
        return [
          "Enjoy our peaceful valley, young friend. 👴 Take your time."
        ];
      }
      if (step > 20 && step < 29) {
        return [
          "When you get to be my age, you notice things. The fountain water has grown very still. 👴"
        ];
      }
      return [
        "[Old Man Gregory sits motionless like a carved stone monument.]"
      ];
    }

    return ["Hello there, neighbor! 🌞"];
  }

  showDialogue(speakerName, avatarIcon, lines, pitch = 400, onComplete = null) {
    if (!this.boxEl) return;

    this.isOpen = true;
    window.inDialogue = true;
    const promptEl = document.getElementById('interact-prompt');
    if (promptEl) promptEl.classList.add('hidden');
    const crosshair = document.getElementById('crosshair');
    if (crosshair) crosshair.classList.remove('hovering-target');

    this.currentLines = Array.isArray(lines) ? lines : [lines];
    this.lineIndex = 0;
    this.currentPitch = pitch;
    this.onCompleteCallback = onComplete;

    this.speakerEl.textContent = speakerName;
    if (this.avatarEl) this.avatarEl.textContent = avatarIcon;
    this.boxEl.classList.remove('hidden');
    this.startTypingLine(this.currentLines[0]);
  }

  startTypingLine(text) {
    this.isTyping = true;
    this.targetText = text;
    this.typeIndex = 0;
    this.textEl.textContent = '';
    if (this.glitchTextEl) this.glitchTextEl.classList.add('hidden');

    if (this.typeInterval) clearInterval(this.typeInterval);

    this.typeInterval = setInterval(() => {
      if (this.typeIndex < this.targetText.length) {
        const char = this.targetText[this.typeIndex];
        this.textEl.textContent += char;
        this.typeIndex++;

        if (char !== ' ' && this.typeIndex % 2 === 0 && this.audio) {
          const pitch = (window.currentStage >= 3)
            ? this.currentPitch * (0.85 + Math.random() * 0.15)
            : this.currentPitch;
          this.audio.playAnimalese(pitch, char.charCodeAt(0));
        }
      } else {
        this.finishTyping();
      }
    }, 28);
  }

  finishTyping() {
    if (this.typeInterval) clearInterval(this.typeInterval);
    this.isTyping = false;
    this.textEl.textContent = this.targetText;
  }

  advanceDialogue() {
    if (this.isTyping) {
      this.finishTyping();
      return;
    }

    this.lineIndex++;
    if (this.lineIndex < this.currentLines.length) {
      this.startTypingLine(this.currentLines[this.lineIndex]);
    } else {
      this.closeDialogue();
    }
  }

  closeDialogue() {
    if (this.typeInterval) clearInterval(this.typeInterval);
    this.isOpen = false;
    this.isTyping = false;
    window.inDialogue = false;
    window.lastDialogueClosedTime = Date.now();

    if (this.boxEl) {
      this.boxEl.classList.add('hidden');
    }

    if (this.onCompleteCallback) {
      const cb = this.onCompleteCallback;
      this.onCompleteCallback = null;
      cb();
    }
  }

  generateZalgo(text) {
    const marks = ['\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0334', '\u0335', '\u0336', '\u0337', '\u0338'];
    return text.split('').map(c => {
      let res = c;
      for (let i = 0; i < 3; i++) {
        res += marks[Math.floor(Math.random() * marks.length)];
      }
      return res;
    }).join('');
  }
}
