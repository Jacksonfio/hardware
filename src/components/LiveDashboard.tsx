import React from 'react';
import { SensorData, SensorFaults } from '../types/septic';
import { Activity, Battery, Radio, ShieldAlert, Cpu, Layers, HardDrive, Wifi, Zap } from 'lucide-react';

interface LiveDashboardProps {
  sensorData: SensorData;
  faults: SensorFaults;
}

export const LiveDashboard: React.FC<LiveDashboardProps> = ({ sensorData, faults }) => {
  const isGasHazard = sensorData.gasLevel >= 150 || faults.gasFailed;
  const isSludgeWarning = sensorData.sludgeDepth >= 70;
  const isSludgeCritical = sensorData.sludgeDepth >= 90;

  const sludgePct = Math.min(100, Math.round((sensorData.sludgeDepth / sensorData.serviceThreshold) * 100));

  let systemStatusText = 'NORMAL';
  let systemStatusBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (faults.esp32Offline) {
    systemStatusText = 'SYSTEM OFFLINE';
    systemStatusBg = 'bg-slate-100 text-slate-600 border-slate-200';
  } else if (isGasHazard) {
    systemStatusText = 'GAS HAZARD DETECTED';
    systemStatusBg = 'bg-red-50 text-red-700 border-red-200 animate-pulse font-bold';
  } else if (isSludgeCritical) {
    systemStatusText = 'SERVICE REQUIRED';
    systemStatusBg = 'bg-red-50 text-red-700 border-red-200';
  } else if (isSludgeWarning) {
    systemStatusText = 'MONITORING CLOSELY';
    systemStatusBg = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-5 flex flex-col gap-4 shadow-xs">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60 shadow-xs">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Live ESP32 Telemetry Dashboard
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-medium">
                SIMULATION DATA
              </span>
            </div>
            <p className="text-[11px] text-slate-500">ESP32-WROOM-32 Node #01 • Stratification & Gas Measurement</p>
          </div>
        </div>

        {/* System Status Badge */}
        <div className={`px-3 py-1 rounded-lg border text-xs font-mono font-semibold flex items-center gap-2 ${systemStatusBg}`}>
          <span className={`w-2 h-2 rounded-full ${isGasHazard ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
          {systemStatusText}
        </div>
      </div>

      {/* Grid of Key Telemetry Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Scum Depth */}
        <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
          <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between font-medium">
            <span>Scum (F.O.G.)</span>
            <Layers className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-mono font-bold text-amber-800 mt-1">
            {faults.layerSensorFailed ? 'N/A' : `${sensorData.scumThickness.toFixed(1)} cm`}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Top crust layer</div>
        </div>

        {/* Liquid Depth */}
        <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
          <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between font-medium">
            <span>Liquid Effluent</span>
            <HardDrive className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-xl font-mono font-bold text-teal-800 mt-1">
            {sensorData.liquidDepth.toFixed(1)} cm
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Clarified water</div>
        </div>

        {/* Sludge Depth */}
        <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
          <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between font-medium">
            <span>Sludge Depth</span>
            <Layers className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className={`text-xl font-mono font-bold mt-1 ${faults.ultrasonicFailed ? 'text-red-600' : 'text-[#452d13]'}`}>
            {faults.ultrasonicFailed ? 'INVALID' : `${sensorData.sludgeDepth.toFixed(1)} cm`}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Settled solids</div>
        </div>

        {/* Sludge % Capacity */}
        <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
          <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between font-medium">
            <span>Sludge %</span>
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className={`text-xl font-mono font-bold mt-1 ${sludgePct >= 100 ? 'text-red-600' : sludgePct >= 75 ? 'text-amber-700' : 'text-emerald-700'}`}>
            {faults.ultrasonicFailed ? 'ERR' : `${sludgePct}%`}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Of 90cm threshold</div>
        </div>
      </div>

      {/* Gas & Node Status Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Gas Measurement */}
        <div className={`p-3 rounded-xl border ${isGasHazard ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200/80'}`}>
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldAlert className={`w-3.5 h-3.5 ${isGasHazard ? 'text-red-600' : 'text-emerald-600'}`} />
              MQ-2 Biogas (CH4/H2S)
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isGasHazard ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-800'}`}>
              {faults.gasFailed ? 'UNKNOWN' : isGasHazard ? 'HAZARD' : 'SAFE'}
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-2xl font-mono font-bold ${isGasHazard ? 'text-red-700' : 'text-slate-900'}`}>
              {faults.gasFailed ? 'ERR' : `${sensorData.gasLevel} ppm`}
            </span>
            <span className="text-xs text-slate-400 font-mono">Limit: 150 ppm</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            * MQ-2 Demonstration Gas Sensor
          </div>
        </div>

        {/* Ultrasonic ToF Distance */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <Radio className="w-3.5 h-3.5 text-teal-600" />
              Ultrasonic ToF
            </span>
            <span className="text-[10px] font-mono text-teal-600 font-medium">40kHz Pulse</span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-mono font-bold text-slate-900">
              {faults.ultrasonicFailed ? 'ERR' : `${sensorData.ultrasonicDistance.toFixed(1)} cm`}
            </span>
            <span className="text-xs text-slate-400 font-mono">Headspace Gap</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            Flight time: {((sensorData.ultrasonicDistance * 2) / 34.3).toFixed(2)} ms
          </div>
        </div>

        {/* ESP32 Controller & LoRa Connectivity */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
              Node Hardware
            </span>
            <span className={`text-[10px] font-mono font-semibold ${faults.esp32Offline ? 'text-red-600' : 'text-emerald-700'}`}>
              {faults.esp32Offline ? 'OFFLINE' : 'ONLINE'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Battery className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bat: <b>{sensorData.batteryPct}%</b></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Wifi className="w-3.5 h-3.5 text-sky-600" />
              <span>LoRa: <b>{faults.loraFailed ? 'FAIL' : 'ONLINE'}</b></span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center justify-between">
            <span>TX Power: +14 dBm</span>
            <span>RSSI: -68 dBm</span>
          </div>
        </div>
      </div>

      {/* Technical Honesty Breakdown Footer */}
      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-600 gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1 text-slate-700">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <b className="text-emerald-800">Real Hardware:</b> ESP32, Ultrasonic, MQ-2, Buzzer, LEDs
          </span>
          <span className="flex items-center gap-1 text-slate-700">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <b className="text-amber-800">Conceptual:</b> Multi-Sensor Layer Assembly
          </span>
        </div>
        <span className="text-slate-400">Software Simulation • Non-Certified Demo</span>
      </div>
    </div>
  );
};
