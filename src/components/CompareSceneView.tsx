import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

export const CompareSceneView: React.FC = () => {
  const [activeScene, setActiveScene] = useState<'BOTH' | 'SCENE_A' | 'SCENE_B'>('BOTH');

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-6 flex flex-col gap-6 shadow-xs">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Existing Approach vs Smart Digital Twin Solution
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Transitioning from reactive emergency pump-outs to predictive municipal route planning
          </p>
        </div>

        {/* View Segmented Control */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-mono font-medium">
          <button
            onClick={() => setActiveScene('BOTH')}
            className={`px-3 py-1 rounded transition ${
              activeScene === 'BOTH' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            SIDE-BY-SIDE
          </button>
          <button
            onClick={() => setActiveScene('SCENE_A')}
            className={`px-3 py-1 rounded transition ${
              activeScene === 'SCENE_A' ? 'bg-red-50 text-red-700 font-bold border border-red-200 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            SCENE A (EXISTING)
          </button>
          <button
            onClick={() => setActiveScene('SCENE_B')}
            className={`px-3 py-1 rounded transition ${
              activeScene === 'SCENE_B' ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            SCENE B (OUR SOLUTION)
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SCENE A: EXISTING SYSTEM */}
        {(activeScene === 'BOTH' || activeScene === 'SCENE_A') && (
          <div className="bg-slate-50 border border-red-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3.5 py-1 bg-red-100 border-b border-l border-red-200 text-red-800 text-[10px] font-mono font-bold tracking-wider uppercase rounded-bl-xl">
              REACTIVE MAINTENANCE
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h4 className="text-sm font-bold text-slate-900">SCENE A — EXISTING APPROACH</h4>
              </div>
              <p className="text-xs text-slate-600 mb-5">
                Unmonitored traditional septic tank with high risk of unexpected backing up, hazardous manual checks, and emergency call-outs.
              </p>

              {/* Step-by-Step Flow */}
              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0 border border-slate-200">1</span>
                  <span>Unmonitored Septic Tank in Ground</span>
                </div>
                <div className="text-center text-slate-400"><ArrowRight className="w-3.5 h-3.5 mx-auto rotate-90" /></div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                  <span>No Continuous Monitoring or Sludge Visibility</span>
                </div>
                <div className="text-center text-slate-400"><ArrowRight className="w-3.5 h-3.5 mx-auto rotate-90" /></div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-800 border border-red-200 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                  <span>Sludge Overflow & Tank Backup Crisis</span>
                </div>
                <div className="text-center text-slate-400"><ArrowRight className="w-3.5 h-3.5 mx-auto rotate-90" /></div>

                <div className="p-2.5 bg-red-100/60 rounded-xl border border-red-200 flex items-center gap-3 text-red-900 font-medium">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">4</span>
                  <span>Emergency Response & Hazardous Manual Inspection</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-200 text-[11px] font-mono text-slate-600 space-y-1">
              <div className="text-red-700 font-bold">• High risk of toxic gas exposure (H2S/CH4)</div>
              <div>• Expensive reactive emergency pump-out rates</div>
              <div>• Unpredictable tanker truck dispatching</div>
            </div>
          </div>
        )}

        {/* SCENE B: OUR SOLUTION */}
        {(activeScene === 'BOTH' || activeScene === 'SCENE_B') && (
          <div className="bg-slate-50 border border-emerald-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3.5 py-1 bg-emerald-100 border-b border-l border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold tracking-wider uppercase rounded-bl-xl">
              PREDICTIVE DIGITAL TWIN
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">SCENE B — PROPOSED SMART MONITORING SYSTEM</h4>
              </div>
              <p className="text-xs text-slate-600 mb-5">
                ESP32 smart node with ultrasonic ToF & MQ-2 gas warning, continuous sludge growth forecasting, and planned municipal servicing.
              </p>

              {/* Step-by-Step Flow */}
              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                  <span>IP67 Sensor Probe Installed through Inspection Lid</span>
                </div>
                <div className="text-center text-slate-400"><ArrowRight className="w-3.5 h-3.5 mx-auto rotate-90" /></div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                  <span>ESP32 Continuous ToF Depth & Gas Sampling</span>
                </div>
                <div className="text-center text-slate-400"><ArrowRight className="w-3.5 h-3.5 mx-auto rotate-90" /></div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                  <span>Historical Data & Sludge Growth Forecasting</span>
                </div>
                <div className="text-center text-slate-400"><ArrowRight className="w-3.5 h-3.5 mx-auto rotate-90" /></div>

                <div className="p-2.5 bg-emerald-100/60 rounded-xl border border-emerald-200 flex items-center gap-3 text-emerald-900 font-medium">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">4</span>
                  <span>Predicted Service Period & Optimized Route Emptying</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-200 text-[11px] font-mono text-slate-600 space-y-1">
              <div className="text-emerald-700 font-bold">• MQ-2 Gas warning + Safety cover interlock</div>
              <div>• Predicts servicing months ahead of time</div>
              <div>• Grouped municipal route planning</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
