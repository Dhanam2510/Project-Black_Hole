import { RocketVehicle } from '../types/game';

export const ROCKET_CATALOG: RocketVehicle[] = [
  {
    id: 'rocket-pegasus-1',
    name: 'Pegasus-1 Light Launcher',
    manufacturer: 'AeroSpace Horizons',
    payloadCapacity: 500, // kg to LEO
    cost: 120000,
    maxDeltaV: 4800,
    reliability: 98,
    stages: 2,
    fuelType: 'Solid / Liquid Hydrocarbon',
    description: 'Affordable, rapid-response 2-stage light rocket ideal for small CubeSats and lightweight Earth observation probes.',
  },
  {
    id: 'rocket-falcon-alpha',
    name: 'Falcon-Alpha Medium Lifter',
    manufacturer: 'Orbital Dynamics',
    payloadCapacity: 3800, // kg
    cost: 280000,
    maxDeltaV: 7500,
    reliability: 99.2,
    stages: 2,
    fuelType: 'Densified Methane / LOX',
    description: 'Workhorse medium-lift booster with re-ignitable upper stage, suitable for heavy Earth platforms and Lunar insertion.',
  },
  {
    id: 'rocket-titan-x',
    name: 'Titan-X Heavy Deep Space Booster',
    manufacturer: 'Titan Launch Systems',
    payloadCapacity: 14000, // kg
    cost: 480000,
    maxDeltaV: 11000,
    reliability: 98.7,
    stages: 3,
    fuelType: 'Hydrolox Cryogenic Upper Stage',
    description: 'Triple-core heavy lift vehicle designed for Mars exploration payloads, heavy landers, and high-energy escape orbits.',
  },
  {
    id: 'rocket-nova-super',
    name: 'Nova-Super Heavy Explorer',
    manufacturer: 'Galactic Expedition Works',
    payloadCapacity: 38000, // kg
    cost: 720000,
    maxDeltaV: 14500,
    reliability: 99.5,
    stages: 2,
    fuelType: 'Full-Flow Staged Combustion Methane',
    description: 'Flagship super-heavy launch vehicle capable of propelling massive crewed lunar modules and high-velocity Solar probes directly to their targets.',
  },
];
