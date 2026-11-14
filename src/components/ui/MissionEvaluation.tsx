import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Play,
  FileText,
  DollarSign,
  Radio,
  Scale,
  Award,
} from 'lucide-react';
import {
  MissionDefinition,
  MissionEvaluation as MissionEvalType,
  MissionTelemetry,
  CapturedEarthImage,
} from '../../types/game';
import { sound } from '../../utils/audio';

interface MissionEvaluationProps {
  mission: MissionDefinition;
  subMode?: string;
  evaluation: MissionEvalType;
  telemetry: MissionTelemetry;
  capturedImages: CapturedEarthImage[];
  onReplayMission: () => void;
  onNewMission: () => void;
  onViewHistory: () => void;
}

export const MissionEvaluation: React.FC<MissionEvaluationProps> = ({
  mission,
  subMode,
  evaluation,
  telemetry,
  capturedImages,
  onReplayMission,
  onNewMission,
  onViewHistory,
}) => {
  // Fire confetti if Rank S or A
  useEffect(() => {
    if (evaluation.rank === 'S' || evaluation.rank === 'A') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#38bdf8', '#fbbf24', '#ffffff'],
      });
    }
  }, [evaluation.rank]);

  const getRankBadgeColor = (rank: string) => {
    switch (rank) {
      case 'S':
        return 'text-amber-400 border-amber-400 bg-amber-950/40 shadow-amber-glow';
      case 'A':
        return 'text-emerald-400 border-emerald-400 bg-emerald-950/40 shadow-cyan-glow';
      case 'B':
        return 'text-cyan-400 border-cyan-400 bg-cyan-950/40';
      case 'C':
        return 'text-blue-400 border-blue-400 bg-blue-950/40';
      default:
        return 'text-red-400 border-red-400 bg-red-950/40';
    }
  };

  return (
    <div className="w-screen h-screen bg-space-950 font-display flex flex-col select-none overflow-hidden text-slate-100">
      {/* Top Header */}
      <div className="h-16 border-b border-cyan-500/20 bg-space-900/80 backdrop-blur px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-widest text-white">
              MISSION DEBRIEF & FLIGHT EVALUATION REPORT
            </h2>
            <p className="text-[10px] text-cyan-400 font-mono">
              TARGET: {mission.title} {subMode ? `[${subMode.toUpperCase()}]` : ''}
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400">
          REPORT FILED: {evaluation.date}
        </div>
      </div>

      {/* Main Debrief Container */}
      <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full flex flex-col justify-between">
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="bg-space-900/90 border border-cyan-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-cyan-glow">
            <div className="flex items-center gap-6">
              <div
                className={`w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center font-black ${getRankBadgeColor(
                  evaluation.rank
                )}`}
              >
                <span className="text-[10px] font-mono tracking-widest">RANK</span>
                <span className="text-5xl">{evaluation.rank}</span>
              </div>

              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                  OFFICIAL FLIGHT EVALUATION
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-white">
                  TOTAL MISSION SCORE: {evaluation.scoreTotal} / 100
                </h3>
                <p className="text-xs text-slate-300 font-sans mt-1">
                  {evaluation.scoreTotal >= 90
                    ? 'Exemplary execution. Mission design, operational margins, and science return exceeded NASA benchmark standards.'
                    : evaluation.scoreTotal >= 80
                    ? 'Highly successful mission. Met all primary goals with strong data return.'
                    : evaluation.scoreTotal >= 70
                    ? 'Mission accomplished with operational constraints. Satisfied core scientific requirements.'
                    : 'Mission concluded with engineering compromises. Review recommendations below.'}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs w-full md:w-auto">
              <div className="bg-space-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px]">SCIENCE DOWNLINKED</div>
                <div className="text-cyan-300 font-bold text-sm">
                  {evaluation.scienceDataTransmittedMB} MB
                </div>
              </div>

              <div className="bg-space-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px]">BUDGET EFFICIENCY</div>
                <div className="text-emerald-400 font-bold text-sm">
                  ${(evaluation.initialBudget - evaluation.budgetSpent).toLocaleString()} Left
                </div>
              </div>
            </div>
          </div>

          {/* 5-Category Score Breakdown Grid */}
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-400 mb-3 tracking-wider">
              100-POINT SCORING BREAKDOWN
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 font-mono text-xs">
              <div className="bg-space-900 border border-slate-800 p-3 rounded-xl">
                <div className="text-slate-500 text-[10px]">OBJECTIVES (MAX 30)</div>
                <div className="text-xl font-bold text-cyan-300 my-1">
                  {evaluation.scoreBreakdown.objectiveAchievement} / 30
                </div>
                <div className="w-full bg-space-950 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-full"
                    style={{
                      width: `${(evaluation.scoreBreakdown.objectiveAchievement / 30) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="bg-space-900 border border-slate-800 p-3 rounded-xl">
                <div className="text-slate-500 text-[10px]">SCIENCE (MAX 25)</div>
                <div className="text-xl font-bold text-purple-300 my-1">
                  {evaluation.scoreBreakdown.scientificValue} / 25
                </div>
                <div className="w-full bg-space-950 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-400 h-full rounded-full"
                    style={{
                      width: `${(evaluation.scoreBreakdown.scientificValue / 25) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="bg-space-900 border border-slate-800 p-3 rounded-xl">
                <div className="text-slate-500 text-[10px]">RESOURCES (MAX 20)</div>
                <div className="text-xl font-bold text-emerald-300 my-1">
                  {evaluation.scoreBreakdown.resourceEfficiency} / 20
                </div>
                <div className="w-full bg-space-950 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full"
                    style={{
                      width: `${(evaluation.scoreBreakdown.resourceEfficiency / 20) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="bg-space-900 border border-slate-800 p-3 rounded-xl">
                <div className="text-slate-500 text-[10px]">ENGINEERING (MAX 15)</div>
                <div className="text-xl font-bold text-amber-300 my-1">
                  {evaluation.scoreBreakdown.engineeringDesign} / 15
                </div>
                <div className="w-full bg-space-950 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{
                      width: `${(evaluation.scoreBreakdown.engineeringDesign / 15) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="bg-space-900 border border-slate-800 p-3 rounded-xl">
                <div className="text-slate-500 text-[10px]">OPERATIONS (MAX 10)</div>
                <div className="text-xl font-bold text-blue-300 my-1">
                  {evaluation.scoreBreakdown.operationsAndComms} / 10
                </div>
                <div className="w-full bg-space-950 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-400 h-full rounded-full"
                    style={{
                      width: `${(evaluation.scoreBreakdown.operationsAndComms / 10) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Achievements & Engineering Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Achievements */}
            <div className="bg-space-900/80 border border-slate-800 rounded-xl p-5">
              <h4 className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>MISSION ACHIEVEMENTS UNLOCKED</span>
              </h4>
              <ul className="space-y-2 text-xs font-sans text-slate-300">
                {evaluation.achievements.map((ach, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{ach}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="bg-space-900/80 border border-slate-800 rounded-xl p-5">
              <h4 className="text-xs font-mono font-bold text-amber-400 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>ENGINEERING CRITIQUE & RECOMMENDATIONS</span>
              </h4>
              <ul className="space-y-2 text-xs font-sans text-slate-300">
                {evaluation.engineeringCritique.map((crit, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-mono">▸</span>
                    <span>{crit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between mt-6">
          <button
            onClick={() => {
              sound.playClick();
              onViewHistory();
            }}
            className="flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition"
          >
            <FileText className="w-4 h-4" />
            <span>VIEW ALL MISSION LOGBOOK ENTRIES</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onReplayMission();
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-lg bg-space-800 hover:bg-space-700 text-slate-200 border border-slate-700 font-mono text-xs transition"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>REDESIGN & REPLAY</span>
            </button>

            <button
              onClick={() => {
                sound.playConfirm();
                onNewMission();
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold font-mono text-xs hover:from-cyan-400 hover:to-blue-500 shadow-cyan-glow transition transform hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>START NEXT MISSION</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
