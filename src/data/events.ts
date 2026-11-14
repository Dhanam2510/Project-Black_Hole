import { MissionEvent, MissionType } from '../types/game';

export const MISSION_EVENTS: Record<MissionType, MissionEvent[]> = {
  earth: [
    {
      id: 'evt-earth-cloud',
      title: 'Dense Cloud Cover Detected',
      description: 'A massive tropical cyclone system is generating 95% cloud cover over the primary Amazon forest observation corridor.',
      severity: 'medium',
      options: [
        {
          label: 'Switch to Microwave & Radar Sounder',
          description: 'Penetrates cloud moisture layer to record soil water and pressure with zero optical degradation.',
          consequence: {
            powerChange: -25,
            scienceBonus: 20,
            logMessage: 'Switched to active microwave radar. Penetrated cyclone cloud deck and mapped cyclonic barometric pressure.',
          },
        },
        {
          label: 'Delay Optical Pass & Conserve Power',
          description: 'Wait 90 minutes for the next orbital track when the cyclone moves offshore.',
          consequence: {
            powerChange: 15,
            dataLoss: 5,
            logMessage: 'Held imaging pass. Batteries charged during orbital sunlight pass.',
          },
        },
      ],
    },
    {
      id: 'evt-earth-debris',
      title: 'Orbital Debris Conjunction Warning',
      description: 'US Space Command alerts that a defunct rocket upper stage fragment has an 8% probability of passing within 350 meters of the spacecraft.',
      severity: 'high',
      options: [
        {
          label: 'Perform Thruster Avoidance Burn (Delta-V: 12 m/s)',
          description: 'Fire hydrazine RCS thrusters to raise perigee by 4 km, guaranteeing safe clearance.',
          consequence: {
            fuelCost: 4.5,
            scienceBonus: 10,
            logMessage: 'Executed 12 m/s prograde avoidance burn. Miss distance increased to 22 km. Spacecraft trajectory verified nominal.',
          },
        },
        {
          label: 'Hold Position & Orient Minimum Cross-Section',
          description: 'Rotate spacecraft edge-on to the orbital plane to minimize impact cross-section without expending fuel.',
          consequence: {
            healthChange: -5,
            logMessage: 'Oriented knife-edge to flight vector. Debris passed at 420m with slight micro-fragment graze on solar panel frame.',
          },
        },
      ],
    },
    {
      id: 'evt-earth-asteroid',
      title: 'Asteroid Detection Alert: NEO-2026 XK',
      description: 'The onboard Infrared Surveyor has detected an anomalous heat signature of a previously uncatalogued 80-meter Near-Earth Asteroid.',
      severity: 'medium',
      options: [
        {
          label: 'Lock Tracking Gimbals & Compute Orbit',
          description: 'Dedicate full optical and computer processing power to calculate preliminary orbital ephemeris.',
          consequence: {
            powerChange: -40,
            scienceBonus: 50,
            logMessage: 'Asteroid NEO-2026 XK orbital solution computed! NASA Planetary Defense Coordination Office notified.',
          },
        },
        {
          label: 'Standard Fast Snapshot & Resume Survey',
          description: 'Capture 3 quick frames and continue regular Earth surface scanning grid.',
          consequence: {
            scienceBonus: 25,
            logMessage: 'Captured 3 astrometric frames of asteroid and queued for ground astronomy network follow-up.',
          },
        },
      ],
    },
  ],

  moon: [
    {
      id: 'evt-moon-dust',
      title: 'Electrostatic Lunar Dust Accumulation',
      description: 'Fine abrasive lunar regolith particles have coated 30% of the solar array surface, diminishing photovoltaic generation.',
      severity: 'medium',
      options: [
        {
          label: 'Trigger Electrostatic Dust-Removal Vibration Cycle',
          description: 'Pulse piezoelectric transducers across the panel frames to shake off clingy regolith.',
          consequence: {
            powerChange: -20,
            scienceBonus: 15,
            logMessage: 'Electrostatic vibration cycle completed. 85% of dust cleared; solar output restored to nominal.',
          },
        },
        {
          label: 'Tilting Array to Shed Dust & Angle Toward Sun',
          description: 'Gimbal panels to steep angle to let gravity assist in sloughing off dust.',
          consequence: {
            powerChange: 10,
            logMessage: 'Panels tilted toward low lunar sun. Generation stabilized at 90%.',
          },
        },
      ],
    },
    {
      id: 'evt-moon-crater',
      title: 'Hazardous Boulder Field on Rover Path',
      description: 'Front stereo navigation hazard cameras identify a steep crater rim strewn with 1.5-meter basalt boulders.',
      severity: 'high',
      options: [
        {
          label: 'Reroute Around Crater Rim (+350m detour)',
          description: 'Take a gentler sloping detour around the crater rim. Consumes battery and takes longer but avoids tip-over.',
          consequence: {
            powerChange: -30,
            scienceBonus: 20,
            logMessage: 'Safe detour executed. Discovered unexpected vesicular basalt outcrop during rim traverse.',
          },
        },
        {
          label: 'Engage Low-Gear Rocker-Bogie Crawl',
          description: 'Rely on the suspension system to crawl directly through the boulder field at 0.1 km/h.',
          consequence: {
            healthChange: -10,
            scienceBonus: 35,
            logMessage: 'Rocker-bogie articulated over 1.2m boulders. Wheel strain recorded, but collected rare impact melt samples!',
          },
        },
      ],
    },
    {
      id: 'evt-moon-shadow',
      title: 'Approaching Lunar Night / Crater Shadow',
      description: 'Sun elevation angle is dropping to 2°. Temperatures in the shadow plummet to -130°C within 15 minutes.',
      severity: 'critical',
      options: [
        {
          label: 'Activate Radioisotope / Battery Survival Heaters',
          description: 'Power on critical heaters to keep avionics, battery electrolyte, and camera mechanisms warm.',
          consequence: {
            powerChange: -60,
            tempChange: 20,
            logMessage: 'Survival heaters running. Core temp maintained at +5°C while external temperature plummets to -128°C.',
          },
        },
        {
          label: 'Seek High-Elevation "Peak of Eternal Light"',
          description: 'Drive rover 120 meters up the crater ridge to catch continuous sunlight.',
          consequence: {
            powerChange: 40,
            scienceBonus: 30,
            logMessage: 'Reached ridge crest! Continuous solar illumination acquired, generating maximum power.',
          },
        },
      ],
    },
  ],

  mars: [
    {
      id: 'evt-mars-duststorm',
      title: 'Regional Martian Dust Storm Warning',
      description: 'Orbital Mars Reconnaissance data confirms a high-altitude atmospheric dust storm spreading over Jezero crater. Atmospheric opacity (Tau) rising from 0.6 to 2.8.',
      severity: 'critical',
      options: [
        {
          label: 'Enter Low-Power Survival Hibernation',
          description: 'Stow robotic arm and mast camera, shutdown scientific spectrometers, and preserve battery life.',
          consequence: {
            powerChange: 30,
            tempChange: -10,
            logMessage: 'Spacecraft entered deep hibernation. Essential subsystems drawing only 45W. Awaiting storm abatement.',
          },
        },
        {
          label: 'Activate Mechanical Panel Wipers & Continue Low-Power Science',
          description: 'Deploy solar brush wipers to keep central cells clear and continue meteorological monitoring.',
          consequence: {
            powerChange: -35,
            scienceBonus: 40,
            logMessage: 'Wipers cleared central solar cell bank! Recorded unprecedented dust storm aerodynamic turbulence data.',
          },
        },
      ],
    },
    {
      id: 'evt-mars-comm-blackout',
      title: 'Mars Solar Conjunction Radio Scintillation',
      description: 'Mars is passing behind the Sun relative to Earth. Solar plasma along the radio line-of-sight introduces heavy packet loss and a 14-minute comm latency.',
      severity: 'high',
      options: [
        {
          label: 'Switch to Autonomous Science & Sequence Mode',
          description: 'Rely on the onboard SPU neural co-processor to execute pre-programmed geological drilling routines.',
          consequence: {
            scienceBonus: 45,
            logMessage: 'Autonomous neural executive took command. Executed 3 autonomous drills and stowed core samples without Earth intervention.',
          },
        },
        {
          label: 'Buffer All Telemetry in Solid-State Memory',
          description: 'Halt real-time downlink and queue all imagery and spectrometer data for downlink once line-of-sight clears.',
          consequence: {
            dataLoss: 0,
            logMessage: 'All scientific observations safely written to non-volatile flash memory array.',
          },
        },
      ],
    },
    {
      id: 'evt-mars-water-rock',
      title: 'Mudstone Sedimentary Rock Formation Discovered',
      description: 'Drill cameras detect layered fine-grained clay minerals consistent with an ancient delta lakebed.',
      severity: 'low',
      options: [
        {
          label: 'Deploy Deep Core Drill & Raman Spectrometer',
          description: 'Extract a 6-centimeter core sample and analyze organic molecular bonds.',
          consequence: {
            powerChange: -45,
            scienceBonus: 60,
            logMessage: 'Extracted pristine clay core! Raman spectroscopy confirmed organic carbon molecules and hydrated silica!',
          },
        },
        {
          label: 'Laser-Induced Breakdown Spectroscopy (LIBS) Zap',
          description: 'Fire infrared laser pulses to vaporize rock surface for quick elemental composition read.',
          consequence: {
            powerChange: -15,
            scienceBonus: 30,
            logMessage: 'Laser plasma flash analyzed by spectrometer. High iron, magnesium, and sulfur content detected.',
          },
        },
      ],
    },
  ],

  sun: [
    {
      id: 'evt-sun-cme',
      title: 'Major Coronal Mass Ejection (CME) Blast Erupting',
      description: 'The solar coronagraph detects a billion-ton plasma bubble erupting from active region AR-3420 directly into the probe trajectory at 1,800 km/s!',
      severity: 'critical',
      options: [
        {
          label: 'Lock Primary Carbon Shield Dead Center to Blast',
          description: 'Orient the 1,400°C carbon-carbon heat shield squarely into the shock front and tuck all solar array tips behind the umbra.',
          consequence: {
            tempChange: 15,
            scienceBonus: 50,
            healthChange: 0,
            logMessage: 'Shield absorbed the full kinetic impact of the CME shock! Plasma sensors recorded historic interplanetary magnetic flux!',
          },
        },
        {
          label: 'Retract Science Booms & Enter Faraday Safe Mode',
          description: 'Ground all electrical sensor booms to chassis to protect sensitive electronics from electrostatic charge-up.',
          consequence: {
            tempChange: 5,
            scienceBonus: 25,
            logMessage: 'Faraday safe mode shielded microprocessors from relativistic protons. Zero single-event upsets recorded.',
          },
        },
      ],
    },
    {
      id: 'evt-sun-thermal-warning',
      title: 'Extreme Thermal Spike: Heat Shield @ 1,380°C',
      description: 'Probe has entered closest perihelion approach (9.8 solar radii). Shield sensor reports 1,380°C with internal avionics creeping to 42°C.',
      severity: 'high',
      options: [
        {
          label: 'Pump Active Ammonia Coolant to Space-Facing Shadow Radiator',
          description: 'Run thermal loop heat pipes at maximum circulation to vent waste heat into cold deep space behind the craft.',
          consequence: {
            powerChange: -30,
            tempChange: -12,
            logMessage: 'Loop heat pipes evacuated 900W of heat. Avionics core temperature dropped back to a comfortable 22°C.',
          },
        },
        {
          label: 'Feather Solar Wings to 85° Sun Incidence Angle',
          description: 'Tilt solar arrays almost edge-on to the blazing Sun to cut absorbed heat while maintaining required avionics wattage.',
          consequence: {
            powerChange: -15,
            tempChange: -8,
            logMessage: 'Arrays feathered edge-on. Solar cell temperature dropped 45°C while still delivering 350W.',
          },
        },
      ],
    },
    {
      id: 'evt-sun-switchback',
      title: 'Magnetic Switchback Phenomenon Encountered',
      description: 'The probe flies through a turbulent "magnetic switchback" where the Sun magnetic field abruptly reverses 180° in seconds.',
      severity: 'medium',
      options: [
        {
          label: 'Run High-Rate Magnetometer & Particle Burst Sampling',
          description: 'Capture 256 samples per second of magnetic vectors and solar wind ionic flux.',
          consequence: {
            powerChange: -20,
            scienceBonus: 45,
            logMessage: 'Breakthrough discovery! First-ever microsecond sampling of coronal magnetic kink acceleration recorded.',
          },
        },
      ],
    },
  ],
};
