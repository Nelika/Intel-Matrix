import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Grid,
  Flame,
  Building2,
  Download,
  Search,
  ExternalLink,
  AlertTriangle,
  Sparkles,
  Filter,
  FileCode,
  Activity,
  Layers,
  ChevronRight,
  Info,
  Check,
  Zap,
} from 'lucide-react';
import { AptGroup } from '../types';
import { CisaAdvisory } from './CisaIcsAdvisoriesFeed';

interface ThreatHeatmapProps {
  aptGroups: AptGroup[];
  onSelectSector?: (sector: string) => void;
  selectedSector?: string;
  onSelectApt?: (apt: AptGroup) => void;
}

export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface HeatmapCellData {
  sector: string;
  threatLevel: ThreatLevel;
  count: number;
  aptItems: AptGroup[];
  cisaItems: CisaAdvisory[];
  cves: string[];
}

const PRIMARY_SECTORS = [
  'Energy',
  'Defense',
  'Aerospace',
  'Healthcare',
  'Financial Services',
  'Critical Manufacturing',
  'IT & Telecommunications',
  'Water & Wastewater',
  'Transportation',
  'Chemical',
  'Government',
];

const THREAT_LEVELS: { id: ThreatLevel; label: string; cvss: string; color: string; bgBadge: string }[] = [
  {
    id: 'CRITICAL',
    label: 'Critical',
    cvss: 'CVSS 9.0–10.0',
    color: 'text-red-400',
    bgBadge: 'bg-red-950 text-red-300 border-red-800',
  },
  {
    id: 'HIGH',
    label: 'High',
    cvss: 'CVSS 7.0–8.9',
    color: 'text-orange-400',
    bgBadge: 'bg-orange-950 text-orange-300 border-orange-800',
  },
  {
    id: 'MEDIUM',
    label: 'Medium',
    cvss: 'CVSS 4.0–6.9',
    color: 'text-amber-400',
    bgBadge: 'bg-amber-950 text-amber-300 border-amber-800',
  },
  {
    id: 'LOW',
    label: 'Low / Advisory',
    cvss: 'CVSS 0.1–3.9',
    color: 'text-emerald-400',
    bgBadge: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  },
];

export const ThreatHeatmap: React.FC<ThreatHeatmapProps> = ({
  aptGroups,
  onSelectSector,
  selectedSector,
  onSelectApt,
}) => {
  const [dataView, setDataView] = useState<'COMBINED' | 'CISA' | 'APT'>('COMBINED');
  const [searchSector, setSearchSector] = useState<string>('');
  const [selectedCell, setSelectedCell] = useState<{ sector: string; threatLevel: ThreatLevel } | null>(null);
  const [cisaAdvisories, setCisaAdvisories] = useState<CisaAdvisory[]>([]);
  const [isLoadingCisa, setIsLoadingCisa] = useState<boolean>(false);

  // Load CISA Advisories from compiled local storage & API
  useEffect(() => {
    const reloadLocalCisa = () => {
      try {
        const saved = localStorage.getItem('cisa_ics_accumulated_advisories_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCisaAdvisories(parsed);
          }
        }
      } catch (e) {
        console.warn('ThreatHeatmap error reading accumulated CISA advisories:', e);
      }
    };

    const loadCisaData = async () => {
      setIsLoadingCisa(true);
      reloadLocalCisa();

      try {
        const res = await fetch('/api/cisa-advisories');
        if (res.ok) {
          const json = await res.json();
          if (json.advisories && Array.isArray(json.advisories)) {
            setCisaAdvisories((prev) => {
              const map = new Map<string, CisaAdvisory>();
              prev.forEach((item) => {
                const key = item.advisoryId || item.id || item.link;
                if (key) map.set(key, item);
              });
              json.advisories.forEach((item: CisaAdvisory) => {
                const key = item.advisoryId || item.id || item.link;
                if (key) map.set(key, item);
              });
              const compiled = Array.from(map.values());
              try {
                localStorage.setItem('cisa_ics_accumulated_advisories_v2', JSON.stringify(compiled));
              } catch (e) {
                console.warn('ThreatHeatmap failed saving compiled advisories to localStorage:', e);
              }
              return compiled;
            });
          }
        }
      } catch (err) {
        console.warn('ThreatHeatmap CISA data load error:', err);
      } finally {
        setIsLoadingCisa(false);
      }
    };

    loadCisaData();

    window.addEventListener('storage', reloadLocalCisa);
    window.addEventListener('cisa_data_updated', reloadLocalCisa);

    return () => {
      window.removeEventListener('storage', reloadLocalCisa);
      window.removeEventListener('cisa_data_updated', reloadLocalCisa);
    };
  }, []);

  // Helper to map APT group to threat level
  const getAptThreatLevel = (apt: AptGroup): ThreatLevel => {
    if (apt.currentStatus === 'Active' && (apt.sponsoringOrgType === 'PLA' || apt.sponsoringOrgType === 'MSS')) {
      return 'CRITICAL';
    }
    if (apt.currentStatus === 'Active' || apt.legalCategory === 'Indictment') {
      return 'HIGH';
    }
    if (apt.legalCategory === 'Sanctions' || apt.legalCategory === 'Asset Freeze') {
      return 'MEDIUM';
    }
    return 'LOW';
  };

  // Helper to map CISA Advisory to threat level based on CVSS / Impact formula
  const getCisaThreatLevel = (advisory: CisaAdvisory): ThreatLevel => {
    const text = `${advisory.title} ${advisory.summary}`.toLowerCase();
    let baseScore = 6.5;

    if (
      text.includes('remote code execution') ||
      text.includes('unauthenticated') ||
      text.includes('buffer overflow') ||
      text.includes('command injection') ||
      text.includes('zero-day')
    ) {
      baseScore = 9.2 + Math.min(advisory.cves.length * 0.2, 0.8);
    } else if (
      text.includes('denial of service') ||
      text.includes('privilege escalation') ||
      text.includes('bypass') ||
      text.includes('authentication')
    ) {
      baseScore = 7.8 + Math.min(advisory.cves.length * 0.2, 0.8);
    } else if (
      text.includes('cross-site') ||
      text.includes('information disclosure') ||
      text.includes('improper') ||
      text.includes('exposure')
    ) {
      baseScore = 5.2 + Math.min(advisory.cves.length * 0.2, 0.8);
    } else {
      baseScore = 4.0 + Math.min(advisory.cves.length * 0.2, 1.0);
    }

    const score = Math.min(Math.max(Math.round(baseScore * 10) / 10, 2.5), 10.0);
    if (score >= 9.0) return 'CRITICAL';
    if (score >= 7.0) return 'HIGH';
    if (score >= 4.5) return 'MEDIUM';
    return 'LOW';
  };

  // Filtered Sectors list
  const filteredSectors = useMemo(() => {
    if (!searchSector.trim()) return PRIMARY_SECTORS;
    return PRIMARY_SECTORS.filter((s) => s.toLowerCase().includes(searchSector.toLowerCase()));
  }, [searchSector]);

  // Compute Heatmap Matrix Data
  const heatmapData = useMemo(() => {
    const matrix: Record<string, Record<ThreatLevel, HeatmapCellData>> = {};

    // Initialize matrix
    PRIMARY_SECTORS.forEach((sec) => {
      matrix[sec] = {
        CRITICAL: { sector: sec, threatLevel: 'CRITICAL', count: 0, aptItems: [], cisaItems: [], cves: [] },
        HIGH: { sector: sec, threatLevel: 'HIGH', count: 0, aptItems: [], cisaItems: [], cves: [] },
        MEDIUM: { sector: sec, threatLevel: 'MEDIUM', count: 0, aptItems: [], cisaItems: [], cves: [] },
        LOW: { sector: sec, threatLevel: 'LOW', count: 0, aptItems: [], cisaItems: [], cves: [] },
      };
    });

    // Match APT Groups
    if (dataView === 'COMBINED' || dataView === 'APT') {
      aptGroups.forEach((apt) => {
        const level = getAptThreatLevel(apt);
        apt.targetedSectors.forEach((sec) => {
          // Fuzzy match against primary sectors
          const matchedSector = PRIMARY_SECTORS.find(
            (p) => sec.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(sec.toLowerCase())
          );
          const targetKey = matchedSector || 'Critical Manufacturing';
          if (matrix[targetKey] && matrix[targetKey][level]) {
            matrix[targetKey][level].aptItems.push(apt);
            matrix[targetKey][level].count += 1;
          }
        });
      });
    }

    // Match CISA Advisories
    if (dataView === 'COMBINED' || dataView === 'CISA') {
      cisaAdvisories.forEach((adv) => {
        const level = getCisaThreatLevel(adv);
        adv.sectors.forEach((sec) => {
          const matchedSector = PRIMARY_SECTORS.find(
            (p) => sec.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(sec.toLowerCase())
          );
          const targetKey = matchedSector || 'Critical Manufacturing';
          if (matrix[targetKey] && matrix[targetKey][level]) {
            matrix[targetKey][level].cisaItems.push(adv);
            matrix[targetKey][level].count += 1;
            adv.cves.forEach((cve) => {
              if (!matrix[targetKey][level].cves.includes(cve)) {
                matrix[targetKey][level].cves.push(cve);
              }
            });
          }
        });
      });
    }

    return matrix;
  }, [aptGroups, cisaAdvisories, dataView]);

  // Aggregate stats across matrix
  const stats = useMemo(() => {
    let totalCount = 0;
    let criticalCount = 0;
    let highCount = 0;
    let peakSector = { name: 'None', count: 0 };

    PRIMARY_SECTORS.forEach((sec) => {
      let sectorTotal = 0;
      THREAT_LEVELS.forEach((lvl) => {
        const cell = heatmapData[sec]?.[lvl.id];
        if (cell) {
          const c = cell.count;
          totalCount += c;
          sectorTotal += c;
          if (lvl.id === 'CRITICAL') criticalCount += c;
          if (lvl.id === 'HIGH') highCount += c;
        }
      });
      if (sectorTotal > peakSector.count) {
        peakSector = { name: sec, count: sectorTotal };
      }
    });

    const criticalRatio = totalCount > 0 ? Math.round(((criticalCount + highCount) / totalCount) * 100) : 0;

    return { totalCount, criticalCount, highCount, peakSector, criticalRatio };
  }, [heatmapData]);

  // Get cell color classes based on frequency count
  const getCellClasses = (count: number, isSelected: boolean) => {
    let base = 'transition-all duration-300 relative p-3 sm:p-4 rounded-xl border flex flex-col justify-between cursor-pointer select-none min-h-[88px] ';

    if (isSelected) {
      base += 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 z-20 scale-[1.02] ';
    }

    if (count === 0) {
      return base + 'bg-slate-900/40 text-slate-600 border-slate-800/50 hover:bg-slate-800/40 hover:border-slate-700';
    }
    if (count >= 1 && count <= 2) {
      return base + 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50 hover:border-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_12px_rgba(16,185,129,0.12)]';
    }
    if (count >= 3 && count <= 5) {
      return base + 'bg-amber-950/50 text-amber-200 border-amber-700/60 hover:border-amber-400 hover:bg-amber-900/70 shadow-[0_0_15px_rgba(245,158,11,0.18)]';
    }
    if (count >= 6 && count <= 9) {
      return base + 'bg-orange-950/70 text-orange-200 border-orange-600/70 hover:border-orange-400 hover:bg-orange-900/80 shadow-[0_0_18px_rgba(249,115,22,0.25)]';
    }
    // 10+
    return base + 'bg-red-950/90 text-red-100 border-red-500 hover:border-red-400 hover:bg-red-900 shadow-[0_0_22px_rgba(239,68,68,0.35)]';
  };

  // Export Matrix to CSV
  const handleExportCsv = () => {
    const headers = ['Industry Sector', 'Critical Threats', 'High Threats', 'Medium Threats', 'Low Threats', 'Total Density'];
    const rows = PRIMARY_SECTORS.map((sec) => {
      const c = heatmapData[sec]?.CRITICAL?.count || 0;
      const h = heatmapData[sec]?.HIGH?.count || 0;
      const m = heatmapData[sec]?.MEDIUM?.count || 0;
      const l = heatmapData[sec]?.LOW?.count || 0;
      return [`"${sec}"`, c, h, m, l, c + h + m + l];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `threat_heatmap_matrix_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Matrix to JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(heatmapData, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = `threat_heatmap_matrix_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentCellData = selectedCell ? heatmapData[selectedCell.sector]?.[selectedCell.threatLevel] : null;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 text-white shadow-2xl relative overflow-hidden my-6">
      {/* Background Ambient Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-950/30 via-slate-950/0 to-slate-950/0 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:28px_28px] opacity-40 pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-1.5 rounded-lg bg-red-950 border border-red-800 text-red-400">
              <Flame className="w-5 h-5 animate-pulse" />
            </span>
            <h3 className="text-base sm:text-lg font-bold font-mono tracking-tight text-white flex items-center gap-2">
              <span>Threat Heatmap: Industry Sector Exposure Grid</span>
              <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded font-mono uppercase">
                Risk Matrix
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Color-coded frequency matrix visualizing active threat severity across critical infrastructure sectors.
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Segmented Switch */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-mono">
            <button
              onClick={() => setDataView('COMBINED')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                dataView === 'COMBINED' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Combined Data
            </button>
            <button
              onClick={() => setDataView('CISA')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                dataView === 'CISA' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              CISA Stream
            </button>
            <button
              onClick={() => setDataView('APT')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                dataView === 'APT' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              APT Groups
            </button>
          </div>

          {/* Export Options */}
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export heatmap frequency data as CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-purple-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export heatmap frequency data as JSON"
          >
            <FileCode className="w-3.5 h-3.5 text-purple-400" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Summary Row */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-red-400" />
            Peak Risk Sector
          </div>
          <div className="text-sm font-bold font-mono text-red-300 truncate">{stats.peakSector.name}</div>
          <div className="text-[10px] text-slate-500 font-mono">{stats.peakSector.count} Advisories/APTs</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-orange-400" />
            Critical & High Ratio
          </div>
          <div className="text-sm font-bold font-mono text-orange-300">{stats.criticalRatio}%</div>
          <div className="text-[10px] text-slate-500 font-mono">{stats.criticalCount + stats.highCount} High Severity Items</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400" />
            Total Mapped Threat Density
          </div>
          <div className="text-sm font-bold font-mono text-cyan-300">{stats.totalCount}</div>
          <div className="text-[10px] text-slate-500 font-mono">Cross-Referenced</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Active Sectors
          </div>
          <div className="text-sm font-bold font-mono text-amber-300">{PRIMARY_SECTORS.length} Sectors</div>
          <div className="text-[10px] text-slate-500 font-mono">Critical Infrastructure</div>
        </div>
      </div>

      {/* Legend & Search Row */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl text-xs">
        {/* Color Key Legend */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <span className="text-slate-400 font-bold mr-1">Intensity:</span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-3 h-3 rounded bg-slate-900 border border-slate-800 inline-block" /> 0
          </span>
          <span className="flex items-center gap-1 text-emerald-300">
            <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-800 inline-block" /> 1–2
          </span>
          <span className="flex items-center gap-1 text-amber-300">
            <span className="w-3 h-3 rounded bg-amber-950 border border-amber-700 inline-block" /> 3–5
          </span>
          <span className="flex items-center gap-1 text-orange-300">
            <span className="w-3 h-3 rounded bg-orange-950 border border-orange-600 inline-block" /> 6–9
          </span>
          <span className="flex items-center gap-1 text-red-300">
            <span className="w-3 h-3 rounded bg-red-950 border border-red-500 inline-block" /> 10+
          </span>
        </div>

        {/* Sector Filter Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchSector}
            onChange={(e) => setSearchSector(e.target.value)}
            placeholder="Filter sector grid..."
            className="w-full bg-slate-950 border border-slate-700 text-white pl-8 pr-7 py-1 rounded-lg text-xs font-mono focus:outline-none focus:border-red-500"
          />
          {searchSector && (
            <button
              onClick={() => setSearchSector('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Heatmap Grid Matrix */}
      <div className="relative z-10 overflow-x-auto pb-2">
        <div className="min-w-[700px]">
          {/* Header Columns */}
          <div className="grid grid-cols-5 gap-2 mb-2 font-mono text-xs">
            <div className="p-2 text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span>Industry Sector</span>
            </div>

            {THREAT_LEVELS.map((lvl) => (
              <div
                key={lvl.id}
                className="p-2 bg-slate-900/80 border border-slate-800 rounded-xl text-center flex flex-col items-center justify-center"
              >
                <span className={`font-bold ${lvl.color}`}>{lvl.label}</span>
                <span className="text-[10px] text-slate-500">{lvl.cvss}</span>
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          <div className="space-y-2">
            {filteredSectors.map((sector) => {
              const isSectorHighlighted = selectedSector?.toLowerCase() === sector.toLowerCase();

              return (
                <div
                  key={sector}
                  className={`grid grid-cols-5 gap-2 transition-colors rounded-xl p-1 ${
                    isSectorHighlighted ? 'bg-cyan-950/30 border border-cyan-800/50' : ''
                  }`}
                >
                  {/* Sector Name Label */}
                  <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between group">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="w-1.5 h-6 rounded-full bg-slate-700 group-hover:bg-cyan-400 transition-colors" />
                      <span className="font-mono text-xs font-bold text-slate-200 truncate">{sector}</span>
                    </div>

                    {onSelectSector && (
                      <button
                        onClick={() => onSelectSector(sector)}
                        className="text-[10px] text-slate-500 hover:text-cyan-300 font-mono underline shrink-0 cursor-pointer"
                        title={`Filter entire app by ${sector}`}
                      >
                        Filter
                      </button>
                    )}
                  </div>

                  {/* Threat Level Columns for this Sector */}
                  {THREAT_LEVELS.map((lvl) => {
                    const cell = heatmapData[sector]?.[lvl.id] || {
                      sector,
                      threatLevel: lvl.id,
                      count: 0,
                      aptItems: [],
                      cisaItems: [],
                      cves: [],
                    };

                    const isSelected = selectedCell?.sector === sector && selectedCell?.threatLevel === lvl.id;

                    return (
                      <div
                        key={lvl.id}
                        onClick={() => setSelectedCell({ sector, threatLevel: lvl.id })}
                        className={getCellClasses(cell.count, isSelected)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[10px] font-mono opacity-60 uppercase">{lvl.label.split(' ')[0]}</span>
                          {cell.count > 0 && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/40 border border-white/10 font-bold">
                              {cell.cisaItems.length > 0 && cell.aptItems.length > 0
                                ? 'BOTH'
                                : cell.cisaItems.length > 0
                                ? 'CISA'
                                : 'APT'}
                            </span>
                          )}
                        </div>

                        <div className="my-1 flex items-baseline justify-between">
                          <span className="text-xl sm:text-2xl font-black font-mono tracking-tight">{cell.count}</span>
                          {cell.cves.length > 0 && (
                            <span className="text-[9px] font-mono text-amber-300/80">{cell.cves.length} CVEs</span>
                          )}
                        </div>

                        {/* Sub-bar indicator */}
                        <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              lvl.id === 'CRITICAL'
                                ? 'bg-red-500'
                                : lvl.id === 'HIGH'
                                ? 'bg-orange-500'
                                : lvl.id === 'MEDIUM'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min((cell.count / 15) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Cell Inspector Drawer / Modal Panel */}
      <AnimatePresence>
        {selectedCell && currentCellData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-20 mt-6 pt-5 border-t border-slate-800 bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-cyan-800/80 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold">
                    INSPECTOR
                  </span>
                  <span className="text-sm font-bold font-mono text-white">
                    {selectedCell.sector} Sector Matrix Cell
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded border font-mono font-bold ${
                      THREAT_LEVELS.find((t) => t.id === selectedCell.threatLevel)?.bgBadge
                    }`}
                  >
                    {selectedCell.threatLevel} THREAT LEVEL
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans">
                  Detailed cross-reference of {currentCellData.count} threat indicators mapped to {selectedCell.sector}.
                </p>
              </div>

              <button
                onClick={() => setSelectedCell(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            {/* Cell Content Tabs & Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-sans">
              {/* CISA Advisories in this Cell */}
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl">
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800 font-mono">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <ShieldAlert className="w-4 h-4 text-cyan-400" />
                    <span>CISA Advisories ({currentCellData.cisaItems.length})</span>
                  </div>
                </div>

                {currentCellData.cisaItems.length === 0 ? (
                  <p className="text-slate-500 italic py-3 text-center text-xs">
                    No CISA advisories recorded for this threat tier.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {currentCellData.cisaItems.map((adv) => (
                      <div
                        key={adv.id}
                        className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg hover:border-cyan-700/80 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-mono text-cyan-400 font-bold">{adv.advisoryId}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(adv.pubDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-bold text-slate-200 line-clamp-1 mb-1">{adv.title}</p>
                        <div className="flex flex-wrap items-center gap-1">
                          {adv.cves.map((cve) => (
                            <span
                              key={cve}
                              className="text-[9px] font-mono px-1.5 py-0.2 bg-amber-950/80 border border-amber-800 text-amber-300 rounded"
                            >
                              {cve}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* APT Groups in this Cell */}
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl">
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800 font-mono">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>APT Threat Groups ({currentCellData.aptItems.length})</span>
                  </div>
                </div>

                {currentCellData.aptItems.length === 0 ? (
                  <p className="text-slate-500 italic py-3 text-center text-xs">
                    No APT groups categorized under this severity tier.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {currentCellData.aptItems.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg hover:border-amber-700/80 transition-colors flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-100 font-mono">{apt.classification}</span>
                            <span className="text-[10px] text-amber-400 font-mono font-bold">({apt.id})</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono">{apt.sponsoringAuthority}</p>
                        </div>

                        {onSelectApt && (
                          <button
                            onClick={() => onSelectApt(apt)}
                            className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-700 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer shrink-0"
                          >
                            Inspect APT
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Footer */}
            {onSelectSector && (
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  Quick filter app dashboard by <strong className="text-cyan-300">{selectedCell.sector}</strong>
                </span>

                <button
                  onClick={() => onSelectSector(selectedCell.sector)}
                  className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Apply Sector Filter</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
