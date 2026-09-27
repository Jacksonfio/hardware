import React, { useState } from 'react';
import { HardwareComponentInfo, SensorFaults } from '../types/septic';
import { playSingleClick } from '../utils/audio';
import { CheckCircle2, Info } from 'lucide-react';

export const HARDWARE_LIST: HardwareComponentInfo[] = [
  {
    id: 'esp32',
    name: 'ESP32-WROOM-32 Microcontroller',
    category: 'REAL_PROTOTYPE',
    purpose: 'System core controller, sensor sampling, local indicator logic & LoRa packet transmission',
    input: '3.3V DC, Ultrasonic echo signal, MQ-2 analog voltage (A0)',
    output: 'GPIO outputs to LEDs, Buzzer PWM, SPI to LoRa SX1276',
    pinout: 'GPIO 5 (Echo), GPIO 18 (Trig), GPIO 22 (Red LED), GPIO 23 (Green LED), GPIO 25 (Buzzer)',
    status: 'ONLINE',
    description: 'Dual-core 240MHz microcontroller with integrated WiFi/BLE and low-power sleep modes.',
  },
  {
    id: 'ultrasonic',
    name: 'JSN-SR04T Waterproof Ultrasonic Distance Sensor',
    category: 'REAL_PROTOTYPE',
    purpose: 'Measures headspace distance (Time-of-Flight) to top surface of scum layer',
    input: '5V VCC, 10µs Trigger pulse (GPIO 18)',
    output: 'Echo PWM pulse width proportional to distance (GPIO 5)',
    pinout: 'VCC, GND, TRIG, ECHO',
    status: 'ONLINE',
    description: 'Sealed waterproof transducer operating at 40kHz, range 20cm–450cm.',
  },
  {
    id: 'mq2',
    name: 'MQ-2 Electrochemical Biogas Sensor',
    category: 'REAL_PROTOTYPE',
    purpose: 'Demonstration sensor for detecting combustible gases (Methane CH4, Hydrogen Sulfide H2S, LPG)',
    input: '5V Heater power, Gas concentration exposure',
    output: 'Analog voltage (0–3.3V) mapped to 0–500 ppm',
    pinout: 'VCC, GND, AO (Analog Out)',
    status: 'ONLINE',
    description: 'Tin dioxide (SnO2) sensitive layer. Labeled: MQ-2 DEMONSTRATION GAS SENSOR.',
  },
  {
    id: 'layer_sensor',
    name: 'Conceptual Multi-Sensor Layer Detection Probe',
    category: 'CONCEPTUAL_ADVANCED',
    purpose: 'Advanced multi-element probe to independently distinguish scum, liquid effluent, and settled sludge boundaries',
    input: 'Multi-node capacitive & ToF array along vertical probe stem',
    output: 'I2C/SPI bus differential density profile data',
    pinout: 'SDA, SCL, INT, 3.3V',
    status: 'ONLINE',
    description: 'CONCEPTUAL MULTI-SENSOR LAYER DETECTION. Expands single-ultrasonic prototype to full 3-phase stratification.',
  },
  {
    id: 'leds',
    name: 'Dual Status LEDs (Green / Red)',
    category: 'REAL_PROTOTYPE',
    purpose: 'Visual safety annunciators on external IP67 enclosure cover',
    input: 'GPIO 23 (Green SAFE), GPIO 22 (Red HAZARD)',
    output: 'Light emission (Green = Normal/Safe work, Red = Gas Hazard/Lockout)',
    pinout: 'GPIO 22, GPIO 23, 220Ω Current Limit Resistors',
    status: 'ONLINE',
    description: 'High-brightness 5mm LEDs sealed behind transparent lens covers.',
  },
  {
    id: 'buzzer',
    name: 'Piezoelectric Audible Alarm Buzzer',
    category: 'REAL_PROTOTYPE',
    purpose: 'Acoustic hazard warning sound when MQ-2 detects gas >150 ppm or critical fault',
    input: 'GPIO 25 PWM signal (2400 Hz tone)',
    output: '85 dB audible alert pulse',
    pinout: 'GPIO 25, GND',
    status: 'ONLINE',
    description: 'Loud piezo sounder mounted inside acoustic horn aperture.',
  },
  {
    id: 'battery',
    name: 'LiFePO4 3.2V 6000mAh Battery & Solar Charging Module',
    category: 'REAL_PROTOTYPE',
    purpose: 'Provides reliable long-life power to sealed electronics enclosure',
    input: 'Solar panel trickle charger',
    output: 'Regulated 3.3V / 5V DC power rails',
    pinout: 'B+, B-, VOUT, GND',
    status: 'ONLINE',
    description: 'Lithium Iron Phosphate battery chemistry for high thermal stability and multi-year lifespan.',
  },
  {
    id: 'lora',
    name: 'SX1276 LoRa 868/915MHz RF Communication Module',
    category: 'REAL_PROTOTYPE',
    purpose: 'Long-range wireless telemetry transmission to remote municipal gateway',
    input: 'SPI Bus data packets from ESP32',
    output: 'RF Sub-GHz antenna output (10–15 km range line-of-sight)',
    pinout: 'MOSI, MISO, SCK, CS, DIO0, RST',
    status: 'ONLINE',
    description: 'Low-power long-range radio protocol enabling smart municipal route planning without cellular SIMs.',
  },
];

interface HardwareBoardViewProps {
  faults: SensorFaults;
  batteryPct: number;
}

export const HardwareBoardView: React.FC<HardwareBoardViewProps> = ({ faults, batteryPct }) => {
  const [selectedComp, setSelectedComp] = useState<HardwareComponentInfo>(HARDWARE_LIST[0]);

  const getStatus = (comp: HardwareComponentInfo) => {
    if (comp.id === 'esp32' && faults.esp32Offline) return 'OFFLINE';
    if (comp.id === 'ultrasonic' && faults.ultrasonicFailed) return 'FAILED';
    if (comp.id === 'mq2' && faults.gasFailed) return 'FAILED';
    if (comp.id === 'layer_sensor' && faults.layerSensorFailed) return 'FAILED';
    if (comp.id === 'lora' && faults.loraFailed) return 'FAILED';
    if (comp.id === 'battery' && batteryPct <= 10) return 'WARNING';
    return 'ONLINE';
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-6 flex flex-col gap-6 shadow-xs">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Virtual Circuit Board & System Architecture
            </h3>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              HARDWARE NODE DIAGRAM
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Interactive pinout, component breakdown, and technical honesty mapping
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Real Hardware
          </span>
          <span className="flex items-center gap-1.5 text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Conceptual Concept
          </span>
        </div>
      </div>

      {/* Main Board + Inspector Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Virtual Circuit Board Layout */}
        <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-5 relative overflow-hidden min-h-[380px] flex flex-col justify-between grid-blueprint">
          {/* PCB Title watermark */}
          <div className="text-[10px] font-mono text-slate-400 tracking-widest uppercase mb-4 pointer-events-none font-semibold">
            ESP32-SEPTIC-TWIN-PCB-REV2.4 • IP67 ENCLOSURE ASSEMBLY
          </div>

          {/* Interactive Hardware Component Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-10">
            {HARDWARE_LIST.map((comp) => {
              const currentStatus = getStatus(comp);
              const isSelected = selectedComp.id === comp.id;
              const isConceptual = comp.category === 'CONCEPTUAL_ADVANCED';

              return (
                <button
                  key={comp.id}
                  onClick={() => {
                    playSingleClick();
                    setSelectedComp(comp);
                  }}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between relative group ${
                    isSelected
                      ? 'bg-white border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                      : isConceptual
                      ? 'bg-amber-50/60 border-amber-200 hover:border-amber-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                      {isConceptual ? 'CONCEPT' : 'PROTOTYPE'}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        currentStatus === 'ONLINE'
                          ? 'bg-emerald-500'
                          : currentStatus === 'WARNING'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                    />
                  </div>

                  <div className="text-xs font-bold text-slate-900 group-hover:text-teal-700 line-clamp-1">
                    {comp.name}
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 mt-2 flex items-center justify-between">
                    <span>Status:</span>
                    <span
                      className={
                        currentStatus === 'ONLINE'
                          ? 'text-emerald-700 font-semibold'
                          : currentStatus === 'WARNING'
                          ? 'text-amber-700 font-semibold'
                          : 'text-red-600 font-bold'
                      }
                    >
                      {currentStatus}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* PCB Trace Footer */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>SPI / I2C / GPIO Trace Integrity: OK</span>
            <span>Power Rails: 3.3V / 5.0V Regulated</span>
          </div>
        </div>

        {/* Right 5 Cols: Selected Component Inspector Panel */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <span className="text-xs font-mono uppercase text-slate-800 font-bold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-teal-600" /> COMPONENT INSPECTOR
              </span>
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  selectedComp.category === 'CONCEPTUAL_ADVANCED'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {selectedComp.category === 'CONCEPTUAL_ADVANCED' ? 'CONCEPTUAL ADVANCED' : 'REAL HARDWARE'}
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900 mt-3">{selectedComp.name}</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">{selectedComp.description}</p>

            <div className="mt-4 space-y-2 text-xs font-mono">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">PRIMARY PURPOSE:</span>
                <span className="text-slate-800 mt-0.5 block">{selectedComp.purpose}</span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">INPUT SIGNAL / SOURCE:</span>
                <span className="text-teal-700 mt-0.5 block">{selectedComp.input}</span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">OUTPUT / DESTINATION:</span>
                <span className="text-emerald-700 mt-0.5 block">{selectedComp.output}</span>
              </div>

              {selectedComp.pinout && (
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">ESP32 PIN MAP:</span>
                  <span className="text-purple-700 mt-0.5 block">{selectedComp.pinout}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl text-[11px] font-mono text-slate-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Click any component on the board to view its pinout and purpose.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
