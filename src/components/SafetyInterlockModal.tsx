import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Lock, Unlock, X } from 'lucide-react';
import { playSingleClick } from '../utils/audio';

interface SafetyInterlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  gasLevel: number;
  isCoverOpen: boolean;
  onToggleCover: () => void;
}

export const SafetyInterlockModal: React.FC<SafetyInterlockModalProps> = ({
  isOpen,
  onClose,
  gasLevel,
  isCoverOpen,
  onToggleCover,
}) => {
  const [checking, setChecking] = useState(true);

  const isHazard = gasLevel >= 150;

  useEffect(() => {
    if (isOpen) {
      setChecking(true);
      const timer = setTimeout(() => {
        setChecking(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl flex flex-col gap-5 text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Inspection Cover Safety Interlock
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {checking ? (
          /* Step 1: Checking Gas Conditions */
          <div className="py-8 flex flex-col items-center justify-center gap-3 font-mono text-xs text-teal-700">
            <div className="w-10 h-10 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin" />
            <div className="font-bold text-sm text-slate-900">CHECKING GAS CONDITIONS...</div>
            <div className="text-slate-500">Sampling MQ-2 sensor headspace atmosphere</div>
          </div>
        ) : isHazard ? (
          /* Step 2: Hazardous Gas Detected */
          <div className="py-4 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 border border-red-200 text-red-600 flex items-center justify-center animate-bounce">
              <Lock className="w-6 h-6" />
            </div>

            <h4 className="text-sm font-bold text-red-700 uppercase">
              DO NOT OPEN — GAS HAZARD DETECTED
            </h4>

            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-mono text-red-800 text-left w-full space-y-1">
              <div>• Biogas Concentration: <b>{gasLevel} ppm</b> (Limit: 150 ppm)</div>
              <div>• Hazard Status: <b>HIGH RISK (H2S / CH4)</b></div>
              <div>• Interlock Lock: <b>ACTIVE SOFTWARE LOCKOUT</b></div>
            </div>

            <p className="text-[10px] text-slate-400 font-mono">
              * Software demonstration interlock. Do not enter confined septic space without certified gas detection equipment.
            </p>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono font-bold mt-2 shadow-xs"
            >
              ACKNOWLEDGE & CLOSE
            </button>
          </div>
        ) : (
          /* Step 2: Atmosphere Safe */
          <div className="py-4 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h4 className="text-sm font-bold text-emerald-800 uppercase">
              ATMOSPHERE STATUS: SIMULATED SAFE
            </h4>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 text-left w-full space-y-1">
              <div>• Biogas Concentration: <b>{gasLevel} ppm</b> (Safe &lt; 150 ppm)</div>
              <div>• Interlock Status: <b>AVAILABLE FOR SAFE-WORK PROCEDURE</b></div>
            </div>

            <button
              onClick={() => {
                playSingleClick();
                onToggleCover();
                onClose();
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-mono font-bold mt-2 flex items-center justify-center gap-2 shadow-xs"
            >
              {isCoverOpen ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              {isCoverOpen ? 'CLOSE INSPECTION COVER' : 'PROCEED & OPEN COVER'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
