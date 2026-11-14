import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Rocket,
  CheckCircle,
  XCircle,
  DollarSign,
  Scale,
  Zap,
  Activity,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  RocketVehicle,
  SpacecraftComponent,
  MissionDefinition,
  AstronautCrew,
} from '../../types/game';
import { ROCKET_CATALOG } from '../../data/rockets';
import { sound } from '../../utils/audio';

interface RocketSelectProps {
  mission: MissionDefinition;
  subMode?: string;
  assembledComponents: Record<string, SpacecraftComponent>;
  astronauts?: AstronautCrew[];
  remainingBudget: number;
  onSelectRocket: (rocket: RocketVehicle) => void;
  onBack: () => void;
}

export const RocketSelect: React.FC<RocketSelectProps> = ({
  mission,
  subMode,
  assembledComponents,
  astronauts,
  remainingBudget,
  onSelectRocket,
  onBack,
}) => {
  const [selectedRocketId, setSelectedRocketId] = useState<string>('rocket-falcon-alpha');

  const selectedRocket =
    ROCKET_CATALOG.find((r) => r.id === selectedRocketId) || ROCKET_CATALOG[1];

  // Spacecraft mass calculation
  const spacecraftMass = useMemo(() => {
    return Object.values(assembledComponents).reduce((sum, c) => sum + c.mass, 0);
  }, [assembledComponents]);

  // AUTOMATED PRE-LAUNCH FLIGHT AUDIT
  const diagnostics = useMemo(() => {
    // 1. Mass vs Rocket Payload Capacity
    const massCheck = spacecraftMass <= selectedRocket.payloadCapacity;
    const massDiff = selectedRocket.payloadCapacity - spacecraftMass;

    // 2. Budget Check
    const budgetCheck = remainingBudget >= selectedRocket.cost;

    // 3. Power System Readiness
    const powerGen = Object.values(assembledComponents).reduce(
      (sum, c) => (c.power > 0 ? sum + c.power : sum),
      0
    );
    const powerDraw = Object.values(assembledComponents).reduce(
      (sum, c) => (c.power < 0 ? sum + Math.abs(c.power) : sum),
      0
    );
    const powerCheck = powerGen > 0 && powerGen >= powerDraw;

    // 4. Communication System
    const commCheck = Boolean(assembledComponents['topDish']);

    // 5. Fuel & Delta-V
    const deltaVCheck = selectedRocket.maxDeltaV >= mission.minDeltaV;

    // 6. Mission-Specific Equipment
    let missionSpecCheck = true;
    let missionSpecMessage = 'Required science instruments confirmed';

    if (mission.id === 'sun') {
      const hasShield = Object.values(assembledComponents).some(
        (c) => c.id === 'thermal-sun-shield-extreme'
      );
      if (!hasShield) {
        missionSpecCheck = false;
        missionSpecMessage = 'Missing mandatory Extreme Solar Heat Shield for Sun Mission';
      }
    }

    // 7. Crew Readiness (if astronaut mode)
    let crewCheck = true;
    let crewMessage = 'No crew required for unmanned mission';
    if (subMode === 'astronaut') {
      if (!astronauts || astronauts.length === 0) {
        crewCheck = false;
        crewMessage = 'No astronauts assigned';
      } else {
        const allFit = astronauts.every(
          (a) =>
            a.fitnessCleared &&
            (a.suitModel === 'Apollo-Next Mk IV' || a.suitModel === 'Artemis Heavy EVA')
        );
        crewCheck = allFit;
        crewMessage = allFit ? 'Flight crew cleared & EVA certified' : 'Astronaut checklist incomplete';
      }
    }

    const allPassed =
      massCheck &&
      budgetCheck &&
      powerCheck &&
      commCheck &&
      deltaVCheck &&
      missionSpecCheck &&
      crewCheck;

    return {
      massCheck,
      massDiff,
      budgetCheck,
      powerCheck,
      commCheck,
      deltaVCheck,
      missionSpecCheck,
      missionSpecMessage,
      crewCheck,
      crewMessage,
      allPassed,
    };
  }, [
    spacecraftMass,
    selectedRocket,
    remainingBudget,
    assembledComponents,
    mission,
    subMode,
    astronauts,
  ]);

  const handleRocketClick = (id: string) => {
    setSelectedRocketId(id);
    sound.playClick(900, 0.03);
  };

  const handleProceed = () => {
    if (diagnostics.allPassed) {
      sound.playConfirm();
      onSelectRocket(selectedRocket);
    } else {
      sound.playError();
    }
  };

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
          <span>BACK TO WORKSHOP</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            LAUNCH VEHICLE SELECTION & PRE-FLIGHT AUDIT
          </h2>
          <p className="text-[10px] text-slate-400 font-mono">
            STAGE 3/5: ROCKET CONTRACT & TELEMETRY VALIDATION
          </p>
        </div>

        <div className="text-xs font-mono text-cyan-400">
          SPACECRAFT MASS: <span className="text-white font-bold">{spacecraftMass} kg</span>
        </div>
      </div>

      {/* Main Grid: Rockets (7 cols) + Diagnostics (5 cols) */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden p-6 gap-6">
        {/* Left: 4 Rocket Cards (7 cols) */}
        <div className="col-span-12 md:col-span-7 flex flex-col justify-between overflow-y-auto pr-2">
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono text-slate-400 tracking-wider mb-2">
              ORBITAL LAUNCH VEHICLE FLEET
            </h3>

            {ROCKET_CATALOG.map((rocket) => {
              const isSelected = rocket.id === selectedRocketId;
              const canLift = spacecraftMass <= rocket.payloadCapacity;
              const canAfford = remainingBudget >= rocket.cost;
              const hasDeltaV = rocket.maxDeltaV >= mission.minDeltaV;

              return (
                <div
                  key={rocket.id}
                  onClick={() => handleRocketClick(rocket.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'border-cyan-400 bg-space-850 shadow-cyan-glow'
                      : 'border-slate-800 bg-space-900/70 hover:bg-space-850'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-space-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                        <Rocket className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{rocket.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">{rocket.manufacturer}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-emerald-400 font-mono font-bold text-sm">
                        ${rocket.cost.toLocaleString()}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        RELIABILITY: {rocket.reliability}%
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-sans mb-3">{rocket.description}</p>

                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono bg-space-950/60 p-2 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-500">CAPACITY: </span>
                      <span className={canLift ? 'text-white font-bold' : 'text-red-400 font-bold'}>
                        {rocket.payloadCapacity} kg
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500">MAX DELTA-V: </span>
                      <span className={hasDeltaV ? 'text-cyan-300 font-bold' : 'text-amber-400 font-bold'}>
                        {rocket.maxDeltaV} m/s
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500">STAGES: </span>
                      <span className="text-purple-300 font-bold">{rocket.stages}-Stage</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Automated Flight Readiness Diagnostics (5 cols) */}
        <div className="col-span-12 md:col-span-5 rounded-xl border border-cyan-500/30 bg-space-900/90 p-5 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  PRE-LAUNCH AUTOMATED DIAGNOSTICS
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    diagnostics.allPassed
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                      : 'bg-red-950/60 text-red-400 border border-red-500/40'
                  }`}
                >
                  {diagnostics.allPassed ? 'GO FOR LAUNCH' : 'NO-GO / HOLD'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                Automated mission rule evaluation
              </p>
            </div>

            {/* Diagnostics List */}
            <div className="space-y-3 font-mono text-xs">
              {/* Check 1: Mass vs Capacity */}
              <div className="flex items-start gap-2.5">
                {diagnostics.massCheck ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className={diagnostics.massCheck ? 'text-white font-bold' : 'text-red-400 font-bold'}>
                    Payload Mass Margin ({diagnostics.massDiff >= 0 ? `+${diagnostics.massDiff}kg` : `${diagnostics.massDiff}kg`})
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Spacecraft ({spacecraftMass} kg) vs Rocket Capacity ({selectedRocket.payloadCapacity} kg)
                  </div>
                </div>
              </div>

              {/* Check 2: Budget Sufficiency */}
              <div className="flex items-start gap-2.5">
                {diagnostics.budgetCheck ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className={diagnostics.budgetCheck ? 'text-white font-bold' : 'text-red-400 font-bold'}>
                    Launch Service Contract Funding
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Remaining: ${remainingBudget.toLocaleString()} vs Launch Cost: ${selectedRocket.cost.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Check 3: Power System */}
              <div className="flex items-start gap-2.5">
                {diagnostics.powerCheck ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className={diagnostics.powerCheck ? 'text-white font-bold' : 'text-red-400 font-bold'}>
                    Power Generation & Solar Array Balance
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Spacecraft has positive net power generation
                  </div>
                </div>
              </div>

              {/* Check 4: Comms */}
              <div className="flex items-start gap-2.5">
                {diagnostics.commCheck ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className={diagnostics.commCheck ? 'text-white font-bold' : 'text-red-400 font-bold'}>
                    Deep Space Network Telemetry Link
                  </div>
                  <div className="text-[10px] text-slate-400">
                    High/Medium Gain Antenna installed & verified
                  </div>
                </div>
              </div>

              {/* Check 5: Delta-V */}
              <div className="flex items-start gap-2.5">
                {diagnostics.deltaVCheck ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className={diagnostics.deltaVCheck ? 'text-white font-bold' : 'text-amber-400 font-bold'}>
                    Trajectory Orbital Delta-V ({selectedRocket.maxDeltaV} m/s)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Target destination requires min {mission.minDeltaV} m/s
                  </div>
                </div>
              </div>

              {/* Check 6: Mission Specific */}
              <div className="flex items-start gap-2.5">
                {diagnostics.missionSpecCheck ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className={diagnostics.missionSpecCheck ? 'text-white font-bold' : 'text-red-400 font-bold'}>
                    Mission Specific Instruments
                  </div>
                  <div className="text-[10px] text-slate-400">{diagnostics.missionSpecMessage}</div>
                </div>
              </div>

              {/* Check 7: Crew (if applicable) */}
              {subMode === 'astronaut' && (
                <div className="flex items-start gap-2.5">
                  {diagnostics.crewCheck ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className={diagnostics.crewCheck ? 'text-white font-bold' : 'text-red-400 font-bold'}>
                      Crew Flight Readiness
                    </div>
                    <div className="text-[10px] text-slate-400">{diagnostics.crewMessage}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action button */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleProceed}
              disabled={!diagnostics.allPassed}
              className={`w-full py-4 rounded-lg font-bold text-xs tracking-wider font-mono flex items-center justify-center gap-2 transition ${
                diagnostics.allPassed
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-cyan-glow hover:opacity-90'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <span>{diagnostics.allPassed ? 'INITIATE LAUNCH COUNTDOWN' : 'ALL DIAGNOSTICS MUST PASS TO LAUNCH'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
