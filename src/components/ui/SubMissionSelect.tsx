import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Compass, Shield, User, Navigation } from 'lucide-react';
import { MissionType } from '../../types/game';
import { sound } from '../../utils/audio';

interface SubMissionSelectProps {
  missionType: MissionType;
  onSelectSubMode: (mode: string) => void;
  onBack: () => void;
}

export const SubMissionSelect: React.FC<SubMissionSelectProps> = ({
  missionType,
  onSelectSubMode,
  onBack,
}) => {
  const isMoon = missionType === 'moon';
  const [selectedMode, setSelectedMode] = useState<string>(isMoon ? 'rover' : 'rover');

  const moonOptions = [
    {
      id: 'rover',
      title: 'LUNAR ROVER MISSION',
      subtitle: 'Surface Traverse & Regolith Core Sampling',
      icon: <Compass className="w-8 h-8 text-cyan-400" />,
      description:
        'Deploy an autonomous 4-wheel lunar exploration rover equipped with scientific cameras, spectrometers, robotic arm with regolith drill, and solar arrays. Traverse crater rims and collect soil samples in the extreme cold.',
      features: ['Rocker-Bogie 4-Wheel Drive', 'Robotic Arm Soil Drill', 'Multi-Spectral Pancam', 'Autonomous Hazard Avoidance'],
      difficulty: 'Moderate',
    },
    {
      id: 'lander',
      title: 'LUNAR LANDER MISSION',
      subtitle: 'Soft Descent & Precision Touchdown',
      icon: <Navigation className="w-8 h-8 text-amber-400" />,
      description:
        'Pilot a heavy scientific descent lander down to the lunar surface. Control throttle and descent thrusters to land gently on steep crater terrain without capsizing. Deploy long-term surface seismic stations (ALSEP).',
      features: ['Descent Engine Throttle Control', 'Landing Leg Suspension', 'Terrain Hazard Radar', 'ALSEP Surface Package'],
      difficulty: 'High',
    },
    {
      id: 'astronaut',
      title: 'ASTRONAUT EXPEDITION',
      subtitle: 'Crewed Surface EVA & Field Geology',
      icon: <User className="w-8 h-8 text-purple-400" />,
      description:
        'Recruit and evaluate a flight crew. Pass rigorous pre-launch readiness checks (fitness, suit integrity, oxygen/food, emergency backup). Conduct manual extravehicular exploration (EVA) on the lunar surface in 1/6th gravity.',
      features: ['Astronaut Recruitment & Training', 'Pre-Launch Readiness Assessment', '1/6th Gravity EVA Walks', 'Plant Flag & ALSEP Deployment'],
      difficulty: 'Extreme',
    },
  ];

  const marsOptions = [
    {
      id: 'orbiter',
      title: 'MARS CLIMATE & RADAR ORBITER',
      subtitle: 'High-Altitude Polar Spectrometry',
      icon: <Shield className="w-8 h-8 text-emerald-400" />,
      description:
        'Insert a heavy orbital platform into low Mars orbit to map sub-surface water ice glaciers using ground-penetrating radar and profile seasonal methane plumes.',
      features: ['Radar Sounding of Polar Ice', 'Atmospheric Methane Sniffer', 'Global Weather Monitoring', 'Relay Station for Future Landers'],
      difficulty: 'Moderate',
    },
    {
      id: 'rover',
      title: 'MARS EXPLORATION ROVER',
      subtitle: 'Paleolake Ancient Water Search',
      icon: <Compass className="w-8 h-8 text-orange-400" />,
      description:
        'Execute atmospheric entry, descent, and landing in Jezero Crater. Drive across rocky Martian terrain, fire laser-induced breakdown spectroscopy at basalt rocks, and drill delta clay mudstone.',
      features: ['Laser Rock Spectrometer (LIBS)', 'Dust Storm Survival Protocols', 'Core Drill & Sample Tube Caching', '13-Minute Radio Latency Command Queue'],
      difficulty: 'High',
    },
    {
      id: 'lander',
      title: 'MARS GEOPHYSICAL LANDER',
      subtitle: 'Internal Seismic & Heat Flow Station',
      icon: <Navigation className="w-8 h-8 text-amber-400" />,
      description:
        'Land an ultra-sensitive seismometer and heat-flow mole probe on the Martian plains to record Marsquakes and measure geothermal temperature gradients.',
      features: ['Seismic Marsquake Detector', 'Sub-Surface Heat Flow Probe', 'Atmospheric Weather Station', 'Robotic Arm Deployment'],
      difficulty: 'High',
    },
  ];

  const options = isMoon ? moonOptions : marsOptions;

  const handleModeClick = (id: string) => {
    setSelectedMode(id);
    sound.playClick(900, 0.05);
  };

  const handleConfirm = () => {
    sound.playConfirm();
    onSelectSubMode(selectedMode);
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
          <span>BACK TO DESTINATION SELECT</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            {isMoon ? 'LUNAR ARCHITECTURE SELECTION' : 'MARS ARCHITECTURE SELECTION'}
          </h2>
          <p className="text-[10px] text-slate-400 font-mono">CHOOSE EXPEDITION OPERATIONAL MODE</p>
        </div>

        <div className="text-xs font-mono text-cyan-400/80">
          DESTINATION: {isMoon ? 'MOON (SELENE)' : 'MARS (ARES)'}
        </div>
      </div>

      {/* Main Options Grid */}
      <div className="flex-1 flex flex-col justify-between p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
              SELECT MISSION DEPLOYMENT METHOD
            </h3>
            <p className="text-sm text-slate-400 font-sans max-w-2xl mx-auto">
              Different mission architectures require different spacecraft payloads, rocket launch capacities, operational skills, and risk profiles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {options.map((opt) => {
              const isSelected = opt.id === selectedMode;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleModeClick(opt.id)}
                  className={`cursor-pointer rounded-xl border p-6 flex flex-col justify-between transition-all duration-200 ${
                    isSelected
                      ? 'border-cyan-400 bg-space-850 shadow-cyan-glow transform scale-[1.02]'
                      : 'border-slate-800 bg-space-900/70 hover:bg-space-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-lg bg-space-800 border border-slate-700">
                        {opt.icon}
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          opt.difficulty === 'Moderate'
                            ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30'
                            : opt.difficulty === 'High'
                            ? 'border-amber-500/40 text-amber-400 bg-amber-950/30'
                            : 'border-purple-500/40 text-purple-400 bg-purple-950/30'
                        }`}
                      >
                        {opt.difficulty}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-base text-white tracking-wide">{opt.title}</h4>
                      <p className="text-xs text-cyan-300 font-mono mt-0.5">{opt.subtitle}</p>
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {opt.description}
                    </p>

                    <div className="border-t border-slate-800 pt-3">
                      <div className="text-[10px] font-mono text-slate-400 mb-2">KEY CAPABILITIES:</div>
                      <ul className="text-[11px] text-slate-300 space-y-1 font-mono">
                        {opt.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="text-cyan-400">✓</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Confirm Action */}
        <div className="max-w-5xl mx-auto w-full pt-6 border-t border-slate-800/80 flex items-center justify-between mt-6">
          <span className="text-xs text-slate-400 font-mono">
            CONFIGURATION READY // CLICK TO INITIALIZE WORKSHOP
          </span>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 px-8 py-3.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm tracking-wider hover:from-cyan-400 hover:to-blue-500 shadow-cyan-glow transition transform hover:scale-[1.02]"
          >
            <span>CONFIRM ARCHITECTURE & ASSEMBLE SPACECRAFT</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
