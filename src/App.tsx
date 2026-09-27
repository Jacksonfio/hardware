import React, { useState, useEffect } from 'react';
import { SensorData, SensorFaults, ViewTab, PresetConfig } from './types/septic';
import { SepticTank3D } from './components/SepticTank3D';
import { LiveDashboard } from './components/LiveDashboard';
import { SludgeGraph } from './components/SludgeGraph';
import { ControlPanel } from './components/ControlPanel';
import { HardwareBoardView } from './components/HardwareBoardView';
import { CompareSceneView } from './components/CompareSceneView';
import { MunicipalRouteView } from './components/MunicipalRouteView';
import { DataFlowView } from './components/DataFlowView';
import { EnclosureExplodedView } from './components/EnclosureExplodedView';
import { GuidedPresentation } from './components/GuidedPresentation';
import { GasHazardBanner } from './components/GasHazardBanner';
import { SafetyInterlockModal } from './components/SafetyInterlockModal';
import { TechnicalHonestyModal } from './components/TechnicalHonestyModal';
import { startBuzzer, stopBuzzer, setBuzzerMuted, playSingleClick } from './utils/audio';
import { Box, TrendingUp, Cpu, RefreshCw, Truck, Activity, Volume2, VolumeX, Sparkles, ShieldCheck, Layers } from 'lucide-react';

export default function App() {
  const [sensorData, setSensorData] = useState<SensorData>({
    sludgeDepth: 48,
    scumThickness: 12,
    liquidDepth: 94,
    totalTankHeight: 180,
    gasLevel: 75,
    ultrasonicDistance: 43,
    batteryPct: 87,
    growthRateWeeks: 3.0,
    serviceThreshold: 90,
    timestamp: new Date().toLocaleTimeString(),
  });

  const [faults, setFaults] = useState<SensorFaults>({
    ultrasonicFailed: false,
    gasFailed: false,
    layerSensorFailed: false,
    esp32Offline: false,
    loraFailed: false,
  });

  const [activeTab, setActiveTab] = useState<ViewTab>('DIGITAL_TWIN');
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const [isInterlockModalOpen, setIsInterlockModalOpen] = useState(false);
  const [isHonestyModalOpen, setIsHonestyModalOpen] = useState(false);
  const [explodedHousingMode, setExplodedHousingMode] = useState(false);
  const [isSimPaused, setIsSimPaused] = useState(false);
  const [isGuidedDemoActive, setIsGuidedDemoActive] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const isGasHazard = sensorData.gasLevel >= 150;
    if (isGasHazard && !isMuted) {
      startBuzzer();
    } else {
      stopBuzzer();
    }
  }, [sensorData.gasLevel, isMuted]);

  useEffect(() => {
    if (isSimPaused) return;

    const interval = setInterval(() => {
      setSensorData((prev) => {
        const jitterGas = Math.floor((Math.random() - 0.48) * 2);
        const newGas = Math.max(10, Math.min(500, prev.gasLevel + jitterGas));

        const totalHeight = prev.totalTankHeight;
        const currentTotalWaste = prev.sludgeDepth + prev.scumThickness + prev.liquidDepth;
        const ultrasonicDist = Math.max(15, totalHeight - currentTotalWaste);

        return {
          ...prev,
          gasLevel: newGas,
          ultrasonicDistance: ultrasonicDist,
          timestamp: new Date().toLocaleTimeString(),
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimPaused]);

  const handleUpdateSensorData = (updates: Partial<SensorData>) => {
    setSensorData((prev) => {
      const next = { ...prev, ...updates };
      const totalHeight = next.totalTankHeight;
      const liquid = Math.max(5, totalHeight - next.sludgeDepth - next.scumThickness - 20);
      const uDist = Math.max(15, totalHeight - (next.sludgeDepth + next.scumThickness + liquid));
      return {
        ...next,
        liquidDepth: liquid,
        ultrasonicDistance: uDist,
      };
    });
  };

  const handleToggleFault = (key: keyof SensorFaults) => {
    playSingleClick();
    setFaults((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApplyPreset = (preset: PresetConfig) => {
    handleUpdateSensorData({
      sludgeDepth: preset.sludgeDepth,
      scumThickness: preset.scumThickness,
      gasLevel: preset.gasLevel,
      growthRateWeeks: preset.growthRate,
    });
    setFaults({
      ultrasonicFailed: false,
      gasFailed: false,
      layerSensorFailed: false,
      esp32Offline: false,
      loraFailed: false,
    });
  };

  const handleReset = () => {
    playSingleClick();
    setSensorData({
      sludgeDepth: 48,
      scumThickness: 12,
      liquidDepth: 94,
      totalTankHeight: 180,
      gasLevel: 75,
      ultrasonicDistance: 43,
      batteryPct: 87,
      growthRateWeeks: 3.0,
      serviceThreshold: 90,
      timestamp: new Date().toLocaleTimeString(),
    });
    setFaults({
      ultrasonicFailed: false,
      gasFailed: false,
      layerSensorFailed: false,
      esp32Offline: false,
      loraFailed: false,
    });
    setIsCoverOpen(false);
    setExplodedHousingMode(false);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setBuzzerMuted(nextMuted);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-900">
      {/* TOP CLINICAL TELEMETRY HEADER BAR */}
      <header className="bg-white border-b border-slate-200 text-xs text-slate-600 py-2 px-5 flex flex-wrap items-center justify-between gap-3 shadow-xs z-30">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            STREAMING REAL-TIME TELEMETRY
          </span>
          <span className="hidden md:inline text-slate-300">|</span>
          <span className="hidden md:flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
            <Activity className="w-3.5 h-3.5 text-slate-400" /> ESP32-WROOM-32 NODE #01 (Firmware v2.4.12)
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
            <span className="text-slate-400">SAMPLE INTERVAL:</span>
            <span className="font-bold text-slate-700">2,000 ms</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
            <span className="text-slate-400">PACKET TX:</span>
            <span className="font-bold text-emerald-600">4,818 PKTS</span>
          </div>
        </div>
      </header>

      {/* NAVIGATION BAR WITH CLEAN LIGHT PAGE TABS */}
      <nav className="bg-white border-b border-slate-200 px-5 pt-3 pb-0 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 pb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/15">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base font-bold tracking-tight text-slate-900">
                  Septic Tank 3D Digital Twin
                </h1>
                <span className="text-[10px] font-mono uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-semibold">
                  Live Monitoring
                </span>
                <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Sensor Online
                </span>
              </div>
              <p className="text-xs text-slate-500">Bio-Sediment Stratification • Acoustic Echogram & Electrochemical Gas Measurement</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pb-2">
            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-lg border transition ${
                isMuted ? 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
              title={isMuted ? 'Unmute Audio Alarm' : 'Mute Audio Alarm'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsHonestyModalOpen(true)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Technical Honesty</span>
            </button>

            <button
              onClick={() => {
                playSingleClick();
                setIsGuidedDemoActive(!isGuidedDemoActive);
              }}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>{isGuidedDemoActive ? 'EXIT DEMO' : 'START DEMO'}</span>
            </button>
          </div>
        </div>

        {/* INDIVIDUAL PAGE TABS */}
        <div className="flex items-center gap-1 mt-1 overflow-x-auto text-xs font-medium border-t border-slate-100 pt-1">
          <button
            onClick={() => { playSingleClick(); setActiveTab('DIGITAL_TWIN'); }}
            className={`px-4 py-2 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'DIGITAL_TWIN'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Box className="w-4 h-4" /> 3D Digital Twin (Active)
          </button>

          <button
            onClick={() => { playSingleClick(); setActiveTab('ANALYTICS'); }}
            className={`px-4 py-2 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'ANALYTICS'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Predictive Growth Analytics
          </button>

          <button
            onClick={() => { playSingleClick(); setActiveTab('HARDWARE'); }}
            className={`px-4 py-2 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'HARDWARE'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Cpu className="w-4 h-4" /> Hardware Node & Annunciators
          </button>

          <button
            onClick={() => { playSingleClick(); setActiveTab('COMPARE'); }}
            className={`px-4 py-2 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'COMPARE'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <RefreshCw className="w-4 h-4" /> Compare Solutions
          </button>

          <button
            onClick={() => { playSingleClick(); setActiveTab('MUNICIPAL'); }}
            className={`px-4 py-2 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'MUNICIPAL'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Truck className="w-4 h-4" /> Municipal Route Planning
          </button>

          <button
            onClick={() => { playSingleClick(); setActiveTab('DATA_FLOW'); }}
            className={`px-4 py-2 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'DATA_FLOW'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Activity className="w-4 h-4" /> Telemetry Architecture
          </button>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-4 md:p-6 max-w-[1920px] mx-auto w-full flex flex-col gap-5">
        {/* Gas Hazard Warning Banner (if gas >= 150 ppm) */}
        <GasHazardBanner gasLevel={sensorData.gasLevel} isMuted={isMuted} onToggleMute={handleToggleMute} />

        {/* Guided Presentation Tour Panel (if active) */}
        {isGuidedDemoActive && (
          <GuidedPresentation
            onUpdateSensorData={handleUpdateSensorData}
            onSetViewTab={setActiveTab}
            onOpenCover={() => setIsCoverOpen(true)}
            onCloseCover={() => setIsCoverOpen(false)}
            onEndPresentation={() => setIsGuidedDemoActive(false)}
          />
        )}

        {/* ACTIVE TAB VIEW CONTENT */}
        {activeTab === 'DIGITAL_TWIN' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 7 Cols: 3D Septic Tank WebGL Canvas */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <SepticTank3D
                sensorData={sensorData}
                faults={faults}
                onOpenCoverRequest={() => setIsInterlockModalOpen(true)}
                isCoverOpen={isCoverOpen}
                explodedHousingMode={explodedHousingMode}
                setExplodedHousingMode={setExplodedHousingMode}
              />
            </div>

            {/* Right 5 Cols: Live IoT Telemetry Dashboard */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <LiveDashboard sensorData={sensorData} faults={faults} />
            </div>
          </div>
        )}

        {activeTab === 'ANALYTICS' && (
          <SludgeGraph
            sensorData={sensorData}
            onGrowthRateChange={(rate) => handleUpdateSensorData({ growthRateWeeks: rate })}
            onThresholdChange={(threshold) => handleUpdateSensorData({ serviceThreshold: threshold })}
          />
        )}

        {activeTab === 'HARDWARE' && (
          <HardwareBoardView faults={faults} batteryPct={sensorData.batteryPct} />
        )}

        {activeTab === 'COMPARE' && <CompareSceneView />}

        {activeTab === 'MUNICIPAL' && <MunicipalRouteView />}

        {activeTab === 'DATA_FLOW' && <DataFlowView />}

        {activeTab === 'HOUSING' && <EnclosureExplodedView />}

        {/* CONTROL PANEL SLIDERS & PRESETS */}
        <ControlPanel
          sensorData={sensorData}
          onUpdateSensorData={handleUpdateSensorData}
          faults={faults}
          onToggleFault={handleToggleFault}
          onApplyPreset={handleApplyPreset}
          onReset={handleReset}
          isSimPaused={isSimPaused}
          onTogglePause={() => setIsSimPaused(!isSimPaused)}
        />
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 p-4 md:p-5 mt-6">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              FROM REACTIVE EMPTYING TO PREDICTIVE SEPTIC-TANK MANAGEMENT
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
              BioSeptic Twin — ESP32 Smart Septic Tank Engineering Prototype & Digital Twin Simulation
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-700 bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-teal-700 font-bold">SENSE</span>
            <span className="text-slate-300">→</span>
            <span className="text-emerald-700 font-bold">MONITOR</span>
            <span className="text-slate-300">→</span>
            <span className="text-purple-700 font-bold">ANALYZE</span>
            <span className="text-slate-300">→</span>
            <span className="text-amber-700 font-bold">PREDICT</span>
            <span className="text-slate-300">→</span>
            <span className="text-red-700 font-bold">WARN</span>
            <span className="text-slate-300">→</span>
            <span className="text-teal-700 font-bold">PLAN</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <SafetyInterlockModal
        isOpen={isInterlockModalOpen}
        onClose={() => setIsInterlockModalOpen(false)}
        gasLevel={sensorData.gasLevel}
        isCoverOpen={isCoverOpen}
        onToggleCover={() => setIsCoverOpen(!isCoverOpen)}
      />

      <TechnicalHonestyModal
        isOpen={isHonestyModalOpen}
        onClose={() => setIsHonestyModalOpen(false)}
      />
    </div>
  );
}
