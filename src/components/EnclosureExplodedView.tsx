import React from 'react';
import { ShieldCheck, Zap, Layers, Lock } from 'lucide-react';

export const EnclosureExplodedView: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-6 flex flex-col gap-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Sealed Housing Design & Exploded Assembly
            </h3>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              IP67 CORROSION-RESISTANT
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Engineered enclosure built for biologically aggressive, highly corrosive septic headspace atmospheres (H2S, CH4)
          </p>
        </div>
      </div>

      {/* Exploded Diagram Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col gap-6 shadow-2xs relative overflow-hidden">
        {/* Callout Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-white border border-slate-200 rounded-xl text-center shadow-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <b className="text-slate-900 block">CHEMICALLY RESISTANT HOUSING</b>
            <span className="text-[10px] text-slate-500">UV-Stabilized Polycarbonate</span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl text-center shadow-xs">
            <Lock className="w-5 h-5 text-red-600 mx-auto mb-1" />
            <b className="text-slate-900 block">SEALED ELECTRONICS</b>
            <span className="text-[10px] text-slate-500">Silicone O-Ring Gasket</span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl text-center shadow-xs">
            <Zap className="w-5 h-5 text-amber-600 mx-auto mb-1" />
            <b className="text-slate-900 block">PROTECTED SENSOR WINDOW</b>
            <span className="text-[10px] text-slate-500">Hydrophobic Acoustic Membrane</span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl text-center shadow-xs">
            <Layers className="w-5 h-5 text-sky-600 mx-auto mb-1" />
            <b className="text-slate-900 block">CABLE GLAND</b>
            <span className="text-[10px] text-slate-500">PG9 Strain-Relief Seal</span>
          </div>
        </div>

        {/* Exploded Flow Diagram */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[10px] font-mono uppercase text-slate-400 mb-4 font-semibold">
            EXPLODED LAYER STACKUP (OUTER TO INNER)
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-center text-xs font-mono">
            <div className="flex-1 min-w-[120px] p-3 bg-slate-50 border border-emerald-200 rounded-xl">
              <span className="text-[9px] text-slate-400 block font-semibold">LAYER 1</span>
              <b className="text-emerald-800">Outer Enclosure Shell</b>
            </div>

            <div className="text-slate-400 font-bold">→</div>

            <div className="flex-1 min-w-[120px] p-3 bg-slate-50 border border-red-200 rounded-xl">
              <span className="text-[9px] text-slate-400 block font-semibold">LAYER 2</span>
              <b className="text-red-800">High-Temp Rubber Seal</b>
            </div>

            <div className="text-slate-400 font-bold">→</div>

            <div className="flex-1 min-w-[120px] p-3 bg-slate-50 border border-sky-200 rounded-xl">
              <span className="text-[9px] text-slate-400 block font-semibold">LAYER 3</span>
              <b className="text-sky-800">Sensor Signal Board</b>
            </div>

            <div className="text-slate-400 font-bold">→</div>

            <div className="flex-1 min-w-[120px] p-3 bg-slate-50 border border-purple-200 rounded-xl">
              <span className="text-[9px] text-slate-400 block font-semibold">LAYER 4</span>
              <b className="text-purple-800">ESP32 Core & LoRa</b>
            </div>

            <div className="text-slate-400 font-bold">→</div>

            <div className="flex-1 min-w-[120px] p-3 bg-slate-50 border border-amber-200 rounded-xl">
              <span className="text-[9px] text-slate-400 block font-semibold">LAYER 5</span>
              <b className="text-amber-800">LiFePO4 Power Pack</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
