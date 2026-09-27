import React from 'react';
import { ShieldCheck, Cpu, Zap, Activity, X } from 'lucide-react';

interface TechnicalHonestyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechnicalHonestyModal: React.FC<TechnicalHonestyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Technical Honesty & System Disclosure
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-mono">
          To ensure strict engineering integrity for hackathon & competition evaluation, this digital twin clearly distinguishes between physical prototype hardware, conceptual expandable probes, and simulated software layers.
        </p>

        {/* 3 Categories Grid */}
        <div className="space-y-3 text-xs font-mono">
          {/* Real Hardware */}
          <div className="p-3 bg-slate-50 border border-emerald-200 rounded-xl">
            <div className="text-emerald-800 font-bold uppercase mb-1 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-600" /> 1. REAL PROTOTYPE HARDWARE
            </div>
            <p className="text-slate-600">
              ESP32 Microcontroller, Waterproof JSN-SR04T Ultrasonic Distance Transducer, MQ-2 Biogas Sensor, Status LEDs, Piezo Buzzer.
            </p>
          </div>

          {/* Conceptual Hardware */}
          <div className="p-3 bg-slate-50 border border-amber-200 rounded-xl">
            <div className="text-amber-800 font-bold uppercase mb-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600" /> 2. CONCEPTUAL / ADVANCED HARDWARE
            </div>
            <p className="text-slate-600">
              Multi-sensor layer detection stem (capacitive/ToF array), IP67 chemically resistant enclosure, long-life LiFePO4 battery pack, LoRa RF long-range module.
            </p>
          </div>

          {/* Simulated Software */}
          <div className="p-3 bg-slate-50 border border-teal-200 rounded-xl">
            <div className="text-teal-800 font-bold uppercase mb-1 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-600" /> 3. SIMULATED SOFTWARE & ANALYTICS
            </div>
            <p className="text-slate-600">
              Time-series historical readings, sludge growth trend modeling, service prediction calculations, municipal route planning concept, 3D WebGL stratification visualization.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-mono font-bold transition"
          >
            I UNDERSTAND & ACKNOWLEDGE
          </button>
        </div>
      </div>
    </div>
  );
};
