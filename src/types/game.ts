export type ComponentCategory =
  | 'structure'
  | 'power'
  | 'battery'
  | 'comms'
  | 'computer'
  | 'navigation'
  | 'science'
  | 'thermal'
  | 'propulsion'
  | 'fuel';

export type ComponentSlot =
  | 'core'
  | 'leftWing'
  | 'rightWing'
  | 'topDish'
  | 'bottomOptics'
  | 'frontBay'
  | 'rearBay'
  | 'leftSensor'
  | 'rightSensor';

export interface SpacecraftComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  slotType: ComponentSlot[];
  mass: number; // in kg
  cost: number; // in credits
  power: number; // in watts (+ = generation, - = consumption)
  dataGen: number; // MB/s generated when active
  scienceValue: number; // scientific capability points
  compatibility: string[]; // compatible mission targets / bus types
  description: string;
  specs: Record<string, string | number>;
  modelType: string; // procedural 3D model key
  color?: string;
}

export type MissionType = 'earth' | 'moon' | 'mars' | 'sun';
export type MoonMissionMode = 'rover' | 'lander' | 'astronaut';
export type MarsMissionMode = 'orbiter' | 'rover' | 'lander';

export interface MissionDefinition {
  id: MissionType;
  title: string;
  subtitle: string;
  destination: string;
  distanceKm: number;
  commDelaySec: number;
  budgetAllowance: number;
  description: string;
  primaryObjectives: string[];
  secondaryObjectives: string[];
  hazards: string[];
  requiredInstruments: string[];
  minDeltaV: number; // m/s
  iconName: string;
}

export interface RocketVehicle {
  id: string;
  name: string;
  manufacturer: string;
  payloadCapacity: number; // in kg to target orbit
  cost: number; // in credits
  maxDeltaV: number; // in m/s
  reliability: number; // percentage
  stages: number;
  fuelType: string;
  description: string;
}

export interface AstronautCrew {
  id: string;
  name: string;
  role: 'Commander' | 'Lunar Specialist' | 'Geologist' | 'Flight Engineer';
  fitnessCleared: boolean;
  suitModel: 'Apollo-Next Mk IV' | 'Artemis Heavy EVA' | 'Standard Flight Suit' | 'None';
  oxygenSupplyHours: number;
  waterFoodDays: number;
  equipmentReady: boolean;
  trainingCompleted: boolean;
  avatarColor: string;
}

export interface MissionTelemetry {
  altitudeKm: number;
  velocityKmS: number;
  batteryWh: number;
  maxBatteryWh: number;
  solarGenerationW: number;
  powerConsumptionW: number;
  temperatureC: number;
  thermalStatus: 'nominal' | 'warning' | 'critical';
  fuelKg: number;
  maxFuelKg: number;
  dataBufferMB: number;
  dataTransmittedMB: number;
  bandwidthKbps: number;
  signalStrengthDbm: number;
  commDelaySec: number;
  missionElapsedSeconds: number;
  spacecraftHealthPercent: number;
  sciencePointsCollected: number;
}

export interface MissionEvent {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  options: {
    label: string;
    description: string;
    consequence: {
      powerChange?: number;
      tempChange?: number;
      fuelCost?: number;
      dataLoss?: number;
      scienceBonus?: number;
      healthChange?: number;
      logMessage: string;
    };
  }[];
}

export interface CapturedEarthImage {
  id: string;
  timestamp: string;
  target: string;
  filter: 'optical' | 'infrared' | 'multispectral' | 'radar';
  resolution: string;
  cloudCover: number;
  scientificInsight: string;
  dataSizeMB: number;
}

export interface MissionEvaluation {
  id: string;
  missionType: MissionType;
  subMode?: string;
  date: string;
  scoreTotal: number; // 0 - 100
  scoreBreakdown: {
    objectiveAchievement: number; // max 30
    scientificValue: number; // max 25
    resourceEfficiency: number; // max 20
    engineeringDesign: number; // max 15
    operationsAndComms: number; // max 10
  };
  rank: 'S' | 'A' | 'B' | 'C' | 'D';
  achievements: string[];
  failedObjectives: string[];
  engineeringCritique: string[];
  budgetSpent: number;
  initialBudget: number;
  scienceDataTransmittedMB: number;
  missionDurationFormatted: string;
}

export type GraphicsPreset = 'performance' | 'high' | 'ultra';

export interface GameSettings {
  graphicsPreset: GraphicsPreset;
  soundEnabled: boolean;
  musicEnabled: boolean;
  masterVolume: number; // 0 - 1
  sfxVolume: number;
  controlsInverted: boolean;
}

export type GameView =
  | 'main-menu'
  | 'mission-select'
  | 'sub-mission-select'
  | 'assembly-workshop'
  | 'equipment-shop'
  | 'astronaut-prep'
  | 'rocket-select'
  | 'launch-pad'
  | 'space-transit'
  | 'mission-control'
  | 'lunar-surface'
  | 'mars-surface'
  | 'sun-probe'
  | 'mission-evaluation'
  | 'mission-history'
  | 'team-mode'
  | 'how-to-play'
  | 'settings';
