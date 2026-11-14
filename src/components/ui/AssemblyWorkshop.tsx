import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  RotateCw,
  Trash2,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Zap,
  DollarSign,
  Scale,
  Activity,
  ChevronRight,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import {
  SpacecraftComponent,
  ComponentCategory,
  ComponentSlot,
  MissionDefinition,
  GameSettings,
} from '../../types/game';
import { COMPONENT_CATALOG, CATEGORY_LABELS } from '../../data/components';
import { SatelliteWorkshop3D } from '../3d/SatelliteWorkshop3D';
import { sound } from '../../utils/audio';

interface AssemblyWorkshopProps {
  mission: MissionDefinition;
  subMode?: string;
  assembledComponents: Record<string, SpacecraftComponent>;
  componentRotations: Record<string, number>;
  onAttachComponent: (slot: ComponentSlot, comp: SpacecraftComponent) => void;
  onRemoveComponent: (slot: ComponentSlot) => void;
  onRotateComponent: (slot: ComponentSlot) => void;
  budget: number;
  spentBudget: number;
  onOpenShop: () => void;
  onProceedToRocket: () => void;
  onBack: () => void;
  settings: GameSettings;
}

export const AssemblyWorkshop: React.FC<AssemblyWorkshopProps> = ({
  mission,
  subMode,
  assembledComponents,
  componentRotations,
  onAttachComponent,
  onRemoveComponent,
  onRotateComponent,
  budget,
  spentBudget,
  onOpenShop,
  onProceedToRocket,
  onBack,
  settings,
}) => {
  const [activeCategory, setActiveCategory] = useState<ComponentCategory>('structure');
  const [selectedSlot, setSelectedSlot] = useState<ComponentSlot | null>('core');
  const [inspectModalComp, setInspectModalComp] = useState<SpacecraftComponent | null>(null);

  // Filter components in catalog by category
  const filteredComponents = useMemo(() => {
    return COMPONENT_CATALOG.filter((c) => c.category === activeCategory);
  }, [activeCategory]);

  // LIVE CALCULATIONS: Total Mass, Cost, Power, Data Rate, Science Value
  const stats = useMemo(() => {
    let mass = 0;
    let cost = 0;
    let powerGen = 0;
    let powerDraw = 0;
    let dataRate = 0;
    let scienceScore = 0;

    Object.values(assembledComponents).forEach((comp) => {
      mass += comp.mass;
      cost += comp.cost;
      if (comp.power > 0) {
        powerGen += comp.power;
      } else {
        powerDraw += Math.abs(comp.power);
      }
      dataRate += comp.dataGen;
      scienceScore += comp.scienceValue;
    });

    const netPower = powerGen - powerDraw;
    const remainingBudget = budget - cost;

    return {
      mass,
      cost,
      powerGen,
      powerDraw,
      netPower,
      dataRate: Number(dataRate.toFixed(1)),
      scienceScore,
      remainingBudget,
    };
  }, [assembledComponents, budget]);

  // ENGINEERING READINESS AUDIT
  const audit = useMemo(() => {
    const hasCore = Boolean(assembledComponents['core']);
    const hasPower = stats.powerGen > 0;
    const hasNetSurplus = stats.netPower >= 0;
    const hasBattery = Object.values(assembledComponents).some((c) => c.category === 'battery');
    const hasComms = Boolean(assembledComponents['topDish']);
    const hasComputer = Object.values(assembledComponents).some((c) => c.category === 'computer');
    const hasNav = Object.values(assembledComponents).some((c) => c.category === 'navigation');
    const hasScience = Boolean(assembledComponents['bottomOptics']) || Object.values(assembledComponents).some((c) => c.category === 'science');
    const hasThermal = Object.values(assembledComponents).some((c) => c.category === 'thermal');
    const withinBudget = stats.remainingBudget >= 0;

    // Mission-specific requirements
    let missionSpecificPassed = true;
    let missionSpecificNote = 'All required instruments fitted';

    if (mission.id === 'sun') {
      const hasSunShield = Object.values(assembledComponents).some(
        (c) => c.id === 'thermal-sun-shield-extreme'
      );
      if (!hasSunShield) {
        missionSpecificPassed = false;
        missionSpecificNote = 'WARNING: Extreme Solar Heat Shield missing for Sun Mission!';
      }
    }

    const allPassed =
      hasCore &&
      hasPower &&
      hasNetSurplus &&
      hasBattery &&
      hasComms &&
      hasComputer &&
      hasScience &&
      withinBudget &&
      missionSpecificPassed;

    return {
      hasCore,
      hasPower,
      hasNetSurplus,
      hasBattery,
      hasComms,
      hasComputer,
      hasNav,
      hasScience,
      hasThermal,
      withinBudget,
      missionSpecificPassed,
      missionSpecificNote,
      allPassed,
    };
  }, [assembledComponents, stats, mission.id]);

  const handleSlotSelect = (slotId: string) => {
    sound.playClick(1000, 0.03);
    setSelectedSlot(slotId as ComponentSlot);
  };

  const handleAttach = (comp: SpacecraftComponent) => {
    // If a slot is selected and matches the component's valid slotType, attach to selectedSlot
    // Otherwise attach to first valid slot
    let targetSlot = selectedSlot;
    if (!targetSlot || !comp.slotType.includes(targetSlot)) {
      targetSlot = comp.slotType[0];
    }

    // Check budget
    if (stats.remainingBudget - comp.cost < 0) {
      sound.playError();
      return;
    }

    sound.playConfirm();
    onAttachComponent(targetSlot, comp);
  };

  const handleRemove = () => {
    if (selectedSlot && assembledComponents[selectedSlot]) {
      sound.playClick(600, 0.06);
      onRemoveComponent(selectedSlot);
    }
  };

  const handleRotate = () => {
    if (selectedSlot && assembledComponents[selectedSlot]) {
      sound.playClick(850, 0.04);
      onRotateComponent(selectedSlot);
    }
  };

  const currentCompInSlot = selectedSlot ? assembledComponents[selectedSlot] : null;

  return (
    <div className="w-screen h-screen bg-space-950 font-display flex flex-col select-none overflow-hidden text-slate-100">
      {/* 1. TOP HEADER & TELEMETRY BAR */}
      <div className="h-16 border-b border-cyan-500/20 bg-space-900/80 backdrop-blur px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK</span>
          </button>
          <div className="h-4 w-[1px] bg-slate-700" />
          <div>
            <h2 className="text-sm font-bold tracking-widest text-white">
              SATELLITE ASSEMBLY WORKSHOP // CLEANROOM BAY
            </h2>
            <p className="text-[10px] text-cyan-400 font-mono">
              TARGET: {mission.title} {subMode ? `[${subMode.toUpperCase()}]` : ''}
            </p>
          </div>
        </div>

        {/* Live Budget Counter */}
        <div className="flex items-center gap-6 font-mono text-xs">
          <div className="flex items-center gap-2 bg-space-850 px-3 py-1.5 rounded-lg border border-slate-700">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">REMAINING:</span>
            <span
              className={`font-bold ${
                stats.remainingBudget >= 0 ? 'text-emerald-400' : 'text-red-400 animate-pulse'
              }`}
            >
              ${stats.remainingBudget.toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onOpenShop();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>EQUIPMENT MARKET</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 3-COLUMN WORKSHOP LAYOUT */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* LEFT COLUMN: COMPONENT CATALOG (4 cols) */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 border-r border-slate-800 bg-space-900/90 flex flex-col overflow-hidden">
          {/* Category Tabs */}
          <div className="p-3 border-b border-slate-800/80 bg-space-950/60">
            <div className="text-[10px] font-mono text-slate-400 mb-2">SUBSYSTEM CATALOG</div>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(CATEGORY_LABELS) as ComponentCategory[]).map((cat) => {
                const isActive = cat === activeCategory;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      sound.playClick(950, 0.02);
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono tracking-wider transition ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-cyan-glow'
                        : 'bg-space-800 text-slate-300 hover:bg-space-700 hover:text-white'
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Component Item Cards List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredComponents.map((comp) => {
              const canAfford = stats.remainingBudget >= comp.cost;
              const isCompatibleWithTarget = comp.compatibility.includes(mission.id);

              return (
                <div
                  key={comp.id}
                  className={`rounded-lg border p-3 flex flex-col gap-2 transition-all ${
                    canAfford
                      ? 'border-slate-700/80 bg-space-850 hover:border-cyan-500/50'
                      : 'border-red-900/40 bg-red-950/10 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-white leading-tight">{comp.name}</h4>
                      <p className="text-[10px] text-cyan-400 font-mono mt-0.5">
                        SLOT: {comp.slotType.join(', ')}
                      </p>
                    </div>
                    <button
                      onClick={() => setInspectModalComp(comp)}
                      className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-space-700 transition"
                      title="Inspect Specifications"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-300 font-sans line-clamp-2">
                    {comp.description}
                  </p>

                  {/* Component Specs Chips */}
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono bg-space-950/50 p-1.5 rounded border border-slate-800">
                    <div className="text-slate-400">
                      MASS: <span className="text-white">{comp.mass}kg</span>
                    </div>
                    <div className="text-slate-400">
                      COST: <span className="text-emerald-400">${(comp.cost / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="text-slate-400">
                      PWR:{' '}
                      <span className={comp.power >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                        {comp.power > 0 ? `+${comp.power}W` : `${comp.power}W`}
                      </span>
                    </div>
                  </div>

                  {/* Compatibility Warning if not recommended */}
                  {!isCompatibleWithTarget && (
                    <div className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>Specialized for other mission profiles</span>
                    </div>
                  )}

                  {/* Attach Button */}
                  <button
                    onClick={() => handleAttach(comp)}
                    disabled={!canAfford}
                    className={`w-full py-1.5 rounded font-bold text-xs tracking-wider font-mono flex items-center justify-center gap-1.5 transition ${
                      canAfford
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500 hover:text-slate-950'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <span>ATTACH TO SPACECRAFT</span>
                    <Sparkles className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER COLUMN: 3D SPACECRAFT ASSEMBLY BAY (5 cols) */}
        <div className="col-span-12 md:col-span-5 lg:col-span-6 relative bg-space-950 flex flex-col">
          {/* 3D Scene */}
          <div className="flex-1 relative">
            <SatelliteWorkshop3D
              components={assembledComponents}
              rotations={componentRotations}
              selectedSlot={selectedSlot}
              onSlotClick={handleSlotSelect}
              graphicsPreset={settings.graphicsPreset}
            />

            {/* Floating Slot Manager Toolbar */}
            {selectedSlot && (
              <div className="absolute bottom-4 left-4 right-4 bg-space-900/90 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-mono text-xs font-bold">
                    {selectedSlot.slice(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400">ACTIVE SLOT:</div>
                    <div className="text-xs font-bold text-white font-mono uppercase">
                      {selectedSlot}{' '}
                      {currentCompInSlot ? `[${currentCompInSlot.name}]` : '[EMPTY SLOT]'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentCompInSlot && (
                    <>
                      <button
                        onClick={handleRotate}
                        className="flex items-center gap-1 px-3 py-1.5 rounded bg-space-800 hover:bg-space-700 text-xs text-slate-200 border border-slate-700 font-mono transition"
                        title="Rotate component 90 degrees"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                        <span>ROTATE</span>
                      </button>

                      <button
                        onClick={handleRemove}
                        className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-950/40 hover:bg-red-900/60 text-xs text-red-300 border border-red-500/30 font-mono transition"
                        title="Remove component"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span>DETACH</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ENGINEERING CALCULATIONS & PRE-FLIGHT AUDIT (3 cols) */}
        <div className="col-span-12 md:col-span-3 lg:col-span-3 border-l border-slate-800 bg-space-900/90 flex flex-col justify-between overflow-y-auto p-4">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold tracking-wider text-white flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                SPACECRAFT TELEMETRY
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">REAL-TIME PHYSICS CALCULATION</p>
            </div>

            {/* Resource Meters */}
            <div className="space-y-2.5 font-mono text-xs">
              {/* Mass Meter */}
              <div className="bg-space-950/60 p-2.5 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                  <span className="flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-cyan-400" />
                    TOTAL MASS:
                  </span>
                  <span className="text-white font-bold">{stats.mass} kg</span>
                </div>
                <div className="w-full bg-space-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (stats.mass / 2000) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Power Generation vs Consumption */}
              <div className="bg-space-950/60 p-2.5 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    POWER BALANCE:
                  </span>
                  <span
                    className={`font-bold ${
                      stats.netPower >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {stats.netPower >= 0 ? `+${stats.netPower}W SURPLUS` : `${stats.netPower}W DEFICIT`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span>SOLAR: +{stats.powerGen}W</span>
                  <span>DRAW: -{stats.powerDraw}W</span>
                </div>
                <div className="w-full bg-space-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      stats.netPower >= 0 ? 'bg-emerald-400' : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        stats.powerGen > 0 ? (stats.powerDraw / stats.powerGen) * 100 : 0
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Science & Data Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-space-950/60 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500">DOWNLINK RATE</div>
                  <div className="text-cyan-300 font-bold text-sm">{stats.dataRate} MB/s</div>
                </div>
                <div className="bg-space-950/60 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500">SCIENCE CAPABILITY</div>
                  <div className="text-purple-300 font-bold text-sm">{stats.scienceScore} pts</div>
                </div>
              </div>
            </div>

            {/* Diagnostic Checklist */}
            <div className="border-t border-slate-800 pt-3">
              <h4 className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
                <span>ENGINEERING AUDIT:</span>
                <span
                  className={`font-bold ${
                    audit.allPassed ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {audit.allPassed ? 'READY FOR FLIGHT' : 'CHECKS PENDING'}
                </span>
              </h4>

              <div className="space-y-1.5 text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  {audit.hasCore ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  )}
                  <span className={audit.hasCore ? 'text-slate-300' : 'text-red-400'}>
                    Chassis / Bus Core
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {audit.hasPower && audit.hasNetSurplus ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  )}
                  <span
                    className={
                      audit.hasPower && audit.hasNetSurplus ? 'text-slate-300' : 'text-red-400'
                    }
                  >
                    Positive Power Generation
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {audit.hasBattery ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                  <span className={audit.hasBattery ? 'text-slate-300' : 'text-amber-400'}>
                    Eclipse Battery Storage
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {audit.hasComms ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  )}
                  <span className={audit.hasComms ? 'text-slate-300' : 'text-red-400'}>
                    Communication Antenna
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {audit.hasComputer ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  )}
                  <span className={audit.hasComputer ? 'text-slate-300' : 'text-red-400'}>
                    Onboard Flight Computer
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {audit.hasScience ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                  <span className={audit.hasScience ? 'text-slate-300' : 'text-amber-400'}>
                    Primary Science Optics
                  </span>
                </div>

                {mission.id === 'sun' && (
                  <div className="flex items-center gap-2">
                    {audit.missionSpecificPassed ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    )}
                    <span
                      className={
                        audit.missionSpecificPassed ? 'text-slate-300' : 'text-red-400'
                      }
                    >
                      Solar Extreme Heat Shield
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Proceed Action */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                if (audit.allPassed) {
                  sound.playConfirm();
                  onProceedToRocket();
                } else {
                  sound.playError();
                }
              }}
              disabled={!audit.allPassed}
              className={`w-full py-3.5 rounded-lg font-bold text-xs tracking-wider font-mono flex items-center justify-center gap-2 transition-all ${
                audit.allPassed
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-glow transform hover:scale-[1.02]'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <span>{audit.allPassed ? 'APPROVE & SELECT ROCKET' : 'RESOLVE FAULTS TO PROCEED'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. COMPONENT INSPECTION MODAL */}
      {inspectModalComp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-space-900 border border-cyan-500/40 rounded-xl max-w-lg w-full p-6 shadow-cyan-glow">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                  {CATEGORY_LABELS[inspectModalComp.category]} // SPECIFICATION REPORT
                </span>
                <h3 className="text-lg font-bold text-white">{inspectModalComp.name}</h3>
              </div>
              <button
                onClick={() => setInspectModalComp(null)}
                className="text-slate-400 hover:text-white font-mono text-xs p-1"
              >
                ✕ CLOSE
              </button>
            </div>

            <p className="text-xs text-slate-300 font-sans mb-4 leading-relaxed">
              {inspectModalComp.description}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4 font-mono text-xs">
              <div className="bg-space-950 p-2.5 rounded border border-slate-800">
                <div className="text-slate-500 text-[10px]">MASS</div>
                <div className="text-white font-bold">{inspectModalComp.mass} kg</div>
              </div>
              <div className="bg-space-950 p-2.5 rounded border border-slate-800">
                <div className="text-slate-500 text-[10px]">PROCUREMENT COST</div>
                <div className="text-emerald-400 font-bold">${inspectModalComp.cost.toLocaleString()}</div>
              </div>
              <div className="bg-space-950 p-2.5 rounded border border-slate-800">
                <div className="text-slate-500 text-[10px]">POWER METRIC</div>
                <div className={inspectModalComp.power >= 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {inspectModalComp.power > 0 ? `+${inspectModalComp.power} W (Generates)` : `${inspectModalComp.power} W (Draw)`}
                </div>
              </div>
              <div className="bg-space-950 p-2.5 rounded border border-slate-800">
                <div className="text-slate-500 text-[10px]">DATA OUTPUT</div>
                <div className="text-cyan-300 font-bold">{inspectModalComp.dataGen} MB/s</div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 mb-4">
              <div className="text-[10px] font-mono text-slate-400 mb-2">ENGINEERING SPECS:</div>
              <div className="space-y-1 font-mono text-xs text-slate-300">
                {Object.entries(inspectModalComp.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-0.5 border-b border-slate-800/40">
                    <span className="text-slate-500">{key}:</span>
                    <span className="text-cyan-300">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                handleAttach(inspectModalComp);
                setInspectModalComp(null);
              }}
              className="w-full py-2.5 rounded bg-cyan-500 text-slate-950 font-bold text-xs tracking-wider font-mono hover:bg-cyan-400 transition"
            >
              ATTACH THIS COMPONENT NOW
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
