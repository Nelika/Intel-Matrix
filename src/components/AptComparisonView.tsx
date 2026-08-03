import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeftRight,
  Shield,
  Building2,
  Building,
  Target,
  Gavel,
  Zap,
  Calendar,
  FileCode,
  Check,
  X,
  Sparkles,
  ExternalLink,
  Download,
  Terminal,
  HelpCircle,
  Activity,
  Layers,
  ChevronRight,
  ArrowRight,
  Lock,
  Globe,
  Radio,
} from 'lucide-react';
import { AptGroup } from '../types';

interface AptComparisonViewProps {
  data: AptGroup[];
  onSelectApt?: (apt: AptGroup) => void;
  initialAptAId?: string;
  initialAptBId?: string;
}

export const AptComparisonView: React.FC<AptComparisonViewProps> = ({
  data,
  onSelectApt,
  initialAptAId,
  initialAptBId,
}) => {
  // Default selections: APT41 (index 0) and APT27 (index 1) or provided initial IDs
  const [aptAId, setAptAId] = useState<string>(
    initialAptAId || (data.length > 0 ? data[0].id : '')
  );
  const [aptBId, setAptBId] = useState<string>(
    initialAptBId || (data.length > 1 ? data[1].id : data[0]?.id || '')
  );

  const aptA = useMemo(() => data.find((a) => a.id === aptAId) || data[0], [data, aptAId]);
  const aptB = useMemo(() => data.find((a) => a.id === aptBId) || data[1] || data[0], [data, aptBId]);

  // Swap APT A and APT B
  const handleSwap = () => {
    const temp = aptAId;
    setAptAId(aptBId);
    setAptBId(temp);
  };

  // Preset comparison pairs
  const presets = [
    { label: 'MSS vs PLA Flagships (APT41 vs APT27)', idA: 'APT41', idB: 'APT27' },
    { label: 'Civilian Intel Ops (APT41 vs APT31)', idA: 'APT41', idB: 'APT31' },
    { label: 'Military Recon (APT1 vs APT30)', idA: 'APT1', idB: 'APT30' },
    { label: 'i-SOON Front Cover Ops (APT41 vs APT10)', idA: 'APT41', idB: 'APT10' },
  ];

  // Calculate Overlaps
  const overlappingSectors = useMemo(() => {
    if (!aptA || !aptB) return [];
    return (aptA.targetedSectors || []).filter((sec) =>
      (aptB.targetedSectors || []).some((bSec) => bSec.toLowerCase() === sec.toLowerCase())
    );
  }, [aptA, aptB]);

  const overlappingTechniques = useMemo(() => {
    if (!aptA || !aptB) return [];
    return (aptA.mitreTechniques || []).filter((tech) =>
      (aptB.mitreTechniques || []).some((bTech) => bTech.code === tech.code)
    );
  }, [aptA, aptB]);

  const sameSponsorOrg = aptA && aptB && aptA.sponsoringOrgType === aptB.sponsoringOrgType;

  // Export JSON Report
  const handleExportComparisonJson = () => {
    if (!aptA || !aptB) return;
    const report = {
      comparisonDate: new Date().toISOString(),
      subjectA: aptA,
      subjectB: aptB,
      analyticalSummary: {
        sameSponsorOrg,
        overlappingSectors,
        overlappingTechniques: overlappingTechniques.map((t) => `${t.code}: ${t.name}`),
      },
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apt_comparison_${aptA.id}_vs_${aptB.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!aptA || !aptB) {
    return (
      <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl text-center text-slate-400 font-mono">
        Insufficient APT data to render side-by-side comparison.
      </div>
    );
  }

  return (
    <div className="bg-slate-950 border border-cyan-900/80 rounded-2xl p-4 sm:p-6 mb-8 shadow-2xl text-slate-100 font-mono relative overflow-hidden">
      {/* Top Accent Laser */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 absolute top-0 left-0 right-0" />

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-cyan-900/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-blue-950 border border-blue-700 text-blue-400">
              <ArrowLeftRight className="w-5 h-5 animate-pulse" />
            </span>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Side-by-Side Intelligence Matrix Comparison</span>
              <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300">
                Comparative Analysis Engine
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-300 font-sans max-w-3xl">
            Select any two threat groups to evaluate operational overlap across sponsoring authorities, front companies, targeted sectors, legal indictments, and MITRE ATT&CK techniques.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={handleExportComparisonJson}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-cyan-700 text-cyan-300 rounded-xl transition-all flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Comparison JSON</span>
          </button>
        </div>
      </div>

      {/* Selector Control Panel */}
      <div className="my-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4">
        {/* Dropdown Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* APT Group A Dropdown */}
          <div className="md:col-span-5 bg-slate-950 border border-blue-600/80 p-3 rounded-xl space-y-1">
            <label className="text-[10px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Subject Group A:
            </label>
            <select
              value={aptAId}
              onChange={(e) => setAptAId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded-lg text-sm font-bold focus:outline-none focus:border-blue-400 cursor-pointer"
            >
              {data.map((apt) => (
                <option key={apt.id} value={apt.id}>
                  {apt.classification} ({apt.id}) — {apt.sponsoringOrgType}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-2 flex items-center justify-center">
            <button
              onClick={handleSwap}
              className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-cyan-300 rounded-xl transition-all shadow-lg flex items-center gap-1 cursor-pointer font-bold text-xs"
              title="Swap Subject A and Subject B"
            >
              <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
              <span className="md:hidden">Swap Groups</span>
            </button>
          </div>

          {/* APT Group B Dropdown */}
          <div className="md:col-span-5 bg-slate-950 border border-purple-600/80 p-3 rounded-xl space-y-1">
            <label className="text-[10px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Subject Group B:
            </label>
            <select
              value={aptBId}
              onChange={(e) => setAptBId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded-lg text-sm font-bold focus:outline-none focus:border-purple-400 cursor-pointer"
            >
              {data.map((apt) => (
                <option key={apt.id} value={apt.id}>
                  {apt.classification} ({apt.id}) — {apt.sponsoringOrgType}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Comparison Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Quick Presets:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                const foundA = data.find((d) => d.id === p.idA);
                const foundB = data.find((d) => d.id === p.idB);
                if (foundA) setAptAId(foundA.id);
                if (foundB) setAptBId(foundB.id);
              }}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 rounded-lg text-[11px] transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overlap Intelligence Summary Card */}
      <div className="mb-6 p-4 bg-slate-900/90 border border-cyan-800/80 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
          <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            Operational Overlap & Shared Threat Indicators
          </span>
          <span className="text-slate-400 text-[10px]">
            {aptA.classification} vs {aptB.classification}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Authority Overlap */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Sponsoring Agency Match</span>
            <div className="flex items-center gap-2">
              {sameSponsorOrg ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">Matching Agency ({aptA.sponsoringOrgType})</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300 font-bold">Distinct Agencies ({aptA.sponsoringOrgType} vs {aptB.sponsoringOrgType})</span>
                </>
              )}
            </div>
          </div>

          {/* Shared Targeted Sectors */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              Shared Targeted Sectors ({overlappingSectors.length})
            </span>
            <div className="flex flex-wrap gap-1">
              {overlappingSectors.length > 0 ? (
                overlappingSectors.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-[11px]">No shared target sectors</span>
              )}
            </div>
          </div>

          {/* Shared MITRE ATT&CK Techniques */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              Shared MITRE ATT&CK Techniques ({overlappingTechniques.length})
            </span>
            <div className="flex flex-wrap gap-1">
              {overlappingTechniques.length > 0 ? (
                overlappingTechniques.map((t) => (
                  <span key={t.code} className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-bold">
                    {t.code} ({t.name})
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-[11px]">No matching TTP codes</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparative Matrix Table */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-slate-950">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800 text-slate-300">
              <th className="p-4 w-1/4 font-bold text-slate-400 uppercase tracking-wider border-r border-slate-800">
                Attribute / Intelligence Metric
              </th>
              <th className="p-4 w-3/8 font-bold text-blue-400 border-r border-slate-800 bg-blue-950/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{aptA.classification}</span>
                  {onSelectApt && (
                    <button
                      onClick={() => onSelectApt(aptA)}
                      className="text-[10px] bg-blue-900 hover:bg-blue-800 text-blue-200 px-2 py-0.5 rounded border border-blue-700 cursor-pointer font-bold"
                    >
                      Inspect Profile
                    </button>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-normal mt-0.5">{aptA.id}</div>
              </th>
              <th className="p-4 w-3/8 font-bold text-purple-400 bg-purple-950/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{aptB.classification}</span>
                  {onSelectApt && (
                    <button
                      onClick={() => onSelectApt(aptB)}
                      className="text-[10px] bg-purple-900 hover:bg-purple-800 text-purple-200 px-2 py-0.5 rounded border border-purple-700 cursor-pointer font-bold"
                    >
                      Inspect Profile
                    </button>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-normal mt-0.5">{aptB.id}</div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/80">
            {/* 1. Primary Aliases */}
            <tr className="hover:bg-slate-900/40">
              <td className="p-4 font-bold text-slate-400 border-r border-slate-800 flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Primary Aliases</span>
              </td>
              <td className="p-4 border-r border-slate-800 text-slate-200">
                <div className="flex flex-wrap gap-1">
                  {aptA.aliases.map((a) => (
                    <span key={a} className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-[11px]">
                      {a}
                    </span>
                  ))}
                </div>
              </td>
              <td className="p-4 text-slate-200">
                <div className="flex flex-wrap gap-1">
                  {aptB.aliases.map((a) => (
                    <span key={a} className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-[11px]">
                      {a}
                    </span>
                  ))}
                </div>
              </td>
            </tr>

            {/* 2. Sponsoring State Authority */}
            <tr className="hover:bg-slate-900/40">
              <td className="p-4 font-bold text-slate-400 border-r border-slate-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Sponsoring Authority</span>
              </td>
              <td className="p-4 border-r border-slate-800 text-slate-200">
                <div className="font-bold text-white">{aptA.sponsoringAuthority}</div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 mt-1 inline-block">
                  {aptA.sponsoringOrgType}
                </span>
              </td>
              <td className="p-4 text-slate-200">
                <div className="font-bold text-white">{aptB.sponsoringAuthority}</div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 mt-1 inline-block">
                  {aptB.sponsoringOrgType}
                </span>
              </td>
            </tr>

            {/* 3. Front / Cover Company */}
            <tr className="hover:bg-slate-900/40">
              <td className="p-4 font-bold text-slate-400 border-r border-slate-800 flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Front / Cover Company</span>
              </td>
              <td className="p-4 border-r border-slate-800 text-slate-200">
                <div className="font-bold text-amber-300">{aptA.frontCompany}</div>
              </td>
              <td className="p-4 text-slate-200">
                <div className="font-bold text-amber-300">{aptB.frontCompany}</div>
              </td>
            </tr>

            {/* 4. Active Years & Motivation */}
            <tr className="hover:bg-slate-900/40">
              <td className="p-4 font-bold text-slate-400 border-r border-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Active Years & Motivation</span>
              </td>
              <td className="p-4 border-r border-slate-800 text-slate-200">
                <div className="text-white font-bold">{aptA.activeYears}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{aptA.primaryMotivation}</div>
              </td>
              <td className="p-4 text-slate-200">
                <div className="text-white font-bold">{aptB.activeYears}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{aptB.primaryMotivation}</div>
              </td>
            </tr>

            {/* 5. Targeted Sectors */}
            <tr className="hover:bg-slate-900/40">
              <td className="p-4 font-bold text-slate-400 border-r border-slate-800 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Targeted Sectors</span>
              </td>
              <td className="p-4 border-r border-slate-800 text-slate-200">
                <div className="flex flex-wrap gap-1.5">
                  {aptA.targetedSectors.map((sec) => {
                    const isShared = overlappingSectors.some((s) => s.toLowerCase() === sec.toLowerCase());
                    return (
                      <span
                        key={sec}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isShared
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                            : 'bg-slate-900 text-slate-300 border border-slate-800'
                        }`}
                      >
                        {sec} {isShared ? '★' : ''}
                      </span>
                    );
                  })}
                </div>
              </td>
              <td className="p-4 text-slate-200">
                <div className="flex flex-wrap gap-1.5">
                  {aptB.targetedSectors.map((sec) => {
                    const isShared = overlappingSectors.some((s) => s.toLowerCase() === sec.toLowerCase());
                    return (
                      <span
                        key={sec}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isShared
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                            : 'bg-slate-900 text-slate-300 border border-slate-800'
                        }`}
                      >
                        {sec} {isShared ? '★' : ''}
                      </span>
                    );
                  })}
                </div>
              </td>
            </tr>

            {/* 6. Legal Classification & Indictments */}
            <tr className="hover:bg-slate-900/40">
              <td className="p-4 font-bold text-slate-400 border-r border-slate-800 flex items-center gap-2">
                <Gavel className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Legal Status & Indictments</span>
              </td>
              <td className="p-4 border-r border-slate-800 text-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold text-[10px]">
                    {aptA.legalStatus}
                  </span>
                  {aptA.legalActionYear && (
                    <span className="text-[10px] text-slate-400">({aptA.legalActionYear})</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-300">{aptA.dojIndictment}</div>
                {aptA.sanctionsBody && (
                  <div className="text-[10px] text-amber-400 mt-1 font-bold">Sanctions: {aptA.sanctionsBody}</div>
                )}
              </td>
              <td className="p-4 text-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold text-[10px]">
                    {aptB.legalStatus}
                  </span>
                  {aptB.legalActionYear && (
                    <span className="text-[10px] text-slate-400">({aptB.legalActionYear})</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-300">{aptB.dojIndictment}</div>
                {aptB.sanctionsBody && (
                  <div className="text-[10px] text-amber-400 mt-1 font-bold">Sanctions: {aptB.sanctionsBody}</div>
                )}
              </td>
            </tr>

            {/* 7. Top Attack Vector */}
            <tr className="hover:bg-slate-900/40">
              <td className="p-4 font-bold text-slate-400 border-r border-slate-800 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Top Attack Vector</span>
              </td>
              <td className="p-4 border-r border-slate-800 text-slate-200 font-bold text-amber-300">
                {aptA.topAttackVector}
              </td>
              <td className="p-4 text-slate-200 font-bold text-amber-300">
                {aptB.topAttackVector}
              </td>
            </tr>

            {/* 8. MITRE ATT&CK Techniques */}
            <tr className="hover:bg-slate-900/40">
              <td className="p-4 font-bold text-slate-400 border-r border-slate-800 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>MITRE ATT&CK Techniques</span>
              </td>
              <td className="p-4 border-r border-slate-800 text-slate-200">
                <div className="space-y-1">
                  {aptA.mitreTechniques.map((t) => {
                    const isShared = overlappingTechniques.some((ot) => ot.code === t.code);
                    return (
                      <div
                        key={t.code}
                        className={`p-1.5 rounded text-[11px] flex items-center justify-between ${
                          isShared
                            ? 'bg-cyan-950 border border-cyan-600 text-cyan-200 font-bold'
                            : 'bg-slate-900 border border-slate-800 text-slate-300'
                        }`}
                      >
                        <span>
                          <strong className="text-cyan-400">{t.code}</strong>: {t.name}
                        </span>
                        {isShared && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                    );
                  })}
                </div>
              </td>
              <td className="p-4 text-slate-200">
                <div className="space-y-1">
                  {aptB.mitreTechniques.map((t) => {
                    const isShared = overlappingTechniques.some((ot) => ot.code === t.code);
                    return (
                      <div
                        key={t.code}
                        className={`p-1.5 rounded text-[11px] flex items-center justify-between ${
                          isShared
                            ? 'bg-cyan-950 border border-cyan-600 text-cyan-200 font-bold'
                            : 'bg-slate-900 border border-slate-800 text-slate-300'
                        }`}
                      >
                        <span>
                          <strong className="text-cyan-400">{t.code}</strong>: {t.name}
                        </span>
                        {isShared && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                    );
                  })}
                </div>
              </td>
            </tr>

            {/* 9. Notable Campaigns */}
            <tr className="hover:bg-slate-900/40">
              <td className="p-4 font-bold text-slate-400 border-r border-slate-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Notable Campaigns</span>
              </td>
              <td className="p-4 border-r border-slate-800 text-slate-200">
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                  {aptA.notableCampaigns.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </td>
              <td className="p-4 text-slate-200">
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                  {aptB.notableCampaigns.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </td>
            </tr>

            {/* 10. Operational Overview */}
            <tr className="hover:bg-slate-900/40">
              <td className="p-4 font-bold text-slate-400 border-r border-slate-800 flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Operational Overview</span>
              </td>
              <td className="p-4 border-r border-slate-800 text-slate-300 text-[11px] leading-relaxed">
                {aptA.overview}
              </td>
              <td className="p-4 text-slate-300 text-[11px] leading-relaxed">
                {aptB.overview}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
