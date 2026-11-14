import React from 'react';
import {
  Rocket,
  Play,
  History,
  BookOpen,
  Settings as SettingsIcon,
  Users,
  Compass,
  Radio,
  Shield,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { MainScene3D } from '../3d/MainScene3D';
import { sound } from '../../utils/audio';
import { GameSettings } from '../../types/game';

interface MainMenuProps {
  onStartNewMission: () => void;
  onContinueMission: () => void;
  canContinue: boolean;
  onOpenHistory: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onOpenTeamMode: () => void;
  settings: GameSettings;
  onToggleSound: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartNewMission,
  onContinueMission,
  canContinue,
  onOpenHistory,
  onOpenHowToPlay,
  onOpenSettings,
  onOpenTeamMode,
  settings,
  onToggleSound,
}) => {
  const handleButtonClick = (action: () => void) => {
    sound.playClick();
    action();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-space-950 font-display select-none">
      {/* 3D Cinematic Background: Earth, Spacecraft & Stars */}
      <MainScene3D graphicsPreset={settings.graphicsPreset} />

      {/* High-Tech HUD Scanlines & Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-space-950/90 via-space-950/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-40" />

      {/* Top Header Mission Control Status Bar */}
      <div className="absolute top-0 left-0 right-0 h-16 border-b border-cyan-500/20 bg-space-950/70 backdrop-blur-md px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded border border-cyan-400/40 bg-cyan-950/40 flex items-center justify-center text-cyan-400 shadow-cyan-glow">
            <Rocket className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">
              SPACE COMMAND
            </h1>
            <p className="text-[10px] text-cyan-400/70 font-mono tracking-wider">
              MISSION DESIGN & SIMULATION AGENCY // V2.4 ONLINE
            </p>
          </div>
        </div>

        {/* Live Agency Telemetry Indicators */}
        <div className="hidden md:flex items-center gap-6 font-mono text-xs">
          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/30 px-3 py-1 rounded border border-emerald-500/30">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>GROUND NETWORK: ONLINE</span>
          </div>
          <div className="flex items-center gap-2 text-cyan-300 bg-cyan-950/30 px-3 py-1 rounded border border-cyan-500/30">
            <Shield className="w-3.5 h-3.5" />
            <span>SIM ENGINE: ACTIVE (PRESET: {settings.graphicsPreset.toUpperCase()})</span>
          </div>
          <button
            onClick={() => {
              onToggleSound();
              sound.playClick();
            }}
            className="p-1.5 rounded border border-slate-700 bg-space-850 hover:bg-space-700 text-slate-300 transition"
            title={settings.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full h-full flex items-center px-8 md:px-16 pt-16">
        <div className="max-w-xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-mono text-xs mb-4">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>DEEP SPACE FLIGHT SYSTEMS INITIATIVE</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-3">
            ARCHITECT THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
              NEXT HORIZON
            </span>
          </h2>

          <p className="text-sm md:text-base text-slate-300 mb-8 font-sans leading-relaxed">
            Design, assemble, budget, and operate actual 3D space exploration missions.
            From Earth multi-spectral monitoring and Lunar rover expeditions to Mars sample drills and close-approach Solar probes.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col gap-3 max-w-md">
            {/* 1. START NEW MISSION */}
            <button
              onClick={() => handleButtonClick(onStartNewMission)}
              className="group relative flex items-center justify-between px-6 py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-base tracking-wider hover:from-cyan-400 hover:to-blue-500 shadow-cyan-glow transition-all duration-200 transform hover:translate-x-1"
            >
              <div className="flex items-center gap-3">
                <Play className="w-5 h-5 fill-slate-950" />
                <span>START NEW MISSION</span>
              </div>
              <span className="text-xs font-mono bg-slate-950/20 px-2 py-0.5 rounded text-slate-900 group-hover:bg-slate-950/30">
                INITIATE
              </span>
            </button>

            {/* 2. CONTINUE MISSION */}
            <button
              onClick={() => handleButtonClick(onContinueMission)}
              disabled={!canContinue}
              className={`flex items-center justify-between px-6 py-3.5 rounded-lg border font-semibold text-sm tracking-wide transition-all ${
                canContinue
                  ? 'border-cyan-500/40 bg-space-900/80 hover:bg-space-800 text-cyan-300 hover:border-cyan-400'
                  : 'border-slate-800 bg-space-950/40 text-slate-600 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <Radio className={`w-4 h-4 ${canContinue ? 'text-cyan-400 animate-pulse' : 'text-slate-700'}`} />
                <span>CONTINUE SAVED MISSION</span>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {canContinue ? 'ACTIVE' : 'NO SAVE'}
              </span>
            </button>

            {/* Secondary Buttons Row */}
            <div className="grid grid-cols-2 gap-3 mt-1">
              {/* 3. MISSION HISTORY */}
              <button
                onClick={() => handleButtonClick(onOpenHistory)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-slate-700/60 bg-space-900/60 hover:bg-space-800 text-slate-200 text-xs font-medium tracking-wide hover:border-cyan-500/40 transition"
              >
                <History className="w-4 h-4 text-cyan-400" />
                <span>MISSION HISTORY</span>
              </button>

              {/* 4. HOW TO PLAY */}
              <button
                onClick={() => handleButtonClick(onOpenHowToPlay)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-slate-700/60 bg-space-900/60 hover:bg-space-800 text-slate-200 text-xs font-medium tracking-wide hover:border-cyan-500/40 transition"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>HOW TO PLAY</span>
              </button>
            </div>

            {/* Tertiary Row: Team Mode & Settings */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleButtonClick(onOpenTeamMode)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-purple-500/30 bg-purple-950/20 hover:bg-purple-900/30 text-purple-300 text-xs font-medium tracking-wide hover:border-purple-400 transition"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>TEAM ROLES (4P)</span>
              </button>

              <button
                onClick={() => handleButtonClick(onOpenSettings)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700/60 bg-space-900/60 hover:bg-space-800 text-slate-300 text-xs font-medium tracking-wide hover:border-slate-500 transition"
              >
                <SettingsIcon className="w-4 h-4 text-slate-400" />
                <span>SETTINGS</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="absolute bottom-4 left-8 right-8 flex items-center justify-between text-[11px] font-mono text-slate-500 z-10 border-t border-slate-800/60 pt-3">
        <span>SPACE COMMAND SIMULATOR // EDUCATIONAL SPACE FLIGHT INITIATIVE</span>
        <span>INSPIRED BY REAL AEROSPACE ENGINEERING CONCEPTS</span>
      </div>
    </div>
  );
};
