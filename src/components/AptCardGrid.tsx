import React from 'react';
import { AptGroup } from '../types';
import { ExternalLink, Shield, Building, Globe, Scale, ArrowRight } from 'lucide-react';

interface AptCardGridProps {
  data: AptGroup[];
  onSelectApt: (apt: AptGroup) => void;
  searchQuery: string;
}

export const AptCardGrid: React.FC<AptCardGridProps> = ({ data, onSelectApt, searchQuery }) => {
  const highlightMatch = (text: string) => {
    if (!searchQuery.trim()) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-[#c19a6b]/30 text-[#f2f2f4] px-0.5 rounded font-bold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
      {data.map((apt) => {
        return (
          <div
            key={apt.id}
            onClick={() => onSelectApt(apt)}
            className="bg-[#161618] border border-[#242426] hover:border-[#c19a6b]/60 p-6 shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
          >
            {/* Top Accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#c19a6b]" />

            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-light text-xl text-[#f2f2f4]">
                      {highlightMatch(apt.classification)}
                    </span>
                    <a
                      href={`https://attack.mitre.org/groups/${apt.id}/`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-2 py-0.5 bg-[#0c0c0e] border border-[#242426] text-[#c19a6b] font-mono text-xs flex items-center gap-1 hover:border-[#c19a6b]"
                    >
                      <span>{highlightMatch(apt.id)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 uppercase font-semibold tracking-wider bg-[#0c0c0e] border border-[#c19a6b]/40 text-[#c19a6b]">
                  {apt.legalCategory}
                </span>
              </div>

              {/* Aliases */}
              <div className="mb-4">
                <div className="text-[10px] font-mono uppercase text-[#8c8c8e] tracking-widest mb-1.5">
                  Aliases
                </div>
                <div className="flex flex-wrap gap-1">
                  {apt.aliases.map((alias, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono px-2 py-0.5 bg-[#0c0c0e] border border-[#242426] text-[#8c8c8e]"
                    >
                      {highlightMatch(alias)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sponsoring Authority & Front Entity */}
              <div className="space-y-2 mb-4 bg-[#0c0c0e] p-3 border border-[#242426] text-xs">
                <div>
                  <div className="flex items-center gap-1.5 text-[#8c8c8e] font-mono text-[11px] mb-0.5">
                    <Shield className="w-3.5 h-3.5 text-[#c19a6b]" />
                    <span>Sponsoring Authority</span>
                  </div>
                  <p className="text-[#f2f2f4] font-medium font-mono text-xs pl-5">
                    {highlightMatch(apt.sponsoringAuthority)}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#242426]">
                  <div className="flex items-center gap-1.5 text-[#8c8c8e] font-mono text-[11px] mb-0.5">
                    <Building className="w-3.5 h-3.5 text-[#c19a6b]" />
                    <span>Front Entity</span>
                  </div>
                  <p className="text-[#e2e2e4] text-xs pl-5">
                    {highlightMatch(apt.frontCompany)}
                  </p>
                </div>
              </div>

              {/* Targeted Sectors */}
              <div className="mb-4">
                <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-[#8c8c8e] tracking-widest mb-1.5">
                  <Globe className="w-3 h-3 text-[#c19a6b]" />
                  <span>Targeted Sectors</span>
                </div>
                <p className="text-xs text-[#e2e2e4] mb-2 line-clamp-2 leading-relaxed font-sans">
                  {highlightMatch(apt.rawTargetedSectors)}
                </p>
              </div>
            </div>

            {/* Footer / Legal Summary */}
            <div className="pt-3 border-t border-[#242426] flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[#8c8c8e] font-mono text-[11px]">
                <Scale className="w-3.5 h-3.5 text-[#c19a6b] shrink-0" />
                <span className="truncate max-w-[200px]">{apt.legalActions}</span>
              </div>
              <span className="text-[#c19a6b] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-mono text-[11px]">
                View <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
