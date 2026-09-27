import React from 'react';
import { SensorData, SensorFaults, PresetConfig } from '../types/septic';
import { playSingleClick } from '../utils/audio';
import { Sliders, RotateCcw, ShieldAlert, Cpu, Radio, Play, Pause, Zap } from 'lucide-react';

interface ControlPanelProps {
  sensorData: SensorData;
  onUpdateSensorData: (updates: Partial<SensorData>) => void;
  faults: SensorFaults;
  onToggleFault: (key: keyof SensorFaults) => void;
  onApplyPreset: (preset: PresetConfig) => void;
  onReset: () => void;
  isSimPaused: boolean;
  onTogglePause: () => void;
}

const PRESETS: PresetConfig[] = [
  {
    id: 'normal',
    name: 'PRESET 1 — NORMAL',
    description: 'Optimal operating state, low gas & sludge',
    sludgeDepth: 35,
    scumThickness: 10,
    gasLevel: 50,
    growthRate: 2.5,
    status: 'NORMAL',
  },
  {
    id: 'monitor',
    name: 'PRESET 2 — MONITOR',
    description: 'Sludge accumulating, normal maintenance range',
    sludgeDepth: 55,
    scumThickness: 14,
    gasLevel: 70,
    growthRate: 3.0,
    status: 'MONITOR',
  },
  {
    id: 'warning',
    name: 'PRESET 3 — SERVICE WARNING',
    description: 'Sludge near 90cm threshold, plan pump-out',
    sludgeDepth: 75,
    scumThickness: 18,
    gasLevel: 85,
    growthRate: 4.0,
    status: 'SERVICE_PLANNING',
  },
  {
    id: 'gas_hazard',
    name: 'PRESET 4 — GAS HAZARD',
    description: 'Elevated Biogas >150 ppm, Interlock ACTIVE',
    sludgeDepth: 60,
    scumThickness: 15,
    gasLevel: 350,
    growthRate: 3.0,
    status: 'GAS_HAZARD',
  },
];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  sensorData,
  onUpdateSensorData,
  faults,
  onToggleFault,
  onApplyPreset,
  onReset,
  isSimPaused,
  onTogglePause,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-5 flex flex-col gap-5 shadow-xs">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Simulation Controls & Demo Presets
            </h3>
            <p className="text-[11px] text-slate-500">Real-time parameters, fault injection, and 1-click test scenarios</p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePause}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold flex items-center gap-1.5 transition ${
              isSimPaused ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isSimPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {isSimPaused ? 'RESUME SIM' : 'PAUSE SIM'}
          </button>

          <button
            onClick={onReset}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 text-xs font-mono font-semibold flex items-center gap-1.5 transition"
            title="Reset to default settings"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET
          </button>
        </div>
      </div>

      {/* 1-CLICK DEMO PRESET BUTTONS */}
      <div>
        <div className="text-[10px] font-mono uppercase text-slate-400 mb-2 font-semibold">
          1-CLICK DEMO PRESETS
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                playSingleClick();
                onApplyPreset(preset);
              }}
              className="p-3 bg-slate-50/80 hover:bg-slate-100 border border-slate-200/90 hover:border-slate-300 rounded-xl text-left transition flex flex-col justify-between group shadow-2xs"
            >
              <div className="text-xs font-bold text-slate-900 group-hover:text-teal-700">
                {preset.name}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                {preset.description}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-500">Sludge: {preset.sludgeDepth}cm</span>
                <span className={preset.gasLevel >= 150 ? 'text-red-600 font-bold' : 'text-emerald-700 font-semibold'}>
                  Gas: {preset.gasLevel}ppm
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* PARAMETER SLIDERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        {/* Sludge Depth Slider */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono text-slate-700 mb-1">
            <span>SLUDGE DEPTH</span>
            <b className="text-purple-700">{sensorData.sludgeDepth.toFixed(1)} cm</b>
          </div>
          <input
            type="range"
            min="5"
            max="115"
            step="1"
            value={sensorData.sludgeDepth}
            onChange={(e) => onUpdateSensorData({ sludgeDepth: parseFloat(e.target.value) })}
            className="w-full accent-purple-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>5 cm</span>
            <span>115 cm</span>
          </div>
        </div>

        {/* Scum Thickness Slider */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono text-slate-700 mb-1">
            <span>SCUM THICKNESS</span>
            <b className="text-amber-700">{sensorData.scumThickness.toFixed(1)} cm</b>
          </div>
          <input
            type="range"
            min="2"
            max="30"
            step="1"
            value={sensorData.scumThickness}
            onChange={(e) => onUpdateSensorData({ scumThickness: parseFloat(e.target.value) })}
            className="w-full accent-amber-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>2 cm</span>
            <span>30 cm</span>
          </div>
        </div>

        {/* Gas Concentration Slider */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono text-slate-700 mb-1">
            <span>MQ-2 BIOGAS CONCENTRATION</span>
            <b className={sensorData.gasLevel >= 150 ? 'text-red-600 font-bold' : 'text-emerald-700'}>
              {sensorData.gasLevel} ppm
            </b>
          </div>
          <input
            type="range"
            min="0"
            max="500"
            step="10"
            value={sensorData.gasLevel}
            onChange={(e) => onUpdateSensorData({ gasLevel: parseInt(e.target.value) })}
            className="w-full accent-red-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>0 ppm (Safe)</span>
            <span>150ppm (Limit)</span>
            <span>500 ppm (Danger)</span>
          </div>
        </div>

        {/* Battery Level Slider */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono text-slate-700 mb-1">
            <span>NODE BATTERY LEVEL</span>
            <b className={sensorData.batteryPct <= 20 ? 'text-amber-700 font-bold' : 'text-emerald-700'}>
              {sensorData.batteryPct}%
            </b>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={sensorData.batteryPct}
            onChange={(e) => onUpdateSensorData({ batteryPct: parseInt(e.target.value) })}
            className="w-full accent-emerald-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>0% (Empty)</span>
            <span>100% (Full)</span>
          </div>
        </div>
      </div>

      {/* HARDWARE FAULT INJECTION TOGGLES */}
      <div>
        <div className="text-[10px] font-mono uppercase text-slate-400 mb-2 font-semibold flex items-center justify-between">
          <span>SIMULATED HARDWARE FAULT INJECTION</span>
          <span className="text-[10px] text-slate-400 font-normal">Test sensor failure handling</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => onToggleFault('ultrasonicFailed')}
            className={`p-2.5 rounded-xl border text-xs font-mono text-left transition flex items-center justify-between ${
              faults.ultrasonicFailed
                ? 'bg-red-50 border-red-300 text-red-800 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" /> Ultrasonic Fail
            </span>
            <b className="text-[10px] uppercase">{faults.ultrasonicFailed ? 'ACTIVE' : 'OFF'}</b>
          </button>

          <button
            onClick={() => onToggleFault('gasFailed')}
            className={`p-2.5 rounded-xl border text-xs font-mono text-left transition flex items-center justify-between ${
              faults.gasFailed
                ? 'bg-red-50 border-red-300 text-red-800 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> MQ-2 Fail
            </span>
            <b className="text-[10px] uppercase">{faults.gasFailed ? 'ACTIVE' : 'OFF'}</b>
          </button>

          <button
            onClick={() => onToggleFault('layerSensorFailed')}
            className={`p-2.5 rounded-xl border text-xs font-mono text-left transition flex items-center justify-between ${
              faults.layerSensorFailed
                ? 'bg-red-50 border-red-300 text-red-800 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Layer Probe Fail
            </span>
            <b className="text-[10px] uppercase">{faults.layerSensorFailed ? 'ACTIVE' : 'OFF'}</b>
          </button>

          <button
            onClick={() => onToggleFault('esp32Offline')}
            className={`p-2.5 rounded-xl border text-xs font-mono text-left transition flex items-center justify-between ${
              faults.esp32Offline
                ? 'bg-red-50 border-red-300 text-red-800 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> ESP32 Disconnect
            </span>
            <b className="text-[10px] uppercase">{faults.esp32Offline ? 'ACTIVE' : 'OFF'}</b>
          </button>
        </div>
      </div>
    </div>
  );
};
