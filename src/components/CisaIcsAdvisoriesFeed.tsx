import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldAlert,
  Radio,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Download,
  Terminal,
  Cpu,
  Building2,
  Calendar,
  Zap,
  Check,
  AlertTriangle,
  FileCode,
  Layers,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Globe,
  Flame,
  ChevronDown,
  TrendingUp,
  BarChart2,
  Activity,
} from "lucide-react";
import { AptGroup } from "../types";

export interface CisaAdvisory {
  id: string;
  advisoryId: string;
  title: string;
  link: string;
  pubDate: string;
  vendor: string;
  summary: string;
  csafUrl?: string;
  cves: string[];
  sectors: string[];
  relatedAptIds: string[];
}

interface CisaIcsAdvisoriesFeedProps {
  aptGroups: AptGroup[];
  onSelectApt?: (apt: AptGroup) => void;
  onFilterBySector?: (sector: string) => void;
}

const HighlightText: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query || !query.trim()) {
    return <>{text}</>;
  }

  const trimmedQuery = query.trim();
  const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === trimmedQuery.toLowerCase() ? (
          <mark
            key={i}
            className="bg-amber-400/30 text-amber-200 font-bold px-0.5 rounded border border-amber-500/40"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

// Helper to derive vulnerability impact score & level from CISA advisory metadata
const getVulnerabilityImpact = (advisory: CisaAdvisory) => {
  const text = (advisory.title + " " + advisory.summary).toLowerCase();
  let baseScore = 6.5;

  if (
    text.includes("remote code execution") ||
    text.includes("unauthenticated") ||
    text.includes("critical") ||
    text.includes("zero-day") ||
    text.includes("command injection") ||
    text.includes("buffer overflow")
  ) {
    baseScore = 9.2 + Math.min(advisory.cves.length * 0.2, 0.7);
  } else if (
    text.includes("privilege escalation") ||
    text.includes("denial of service") ||
    text.includes("authentication bypass") ||
    text.includes("arbitrary file") ||
    advisory.cves.length >= 3
  ) {
    baseScore = 7.8 + Math.min(advisory.cves.length * 0.2, 0.8);
  } else if (
    text.includes("cross-site") ||
    text.includes("information disclosure") ||
    text.includes("improper") ||
    text.includes("exposure")
  ) {
    baseScore = 5.2 + Math.min(advisory.cves.length * 0.2, 0.8);
  } else {
    baseScore = 4.0 + Math.min(advisory.cves.length * 0.2, 1.0);
  }

  const score = Math.min(Math.max(Math.round(baseScore * 10) / 10, 2.5), 10.0);
  const percentage = (score / 10) * 100;

  let badgeClass = "bg-emerald-950 text-emerald-300 border-emerald-800";
  let barColor = "bg-emerald-500";
  let textColor = "text-emerald-400";
  let level = "LOW IMPACT";
  let category: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "LOW";

  if (score >= 9.0) {
    badgeClass = "bg-red-950 text-red-300 border-red-800";
    barColor = "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
    textColor = "text-red-400";
    level = "CRITICAL SEVERITY";
    category = "CRITICAL";
  } else if (score >= 7.0) {
    badgeClass = "bg-orange-950 text-orange-300 border-orange-800";
    barColor = "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]";
    textColor = "text-orange-400";
    level = "HIGH SEVERITY";
    category = "HIGH";
  } else if (score >= 4.5) {
    badgeClass = "bg-amber-950 text-amber-300 border-amber-800";
    barColor = "bg-amber-500";
    textColor = "text-amber-400";
    level = "MEDIUM SEVERITY";
    category = "MEDIUM";
  } else {
    category = "LOW";
  }

  return { score, percentage, badgeClass, barColor, textColor, level, category };
};

export const CisaIcsAdvisoriesFeed: React.FC<CisaIcsAdvisoriesFeedProps> = ({
  aptGroups,
  onSelectApt,
  onFilterBySector,
}) => {
  const [advisories, setAdvisories] = useState<CisaAdvisory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retrievedAt, setRetrievedAt] = useState<string>("");
  const [newAddedCount, setNewAddedCount] = useState<number>(0);
  const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("ALL");
  const [selectedVendor, setSelectedVendor] = useState<string>("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [datePreset, setDatePreset] = useState<'ALL' | '30D' | '90D' | '2026' | 'CUSTOM'>('ALL');
  const [expandedAdvisoryId, setExpandedAdvisoryId] = useState<string | null>(null);

  const [downloadHeaderOpen, setDownloadHeaderOpen] = useState<boolean>(false);
  const [downloadToolbarOpen, setDownloadToolbarOpen] = useState<boolean>(false);
  const [hoveredTrendDayIndex, setHoveredTrendDayIndex] = useState<number | null>(null);

  // Load compiled advisories from localStorage on mount & fetch live stream to append/compile
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cisa_ics_accumulated_advisories_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAdvisories(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not read accumulated CISA advisories from localStorage", e);
    }
    fetchAdvisories();
  }, []);

  // Fetch CISA Advisories from backend API & compile with stored dataset
  const fetchAdvisories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cisa-advisories");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const incoming: CisaAdvisory[] = json.advisories || [];

      setAdvisories((prev) => {
        const map = new Map<string, CisaAdvisory>();

        // 1. Load existing compiled database entries
        prev.forEach((item) => {
          const key = item.advisoryId || item.id || item.link;
          if (key) map.set(key, item);
        });

        // 2. Append new incoming entries from live XML stream
        let added = 0;
        const freshKeys = new Set<string>();
        incoming.forEach((item) => {
          const key = item.advisoryId || item.id || item.link;
          if (key) {
            if (!map.has(key)) {
              added++;
              freshKeys.add(key);
              if (item.id) freshKeys.add(item.id);
              if (item.advisoryId) freshKeys.add(item.advisoryId);
            }
            map.set(key, item);
          }
        });

        const compiled = Array.from(map.values());
        
        // Sort chronologically newest first
        compiled.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

        setNewAddedCount(added);
        if (freshKeys.size > 0) {
          setNewlyAddedIds(freshKeys);
        }

        try {
          localStorage.setItem("cisa_ics_accumulated_advisories_v2", JSON.stringify(compiled));
        } catch (e) {
          console.warn("Failed to save compiled advisories to localStorage", e);
        }

        return compiled;
      });

      setRetrievedAt(json.retrievedAt || new Date().toISOString());
    } catch (err: any) {
      console.warn("Failed to fetch live CISA feed", err);
      setError("Unable to connect live XML stream. Displaying accumulated local advisory database.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear accumulated cache
  const handleClearCache = () => {
    if (window.confirm("Reset accumulated CISA advisory cache and reload fresh feed?")) {
      localStorage.removeItem("cisa_ics_accumulated_advisories_v2");
      setAdvisories([]);
      fetchAdvisories();
    }
  };

  // Extract unique sectors & vendors
  const allSectors = useMemo(() => {
    const set = new Set<string>();
    advisories.forEach((a) => a.sectors?.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [advisories]);

  const allVendors = useMemo(() => {
    const set = new Set<string>();
    advisories.forEach((a) => {
      if (a.vendor) set.add(a.vendor);
    });
    return Array.from(set).sort();
  }, [advisories]);

  // Filter advisories
  const filteredAdvisories = useMemo(() => {
    return advisories.filter((a) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.advisoryId.toLowerCase().includes(q) ||
        a.vendor.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.cves.some((c) => c.toLowerCase().includes(q));

      const matchesSector =
        selectedSector === "ALL" ||
        a.sectors.some((s) => s.toLowerCase() === selectedSector.toLowerCase());

      const matchesVendor =
        selectedVendor === "ALL" || a.vendor.toLowerCase() === selectedVendor.toLowerCase();

      const matchesDateRange = (() => {
        if (!startDate && !endDate) return true;
        const pub = new Date(a.pubDate).getTime();
        if (isNaN(pub)) return true;

        if (startDate) {
          const start = new Date(startDate + "T00:00:00").getTime();
          if (!isNaN(start) && pub < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate + "T23:59:59").getTime();
          if (!isNaN(end) && pub > end) return false;
        }
        return true;
      })();

      const matchesSeverity =
        selectedSeverity === "ALL" ||
        getVulnerabilityImpact(a).category === selectedSeverity;

      return matchesSearch && matchesSector && matchesVendor && matchesDateRange && matchesSeverity;
    });
  }, [advisories, searchQuery, selectedSector, selectedVendor, startDate, endDate, selectedSeverity]);

  // Compute 30-day advisory volume trend data
  const trendData30Days = useMemo(() => {
    const days: {
      dateStr: string;
      label: string;
      shortLabel: string;
      count: number;
      criticalCount: number;
    }[] = [];
    const now = new Date();

    const countsByDate: Record<string, { total: number; critical: number }> = {};
    advisories.forEach((a) => {
      const d = new Date(a.pubDate);
      if (!isNaN(d.getTime())) {
        const key = d.toISOString().split("T")[0];
        if (!countsByDate[key]) countsByDate[key] = { total: 0, critical: 0 };
        countsByDate[key].total += 1;
        const impact = getVulnerabilityImpact(a);
        if (impact.category === "CRITICAL" || impact.category === "HIGH") {
          countsByDate[key].critical += 1;
        }
      }
    });

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const monthStr = d.toLocaleDateString("en-US", { month: "short" });
      const dayNum = d.getDate();
      const label = `${monthStr} ${dayNum}, ${d.getFullYear()}`;
      const shortLabel = `${monthStr} ${dayNum}`;
      const item = countsByDate[dateStr] || { total: 0, critical: 0 };
      days.push({
        dateStr,
        label,
        shortLabel,
        count: item.total,
        criticalCount: item.critical,
      });
    }

    const totalVolume = days.reduce((acc, d) => acc + d.count, 0);
    const maxCount = Math.max(...days.map((d) => d.count), 1);
    const avgPerDay = (totalVolume / 30).toFixed(1);
    const totalHighCritical = days.reduce((acc, d) => acc + d.criticalCount, 0);

    const svgWidth = 700;
    const svgHeight = 110;
    const paddingLeft = 20;
    const paddingRight = 20;
    const paddingTop = 15;
    const paddingBottom = 25;
    const drawWidth = svgWidth - paddingLeft - paddingRight;
    const drawHeight = svgHeight - paddingTop - paddingBottom;

    const points = days.map((day, i) => {
      const x = paddingLeft + (i / 29) * drawWidth;
      const y = (svgHeight - paddingBottom) - (day.count / maxCount) * drawHeight;
      return { ...day, x, y };
    });

    const pathD = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");

    const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${svgHeight - paddingBottom} L ${points[0].x.toFixed(1)} ${svgHeight - paddingBottom} Z`;

    return {
      days: points,
      totalVolume,
      maxCount,
      avgPerDay,
      totalHighCritical,
      pathD,
      areaD,
      svgWidth,
      svgHeight,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
    };
  }, [advisories]);

  // Export CISA Advisories CSV (Current Selection)
  const handleExportCsv = () => {
    if (filteredAdvisories.length === 0) return;
    const isFiltered =
      searchQuery ||
      selectedSector !== "ALL" ||
      selectedVendor !== "ALL" ||
      selectedSeverity !== "ALL" ||
      startDate ||
      endDate;

    const headers = ["Advisory ID", "Title", "Vendor", "Release Date", "CVEs", "Sectors", "Summary", "CISA Link", "CSAF URL"];
    const rows = filteredAdvisories.map((a) => [
      `"${a.advisoryId.replace(/"/g, '""')}"`,
      `"${a.title.replace(/"/g, '""')}"`,
      `"${a.vendor.replace(/"/g, '""')}"`,
      `"${new Date(a.pubDate).toLocaleDateString()}"`,
      `"${(a.cves || []).join("; ")}"`,
      `"${(a.sectors || []).join("; ")}"`,
      `"${a.summary.replace(/"/g, '""')}"`,
      `"${a.link}"`,
      `"${a.csafUrl || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    const filenameTag = isFiltered ? `selection_${filteredAdvisories.length}_items` : `all_${advisories.length}_items`;
    link.download = `cisa_ics_advisories_${filenameTag}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CISA Advisories JSON (Current Selection)
  const handleExportJson = () => {
    if (filteredAdvisories.length === 0) return;
    const isFiltered =
      searchQuery ||
      selectedSector !== "ALL" ||
      selectedVendor !== "ALL" ||
      selectedSeverity !== "ALL" ||
      startDate ||
      endDate;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredAdvisories, null, 2));
    const link = document.createElement("a");
    link.href = dataStr;
    const filenameTag = isFiltered ? `selection_${filteredAdvisories.length}_items` : `all_${advisories.length}_items`;
    link.download = `cisa_ics_advisories_${filenameTag}_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-950 border border-red-900/60 rounded-2xl p-4 sm:p-6 mb-8 shadow-2xl text-slate-100 font-mono relative overflow-hidden">
      {/* Top Laser Accent */}
      <div className="h-1 w-full bg-gradient-to-r from-red-600 via-amber-500 to-cyan-500 absolute top-0 left-0 right-0" />

      {/* Title & Live Status Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-red-900/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-red-950 border border-red-700 text-red-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </span>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>CISA ICS Advisory Stream Integration</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-300">
                Official XML Feed
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-300 font-sans max-w-3xl">
            Live cybersecurity advisories directly ingested from CISA&apos;s XML feed (<code className="text-cyan-300">https://www.cisa.gov/cybersecurity-advisories/all.xml</code>) covering Operational Technology (OT), SCADA, and Critical Infrastructure Threats. Data streams are automatically compiled and preserved locally over time.
          </p>
        </div>

        {/* Sync Status Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-ping" />
            <span className="text-[11px]">Synced:</span>
            <span className="text-emerald-300 font-bold">
              {retrievedAt ? new Date(retrievedAt).toLocaleTimeString() : "Live"}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 text-[11px] font-bold flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Compiled Store: {advisories.length}</span>
            {newAddedCount > 0 && (
              <span className="text-[10px] text-emerald-400 bg-emerald-950 border border-emerald-800 px-1.5 py-0.2 rounded ml-1">
                +{newAddedCount} new
              </span>
            )}
          </div>

          <button
            onClick={fetchAdvisories}
            disabled={isLoading}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-bold"
            title="Ingest & compile fresh CISA XML Feed entries"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-amber-400" : "text-cyan-400"}`} />
            <span className="text-[11px]">Compile Feed</span>
          </button>

          {/* Download Current Selection Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDownloadHeaderOpen(!downloadHeaderOpen)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono font-bold text-[11px] rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5 border border-cyan-400/40"
              title="Download currently filtered CISA advisories in CSV or JSON format"
            >
              <Download className="w-3.5 h-3.5 text-cyan-200" />
              <span>Download Current Selection ({filteredAdvisories.length})</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${downloadHeaderOpen ? "rotate-180" : ""}`} />
            </button>

            {downloadHeaderOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-40 overflow-hidden font-mono text-xs py-1">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider font-bold flex items-center justify-between">
                  <span>Export Selection</span>
                  <span className="text-cyan-400">{filteredAdvisories.length} items</span>
                </div>
                <button
                  onClick={() => {
                    handleExportCsv();
                    setDownloadHeaderOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-cyan-300 font-bold flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Download Selection (CSV)</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                    .CSV
                  </span>
                </button>
                <button
                  onClick={() => {
                    handleExportJson();
                    setDownloadHeaderOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-purple-300 font-bold flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-purple-400" />
                    <span>Download Selection (JSON)</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300">
                    .JSON
                  </span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleClearCache}
            className="px-2.5 py-1.5 bg-slate-950 hover:bg-red-950/60 border border-slate-800 hover:border-red-800 text-slate-400 hover:text-red-300 rounded-xl transition-all cursor-pointer text-[10px]"
            title="Reset compiled feed cache"
          >
            Reset Store
          </button>
        </div>
      </div>

      {/* 30-Day Advisory Volume Trend Line Chart */}
      <div className="my-5 p-4 bg-slate-900/80 border border-slate-800/90 rounded-2xl">
        {/* Header & Metrics */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <span>30-Day Advisory Volume Trend</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                  {trendData30Days.days[0]?.shortLabel} – {trendData30Days.days[29]?.shortLabel}
                </span>
              </h4>
              <p className="text-[11px] text-slate-400 font-sans">
                Daily incoming CISA ICS advisories stream velocity &amp; severity metric activity
              </p>
            </div>
          </div>

          {/* Key Stat Badges */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400 text-[10px]">30D Volume:</span>
              <span className="font-bold text-cyan-300">{trendData30Days.totalVolume}</span>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-400 text-[10px]">Daily Avg:</span>
              <span className="font-bold text-blue-300">{trendData30Days.avgPerDay}/d</span>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span className="text-slate-400 text-[10px]">High/Critical:</span>
              <span className="font-bold text-red-400">{trendData30Days.totalHighCritical}</span>
            </div>
          </div>
        </div>

        {/* SVG Chart Container */}
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${trendData30Days.svgWidth} ${trendData30Days.svgHeight}`}
            className="w-full h-28 sm:h-32 overflow-visible"
            onMouseLeave={() => setHoveredTrendDayIndex(null)}
          >
            <defs>
              <linearGradient id="cisaTrendAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="cisaTrendLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>

            {/* Horizontal Reference Lines */}
            <line
              x1={trendData30Days.paddingLeft}
              y1={trendData30Days.paddingTop}
              x2={trendData30Days.svgWidth - trendData30Days.paddingRight}
              y2={trendData30Days.paddingTop}
              stroke="#334155"
              strokeDasharray="3 3"
              strokeWidth="0.8"
            />
            <text
              x={trendData30Days.paddingLeft + 4}
              y={trendData30Days.paddingTop - 3}
              className="text-[8px] fill-slate-500 font-mono"
            >
              Peak ({trendData30Days.maxCount})
            </text>

            <line
              x1={trendData30Days.paddingLeft}
              y1={trendData30Days.svgHeight - trendData30Days.paddingBottom}
              x2={trendData30Days.svgWidth - trendData30Days.paddingRight}
              y2={trendData30Days.svgHeight - trendData30Days.paddingBottom}
              stroke="#334155"
              strokeWidth="1"
            />

            {/* Gradient Area Fill under the trend line */}
            <path d={trendData30Days.areaD} fill="url(#cisaTrendAreaGradient)" />

            {/* Trend Line */}
            <path
              d={trendData30Days.pathD}
              fill="none"
              stroke="url(#cisaTrendLineGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* X Axis Date Ticks */}
            {trendData30Days.days.map((p, i) => {
              if (i === 0 || i === 7 || i === 14 || i === 21 || i === 29) {
                return (
                  <text
                    key={`tick-${i}`}
                    x={p.x}
                    y={trendData30Days.svgHeight - 8}
                    textAnchor="middle"
                    className="text-[9px] fill-slate-400 font-mono"
                  >
                    {p.shortLabel}
                  </text>
                );
              }
              return null;
            })}

            {/* Interactive Day Points */}
            {trendData30Days.days.map((p, i) => {
              const isHovered = hoveredTrendDayIndex === i;
              const hasItems = p.count > 0;

              return (
                <g key={`point-${i}`}>
                  {/* Vertical Guideline on hover */}
                  {isHovered && (
                    <line
                      x1={p.x}
                      y1={trendData30Days.paddingTop}
                      x2={p.x}
                      y2={trendData30Days.svgHeight - trendData30Days.paddingBottom}
                      stroke="#06b6d4"
                      strokeDasharray="2 2"
                      strokeWidth="1"
                    />
                  )}

                  {/* Dot */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 6 : hasItems ? 3.5 : 2}
                    className={
                      isHovered
                        ? "fill-cyan-300 stroke-cyan-100 stroke-2"
                        : hasItems
                        ? "fill-cyan-400 stroke-slate-950 stroke-1"
                        : "fill-slate-700 stroke-slate-900"
                    }
                  />

                  {/* Invisible Hit Area for Hover & Filter on Click */}
                  <rect
                    x={p.x - 10}
                    y={10}
                    width={20}
                    height={trendData30Days.svgHeight - 20}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredTrendDayIndex(i)}
                    onClick={() => {
                      setStartDate(p.dateStr);
                      setEndDate(p.dateStr);
                      setDatePreset("CUSTOM");
                    }}
                  >
                    <title>{`${p.label}: ${p.count} advisories (${p.criticalCount} High/Critical)`}</title>
                  </rect>
                </g>
              );
            })}
          </svg>

          {/* Hover Status Legend Bar / Click-to-filter tip */}
          <div className="mt-1 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono px-2 py-1 bg-slate-950/80 rounded-lg border border-slate-800/80">
            {hoveredTrendDayIndex !== null ? (
              <div className="flex items-center gap-2 text-cyan-300">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold">{trendData30Days.days[hoveredTrendDayIndex].label}:</span>
                <span className="text-white font-bold">
                  {trendData30Days.days[hoveredTrendDayIndex].count} Advisories
                </span>
                {trendData30Days.days[hoveredTrendDayIndex].criticalCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800 text-[10px]">
                    {trendData30Days.days[hoveredTrendDayIndex].criticalCount} High/Critical
                  </span>
                )}
                <span className="text-slate-500 text-[10px] hidden md:inline ml-2">(Click point to filter date)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-400">
                <Activity className="w-3.5 h-3.5 text-slate-500" />
                <span>Hover over any data point to inspect daily volume, or click a point to isolate that date.</span>
              </div>
            )}
            <div className="text-[10px] text-slate-500 font-mono">
              Peak Volume: <strong className="text-slate-300">{trendData30Days.maxCount}</strong> / day
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="my-5 p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col gap-3.5">
        {/* Top Row: Search, Sector, Vendor */}
        <div className="flex flex-col md:flex-row items-center gap-3 w-full">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search CISA advisories by Vendor (Siemens, Rockwell), Product, CVE-2026-..."
              className="w-full bg-slate-950 border border-slate-700 text-white pl-9 pr-8 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-red-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sector Selector */}
          <div className="w-full md:w-56 shrink-0">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-2 rounded-xl text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">All Sectors ({allSectors.length})</option>
              {allSectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Vendor Selector */}
          <div className="w-full md:w-52 shrink-0">
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-2 rounded-xl text-xs font-mono focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="ALL">All Vendors ({allVendors.length})</option>
              {allVendors.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Dropdown Filter */}
          <div className="w-full md:w-48 shrink-0">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-2 rounded-xl text-xs font-mono focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">🔴 Critical (9.0–10.0)</option>
              <option value="HIGH">🟠 High (7.0–8.9)</option>
              <option value="MEDIUM">🟡 Medium (4.5–6.9)</option>
              <option value="LOW">🟢 Low (&lt; 4.5)</option>
            </select>
          </div>
        </div>

        {/* Bottom Row: Date Range Picker & Preset Timeframes */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              Timeframe:
            </span>
            <button
              onClick={() => {
                setDatePreset("ALL");
                setStartDate("");
                setEndDate("");
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                datePreset === "ALL" && !startDate && !endDate
                  ? "bg-red-600 text-white font-bold"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => {
                setDatePreset("30D");
                const d = new Date();
                d.setDate(d.getDate() - 30);
                setStartDate(d.toISOString().split("T")[0]);
                setEndDate("");
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                datePreset === "30D"
                  ? "bg-red-600 text-white font-bold"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => {
                setDatePreset("90D");
                const d = new Date();
                d.setDate(d.getDate() - 90);
                setStartDate(d.toISOString().split("T")[0]);
                setEndDate("");
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                datePreset === "90D"
                  ? "bg-red-600 text-white font-bold"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Last 90 Days
            </button>
            <button
              onClick={() => {
                setDatePreset("2026");
                setStartDate("2026-01-01");
                setEndDate("2026-12-31");
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                datePreset === "2026"
                  ? "bg-red-600 text-white font-bold"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              2026
            </button>
          </div>

          {/* Date Picker Range Inputs */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto font-mono">
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 px-2.5 py-1 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold">From</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDatePreset("CUSTOM");
                }}
                className="bg-transparent text-white text-xs focus:outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>
            <span className="text-slate-500 font-bold">–</span>
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 px-2.5 py-1 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold">To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDatePreset("CUSTOM");
                }}
                className="bg-transparent text-white text-xs focus:outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setDatePreset("ALL");
                }}
                className="text-xs text-red-400 hover:text-red-300 underline px-1 cursor-pointer font-bold"
                title="Reset date filter"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Advisory Count & Active Filters Indicator */}
      <div className="flex flex-wrap items-center justify-between text-xs mb-4 text-slate-400 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            Showing <span className="font-bold text-white">{filteredAdvisories.length}</span> of{" "}
            <span className="font-bold text-white">{advisories.length}</span> live CISA ICS Advisories
          </span>
          {(startDate || endDate) && (
            <span className="px-2.5 py-0.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 text-[11px] font-mono flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-400" />
              <span>
                Window: <strong>{startDate || "Earliest"}</strong> to <strong>{endDate || "Latest"}</strong>
              </span>
            </span>
          )}
          {selectedSeverity !== "ALL" && (
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-[11px] font-mono flex items-center gap-1">
              <Flame className="w-3 h-3 text-red-400" />
              <span>
                Severity: <strong className="text-red-300">{selectedSeverity}</strong>
              </span>
              <button
                onClick={() => setSelectedSeverity("ALL")}
                className="ml-1 text-slate-400 hover:text-white cursor-pointer"
                title="Clear severity filter"
              >
                ✕
              </button>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Secondary Download Selection Toolbar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDownloadToolbarOpen(!downloadToolbarOpen)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold text-[11px]"
              title="Download currently visible advisories"
            >
              <Download className="w-3 h-3 text-cyan-400" />
              <span>Download Selection ({filteredAdvisories.length})</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${downloadToolbarOpen ? "rotate-180" : ""}`} />
            </button>

            {downloadToolbarOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-40 overflow-hidden font-mono text-xs py-1">
                <button
                  onClick={() => {
                    handleExportCsv();
                    setDownloadToolbarOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-cyan-300 font-bold flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Download className="w-3 h-3" /> CSV File
                  </span>
                  <span className="text-[10px] text-slate-400">.csv</span>
                </button>
                <button
                  onClick={() => {
                    handleExportJson();
                    setDownloadToolbarOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-purple-300 font-bold flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <FileCode className="w-3 h-3" /> JSON File
                  </span>
                  <span className="text-[10px] text-slate-400">.json</span>
                </button>
              </div>
            )}
          </div>

          <a
            href="https://www.cisa.gov/cybersecurity-advisories/all.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[11px] underline"
          >
            <Globe className="w-3 h-3" />
            View CISA XML Feed Source
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && advisories.length === 0 ? (
        <div className="p-12 text-center text-slate-400 font-mono space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-red-500 mx-auto" />
          <p>Ingesting live CISA ICS Advisories XML stream...</p>
        </div>
      ) : filteredAdvisories.length === 0 ? (
        <div className="p-12 text-center text-slate-400 font-mono bg-slate-900/50 rounded-2xl border border-slate-800">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-white font-bold">No CISA ICS advisories match current filters.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedSector("ALL");
              setSelectedVendor("ALL");
            }}
            className="mt-3 px-3 py-1.5 bg-slate-800 text-cyan-300 rounded-lg text-xs hover:bg-slate-700 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Advisory Cards List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredAdvisories.map((advisory) => {
              const isExpanded = expandedAdvisoryId === advisory.id;
              const isNewlyIngested = newlyAddedIds.has(advisory.id) || newlyAddedIds.has(advisory.advisoryId);

              // Match APT groups targeting sectors in this advisory
              const matchingApts = aptGroups.filter((apt) =>
                apt.targetedSectors.some((sec) =>
                  advisory.sectors.some((aS) => aS.toLowerCase().includes(sec.toLowerCase()) || sec.toLowerCase().includes(aS.toLowerCase()))
                )
              );

              // Calculate vulnerability impact score & progress bar details
              const impact = getVulnerabilityImpact(advisory);

              return (
                <motion.div
                  key={advisory.id}
                  layout
                  initial={isNewlyIngested ? { opacity: 0, y: -20, scale: 0.96 } : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-slate-900 border ${
                    isNewlyIngested
                      ? "border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.2)] bg-slate-900/95"
                      : "border-slate-800 hover:border-red-700/80"
                  } rounded-2xl p-4 transition-all shadow-lg hover:shadow-2xl flex flex-col justify-between space-y-3 relative overflow-hidden group`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isNewlyIngested && (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                            NEW STREAM
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold">
                          {advisory.advisoryId}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-bold">
                          {advisory.vendor}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(advisory.pubDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Vulnerability Score / Impact Scale Progress Bar */}
                    <div className="my-2.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800/90 font-mono text-xs">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-400 font-bold flex items-center gap-1">
                          <Flame className={`w-3.5 h-3.5 ${impact.textColor}`} />
                          Impact Scale:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] px-1.5 py-0.2 rounded border font-bold ${impact.badgeClass}`}>
                            {impact.level}
                          </span>
                          <span className={`font-black text-xs ${impact.textColor}`}>
                            {impact.score.toFixed(1)} <span className="text-slate-500 font-normal">/ 10</span>
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-900 border border-slate-800/80 h-2 rounded-full overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${impact.barColor}`}
                          style={{ width: `${impact.percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-bold text-white group-hover:text-red-300 transition-colors my-1">
                      <HighlightText text={advisory.title} query={searchQuery} />
                    </h4>

                    {/* Affected Sectors */}
                    <div className="flex flex-wrap gap-1 my-2">
                      {advisory.sectors.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            if (onFilterBySector) onFilterBySector(s);
                          }}
                          title={`Filter main matrix by sector: ${s}`}
                          className="px-2 py-0.5 rounded bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800 text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Sector: {s}
                        </button>
                      ))}
                    </div>

                    {/* Summary */}
                    <p className="text-xs text-slate-300 font-sans leading-relaxed line-clamp-3 my-2">
                      <HighlightText text={advisory.summary} query={searchQuery} />
                    </p>
                  </div>

                  {/* CVE Tags & Links */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    {advisory.cves.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 text-[10px]">
                        <span className="text-slate-400 font-bold">CVEs:</span>
                        {advisory.cves.map((cve) => (
                          <a
                            key={cve}
                            href={`https://nvd.nist.gov/vuln/detail/${cve}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 hover:border-amber-500 transition-colors flex items-center gap-0.5"
                          >
                            <span>{cve}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Correlated Threat Groups Indicator */}
                    {matchingApts.length > 0 && (
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                        <div className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span>APT Operational Threat Correlation ({matchingApts.length} Groups):</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {matchingApts.slice(0, 4).map((apt) => (
                            <button
                              key={apt.id}
                              onClick={() => {
                                if (onSelectApt) onSelectApt(apt);
                              }}
                              className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 hover:border-cyan-400 text-[10px] font-bold cursor-pointer transition-colors"
                            >
                              {apt.classification} ({apt.id})
                            </button>
                          ))}
                          {matchingApts.length > 4 && (
                            <span className="text-[10px] text-slate-500 self-center">
                              +{matchingApts.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <a
                        href={advisory.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 underline"
                      >
                        <span>Official CISA Advisory</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      {advisory.csafUrl && (
                        <a
                          href={advisory.csafUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-lg flex items-center gap-1 text-[10px]"
                        >
                          <FileCode className="w-3 h-3 text-cyan-400" />
                          <span>CSAF 2.0 JSON</span>
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
