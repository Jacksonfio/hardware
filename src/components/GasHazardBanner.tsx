import React from 'react';
import { AlertTriangle, Volume2 } from 'lucide-react';

interface GasHazardBannerProps {
  gasLevel: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const GasHazardBanner: React.FC<GasHazardBannerProps> = ({ gasLevel, isMuted, onToggleMute }) => {
  if (gasLevel < 150) return null;

  return (
    <div className="bg-red-600 border border-red-700 text-white p-3.5 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-xs font-mono font-bold tracking-wider uppercase">
            ⚠ GAS HAZARD DETECTED — DO NOT OPEN INSPECTION COVER
          </div>
          <div className="text-[11px] font-mono opacity-90">
            Elevated Biogas ({gasLevel} ppm) • Red LED Active • Piezo Alarm Sounding • Safety Interlock LOCKED
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMute}
          className="px-3 py-1.5 bg-black/30 hover:bg-black/50 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border border-white/20 shadow-xs"
        >
          <Volume2 className="w-4 h-4" />
          {isMuted ? 'UNMUTE BUZZER' : 'MUTE BUZZER'}
        </button>
      </div>
    </div>
  );
};
