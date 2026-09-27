import React from 'react';
import { Cpu, Radio, ShieldAlert, Zap, Volume2, Wifi, Truck, ArrowRight } from 'lucide-react';

export const DataFlowView: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-6 flex flex-col gap-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            ESP32 End-to-End Data Flow & Pipeline Architecture
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Animated signal propagation from physical sensors through ESP32 microcontroller to municipal operator cloud
          </p>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          ACTIVE TRANSMISSION PIPELINE
        </span>
      </div>

      {/* Animated Pipeline Diagram */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6 relative overflow-hidden grid-blueprint">
        {/* Layer 1: Sensors Input */}
        <div>
          <div className="text-[10px] font-mono uppercase text-slate-400 mb-3 font-semibold">1. PHYSICAL SENSORS INPUT STAGE</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-xl font-mono text-xs flex items-center gap-3 relative shadow-xs">
              <Radio className="w-4 h-4 text-teal-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900">ULTRASONIC ToF</div>
                <div className="text-[10px] text-slate-500">Echo Pulse Width (40kHz)</div>
              </div>
              <div className="absolute right-2 top-2 w-2 h-2 rounded-full bg-teal-500 animate-ping" />
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl font-mono text-xs flex items-center gap-3 relative shadow-xs">
              <Zap className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900">CONCEPTUAL LAYER PROBE</div>
                <div className="text-[10px] text-slate-500">Capacitive Stratification (I2C)</div>
              </div>
              <div className="absolute right-2 top-2 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl font-mono text-xs flex items-center gap-3 relative shadow-xs">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900">MQ-2 BIOGAS SENSOR</div>
                <div className="text-[10px] text-slate-500">Analog Voltage Signal (A0)</div>
              </div>
              <div className="absolute right-2 top-2 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            </div>
          </div>
        </div>

        {/* Down Arrow Flow */}
        <div className="flex justify-center my-1 text-teal-600 animate-bounce">
          <ArrowRight className="w-5 h-5 rotate-90" />
        </div>

        {/* Layer 2: ESP32 Central Controller */}
        <div className="p-4 bg-white border-2 border-emerald-500/60 rounded-2xl relative shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">ESP32 DUAL-CORE CONTROLLER NODE</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">240 MHz FreeRTOS</span>
          </div>
          <p className="text-xs text-slate-600 font-mono">
            Processes acoustic echo flight time, calculates layer depths, evaluates MQ-2 gas thresholds, controls LEDs & buzzer safety interlock.
          </p>

          {/* Animated Internal Bus Packet */}
          <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-800 flex items-center justify-between">
            <span>PACKET PAYLOAD: &#123; sludge: 48.2cm, gas: 75ppm, bat: 92% &#125;</span>
            <span className="animate-pulse font-bold text-teal-700">TX CRC-32 VALID</span>
          </div>
        </div>

        {/* Down Arrow Flow */}
        <div className="flex justify-center my-1 text-teal-600 animate-bounce">
          <ArrowRight className="w-5 h-5 rotate-90" />
        </div>

        {/* Layer 3: Local Annunciators & Remote LoRa Cloud */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-white border border-slate-200 rounded-xl font-mono text-xs shadow-xs">
            <div className="font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Volume2 className="w-4 h-4 text-amber-600" /> LOCAL ANNUNCIATORS
            </div>
            <div className="text-[10px] text-slate-500">Green / Red LEDs, Piezo Buzzer & Cover Interlock Lock</div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl font-mono text-xs shadow-xs">
            <div className="font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Wifi className="w-4 h-4 text-sky-600" /> LoRa / CLOUD TELEMETRY
            </div>
            <div className="text-[10px] text-slate-500">SX1276 868MHz packet uplink to Gateway</div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl font-mono text-xs shadow-xs">
            <div className="font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Truck className="w-4 h-4 text-purple-600" /> MUNICIPAL DASHBOARD
            </div>
            <div className="text-[10px] text-slate-500">Sludge growth trend forecasting & route planning</div>
          </div>
        </div>
      </div>
    </div>
  );
};
