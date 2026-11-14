import React from 'react';
import { ArrowLeft, History, Trophy, Award, Clock, DollarSign, Database, Trash2 } from 'lucide-react';
import { MissionEvaluation } from '../../types/game';
import { clearAllGameData } from '../../utils/storage';
import { sound } from '../../utils/audio';

interface MissionHistoryProps {
  history: MissionEvaluation[];
  onBack: () => void;
  onClearHistory: () => void;
}

export const MissionHistory: React.FC<MissionHistoryProps> = ({
  history,
  onBack,
  onClearHistory,
}) => {
  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all past mission flight logs?')) {
      sound.playClick();
      clearAllGameData();
      onClearHistory();
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
          <span>RETURN TO MENU</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            AGENCY FLIGHT ARCHIVES & LOGBOOK
          </h2>
          <p className="text-[10px] text-slate-400 font-mono">CHRONOLOGICAL MISSION RECORDS</p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs font-mono text-red-400 hover:text-red-300 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>PURGE LOGS</span>
          </button>
        )}
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 font-mono text-xs">
            <History className="w-12 h-12 mb-3 opacity-30 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-400 mb-1">NO MISSIONS LOGGED YET</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Complete your first Earth observation satellite or deep space expedition to populate the permanent agency archives.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((record, idx) => (
              <div
                key={record.id || idx}
                className="bg-space-900/80 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-cyan-500/40 transition"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center font-black ${
                      record.rank === 'S'
                        ? 'text-amber-400 border-amber-500/40 bg-amber-950/30'
                        : record.rank === 'A'
                        ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30'
                        : 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30'
                    }`}
                  >
                    <span className="text-[8px] font-mono">RANK</span>
                    <span className="text-2xl">{record.rank}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-cyan-400 uppercase font-bold">
                        {record.missionType.toUpperCase()} MISSION
                      </span>
                      {record.subMode && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-800 text-slate-300">
                          {record.subMode.toUpperCase()}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-500">{record.date}</span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      SCORE: {record.scoreTotal} / 100 POINTS
                    </h3>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      {record.achievements.length} achievements unlocked • {record.scienceDataTransmittedMB} MB data transmitted
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 font-mono text-xs w-full md:w-auto border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                  <div className="text-slate-400">
                    <div className="text-[10px] text-slate-500">OBJECTIVES</div>
                    <div className="text-white font-bold">{record.scoreBreakdown.objectiveAchievement}/30</div>
                  </div>
                  <div className="text-slate-400">
                    <div className="text-[10px] text-slate-500">SCIENCE</div>
                    <div className="text-purple-300 font-bold">{record.scoreBreakdown.scientificValue}/25</div>
                  </div>
                  <div className="text-slate-400">
                    <div className="text-[10px] text-slate-500">RESOURCES</div>
                    <div className="text-emerald-400 font-bold">{record.scoreBreakdown.resourceEfficiency}/20</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
