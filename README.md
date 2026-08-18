# 🌞 Sunnyville Valley 🌻

[![Deploy Status](https://github.com/yliplipito/sunnyville-valley/actions/workflows/deploy.yml/badge.svg)](https://github.com/yliplipito/sunnyville-valley/actions)
[![Live Demo](https://img.shields.io/badge/Play%20Now-GitHub%20Pages-success?style=for-the-badge&logo=google-chrome&logoColor=white)](https://yliplipito.github.io/sunnyville-valley/)
[![Built with Three.js](https://img.shields.io/badge/Three.js-r185-black?style=flat-square&logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> **Step into the happiest, coziest 3D village adventure where the sun is always shining!** 🌸✨🎈  
> Stroll through blooming flower gardens, chat with friendly neighbors, bake fresh blueberry tarts, pet playful puppies, and help prepare the Grand Summer Festival!

👉 **[PLAY LIVE IN BROWSER](https://yliplipito.github.io/sunnyville-valley/)** 👈

---

## 🎮 How to Play

| Action | Controls (Keyboard & Mouse) |
| :--- | :--- |
| **Move** | <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> / Arrow Keys |
| **Look Around** | <kbd>Mouse</kbd> (First-Person Pointer Lock) |
| **Interact / Talk** | <kbd>E</kbd> or <kbd>Left Click</kbd> |
| **Jump** | <kbd>Space</kbd> |
| **Sprint** | Hold <kbd>Shift</kbd> |
| **Sound Toggle** | Click 🔊 / 🔇 in the HUD Top Bar |
| **Fullscreen** | Click ⛶ in the HUD Top Bar |

---

## 🎈 Meet Your Neighbors

- 🎩 **Mayor Barnaby**: The distinguished, cheerful mayor who welcomes all travelers to the Grand Summer Festival!
- 🌻 **Daisy the Florist**: A kind-hearted gardener with a passion for radiant golden sunflowers and fresh flowerbeds.
- 🧁 **Baker Benny**: Master pastry chef at Sunshine Bakery, baking warm wildberry tarts all afternoon.
- 👴 **Old Man Gregory**: The wise village elder resting peacefully on the plaza bench.
- 🎈 **Little Timmy**: An energetic boy who loves red balloons and sweet treats.
- 🐶 **Buster the Dog**: The friendliest, fluffiest pup in the valley! (Give him gentle pats and find his squeaky ball!)

---

## 🌟 Key Features

- **Cozy 3D Town**: Handcrafted low-poly Nintendo / Animal Crossing aesthetic with cobblestone paths, flowerbeds, and a sparkling town fountain.
- **Dynamic 34-Step Storyline**: Help villagers prepare the town, gather supplies, solve errands, and experience the village festival.
- **Animalese Voice Synthesis**: Expressive speech synthesis with character-specific formant pitches and real-time audio modulation.
- **Dynamic Atmosphere Engine**: Smooth, frame-accurate lighting transitions, animated butterflies, chimney smoke, and organic ambient soundscapes.
- **Surface-Aware Physics**: First-person collision sliding against buildings, fences, trees, and elevated platforms.

---

## 🛠️ Project Structure

```text
sunnyville-valley/
├── index.html              # Main HTML5 entry point & HUD UI layout
├── style.css               # Fullscreen responsive UI styling & animations
├── vite.config.js          # Vite bundler configuration
├── package.json            # Dependencies & build scripts
├── public/
│   └── audio/              # Sound effects (bell, splash, knocks, whispers)
└── js/
    ├── main.js             # Game bootstrap, event loop & coordinator
    ├── engine/
    │   ├── audio.js        # Web Audio API engine & music sequencer
    │   └── controls3d.js   # First-person pointer lock & collision physics
    ├── world/
    │   ├── scene3d.js      # 3D Town environment, lighting, and props
    │   ├── entities3d.js   # Character models, animations & nameplates
    │   └── dialogue.js     # Dialogue engine & text typing animations
    ├── systems/
    │   ├── quests.js       # 34-Step festival quest state machine
    │   ├── atmosphere.js   # Environmental progression & sky transitions
    │   └── effects.js      # Visual FX, screen transitions & cinematic ending
    └── ui/
        ├── hud.js          # In-game HUD task tracker & notification coordinator
        └── debug.js        # Developer control panel (~ key)
```

---

## 🚀 Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- `npm`

### Installation
```bash
# Clone repository
git clone https://github.com/yliplipito/sunnyville-valley.git

# Navigate into project directory
cd sunnyville-valley

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open `http://localhost:5173/` in your browser to play locally!

### Production Build
```bash
npm run build
```
The compiled, production-ready assets will be generated in the `dist/` directory.

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
