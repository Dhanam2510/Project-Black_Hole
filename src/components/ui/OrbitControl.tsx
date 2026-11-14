import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Compass,
  Radio,
  Clock,
  Activity,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  MissionType,
  MissionDefinition,
  SpacecraftComponent,
  GameSettings,
} from '../../types/game';
import { OrbitSim3D } from '../3d/OrbitSim3D';
import { sound } from '../../utils/audio';

interface OrbitControlProps {
  mission: MissionDefinition;
  subMode?: string;
  components: Record<string, SpacecraftComponent>;
  onEnterDestination: () => void;
  settings: GameSettings;
}

export const OrbitControl: React.FC<OrbitControlProps> = ({
  mission,
  subMode,
  components,
  onEnterDestination,
  settings,
}) => {
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [transitProgress, setTransitProgress] = useState<number>(0.1);
  const [missionTimeSeconds, setMissionTimeSeconds] = useState<number>(3600);

  // Transit progression based on simSpeed
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const step = 0.003 * simSpeed;
      setTransitProgress((prev) => {
        const next = prev + step;
        return next > 1.0 ? 1.0 : next;
      });
      setMissionTimeSeconds((prev) => prev + Math.floor(60 * simSpeed));
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused, simSpeed]);

  const handleSpeedChange = (speed: number) => {
    sound.playClick(850, 0.03);
    setSimSpeed(speed);
    setIsPaused(false);
  };

  const handlePauseToggle = () => {
    sound.playClick();
    setIsPaused((prev) => !prev);
  };

  const handleRestart = () => {
    sound.playClick();
    setTransitProgress(0.05);
    setMissionTimeSeconds(3600);
  };

  const formatMET = (totalSec: number) => {
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `T+${days}d ${hours.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const distanceRemainingKm = Math.floor(
    mission.distanceKm * Math.max(0, 1 - transitProgress)
  );

  const currentVelocityKmS = (
    7.5 +
    (mission.id === 'sun'
      ? transitProgress * 45 // accelerations toward the sun
      : Math.sin(transitProgress * Math.PI) * 3)
  ).toFixed(2);

  const isArrived = transitProgress >= 0.98;

  return (
    <div className="w-screen h-screen bg-space-950 font-display flex flex-col select-none overflow-hidden text-slate-100">
      {/* 3D Orbit Simulator Viewport */}
      <div className="absolute inset-0 z-0">
        <OrbitSim3D
          missionType={mission.id}
          components={components}
          simSpeed={simSpeed}
          isPaused={isPaused}
          transitProgress={transitProgress}
          graphicsPreset={settings.graphicsPreset}
        />
      </div>

      {/* Top Header */}
      <div className="relative z-10 h-16 border-b border-cyan-500/20 bg-space-950/80 backdrop-blur px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-widest text-white">
              INTERPLANETARY FLIGHT TRAJECTORY & ORBIT SIMULATOR
            </h2>
            <p className="text-[10px] text-cyan-400 font-mono">
              TARGET: {mission.destination} // TIME WARP: {isPaused ? 'PAUSED' : `${simSpeed}x`}
            </p>
          </div>
        </div>

        {/* MET & Velocity */}
        <div className="flex items-center gap-6 font-mono text-xs">
          <div className="bg-space-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-500">MISSION TIME: </span>
            <span className="text-cyan-300 font-bold">{formatMET(missionTimeSeconds)}</span>
          </div>

          <div className="bg-space-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-500">HELIOCENTRIC VELOCITY: </span>
            <span className="text-white font-bold">{currentVelocityKmS} km/s</span>
          </div>

          <div className="bg-space-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-500">DISTANCE TO TARGET: </span>
            <span className="text-amber-400 font-bold">
              {distanceRemainingKm.toLocaleString()} km
            </span>
          </div>
        </div>
      </div>

      {/* Main HUD Overlay */}
      <div className="relative z-10 flex-1 flex flex-col justify-between p-6 pointer-events-none">
        {/* Top Center: Trajectory Progress Bar */}
        <div className="self-center w-full max-w-xl bg-space-950/80 backdrop-blur border border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-slate-400">EARTH INJECTION BURN</span>
            <span className="text-cyan-400 font-bold">
              TRANSIT PROGRESS: {(transitProgress * 100).toFixed(1)}%
            </span>
            <span className="text-slate-400">DESTINATION INSERTION</span>
          </div>
          <div className="w-full bg-space-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-200"
              style={{ width: `${transitProgress * 100}%` }}
            />
          </div>
        </div>

        {/* Bottom Time Warp Controls & Arrival Trigger */}
        <div className="flex items-end justify-between pointer-events-auto">
          {/* Time Warp Bar */}
          <div className="bg-space-900/80 backdrop-blur border border-slate-800 p-2.5 rounded-xl flex items-center gap-2 font-mono text-xs">
            <button
              onClick={handlePauseToggle}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 ${
                isPaused
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-space-800 text-slate-300 hover:bg-space-700'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
            </button>

            {[1, 5, 25, 100].map((spd) => {
              const active = !isPaused && simSpeed === spd;
              return (
                <button
                  key={spd}
                  onClick={() => handleSpeedChange(spd)}
                  className={`px-3 py-1.5 rounded transition ${
                    active
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-cyan-glow'
                      : 'bg-space-800 text-slate-400 hover:text-white hover:bg-space-700'
                  }`}
                >
                  {spd}x
                </button>
              );
            })}

            <button
              onClick={handleRestart}
              className="px-2.5 py-1.5 rounded bg-space-800 text-slate-400 hover:text-white transition"
              title="Restart trajectory"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Destination Insertion Button */}
          <div>
            <button
              onClick={() => {
                sound.playConfirm();
                onEnterDestination();
              }}
              className="flex items-center gap-2 px-6 py-3.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm tracking-wider font-mono hover:from-cyan-400 hover:to-blue-500 shadow-cyan-glow transition transform hover:scale-[1.02]"
            >
              <span>
                {isArrived
                  ? 'ENTER DESTINATION & OPEN MISSION CONTROL'
                  : 'FAST FORWARD TO DESTINATION ARRIVAL'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
