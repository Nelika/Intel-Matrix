import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gavel,
  ShieldAlert,
  AlertTriangle,
  Ban,
  FileText,
  Calendar,
  Building2,
  ArrowRight,
  Filter,
  ArrowUpDown,
  SearchX,
  Target,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { AptGroup } from '../types';
import { HorizontalSvgTimeline } from './HorizontalSvgTimeline';

interface AptTimelineProps {
  data: AptGroup[];
  onSelectApt: (apt: AptGroup) => void;
  searchQuery?: string;
}

export const AptTimeline: React.FC<AptTimelineProps> = ({
  data,
  onSelectApt,
  searchQuery = '',
}) => {
  const [sortAscending, setSortAscending] = useState<boolean>(false); // false = Newest First (2024 -> 2014)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Filter & Sort Timeline Items
  const timelineEvents = useMemo(() => {
    let filtered = data;

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter((apt) => apt.legalCategory === selectedCategory);
    }

    return [...filtered].sort((a, b) => {
      const yearA = a.legalActionYear || 2000;
      const yearB = b.legalActionYear || 2000;
      if (yearA !== yearB) {
        return sortAscending ? yearA - yearB : yearB - yearA;
      }
      return a.classification.localeCompare(b.classification);
    });
  }, [data, selectedCategory, sortAscending]);

  // Unique categories in current dataset
  const categories = useMemo(() => {
    const set = new Set(data.map((d) => d.legalCategory));
    return ['ALL', ...Array.from(set)];
  }, [data]);

  // Category Icon & Styling Helper
  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'Indictment':
        return {
          icon: Gavel,
          badgeBg: 'bg-red-50 text-red-700 border-red-200',
          dotBg: 'bg-red-500 shadow-red-500/50',
          cardBorder: 'border-l-4 border-l-red-500',
          textAccent: 'text-red-700',
        };
      case 'Sanctions':
        return {
          icon: ShieldAlert,
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          dotBg: 'bg-amber-500 shadow-amber-500/50',
          cardBorder: 'border-l-4 border-l-amber-500',
          textAccent: 'text-amber-800',
        };
      case 'Advisory':
        return {
          icon: AlertTriangle,
          badgeBg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
          dotBg: 'bg-cyan-500 shadow-cyan-500/50',
          cardBorder: 'border-l-4 border-l-cyan-500',
          textAccent: 'text-cyan-800',
        };
      case 'Asset Freeze':
        return {
          icon: Ban,
          badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
          dotBg: 'bg-purple-500 shadow-purple-500/50',
          cardBorder: 'border-l-4 border-l-purple-500',
          textAccent: 'text-purple-800',
        };
      case 'Exposure Report':
      default:
        return {
          icon: FileText,
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dotBg: 'bg-emerald-500 shadow-emerald-500/50',
          cardBorder: 'border-l-4 border-l-emerald-500',
          textAccent: 'text-emerald-800',
        };
    }
  };

  // Helper to highlight query matches
  const highlightMatch = (text: string) => {
    if (!searchQuery.trim()) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="bg-amber-200 text-slate-900 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Horizontal SVG Vector Timeline Map */}
      <HorizontalSvgTimeline
        data={data}
        onSelectApt={onSelectApt}
      />

      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm">
        
        {/* Timeline Controls & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 font-mono tracking-tight">
              Historical Incident & Legal Action Timeline
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-mono">
            Showing <strong className="text-slate-900 font-semibold">{timelineEvents.length}</strong> recorded legal enforcement & threat intelligence actions ({sortAscending ? '2014 → 2024' : '2024 → 2014'}).
          </p>
        </div>

        {/* Filter Pills & Sort Button */}
        <div className="flex flex-wrap items-center gap-2 max-w-full">
          
          {/* Category Selector Pills */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-mono max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'ALL' ? 'All Actions' : cat}
              </button>
            ))}
          </div>

          {/* Chronological Toggle */}
          <button
            onClick={() => setSortAscending((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-mono rounded-lg transition-colors shrink-0"
            title="Toggle Chronological Order"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>{sortAscending ? 'Oldest First' : 'Newest First'}</span>
          </button>

        </div>
      </div>

      {/* Empty State */}
      {timelineEvents.length === 0 && (
        <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <SearchX className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700 font-mono mb-1">
            No Timeline Incidents Found
          </p>
          <p className="text-xs text-slate-500 font-mono max-w-md mx-auto">
            No legal actions match your currently active filters or timeline category selection. Try resetting your search or filter tags.
          </p>
        </div>
      )}

      {/* Timeline List View */}
      {timelineEvents.length > 0 && (
        <div className="relative pl-6 md:pl-0">
          
          {/* Spine Line */}
          <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-cyan-400 -translate-x-1/2 rounded" />

          <div className="space-y-8">
            <AnimatePresence>
              {timelineEvents.map((apt, index) => {
                const config = getCategoryConfig(apt.legalCategory);
                const CategoryIcon = config.icon;
                const isEven = index % 2 === 0;

                return (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                    className="relative flex flex-col md:flex-row items-center group"
                  >
                    {/* Center Spine Node Icon */}
                    <div className="absolute left-0 md:left-1/2 top-5 -translate-x-1/2 z-10 flex items-center justify-center">
                      <div
                        className={`w-9 h-9 rounded-full ${config.dotBg} text-white flex items-center justify-center ring-4 ring-white shadow-md group-hover:scale-110 transition-transform`}
                      >
                        <CategoryIcon className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Timeline Node Content Wrapper */}
                    <div
                      className={`w-full md:w-[calc(50%-2rem)] ${
                        isEven ? 'md:mr-auto md:text-right' : 'md:ml-auto md:text-left'
                      } pl-6 md:pl-0`}
                    >
                      {/* Node Card Container */}
                      <div
                        onClick={() => onSelectApt(apt)}
                        className={`cursor-pointer bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-300 p-4 sm:p-5 rounded-xl shadow-xs hover:shadow-md transition-all ${config.cardBorder} relative group-hover:translate-y-[-2px]`}
                      >
                        
                        {/* Top Badges */}
                        <div
                          className={`flex flex-wrap items-center gap-2 mb-2.5 ${
                            isEven ? 'md:justify-end' : 'md:justify-start'
                          }`}
                        >
                          {/* Date Badge */}
                          <span className="flex items-center gap-1 px-2.5 py-0.5 bg-slate-900 text-white font-mono text-[11px] font-bold rounded-md shadow-xs">
                            <Calendar className="w-3 h-3 text-cyan-400" />
                            <span>{apt.legalActionDate || apt.legalActionYear || 'N/A'}</span>
                          </span>

                          {/* Category Badge */}
                          <span
                            className={`px-2 py-0.5 border font-mono text-[10px] uppercase font-bold rounded ${config.badgeBg}`}
                          >
                            {apt.legalCategory}
                          </span>

                          {/* Sponsoring Org Tag */}
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-mono text-[10px] font-semibold rounded">
                            {apt.sponsoringOrgType}
                          </span>
                        </div>

                        {/* Title & Group Identifier */}
                        <div className="mb-2">
                          <h4 className="text-base font-bold text-slate-900 font-mono tracking-tight group-hover:text-blue-600 transition-colors">
                            {highlightMatch(apt.classification)} ({highlightMatch(apt.id)})
                          </h4>
                          <div className="text-xs font-mono text-slate-600 flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="text-cyan-800 bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded text-[10px] font-medium">
                              {highlightMatch(apt.microsoftTaxonomy)}
                            </span>
                          </div>
                        </div>

                        {/* Legal Action Description Box */}
                        <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 mb-3 shadow-2xs">
                          <p className="leading-relaxed font-semibold">
                            {highlightMatch(apt.legalActions)}
                          </p>
                        </div>

                        {/* Sponsoring Authority & Front Entity */}
                        <div className="text-xs text-slate-600 font-mono space-y-1 mb-3">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">
                              <strong>Authority:</strong> {highlightMatch(apt.sponsoringAuthority)}
                            </span>
                          </div>
                          {apt.frontCompany && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[9px]">
                                FC
                              </span>
                              <span className="truncate">
                                <strong>Front:</strong> {highlightMatch(apt.frontCompany)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Targeted Sector Tags & Interactive Dossier Trigger */}
                        <div
                          className={`flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/80 ${
                            isEven ? 'md:justify-end' : 'md:justify-start'
                          }`}
                        >
                          <Target className="w-3 h-3 text-slate-400 shrink-0" />
                          {apt.targetedSectors.slice(0, 3).map((sec) => (
                            <span
                              key={sec}
                              className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-mono rounded"
                            >
                              {sec}
                            </span>
                          ))}
                          {apt.targetedSectors.length > 3 && (
                            <span className="text-[10px] font-mono text-slate-400">
                              +{apt.targetedSectors.length - 3} more
                            </span>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectApt(apt);
                            }}
                            className="ml-auto flex items-center gap-1 text-[11px] font-mono font-bold text-blue-600 hover:text-blue-800 transition-colors pt-1"
                          >
                            <span>Inspect Dossier</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};
