import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Compass,
  Zap,
  Thermometer,
  Shield,
  Activity,
  Flag,
  Radio,
  Sparkles,
  Layers,
  CheckCircle,
} from 'lucide-react';
import {
  MissionDefinition,
  SpacecraftComponent,
  GameSettings,
} from '../../types/game';
import { PlanetarySurface3D } from '../3d/PlanetarySurface3D';
import { sound } from '../../utils/audio';

interface SurfaceControlProps {
  mission: MissionDefinition;
  subMode?: string;
  components: Record<string, SpacecraftComponent>;
  onBackToMissionControl: () => void;
  settings: GameSettings;
}

export const SurfaceControl: React.FC<SurfaceControlProps> = ({
  mission,
  subMode = 'rover',
  components,
  onBackToMissionControl,
  settings,
}) => {
  // Rover physics & state
  const [roverState, setRoverState] = useState({
    x: 0,
    z: 0,
    heading: 0,
    speed: 0,
  });
  const [distanceTraveled, setDistanceTraveled] = useState<number>(0);
  const [roverBatteryWh, setRoverBatteryWh] = useState<number>(850);
  const [surfaceTempC, setSurfaceTempC] = useState<number>(
    mission.id === 'moon' ? -85 : -55
  );
  const [samplesCollected, setSamplesCollected] = useState<number>(0);

  // Lander physics & state
  const [landerState, setLanderState] = useState({
    altitude: 12.0,
    descentRate: 1.2,
    throttle: 45,
    fuelPercent: 88,
    landed: false,
  });

  // Astronaut state
  const [astronautState, setAstronautState] = useState({
    x: 0,
    z: 0,
    heading: 0,
    isWalking: false,
    flagPlanted: false,
    alsepDeployed: false,
    suitOxygenHours: 36,
  });

  // Keyboard controls listener (WASD / Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (subMode === 'rover') {
        if (key === 'w' || key === 'arrowup') {
          setRoverState((prev) => {
            const newX = prev.x + Math.sin(prev.heading) * 0.4;
            const newZ = prev.z + Math.cos(prev.heading) * 0.4;
            setDistanceTraveled((d) => d + 0.4);
            setRoverBatteryWh((b) => Math.max(0, b - 0.2));
            return { ...prev, x: newX, z: newZ, speed: 1 };
          });
          sound.playClick(400, 0.02);
        } else if (key === 's' || key === 'arrowdown') {
          setRoverState((prev) => {
            const newX = prev.x - Math.sin(prev.heading) * 0.3;
            const newZ = prev.z - Math.cos(prev.heading) * 0.3;
            return { ...prev, x: newX, z: newZ, speed: -1 };
          });
        } else if (key === 'a' || key === 'arrowleft') {
          setRoverState((prev) => ({ ...prev, heading: prev.heading + 0.1 }));
        } else if (key === 'd' || key === 'arrowright') {
          setRoverState((prev) => ({ ...prev, heading: prev.heading - 0.1 }));
        }
      } else if (subMode === 'astronaut') {
        if (key === 'w' || key === 'arrowup') {
          setAstronautState((prev) => ({
            ...prev,
            x: prev.x + Math.sin(prev.heading) * 0.35,
            z: prev.z + Math.cos(prev.heading) * 0.35,
            isWalking: true,
          }));
        } else if (key === 's' || key === 'arrowdown') {
          setAstronautState((prev) => ({
            ...prev,
            x: prev.x - Math.sin(prev.heading) * 0.25,
            z: prev.z - Math.cos(prev.heading) * 0.25,
            isWalking: true,
          }));
        } else if (key === 'a' || key === 'arrowleft') {
          setAstronautState((prev) => ({ ...prev, heading: prev.heading + 0.1 }));
        } else if (key === 'd' || key === 'arrowright') {
          setAstronautState((prev) => ({ ...prev, heading: prev.heading - 0.1 }));
        }
      }
    };

    const handleKeyUp = () => {
      if (subMode === 'astronaut') {
        setAstronautState((prev) => ({ ...prev, isWalking: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [subMode]);

  // Lander descent physics loop
  useEffect(() => {
    if (subMode !== 'lander' || landerState.landed) return;

    const interval = setInterval(() => {
      setLanderState((prev) => {
        if (prev.altitude <= 0.05) {
          sound.playConfirm();
          return { ...prev, altitude: 0, descentRate: 0, landed: true };
        }
        // Throttle reduces descent rate
        const effectiveThrust = prev.throttle / 50; // 1.0 at 50%
        const gravity = 0.4;
        const newRate = Math.max(0.1, prev.descentRate + (gravity - effectiveThrust) * 0.1);
        const newAlt = Math.max(0, prev.altitude - newRate * 0.15);
        const newFuel = Math.max(0, prev.fuelPercent - 0.15);

        return {
          ...prev,
          altitude: Number(newAlt.toFixed(2)),
          descentRate: Number(newRate.toFixed(2)),
          fuelPercent: Number(newFuel.toFixed(1)),
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [subMode, landerState.landed]);

  // Sample collection action
  const handleCollectSample = () => {
    sound.playTelemetryChirp();
    setSamplesCollected((prev) => prev + 1);
  };

  // Flag planting action
  const handlePlantFlag = () => {
    sound.playConfirm();
    setAstronautState((prev) => ({ ...prev, flagPlanted: true }));
  };

  // ALSEP science deploy action
  const handleDeployAlsep = () => {
    sound.playConfirm();
    setAstronautState((prev) => ({ ...prev, alsepDeployed: true }));
  };

  return (
    <div className="w-screen h-screen bg-space-950 font-display flex flex-col select-none overflow-hidden text-slate-100">
      {/* 3D Surface Viewport */}
      <div className="absolute inset-0 z-0">
        <PlanetarySurface3D
          missionType={mission.id}
          subMode={subMode as 'rover' | 'lander' | 'astronaut'}
          roverState={roverState}
          landerState={landerState}
          astronautState={astronautState}
          graphicsPreset={settings.graphicsPreset}
        />
      </div>

      {/* Top Header */}
      <div className="relative z-10 h-16 border-b border-cyan-500/20 bg-space-950/80 backdrop-blur px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              sound.playClick();
              onBackToMissionControl();
            }}
            className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO MISSION CONTROL</span>
          </button>
          <div className="h-4 w-[1px] bg-slate-700" />
          <div>
            <h2 className="text-sm font-bold tracking-widest text-white uppercase">
              {mission.destination} // SURFACE EXPLORATION [{subMode?.toUpperCase()}]
            </h2>
            <p className="text-[10px] text-cyan-400 font-mono">
              USE WASD / ARROW KEYS TO NAVIGATE AND OPERATE
            </p>
          </div>
        </div>

        {/* Surface Live Stats */}
        <div className="flex items-center gap-6 font-mono text-xs">
          <div className="bg-space-900/80 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">SURFACE TEMP:</span>
            <span className="text-cyan-300 font-bold">{surfaceTempC}°C</span>
          </div>

          {subMode === 'rover' && (
            <>
              <div className="bg-space-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <span className="text-slate-400">TRAVERSE: </span>
                <span className="text-white font-bold">{distanceTraveled.toFixed(1)} m</span>
              </div>
              <div className="bg-space-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <span className="text-slate-400">ROVER BATTERY: </span>
                <span className="text-emerald-400 font-bold">{roverBatteryWh.toFixed(0)} Wh</span>
              </div>
            </>
          )}

          {subMode === 'lander' && (
            <>
              <div className="bg-space-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <span className="text-slate-400">ALTITUDE: </span>
                <span className="text-white font-bold">{landerState.altitude} m</span>
              </div>
              <div className="bg-space-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <span className="text-slate-400">DESCENT RATE: </span>
                <span className="text-cyan-300 font-bold">{landerState.descentRate} m/s</span>
              </div>
            </>
          )}

          {subMode === 'astronaut' && (
            <div className="bg-space-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-slate-400">SUIT OXYGEN: </span>
              <span className="text-emerald-400 font-bold">
                {astronautState.suitOxygenHours} Hours
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Surface Controls HUD Overlay */}
      <div className="relative z-10 flex-1 flex flex-col justify-between p-6 pointer-events-none">
        {/* Top Hint on Controls */}
        <div className="self-center bg-space-950/80 backdrop-blur border border-cyan-500/30 rounded-xl px-5 py-2 font-mono text-xs text-cyan-300 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>CONTROLS: [W/A/S/D] OR ARROW KEYS TO MOVE // CLICK BUTTONS BELOW FOR SCIENCE ACTIONS</span>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-end justify-between pointer-events-auto">
          {/* On-Screen Virtual D-pad / Mobility Buttons for touch/clicks */}
          <div className="bg-space-900/80 backdrop-blur border border-slate-800 p-3 rounded-xl flex items-center gap-2">
            <button
              onClick={() => {
                if (subMode === 'rover') {
                  setRoverState((prev) => ({
                    ...prev,
                    x: prev.x + Math.sin(prev.heading) * 0.5,
                    z: prev.z + Math.cos(prev.heading) * 0.5,
                  }));
                  setDistanceTraveled((d) => d + 0.5);
                } else if (subMode === 'astronaut') {
                  setAstronautState((prev) => ({
                    ...prev,
                    x: prev.x + Math.sin(prev.heading) * 0.4,
                    z: prev.z + Math.cos(prev.heading) * 0.4,
                  }));
                }
                sound.playClick(400, 0.02);
              }}
              className="px-3 py-2 rounded bg-space-800 hover:bg-space-700 text-cyan-300 border border-slate-700 font-mono text-xs font-bold"
            >
              FORWARD [W]
            </button>

            <button
              onClick={() => {
                if (subMode === 'rover') {
                  setRoverState((prev) => ({ ...prev, heading: prev.heading + 0.2 }));
                } else if (subMode === 'astronaut') {
                  setAstronautState((prev) => ({ ...prev, heading: prev.heading + 0.2 }));
                }
                sound.playClick(400, 0.02);
              }}
              className="px-3 py-2 rounded bg-space-800 hover:bg-space-700 text-cyan-300 border border-slate-700 font-mono text-xs font-bold"
            >
              STEER LEFT [A]
            </button>

            <button
              onClick={() => {
                if (subMode === 'rover') {
                  setRoverState((prev) => ({ ...prev, heading: prev.heading - 0.2 }));
                } else if (subMode === 'astronaut') {
                  setAstronautState((prev) => ({ ...prev, heading: prev.heading - 0.2 }));
                }
                sound.playClick(400, 0.02);
              }}
              className="px-3 py-2 rounded bg-space-800 hover:bg-space-700 text-cyan-300 border border-slate-700 font-mono text-xs font-bold"
            >
              STEER RIGHT [D]
            </button>
          </div>

          {/* Interactive Scientific Operations Buttons */}
          <div className="flex items-center gap-3">
            {subMode === 'rover' && (
              <button
                onClick={handleCollectSample}
                className="flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold font-mono text-xs hover:from-cyan-400 hover:to-blue-500 shadow-cyan-glow transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>DRILL REGOLITH CORE SAMPLE ({samplesCollected} EXTRACTED)</span>
              </button>
            )}

            {subMode === 'lander' && !landerState.landed && (
              <div className="flex items-center gap-2 bg-space-900/80 p-2 rounded-xl border border-slate-800">
                <button
                  onClick={() =>
                    setLanderState((prev) => ({ ...prev, throttle: Math.max(0, prev.throttle - 10) }))
                  }
                  className="px-3 py-2 rounded bg-space-800 text-amber-400 font-mono text-xs"
                >
                  THROTTLE -
                </button>
                <span className="font-mono text-xs text-white px-2">
                  THROTTLE: {landerState.throttle}%
                </span>
                <button
                  onClick={() =>
                    setLanderState((prev) => ({ ...prev, throttle: Math.min(100, prev.throttle + 10) }))
                  }
                  className="px-3 py-2 rounded bg-space-800 text-cyan-400 font-mono text-xs"
                >
                  THROTTLE +
                </button>
              </div>
            )}

            {subMode === 'astronaut' && (
              <>
                <button
                  onClick={handlePlantFlag}
                  disabled={astronautState.flagPlanted}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-bold font-mono text-xs transition ${
                    !astronautState.flagPlanted
                      ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-cyan-glow'
                      : 'bg-space-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Flag className="w-4 h-4" />
                  <span>{astronautState.flagPlanted ? 'FLAG PLANTED' : 'PLANT MISSION FLAG'}</span>
                </button>

                <button
                  onClick={handleDeployAlsep}
                  disabled={astronautState.alsepDeployed}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-bold font-mono text-xs transition ${
                    !astronautState.alsepDeployed
                      ? 'bg-purple-500 text-slate-950 hover:bg-purple-400 shadow-cyan-glow'
                      : 'bg-space-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>{astronautState.alsepDeployed ? 'ALSEP ACTIVE' : 'DEPLOY ALSEP STATION'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
