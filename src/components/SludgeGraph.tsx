import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { SensorData } from '../types/septic';
import { TrendingUp, Clock } from 'lucide-react';

interface SludgeGraphProps {
  sensorData: SensorData;
  onGrowthRateChange: (rate: number) => void;
  onThresholdChange: (threshold: number) => void;
}

export const SludgeGraph: React.FC<SludgeGraphProps> = ({
  sensorData,
  onGrowthRateChange,
  onThresholdChange,
}) => {
  const currentSludge = sensorData.sludgeDepth;
  const growthRate = sensorData.growthRateWeeks;
  const threshold = sensorData.serviceThreshold;

  const currentWeek = 7;
  const remainingCapacity = Math.max(0, threshold - currentSludge);
  const isThresholdExceeded = currentSludge >= threshold;

  const weeksRemaining = growthRate > 0 ? Math.ceil(remainingCapacity / growthRate) : Infinity;
  const targetWeek = currentWeek + (isFinite(weeksRemaining) ? weeksRemaining : 0);

  const chartData = [];
  const startWeek1Sludge = Math.max(10, currentSludge - (currentWeek - 1) * growthRate);

  for (let w = 1; w <= currentWeek; w++) {
    const historicalVal = Math.round((startWeek1Sludge + (w - 1) * growthRate) * 10) / 10;
    chartData.push({
      weekLabel: `Wk ${w}`,
      weekNum: w,
      historical: historicalVal,
      projected: null,
      threshold: threshold,
    });
  }

  const maxProjectedWeek = Math.min(24, Math.max(currentWeek + 10, targetWeek + 2));
  for (let w = currentWeek + 1; w <= maxProjectedWeek; w++) {
    const projectedVal = Math.round((currentSludge + (w - currentWeek) * growthRate) * 10) / 10;
    chartData.push({
      weekLabel: `Wk ${w}`,
      weekNum: w,
      historical: null,
      projected: projectedVal,
      threshold: threshold,
    });
  }

  const intersectionPoint = chartData.find((d) => d.weekNum === targetWeek);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-6 flex flex-col gap-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/60 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Sludge Accumulation & Service Prediction
            </h3>
            <p className="text-[11px] text-slate-500">Ordinary Least Squares Time-Series Growth Model</p>
          </div>
        </div>

        {/* Prediction Summary Box */}
        <div className="bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl flex items-center gap-3">
          <Clock className="w-4 h-4 text-teal-600" />
          <div>
            <div className="text-[9px] font-mono text-slate-400 uppercase font-semibold">PREDICTED SERVICE WINDOW</div>
            <div className="text-xs font-mono font-bold text-slate-800">
              {isThresholdExceeded
                ? 'SERVICE REQUIRED NOW'
                : growthRate <= 0 || !isFinite(weeksRemaining)
                ? 'INSUFFICIENT DATA FOR TREND PREDICTION'
                : `Approximately ${weeksRemaining} Weeks (Week ${targetWeek})`}
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Sludge Growth Chart */}
      <div className="w-full h-[320px] bg-slate-50/60 p-3 rounded-xl border border-slate-200">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 15, right: 25, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="weekLabel" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis
              domain={[0, 120]}
              stroke="#94a3b8"
              tick={{ fontSize: 11, fill: '#64748b' }}
              unit=" cm"
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              itemStyle={{ color: '#0f172a' }}
            />

            {/* Threshold Line */}
            <ReferenceLine
              y={threshold}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{ value: `Threshold: ${threshold}cm`, fill: '#dc2626', fontSize: 11, position: 'top' }}
            />

            {/* Current Week Vertical Marker */}
            <ReferenceLine
              x={`Wk ${currentWeek}`}
              stroke="#0284c7"
              strokeDasharray="3 3"
              label={{ value: 'Current Week', fill: '#0284c7', fontSize: 11, position: 'insideTopLeft' }}
            />

            {/* Historical Actual Measurements */}
            <Line
              type="monotone"
              dataKey="historical"
              name="Historical Sludge Depth"
              stroke="#9333ea"
              strokeWidth={3}
              dot={{ r: 4, fill: '#a855f7', stroke: '#7e22ce' }}
              activeDot={{ r: 6 }}
            />

            {/* Projected Trend Line */}
            <Line
              type="monotone"
              dataKey="projected"
              name="Projected Growth Trend"
              stroke="#0284c7"
              strokeWidth={2}
              strokeDasharray="6 6"
              dot={{ r: 3, fill: '#0284c7' }}
            />

            {/* Target Service Intersection Dot */}
            {intersectionPoint && (
              <ReferenceDot
                x={`Wk ${targetWeek}`}
                y={threshold}
                r={6}
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Controls & Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        {/* Growth Rate Slider */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono text-slate-700 mb-1">
            <span>Sludge Growth Rate</span>
            <b className="text-purple-700">+{growthRate.toFixed(1)} cm/week</b>
          </div>
          <input
            type="range"
            min="0.5"
            max="10.0"
            step="0.5"
            value={growthRate}
            onChange={(e) => onGrowthRateChange(parseFloat(e.target.value))}
            className="w-full accent-purple-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>Slow (0.5 cm/wk)</span>
            <span>Fast (10 cm/wk)</span>
          </div>
        </div>

        {/* Configurable Threshold Slider */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono text-slate-700 mb-1">
            <span>Service Threshold Limit</span>
            <b className="text-red-600">{threshold} cm</b>
          </div>
          <input
            type="range"
            min="50"
            max="110"
            step="5"
            value={threshold}
            onChange={(e) => onThresholdChange(parseInt(e.target.value))}
            className="w-full accent-red-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>Min (50cm)</span>
            <span>Max (110cm)</span>
          </div>
        </div>

        {/* Calculation Summary */}
        <div className="flex flex-col justify-between text-xs font-mono bg-white p-2.5 rounded-lg border border-slate-200">
          <div className="flex justify-between text-slate-500">
            <span>Current Sludge:</span>
            <b className="text-slate-900">{currentSludge.toFixed(1)} cm</b>
          </div>
          <div className="flex justify-between text-slate-500 mt-1">
            <span>Remaining Buffer:</span>
            <b className="text-emerald-700">{remainingCapacity.toFixed(1)} cm</b>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            * Labeled: CONFIGURABLE DEMONSTRATION THRESHOLD
          </div>
        </div>
      </div>
    </div>
  );
};
