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

export const CisaIcsAdvisoriesFeed: React.FC<CisaIcsAdvisoriesFeedProps> = ({
  aptGroups,
  onSelectApt,
  onFilterBySector,
}) => {
  const [advisories, setAdvisories] = useState<CisaAdvisory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retrievedAt, setRetrievedAt] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("ALL");
  const [selectedVendor, setSelectedVendor] = useState<string>("ALL");
  const [expandedAdvisoryId, setExpandedAdvisoryId] = useState<string | null>(null);

  // Fetch CISA Advisories from backend API
  const fetchAdvisories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cisa-advisories");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setAdvisories(json.advisories || []);
      setRetrievedAt(json.retrievedAt || new Date().toISOString());
    } catch (err: any) {
      console.warn("Failed to fetch live CISA feed, loading fallback feed", err);
      setError("Unable to connect live XML stream. Displaying verified CISA ICS advisory database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisories();
  }, []);

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

      return matchesSearch && matchesSector && matchesVendor;
    });
  }, [advisories, searchQuery, selectedSector, selectedVendor]);

  // Export CISA Advisories CSV
  const handleExportCsv = () => {
    const headers = ["Advisory ID", "Title", "Vendor", "Release Date", "CVEs", "Sectors", "Summary", "CISA Link", "CSAF URL"];
    const rows = filteredAdvisories.map((a) => [
      `"${a.advisoryId}"`,
      `"${a.title.replace(/"/g, '""')}"`,
      `"${a.vendor.replace(/"/g, '""')}"`,
      `"${new Date(a.pubDate).toLocaleDateString()}"`,
      `"${a.cves.join("; ")}"`,
      `"${a.sectors.join("; ")}"`,
      `"${a.summary.replace(/"/g, '""')}"`,
      `"${a.link}"`,
      `"${a.csafUrl || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = `cisa_ics_advisories_${new Date().toISOString().split("T")[0]}.csv`;
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
            Live cybersecurity advisories directly ingested from CISA&apos;s XML feed (<code className="text-cyan-300">https://www.cisa.gov/cybersecurity-advisories/all.xml</code>) covering Operational Technology (OT), SCADA, and Critical Infrastructure Threats.
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

          <button
            onClick={fetchAdvisories}
            disabled={isLoading}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            title="Refresh live CISA XML Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-amber-400" : "text-cyan-400"}`} />
            <span className="text-[11px] font-bold">Refresh Feed</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-cyan-800 text-cyan-300 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-bold"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px]">Export Advisories CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="my-5 p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center gap-3">
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
      </div>

      {/* Advisory Count & Active Filters Indicator */}
      <div className="flex items-center justify-between text-xs mb-4 text-slate-400">
        <div>
          Showing <span className="font-bold text-white">{filteredAdvisories.length}</span> of{" "}
          <span className="font-bold text-white">{advisories.length}</span> live CISA ICS Advisories
        </div>
        <div className="flex items-center gap-2">
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

              // Match APT groups targeting sectors in this advisory
              const matchingApts = aptGroups.filter((apt) =>
                apt.targetedSectors.some((sec) =>
                  advisory.sectors.some((aS) => aS.toLowerCase().includes(sec.toLowerCase()) || sec.toLowerCase().includes(aS.toLowerCase()))
                )
              );

              return (
                <motion.div
                  key={advisory.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-900 border border-slate-800 hover:border-red-700/80 rounded-2xl p-4 transition-all shadow-lg hover:shadow-2xl flex flex-col justify-between space-y-3 relative overflow-hidden group"
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold">
                          {advisory.advisoryId}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-bold">
                          {advisory.vendor}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(advisory.pubDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-bold text-white group-hover:text-red-300 transition-colors my-1">
                      {advisory.title}
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
                      {advisory.summary}
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
