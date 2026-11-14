import { GameSettings, MissionEvaluation, SpacecraftComponent } from '../types/game';

const SETTINGS_KEY = 'space_command_settings';
const MISSION_HISTORY_KEY = 'space_command_history';
const ACTIVE_MISSION_KEY = 'space_command_active_mission';

export const DEFAULT_SETTINGS: GameSettings = {
  graphicsPreset: 'high',
  soundEnabled: true,
  musicEnabled: true,
  masterVolume: 0.8,
  sfxVolume: 0.8,
  controlsInverted: false,
};

export interface ActiveMissionSave {
  missionType: string;
  subMode?: string;
  budget: number;
  spentBudget: number;
  assembledComponents: Record<string, SpacecraftComponent>;
  componentRotations: Record<string, number>;
  selectedRocketId: string | null;
  timestamp: string;
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: GameSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // fallback
  }
}

export function loadMissionHistory(): MissionEvaluation[] {
  try {
    const raw = localStorage.getItem(MISSION_HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function saveMissionEvaluation(evaluation: MissionEvaluation) {
  try {
    const history = loadMissionHistory();
    history.unshift(evaluation);
    // Keep last 50 missions
    localStorage.setItem(MISSION_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  } catch {
    // fallback
  }
}

export function loadActiveMission(): ActiveMissionSave | null {
  try {
    const raw = localStorage.getItem(ACTIVE_MISSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return null;
}

export function saveActiveMission(save: ActiveMissionSave) {
  try {
    localStorage.setItem(ACTIVE_MISSION_KEY, JSON.stringify(save));
  } catch {
    // fallback
  }
}

export function clearActiveMission() {
  try {
    localStorage.removeItem(ACTIVE_MISSION_KEY);
  } catch {
    // fallback
  }
}

export function clearAllGameData() {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(MISSION_HISTORY_KEY);
    localStorage.removeItem(ACTIVE_MISSION_KEY);
  } catch {
    // fallback
  }
}
