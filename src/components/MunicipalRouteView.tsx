import React from 'react';
import { MunicipalHouse } from '../types/septic';
import { Truck, Calendar } from 'lucide-react';

export const MUNICIPAL_HOUSES: MunicipalHouse[] = [
  {
    id: 'h001',
    address: 'HOUSE 001 — 142 Pinehurst Ave',
    owner: 'Residential Unit #01',
    currentSludgeCm: 78,
    growthRateCmWk: 3.5,
    predictedServiceWeek: 12,
    status: 'SERVICE_PLANNING',
    gasPpm: 65,
  },
  {
    id: 'h002',
    address: 'HOUSE 002 — 148 Pinehurst Ave',
    owner: 'Residential Unit #02',
    currentSludgeCm: 68,
    growthRateCmWk: 3.0,
    predictedServiceWeek: 14,
    status: 'MONITOR',
    gasPpm: 55,
  },
  {
    id: 'h003',
    address: 'HOUSE 003 — 154 Pinehurst Ave',
    owner: 'Residential Unit #03',
    currentSludgeCm: 69,
    growthRateCmWk: 3.1,
    predictedServiceWeek: 14,
    status: 'MONITOR',
    gasPpm: 60,
  },
  {
    id: 'h004',
    address: 'HOUSE 004 — 188 Oakridge Rd',
    owner: 'Residential Unit #04',
    currentSludgeCm: 58,
    growthRateCmWk: 2.8,
    predictedServiceWeek: 16,
    status: 'NORMAL',
    gasPpm: 45,
  },
  {
    id: 'h005',
    address: 'HOUSE 005 — 192 Oakridge Rd',
    owner: 'Residential Unit #05',
    currentSludgeCm: 48,
    growthRateCmWk: 2.5,
    predictedServiceWeek: 18,
    status: 'NORMAL',
    gasPpm: 40,
  },
];

export const MunicipalRouteView: React.FC = () => {
  const groupedWeeks = MUNICIPAL_HOUSES.reduce((acc, house) => {
    const wk = house.predictedServiceWeek;
    if (!acc[wk]) acc[wk] = [];
    acc[wk].push(house);
    return acc;
  }, {} as Record<number, MunicipalHouse[]>);

  const sortedWeeks = Object.keys(groupedWeeks).map(Number).sort((a, b) => a - b);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-6 flex flex-col gap-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Municipal Route-Planning Concept
              </h3>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-medium">
                CONCEPTUAL OPERATOR VIEW
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Grouping predicted service dates to optimize tanker truck dispatching routes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Calendar className="w-4 h-4 text-teal-600" />
          <span>Active Fleet Horizon: <b>20 Weeks</b></span>
        </div>
      </div>

      {/* Schematic Grouped Dispatch List */}
      <div className="space-y-4">
        {sortedWeeks.map((weekNum) => {
          const houses = groupedWeeks[weekNum];
          return (
            <div key={weekNum} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-2xs">
              {/* Group Title */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    PLANNED SERVICE GROUP — WEEK {weekNum}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">({houses.length} Monitored Tanks)</span>
                </div>
                <div className="text-xs font-mono text-emerald-700 font-semibold flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Single Tanker Trip Efficiency: 92%
                </div>
              </div>

              {/* Tank Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {houses.map((house) => (
                  <div
                    key={house.id}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl flex flex-col justify-between font-mono text-xs gap-2 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900">{house.address}</div>
                        <div className="text-[10px] text-slate-400">{house.owner}</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          house.status === 'SERVICE_PLANNING'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {house.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[9px]">SLUDGE DEPTH:</span>
                        <span className="font-bold text-purple-800">{house.currentSludgeCm} cm</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">GROWTH RATE:</span>
                        <span className="font-bold text-slate-800">+{house.growthRateCmWk} cm/wk</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Service Predicted: <b>Week {house.predictedServiceWeek}</b></span>
                      <span className="text-emerald-700 font-semibold">Gas Safe ({house.gasPpm}ppm)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Concept Disclaimer Footer */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 flex items-center gap-2">
        <Truck className="w-4 h-4 text-teal-600 shrink-0" />
        <span>
          <b>ROUTE-PLANNING CONCEPT:</b> Demonstrates how time-series sludge growth predictions enable municipal sanitation departments to organize neighborhood pump-out clusters before septic overflow emergencies occur.
        </span>
      </div>
    </div>
  );
};
