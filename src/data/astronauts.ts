import { AstronautCrew } from '../types/game';

export const ASTRONAUT_ROSTER: AstronautCrew[] = [
  {
    id: 'astro-elena-vance',
    name: 'Cmdr. Elena Vance',
    role: 'Commander',
    fitnessCleared: true,
    suitModel: 'Apollo-Next Mk IV',
    oxygenSupplyHours: 48,
    waterFoodDays: 14,
    equipmentReady: true,
    trainingCompleted: true,
    avatarColor: '#3b82f6',
  },
  {
    id: 'astro-marcus-chen',
    name: 'Dr. Marcus Chen',
    role: 'Geologist',
    fitnessCleared: true,
    suitModel: 'Apollo-Next Mk IV',
    oxygenSupplyHours: 48,
    waterFoodDays: 14,
    equipmentReady: true,
    trainingCompleted: true,
    avatarColor: '#10b981',
  },
  {
    id: 'astro-sarah-jenkins',
    name: 'Lt. Sarah Jenkins',
    role: 'Flight Engineer',
    fitnessCleared: false, // Player can clear/train in readiness assessment
    suitModel: 'Standard Flight Suit', // Needs upgrade to EVA suit for Moon walk
    oxygenSupplyHours: 12,
    waterFoodDays: 5,
    equipmentReady: false,
    trainingCompleted: false,
    avatarColor: '#f59e0b',
  },
  {
    id: 'astro-tariq-al-mansoor',
    name: 'Dr. Tariq Al-Mansoor',
    role: 'Lunar Specialist',
    fitnessCleared: true,
    suitModel: 'Artemis Heavy EVA',
    oxygenSupplyHours: 72,
    waterFoodDays: 21,
    equipmentReady: true,
    trainingCompleted: true,
    avatarColor: '#8b5cf6',
  },
];

export interface SuitOption {
  id: string;
  name: string;
  rating: string;
  cost: number;
  mass: number;
  thermalRange: string;
  evaCertified: boolean;
  oxygenCapacityHours: number;
  description: string;
}

export const SUIT_CATALOG: SuitOption[] = [
  {
    id: 'suit-flight-std',
    name: 'Standard Intra-Vehicular Flight Suit',
    rating: 'IVA Pressure Only',
    cost: 15000,
    mass: 12,
    thermalRange: '15°C to 30°C',
    evaCertified: false,
    oxygenCapacityHours: 2,
    description: 'Cabin-only survival suit. NOT certified for spacewalks or lunar surface exploration.',
  },
  {
    id: 'suit-apollo-next',
    name: 'Apollo-Next Mk IV Lunar EVA Suit',
    rating: 'Class-1 Lunar Surface EVA',
    cost: 65000,
    mass: 55,
    thermalRange: '-130°C to +120°C',
    evaCertified: true,
    oxygenCapacityHours: 10,
    description: 'Multi-layer pressurized suit with micrometeorite shielding, liquid cooling garment, and high-mobility joint bearings.',
  },
  {
    id: 'suit-artemis-heavy',
    name: 'Artemis Heavy Exploration Exosuit',
    rating: 'Deep Space Extreme EVA',
    cost: 110000,
    mass: 75,
    thermalRange: '-180°C to +150°C',
    evaCertified: true,
    oxygenCapacityHours: 16,
    description: 'Heavy exploration suit with integrated heads-up display telemetry, enhanced radiation protection, and motorized torque assists.',
  },
];
