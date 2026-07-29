import React, { useState } from 'react';
import { AptGroup } from '../types';
import { BarChart3, PieChart as PieChartIcon, ShieldAlert, BarChart2 } from 'lucide-react';
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
    MSS: '#ef4444',
    PLA: '#f59e0b',
    'Defense / MSS': '#b91c1c',
    'Joint / Independent': '#71717a',
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload;
      return (
        <div className="bg-[#0c0c0e] border border-[#ef4444] p-3 shadow-2xl font-mono text-xs">
          <p className="text-[#ef4444] font-bold">{dataItem.name}</p>
          <p className="text-[#f8fafc] mt-1">
            {dataItem.count ?? dataItem.value} Threat Group(s)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      
      {/* Targeted Sector Heatmap / Interactive Bar Chart */}
      <div className="lg:col-span-2 bg-[#16161a] border border-[#2d1215] p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between mb-5 border-b border-[#2d1215] pb-3 gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#ef4444]" />
            <h3 className="text-xs font-semibold text-[#ef4444] uppercase tracking-[0.2em]">
              Targeted Sector Exposure Index
            </h3>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setChartView(chartView === 'recharts' ? 'compact' : 'recharts')}
              className="text-[11px] font-mono text-[#a1a1aa] hover:text-[#ef4444] transition-colors flex items-center gap-1 bg-[#0c0c0e] px-2.5 py-1 border border-[#2d1215]"
            >
              <BarChart2 className="w-3 h-3 text-[#f59e0b]" />
              <span>{chartView === 'recharts' ? 'List View' : 'Interactive Chart'}</span>
            </button>
            <span className="text-[11px] font-mono text-[#71717a] hidden sm:inline">
              Click sector to isolate records
            </span>
          </div>
        </div>

        {chartView === 'recharts' ? (
          <div className="h-[220px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sectorChartData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <XAxis type="number" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#a1a1aa"
                  fontSize={11}
                  tickLine={false}
                  width={140}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  cursor="pointer"
                  onClick={(entry) => onSelectSector(selectedSector === entry.name ? '' : entry.name)}
                >
                  {sectorChartData.map((entry) => {
                    const isSelected = selectedSector === entry.name;
                    return (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={isSelected ? '#f59e0b' : '#dc2626'}
                        stroke={isSelected ? '#fef08a' : 'none'}
                        strokeWidth={2}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
            {sortedSectors.map(([sector, count]) => {
              const percentage = Math.round((count / maxCount) * 100);
              const isSelected = selectedSector === sector;

              return (
                <div
                  key={sector}
                  onClick={() => onSelectSector(isSelected ? '' : sector)}
                  className={`group cursor-pointer p-2.5 transition-all ${
                    isSelected
                      ? 'bg-[#ef4444]/15 border border-[#ef4444]'
                      : 'bg-[#0c0c0e]/60 border border-[#2d1215] hover:border-[#a1a1aa]'
                  }`}
                >
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className={`truncate max-w-[200px] sm:max-w-xs ${isSelected ? 'text-[#f59e0b] font-bold' : 'text-[#e2e8f0] group-hover:text-[#f8fafc]'}`}>
                      {sector}
                    </span>
                    <span className="text-[#a1a1aa] font-bold">
                      {count} {count === 1 ? 'APT' : 'APTs'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0c0c0e] overflow-hidden p-0">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isSelected
                          ? 'bg-[#f59e0b]'
                          : 'bg-[#dc2626] group-hover:bg-[#ef4444]'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* State Authority Attribution Distribution with Interactive Donut Chart */}
      <div className="bg-[#16161a] border border-[#2d1215] p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3 border-b border-[#2d1215] pb-3">
            <PieChartIcon className="w-4 h-4 text-[#ef4444]" />
            <h3 className="text-xs font-semibold text-[#ef4444] uppercase tracking-[0.2em]">
              State Authority Attribution
            </h3>
          </div>

          <div className="h-[150px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sponsorPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sponsorPieData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={SPONSOR_COLORS[entry.name] || '#a1a1aa'}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 font-mono text-xs mt-2">
            {Object.entries(sponsorCounts).map(([type, count]) => {
              const totalApts = data.length || 1;
              const pct = Math.round((count / totalApts) * 100);
              const color = SPONSOR_COLORS[type] || '#a1a1aa';

              return (
                <div key={type} className="p-2 bg-[#0c0c0e] border border-[#2d1215] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2" style={{ backgroundColor: color }} />
                    <span className="text-[#f8fafc] font-medium text-[11px]">{type}</span>
                  </div>
                  <span className="text-[#a1a1aa] text-[11px]">
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#2d1215] text-[11px] font-mono text-[#71717a] flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-[#ef4444] shrink-0" />
          <span>Cross-referenced with MITRE ATT&CK Intelligence</span>
        </div>
      </div>

    </div>
  );
};

