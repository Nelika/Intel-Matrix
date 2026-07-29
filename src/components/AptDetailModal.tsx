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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c0c0e]/85 backdrop-blur-md overflow-y-auto animate-fade-in" onClick={onClose}>
      <div
        className="bg-[#161618] border border-[#242426] max-w-2xl w-full p-6 shadow-2xl relative my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#c19a6b]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-[#0c0c0e] border border-[#242426] text-[#8c8c8e] hover:text-[#f2f2f4] hover:border-[#c19a6b] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Area */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono px-2.5 py-0.5 bg-[#0c0c0e] border border-[#c19a6b]/40 text-[#c19a6b] font-semibold uppercase tracking-[0.2em]">
              THREAT DOSSIER
            </span>
            <span className="text-xs font-mono text-[#8c8c8e]">
              [ATT&CK ID: {apt.id}]
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-2xl font-serif font-light text-[#f2f2f4]">
              {apt.classification}
            </h2>
            <a
              href={`https://attack.mitre.org/groups/${apt.id}/`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono text-[#c19a6b] hover:underline flex items-center gap-1"
            >
              <span>MITRE ATT&CK Group Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Content Breakdown */}
        <div className="space-y-4 text-sm">
          
          {/* Aliases */}
          <div className="p-4 bg-[#0c0c0e] border border-[#242426]">
            <div className="text-[10px] font-mono uppercase text-[#8c8c8e] mb-2 font-semibold tracking-widest">
              Associated Group Aliases
            </div>
            <div className="flex flex-wrap gap-1.5">
              {apt.aliases.map((alias, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-[#161618] border border-[#242426] text-[#e2e2e4] text-xs font-mono"
                >
                  {alias}
                </span>
              ))}
            </div>
          </div>

          {/* Sponsoring Authority & Front Entity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-4 bg-[#0c0c0e] border border-[#242426]">
              <div className="flex items-center gap-2 text-xs font-mono text-[#c19a6b] font-semibold mb-1">
                <ShieldAlert className="w-4 h-4" />
                <span>Sponsoring State Authority</span>
              </div>
              <p className="font-mono text-[#f2f2f4] font-bold text-sm mt-1">
                {apt.sponsoringAuthority}
              </p>
              <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 bg-[#161618] text-[#c19a6b] border border-[#242426]">
                Type: {apt.sponsoringOrgType}
              </span>
            </div>

            <div className="p-4 bg-[#0c0c0e] border border-[#242426]">
              <div className="flex items-center gap-2 text-xs font-mono text-[#c19a6b] font-semibold mb-1">
                <Building className="w-4 h-4" />
                <span>Front Company / Contractor</span>
              </div>
              <p className="font-mono text-[#e2e2e4] text-xs leading-relaxed mt-1">
                {apt.frontCompany}
              </p>
            </div>

          </div>

          {/* Targeted Sectors */}
          <div className="p-4 bg-[#0c0c0e] border border-[#242426]">
            <div className="flex items-center gap-2 text-xs font-mono text-[#c19a6b] font-semibold mb-2">
              <Globe className="w-4 h-4" />
              <span>Primary Targeted Sectors & Entities</span>
            </div>
            <p className="text-[#e2e2e4] text-xs leading-relaxed mb-3 font-sans">
              {apt.rawTargetedSectors}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {apt.targetedSectors.map((sector, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-[#161618] border border-[#242426] text-[#c19a6b] font-mono text-xs"
                >
                  {sector}
                </span>
              ))}
            </div>
          </div>

          {/* Legal and Regulatory Actions */}
          <div className="p-4 bg-[#0c0c0e] border border-[#242426]">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[#c19a6b] font-semibold">
                <Scale className="w-4 h-4" />
                <span>Legal & Enforcement Actions</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 font-semibold uppercase tracking-wider bg-[#161618] border border-[#c19a6b]/40 text-[#c19a6b]">
                {apt.legalCategory}
              </span>
            </div>
            <p className="text-[#e2e2e4] text-xs leading-relaxed font-sans">
              {apt.legalActions}
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-[#242426] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={copyAsJson}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0c0c0e] hover:bg-[#242426] border border-[#242426] text-[#e2e2e4] text-xs font-mono transition-colors"
            >
              {copiedFormat === 'json' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#c19a6b]" />
                  <span className="text-[#c19a6b]">Copied JSON!</span>
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0c0c0e] hover:bg-[#242426] border border-[#242426] text-[#e2e2e4] text-xs font-mono transition-colors"
            >
              {copiedFormat === 'md' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#c19a6b]" />
                  <span className="text-[#c19a6b]">Copied MD!</span>
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
            className="px-5 py-1.5 bg-[#c19a6b] hover:bg-[#d8b080] text-[#0c0c0e] font-bold text-xs font-mono transition-colors"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
};
