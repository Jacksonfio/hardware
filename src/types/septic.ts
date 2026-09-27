export type SystemStatus = 'NORMAL' | 'MONITOR' | 'SERVICE_PLANNING' | 'GAS_HAZARD' | 'SYSTEM_OFFLINE';

export interface SensorData {
  sludgeDepth: number; // cm (0-120)
  scumThickness: number; // cm (0-30)
  liquidDepth: number; // cm
  totalTankHeight: number; // cm (default 180)
  gasLevel: number; // ppm (0-500)
  ultrasonicDistance: number; // cm (distance from transducer to top of scum)
  batteryPct: number; // % (0-100)
  growthRateWeeks: number; // cm / week
  serviceThreshold: number; // cm (default 90cm)
  timestamp: string;
}

export interface SensorFaults {
  ultrasonicFailed: boolean;
  gasFailed: boolean;
  layerSensorFailed: boolean;
  esp32Offline: boolean;
  loraFailed: boolean;
}

export interface HistoricalReading {
  week: number;
  label: string;
  sludgeDepth: number;
  gasLevel: number;
  isProjected?: boolean;
}

export interface HardwareComponentInfo {
  id: string;
  name: string;
  category: 'REAL_PROTOTYPE' | 'CONCEPTUAL_ADVANCED';
  purpose: string;
  input: string;
  output: string;
  pinout?: string;
  status: 'ONLINE' | 'WARNING' | 'FAILED' | 'OFFLINE';
  description: string;
}

export interface MunicipalHouse {
  id: string;
  address: string;
  owner: string;
  currentSludgeCm: number;
  growthRateCmWk: number;
  predictedServiceWeek: number;
  status: SystemStatus;
  gasPpm: number;
}

export type ViewTab = 'DIGITAL_TWIN' | 'ANALYTICS' | 'HARDWARE' | 'COMPARE' | 'MUNICIPAL' | 'DATA_FLOW' | 'HOUSING';

export interface PresetConfig {
  id: string;
  name: string;
  description: string;
  sludgeDepth: number;
  scumThickness: number;
  gasLevel: number;
  growthRate: number;
  status: SystemStatus;
}
