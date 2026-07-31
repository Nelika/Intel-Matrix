import React from 'react';
import { AptGroup, getMitreUrl } from '../types';
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
        <mark key={i} className="bg-amber-200 text-slate-900 px-0.5 rounded font-bold">
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
            className="bg-white border border-slate-200 hover:border-blue-400 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
          >
            {/* Top Accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />

            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-4 pt-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-xl text-slate-900">
                      {highlightMatch(apt.classification)}
                    </span>
                    <a
                      href={getMitreUrl(apt)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 font-mono text-xs font-semibold rounded flex items-center gap-1 hover:bg-blue-100 hover:border-blue-300"
                    >
                      <span>{highlightMatch(apt.id)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 uppercase font-semibold tracking-wider bg-indigo-50 border border-indigo-200 text-indigo-700 rounded">
                    {apt.legalCategory}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 font-bold rounded flex items-center gap-1 ${
                      apt.currentStatus === 'Active'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : apt.currentStatus === 'Intermittent'
                        ? 'bg-amber-50 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        apt.currentStatus === 'Active'
                          ? 'bg-emerald-500 animate-ping'
                          : apt.currentStatus === 'Intermittent'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    <span>{apt.currentStatus}</span>
                  </span>
                </div>
              </div>

              {/* Taxonomies & Tracking */}
              <div className="mb-3 space-y-1 font-mono text-[11px]">
                <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
                  <span className="text-[10px] uppercase font-bold text-slate-400 w-16 shrink-0">MSFT:</span>
                  <span className="text-cyan-800 bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded text-[10px] font-medium truncate">
                    {highlightMatch(apt.microsoftTaxonomy)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
                  <span className="text-[10px] uppercase font-bold text-slate-400 w-16 shrink-0">Kaspersky:</span>
                  <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px] font-medium truncate">
                    {highlightMatch(apt.kasperskySecurelist)}
                  </span>
                </div>
              </div>

              {/* Aliases */}
              <div className="mb-4">
                <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider mb-1.5">
                  Aliases
                </div>
                <div className="flex flex-wrap gap-1">
                  {apt.aliases.map((alias, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded"
                    >
                      {highlightMatch(alias)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sponsoring Authority & Front Entity */}
              <div className="space-y-2 mb-4 bg-slate-50 p-3 border border-slate-200 text-xs rounded-lg">
                <div>
                  <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] font-semibold mb-0.5">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    <span>Sponsoring Authority</span>
                  </div>
                  <p className="text-slate-900 font-bold font-mono text-xs pl-5">
                    {highlightMatch(apt.sponsoringAuthority)}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] font-semibold mb-0.5">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    <span>Front Entity</span>
                  </div>
                  <p className="text-slate-700 text-xs pl-5 font-mono">
                    {highlightMatch(apt.frontCompany)}
                  </p>
                </div>
              </div>

              {/* Targeted Sectors */}
              <div className="mb-4">
                <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider mb-1.5">
                  <Globe className="w-3 h-3 text-blue-600" />
                  <span>Targeted Sectors</span>
                </div>
                <p className="text-xs text-slate-700 mb-2 line-clamp-2 leading-relaxed font-sans">
                  {highlightMatch(apt.rawTargetedSectors)}
                </p>
              </div>
            </div>

            {/* Footer / Legal Summary */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                <Scale className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate max-w-[200px]">{apt.legalActions}</span>
              </div>
              <span className="text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-mono text-[11px] font-bold">
                View <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
