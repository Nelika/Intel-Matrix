import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Flame,
  Moon,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Gavel,
  Info,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Calendar,
  Layers,
  ChevronRight,
  Target,
} from 'lucide-react';
import { AptGroup, ActivitySpan } from '../types';

interface AptActivityGraphProps {
  data: AptGroup[];
  onSelectApt: (apt: AptGroup) => void;
  searchQuery?: string;
}

const MIN_YEAR = 2004;
const MAX_YEAR = 2026;
const TOTAL_YEARS = MAX_YEAR - MIN_YEAR + 1; // 23 years (2004 - 2026)

export const AptActivityGraph: React.FC<AptActivityGraphProps> = ({
  data,
  onSelectApt,
  searchQuery = '',
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Dormant' | 'Intermittent'>('ALL');
  const [sortBy, setSortBy] = useState<'status' | 'id' | 'year'>('status');
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [hoveredSpan, setHoveredSpan] = useState<{ aptId: string; span: ActivitySpan } | null>(null);

  // Compute stats across current filtered data
  const stats = useMemo(() => {
    const safeData = data || [];
    const activeCount = safeData.filter((d) => d?.currentStatus === 'Active').length;
    const dormantCount = safeData.filter((d) => d?.currentStatus === 'Dormant').length;
    const intermittentCount = safeData.filter((d) => d?.currentStatus === 'Intermittent').length;
    return { activeCount, dormantCount, intermittentCount, total: safeData.length };
  }, [data]);

  // Filter and sort APT groups
  const filteredApts = useMemo(() => {
    let result = data || [];

    if (statusFilter !== 'ALL') {
      result = result.filter((apt) => apt?.currentStatus === statusFilter);
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'status') {
        const orderMap: Record<string, number> = { Active: 0, Intermittent: 1, Dormant: 2 };
        const statusDiff = orderMap[a.currentStatus] - orderMap[b.currentStatus];
        if (statusDiff !== 0) return statusDiff;
        return a.classification.localeCompare(b.classification);
      } else if (sortBy === 'year') {
        return a.firstObservedYear - b.firstObservedYear;
      } else {
        return a.classification.localeCompare(b.classification);
      }
    });
  }, [data, statusFilter, sortBy]);

  // Year markers for the x-axis timeline grid
  const yearTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let y = MIN_YEAR; y <= MAX_YEAR; y += 2) {
      ticks.push(y);
    }
    if (!ticks.includes(MAX_YEAR)) ticks.push(MAX_YEAR);
    return ticks;
  }, []);

  // Calculate percentage offset for a given year on horizontal track
  const getYearPercent = (year: number) => {
    const clamped = Math.max(MIN_YEAR, Math.min(MAX_YEAR, year));
    return ((clamped - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
  };

  // Helper for highlighting query match
  const highlightMatch = (text: string) => {
    if (!searchQuery.trim()) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="bg-amber-200 text-slate-900 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 mb-8 shadow-sm">
      
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 font-mono tracking-tight">
              APT Operational Lifecycle & Dormancy Timeline
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-mono">
            Interactive Gantt visualization comparing active campaign surges vs post-indictment dormant periods (2004 – 2026).
          </p>
        </div>

        {/* Filter Pills & Sorting Options */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status Filter Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-mono">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({data.length})
            </button>
            <button
              onClick={() => setStatusFilter('Active')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all ${
                statusFilter === 'Active'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active ({stats.activeCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('Dormant')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all ${
                statusFilter === 'Dormant'
                  ? 'bg-slate-700 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Moon className="w-3 h-3 text-slate-400" />
              <span>Dormant ({stats.dormantCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('Intermittent')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all ${
                statusFilter === 'Intermittent'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Intermittent ({stats.intermittentCount})</span>
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-mono">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5">Sort:</span>
            <button
              onClick={() => setSortBy('status')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                sortBy === 'status' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Status
            </button>
            <button
              onClick={() => setSortBy('year')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                sortBy === 'year' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              First Seen
            </button>
            <button
              onClick={() => setSortBy('id')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                sortBy === 'id' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              APT Designation
            </button>
          </div>

        </div>
      </div>

      {/* Legend & Quick Statistics Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4 mb-6 text-xs font-mono text-slate-700 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
        
        {/* Legend item: Surge */}
        <div className="flex items-center gap-2">
          <span className="w-4 h-3 rounded bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-xs border border-emerald-400" />
          <div>
            <strong className="text-slate-900 font-bold block">Surge / High Operations</strong>
            <span className="text-[10px] text-slate-500">Active campaigns & zero-day exploits</span>
          </div>
        </div>

        {/* Legend item: Standard Active */}
        <div className="flex items-center gap-2">
          <span className="w-4 h-3 rounded bg-cyan-500 border border-cyan-400" />
          <div>
            <strong className="text-slate-900 font-bold block">Active Operational Window</strong>
            <span className="text-[10px] text-slate-500">Continuous reconnaissance & intrusions</span>
          </div>
        </div>

        {/* Legend item: Dormant */}
        <div className="flex items-center gap-2">
          <span className="w-4 h-3 rounded bg-slate-200 border border-slate-300 relative overflow-hidden">
            <span className="absolute inset-0 opacity-40 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:3px_3px]" />
          </span>
          <div>
            <strong className="text-slate-900 font-bold block">Dormant / Post-Indictment</strong>
            <span className="text-[10px] text-slate-500">Inactivity, disbanded, or rebranded</span>
          </div>
        </div>

        {/* Legend item: Legal Enforcement Marker */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-red-200">
            ⚖️
          </div>
          <div>
            <strong className="text-slate-900 font-bold block">Legal Action Trigger</strong>
            <span className="text-[10px] text-slate-500">US DOJ Indictment or OFAC Sanctions</span>
          </div>
        </div>

      </div>

      {/* Main Gantt Timeline Chart Container */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[850px]">
          
          {/* Timeline Header Row (Years 2004 - 2026) */}
          <div className="flex items-center border-b border-slate-200 pb-2 mb-2 font-mono text-[11px] text-slate-500 font-bold">
            
            {/* Sticky/Fixed Left Label Header */}
            <div className="w-64 shrink-0 pr-4 pl-2 text-slate-700">
              APT Group / Taxonomy
            </div>

            {/* Timeline Year Grid Header */}
            <div className="flex-1 relative h-6 flex items-center">
              {yearTicks.map((year) => {
                const percent = getYearPercent(year);
                return (
                  <div
                    key={year}
                    onMouseEnter={() => setHoveredYear(year)}
                    onMouseLeave={() => setHoveredYear(null)}
                    style={{ left: `${percent}%` }}
                    className={`absolute -translate-x-1/2 cursor-pointer transition-colors px-1 py-0.5 rounded ${
                      hoveredYear === year ? 'bg-blue-600 text-white font-bold' : 'hover:text-slate-900'
                    }`}
                  >
                    {year}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline Body Rows */}
          <div className="space-y-2 relative">
            
            {/* Year Hover Vertical Guide Line */}
            {hoveredYear && (
              <div
                style={{
                  left: `calc(16rem + ${(getYearPercent(hoveredYear) * (100 - (256 / 850) * 100)) / 100}%)`,
                }}
                className="absolute top-0 bottom-0 w-0.5 bg-blue-500/40 z-20 pointer-events-none border-r border-dashed border-blue-600"
              />
            )}

            <AnimatePresence>
              {filteredApts.map((apt) => {
                const isCurrentlyActive = apt.currentStatus === 'Active';
                const isIntermittent = apt.currentStatus === 'Intermittent';

                return (
                  <motion.div
                    key={apt.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onSelectApt(apt)}
                    className="flex items-center bg-slate-50/70 hover:bg-slate-100/90 border border-slate-200/80 rounded-lg p-2 transition-all cursor-pointer group"
                  >
                    
                    {/* Left APT Meta Info Column */}
                    <div className="w-64 shrink-0 pr-4 pl-1 flex items-center justify-between gap-2 overflow-hidden">
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                            {highlightMatch(apt.classification)}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            ({apt.id})
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-cyan-800 truncate">
                          {highlightMatch(apt.microsoftTaxonomy)}
                        </div>
                      </div>

                      {/* Status Tag Pill */}
                      <span
                        className={`shrink-0 px-2 py-0.5 text-[10px] font-mono font-bold rounded-full flex items-center gap-1 ${
                          isCurrentlyActive
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isIntermittent
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-200 text-slate-700 border border-slate-300'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isCurrentlyActive
                              ? 'bg-emerald-500 animate-ping'
                              : isIntermittent
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span>{apt.currentStatus}</span>
                      </span>
                    </div>

                    {/* Right Timeline Gantt Track Container */}
                    <div className="flex-1 relative h-8 bg-slate-200/50 rounded border border-slate-200/60 overflow-hidden flex items-center px-1">
                      
                      {/* Vertical Year Grid Guidelines in background */}
                      {yearTicks.map((year) => (
                        <div
                          key={year}
                          style={{ left: `${getYearPercent(year)}%` }}
                          className="absolute top-0 bottom-0 w-px bg-slate-200/80 pointer-events-none"
                        />
                      ))}

                      {/* Render Activity Spans */}
                      {apt.spans.map((span, sIdx) => {
                        const startPct = getYearPercent(span.startYear);
                        const endPct = getYearPercent(span.endYear);
                        const widthPct = Math.max(1.5, endPct - startPct);

                        const isSurge = span.status === 'surge';
                        const isActive = span.status === 'active';
                        const isDormant = span.status === 'dormant';

                        return (
                          <div
                            key={sIdx}
                            onMouseEnter={() => setHoveredSpan({ aptId: apt.id, span })}
                            onMouseLeave={() => setHoveredSpan(null)}
                            style={{
                              left: `${startPct}%`,
                              width: `${widthPct}%`,
                            }}
                            className={`absolute h-6 rounded flex items-center justify-center transition-all px-1.5 group/span ${
                              isSurge
                                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-xs font-bold ring-1 ring-emerald-300'
                                : isActive
                                ? 'bg-cyan-600 text-white font-semibold'
                                : 'bg-slate-300 text-slate-600 border border-dashed border-slate-400/80'
                            }`}
                            title={`${span.label || span.status}: ${span.startYear} – ${span.endYear}`}
                          >
                            {/* Inner label for wide enough bars */}
                            {widthPct > 12 && (
                              <span className="text-[10px] font-mono truncate drop-shadow-2xs">
                                {span.label || span.status}
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {/* Render Legal Action Enforcement Icon Marker (if year is available) */}
                      {apt.legalActionYear && (
                        <div
                          style={{ left: `${getYearPercent(apt.legalActionYear)}%` }}
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                          title={`Legal Enforcement (${apt.legalActionDate}): ${apt.legalActions}`}
                        >
                          <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px] shadow-sm ring-2 ring-white hover:scale-125 transition-transform">
                            ⚖️
                          </div>
                        </div>
                      )}

                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Hovered Span Detail Bar / Info Footer */}
      <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-mono text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span>
            {hoveredSpan ? (
              <span className="text-slate-900 font-semibold">
                Inspecting Period: <strong className="text-blue-700">{hoveredSpan.span.label}</strong> ({hoveredSpan.span.startYear} – {hoveredSpan.span.endYear}) — Status: <span className="uppercase font-bold">{hoveredSpan.span.status}</span>
              </span>
            ) : (
              'Hover over any timeline segment or legal action icon to view specific campaign details. Click any row to view full dossier.'
            )}
          </span>
        </div>

        <div className="text-[11px] text-slate-400">
          Updated Threat Intelligence Database (2026)
        </div>
      </div>

    </div>
  );
};
