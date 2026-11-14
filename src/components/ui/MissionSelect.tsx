import React, { useState } from 'react';
import {
  Globe,
  Moon,
  Flame,
  Sun,
  ChevronRight,
  ArrowLeft,
  DollarSign,
  Clock,
  Radio,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { MISSIONS } from '../../data/missions';
import { MissionDefinition, MissionType } from '../../types/game';
import { sound } from '../../utils/audio';

interface MissionSelectProps {
  onSelectMission: (mission: MissionDefinition) => void;
  onBack: () => void;
}

export const MissionSelect: React.FC<MissionSelectProps> = ({ onSelectMission, onBack }) => {
  const [selectedId, setSelectedId] = useState<MissionType>('earth');

  const selectedMission = MISSIONS.find((m) => m.id === selectedId) || MISSIONS[0];

  const getMissionIcon = (id: MissionType) => {
    switch (id) {
      case 'earth':
        return <Globe className="w-6 h-6 text-emerald-400" />;
      case 'moon':
        return <Moon className="w-6 h-6 text-slate-200" />;
      case 'mars':
        return <Flame className="w-6 h-6 text-orange-400" />;
      case 'sun':
        return <Sun className="w-6 h-6 text-amber-400 animate-spin-slow" />;
    }
  };

  const handleSelect = (id: MissionType) => {
    setSelectedId(id);
    sound.playClick(900, 0.05);
  };

  const handleConfirm = () => {
    sound.playConfirm();
    onSelectMission(selectedMission);
  };

  return (
    <div className="w-screen h-screen bg-space-950 font-display flex flex-col select-none overflow-hidden text-slate-100">
      {/* Top Navigation Bar */}
      <div className="h-16 border-b border-cyan-500/20 bg-space-900/80 backdrop-blur px-6 flex items-center justify-between shrink-0">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO MAIN MENU</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            STRATEGIC MISSION TARGETING
          </h2>
          <p className="text-[10px] text-slate-400 font-mono">SELECT PRIMARY EXPEDITION THEATER</p>
        </div>

        <div className="text-xs font-mono text-cyan-400/80">
          MISSIONS AVAILABLE: 4
        </div>
      </div>

      {/* Main Grid: Left List + Right Detailed Briefing */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 p-6 overflow-hidden">
        {/* Left Column: 4 Mission Cards (5 cols) */}
        <div className="md:col-span-5 flex flex-col gap-3 overflow-y-auto pr-2">
          {MISSIONS.map((mission) => {
            const isSelected = mission.id === selectedId;
            return (
              <div
                key={mission.id}
                onClick={() => handleSelect(mission.id)}
                className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 flex flex-col gap-2 ${
                  isSelected
                    ? 'border-cyan-400 bg-space-850/90 shadow-cyan-glow'
                    : 'border-slate-800 bg-space-900/60 hover:bg-space-850 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-space-800 border border-slate-700 flex items-center justify-center">
                      {getMissionIcon(mission.id)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm tracking-wide text-white">{mission.title}</h3>
                      <p className="text-xs text-cyan-300 font-mono">{mission.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 transition-transform ${
                      isSelected ? 'text-cyan-400 translate-x-1' : 'text-slate-600'
                    }`}
                  />
                </div>

                {/* Quick stats pills */}
                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono mt-1 pt-2 border-t border-slate-800/80">
                  <div className="text-slate-400">
                    BUDGET: <span className="text-emerald-400">${(mission.budgetAllowance / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="text-slate-400">
                    DELAY: <span className="text-cyan-300">{mission.commDelaySec}s</span>
                  </div>
                  <div className="text-slate-400">
                    DELTA-V: <span className="text-amber-400">{mission.minDeltaV}m/s</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Briefing & Operational Blueprint (7 cols) */}
        <div className="md:col-span-7 rounded-xl border border-cyan-500/30 bg-space-900/80 backdrop-blur p-6 flex flex-col justify-between overflow-y-auto">
          <div className="flex flex-col gap-5">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
                <span>DESTINATION:</span>
                <span className="text-white bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800">
                  {selectedMission.destination}
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-wide text-white mb-2">
                {selectedMission.title}
              </h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
                {selectedMission.description}
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-space-950/60 p-3 rounded-lg border border-slate-800 font-mono text-xs">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-[10px] text-slate-500">MISSION BUDGET</div>
                  <div className="text-emerald-300 font-bold">${selectedMission.budgetAllowance.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-[10px] text-slate-500">DISTANCE</div>
                  <div className="text-slate-200 font-bold">{selectedMission.distanceKm.toLocaleString()} km</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-[10px] text-slate-500">COMM LATENCY</div>
                  <div className="text-amber-300 font-bold">{selectedMission.commDelaySec} sec</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="text-[10px] text-slate-500">REQUIRED DELTA-V</div>
                  <div className="text-purple-300 font-bold">{selectedMission.minDeltaV} m/s</div>
                </div>
              </div>
            </div>

            {/* Objectives */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5 mb-2">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                  PRIMARY OBJECTIVES
                </h4>
                <ul className="text-xs text-slate-300 space-y-1.5 font-sans">
                  {selectedMission.primaryObjectives.slice(0, 4).map((obj, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-mono">▸</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  ENVIRONMENTAL HAZARDS
                </h4>
                <ul className="text-xs text-slate-300 space-y-1.5 font-sans">
                  {selectedMission.hazards.slice(0, 3).map((haz, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-mono">⚠</span>
                      <span>{haz}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Confirmation Action */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              STAGE 1/5: MISSION DESTINATION SELECTED
            </span>
            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm tracking-wider hover:from-cyan-400 hover:to-blue-500 shadow-cyan-glow transition transform hover:scale-[1.02]"
            >
              <span>ACCEPT & PROCEED TO BLUEPRINT</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
