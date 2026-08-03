import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  Gavel,
  ShieldAlert,
  AlertTriangle,
  Ban,
  FileText,
  Building2,
  Info,
  Filter,
  Maximize2,
  Minimize2,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AptGroup } from '../types';

interface HorizontalSvgTimelineProps {
  data: AptGroup[];
  onSelectApt: (apt: AptGroup) => void;
  selectedAptId?: string;
}

interface TimelineEvent {
  id: string;
  apt: AptGroup;
  year: number;
  dateStr: string;
  type: 'legal' | 'first_observed' | 'last_observed';
  category?: string;
  title: string;
  description: string;
  sponsoringOrg: string;
}

export const HorizontalSvgTimeline: React.FC<HorizontalSvgTimelineProps> = ({
  data,
  onSelectApt,
  selectedAptId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null);
  const [hoveredApt, setHoveredApt] = useState<AptGroup | null>(null);
  const [filterEventType, setFilterEventType] = useState<'ALL' | 'LEGAL' | 'LIFESPAN'>('ALL');
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('ALL');
  const [yearRange, setYearRange] = useState<[number, number]>([2004, 2026]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Extract year boundaries across all dataset
  const minYearDataset = 2004;
  const maxYearDataset = 2026;

  // Generate timeline event points from APT groups
  const { timelineEvents, aptRows } = useMemo(() => {
    let filteredApts = data || [];

    if (selectedOrgFilter !== 'ALL') {
      filteredApts = filteredApts.filter((apt) => apt?.sponsoringOrgType === selectedOrgFilter);
    }

    const events: TimelineEvent[] = [];

    filteredApts.forEach((apt) => {
      // 1. Legal Action Event
      if (apt.legalActionYear && apt.legalActionYear >= yearRange[0] && apt.legalActionYear <= yearRange[1]) {
        events.push({
          id: `${apt.id}-legal`,
          apt,
          year: apt.legalActionYear,
          dateStr: apt.legalActionDate || `${apt.legalActionYear}`,
          type: 'legal',
          category: apt.legalCategory,
          title: `${apt.classification} (${apt.legalCategory})`,
          description: apt.legalActions,
          sponsoringOrg: apt.sponsoringOrgType,
        });
      }

      // 2. First Observed Event
      if (
        apt.firstObservedYear &&
        apt.firstObservedYear >= yearRange[0] &&
        apt.firstObservedYear <= yearRange[1] &&
        filterEventType !== 'LEGAL'
      ) {
        events.push({
          id: `${apt.id}-first`,
          apt,
          year: apt.firstObservedYear,
          dateStr: `First Observed ${apt.firstObservedYear}`,
          type: 'first_observed',
          title: `${apt.classification} Initial Discovery`,
          description: `First documented threat intelligence telemetry recorded in ${apt.firstObservedYear}.`,
          sponsoringOrg: apt.sponsoringOrgType,
        });
      }
    });

    // Sort APT rows by first observed year for neat vertical ordering
    const sortedAptRows = [...filteredApts].sort(
      (a, b) => a.firstObservedYear - b.firstObservedYear
    );

    return { timelineEvents: events, aptRows: sortedAptRows };
  }, [data, selectedOrgFilter, yearRange, filterEventType]);

  // Unique Sponsoring Orgs for filtering
  const sponsoringOrgs = useMemo(() => {
    const orgs = new Set(data.map((d) => d.sponsoringOrgType));
    return ['ALL', ...Array.from(orgs)];
  }, [data]);

  // Year tick markers for horizontal axis
  const yearTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = 2; // every 2 years
    for (let y = yearRange[0]; y <= yearRange[1]; y += step) {
      ticks.push(y);
    }
    if (ticks[ticks.length - 1] !== yearRange[1]) {
      ticks.push(yearRange[1]);
    }
    return ticks;
  }, [yearRange]);

  // SVG Dimension Calculations
  const svgWidth = 1000;
  const paddingLeft = 140; // label column on left
  const paddingRight = 40;
  const paddingTop = 45; // axis & header space
  const rowHeight = 36;
  const svgHeight = paddingTop + aptRows.length * rowHeight + 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;

  // Helper function to map a calendar year to SVG X coordinate
  const getXCoordinate = (year: number) => {
    const clampedYear = Math.max(yearRange[0], Math.min(yearRange[1], year));
    const ratio = (clampedYear - yearRange[0]) / (yearRange[1] - yearRange[0] || 1);
    return paddingLeft + ratio * chartWidth;
  };

  // Color mapper for legal categories
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Indictment':
        return { fill: '#ef4444', stroke: '#dc2626', text: 'text-red-400', label: 'Indictment' };
      case 'Sanctions':
        return { fill: '#f59e0b', stroke: '#d97706', text: 'text-amber-400', label: 'Sanctions' };
      case 'Asset Freeze':
        return { fill: '#a855f7', stroke: '#9333ea', text: 'text-purple-400', label: 'Asset Freeze' };
      case 'Advisory':
        return { fill: '#06b6d4', stroke: '#0891b2', text: 'text-cyan-400', label: 'Advisory' };
      case 'Exposure Report':
      default:
        return { fill: '#10b981', stroke: '#059669', text: 'text-emerald-400', label: 'Exposure Report' };
    }
  };

  // Color mapper for Sponsoring Org tags
  const getOrgColor = (org: string) => {
    switch (org) {
      case 'MSS':
        return '#3b82f6'; // Blue
      case 'PLA':
        return '#ef4444'; // Red
      case 'MPS':
        return '#f59e0b'; // Amber
      case 'Defense / MSS':
        return '#a855f7'; // Purple
      default:
        return '#06b6d4'; // Cyan
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 mb-8 text-white shadow-xl relative overflow-hidden">
      
      {/* Background Subtle Cyber Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

      {/* Header & Controls Toolbar */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-blue-950 border border-blue-800 text-blue-400">
              <Clock className="w-5 h-5 animate-pulse" />
            </span>
            <h3 className="text-base font-bold text-white font-mono tracking-tight flex items-center gap-2">
              <span>Interactive SVG Chronological Analysis Timeline</span>
              <span className="text-[10px] bg-blue-900/80 text-blue-300 px-2 py-0.5 rounded border border-blue-700 font-mono font-bold uppercase">
                Vector Render
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Automated timeline extraction mapping <strong className="text-cyan-300">{aptRows.length}</strong> threat actors & legal enforcement dates ({yearRange[0]} – {yearRange[1]}).
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Org Filter Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs font-mono">
            <Layers className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <select
              value={selectedOrgFilter}
              onChange={(e) => setSelectedOrgFilter(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-mono focus:outline-none cursor-pointer pr-2"
            >
              {sponsoringOrgs.map((org) => (
                <option key={org} value={org} className="bg-slate-900 text-white">
                  {org === 'ALL' ? 'All Authorities' : org}
                </option>
              ))}
            </select>
          </div>

          {/* Event Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs font-mono">
            <button
              onClick={() => setFilterEventType('ALL')}
              className={`px-2 py-1 rounded transition-colors ${
                filterEventType === 'ALL'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilterEventType('LEGAL')}
              className={`px-2 py-1 rounded transition-colors ${
                filterEventType === 'LEGAL'
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Legal Only
            </button>
          </div>

          {/* Zoom / Expand Height Toggle */}
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono rounded-lg transition-colors cursor-pointer"
            title="Toggle Canvas Zoom"
          >
            {isExpanded ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Compact View</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Full Height</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Year Range Filter Slider */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 bg-slate-900/80 border border-slate-800/80 p-3 sm:px-4 sm:py-2.5 rounded-xl text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-300">
          <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Timeline Window: <strong className="text-cyan-300 font-bold">{yearRange[0]}</strong> to <strong className="text-cyan-300 font-bold">{yearRange[1]}</strong></span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-64 shrink-0">
          <span className="text-[10px] text-slate-500 shrink-0">2004</span>
          <input
            type="range"
            min={2004}
            max={2018}
            value={yearRange[0]}
            onChange={(e) => setYearRange([Number(e.target.value), yearRange[1]])}
            className="w-full accent-cyan-500 bg-slate-800 rounded h-1 cursor-pointer"
          />
          <input
            type="range"
            min={2019}
            max={2026}
            value={yearRange[1]}
            onChange={(e) => setYearRange([yearRange[0], Number(e.target.value)])}
            className="w-full accent-cyan-500 bg-slate-800 rounded h-1 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500 shrink-0">2026</span>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div
        ref={containerRef}
        className={`relative z-10 w-full overflow-x-auto rounded-xl border border-slate-800/90 bg-slate-900/60 p-2 scrollbar-thin scrollbar-thumb-slate-700 transition-all ${
          isExpanded ? 'max-h-[600px]' : 'max-h-[380px]'
        }`}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full min-w-[700px] h-auto font-mono select-none"
        >
          {/* Defs for gradients & shadow filters */}
          <defs>
            <linearGradient id="activeSpanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="dormantSpanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#64748b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#334155" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Horizontal Year Axis Grid & Ticks */}
          <g className="axis-grid">
            {/* Main Axis Baseline */}
            <line
              x1={paddingLeft}
              y1={paddingTop - 12}
              x2={svgWidth - paddingRight}
              y2={paddingTop - 12}
              stroke="#334155"
              strokeWidth="1.5"
            />

            {/* Year Ticks & Vertical Grid Lines */}
            {yearTicks.map((tickYear) => {
              const x = getXCoordinate(tickYear);
              return (
                <g key={tickYear}>
                  {/* Vertical background grid line */}
                  <line
                    x1={x}
                    y1={paddingTop - 12}
                    x2={x}
                    y2={svgHeight - 20}
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  {/* Tick marker */}
                  <line
                    x1={x}
                    y1={paddingTop - 16}
                    x2={x}
                    y2={paddingTop - 8}
                    stroke="#06b6d4"
                    strokeWidth="2"
                  />
                  {/* Year text label */}
                  <text
                    x={x}
                    y={paddingTop - 22}
                    fill="#94a3b8"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {tickYear}
                  </text>
                </g>
              );
            })}
          </g>

          {/* APT Swimlane Rows & Lifespans */}
          <g className="apt-rows">
            {aptRows.map((apt, index) => {
              const y = paddingTop + index * rowHeight + 16;
              const isSelected = selectedAptId === apt.id;
              const isHovered = hoveredApt?.id === apt.id;

              const xStart = getXCoordinate(apt.firstObservedYear);
              const xEnd = getXCoordinate(apt.lastObservedYear);
              const barWidth = Math.max(12, xEnd - xStart);

              const orgColor = getOrgColor(apt.sponsoringOrgType);

              return (
                <g
                  key={apt.id}
                  className="cursor-pointer group"
                  onClick={() => onSelectApt(apt)}
                  onMouseEnter={() => setHoveredApt(apt)}
                  onMouseLeave={() => setHoveredApt(null)}
                >
                  {/* Background Row Highlight */}
                  <rect
                    x="10"
                    y={y - rowHeight / 2 + 2}
                    width={svgWidth - 20}
                    height={rowHeight - 4}
                    rx="6"
                    fill={isSelected ? '#1e293b' : isHovered ? '#0f172a' : 'transparent'}
                    stroke={isSelected ? '#3b82f6' : isHovered ? '#334155' : 'transparent'}
                    strokeWidth="1"
                    className="transition-colors duration-150"
                  />

                  {/* Left Label (APT Classification & ID) */}
                  <text
                    x="20"
                    y={y + 4}
                    fill={isSelected ? '#38bdf8' : isHovered ? '#ffffff' : '#cbd5e1'}
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {apt.classification}
                  </text>
                  <text
                    x="85"
                    y={y + 4}
                    fill="#64748b"
                    fontSize="9"
                  >
                    ({apt.id})
                  </text>

                  {/* Sponsoring Org Tag Circle */}
                  <circle cx="125" cy={y} r="4" fill={orgColor} />

                  {/* Main Activity Span Rounded Bar */}
                  <rect
                    x={xStart}
                    y={y - 6}
                    width={barWidth}
                    height="12"
                    rx="6"
                    fill={apt.currentStatus === 'Active' ? 'url(#activeSpanGrad)' : 'url(#dormantSpanGrad)'}
                    stroke={orgColor}
                    strokeWidth="1"
                    opacity={isHovered || isSelected ? '1' : '0.85'}
                    filter={isHovered || isSelected ? 'url(#glow)' : undefined}
                  />

                  {/* First Observed Pin Circle */}
                  <circle
                    cx={xStart}
                    cy={y}
                    r="4"
                    fill="#0284c7"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />

                  {/* Last Observed / Present Pin Circle */}
                  <circle
                    cx={xEnd}
                    cy={y}
                    r="4"
                    fill={apt.lastObservedYear >= 2026 ? '#10b981' : '#64748b'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />

                  {/* Activity Label inside or beside bar if space allows */}
                  {barWidth > 60 && (
                    <text
                      x={xStart + barWidth / 2}
                      y={y + 3}
                      fill="#ffffff"
                      fontSize="8"
                      fontWeight="bold"
                      textAnchor="middle"
                      pointerEvents="none"
                    >
                      {apt.firstObservedYear}–{apt.lastObservedYear >= 2026 ? 'Present' : apt.lastObservedYear}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Legal Enforcement Event Nodes (Plotted as distinct diamonds / pins on top of swimlanes) */}
          <g className="legal-event-nodes">
            {timelineEvents.map((event) => {
              const rowIndex = aptRows.findIndex((a) => a.id === event.apt.id);
              if (rowIndex === -1) return null;

              const y = paddingTop + rowIndex * rowHeight + 16;
              const x = getXCoordinate(event.year);

              const categoryStyle = getCategoryColor(event.category);
              const isNodeHovered = hoveredEvent?.id === event.id;

              return (
                <g
                  key={event.id}
                  className="cursor-pointer group/node"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectApt(event.apt);
                  }}
                  onMouseEnter={() => {
                    setHoveredEvent(event);
                    setHoveredApt(event.apt);
                  }}
                  onMouseLeave={() => {
                    setHoveredEvent(null);
                    setHoveredApt(null);
                  }}
                >
                  {/* Event Pulse Halo on hover */}
                  {isNodeHovered && (
                    <circle
                      cx={x}
                      cy={y}
                      r="12"
                      fill={categoryStyle.fill}
                      opacity="0.3"
                      className="animate-ping"
                    />
                  )}

                  {/* Event Node Marker (Diamond shape for legal events) */}
                  <polygon
                    points={`${x},${y - 8} ${x + 7},${y} ${x},${y + 8} ${x - 7},${y}`}
                    fill={categoryStyle.fill}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    filter={isNodeHovered ? 'url(#glow)' : undefined}
                  />

                  {/* Event Year Flag Tag */}
                  <rect
                    x={x - 14}
                    y={y - 20}
                    width="28"
                    height="10"
                    rx="3"
                    fill="#0f172a"
                    stroke={categoryStyle.fill}
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={y - 12}
                    fill="#ffffff"
                    fontSize="7"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {event.year}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Hover HUD / Detail Banner */}
      <div className="relative z-10 mt-3 min-h-[58px] bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
        {hoveredEvent || hoveredApt ? (
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-blue-950 border border-blue-800 text-cyan-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-white text-sm">
                  {(hoveredEvent?.apt || hoveredApt)?.classification} ({(hoveredEvent?.apt || hoveredApt)?.id})
                </span>
                <span className="px-2 py-0.5 bg-blue-950 border border-blue-800 text-cyan-300 text-[10px] rounded font-bold">
                  {(hoveredEvent?.apt || hoveredApt)?.sponsoringOrgType} Authority
                </span>
                {hoveredEvent?.category && (
                  <span className="px-2 py-0.5 bg-red-950 border border-red-800 text-red-300 text-[10px] rounded font-bold">
                    {hoveredEvent.category} ({hoveredEvent.dateStr})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">
                {hoveredEvent
                  ? hoveredEvent.description
                  : `First observed ${hoveredApt?.firstObservedYear} • Active status: ${hoveredApt?.currentStatus} • Sponsoring: ${hoveredApt?.sponsoringAuthority}`}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400">
            <Info className="w-4 h-4 text-slate-500" />
            <span>Hover over any event node or timeline bar to inspect chronological threat intelligence details. Click to open dossier.</span>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-red-500 rotate-45 border border-white inline-block"></span>
            <span>Indictment</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-amber-500 rotate-45 border border-white inline-block"></span>
            <span>Sanctions</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-emerald-500 rotate-45 border border-white inline-block"></span>
            <span>Report</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-2 rounded bg-gradient-to-r from-blue-500 to-cyan-400 inline-block"></span>
            <span>Active Lifespan</span>
          </div>
        </div>
      </div>

    </div>
  );
};
