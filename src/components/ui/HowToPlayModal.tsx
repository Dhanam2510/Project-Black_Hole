import React, { useState } from 'react';
import {
  BookOpen,
  ArrowLeft,
  Zap,
  Scale,
  Thermometer,
  Radio,
  Rocket,
  Compass,
  CheckCircle,
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface HowToPlayModalProps {
  onBack: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'basics' | 'assembly' | 'power' | 'thermal' | 'orbital'>('basics');

  const tabs = [
    { id: 'basics', label: '1. MISSION ARCHITECTURE' },
    { id: 'assembly', label: '2. 3D ASSEMBLY' },
    { id: 'power', label: '3. POWER & BATTERIES' },
    { id: 'thermal', label: '4. THERMAL & HAZARDS' },
    { id: 'orbital', label: '5. ORBITS & SCIENCE' },
  ];

  return (
    <div className="w-screen h-screen bg-space-950 font-display flex flex-col select-none overflow-hidden text-slate-100">
      {/* Top Header */}
      <div className="h-16 border-b border-cyan-500/20 bg-space-900/80 backdrop-blur px-6 flex items-center justify-between shrink-0">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO MENU</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            AEROSPACE ENGINEERING FLIGHT MANUAL
          </h2>
          <p className="text-[10px] text-slate-400 font-mono">EDUCATIONAL MISSION DESIGN GUIDE</p>
        </div>

        <div className="text-xs font-mono text-cyan-400">
          DOC REF: NASA-SIM-2026
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-6 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-3 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as typeof activeTab);
                sound.playClick(900, 0.02);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-mono tracking-wider transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-cyan-glow'
                  : 'bg-space-900 text-slate-400 hover:text-white hover:bg-space-850'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6 text-sm font-sans text-slate-300 leading-relaxed">
          {activeTab === 'basics' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-display text-white">
                The Space Mission Engineering Cycle
              </h3>
              <p>
                In <strong>Space Command</strong>, every space mission follows the authentic lifecycle of real-world spacecraft engineering:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 font-mono text-xs">
                <div className="bg-space-900 p-4 rounded-xl border border-slate-800">
                  <div className="text-cyan-400 font-bold mb-1">STAGE 1: DESTINATION SELECTION</div>
                  <p className="text-slate-400 font-sans">
                    Choose from Earth Observation, Moon Exploration, Mars Exploration, or close-approach Sun Investigation. Each destination defines your target orbit, distance, communications delay, and required delta-V.
                  </p>
                </div>
                <div className="bg-space-900 p-4 rounded-xl border border-slate-800">
                  <div className="text-emerald-400 font-bold mb-1">STAGE 2: BUDGET & PROCUREMENT</div>
                  <p className="text-slate-400 font-sans">
                    Manage your agency grant. Purchase spacecraft buses, solar wings, high-density batteries, radios, spectrometers, or rocket launch services without exceeding available funds.
                  </p>
                </div>
                <div className="bg-space-900 p-4 rounded-xl border border-slate-800">
                  <div className="text-amber-400 font-bold mb-1">STAGE 3: 3D SPACECRAFT ASSEMBLY</div>
                  <p className="text-slate-400 font-sans">
                    Manually attach modules to the central spacecraft chassis in the 3D cleanroom. Rotate components, balance electrical power generation against avionics consumption, and verify mass limits.
                  </p>
                </div>
                <div className="bg-space-900 p-4 rounded-xl border border-slate-800">
                  <div className="text-purple-400 font-bold mb-1">STAGE 4: LAUNCH & MISSION CONTROL</div>
                  <p className="text-slate-400 font-sans">
                    Pass automated pre-flight diagnostics, initiate the countdown, launch through atmospheric staging, execute orbital insertion, operate scientific sensors, and downlink telemetry to Earth.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assembly' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-display text-white">
                Modular 3D Satellite Workshop Mechanics
              </h3>
              <p>
                The 3D Assembly Bay allows full tactile interaction with your satellite:
              </p>
              <ul className="space-y-3 font-mono text-xs text-slate-300">
                <li className="flex items-start gap-2 bg-space-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-cyan-400 font-bold">1. Core Chassis:</span>
                  <span className="font-sans">
                    The structural backbone. You must install a Chassis (e.g. CubeSat 6U, Hexagonal Deep Space Bus, or Heavy Science Platform) before attaching peripheral sensors.
                  </span>
                </li>
                <li className="flex items-start gap-2 bg-space-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-cyan-400 font-bold">2. Attachment Slots:</span>
                  <span className="font-sans">
                    Click any slot in 3D or in the slot toolbar to select it: <code>leftWing</code>, <code>rightWing</code>, <code>topDish</code>, <code>bottomOptics</code>, <code>frontBay</code>, <code>rearBay</code>, <code>leftSensor</code>, <code>rightSensor</code>.
                  </span>
                </li>
                <li className="flex items-start gap-2 bg-space-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-cyan-400 font-bold">3. Component Rotation:</span>
                  <span className="font-sans">
                    Use the <strong>ROTATE</strong> button to align solar panels towards the sun vector or orient antennas for optimal line-of-sight.
                  </span>
                </li>
                <li className="flex items-start gap-2 bg-space-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-cyan-400 font-bold">4. Mass & Rocket Fit:</span>
                  <span className="font-sans">
                    Total mass updates automatically. If your satellite weighs 2,200 kg, you cannot launch on a light rocket rated for only 500 kg! Select an appropriate medium or heavy booster.
                  </span>
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'power' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-display text-white">
                Electrical Power Management & Eclipse Cycles
              </h3>
              <p>
                Spacecraft rely on balanced electrical power. Every computer, camera, transmitter, and sensor consumes wattage.
              </p>
              <div className="bg-space-900 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-xs">
                  <Zap className="w-4 h-4" />
                  <span>THE GOLDEN RULE: POWER SURPLUS &gt; 0</span>
                </div>
                <p className="text-xs">
                  Your solar panels must produce more watts than your instruments consume. For example:
                  <br />
                  <code className="text-cyan-300">Deployable Solar Wings: +450 W</code>
                  <br />
                  <code className="text-amber-400">Avionics + High-Res Camera + Ka-Dish: -195 W</code>
                  <br />
                  <code className="text-emerald-400">Net Power Balance: +255 W Surplus (Nominal)</code>
                </p>
              </div>
              <p>
                <strong>Orbital Eclipses:</strong> When passing through the shadow of Earth or the Moon, solar generation drops to zero. Your installed lithium-ion or solid-state batteries provide continuous power until emerging back into sunlight.
              </p>
            </div>
          )}

          {activeTab === 'thermal' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-display text-white">
                Thermal Control & Environmental Hazards
              </h3>
              <p>
                Space is an extreme thermal environment. Without an atmosphere to conduct heat, surfaces exposed to direct sunlight heat up rapidly, while shadowed areas plunge to cryogenic temperatures.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                <div className="bg-space-900 p-4 rounded-xl border border-slate-800">
                  <div className="text-amber-400 font-bold mb-1">SUN EXPLORATION PROBE</div>
                  <p className="text-slate-400 font-sans">
                    Temperatures at perihelion exceed <strong>1,400°C</strong>. An Extreme Carbon-Composite Heat Shield is mandatory. The probe body must remain strictly aligned behind the shield to prevent catastrophic melt.
                  </p>
                </div>
                <div className="bg-space-900 p-4 rounded-xl border border-slate-800">
                  <div className="text-cyan-400 font-bold mb-1">MARS DUST STORMS</div>
                  <p className="text-slate-400 font-sans">
                    Martian dust storms block up to 75% of sunlight. Spacecraft must enter low-power survival hibernation and activate mechanical solar wipers to preserve battery life.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orbital' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-display text-white">
                Orbital Mechanics, Science Downlink & Scoring
              </h3>
              <p>
                <strong>Delta-V (Δv):</strong> The change in velocity needed to reach your target. Higher energy missions (e.g. Solar perihelion burn: 12,500 m/s) require heavier propulsion stages or super-heavy launch vehicles.
              </p>
              <p>
                <strong>Scientific Telemetry:</strong> Science instruments generate raw data (MB/s). Once buffered, you must downlink this data to ground stations using Ka-band dishes or X-band horns.
              </p>
              <div className="bg-space-900 p-4 rounded-xl border border-slate-800">
                <div className="text-xs font-mono text-purple-400 font-bold mb-1">
                  100-POINT FLIGHT EVALUATION:
                </div>
                <ul className="text-xs font-mono space-y-1 text-slate-300">
                  <li>• Primary Objectives: 30 Points</li>
                  <li>• Scientific Data Collected & Downlinked: 25 Points</li>
                  <li>• Budget Efficiency & Operational Margins: 20 Points</li>
                  <li>• Spacecraft Engineering Design: 15 Points</li>
                  <li>• Operations & Telemetry Readiness: 10 Points</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
