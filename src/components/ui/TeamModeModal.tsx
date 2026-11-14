import React, { useState } from 'react';
import {
  Users,
  ArrowLeft,
  Shield,
  Activity,
  Compass,
  Radio,
  CheckCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface TeamModeModalProps {
  onBack: () => void;
}

export const TeamModeModal: React.FC<TeamModeModalProps> = ({ onBack }) => {
  const [selectedRole, setSelectedRole] = useState<'commander' | 'engineer' | 'science' | 'operations'>('commander');
  const [teamReady, setTeamReady] = useState<Record<string, boolean>>({
    commander: true,
    engineer: true,
    science: true,
    operations: true,
  });

  const roles = [
    {
      id: 'commander',
      title: 'MISSION COMMANDER',
      subtitle: 'Flight Decisions & Trajectory Approvals',
      icon: <Compass className="w-6 h-6 text-cyan-400" />,
      color: '#00f0ff',
      duties: [
        'Authorizes T-Minus countdown initiation and staging burns.',
        'Makes final decisions on anomalous event responses (debris avoidance vs shield holding).',
        'Coordinates inter-subsystem priorities during power shortages.',
        'Authorizes landing touchdown and mission abort protocols.',
      ],
      assignedCallsign: 'CAPCOM-ALPHA',
    },
    {
      id: 'engineer',
      title: 'SPACECRAFT ENGINEER',
      subtitle: '3D Assembly, Mass & Power Systems',
      icon: <Activity className="w-6 h-6 text-amber-400" />,
      color: '#f59e0b',
      duties: [
        'Selects and positions bus modules, solar arrays, and batteries in 3D cleanroom.',
        'Monitors electrical power margin (generation vs load) and thermal status.',
        'Ensures launch vehicle mass capacity is not exceeded.',
        'Commands thruster propellant burns and attitude orientation.',
      ],
      assignedCallsign: 'EECOM-1',
    },
    {
      id: 'science',
      title: 'SCIENCE OFFICER',
      subtitle: 'Payload Optics, Sensors & Data Collection',
      icon: <Sparkles className="w-6 h-6 text-purple-400" />,
      color: '#a855f7',
      duties: [
        'Operates high-resolution multispectral cameras and infrared radiometers.',
        'Selects optical filters (optical, infrared, false-color NDVI, radar).',
        'Directs regolith core drilling, rock laser spectroscopy, and solar wind analysis.',
        'Monitors data generation rates (MB/s) and scientific mission scoring.',
      ],
      assignedCallsign: 'SCIENCE-LEAD',
    },
    {
      id: 'operations',
      title: 'OPERATIONS & COMMS OFFICER',
      subtitle: 'Ground Network & Telemetry Downlink',
      icon: <Radio className="w-6 h-6 text-emerald-400" />,
      color: '#10b981',
      duties: [
        'Maintains radio link with Goldstone, Madrid, and Canberra Deep Space Network dishes.',
        'Queues and downlinks telemetry packets to Earth Ground Stations.',
        'Calculates speed-of-light radio delay (e.g. 13 min to Mars, 1.3s to Moon).',
        'Monitors signal strength (dBm) and carrier frequency lock.',
      ],
      assignedCallsign: 'FLIGHT-OPS',
    },
  ];

  const activeRoleData = roles.find((r) => r.id === selectedRole) || roles[0];

  const handleRoleSelect = (roleId: typeof selectedRole) => {
    sound.playClick(950, 0.02);
    setSelectedRole(roleId);
  };

  const handleToggleReady = (roleId: string) => {
    sound.playConfirm();
    setTeamReady((prev) => ({ ...prev, [roleId]: !prev[roleId] }));
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
          <span>RETURN TO MAIN MENU</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            TEAM OPERATIONS CONSOLE ARCHITECTURE
          </h2>
          <p className="text-[10px] text-slate-400 font-mono">
            MULTI-STATION MISSION CONTROL ARCHITECTURE (UP TO 4 OPERATORS)
          </p>
        </div>

        <div className="text-xs font-mono text-purple-400 flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          <span>STATIONS: 4 ACTIVE</span>
        </div>
      </div>

      {/* Main Grid: Left 4 Roles + Right Active Console Workspace */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden p-6 gap-6">
        {/* Left: 4 Roles selection (5 cols) */}
        <div className="col-span-12 md:col-span-5 flex flex-col justify-between overflow-y-auto pr-2 space-y-3">
          <div>
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-400 mb-3">
              MISSION CONTROL OPERATOR STATIONS
            </h3>

            <div className="space-y-3">
              {roles.map((role) => {
                const isSelected = role.id === selectedRole;
                const isReady = teamReady[role.id];

                return (
                  <div
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id as typeof selectedRole)}
                    className={`cursor-pointer rounded-xl border p-4 transition ${
                      isSelected
                        ? 'border-purple-400 bg-space-850 shadow-cyan-glow'
                        : 'border-slate-800 bg-space-900/70 hover:bg-space-850'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-space-800 border border-slate-700 flex items-center justify-center">
                          {role.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">{role.title}</h4>
                          <p className="text-[10px] text-cyan-300 font-mono">{role.assignedCallsign}</p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleReady(role.id);
                        }}
                        className={`text-[10px] font-mono px-2.5 py-1 rounded-full border flex items-center gap-1 transition ${
                          isReady
                            ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40'
                            : 'border-amber-500/40 text-amber-400 bg-amber-950/40'
                        }`}
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>{isReady ? 'READY' : 'STANDBY'}</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 font-sans">{role.subtitle}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-space-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-400">
            <span className="text-cyan-400 font-bold">EDUCATIONAL NOTE:</span> In standard single-player mode, the player acts as the Mission Commander and has direct control over all four operational stations simultaneously.
          </div>
        </div>

        {/* Right: Active Role Station Deep Dive (7 cols) */}
        <div className="col-span-12 md:col-span-7 rounded-xl border border-purple-500/30 bg-space-900/90 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">
                  SELECTED CONSOLE // CALLSIGN: {activeRoleData.assignedCallsign}
                </span>
                <h3 className="text-2xl font-black text-white">{activeRoleData.title}</h3>
                <p className="text-xs text-cyan-300 font-mono mt-1">{activeRoleData.subtitle}</p>
              </div>
              <div className="p-3 rounded-xl bg-space-800 border border-slate-700">
                {activeRoleData.icon}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-mono font-bold text-slate-300 mb-3">
                PRIMARY OPERATIONAL DUTIES & RESPONSIBILITIES:
              </h4>
              <ul className="space-y-2.5 font-sans text-xs text-slate-300">
                {activeRoleData.duties.map((duty, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-space-950/70 border border-slate-800">
                    <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{duty}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Simulated Flight Team Voice Channel Feed */}
            <div className="bg-space-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 mb-2">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>SIMULATED TEAM VOICE LOOP [CHANNEL 1 // FLIGHT]:</span>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-slate-400">
                <p><span className="text-cyan-400">FLIGHT-OPS:</span> DSN tracking antenna locked on spacecraft transponder.</p>
                <p><span className="text-amber-400">EECOM-1:</span> Solar array power generation verified at nominal 850W.</p>
                <p><span className="text-purple-400">SCIENCE-LEAD:</span> Multispectral imaging spectrometer calibration nominal.</p>
                <p><span className="text-cyan-300">CAPCOM-ALPHA:</span> Space Command confirms flight path nominal. Proceeding with science operations.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => {
                sound.playConfirm();
                onBack();
              }}
              className="px-6 py-2.5 rounded-lg bg-cyan-500 text-slate-950 font-bold font-mono text-xs hover:bg-cyan-400 transition"
            >
              SAVE STATION CONFIGURATION & RETURN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
