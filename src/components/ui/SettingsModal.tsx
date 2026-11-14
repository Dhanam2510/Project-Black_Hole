import React from 'react';
import {
  Settings as SettingsIcon,
  ArrowLeft,
  Monitor,
  Volume2,
  VolumeX,
  RotateCcw,
  Check,
  Trash2,
} from 'lucide-react';
import { GameSettings, GraphicsPreset } from '../../types/game';
import { clearAllGameData } from '../../utils/storage';
import { sound } from '../../utils/audio';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onBack: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onBack,
}) => {
  const handlePresetChange = (preset: GraphicsPreset) => {
    sound.playClick();
    onUpdateSettings({ ...settings, graphicsPreset: preset });
  };

  const handleVolumeChange = (vol: number) => {
    sound.setVolume(vol);
    onUpdateSettings({ ...settings, masterVolume: vol });
  };

  const handleToggleSound = () => {
    const next = !settings.soundEnabled;
    sound.setMute(!next);
    sound.playClick();
    onUpdateSettings({ ...settings, soundEnabled: next });
  };

  const handleClearData = () => {
    if (window.confirm('Reset all saved mission progress, custom satellites, and logs?')) {
      sound.playClick();
      clearAllGameData();
      alert('Local storage data cleared.');
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
            SYSTEM & SIMULATION SETTINGS
          </h2>
          <p className="text-[10px] text-slate-400 font-mono">HARDWARE & VISUAL CONFIGURATION</p>
        </div>

        <div className="text-xs font-mono text-cyan-400">
          STATUS: READY
        </div>
      </div>

      {/* Main Settings Panel */}
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full space-y-6">
        {/* 1. 3D Graphics Settings */}
        <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-cyan-400 border-b border-slate-800 pb-2">
            <Monitor className="w-4 h-4" />
            <span>3D GRAPHICS PRESETS & RENDERING ENGINE</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(['performance', 'high', 'ultra'] as GraphicsPreset[]).map((preset) => {
              const isSelected = settings.graphicsPreset === preset;
              return (
                <button
                  key={preset}
                  onClick={() => handlePresetChange(preset)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-cyan-glow'
                      : 'border-slate-800 bg-space-950/60 text-slate-400 hover:text-white hover:bg-space-850'
                  }`}
                >
                  <span className="font-bold text-xs uppercase font-mono">{preset}</span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {preset === 'performance'
                      ? 'Low Shadows, 60fps'
                      : preset === 'high'
                      ? 'Detailed 3D & Stars'
                      : 'Ultra Shaders & MSAA'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Audio & Sound Engine */}
        <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-cyan-400 border-b border-slate-800 pb-2">
            <Volume2 className="w-4 h-4" />
            <span>AUDIO SYNTHESIZER & SOUND EFFECTS</span>
          </div>

          <div className="flex items-center justify-between font-mono text-xs">
            <span>SOUND FX & TELEMETRY BEEPS:</span>
            <button
              onClick={handleToggleSound}
              className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 font-bold transition ${
                settings.soundEnabled
                  ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30'
                  : 'border-slate-800 text-slate-500 bg-space-950'
              }`}
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{settings.soundEnabled ? 'ENABLED' : 'MUTED'}</span>
            </button>
          </div>

          <div className="space-y-1 font-mono text-xs">
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>MASTER SYNTHESIZER VOLUME:</span>
              <span className="text-cyan-300 font-bold">{Math.round(settings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.masterVolume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-space-950 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* 3. Controls & Data Storage */}
        <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-cyan-400 border-b border-slate-800 pb-2">
            <RotateCcw className="w-4 h-4" />
            <span>PERSISTENT LOCAL STORAGE & CONTROLS</span>
          </div>

          <div className="flex items-center justify-between font-mono text-xs">
            <span>INVERT ORBIT CAMERA CONTROLS:</span>
            <button
              onClick={() => {
                sound.playClick();
                onUpdateSettings({ ...settings, controlsInverted: !settings.controlsInverted });
              }}
              className={`px-3 py-1.5 rounded-lg border font-bold transition ${
                settings.controlsInverted
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                  : 'border-slate-800 text-slate-500 bg-space-950'
              }`}
            >
              {settings.controlsInverted ? 'INVERTED' : 'STANDARD'}
            </button>
          </div>

          <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-slate-300">PURGE SAVED FLIGHT DATA</div>
              <div className="text-[10px] text-slate-500 font-mono">
                Clears active mission checkpoints and completed flight scores
              </div>
            </div>
            <button
              onClick={handleClearData}
              className="px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900/60 font-mono text-xs flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>RESET DATA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
