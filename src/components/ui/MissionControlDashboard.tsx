import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Radio,
  Zap,
  Activity,
  Thermometer,
  Flame,
  Camera,
  Database,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  Compass,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import {
  MissionDefinition,
  SpacecraftComponent,
  MissionTelemetry,
  CapturedEarthImage,
  MissionEvent,
  GameSettings,
} from '../../types/game';
import { MISSION_EVENTS } from '../../data/events';
import { sound } from '../../utils/audio';

interface MissionControlDashboardProps {
  mission: MissionDefinition;
  subMode?: string;
  assembledComponents: Record<string, SpacecraftComponent>;
  budgetRemaining: number;
  onOpenSurface: () => void;
  onEvaluateMission: (telemetry: MissionTelemetry, capturedImages: CapturedEarthImage[]) => void;
  settings: GameSettings;
}

export const MissionControlDashboard: React.FC<MissionControlDashboardProps> = ({
  mission,
  subMode,
  assembledComponents,
  budgetRemaining,
  onOpenSurface,
  onEvaluateMission,
  settings,
}) => {
  // Telemetry state
  const [telemetry, setTelemetry] = useState<MissionTelemetry>(() => {
    const powerGen = Object.values(assembledComponents).reduce(
      (sum, c) => (c.power > 0 ? sum + c.power : sum),
      0
    );
    const powerDraw = Object.values(assembledComponents).reduce(
      (sum, c) => (c.power < 0 ? sum + Math.abs(c.power) : sum),
      0
    );
    const baseBandwidth = Object.values(assembledComponents).some(
      (c) => c.id === 'antenna-ka-parabolic-dish'
    )
      ? 15000
      : Object.values(assembledComponents).some(
          (c) => c.id === 'antenna-x-band-steerable'
        )
      ? 2048
      : 256;

    return {
      altitudeKm: mission.id === 'earth' ? 705 : mission.distanceKm > 1000 ? 350 : 705,
      velocityKmS: mission.id === 'earth' ? 7.5 : 4.2,
      batteryWh: 1200,
      maxBatteryWh: 1200,
      solarGenerationW: powerGen,
      powerConsumptionW: powerDraw,
      temperatureC: mission.id === 'sun' ? 42 : 21,
      thermalStatus: 'nominal',
      fuelKg: 50,
      maxFuelKg: 50,
      dataBufferMB: 45,
      dataTransmittedMB: 0,
      bandwidthKbps: baseBandwidth,
      signalStrengthDbm: -82,
      commDelaySec: mission.commDelaySec,
      missionElapsedSeconds: 43200, // 12 hours MET
      spacecraftHealthPercent: 100,
      sciencePointsCollected: 30,
    };
  });

  // Event log state
  const [logs, setLogs] = useState<string[]>([
    `[MET 00:00:00] Spacecraft deployment verified nominal into ${mission.destination}.`,
    `[MET 00:02:15] Telemetry carrier signal acquired by Deep Space Ground Network.`,
    `[MET 00:05:30] Solar arrays articulated to Sun vector. Main power bus energized.`,
    `[MET 00:08:45] Primary science payload initialized and self-check complete.`,
  ]);

  // Downlink in-progress state
  const [isDownlinking, setIsDownlinking] = useState<boolean>(false);
  const [downlinkProgress, setDownlinkProgress] = useState<number>(0);

  // Simulated Earth/Celestial Imager feed
  const [capturedImages, setCapturedImages] = useState<CapturedEarthImage[]>([]);
  const [currentFilter, setCurrentFilter] = useState<'optical' | 'infrared' | 'multispectral' | 'radar'>('optical');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Active Challenge Event Popup
  const [activeEvent, setActiveEvent] = useState<MissionEvent | null>(null);

  // Periodic Telemetry Tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => {
        // Battery discharge if draw > gen (eclipse)
        const netW = prev.solarGenerationW - prev.powerConsumptionW;
        const battChange = (netW / 3600) * 10;
        const newBatt = Math.max(0, Math.min(prev.maxBatteryWh, prev.batteryWh + battChange));

        // Temperature drift
        let targetTemp = mission.id === 'sun' ? 42 : 21;
        if (mission.id === 'sun' && prev.temperatureC > 45) {
          sound.playAlarm();
        }

        return {
          ...prev,
          missionElapsedSeconds: prev.missionElapsedSeconds + 1,
          batteryWh: Number(newBatt.toFixed(1)),
          temperatureC: Number((prev.temperatureC + (Math.random() - 0.5) * 0.2).toFixed(1)),
          signalStrengthDbm: -82 + Math.floor((Math.random() - 0.5) * 4),
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mission.id]);

  // Trigger random mission event after 8 seconds
  useEffect(() => {
    const events = MISSION_EVENTS[mission.id];
    if (!events || events.length === 0) return;

    const timer = setTimeout(() => {
      const randomEvt = events[Math.floor(Math.random() * events.length)];
      setActiveEvent(randomEvt);
      sound.playAlarm();
    }, 8000);

    return () => clearTimeout(timer);
  }, [mission.id]);

  // Procedural Canvas Imaging Simulator for Earth / Moon / Mars / Sun
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Render simulated orbital photo onto canvas
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (mission.id === 'earth') {
      // Ocean / Continents
      const grad = ctx.createLinearGradient(0, 0, w, h);
      if (currentFilter === 'optical') {
        grad.addColorStop(0, '#0a2342');
        grad.addColorStop(0.5, '#0f4c81');
        grad.addColorStop(1, '#0a2342');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Green Amazon vegetation
        ctx.fillStyle = '#2d6a4f';
        ctx.beginPath();
        ctx.ellipse(w * 0.45, h * 0.5, w * 0.35, h * 0.35, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Clouds swirl
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          ctx.arc(w * 0.2 + i * 40, h * 0.3 + (i % 3) * 30, 25 + i * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (currentFilter === 'infrared') {
        // Thermal heat map
        grad.addColorStop(0, '#312e81');
        grad.addColorStop(0.5, '#dc2626');
        grad.addColorStop(1, '#facc15');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else if (currentFilter === 'multispectral') {
        // False-color NDVI vegetation index
        grad.addColorStop(0, '#14532d');
        grad.addColorStop(0.5, '#16a34a');
        grad.addColorStop(1, '#86efac');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else {
        // Synthetic Aperture Radar
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        for (let y = 0; y < h; y += 8) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y + (Math.sin(y * 0.1) * 6));
          ctx.stroke();
        }
      }
    } else if (mission.id === 'moon') {
      // Lunar regolith & craters
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, 70, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (mission.id === 'mars') {
      // Martian Jezero crater paleolake
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#7c2d12';
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.5, 90, 60, -0.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (mission.id === 'sun') {
      // Solar corona & CME
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, 120);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.4, '#f97316');
      grad.addColorStop(1, '#7c2d12');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    // Telemetry Stamp HUD on Image
    ctx.fillStyle = 'rgba(0, 240, 255, 0.9)';
    ctx.font = '10px monospace';
    ctx.fillText(`SC-1 SENSOR // FILTER: ${currentFilter.toUpperCase()}`, 10, 18);
    ctx.fillText(`LAT: -03°12'44" // LON: -60°02'18"`, 10, 32);
    ctx.fillText(`FOV: 180 KM // RESOLUTION: 0.5M/PX`, 10, 46);
  }, [mission.id, currentFilter]);

  // Capture High-Res Image Action
  const handleCaptureImage = () => {
    sound.playTelemetryChirp();
    setIsCapturing(true);

    setTimeout(() => {
      const newImg: CapturedEarthImage = {
        id: `img-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        target:
          mission.id === 'earth'
            ? 'Amazon Basin Vegetation & Cloud Corridor'
            : mission.id === 'moon'
            ? 'Shackleton Crater Permanently Shadowed Rim'
            : mission.id === 'mars'
            ? 'Jezero Crater Sedimentary River Delta'
            : 'Solar Active Region AR-3420 Coronal Loop',
        filter: currentFilter,
        resolution: '0.5m / pixel',
        cloudCover: Math.floor(15 + Math.random() * 20),
        scientificInsight:
          currentFilter === 'multispectral'
            ? 'NDVI vegetative index indicates healthy canopy biomass density with 1.2% year-over-year recovery.'
            : currentFilter === 'infrared'
            ? 'Surface thermal radiometer indicates anomalous thermal retention consistent with subsurface hydration.'
            : currentFilter === 'radar'
            ? 'Penetrated cloud moisture barrier; mapped high-resolution river delta topography.'
            : 'Multi-spectral optical survey captures active geological strata and atmospheric cloud deck.',
        dataSizeMB: 28,
      };

      setCapturedImages((prev) => [newImg, ...prev]);
      setTelemetry((prev) => ({
        ...prev,
        dataBufferMB: prev.dataBufferMB + 28,
        sciencePointsCollected: prev.sciencePointsCollected + 15,
      }));
      setLogs((prev) => [
        `[MET ${formatMET(telemetry.missionElapsedSeconds)}] Captured ${newImg.filter.toUpperCase()} imaging frame: ${newImg.target}.`,
        ...prev,
      ]);
      setIsCapturing(false);
    }, 600);
  };

  // Run Climate / Atmosphere / Asteroid Sensors
  const handleCollectScienceData = (type: string) => {
    sound.playTelemetryChirp();
    const dataSize = 18;
    const pts = 20;

    let logMsg = '';
    if (type === 'climate') {
      logMsg = 'Atmospheric sounder recorded vertical ozone profile: 310 Dobson Units.';
    } else if (type === 'ocean') {
      logMsg = 'Radar altimeter recorded mean sea surface height anomaly: +3.2 mm global variance.';
    } else if (type === 'asteroid') {
      logMsg = 'Infrared surveyor scanned 1,200 deg² field: Zero collision risks detected in immediate corridor.';
    } else if (type === 'solar') {
      logMsg = 'Faraday cup sampled solar wind speed: 450 km/s proton velocity, 12 nT magnetic vector.';
    }

    setTelemetry((prev) => ({
      ...prev,
      dataBufferMB: prev.dataBufferMB + dataSize,
      sciencePointsCollected: prev.sciencePointsCollected + pts,
    }));

    setLogs((prev) => [`[MET ${formatMET(telemetry.missionElapsedSeconds)}] ${logMsg}`, ...prev]);
  };

  // Data Downlink Transmission System
  const handleTransmitData = () => {
    if (telemetry.dataBufferMB <= 0 || isDownlinking) return;

    sound.playTelemetryChirp();
    setIsDownlinking(true);
    setDownlinkProgress(0);

    const totalToTransmit = telemetry.dataBufferMB;
    let currentP = 0;

    const interval = setInterval(() => {
      currentP += 0.1;
      setDownlinkProgress(Math.min(100, Math.floor(currentP * 100)));

      if (currentP >= 1.0) {
        clearInterval(interval);
        setIsDownlinking(false);
        sound.playConfirm();
        setTelemetry((prev) => ({
          ...prev,
          dataBufferMB: 0,
          dataTransmittedMB: prev.dataTransmittedMB + totalToTransmit,
          sciencePointsCollected: prev.sciencePointsCollected + 25,
        }));
        setLogs((prev) => [
          `[MET ${formatMET(telemetry.missionElapsedSeconds)}] Successfully downlinked ${totalToTransmit} MB scientific telemetry to Earth Mission Control!`,
          ...prev,
        ]);
      }
    }, 200);
  };

  // Resolve Active Event Option
  const handleEventOption = (optIndex: number) => {
    if (!activeEvent) return;
    const opt = activeEvent.options[optIndex];
    sound.playConfirm();

    setTelemetry((prev) => {
      let batt = prev.batteryWh;
      if (opt.consequence.powerChange) {
        batt = Math.max(0, Math.min(prev.maxBatteryWh, batt + opt.consequence.powerChange));
      }
      return {
        ...prev,
        batteryWh: batt,
        temperatureC: prev.temperatureC + (opt.consequence.tempChange || 0),
        fuelKg: Math.max(0, prev.fuelKg - (opt.consequence.fuelCost || 0)),
        dataBufferMB: Math.max(0, prev.dataBufferMB - (opt.consequence.dataLoss || 0)),
        sciencePointsCollected: prev.sciencePointsCollected + (opt.consequence.scienceBonus || 0),
        spacecraftHealthPercent: Math.max(
          10,
          Math.min(100, prev.spacecraftHealthPercent + (opt.consequence.healthChange || 0))
        ),
      };
    });

    setLogs((prev) => [
      `[EVENT RESOLVED] ${opt.consequence.logMessage}`,
      ...prev,
    ]);

    setActiveEvent(null);
  };

  const formatMET = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const batteryPercent = Math.floor(
    (telemetry.batteryWh / telemetry.maxBatteryWh) * 100
  );

  return (
    <div className="w-screen h-screen bg-space-950 font-display flex flex-col select-none overflow-hidden text-slate-100">
      {/* 1. TOP HEADER MISSION CONTROL HUD */}
      <div className="h-16 border-b border-cyan-500/20 bg-space-900/90 backdrop-blur px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-widest text-white">
              EARTH MISSION CONTROL CENTER // DEEP SPACE NETWORK
            </h2>
            <p className="text-[10px] text-cyan-400 font-mono">
              ACTIVE STATION: GOLDSTONE (DSN-14) // COMM DELAY: {telemetry.commDelaySec} SECONDS
            </p>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-6 font-mono text-xs">
          <div className="bg-space-850 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">MET:</span>
            <span className="text-white font-bold">{formatMET(telemetry.missionElapsedSeconds)}</span>
          </div>

          <div className="bg-space-850 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">HEALTH:</span>
            <span className="text-emerald-400 font-bold">{telemetry.spacecraftHealthPercent}%</span>
          </div>

          <div className="bg-space-850 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-slate-400">SCIENCE DATA:</span>
            <span className="text-purple-300 font-bold">{telemetry.sciencePointsCollected} PTS</span>
          </div>

          {/* Surface exploration shortcut if Moon or Mars */}
          {(mission.id === 'moon' || mission.id === 'mars') && (
            <button
              onClick={() => {
                sound.playConfirm();
                onOpenSurface();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:from-cyan-400 hover:to-blue-500 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>OPEN 3D SURFACE VIEW</span>
            </button>
          )}

          {/* Finalize Mission Button */}
          <button
            onClick={() => {
              sound.playConfirm();
              onEvaluateMission(telemetry, capturedImages);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950 font-bold transition"
          >
            <CheckCircle className="w-4 h-4" />
            <span>CONCLUDE & EVALUATE MISSION</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 3-PANEL DASHBOARD GRID */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden p-6 gap-6">
        {/* LEFT COLUMN: LIVE TELEMETRY RESOURCE INDICATORS (3 cols) */}
        <div className="col-span-12 md:col-span-3 rounded-xl border border-slate-800 bg-space-900/90 p-4 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold font-mono tracking-wider text-white flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                SPACECRAFT TELEMETRY
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">LIVE SENSOR STREAM</p>
            </div>

            {/* Battery Gauge */}
            <div className="bg-space-950/70 p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  BATTERY LEVEL:
                </span>
                <span className="text-emerald-400 font-bold">{batteryPercent}%</span>
              </div>
              <div className="w-full bg-space-800 h-2 rounded-full overflow-hidden mb-1">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${batteryPercent}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>{telemetry.batteryWh} Wh</span>
                <span>Max: {telemetry.maxBatteryWh} Wh</span>
              </div>
            </div>

            {/* Power Generation vs Consumption */}
            <div className="bg-space-950/70 p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                <span>POWER GENERATION:</span>
                <span className="text-cyan-300 font-bold">+{telemetry.solarGenerationW} W</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                <span>AVIONICS DRAW:</span>
                <span className="text-amber-400 font-bold">-{telemetry.powerConsumptionW} W</span>
              </div>
              <div className="text-[10px] text-slate-500">
                Net: {telemetry.solarGenerationW - telemetry.powerConsumptionW >= 0 ? '+' : ''}
                {telemetry.solarGenerationW - telemetry.powerConsumptionW} W
              </div>
            </div>

            {/* Temperature Meter */}
            <div className="bg-space-950/70 p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                  CORE TEMPERATURE:
                </span>
                <span
                  className={`font-bold ${
                    telemetry.temperatureC > 45 ? 'text-red-400 animate-pulse' : 'text-cyan-300'
                  }`}
                >
                  {telemetry.temperatureC}°C
                </span>
              </div>
              <div className="text-[10px] text-slate-500">
                STATUS: {telemetry.temperatureC > 45 ? 'THERMAL WARNING' : 'NOMINAL THERMAL REGIME'}
              </div>
            </div>

            {/* Fuel Reserve */}
            <div className="bg-space-950/70 p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  PROPELLANT REMAINING:
                </span>
                <span className="text-white font-bold">{telemetry.fuelKg} kg</span>
              </div>
              <div className="w-full bg-space-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(telemetry.fuelKg / telemetry.maxFuelKg) * 100}%` }}
                />
              </div>
            </div>

            {/* RF Comms Signal */}
            <div className="bg-space-950/70 p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>SIGNAL STRENGTH:</span>
                <span className="text-cyan-300 font-bold">{telemetry.signalStrengthDbm} dBm</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px] mt-1">
                <span>BANDWIDTH:</span>
                <span className="text-white font-bold">{telemetry.bandwidthKbps} kbps</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px] mt-1">
                <span>ONE-WAY DELAY:</span>
                <span className="text-amber-400 font-bold">{telemetry.commDelaySec} s</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: SIMULATED IMAGING FEED & SCIENCE OPERATIONS (5 cols) */}
        <div className="col-span-12 md:col-span-5 rounded-xl border border-cyan-500/30 bg-space-900/90 p-4 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="text-xs font-bold font-mono tracking-wider text-white flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  MISSION IMAGING & OPTICS SUITE
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  TARGET: {mission.destination}
                </p>
              </div>

              {/* Spectral Filter Switcher */}
              <div className="flex gap-1 font-mono text-[10px]">
                {(['optical', 'infrared', 'multispectral', 'radar'] as const).map((flt) => (
                  <button
                    key={flt}
                    onClick={() => {
                      setCurrentFilter(flt);
                      sound.playClick(950, 0.02);
                    }}
                    className={`px-2 py-0.5 rounded uppercase transition ${
                      currentFilter === flt
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-space-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {flt.slice(0, 4)}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Live Orbital Camera Canvas */}
            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black aspect-video flex items-center justify-center">
              <canvas ref={canvasRef} width={480} height={270} className="w-full h-full object-cover" />

              {/* Scanline / Grid overlay */}
              <div className="absolute inset-0 pointer-events-none border border-cyan-500/30 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px]" />

              <div className="absolute top-2 right-2 bg-space-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE ORBITAL FEED
              </div>
            </div>

            {/* Camera Capture Action */}
            <button
              onClick={handleCaptureImage}
              disabled={isCapturing}
              className="w-full py-2.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500 hover:text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 transition"
            >
              <Camera className="w-4 h-4" />
              <span>{isCapturing ? 'ACQUIRING MULTISPECTRAL FRAME...' : 'CAPTURE HIGH-RES SIMULATED IMAGE'}</span>
            </button>

            {/* Scientific Instrument Operations */}
            <div className="border-t border-slate-800 pt-3">
              <div className="text-[10px] font-mono text-slate-400 mb-2">TRIGGER SCIENTIFIC SENSORS:</div>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                {mission.id === 'earth' && (
                  <>
                    <button
                      onClick={() => handleCollectScienceData('climate')}
                      className="p-2 rounded bg-space-800 hover:bg-space-700 text-slate-200 border border-slate-700 text-left transition"
                    >
                      <div className="text-cyan-400 font-bold text-[11px]">CLIMATE SOUNDER</div>
                      <div className="text-[9px] text-slate-400">Atmospheric Gas Scan (+20 pts)</div>
                    </button>

                    <button
                      onClick={() => handleCollectScienceData('ocean')}
                      className="p-2 rounded bg-space-800 hover:bg-space-700 text-slate-200 border border-slate-700 text-left transition"
                    >
                      <div className="text-cyan-400 font-bold text-[11px]">OCEAN RADAR</div>
                      <div className="text-[9px] text-slate-400">Sea Height Scatter (+20 pts)</div>
                    </button>

                    <button
                      onClick={() => handleCollectScienceData('asteroid')}
                      className="p-2 rounded bg-space-800 hover:bg-space-700 text-slate-200 border border-slate-700 text-left transition col-span-2"
                    >
                      <div className="text-amber-400 font-bold text-[11px]">ASTEROID SURVEYOR</div>
                      <div className="text-[9px] text-slate-400">Near-Earth Object Radar Sweep (+25 pts)</div>
                    </button>
                  </>
                )}

                {mission.id === 'sun' && (
                  <>
                    <button
                      onClick={() => handleCollectScienceData('solar')}
                      className="p-2 rounded bg-space-800 hover:bg-space-700 text-slate-200 border border-slate-700 text-left transition col-span-2"
                    >
                      <div className="text-amber-400 font-bold text-[11px]">SOLAR WIND FARADAY CUP</div>
                      <div className="text-[9px] text-slate-400">Record Coronal Particle Burst (+30 pts)</div>
                    </button>
                  </>
                )}

                {(mission.id === 'moon' || mission.id === 'mars') && (
                  <>
                    <button
                      onClick={() => handleCollectScienceData('climate')}
                      className="p-2 rounded bg-space-800 hover:bg-space-700 text-slate-200 border border-slate-700 text-left transition col-span-2"
                    >
                      <div className="text-cyan-400 font-bold text-[11px]">SURFACE GEOLOGY RADAR</div>
                      <div className="text-[9px] text-slate-400">Subsurface Strata & Ice Sounding (+25 pts)</div>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: COMMS DOWNLINK & MISSION LOG (4 cols) */}
        <div className="col-span-12 md:col-span-4 rounded-xl border border-slate-800 bg-space-900/90 p-4 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Comms & Data Downlink */}
            <div className="border-b border-slate-800 pb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  SCIENTIFIC DATA TRANSMISSION
                </span>
                <span className="text-xs font-mono text-cyan-300 font-bold">
                  BUFFER: {telemetry.dataBufferMB} MB
                </span>
              </div>

              {/* Downlink progress bar */}
              {isDownlinking && (
                <div className="mb-2">
                  <div className="flex justify-between text-[10px] font-mono text-cyan-400 mb-1">
                    <span>TRANSMITTING DATA PACKETS...</span>
                    <span>{downlinkProgress}%</span>
                  </div>
                  <div className="w-full bg-space-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all duration-100"
                      style={{ width: `${downlinkProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px] mb-2 text-slate-400">
                <div>DOWNLINKED: <span className="text-emerald-400 font-bold">{telemetry.dataTransmittedMB} MB</span></div>
                <div>DELAY: <span className="text-amber-400">{telemetry.commDelaySec}s</span></div>
              </div>

              <button
                onClick={handleTransmitData}
                disabled={telemetry.dataBufferMB <= 0 || isDownlinking}
                className={`w-full py-2.5 rounded-lg font-bold font-mono text-xs flex items-center justify-center gap-1.5 transition ${
                  telemetry.dataBufferMB > 0 && !isDownlinking
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:opacity-90 shadow-cyan-glow'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isDownlinking
                    ? 'DOWNLINK IN PROGRESS...'
                    : telemetry.dataBufferMB > 0
                    ? `TRANSMIT ${telemetry.dataBufferMB} MB TO EARTH`
                    : 'NO UNTRANSMITTED DATA IN BUFFER'}
                </span>
              </button>
            </div>

            {/* Mission Log Chronology Feed */}
            <div>
              <div className="text-[10px] font-mono text-slate-400 mb-2">MISSION EVENT LOG:</div>
              <div className="space-y-1.5 font-mono text-[11px] max-h-56 overflow-y-auto pr-1">
                {logs.map((log, i) => (
                  <div key={i} className="p-1.5 rounded bg-space-950/60 border border-slate-800/80 text-slate-300">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            {/* Captured Photos Gallery preview */}
            {capturedImages.length > 0 && (
              <div className="border-t border-slate-800 pt-3">
                <div className="text-[10px] font-mono text-slate-400 mb-2">
                  CAPTURED IMAGERY CATALOG ({capturedImages.length}):
                </div>
                <div className="space-y-1.5 font-mono text-[10px] max-h-40 overflow-y-auto">
                  {capturedImages.slice(0, 3).map((img) => (
                    <div key={img.id} className="p-2 rounded bg-space-950 border border-slate-800">
                      <div className="text-cyan-300 font-bold">{img.target}</div>
                      <div className="text-slate-400 text-[9px] mt-0.5">{img.scientificInsight}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. RANDOM MISSION EVENT CHALLENGE MODAL */}
      {activeEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-space-900 border border-amber-500/50 rounded-xl max-w-xl w-full p-6 shadow-amber-glow font-display">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-400">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">
                  MISSION ANOMALY ALERT // SEVERITY: {activeEvent.severity.toUpperCase()}
                </span>
                <h3 className="text-lg font-bold text-white">{activeEvent.title}</h3>
              </div>
            </div>

            <p className="text-xs md:text-sm text-slate-300 font-sans mb-5 leading-relaxed">
              {activeEvent.description}
            </p>

            <div className="text-[11px] font-mono text-slate-400 mb-3">SELECT TACTICAL ACTION:</div>

            <div className="space-y-3">
              {activeEvent.options.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => handleEventOption(i)}
                  className="cursor-pointer p-3.5 rounded-lg border border-slate-700 bg-space-950 hover:border-amber-400 hover:bg-space-850 transition"
                >
                  <div className="font-bold text-xs text-white mb-1 flex items-center justify-between">
                    <span>{opt.label}</span>
                    <span className="text-[10px] font-mono text-cyan-400">EXECUTE ➔</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">{opt.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
