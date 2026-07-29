import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AptGroup } from '../types';
import {
  BarChart3,
  PieChart as PieChartIcon,
  ShieldAlert,
  BarChart2,
  Activity,
  Radio,
  Cpu,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  CartesianGrid,
} from 'recharts';

interface SectorDistributionChartProps {
  data: AptGroup[];
  onSelectSector: (sector: string) => void;
  selectedSector: string;
}

export const SectorDistributionChart: React.FC<SectorDistributionChartProps> = ({
  data,
  onSelectSector,
  selectedSector,
}) => {
  const [chartView, setChartView] = useState<'recharts' | 'compact'>('recharts');

  // Aggregate sectors
  const sectorCounts: Record<string, number> = {};
  data.forEach((apt) => {
    apt.targetedSectors.forEach((sec) => {
      sectorCounts[sec] = (sectorCounts[sec] || 0) + 1;
    });
  });

  const sortedSectors = Object.entries(sectorCounts).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...Object.values(sectorCounts), 1);

  // Recharts Sector Data
  const sectorChartData = sortedSectors.map(([sector, count]) => ({
    name: sector,
    count,
    percentage: Math.round((count / maxCount) * 100),
  }));

  // Sponsor Counts & Pie Data
  const sponsorCounts: Record<string, number> = {};
  data.forEach((apt) => {
    sponsorCounts[apt.sponsoringOrgType] = (sponsorCounts[apt.sponsoringOrgType] || 0) + 1;
  });

  const sponsorPieData = Object.entries(sponsorCounts).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  const SPONSOR_COLORS: Record<string, string> = {
    MSS: '#f43f5e',
    PLA: '#f59e0b',
    'Defense / MSS': '#06b6d4',
    'Joint / Independent': '#8b5cf6',
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="bg-slate-950/95 border border-cyan-500/50 p-3 shadow-[0_0_20px_rgba(6,182,212,0.25)] rounded-lg font-mono text-xs backdrop-blur-md text-slate-200"
        >
          <div className="flex items-center justify-between gap-3 border-b border-cyan-900/60 pb-1.5 mb-1.5">
            <span className="text-cyan-400 font-bold tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              {dataItem.name}
            </span>
            <span className="text-[10px] text-slate-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800">
              VECTOR
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Tracked APT Groups:</span>
              <span className="text-amber-400 font-bold">{dataItem.count ?? dataItem.value}</span>
            </div>
            {dataItem.percentage !== undefined && (
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Relative Exposure:</span>
                <span className="text-cyan-300 font-bold">{dataItem.percentage}%</span>
              </div>
            )}
          </div>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      
      {/* Targeted Sector Heatmap / Interactive Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="lg:col-span-2 bg-slate-950 border border-slate-800 p-6 rounded-xl shadow-2xl relative overflow-hidden group"
      >
        
        {/* Futuristic Ambient Glow & Grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-950/40 via-slate-950/0 to-slate-950/0 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none" />

        {/* HUD Corner Markers */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-500 rounded-tl pointer-events-none transition-all duration-300 group-hover:w-4 group-hover:h-4 group-hover:border-cyan-400" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-500 rounded-tr pointer-events-none transition-all duration-300 group-hover:w-4 group-hover:h-4 group-hover:border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-500 rounded-bl pointer-events-none transition-all duration-300 group-hover:w-4 group-hover:h-4 group-hover:border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-500 rounded-br pointer-events-none transition-all duration-300 group-hover:w-4 group-hover:h-4 group-hover:border-cyan-400" />

        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between mb-5 border-b border-slate-800/80 pb-3.5 gap-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="p-1.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 cursor-pointer"
            >
              <Activity className="w-4 h-4 animate-pulse" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-mono font-bold text-cyan-400 tracking-[0.18em] uppercase">
                  Targeted Sector Exposure Index
                </h3>
                <span className="flex items-center gap-1 text-[9px] font-mono bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800/80">
                  <Radio className="w-2.5 h-2.5 text-cyan-400 animate-ping" />
                  TELEMETRY ACTIVE
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                Real-time mapping of state-sponsored target frequency across critical infrastructure
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setChartView(chartView === 'recharts' ? 'compact' : 'recharts')}
              className="text-[11px] font-mono text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-md border border-slate-700 hover:border-cyan-500/50 shadow-sm"
            >
              <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{chartView === 'recharts' ? 'Matrix View' : 'Interactive Spectrum'}</span>
            </motion.button>
          </div>
        </div>

        {/* Main Graph Content with AnimatePresence */}
        <AnimatePresence mode="wait">
          {chartView === 'recharts' ? (
            <motion.div
              key="recharts-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="h-[230px] w-full pt-1 relative z-10"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sectorChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
                >
                  <defs>
                    {/* Default Futuristic Neon Cyan-to-Blue Bar Gradient */}
                    <linearGradient id="cyberCyanGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0891b2" stopOpacity={0.9} />
                      <stop offset="60%" stopColor="#06b6d4" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={1} />
                    </linearGradient>

                    {/* Selected Active Neon Amber-to-Rose Bar Gradient */}
                    <linearGradient id="cyberAmberGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#d97706" stopOpacity={0.9} />
                      <stop offset="70%" stopColor="#f59e0b" stopOpacity={1} />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity={1} />
                    </linearGradient>

                    {/* Glow filter */}
                    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#06b6d4" floodOpacity={0.5} />
                    </filter>
                  </defs>

                  <CartesianGrid horizontal={false} stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} axisLine={{ stroke: '#334155' }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={140}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    cursor="pointer"
                    radius={[0, 4, 4, 0]}
                    onClick={(entry) => onSelectSector(selectedSector === entry.name ? '' : entry.name)}
                  >
                    {sectorChartData.map((entry) => {
                      const isSelected = selectedSector === entry.name;
                      return (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={isSelected ? 'url(#cyberAmberGradient)' : 'url(#cyberCyanGradient)'}
                          stroke={isSelected ? '#fef08a' : '#38bdf8'}
                          strokeWidth={isSelected ? 1.5 : 0.5}
                          className="transition-all duration-300 hover:opacity-90"
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <motion.div
              key="compact-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-3 max-h-[230px] overflow-y-auto pr-2 relative z-10"
            >
              {sortedSectors.map(([sector, count], idx) => {
                const percentage = Math.round((count / maxCount) * 100);
                const isSelected = selectedSector === sector;

                return (
                  <motion.div
                    key={sector}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.04 }}
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => onSelectSector(isSelected ? '' : sector)}
                    className={`group cursor-pointer p-2.5 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-amber-950/40 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className={`truncate max-w-[200px] sm:max-w-xs flex items-center gap-1.5 ${isSelected ? 'text-amber-400 font-bold' : 'text-slate-200 group-hover:text-cyan-300'}`}>
                        <Zap className={`w-3 h-3 ${isSelected ? 'text-amber-400' : 'text-cyan-500'}`} />
                        {sector}
                      </span>
                      <span className="text-slate-400 font-bold">
                        {count} <span className="text-[10px] text-slate-500">APTs ({percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 + idx * 0.03 }}
                        className={`h-full rounded-full ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500 group-hover:from-cyan-400 group-hover:to-blue-400'
                        }`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cyber Footer Status Bar */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>EXPOSURE MATRIX: Active Spectrum Filtering</span>
          </div>
          <span className="text-slate-400 hidden sm:inline">
            Click any sector bar to isolate target profile records
          </span>
        </div>
      </motion.div>

      {/* State Authority Attribution Distribution with Interactive Donut Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
        className="bg-slate-950 border border-slate-800 p-6 rounded-xl shadow-2xl relative overflow-hidden flex flex-col justify-between group"
      >
        
        {/* Futuristic Ambient Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950/0 to-slate-950/0 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none" />

        {/* HUD Corners */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-indigo-500 rounded-tl pointer-events-none transition-all duration-300 group-hover:w-4 group-hover:h-4 group-hover:border-indigo-400" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-indigo-500 rounded-tr pointer-events-none transition-all duration-300 group-hover:w-4 group-hover:h-4 group-hover:border-indigo-400" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3 border-b border-slate-800/80 pb-3">
            <PieChartIcon className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-mono font-bold text-indigo-400 tracking-[0.18em] uppercase">
              State Authority Attribution
            </h3>
          </div>

          <div className="h-[145px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sponsorPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={62}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="#020617"
                  strokeWidth={2}
                >
                  {sponsorPieData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={SPONSOR_COLORS[entry.name] || '#64748b'}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Donut Center Core Label */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            >
              <span className="text-[10px] font-mono text-slate-400 uppercase">Total</span>
              <span className="text-sm font-mono font-bold text-cyan-300">{data.length}</span>
            </motion.div>
          </div>

          <div className="space-y-1.5 font-mono text-xs mt-1">
            {Object.entries(sponsorCounts).map(([type, count], idx) => {
              const totalApts = data.length || 1;
              const pct = Math.round((count / totalApts) * 100);
              const color = SPONSOR_COLORS[type] || '#64748b';

              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.05, duration: 0.25 }}
                  whileHover={{ x: 3, backgroundColor: 'rgba(30, 41, 59, 0.9)' }}
                  className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: color }} />
                    <span className="text-slate-200 font-semibold text-[11px]">{type}</span>
                  </div>
                  <span className="text-slate-400 text-[11px] font-semibold">
                    {count} <span className="text-slate-400">({pct}%)</span>
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center gap-1.5 relative z-10">
          <ShieldAlert className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Cross-referenced with MITRE ATT&CK Intelligence</span>
        </div>
      </motion.div>

    </div>
  );
};



