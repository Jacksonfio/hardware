import React, { useState, useEffect } from 'react';
import { SensorData } from '../types/septic';
import { playSingleClick } from '../utils/audio';
import { Play, Pause, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

export const DEMO_STEPS = [
  { step: 1, title: 'Step 1 — Show Existing Septic Tank', desc: 'Displaying 3D cross-section of raw septic tank with scum, wastewater liquid, and sludge layers.' },
  { step: 2, title: 'Step 2 — Identify Problem', desc: 'Problem Statement: Traditional septic tanks have zero continuous predictive monitoring, leading to sudden overflows & emergency pump-outs.' },
  { step: 3, title: 'Step 3 — Install Sensor Assembly', desc: 'Plunging IP67 stainless sensor probe through the existing inspection cover.' },
  { step: 4, title: 'Step 4 — Initialize ESP32 & MQ-2 Node', desc: 'Powering up ESP32 microcontroller, waterproof ultrasonic transducer, and MQ-2 gas warning sensor.' },
  { step: 5, title: 'Step 5 — Start Live Telemetry Sampling', desc: 'Capturing real-time acoustic echo pulses and gas concentrations every 2000ms.' },
  { step: 6, title: 'Step 6 — Simulate Sludge Buildup', desc: 'Simulating gradual biological sludge growth over time (+3.0 cm/week).' },
  { step: 7, title: 'Step 7 — Generate Historical Growth Graph', desc: 'Plotting time-series measurements on interactive trend analysis chart.' },
  { step: 8, title: 'Step 8 — Calculate Predicted Service Window', desc: 'Computing ordinary least squares projection: ~14 Weeks remaining until 90cm threshold.' },
  { step: 9, title: 'Step 9 — Elevate Gas Concentration', desc: 'Simulating methane & hydrogen sulfide gas buildup in tank headspace (>150 ppm).' },
  { step: 10, title: 'Step 10 — Trigger Warning & Safety Interlock', desc: 'Activating Red LED, Piezo Alarm Buzzer, and flashing hazard warning banner!' },
  { step: 11, title: 'Step 11 — Lock Inspection Cover', desc: 'Software safety interlock prevents operator from opening cover during gas hazard.' },
  { step: 12, title: 'Step 12 — Return to Normal State', desc: 'Clearing gas atmosphere, restoring Green LED, enabling safe maintenance procedure.' },
];

interface GuidedPresentationProps {
  onUpdateSensorData: (updates: Partial<SensorData>) => void;
  onSetViewTab: (tab: any) => void;
  onOpenCover: () => void;
  onCloseCover: () => void;
  onEndPresentation: () => void;
}

export const GuidedPresentation: React.FC<GuidedPresentationProps> = ({
  onUpdateSensorData,
  onSetViewTab,
  onOpenCover,
  onCloseCover,
  onEndPresentation,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const step = DEMO_STEPS[currentStepIndex];

  useEffect(() => {
    switch (step.step) {
      case 1:
        onSetViewTab('DIGITAL_TWIN');
        onCloseCover();
        onUpdateSensorData({ sludgeDepth: 35, gasLevel: 45, scumThickness: 10 });
        break;
      case 2:
        onSetViewTab('COMPARE');
        break;
      case 3:
      case 4:
      case 5:
        onSetViewTab('DIGITAL_TWIN');
        onUpdateSensorData({ sludgeDepth: 40, gasLevel: 60 });
        break;
      case 6:
        onUpdateSensorData({ sludgeDepth: 65, growthRateWeeks: 3.5 });
        break;
      case 7:
      case 8:
        onSetViewTab('ANALYTICS');
        onUpdateSensorData({ sludgeDepth: 75, growthRateWeeks: 3.0 });
        break;
      case 9:
      case 10:
      case 11:
        onSetViewTab('DIGITAL_TWIN');
        onUpdateSensorData({ gasLevel: 320 });
        break;
      case 12:
        onUpdateSensorData({ gasLevel: 50, sludgeDepth: 35 });
        break;
      default:
        break;
    }
  }, [currentStepIndex]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < DEMO_STEPS.length - 1) return prev + 1;
        setIsPlaying(false);
        return prev;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className="bg-white border-2 border-teal-500 rounded-2xl p-4 md:p-5 flex flex-col gap-4 shadow-md relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold border border-teal-200">
            <Sparkles className="w-4 h-4 animate-spin text-teal-600" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Automated Guided Demonstration Tour
            </div>
            <div className="text-[10px] font-mono text-slate-500">Step {currentStepIndex + 1} of 12</div>
          </div>
        </div>

        {/* Step Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playSingleClick();
              setCurrentStepIndex((p) => Math.max(0, p - 1));
            }}
            disabled={currentStepIndex === 0}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-lg text-xs font-mono"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1 shadow-xs"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'PAUSE TOUR' : 'RESUME TOUR'}
          </button>

          <button
            onClick={() => {
              playSingleClick();
              setCurrentStepIndex((p) => Math.min(DEMO_STEPS.length - 1, p + 1));
            }}
            disabled={currentStepIndex === DEMO_STEPS.length - 1}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-lg text-xs font-mono"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={onEndPresentation}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-mono font-bold ml-2 border border-slate-200"
          >
            EXIT TOUR
          </button>
        </div>
      </div>

      {/* Active Step Box */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
        <p className="text-xs text-slate-600 mt-1">{step.desc}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-teal-600 h-full transition-all duration-500"
          style={{ width: `${((currentStepIndex + 1) / DEMO_STEPS.length) * 100}%` }}
        />
      </div>

      {/* Final Summary Banner at end of tour */}
      {currentStepIndex === DEMO_STEPS.length - 1 && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-bold text-emerald-800 uppercase tracking-widest animate-pulse">
          MONITOR → PREDICT → WARN → PLAN
        </div>
      )}
    </div>
  );
};
