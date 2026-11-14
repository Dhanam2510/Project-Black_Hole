import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Shield,
  Activity,
  Flame,
  CheckCircle,
  ChevronRight,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import {
  RocketVehicle,
  SpacecraftComponent,
  MissionDefinition,
  GameSettings,
} from '../../types/game';
import { LaunchPad3D } from '../3d/LaunchPad3D';
import { sound } from '../../utils/audio';

interface LaunchControlProps {
  mission: MissionDefinition;
  rocket: RocketVehicle;
  assembledComponents: Record<string, SpacecraftComponent>;
  componentRotations: Record<string, number>;
  onLaunchComplete: () => void;
  onAbort: () => void;
  settings: GameSettings;
}

export const LaunchControl: React.FC<LaunchControlProps> = ({
  mission,
  rocket,
  assembledComponents,
  componentRotations,
  onLaunchComplete,
  onAbort,
  settings,
}) => {
  const [countdown, setCountdown] = useState<number>(10);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(true);
  const [launchStage, setLaunchStage] = useState<
    'countdown' | 'ignition' | 'ascent' | 'staging' | 'fairing' | 'separation'
  >('countdown');
  const [progress, setProgress] = useState<number>(0);
  const [altitudeKm, setAltitudeKm] = useState<number>(0);
  const [velocityKmS, setVelocityKmS] = useState<number>(0);

  // Countdown timer loop
  useEffect(() => {
    if (!isCountingDown) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        sound.playCountdownBeep(countdown <= 3);
        setCountdown((prev) => prev - 1);
        if (countdown === 3) {
          setLaunchStage('ignition');
          sound.playRocketIgnition(6.0);
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // T-0: Liftoff!
      setIsCountingDown(false);
      setLaunchStage('ascent');
      sound.playCountdownBeep(true);
    }
  }, [countdown, isCountingDown]);

  // Flight sequence progression (ascent -> staging -> fairing -> separation)
  useEffect(() => {
    if (isCountingDown) return;

    let p = 0;
    const interval = setInterval(() => {
      p += 0.015;
      setProgress(Math.min(1, p));

      if (p < 0.35) {
        setLaunchStage('ascent');
        setAltitudeKm(Math.floor(p * 150));
        setVelocityKmS(Number((p * 4.5).toFixed(2)));
      } else if (p < 0.65) {
        if (launchStage !== 'staging') sound.playTelemetryChirp();
        setLaunchStage('staging');
        setAltitudeKm(Math.floor(p * 220));
        setVelocityKmS(Number((p * 7.2).toFixed(2)));
      } else if (p < 0.88) {
        if (launchStage !== 'fairing') sound.playConfirm();
        setLaunchStage('fairing');
        setAltitudeKm(Math.floor(p * 350));
        setVelocityKmS(Number((p * 8.5).toFixed(2)));
      } else {
        if (launchStage !== 'separation') sound.playConfirm();
        setLaunchStage('separation');
        setAltitudeKm(Math.floor(mission.distanceKm > 1000 ? 520 : mission.distanceKm));
        setVelocityKmS(7.85); // orbital velocity
      }

      if (p >= 1.0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isCountingDown, mission.distanceKm]);

  return (
    <div className="w-screen h-screen bg-space-950 font-display flex flex-col select-none overflow-hidden text-slate-100">
      {/* 3D Scene Viewport */}
      <div className="absolute inset-0 z-0">
        <LaunchPad3D
          rocket={rocket}
          components={assembledComponents}
          rotations={componentRotations}
          launchStage={launchStage}
          progress={progress}
          graphicsPreset={settings.graphicsPreset}
        />
      </div>

      {/* Top Header Mission Control Status Bar */}
      <div className="relative z-10 h-16 border-b border-cyan-500/20 bg-space-950/80 backdrop-blur px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Rocket className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-widest text-white">
              LAUNCH CONTROL CENTER // PAD 39-A
            </h2>
            <p className="text-[10px] text-cyan-400 font-mono">
              VEHICLE: {rocket.name.toUpperCase()} // MISSION: {mission.title}
            </p>
          </div>
        </div>

        {/* Real-time Telemetry readouts */}
        <div className="flex items-center gap-6 font-mono text-xs">
          <div className="bg-space-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-500">ALTITUDE: </span>
            <span className="text-white font-bold">{altitudeKm} km</span>
          </div>

          <div className="bg-space-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-500">VELOCITY: </span>
            <span className="text-cyan-300 font-bold">{velocityKmS} km/s</span>
          </div>

          <div className="bg-space-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-500">FLIGHT STATUS: </span>
            <span className="text-emerald-400 font-bold uppercase">{launchStage}</span>
          </div>
        </div>
      </div>

      {/* Main HUD Overlay */}
      <div className="relative z-10 flex-1 flex flex-col justify-between p-6 pointer-events-none">
        {/* Top Center: Countdown Clock or Stage Tracker */}
        <div className="self-center flex flex-col items-center">
          {isCountingDown ? (
            <div className="bg-space-950/90 border border-cyan-500/50 rounded-2xl px-8 py-4 shadow-cyan-glow flex flex-col items-center">
              <span className="text-xs font-mono text-cyan-400 tracking-widest mb-1">
                T-MINUS COUNTDOWN
              </span>
              <div className="text-6xl font-black font-mono text-white tracking-widest">
                T-00:{countdown.toString().padStart(2, '0')}
              </div>
              <span className="text-[11px] font-mono text-emerald-400 mt-1 animate-pulse">
                {countdown <= 3 ? 'MAIN ENGINE IGNITION SEQUENCE' : 'ALL INTERNAL SYSTEMS AUTONOMOUS'}
              </span>
            </div>
          ) : (
            <div className="bg-space-950/80 backdrop-blur border border-slate-800 rounded-xl px-6 py-2.5 flex items-center gap-4 font-mono text-xs">
              <div
                className={`flex items-center gap-1.5 ${
                  launchStage === 'ascent' ? 'text-amber-400 font-bold' : 'text-slate-500'
                }`}
              >
                <span>STAGE 1 BOOST</span>
              </div>
              <span className="text-slate-700">▸</span>
              <div
                className={`flex items-center gap-1.5 ${
                  launchStage === 'staging' ? 'text-amber-400 font-bold' : 'text-slate-500'
                }`}
              >
                <span>STAGE SEPARATION</span>
              </div>
              <span className="text-slate-700">▸</span>
              <div
                className={`flex items-center gap-1.5 ${
                  launchStage === 'fairing' ? 'text-cyan-400 font-bold' : 'text-slate-500'
                }`}
              >
                <span>FAIRING JETTISON</span>
              </div>
              <span className="text-slate-700">▸</span>
              <div
                className={`flex items-center gap-1.5 ${
                  launchStage === 'separation' ? 'text-emerald-400 font-bold' : 'text-slate-500'
                }`}
              >
                <span>PAYLOAD DEPLOYED</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions & Mission Log Feed */}
        <div className="flex items-end justify-between pointer-events-auto">
          {/* Mission Event Subtitle Feed */}
          <div className="max-w-md bg-space-900/80 backdrop-blur border border-slate-800 p-3 rounded-xl font-mono text-xs space-y-1">
            <div className="text-[10px] text-cyan-400">MISSION LOG CHRONOLOGY:</div>
            <div className="text-slate-300">
              {isCountingDown
                ? `T-${countdown}s: Telemetry verified by Range Safety. Final pressurization confirmed.`
                : launchStage === 'ascent'
                ? 'T+12s: Maximum aerodynamic pressure (Max-Q) passed. Pitch and roll nominal.'
                : launchStage === 'staging'
                ? 'T+85s: MECO 1 confirmed. Stage 1 separation clean; vacuum engine ignited.'
                : launchStage === 'fairing'
                ? 'T+140s: Payload fairings jettisoned. Spacecraft instruments exposed to vacuum.'
                : 'T+240s: Orbital insertion burn complete. Spacecraft deployment confirmed nominal!'}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {isCountingDown && (
              <button
                onClick={() => {
                  sound.playClick();
                  onAbort();
                }}
                className="px-4 py-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900 font-mono text-xs transition"
              >
                ABORT COUNTDOWN
              </button>
            )}

            {launchStage === 'separation' && (
              <button
                onClick={() => {
                  sound.playConfirm();
                  onLaunchComplete();
                }}
                className="flex items-center gap-2 px-6 py-3.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm tracking-wider font-mono hover:from-cyan-400 hover:to-blue-500 shadow-cyan-glow transition transform hover:scale-[1.02]"
              >
                <span>PROCEED TO ORBIT & SPACE TRAVEL</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
