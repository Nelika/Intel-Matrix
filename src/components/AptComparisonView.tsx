import React, { useState, useMemo } from 'react';
import {
  ArrowLeftRight,
  Shield,
  Building2,
  Building,
  Target,
  Gavel,
  Zap,
  Calendar,
  Check,
  X,
  Sparkles,
  Download,
  Terminal,
  Activity,
  Globe,
} from 'lucide-react';
import { AptGroup } from '../types';

interface AptComparisonViewProps {
  data: AptGroup[];
  onSelectApt?: (apt: AptGroup) => void;
  initialAptAId?: string;
  initialAptBId?: string;
}

// MITRE ATT&CK Technique dictionary per group ID or default fallbacks
const APT_TECHNIQUE_MAPPINGS: Record<string, Array<{ code: string; name: string }>> = {
  G0006: [ // APT 1
    { code: 'T1059.003', name: 'Windows Command Shell' },
    { code: 'T1078', name: 'Valid Accounts' },
    { code: 'T1003.001', name: 'LSASS Memory Dumping' },
    { code: 'T1021.001', name: 'Remote Desktop Protocol' },
    { code: 'T1566.001', name: 'Spearphishing Attachment' },
    { code: 'T1105', name: 'Ingress Tool Transfer' },
  ],
  G0022: [ // APT 3
    { code: 'T1189', name: 'Drive-by Compromise' },
    { code: 'T1059.003', name: 'Windows Command Shell' },
    { code: 'T1078.003', name: 'Local Accounts' },
    { code: 'T1003.003', name: 'NTDS.dit Credentials' },
    { code: 'T1071.004', name: 'DNS Tunneling' },
  ],
  G0096: [ // APT 41
    { code: 'T1190', name: 'Exploit Public-Facing Application' },
    { code: 'T1068', name: 'Privilege Escalation' },
    { code: 'T1078.002', name: 'Domain Accounts' },
    { code: 'T1505.003', name: 'Web Shell Persistence' },
    { code: 'T1003.002', name: 'SAM Credential Dumping' },
    { code: 'T1020', name: 'Automated Exfiltration' },
  ],
  G0045: [ // APT 10
    { code: 'T1190', name: 'Exploit Public-Facing Application' },
    { code: 'T1059.001', name: 'PowerShell Execution' },
    { code: 'T1566.002', name: 'Spearphishing Link' },
    { code: 'T1071.001', name: 'Web Protocols (HTTP/S)' },
    { code: 'T1041', name: 'Exfiltration Over C2 Channel' },
  ],
  G0027: [ // APT 30
    { code: 'T1190', name: 'Exploit Public-Facing Application' },
    { code: 'T1133', name: 'External Remote Services' },
    { code: 'T1078', name: 'Valid Accounts' },
    { code: 'T1003.001', name: 'LSASS Memory Dumping' },
    { code: 'T1021.002', name: 'SMB/Windows Admin Shares' },
  ],
  G0031: [ // APT 31
    { code: 'T1566.002', name: 'Spearphishing Link' },
    { code: 'T1190', name: 'Exploit Public-Facing Application' },
    { code: 'T1071.001', name: 'Web Protocols' },
    { code: 'T1059.001', name: 'PowerShell' },
  ],
};

const DEFAULT_TECHNIQUES = [
  { code: 'T1059.003', name: 'Windows Command Shell' },
  { code: 'T1078', name: 'Valid Accounts' },
  { code: 'T1190', name: 'Exploit Public-Facing Application' },
  { code: 'T1003', name: 'Credential Dumping' },
  { code: 'T1071.001', name: 'Web Protocols' },
  { code: 'T1566.001', name: 'Spearphishing Attachment' },
];

const getAptMitreTechniques = (apt: AptGroup): Array<{ code: string; name: string }> => {
  if (!apt) return [];
  return APT_TECHNIQUE_MAPPINGS[apt.id] || DEFAULT_TECHNIQUES;
};

const getNotableCampaigns = (apt: AptGroup): string[] => {
  if (!apt) return [];
  if (apt.spans && apt.spans.length > 0) {
    return apt.spans.map((s) => `${s.startYear}–${s.endYear}: ${s.label || s.status}`);
  }
  return [`${apt.firstObservedYear || '2010'}–${apt.lastObservedYear || 'Present'}: State-sponsored intrusions targeting ${(apt.targetedSectors || []).slice(0, 3).join(', ')}`];
};

const getAptOverview = (apt: AptGroup): string => {
  if (!apt) return '';
  return `${apt.classification} (${apt.id}) is a Chinese state-sponsored threat group associated with ${apt.sponsoringAuthority} (${apt.sponsoringOrgType}). Primary front entity: ${apt.frontCompany}. Active since ${apt.firstObservedYear}, targeting ${(apt.targetedSectors || []).join(', ')}. Legal status: ${apt.legalActions || apt.legalCategory}.`;
};

const getTopAttackVector = (apt: AptGroup): string => {
  if (!apt) return '';
  if (apt.sponsoringOrgType === 'MSS') {
    return 'Zero-Day Vulnerability Exploitation & Web Shell Deployment';
  }
  if (apt.sponsoringOrgType === 'PLA') {
    return 'Spearphishing Attachments & Custom Malware Droppers';
  }
  return 'Edge Device Vulnerability Exploitation & Supply Chain Compromise';
};

export const AptComparisonView: React.FC<AptComparisonViewProps> = ({
  data = [],
  onSelectApt,
  initialAptAId,
  initialAptBId,
}) => {
  const safeData = data || [];

  // Default selections
  const [aptAId, setAptAId] = useState<string>(
    initialAptAId || (safeData.length > 0 ? safeData[0].id : '')
  );
  const [aptBId, setAptBId] = useState<string>(
    initialAptBId || (safeData.length > 1 ? safeData[1].id : safeData[0]?.id || '')
  );

  const aptA = useMemo(
    () => safeData.find((a) => a.id === aptAId) || safeData[0] || null,
    [safeData, aptAId]
  );
  const aptB = useMemo(
    () => safeData.find((a) => a.id === aptBId) || safeData[1] || safeData[0] || null,
    [safeData, aptBId]
  );

  // Swap APT A and APT B
  const handleSwap = () => {
    const temp = aptAId;
    setAptAId(aptBId);
    setAptBId(temp);
  };

  // Presets mapping query strings to find groups
  const presets = [
    { label: 'MSS vs PLA Flagships (APT41 vs APT27)', matchA: 'APT 41', matchB: 'APT 27' },
    { label: 'Civilian Intel Ops (APT41 vs APT31)', matchA: 'APT 41', matchB: 'APT 31' },
    { label: 'Military Recon (APT1 vs APT30)', matchA: 'APT 1', matchB: 'APT 30' },
    { label: 'i-SOON Cover Ops (APT41 vs APT10)', matchA: 'APT 41', matchB: 'APT 10' },
  ];

  const findGroupByQuery = (query: string) => {
    const clean = query.toLowerCase().replace(/\s+/g, '');
    return safeData.find(
      (d) =>
        d.id.toLowerCase() === clean ||
        d.classification.toLowerCase().replace(/\s+/g, '').includes(clean)
    );
  };

  // Calculate Overlaps safely
  const overlappingSectors = useMemo(() => {
    if (!aptA || !aptB) return [];
    return (aptA.targetedSectors || []).filter((sec) =>
      (aptB.targetedSectors || []).some((bSec) => bSec.toLowerCase() === sec.toLowerCase())
    );
  }, [aptA, aptB]);

  const techA = useMemo(() => (aptA ? getAptMitreTechniques(aptA) : []), [aptA]);
  const techB = useMemo(() => (aptB ? getAptMitreTechniques(aptB) : []), [aptB]);

  const overlappingTechniques = useMemo(() => {
    if (!aptA || !aptB) return [];
    return techA.filter((tech) => techB.some((bTech) => bTech.code === tech.code));
  }, [aptA, aptB, techA, techB]);

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
        Insufficient APT data available to render side-by-side comparison.
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
              value={aptA.id}
              onChange={(e) => setAptAId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded-lg text-sm font-bold focus:outline-none focus:border-blue-400 cursor-pointer"
            >
              {safeData.map((apt) => (
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
              value={aptB.id}
              onChange={(e) => setAptBId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded-lg text-sm font-bold focus:outline-none focus:border-purple-400 cursor-pointer"
            >
              {safeData.map((apt) => (
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
                const foundA = findGroupByQuery(p.matchA);
                const foundB = findGroupByQuery(p.matchB);
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
      <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-slate-950 overflow-x-auto">
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
                  {(aptA.aliases || []).map((a) => (
                    <span key={a} className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-[11px]">
                      {a}
                    </span>
                  ))}
                </div>
              </td>
              <td className="p-4 text-slate-200">
                <div className="flex flex-wrap gap-1">
                  {(aptB.aliases || []).map((a) => (
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
                <div className="text-white font-bold">
                  {aptA.firstObservedYear} - {aptA.lastObservedYear === 2026 ? 'Present' : aptA.lastObservedYear}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {aptA.sponsoringOrgType === 'MSS'
                    ? 'Civilian Intelligence & Strategic Commercial Espionage'
                    : 'Military Intelligence & Regional Reconnaissance'}
                </div>
              </td>
              <td className="p-4 text-slate-200">
                <div className="text-white font-bold">
                  {aptB.firstObservedYear} - {aptB.lastObservedYear === 2026 ? 'Present' : aptB.lastObservedYear}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {aptB.sponsoringOrgType === 'MSS'
                    ? 'Civilian Intelligence & Strategic Commercial Espionage'
                    : 'Military Intelligence & Regional Reconnaissance'}
                </div>
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
                  {(aptA.targetedSectors || []).map((sec) => {
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
                  {(aptB.targetedSectors || []).map((sec) => {
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
                    {aptA.legalCategory}
                  </span>
                  {(aptA.legalActionDate || aptA.legalActionYear) && (
                    <span className="text-[10px] text-slate-400">
                      ({aptA.legalActionDate || aptA.legalActionYear})
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-300">{aptA.legalActions}</div>
              </td>
              <td className="p-4 text-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold text-[10px]">
                    {aptB.legalCategory}
                  </span>
                  {(aptB.legalActionDate || aptB.legalActionYear) && (
                    <span className="text-[10px] text-slate-400">
                      ({aptB.legalActionDate || aptB.legalActionYear})
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-300">{aptB.legalActions}</div>
              </td>
            </tr>

            {/* 7. Top Attack Vector */}
            <tr className="hover:bg-slate-900/40">
              <td className="p-4 font-bold text-slate-400 border-r border-slate-800 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Top Attack Vector</span>
              </td>
              <td className="p-4 border-r border-slate-800 text-slate-200 font-bold text-amber-300">
                {getTopAttackVector(aptA)}
              </td>
              <td className="p-4 text-slate-200 font-bold text-amber-300">
                {getTopAttackVector(aptB)}
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
                  {techA.map((t) => {
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
                  {techB.map((t) => {
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
                  {getNotableCampaigns(aptA).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </td>
              <td className="p-4 text-slate-200">
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                  {getNotableCampaigns(aptB).map((c, i) => (
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
                {getAptOverview(aptA)}
              </td>
              <td className="p-4 text-slate-300 text-[11px] leading-relaxed">
                {getAptOverview(aptB)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
