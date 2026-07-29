import React, { useState } from 'react';
import { AptGroup } from '../types';
import { X, ExternalLink, ShieldAlert, Building, Globe, Scale, Copy, Check, FileText, Share2 } from 'lucide-react';

interface AptDetailModalProps {
  apt: AptGroup | null;
  onClose: () => void;
}

export const AptDetailModal: React.FC<AptDetailModalProps> = ({ apt, onClose }) => {
  const [copiedFormat, setCopiedFormat] = useState<'json' | 'md' | null>(null);

  if (!apt) return null;

  const copyAsJson = () => {
    navigator.clipboard.writeText(JSON.stringify(apt, null, 2));
    setCopiedFormat('json');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const copyAsMarkdown = () => {
    const md = `### Threat Intel Dossier: ${apt.classification} (${apt.id})
- **Aliases:** ${apt.aliases.join(', ')}
- **Sponsoring Authority:** ${apt.sponsoringAuthority} (${apt.sponsoringOrgType})
- **Front Entity:** ${apt.frontCompany}
- **Targeted Sectors:** ${apt.rawTargetedSectors}
- **Legal & Regulatory Actions:** ${apt.legalActions}
- **MITRE Link:** https://attack.mitre.org/groups/${apt.id}/`;

    navigator.clipboard.writeText(md);
    setCopiedFormat('md');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in" onClick={onClose}>
      <div
        className="bg-white border border-slate-200 max-w-2xl w-full p-6 rounded-xl shadow-2xl relative my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Area */}
        <div className="mb-6 pt-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 font-bold uppercase tracking-[0.18em] rounded">
              THREAT DOSSIER
            </span>
            <span className="text-xs font-mono text-slate-500 font-semibold">
              [ATT&CK ID: {apt.id}]
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-2xl font-serif font-bold text-slate-900">
              {apt.classification}
            </h2>
            <a
              href={`https://attack.mitre.org/groups/${apt.id}/`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>MITRE ATT&CK Group Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Content Breakdown */}
        <div className="space-y-4 text-sm">
          
          {/* Aliases */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-[10px] font-mono uppercase text-slate-500 mb-2 font-bold tracking-wider">
              Associated Group Aliases
            </div>
            <div className="flex flex-wrap gap-1.5">
              {apt.aliases.map((alias, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-mono rounded"
                >
                  {alias}
                </span>
              ))}
            </div>
          </div>

          {/* Sponsoring Authority & Front Entity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2 text-xs font-mono text-blue-600 font-bold mb-1">
                <ShieldAlert className="w-4 h-4" />
                <span>Sponsoring State Authority</span>
              </div>
              <p className="font-mono text-slate-900 font-bold text-sm mt-1">
                {apt.sponsoringAuthority}
              </p>
              <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 bg-white text-blue-700 border border-slate-200 rounded font-semibold">
                Type: {apt.sponsoringOrgType}
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2 text-xs font-mono text-blue-600 font-bold mb-1">
                <Building className="w-4 h-4" />
                <span>Front Company / Contractor</span>
              </div>
              <p className="font-mono text-slate-800 text-xs leading-relaxed mt-1 font-semibold">
                {apt.frontCompany}
              </p>
            </div>

          </div>

          {/* Targeted Sectors */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-2 text-xs font-mono text-blue-600 font-bold mb-2">
              <Globe className="w-4 h-4" />
              <span>Primary Targeted Sectors & Entities</span>
            </div>
            <p className="text-slate-700 text-xs leading-relaxed mb-3 font-sans">
              {apt.rawTargetedSectors}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {apt.targetedSectors.map((sector, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-white border border-blue-200 text-blue-700 font-mono text-xs rounded font-medium"
                >
                  {sector}
                </span>
              ))}
            </div>
          </div>

          {/* Legal and Regulatory Actions */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs font-mono text-blue-600 font-bold">
                <Scale className="w-4 h-4" />
                <span>Legal & Enforcement Actions</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-200 text-indigo-700 rounded">
                {apt.legalCategory}
              </span>
            </div>
            <p className="text-slate-700 text-xs leading-relaxed font-sans">
              {apt.legalActions}
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={copyAsJson}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-mono rounded transition-colors"
            >
              {copiedFormat === 'json' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-blue-600 font-bold">Copied JSON!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>

            <button
              onClick={copyAsMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-mono rounded transition-colors"
            >
              {copiedFormat === 'md' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-blue-600 font-bold">Copied MD!</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Copy Briefing</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs font-mono rounded transition-colors shadow-sm"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
};
