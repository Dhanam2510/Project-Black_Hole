import React, { useState, useEffect, useMemo } from 'react';
import {
  GameView,
  MissionDefinition,
  MissionType,
  SpacecraftComponent,
  RocketVehicle,
  AstronautCrew,
  MissionTelemetry,
  CapturedEarthImage,
  MissionEvaluation as MissionEvalType,
  GameSettings,
  ComponentSlot,
} from './types/game';
import { MISSIONS } from './data/missions';
import { COMPONENT_CATALOG } from './data/components';
import { ROCKET_CATALOG } from './data/rockets';
import { ASTRONAUT_ROSTER } from './data/astronauts';
import {
  loadSettings,
  saveSettings,
  loadMissionHistory,
  saveMissionEvaluation,
  loadActiveMission,
  saveActiveMission,
  clearActiveMission,
} from './utils/storage';
import { sound } from './utils/audio';

// UI Components
import { MainMenu } from './components/ui/MainMenu';
import { MissionSelect } from './components/ui/MissionSelect';
import { SubMissionSelect } from './components/ui/SubMissionSelect';
import { AstronautReadinessModal } from './components/ui/AstronautReadinessModal';
import { AssemblyWorkshop } from './components/ui/AssemblyWorkshop';
import { EquipmentShop } from './components/ui/EquipmentShop';
import { RocketSelect } from './components/ui/RocketSelect';
import { LaunchControl } from './components/ui/LaunchControl';
import { OrbitControl } from './components/ui/OrbitControl';
import { MissionControlDashboard } from './components/ui/MissionControlDashboard';
import { SurfaceControl } from './components/ui/SurfaceControl';
import { MissionEvaluation } from './components/ui/MissionEvaluation';
import { MissionHistory } from './components/ui/MissionHistory';
import { HowToPlayModal } from './components/ui/HowToPlayModal';
import { SettingsModal } from './components/ui/SettingsModal';
import { TeamModeModal } from './components/ui/TeamModeModal';

export const App: React.FC = () => {
  // Settings & Sound
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());

  // Current Screen / View
  const [currentView, setCurrentView] = useState<GameView>('main-menu');

  // Mission State
  const [selectedMission, setSelectedMission] = useState<MissionDefinition>(MISSIONS[0]);
  const [subMode, setSubMode] = useState<string>('rover');
  const [budget, setBudget] = useState<number>(1000000);
  const [initialBudget, setInitialBudget] = useState<number>(1000000);
  const [spentBudget, setSpentBudget] = useState<number>(0);

  // Spacecraft Assembled Components & Rotations
  const [assembledComponents, setAssembledComponents] = useState<Record<string, SpacecraftComponent>>({});
  const [componentRotations, setComponentRotations] = useState<Record<string, number>>({});

  // Inventory held in agency store
  const [inventory, setInventory] = useState<SpacecraftComponent[]>([]);

  // Selected Launch Vehicle
  const [selectedRocket, setSelectedRocket] = useState<RocketVehicle>(ROCKET_CATALOG[1]);

  // Astronauts
  const [assignedCrew, setAssignedCrew] = useState<AstronautCrew[]>(ASTRONAUT_ROSTER);

  // Mission Control & Evaluation Data
  const [evaluationData, setEvaluationData] = useState<MissionEvalType | null>(null);
  const [missionHistory, setMissionHistory] = useState<MissionEvalType[]>(() => loadMissionHistory());
  const [lastTelemetry, setLastTelemetry] = useState<MissionTelemetry | null>(null);
  const [capturedImages, setCapturedImages] = useState<CapturedEarthImage[]>([]);

  // Check if saved mission exists for continue button
  const hasSavedMission = useMemo(() => {
    return loadActiveMission() !== null;
  }, []);

  // Update audio volume when settings change
  useEffect(() => {
    sound.setVolume(settings.masterVolume);
    sound.setMute(!settings.soundEnabled);
  }, [settings]);

  // Start background ambient hum on first user interaction
  useEffect(() => {
    const handleFirstClick = () => {
      sound.startAmbientHum();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);
    return () => window.removeEventListener('click', handleFirstClick);
  }, []);

  // Handlers for Navigation & Mission Life Cycle
  const handleStartNewMission = () => {
    setCurrentView('mission-select');
  };

  const handleContinueMission = () => {
    const saved = loadActiveMission();
    if (!saved) return;

    const mission = MISSIONS.find((m) => m.id === saved.missionType) || MISSIONS[0];
    setSelectedMission(mission);
    setSubMode(saved.subMode || 'rover');
    setBudget(saved.budget);
    setSpentBudget(saved.spentBudget);
    setAssembledComponents(saved.assembledComponents || {});
    setComponentRotations(saved.componentRotations || {});
    if (saved.selectedRocketId) {
      const rocket = ROCKET_CATALOG.find((r) => r.id === saved.selectedRocketId);
      if (rocket) setSelectedRocket(rocket);
    }
    setCurrentView('assembly-workshop');
  };

  const handleSelectMission = (mission: MissionDefinition) => {
    setSelectedMission(mission);
    setBudget(mission.budgetAllowance);
    setInitialBudget(mission.budgetAllowance);
    setSpentBudget(0);
    setAssembledComponents({});
    setComponentRotations({});

    // Pre-populate with default starter bus for convenience
    const defaultBus = COMPONENT_CATALOG.find((c) => c.id === 'bus-hex-standard');
    if (defaultBus) {
      setAssembledComponents({ core: defaultBus });
    }

    if (mission.id === 'moon' || mission.id === 'mars') {
      setCurrentView('sub-mission-select');
    } else {
      setCurrentView('assembly-workshop');
    }
  };

  const handleSelectSubMode = (mode: string) => {
    setSubMode(mode);
    if (mode === 'astronaut') {
      setCurrentView('astronaut-prep');
    } else {
      setCurrentView('assembly-workshop');
    }
  };

  const handleConfirmAstronautReadiness = (crew: AstronautCrew[]) => {
    setAssignedCrew(crew);
    setCurrentView('assembly-workshop');
  };

  // Workshop Component Actions
  const handleAttachComponent = (slot: ComponentSlot, comp: SpacecraftComponent) => {
    setAssembledComponents((prev) => {
      const next = { ...prev, [slot]: comp };
      // Save checkpoint
      saveActiveMission({
        missionType: selectedMission.id,
        subMode,
        budget,
        spentBudget,
        assembledComponents: next,
        componentRotations,
        selectedRocketId: selectedRocket.id,
        timestamp: new Date().toISOString(),
      });
      return next;
    });
  };

  const handleRemoveComponent = (slot: ComponentSlot) => {
    setAssembledComponents((prev) => {
      const next = { ...prev };
      delete next[slot];
      saveActiveMission({
        missionType: selectedMission.id,
        subMode,
        budget,
        spentBudget,
        assembledComponents: next,
        componentRotations,
        selectedRocketId: selectedRocket.id,
        timestamp: new Date().toISOString(),
      });
      return next;
    });
  };

  const handleRotateComponent = (slot: ComponentSlot) => {
    setComponentRotations((prev) => {
      const cur = prev[slot] || 0;
      const nextAngle = (cur + 90) % 360;
      return { ...prev, [slot]: nextAngle };
    });
  };

  // Equipment Shop Actions
  const handleBuyComponent = (comp: SpacecraftComponent) => {
    setBudget((b) => b - comp.cost);
    setSpentBudget((s) => s + comp.cost);
    setInventory((inv) => [...inv, comp]);
  };

  const handleSellComponent = (comp: SpacecraftComponent) => {
    const refund = Math.floor(comp.cost * 0.85);
    setBudget((b) => b + refund);
    setSpentBudget((s) => Math.max(0, s - refund));
    setInventory((inv) => {
      const idx = inv.findIndex((item) => item.id === comp.id);
      if (idx !== -1) {
        const copy = [...inv];
        copy.splice(idx, 1);
        return copy;
      }
      return inv;
    });
  };

  // Rocket Selection & Launch Sequence
  const handleSelectRocket = (rocket: RocketVehicle) => {
    setSelectedRocket(rocket);
    setCurrentView('launch-pad');
  };

  const handleLaunchComplete = () => {
    setCurrentView('space-transit');
  };

  const handleEnterDestination = () => {
    setCurrentView('mission-control');
  };

  // Mission Evaluation Calculation Algorithm
  const handleEvaluateMission = (
    telemetry: MissionTelemetry,
    images: CapturedEarthImage[]
  ) => {
    setLastTelemetry(telemetry);
    setCapturedImages(images);

    // 100-Point Evaluation Algorithm
    // 1. Objectives (max 30)
    let objScore = 25;
    if (images.length >= 2) objScore += 5;

    // 2. Scientific Value (max 25)
    let sciScore = Math.min(25, Math.floor(telemetry.dataTransmittedMB / 10) + images.length * 4);
    if (sciScore < 15) sciScore = 18;

    // 3. Resource Efficiency (max 20)
    const budgetMargin = (budget / initialBudget) * 100;
    let resScore = 12;
    if (budgetMargin >= 20) resScore += 4;
    if (telemetry.batteryWh >= telemetry.maxBatteryWh * 0.6) resScore += 4;

    // 4. Engineering Design (max 15)
    const netPower = telemetry.solarGenerationW - telemetry.powerConsumptionW;
    let engScore = 10;
    if (netPower >= 50) engScore += 3;
    if (telemetry.spacecraftHealthPercent >= 90) engScore += 2;

    // 5. Operations & Comms (max 10)
    let opsScore = 8;
    if (telemetry.signalStrengthDbm >= -85) opsScore += 2;

    const total = Math.min(100, objScore + sciScore + resScore + engScore + opsScore);

    let rank: 'S' | 'A' | 'B' | 'C' | 'D' = 'C';
    if (total >= 90) rank = 'S';
    else if (total >= 80) rank = 'A';
    else if (total >= 70) rank = 'B';
    else if (total >= 60) rank = 'C';
    else rank = 'D';

    const achievements: string[] = [
      `Inserted into stable ${selectedMission.destination}`,
      `Generated ${telemetry.dataTransmittedMB + telemetry.dataBufferMB} MB of scientific data`,
      `Completed multi-spectral orbital reconnaissance`,
    ];
    if (images.length >= 2) achievements.push(`Captured ${images.length} high-resolution photographic frames`);
    if (rank === 'S' || rank === 'A') achievements.push(`Achieved Flight Excellence Rating (Rank ${rank})`);

    const critiques: string[] = [];
    if (netPower < 40) {
      critiques.push('Consider higher-efficiency GaInP solar wings to expand electrical safety margins during eclipse passes.');
    }
    if (telemetry.dataBufferMB > 50) {
      critiques.push('Equip high-gain Ka-band dish antennas to accelerate scientific telemetry downlink throughput.');
    }
    if (selectedMission.id === 'sun' && telemetry.temperatureC > 40) {
      critiques.push('Install active ammonia loop heat pipes and radiators to better manage intense perihelion thermal flux.');
    }
    if (critiques.length === 0) {
      critiques.push('Optimal configuration. Spacecraft subsystems performed within tight aerospace nominal tolerances.');
    }

    const evaluation: MissionEvalType = {
      id: `eval-${Date.now()}`,
      missionType: selectedMission.id,
      subMode,
      date: new Date().toLocaleDateString(),
      scoreTotal: total,
      scoreBreakdown: {
        objectiveAchievement: objScore,
        scientificValue: sciScore,
        resourceEfficiency: resScore,
        engineeringDesign: engScore,
        operationsAndComms: opsScore,
      },
      rank,
      achievements,
      failedObjectives: [],
      engineeringCritique: critiques,
      budgetSpent: initialBudget - budget,
      initialBudget,
      scienceDataTransmittedMB: telemetry.dataTransmittedMB,
      missionDurationFormatted: '12h 45m MET',
    };

    setEvaluationData(evaluation);
    saveMissionEvaluation(evaluation);
    setMissionHistory(loadMissionHistory());
    clearActiveMission();
    setCurrentView('mission-evaluation');
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-space-950 font-display select-none">
      {/* VIEW SWITCHER */}
      {currentView === 'main-menu' && (
        <MainMenu
          onStartNewMission={handleStartNewMission}
          onContinueMission={handleContinueMission}
          canContinue={hasSavedMission}
          onOpenHistory={() => setCurrentView('mission-history')}
          onOpenHowToPlay={() => setCurrentView('how-to-play')}
          onOpenSettings={() => setCurrentView('settings')}
          onOpenTeamMode={() => setCurrentView('team-mode')}
          settings={settings}
          onToggleSound={() => {
            const next = !settings.soundEnabled;
            sound.setMute(!next);
            setSettings({ ...settings, soundEnabled: next });
            saveSettings({ ...settings, soundEnabled: next });
          }}
        />
      )}

      {currentView === 'mission-select' && (
        <MissionSelect
          onSelectMission={handleSelectMission}
          onBack={() => setCurrentView('main-menu')}
        />
      )}

      {currentView === 'sub-mission-select' && (
        <SubMissionSelect
          missionType={selectedMission.id}
          onSelectSubMode={handleSelectSubMode}
          onBack={() => setCurrentView('mission-select')}
        />
      )}

      {currentView === 'astronaut-prep' && (
        <AstronautReadinessModal
          onConfirmReadiness={handleConfirmAstronautReadiness}
          onBack={() => setCurrentView('sub-mission-select')}
          currentBudget={budget}
        />
      )}

      {currentView === 'assembly-workshop' && (
        <AssemblyWorkshop
          mission={selectedMission}
          subMode={subMode}
          assembledComponents={assembledComponents}
          componentRotations={componentRotations}
          onAttachComponent={handleAttachComponent}
          onRemoveComponent={handleRemoveComponent}
          onRotateComponent={handleRotateComponent}
          budget={budget}
          spentBudget={spentBudget}
          onOpenShop={() => setCurrentView('equipment-shop')}
          onProceedToRocket={() => setCurrentView('rocket-select')}
          onBack={() => setCurrentView('mission-select')}
          settings={settings}
        />
      )}

      {currentView === 'equipment-shop' && (
        <EquipmentShop
          initialBudget={initialBudget}
          currentBudget={budget}
          spentBudget={spentBudget}
          inventory={inventory}
          onBuyComponent={handleBuyComponent}
          onSellComponent={handleSellComponent}
          onBack={() => setCurrentView('assembly-workshop')}
        />
      )}

      {currentView === 'rocket-select' && (
        <RocketSelect
          mission={selectedMission}
          subMode={subMode}
          assembledComponents={assembledComponents}
          astronauts={assignedCrew}
          remainingBudget={budget}
          onSelectRocket={handleSelectRocket}
          onBack={() => setCurrentView('assembly-workshop')}
        />
      )}

      {currentView === 'launch-pad' && (
        <LaunchControl
          mission={selectedMission}
          rocket={selectedRocket}
          assembledComponents={assembledComponents}
          componentRotations={componentRotations}
          onLaunchComplete={handleLaunchComplete}
          onAbort={() => setCurrentView('rocket-select')}
          settings={settings}
        />
      )}

      {currentView === 'space-transit' && (
        <OrbitControl
          mission={selectedMission}
          subMode={subMode}
          components={assembledComponents}
          onEnterDestination={handleEnterDestination}
          settings={settings}
        />
      )}

      {currentView === 'mission-control' && (
        <MissionControlDashboard
          mission={selectedMission}
          subMode={subMode}
          assembledComponents={assembledComponents}
          budgetRemaining={budget}
          onOpenSurface={() => setCurrentView('lunar-surface')}
          onEvaluateMission={handleEvaluateMission}
          settings={settings}
        />
      )}

      {currentView === 'lunar-surface' && (
        <SurfaceControl
          mission={selectedMission}
          subMode={subMode}
          components={assembledComponents}
          onBackToMissionControl={() => setCurrentView('mission-control')}
          settings={settings}
        />
      )}

      {currentView === 'mission-evaluation' && evaluationData && (
        <MissionEvaluation
          mission={selectedMission}
          subMode={subMode}
          evaluation={evaluationData}
          telemetry={lastTelemetry!}
          capturedImages={capturedImages}
          onReplayMission={() => setCurrentView('assembly-workshop')}
          onNewMission={() => setCurrentView('mission-select')}
          onViewHistory={() => setCurrentView('mission-history')}
        />
      )}

      {currentView === 'mission-history' && (
        <MissionHistory
          history={missionHistory}
          onBack={() => setCurrentView('main-menu')}
          onClearHistory={() => setMissionHistory([])}
        />
      )}

      {currentView === 'how-to-play' && (
        <HowToPlayModal onBack={() => setCurrentView('main-menu')} />
      )}

      {currentView === 'settings' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={(newSettings) => {
            setSettings(newSettings);
            saveSettings(newSettings);
          }}
          onBack={() => setCurrentView('main-menu')}
        />
      )}

      {currentView === 'team-mode' && (
        <TeamModeModal onBack={() => setCurrentView('main-menu')} />
      )}
    </div>
  );
};

export default App;
