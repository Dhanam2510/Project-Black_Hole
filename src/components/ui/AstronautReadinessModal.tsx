import React, { useState } from 'react';
import {
  User,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { AstronautCrew } from '../../types/game';
import { ASTRONAUT_ROSTER, SUIT_CATALOG, SuitOption } from '../../data/astronauts';
import { sound } from '../../utils/audio';

interface AstronautReadinessModalProps {
  onConfirmReadiness: (assignedCrew: AstronautCrew[]) => void;
  onBack: () => void;
  currentBudget: number;
}

export const AstronautReadinessModal: React.FC<AstronautReadinessModalProps> = ({
  onConfirmReadiness,
  onBack,
  currentBudget,
}) => {
  const [crewList, setCrewList] = useState<AstronautCrew[]>(ASTRONAUT_ROSTER);
  const [selectedCrewId, setSelectedCrewId] = useState<string>(ASTRONAUT_ROSTER[0].id);

  const activeAstro = crewList.find((c) => c.id === selectedCrewId) || crewList[0];

  // Training / Suit upgrade actions
  const handleUpgradeSuit = (suit: SuitOption) => {
    sound.playConfirm();
    setCrewList((prev) =>
      prev.map((c) => {
        if (c.id === selectedCrewId) {
          return {
            ...c,
            suitModel: suit.name as AstronautCrew['suitModel'],
            equipmentReady: suit.evaCertified,
          };
        }
        return c;
      })
    );
  };

  const handleConductTraining = () => {
    sound.playConfirm();
    setCrewList((prev) =>
      prev.map((c) => {
        if (c.id === selectedCrewId) {
          return {
            ...c,
            fitnessCleared: true,
            trainingCompleted: true,
          };
        }
        return c;
      })
    );
  };

  const handleTopUpLifeSupport = () => {
    sound.playConfirm();
    setCrewList((prev) =>
      prev.map((c) => {
        if (c.id === selectedCrewId) {
          return {
            ...c,
            oxygenSupplyHours: 72,
            waterFoodDays: 21,
          };
        }
        return c;
      })
    );
  };

  // Pre-launch Crew Readiness Audit
  const checkFitness = crewList.every((c) => c.fitnessCleared);
  const checkSuits = crewList.every(
    (c) => c.suitModel === 'Apollo-Next Mk IV' || c.suitModel === 'Artemis Heavy EVA'
  );
  const checkOxygen = crewList.every((c) => c.oxygenSupplyHours >= 48);
  const checkSupplies = crewList.every((c) => c.waterFoodDays >= 14);
  const checkTraining = crewList.every((c) => c.trainingCompleted);
  const checkEquipment = crewList.every((c) => c.equipmentReady);

  const allCrewReady =
    checkFitness && checkSuits && checkOxygen && checkSupplies && checkTraining && checkEquipment;

  const handleConfirm = () => {
    if (allCrewReady) {
      sound.playConfirm();
      onConfirmReadiness(crewList);
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
          <span>← BACK TO PREVIOUS STEP</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            ASTRONAUT CORPS READINESS EVALUATION
          </h2>
          <p className="text-[10px] text-slate-400 font-mono">
            EDUCATIONAL SIMULATION READINESS PROTOCOL
          </p>
        </div>

        <div className="text-xs font-mono text-purple-400">
          CREW SLOTS ASSIGNED: {crewList.length} / 4
        </div>
      </div>

      {/* Main Grid: Left Roster + Center Profile & Gear + Right Readiness Checklist */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden p-6 gap-6">
        {/* Left: Astronaut Roster (3 cols) */}
        <div className="col-span-12 md:col-span-3 border border-slate-800 rounded-xl bg-space-900/80 p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-400 mb-3">
              ASSIGNED FLIGHT CREW
            </h3>
            <div className="space-y-2">
              {crewList.map((astro) => {
                const isSelected = astro.id === selectedCrewId;
                const isReady =
                  astro.fitnessCleared &&
                  (astro.suitModel === 'Apollo-Next Mk IV' || astro.suitModel === 'Artemis Heavy EVA') &&
                  astro.trainingCompleted &&
                  astro.oxygenSupplyHours >= 48;

                return (
                  <div
                    key={astro.id}
                    onClick={() => {
                      setSelectedCrewId(astro.id);
                      sound.playClick(900, 0.02);
                    }}
                    className={`cursor-pointer rounded-lg border p-3 flex items-center justify-between transition ${
                      isSelected
                        ? 'border-purple-400 bg-space-850 shadow-cyan-glow'
                        : 'border-slate-800 bg-space-950/60 hover:bg-space-850'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                        style={{ backgroundColor: `${astro.avatarColor}33`, color: astro.avatarColor }}
                      >
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{astro.name}</div>
                        <div className="text-[10px] text-cyan-300 font-mono">{astro.role}</div>
                      </div>
                    </div>
                    {isReady ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-space-950 p-3 rounded-lg border border-slate-800 text-[10px] text-slate-500 font-mono">
            <Info className="w-3.5 h-3.5 text-cyan-400 mb-1" />
            NOTE: All crew readiness criteria are fictional educational gameplay mechanics and do not represent real medical certifications.
          </div>
        </div>

        {/* Center: Selected Astronaut Profile, Suit & Consumables (5 cols) */}
        <div className="col-span-12 md:col-span-5 border border-purple-500/30 rounded-xl bg-space-900/90 p-5 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-5">
            {/* Header bio */}
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: activeAstro.avatarColor }}
              >
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{activeAstro.name}</h3>
                <p className="text-xs text-purple-300 font-mono">{activeAstro.role} // CREW MEMBER</p>
              </div>
            </div>

            {/* Suit Selection */}
            <div>
              <div className="text-xs font-mono text-slate-400 mb-2">EVA PRESSURE SUIT SELECTION:</div>
              <div className="space-y-2">
                {SUIT_CATALOG.map((suit) => {
                  const isCurrent = activeAstro.suitModel === suit.name;
                  return (
                    <div
                      key={suit.id}
                      onClick={() => handleUpgradeSuit(suit)}
                      className={`cursor-pointer p-3 rounded-lg border transition ${
                        isCurrent
                          ? 'border-emerald-400 bg-emerald-950/20'
                          : 'border-slate-800 bg-space-950/60 hover:bg-space-850'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{suit.name}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            suit.evaCertified
                              ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30'
                              : 'text-red-400 bg-red-950/40 border border-red-500/30'
                          }`}
                        >
                          {suit.evaCertified ? 'LUNAR EVA CERTIFIED' : 'CABIN IVA ONLY'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">{suit.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Consumables Management */}
            <div>
              <div className="text-xs font-mono text-slate-400 mb-2">LIFE SUPPORT CONSUMABLES:</div>
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="bg-space-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px]">OXYGEN RESERVE</div>
                  <div
                    className={`font-bold ${
                      activeAstro.oxygenSupplyHours >= 48 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {activeAstro.oxygenSupplyHours} Hours
                  </div>
                  <div className="text-[10px] text-slate-500">Min 48h required</div>
                </div>

                <div className="bg-space-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px]">WATER & RATIONS</div>
                  <div
                    className={`font-bold ${
                      activeAstro.waterFoodDays >= 14 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {activeAstro.waterFoodDays} Days
                  </div>
                  <div className="text-[10px] text-slate-500">Min 14 days required</div>
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleTopUpLifeSupport}
                  className="flex-1 py-1.5 rounded bg-space-800 hover:bg-space-700 text-cyan-300 border border-cyan-500/30 font-mono text-xs transition"
                >
                  TOP UP OXYGEN & RATIONS
                </button>
                <button
                  onClick={handleConductTraining}
                  className="flex-1 py-1.5 rounded bg-space-800 hover:bg-space-700 text-purple-300 border border-purple-500/30 font-mono text-xs transition"
                >
                  COMPLETE FLIGHT TRAINING
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Pre-launch Readiness Checklist Audit (4 cols) */}
        <div className="col-span-12 md:col-span-4 border border-slate-800 rounded-xl bg-space-900/80 p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold font-mono tracking-wider text-white">
                CREW READINESS CRITERIA
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">ALL CRITICAL CHECKS MUST PASS</p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-start gap-2.5">
                {checkFitness ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className={checkFitness ? 'text-white font-bold' : 'text-red-400 font-bold'}>
                    General Fitness Clearance
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {checkFitness ? 'All 4 crew cleared for flight g-forces' : 'Conduct flight training to clear all crew'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                {checkSuits ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className={checkSuits ? 'text-white font-bold' : 'text-red-400 font-bold'}>
                    Suit Compatibility (EVA Certified)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {checkSuits ? 'All crew equipped with Apollo-Next or Artemis suits' : 'Equip all crew with lunar EVA suits'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                {checkOxygen ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className={checkOxygen ? 'text-white font-bold' : 'text-red-400 font-bold'}>
                    Oxygen Supply Margin (≥ 48h)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {checkOxygen ? 'Nominal redundant oxygen tanks filled' : 'Top up oxygen tanks for all crew members'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                {checkSupplies ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className={checkSupplies ? 'text-white font-bold' : 'text-red-400 font-bold'}>
                    Water & Food Supplies (≥ 14 days)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {checkSupplies ? 'Deep space nutrition packs loaded' : 'Rations shortfall detected'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                {checkTraining ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className={checkTraining ? 'text-white font-bold' : 'text-red-400 font-bold'}>
                    Mission Training Completion
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {checkTraining ? 'Lunar surface simulator protocols mastered' : 'Incomplete crew mission training'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleConfirm}
              disabled={!allCrewReady}
              className={`w-full py-3.5 rounded-lg font-bold text-xs tracking-wider font-mono flex items-center justify-center gap-2 transition ${
                allCrewReady
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-slate-950 shadow-cyan-glow hover:opacity-90'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <span>{allCrewReady ? 'APPROVE CREW FOR LAUNCH' : 'RESOLVE MISSING ITEMS TO PROCEED'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
