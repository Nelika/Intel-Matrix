import React, { useState } from 'react';
import { AptGroup, getMitreUrl } from '../types';
import {
  X,
  Printer,
  Download,
  FileText,
  Copy,
  Check,
  ShieldAlert,
  Building,
  Globe,
  Scale,
  Sliders,
  Sparkles,
  Terminal,
  Lock,
  ChevronDown,
  Info,
  Calendar,
  UserCheck,
  FileSpreadsheet
} from 'lucide-react';

interface AptBriefingModalProps {
  apt: AptGroup | null;
  allApts: AptGroup[];
  onClose: () => void;
  onSelectApt?: (apt: AptGroup) => void;
}

export const AptBriefingModal: React.FC<AptBriefingModalProps> = ({
  apt,
  allApts,
  onClose,
  onSelectApt,
}) => {
  const [selectedAptId, setSelectedAptId] = useState<string>(apt?.id || allApts[0]?.id || '');
  const [classification, setClassification] = useState<'TLP:AMBER' | 'TLP:CLEAR' | 'TLP:RED' | 'CISA ADVISORY'>('TLP:AMBER');
  const [preparedFor, setPreparedFor] = useState<string>('Chief Information Security Officer (CISO) & SOC Leadership');
  const [analystNotes, setAnalystNotes] = useState<string>('');
  const [copiedFormat, setCopiedFormat] = useState<'html' | 'md' | 'json' | null>(null);
  const [showCustomizer, setShowCustomizer] = useState<boolean>(true);

  // Section toggle state
  const [includedSections, setIncludedSections] = useState({
    executiveSummary: true,
    sponsoringAuthority: true,
    targetedSectors: true,
    mitreTtps: true,
    legalActions: true,
    defensiveControls: true,
  });

  const currentApt = allApts.find((a) => a.id === selectedAptId) || apt || allApts[0];

  if (!currentApt) return null;

  const handleAptChange = (newId: string) => {
    setSelectedAptId(newId);
    const found = allApts.find((a) => a.id === newId);
    if (found && onSelectApt) {
      onSelectApt(found);
    }
  };

  // Default analyst note generator based on APT group attributes
  const generateDefaultAnalystNotes = (group: AptGroup) => {
    return `Critical Assessment for ${group.classification} (${group.id}): Group remains classified as an advanced state-sponsored adversary under ${group.sponsoringAuthority}. Primary operational vector targets ${group.targetedSectors.slice(0, 3).join(', ')} sectors using high-frequency spear-phishing and edge vulnerability exploitation. Legal enforcement actions reflect ${group.legalCategory.toLowerCase()} status (${group.legalActions}). High vigilance and perimeter log monitoring are strongly advised.`;
  };

  const activeNotes = analystNotes.trim() || generateDefaultAnalystNotes(currentApt);

  // Print function using native browser window.print
  const handlePrint = () => {
    window.print();
  };

  // Export HTML standalone document
  const handleDownloadHtml = () => {
    const documentHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Threat Briefing - ${currentApt.classification} (${currentApt.id})</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 40px; background: #ffffff; line-height: 1.5; }
    .header { border-bottom: 3px solid #1e293b; padding-bottom: 20px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-start; }
    .badge { display: inline-block; padding: 4px 12px; font-weight: bold; font-family: monospace; font-size: 12px; border-radius: 4px; text-transform: uppercase; }
    .badge-amber { background: #fef3c7; color: #92400e; border: 1px solid #f59e0b; }
    .badge-red { background: #fee2e2; color: #991b1b; border: 1px solid #ef4444; }
    .badge-clear { background: #dcfce7; color: #166534; border: 1px solid #22c55e; }
    .title { font-size: 26px; font-weight: 800; margin: 10px 0 5px 0; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
    .subtitle { font-size: 13px; color: #475569; font-family: monospace; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; }
    .card-title { font-size: 11px; text-transform: uppercase; font-weight: bold; color: #2563eb; font-family: monospace; margin-bottom: 6px; letter-spacing: 0.5px; }
    .card-value { font-size: 14px; font-weight: 700; color: #0f172a; }
    .section-title { font-size: 15px; font-weight: 700; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 25px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .tag { display: inline-block; background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; margin-right: 5px; margin-bottom: 5px; font-family: monospace; }
    .footer { margin-top: 40px; pt: 20px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="subtitle">CICADA 3301 THREAT INTELLIGENCE LABS • EXECUTIVE BRIEFING</div>
      <div class="title">${currentApt.classification} (${currentApt.id})</div>
      <div class="subtitle">Prepared For: ${preparedFor} • Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}</div>
    </div>
    <div>
      <span class="badge ${classification === 'TLP:RED' ? 'badge-red' : classification === 'TLP:CLEAR' ? 'badge-clear' : 'badge-amber'}">${classification}</span>
    </div>
  </div>

  <div class="card" style="margin-bottom: 20px; background: #0f172a; color: #ffffff; border: 1px solid #1e293b;">
    <div class="card-title" style="color: #38bdf8;">ANALYST EXECUTIVE SUMMARY</div>
    <p style="font-size: 13px; margin: 0; line-height: 1.6; color: #e2e8f0;">${activeNotes}</p>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Sponsoring Authority</div>
      <div class="card-value">${currentApt.sponsoringAuthority}</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Type: ${currentApt.sponsoringOrgType}</div>
    </div>
    <div class="card">
      <div class="card-title">Front Entity / Contractor</div>
      <div class="card-value">${currentApt.frontCompany}</div>
    </div>
    <div class="card">
      <div class="card-title">Microsoft Taxonomy</div>
      <div class="card-value">${currentApt.microsoftTaxonomy}</div>
    </div>
    <div class="card">
      <div class="card-title">Kaspersky / Securelist Tracking</div>
      <div class="card-value">${currentApt.kasperskySecurelist}</div>
    </div>
  </div>

  <div class="section-title">Targeted Industry Sectors</div>
  <p style="font-size: 13px; color: #334155; margin-bottom: 10px;">${currentApt.rawTargetedSectors}</p>
  <div>
    ${currentApt.targetedSectors.map((s) => `<span class="tag">${s}</span>`).join('')}
  </div>

  <div class="section-title">Legal & Enforcement Actions</div>
  <div class="card">
    <div style="font-size: 12px; font-weight: bold; color: #1e1b4b; margin-bottom: 4px;">Category: ${currentApt.legalCategory}</div>
    <p style="font-size: 13px; margin: 0; color: #334155;">${currentApt.legalActions}</p>
  </div>

  <div class="section-title">Operational Lifecycle & Status</div>
  <div class="card">
    <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold;">
      <span>Status: ${currentApt.currentStatus}</span>
      <span>Observed Window: ${currentApt.firstObservedYear} – ${currentApt.lastObservedYear}</span>
    </div>
  </div>

  <div class="footer">
    CONFIDENTIALITY NOTICE: This document is produced by Cicada 3301 Threat Intelligence Group for defensive operational security purposes under ${classification}.
  </div>
</body>
</html>`;

    const blob = new Blob([documentHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Threat_Briefing_${currentApt.id}_${currentApt.classification.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Markdown report
  const handleDownloadMarkdown = () => {
    const md = `# [${classification}] THREAT INTELLIGENCE EXECUTIVE BRIEFING
**Subject:** ${currentApt.classification} (${currentApt.id})
**Prepared For:** ${preparedFor}
**Date:** ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}
**Classification:** ${classification}

---

## 1. Executive Summary & Assessment
${activeNotes}

---

## 2. Threat Actor Profile
- **Primary Classification:** ${currentApt.classification}
- **ATT&CK ID:** ${currentApt.id}
- **Associated Aliases:** ${currentApt.aliases.join(', ')}
- **Sponsoring Authority:** ${currentApt.sponsoringAuthority} (${currentApt.sponsoringOrgType})
- **Front Company / Unit:** ${currentApt.frontCompany}
- **Microsoft Taxonomy:** ${currentApt.microsoftTaxonomy}
- **Kaspersky Tracking:** ${currentApt.kasperskySecurelist}

---

## 3. Targeted Sectors & Objectives
- **Target Overview:** ${currentApt.rawTargetedSectors}
- **Primary Sectors:** ${currentApt.targetedSectors.join(', ')}

---

## 4. Legal & Regulatory Sanctions
- **Action Category:** ${currentApt.legalCategory}
- **Enforcement Details:** ${currentApt.legalActions}

---

## 5. Operational Status
- **Lifecycle Status:** ${currentApt.currentStatus}
- **Observation Span:** ${currentApt.firstObservedYear} – ${currentApt.lastObservedYear}

---
*Report generated by Cicada 3301 Threat Intelligence Platform.*
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Threat_Briefing_${currentApt.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAsMarkdown = () => {
    const md = `### [${classification}] BRIEFING: ${currentApt.classification} (${currentApt.id})\n\n**Assessment:** ${activeNotes}\n\n- **Sponsoring Authority:** ${currentApt.sponsoringAuthority}\n- **Front Entity:** ${currentApt.frontCompany}\n- **Targets:** ${currentApt.rawTargetedSectors}\n- **Legal Action:** ${currentApt.legalActions}`;
    navigator.clipboard.writeText(md);
    setCopiedFormat('md');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in no-print">
      
      {/* Printable Area Wrapper (This is what prints when window.print is triggered) */}
      <div className="bg-slate-900 border border-slate-800 max-w-5xl w-full rounded-2xl shadow-2xl relative my-6 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="p-4 sm:p-5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-950 border border-blue-600/60 text-blue-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                  Executive Briefing Generator
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                  PDF / PRINT READY
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Format and generate an official threat intelligence briefing document for {currentApt.classification}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCustomizer(!showCustomizer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                showCustomizer
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showCustomizer ? 'Hide Controls' : 'Customize Report'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-lg transition-all shadow-md hover:shadow-emerald-900/40 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950/60">
          
          {/* Customizer Panel (Col 4 on desktop if visible) */}
          {showCustomizer && (
            <div className="lg:col-span-4 space-y-5 bg-slate-900/90 border border-slate-800 p-4 rounded-xl text-xs space-y-4 shadow-inner">
              <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Report Controls</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Live Sync</span>
              </div>

              {/* APT Group Selector Dropdown */}
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold">
                  Select Threat Actor (APT):
                </label>
                <div className="relative">
                  <select
                    value={selectedAptId}
                    onChange={(e) => handleAptChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 pr-8 text-xs font-mono focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    {allApts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.classification} ({a.id}) - {a.sponsoringAuthority}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Classification Marking */}
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold">
                  Classification Marking:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['TLP:AMBER', 'TLP:CLEAR', 'TLP:RED', 'CISA ADVISORY'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setClassification(level)}
                      className={`p-1.5 text-[10px] font-mono font-bold rounded border transition-all ${
                        classification === level
                          ? level === 'TLP:RED'
                            ? 'bg-red-950 text-red-300 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                            : level === 'TLP:CLEAR'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : 'bg-amber-950 text-amber-300 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient */}
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold">
                  Prepared For / Recipient:
                </label>
                <input
                  type="text"
                  value={preparedFor}
                  onChange={(e) => setPreparedFor(e.target.value)}
                  placeholder="e.g. CISO & Executive Leadership"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2 text-xs font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Analyst Summary Notes input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono text-slate-300 font-semibold">
                    Analyst Assessment Note:
                  </label>
                  <button
                    onClick={() => setAnalystNotes(generateDefaultAnalystNotes(currentApt))}
                    className="text-[10px] text-cyan-400 hover:underline font-mono flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Summarize</span>
                  </button>
                </div>
                <textarea
                  value={analystNotes}
                  onChange={(e) => setAnalystNotes(e.target.value)}
                  rows={4}
                  placeholder="Enter analyst briefing notes or custom executive remarks..."
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs font-sans focus:border-blue-500 focus:outline-none leading-relaxed resize-none"
                />
              </div>

              {/* Section Toggles */}
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-2 font-semibold">
                  Include Sections:
                </label>
                <div className="space-y-1.5">
                  {[
                    { key: 'executiveSummary', label: 'Analyst Executive Assessment' },
                    { key: 'sponsoringAuthority', label: 'Sponsoring Authority & Front Entity' },
                    { key: 'targetedSectors', label: 'Targeted Sectors Breakdown' },
                    { key: 'mitreTtps', label: 'MITRE ATT&CK TTP Mapping' },
                    { key: 'legalActions', label: 'Legal & Enforcement Sanctions' },
                    { key: 'defensiveControls', label: 'Recommended Defensive Controls' },
                  ].map((sec) => (
                    <label key={sec.key} className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={includedSections[sec.key as keyof typeof includedSections]}
                        onChange={(e) =>
                          setIncludedSections({
                            ...includedSections,
                            [sec.key]: e.target.checked,
                          })
                        }
                        className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                      />
                      <span className="font-mono text-[11px]">{sec.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Alternative Export Buttons */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Export Options:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleDownloadHtml}
                    className="flex items-center justify-center gap-1.5 p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded text-[11px] font-mono transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Download HTML</span>
                  </button>

                  <button
                    onClick={handleDownloadMarkdown}
                    className="flex items-center justify-center gap-1.5 p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded text-[11px] font-mono transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download MD</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Printable Document Preview Paper Pane (Col 8 or 12) */}
          <div className={`${showCustomizer ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all`}>
            
            {/* The Paper Sheet Container */}
            <div className="bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-2xl border border-slate-200 font-sans relative printable-area overflow-hidden my-1">
              
              {/* Classification Banner Top */}
              <div
                className={`py-1.5 px-4 text-center font-mono font-extrabold text-xs uppercase tracking-[0.25em] mb-6 rounded ${
                  classification === 'TLP:RED'
                    ? 'bg-red-600 text-white'
                    : classification === 'TLP:CLEAR'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-amber-500 text-slate-950'
                }`}
              >
                {classification} • UNCLASSIFIED // THREAT INTELLIGENCE BRIEFING
              </div>

              {/* Report Document Header */}
              <div className="border-b-2 border-slate-900 pb-5 mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-blue-700 uppercase tracking-wider bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      OFFICIAL DOSSIER BRIEFING
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      DOC-ID: CICADA-{currentApt.id}-2026
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 uppercase tracking-tight">
                    {currentApt.classification}
                  </h1>
                  <p className="text-xs font-mono text-slate-600 mt-1 font-semibold">
                    ATT&CK Group Identifier: <span className="text-blue-800 font-bold">{currentApt.id}</span>
                  </p>
                </div>

                <div className="text-right font-mono text-xs text-slate-600 space-y-1 border-l-2 border-slate-200 pl-4 py-1">
                  <div><strong>Date Generated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  <div><strong>Prepared For:</strong> {preparedFor}</div>
                  <div><strong>Authority:</strong> Cicada 3301 Intel Labs</div>
                </div>
              </div>

              {/* Section 1: Executive Assessment Note */}
              {includedSections.executiveSummary && (
                <div className="mb-6 p-4 bg-slate-900 text-white rounded-lg font-sans border-l-4 border-blue-500 shadow-xs">
                  <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Analyst Executive Summary
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">THREAT LEVEL: HIGH</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {activeNotes}
                  </p>
                </div>
              )}

              {/* Key Intelligence Matrix Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold">Current Status</span>
                  <span className={`text-xs font-mono font-bold uppercase ${currentApt.currentStatus === 'Active' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    ● {currentApt.currentStatus}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold">First Observed</span>
                  <span className="text-xs font-mono font-bold text-slate-900">{currentApt.firstObservedYear}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold">Microsoft Name</span>
                  <span className="text-xs font-mono font-bold text-slate-900 truncate block">{currentApt.microsoftTaxonomy}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold">Kaspersky Name</span>
                  <span className="text-xs font-mono font-bold text-slate-900 truncate block">{currentApt.kasperskySecurelist}</span>
                </div>
              </div>

              {/* Section 2: Sponsoring Authority & Front Entity */}
              {includedSections.sponsoringAuthority && (
                <div className="mb-6 space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-1 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-blue-700" />
                    <span>State Sponsorship & Operational Front</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                        Sponsoring State Organ
                      </div>
                      <div className="text-sm font-mono font-bold text-slate-900">
                        {currentApt.sponsoringAuthority}
                      </div>
                      <span className="inline-block mt-1 text-[10px] font-mono font-bold text-blue-700">
                        Organ Type: {currentApt.sponsoringOrgType}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                        Commercial / Military Front Entity
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-800 leading-snug">
                        {currentApt.frontCompany}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aliases */}
              <div className="mb-6">
                <div className="text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">
                  Known Operational Aliases
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentApt.aliases.map((alias, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-slate-100 border border-slate-300 text-slate-800 font-mono text-xs rounded font-semibold"
                    >
                      {alias}
                    </span>
                  ))}
                </div>
              </div>

              {/* Section 3: Targeted Sectors */}
              {includedSections.targetedSectors && (
                <div className="mb-6 space-y-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-1 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-700" />
                    <span>Targeted Sectors & Global Scope</span>
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    {currentApt.rawTargetedSectors}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentApt.targetedSectors.map((s, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 font-mono text-[11px] font-bold rounded"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 4: MITRE ATT&CK TTP Mapping */}
              {includedSections.mitreTtps && (
                <div className="mb-6 space-y-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-1 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-blue-700" />
                    <span>MITRE ATT&CK Technical Identifiers & TTPs</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'T1059.003', name: 'Command & Scripting Interpreter: Windows Command Shell', tactic: 'Execution' },
                      { id: 'T1078', name: 'Valid Accounts & Credential Theft', tactic: 'Defense Evasion' },
                      { id: 'T1190', name: 'Exploitation of Public-Facing Applications', tactic: 'Initial Access' },
                      { id: 'T1566.001', name: 'Phishing: Spearphishing Attachment', tactic: 'Initial Access' },
                      { id: 'T1003.001', name: 'OS Credential Dumping: LSASS Memory', tactic: 'Credential Access' },
                      { id: 'T1071.001', name: 'Application Layer Protocol: Web Protocols', tactic: 'Command and Control' },
                    ].map((tech) => (
                      <div key={tech.id} className="p-2 bg-slate-50 border border-slate-200 rounded text-left">
                        <span className="block font-mono font-bold text-xs text-blue-800">{tech.id}</span>
                        <span className="block font-sans text-[11px] font-bold text-slate-800 truncate">{tech.name}</span>
                        <span className="block font-mono text-[9px] text-slate-500 uppercase">{tech.tactic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 5: Legal Actions & Sanctions */}
              {includedSections.legalActions && (
                <div className="mb-6 space-y-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-1 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-blue-700" />
                    <span>Legal, Regulatory & Enforcement Sanctions</span>
                  </h3>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900 uppercase">
                        Action Type: {currentApt.legalCategory}
                      </span>
                      {currentApt.legalActionYear && (
                        <span className="font-mono text-[10px] text-slate-500 font-bold">
                          Year: {currentApt.legalActionYear}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans">
                      {currentApt.legalActions}
                    </p>
                  </div>
                </div>
              )}

              {/* Section 6: Recommended Defensive Controls */}
              {includedSections.defensiveControls && (
                <div className="mb-6 space-y-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-1 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-700" />
                    <span>Recommended Defensive Mitigations</span>
                  </h3>
                  <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 font-sans">
                    <li>Enforce strict Phishing-Resistant Multi-Factor Authentication (MFA) across all administrative portals.</li>
                    <li>Audit edge router, VPN, and public-facing server software for patch compliance against active CISA KEV advisories.</li>
                    <li>Isolate operational technology (OT) network segments from enterprise IT domain controllers.</li>
                    <li>Ingest MITRE ATT&CK Navigator layer for {currentApt.classification} into SIEM correlation rules.</li>
                  </ul>
                </div>
              )}

              {/* Document Signoff Footer */}
              <div className="mt-8 pt-4 border-t-2 border-slate-900 flex flex-wrap items-center justify-between gap-4 text-[10px] font-mono text-slate-600">
                <div>
                  <div><strong>Prepared By:</strong> Threat Intelligence Operations Command</div>
                  <div><strong>Platform:</strong> Cicada 3301 Cyber Threat Intelligence Matrix v3.8</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-800 uppercase">{classification}</div>
                  <div>Document Page 1 of 1</div>
                </div>
              </div>

              {/* Bottom Classification Bar */}
              <div
                className={`mt-4 py-1 px-4 text-center font-mono font-extrabold text-[10px] uppercase tracking-[0.25em] rounded ${
                  classification === 'TLP:RED'
                    ? 'bg-red-600 text-white'
                    : classification === 'TLP:CLEAR'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-amber-500 text-slate-950'
                }`}
              >
                {classification} • FOR AUTHORIZED DEFENSIVE USE ONLY
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
