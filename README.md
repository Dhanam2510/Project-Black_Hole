# SPACE COMMAND – ULTIMATE SPACE MISSION DESIGN AND SIMULATION GAME

[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r169-black.svg)](https://threejs.org/)
[![React Three Fiber](https://img.shields.io/badge/R3F-v8-blue.svg)](https://docs.pmnd.rs/react-three-fiber)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An interactive, professional, educational 3D Space Mission Design and Management Simulator. Players experience the complete lifecycle of planning, designing, assembling, budgeting, launching, and operating real-world inspired deep space missions.

> *Disclaimer: This is an independent educational game inspired by real-world space exploration and aerospace engineering concepts, not an official NASA product.*

---

## 🌟 CORE HIGHLIGHTS

- **Playable 3D Simulation Game**: Real-time physics, mechanical slot snapping, electrical power calculations, and orbital progression.
- **Interactive 3D Assembly Bay**: 12 modular spacecraft subsystems with 3D slot attachment, component rotation, and live engineering audits.
- **4 Rich Mission Theaters**:
  1. **Earth Observation**: Multi-spectral Earth imaging (optical, infrared, NDVI vegetation, radar), climate and asteroid hazard detection.
  2. **Moon Exploration**: 3 distinct modes—Lunar Rover traverse & soil drilling, Lunar Lander soft descent simulation, and Astronaut EVA exploration in 1/6th gravity with flag planting & ALSEP science deployment.
  3. **Mars Exploration**: Interplanetary Hohmann transfer, Mars surface exploration rover, rock laser spectroscopy, and paleolake delta clay drilling.
  4. **Sun Exploration**: Unmanned extreme heliophysics probe with carbon-composite heat shield, perihelion approach, and coronal mass ejection sampling.
- **Cinematic 3D Launch Sequence**: T-10 countdown, rocket ignition plume, stage separation, clamshell fairing jettison, and orbital payload deployment.
- **Live Mission Control Dashboard**: Real-time telemetry (power balance, battery %, temperature, propellant, comms delay, signal strength) and data transmission uplink.
- **100-Point Scoring System**: Comprehensive post-mission flight debrief with ranks (S, A, B, C, D) and engineering critiques.
- **Zero External Audio Dependencies**: Pure Web Audio API procedural sound synthesizer (engine rumble, countdown beeps, telemetry chirps, alert sirens, and radio chatter).
- **Persistent Local Storage**: Checkpoint auto-saving, flight logbook history, and custom satellite configurations.

---

## 🚀 TECHNOLOGY STACK

- **Frontend Interface**: React 18 (TypeScript)
- **3D Graphics Engine**: Three.js & React Three Fiber (`@react-three/fiber`)
- **3D Helpers & Controls**: Drei (`@react-three/drei`)
- **Styling & Layout**: Tailwind CSS with custom aerospace HUD themes
- **Icons**: Lucide Icons (`lucide-react`)
- **Audio Synthesizer**: Web Audio API Procedural Audio Engine
- **Celebration Effects**: Canvas Confetti
- **Build Tool**: Vite 6

---

## 📁 PROJECT FOLDER STRUCTURE

```
NASA Black_Hole Project/
├── public/
├── src/
│   ├── components/
│   │   ├── 3d/
│   │   │   ├── LaunchPad3D.tsx         # 3D Rocket pad, countdown, ignition & staging
│   │   │   ├── MainScene3D.tsx         # Animated 3D Earth, stars & floating spacecraft
│   │   │   ├── OrbitSim3D.tsx          # 3D Solar system, orbital mechanics & transfer orbits
│   │   │   ├── PlanetarySurface3D.tsx  # Lunar/Martian surface, 3D Rover, Lander & Astronaut
│   │   │   ├── SatelliteWorkshop3D.tsx # 3D Cleanroom assembly bay with floor grid & slots
│   │   │   └── SpacecraftModel.tsx     # Modular 3D spacecraft component renderer
│   │   └── ui/
│   │       ├── AssemblyWorkshop.tsx    # 3D Satellite Assembly Bay & engineering calculations
│   │       ├── AstronautReadinessModal.tsx # Crew selection & educational readiness audit
│   │       ├── EquipmentShop.tsx       # Equipment marketplace, budget ledger & resale
│   │       ├── HowToPlayModal.tsx      # Comprehensive illustrated flight manual
│   │       ├── LaunchControl.tsx       # Launch countdown HUD, altitude/velocity telemetry
│   │       ├── MainMenu.tsx            # Cinematic space agency main menu
│   │       ├── MissionControlDashboard.tsx # Real-time telemetry, Earth imaging & data downlink
│   │       ├── MissionEvaluation.tsx   # 100-point flight debrief, score breakdown & ranks
│   │       ├── MissionHistory.tsx      # Persistent flight logbook & past mission archives
│   │       ├── MissionSelect.tsx       # 4 mission theaters (Earth, Moon, Mars, Sun)
│   │       ├── OrbitControl.tsx        # Interplanetary time warp & orbit insertion controls
│   │       ├── RocketSelect.tsx        # Rocket vehicle catalog & automated flight diagnostics
│   │       ├── SettingsModal.tsx       # Graphics presets (Performance/High/Ultra), audio volumes
│   │       ├── SubMissionSelect.tsx    # Mode selection for Moon and Mars architectures
│   │       └── TeamModeModal.tsx       # 4-participant mission control console architecture
│   ├── data/
│   │   ├── astronauts.ts               # Crew roster, bios, EVA suits, life support gear
│   │   ├── components.ts               # 12 subsystem catalog with mass, cost, power & specs
│   │   ├── events.ts                   # Random mission challenges per destination
│   │   ├── missions.ts                 # Mission definitions, objectives, delta-V & hazards
│   │   └── rockets.ts                  # Launch vehicle fleet (Pegasus, Falcon, Titan, Nova)
│   ├── types/
│   │   └── game.ts                     # TypeScript data interfaces and types
│   ├── utils/
│   │   ├── audio.ts                    # Web Audio API sound synthesizer
│   │   ├── storage.ts                  # LocalStorage state persistence & logbook
│   │   └── textures.ts                 # Procedural canvas textures (Earth, Moon, Mars, Sun)
│   ├── App.tsx                         # Master application state machine & view router
│   ├── index.css                       # Aerospace HUD styles & scanlines
│   └── main.tsx                        # React application entry point
├── index.html                          # HTML shell with Google Fonts (Orbitron & Rajdhani)
├── package.json                        # Node dependencies and build scripts
├── postcss.config.js                   # PostCSS configuration
├── tailwind.config.js                  # Tailwind design system tokens
├── tsconfig.json                       # TypeScript compiler configuration
└── vite.config.ts                      # Vite configuration
```

---

## 🛠️ INSTALLATION & LOCAL EXECUTION

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18 or 20+ recommended)
- `npm` or `pnpm`

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/S-Prasanna-19/Project-Black_Hole.git
   cd Project-Black_Hole
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

4. **Build for production:**
   ```bash
   npm run build
   ```
   The production-optimized bundle will be created in `dist/`.

5. **Preview production build:**
   ```bash
   npm run preview
   ```

---

## 🎮 COMPLETE GAMEPLAY WALKTHROUGH

### Scenario 1: Earth Observation Mission (Terra Monitor)
1. In the **Main Menu**, click **START NEW MISSION**.
2. Select **MISSION ALPHA: TERRA MONITOR** (Destination: Earth Sun-Synchronous Orbit, 705 km).
3. In the **3D Assembly Bay**:
   - The **Hexagonal Deep Space Bus** is pre-loaded in the core chassis.
   - Select the `leftWing` slot and attach **Deployable Dual Solar Wings** (+450 W).
   - Select the `rightWing` slot and attach **Deployable Dual Solar Wings** (+450 W).
   - Select the `topDish` slot and attach the **Ka-Band High Gain Parabolic Dish**.
   - Select the `bottomOptics` slot and attach the **Multispectral Earth Observing Camera**.
   - Select the `frontBay` slot and attach the **Li-Ion Space Battery Pack (1,200 Wh)**.
   - Select the `rearBay` slot and attach the **Dual Autonomous Star Trackers**.
   - Verify the **Engineering Audit** passes (all checkmarks green).
4. Click **APPROVE & SELECT ROCKET**.
   - Select **Falcon-Alpha Medium Lifter** (Capacity: 3,800 kg).
   - Verify automated pre-launch diagnostics pass.
5. Click **INITIATE LAUNCH COUNTDOWN**:
   - Watch the 3D rocket ignition, ascent, stage 1 separation, fairing jettison, and satellite release into orbit.
6. In **Orbit & Space Travel Simulator**:
   - Adjust simulation speed (1x to 100x) and observe the orbital ground track.
   - Click **ENTER DESTINATION & OPEN MISSION CONTROL**.
7. In **Mission Control Center**:
   - Switch optical filters: Optical, Infrared, Multispectral (NDVI), and Radar.
   - Click **CAPTURE HIGH-RES SIMULATED IMAGE** to photograph Earth.
   - Click **CLIMATE SOUNDER** and **OCEAN RADAR** to record environmental telemetry.
   - Click **TRANSMIT DATA TO EARTH** to downlink buffered science packets.
   - Make tactical decisions on random mission events (e.g. cloud cover or orbital debris).
8. Click **CONCLUDE & EVALUATE MISSION**:
   - Review your 100-point score, achievement badges, and engineering critique.

### Scenario 2: Lunar Astronaut Expedition (Selene Expedition)
1. Select **MISSION BETA: MOON EXPLORATION**.
2. Choose **ASTRONAUT EXPEDITION** architecture.
3. In the **Astronaut Corps Readiness Console**:
   - Review crew members: Commander, Specialist, Geologist, Flight Engineer.
   - Upgrade crew flight suits to **Apollo-Next Mk IV Lunar EVA Suits**.
   - Top up life support consumables (oxygen ≥ 48h, rations ≥ 14 days).
   - Complete flight training until all 5 readiness criteria pass.
4. Assemble your lunar spacecraft and select the **Nova-Super Heavy Explorer** rocket.
5. Perform trans-lunar injection and enter lunar orbit.
6. Switch to the **3D Lunar Surface View**:
   - Walk and jump in 1/6th lunar gravity using **[W/A/S/D]** or arrow keys.
   - Plant the mission flag.
   - Deploy the ALSEP scientific surface station.
   - Monitor suit oxygen levels and return to Mission Control.

---

## ⚙️ GRAPHICS PRESETS & PERFORMANCE MODES

Accessible via **SETTINGS**:
- **Performance**: Optimized geometry, disabled shadow maps, reduced particle counts, ideal for mobile or low-power GPUs.
- **High** *(Default)*: Full dynamic shadows, 2,000 background stars, procedural planet shaders, 60 FPS target.
- **Ultra**: High-resolution shadow maps, 4,000 stars, atmospheric bloom, and multi-sample anti-aliasing.

---

## 👥 MULTIPLAYER & TEAM CONSOLE ARCHITECTURE

Plan a multi-participant session with 4 distinct roles:
1. **Mission Commander**: Mission rules, trajectory burns, and critical abort/decision authority.
2. **Spacecraft Engineer**: Cleanroom assembly, mass balance, power budget, and thermal control.
3. **Science Officer**: Cameras, optical filters, spectrometers, and core sampling.
4. **Operations & Comms Officer**: Ground station links, antenna pointing, and data downlink.

---

## 🧪 TESTING & VERIFICATION

Run automated TypeScript linting and build validation:
```bash
npm run build
```
Verify that all 2,000+ modules bundle with zero compile errors and generate valid production assets in `dist/`.

---

## 📜 LICENSE

This project is licensed under the MIT License. Open source for educational and exploration purposes.
