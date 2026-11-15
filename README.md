# COSMIC HORIZONS: Realistic 3D Space Exploration & Science Simulation Game

A fully playable, standalone 3D educational space simulation video game engineered for middle school students (specifically 8th-standard / ages 13–15). 

Built on **Godot Engine 4.3 LTS (Forward+ & Mobile PBR Architecture)**, *Cosmic Horizons* merges vehicle customization mechanics (*Car For Sale Simulator*) with authentic space missions (*Kerbal Space Program*, ISRO, NASA, and ESA).

---

## 🌟 The Four Major Missions

### 🌍 Mission 1: Earth Exploration
- **Level 1 (Cleanroom Satellite Assembly):** 
  - Manage a starting budget ($3,000,000).
  - Inspect, rotate, and zoom around your satellite in a 3D turntable.
  - Install, remove, and upgrade Chassis, Silicon/GaAs Solar Arrays, High-Gain Antennas, Optical Cameras, and Batteries on typed 3D hardpoints.
  - Live diagnostic HUD calculating Mass (kg), Power (W), and Thermal Limits (K).
- **Level 2 (Rocket Selection):** 
  - Compare Light-lift, Medium-lift (*Pegasus-9*), and Heavy-lift rockets.
  - Automatic envelope validation ensuring satellite mass does not exceed rocket payload capacity.
- **Level 3 (Rocket Launch Simulation):**
  - Stand on the realistic launch pad with gantry tower and flame trench.
  - Interactive countdown (`T-5... Liftoff!`).
  - Throttle controls (`W` / `S` or HUD slider).
  - Max-Q dynamic pressure monitoring and supersonic velocity indicators.
  - **Stage Decoupling:** Booster burnout triggers manual stage separation (`SPACEBAR`), jettisoning the booster and igniting Stage 2.
  - **Fairing Jettison:** Passing the Kármán line (100 km) blows away fairing clamshells to reveal the satellite.
  - **Orbital Insertion:** Circularize into a stable 420 km Low Earth Orbit.
- **Level 4 (Satellite Orbital Science):**
  - High-resolution photography of the Amazon rainforest carbon sink.
  - Arctic polar ice shelf thickness altimetry.
  - Category-4 hurricane tracking and barometric mapping.
  - Near-Earth Asteroid radar scanning and trajectory calculation.
  - High-gain Ka-band data downlink to mission control.
- **Level 5 (Mission Results):**
  - Scoring breakdown (Success + Science + Budget Savings + Flight Accuracy).

---

### 🌕 Mission 2: Moon Exploration
Choose between two distinct mission modes:
- **Mode A: Astronaut Surface EVA**
  - **Candidate Selection:** Hire astronauts (*Dr. Elena Vance*, *Commander Marcus Cole*, or *Eng. Ananya Sharma*) based on Health, Science, Technical, Fitness, and Experience stats.
  - **Training Facility:** Complete 4 interactive simulation modules: Spacesuit Life Support, 1/6th Lunar Gravity Bouncing, Regolith Sampling, and Emergency Abort Rehearsal.
  - **Lunar Landing & EVA:** Walk on the lunar surface under low gravity ($1.62\text{ m/s}^2$), scoop ancient regolith dust, examine white plagioclase anorthosite rocks, and deploy passive seismic experiment stations.
- **Mode B: Robotic Rover / Lander**
  - Select and customize a 6-wheeled rocker-bogie rover.
  - Traverse crater slopes without tipping over, recharge batteries using top-mounted solar decks, and transmit surface panoramas back to Earth.

---

### 🔴 Mission 3: Mars Exploration
- **Jezero Crater Robotic Science:**
  - Sky-crane descent and landing onto red iron-oxide Martian terrain.
  - Fire the *SuperCam* laser spectrometer to vaporize rock into glowing plasma and identify silica and magnesium signatures.
  - Drill rock core samples to confirm subsurface water-ice deposits.
  - **Dynamic Martian Dust Storm:** Experience high-wind dust storm conditions that obscure visibility and challenge rover battery conservation!
  - Test MOXIE oxygen generation and evaluate natural lava tubes for future human settlement.

---

### ☀️ Mission 4: Sun Exploration
- **Extreme Solar Observation Probe:**
  - Construct a deep-space probe equipped with Reinforced Carbon-Carbon Heat Shields and an Extreme-UV Coronagraph.
  - Proximity Perihelion Orbit (6.2 million km from the Sun).
  - **Active Thermal Defense:** Keep the heat shield aligned with the solar vector to prevent devastating thermal overload.
  - Photograph solar prominences and sunspots, detect Coronal Mass Ejections (CMEs), and map the solar wind particle flux.

---

## 🎮 Controls Reference

| Action | Key / Control |
| :--- | :--- |
| **Inspect / Orbit Spacecraft** | Left Mouse Drag (Click & Hold) |
| **Zoom In / Out** | Mouse Wheel Up / Down |
| **Throttle Up / Down** | `W` / `S` or HUD Slider |
| **Stage Separation** | `SPACEBAR` or 'Separate Stage' Button |
| **Camera View** | `C` |
| **Perform Science Action** | Left Click on Action Button |

---

## 🚀 How to Run the Game

### Option 1: One-Click Quick Launch (Recommended)
Double-click `launch_game.bat` in this folder.
- If Godot 4.3 is not present, it will automatically download the official portable 64-bit engine into the game directory and launch the game window immediately!

### Option 2: Run via PowerShell
Right-click `launch_game.ps1` and select **Run with PowerShell**, or in terminal:
```powershell
powershell -ExecutionPolicy Bypass -File launch_game.ps1
```

### Option 3: Open in Godot Editor
If you have Godot 4.3 installed, simply open Godot, click **Import**, select `project.godot` from this folder, and press **F5** to run!

---

## 🏆 Scoring & Educational Achievement Badges
- **Satellite Architect:** Build a balanced satellite within budget.
- **Orbital Pioneer:** Execute rocket staging and achieve circular orbit with >90% accuracy.
- **Guardian of Earth:** Complete all climate and asteroid monitoring tasks.
- **One Giant Leap:** Retrieve pristine lunar regolith core samples.
- **Lunar Trailblazer:** Navigate robotic rover across crater basins.
- **Red Planet Pioneer:** Drill Martian bedrock and confirm subsurface ice.
- **Martian Storm Chaser:** Preserve battery systems through a blinding dust storm.
- **Touch the Sun:** Safely operate within extreme solar coronal flux.
- **Fiscal Genius:** Finish a deep-space mission with >20% remaining grant budget.

---

*Designed and Developed with 100% Free & Open Technologies (Godot 4.3 LTS, Blender, Procedural PBR Shaders, NASA Datasets).*
