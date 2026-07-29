import React from 'react';
import { AptGroup } from '../types';
import { Shield, Landmark, Scale, Cpu } from 'lucide-react';

interface StatsOverviewProps {
  data: AptGroup[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ data }) => {
  const total = data.length;

  const mssCount = data.filter((d) => d.sponsoringOrgType === 'MSS').length;
  const plaCount = data.filter((d) => d.sponsoringOrgType === 'PLA').length;
  const jointCount = data.filter((d) => d.sponsoringOrgType === 'Defense / MSS' || d.sponsoringOrgType === 'Joint / Independent').length;

  const indictmentCount = data.filter((d) => d.legalCategory === 'Indictment' || d.legalActions.toLowerCase().includes('indictment')).length;
  const sanctionCount = data.filter((d) => d.legalCategory === 'Sanctions' || d.legalCategory === 'Asset Freeze' || d.legalActions.toLowerCase().includes('sanction')).length;

  // Aggregate top targeted sectors
  const sectorCounts: Record<string, number> = {};
  data.forEach((apt) => {
    apt.targetedSectors.forEach((sec) => {
      sectorCounts[sec] = (sectorCounts[sec] || 0) + 1;
    });
  });

  const sortedSectors = Object.entries(sectorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      
      {/* Total APT Groups */}
      <div className="bg-[#16161a] border border-[#2d1215] p-6 rounded-none flex flex-col justify-between relative group hover:border-[#ef4444]/60 transition-all shadow-lg">
        <div>
          <div className="w-8 h-[2px] bg-[#ef4444] mb-3"></div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#a1a1aa] font-medium flex items-center gap-1.5 font-mono">
            <Shield className="w-3.5 h-3.5 text-[#ef4444]" />
            Tracked Threat Groups
          </p>
        </div>
        <div className="my-3">
          <span className="text-4xl font-serif text-[#f8fafc] font-light">{total}</span>
          <span className="text-sm font-serif italic text-[#f59e0b] ml-1.5 font-normal">APTs</span>
        </div>
        <p className="text-xs text-[#71717a] leading-relaxed">
          Cataloged MITRE ATT&CK state-sponsored threat actors
        </p>
      </div>

      {/* Primary State Sponsors */}
      <div className="bg-[#16161a] border border-[#2d1215] p-6 rounded-none flex flex-col justify-between relative group hover:border-[#ef4444]/60 transition-all shadow-lg">
        <div>
          <div className="w-8 h-[2px] bg-[#f59e0b] mb-3"></div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#a1a1aa] font-medium flex items-center gap-1.5 font-mono">
            <Landmark className="w-3.5 h-3.5 text-[#f59e0b]" />
            Sponsoring State Split
          </p>
        </div>
        <div className="my-3 flex items-baseline gap-2 font-serif">
          <div>
            <span className="text-3xl font-light text-[#f8fafc]">{mssCount}</span>
            <span className="text-xs text-[#ef4444] font-sans font-bold uppercase tracking-wider ml-1">MSS</span>
          </div>
          <span className="text-[#52525b]">/</span>
          <div>
            <span className="text-2xl font-light text-[#e2e8f0]">{plaCount}</span>
            <span className="text-xs text-[#f59e0b] font-sans font-bold uppercase tracking-wider ml-1">PLA</span>
          </div>
          <span className="text-[#52525b]">/</span>
          <div>
            <span className="text-xl font-light text-[#a1a1aa]">{jointCount}</span>
            <span className="text-xs text-[#71717a] font-sans uppercase tracking-wider ml-1">Joint</span>
          </div>
        </div>
        <p className="text-xs text-[#71717a] leading-relaxed">
          Civilian Intelligence (MSS) vs Military PLA Units
        </p>
      </div>

      {/* Enforcement & Indictments */}
      <div className="bg-[#16161a] border border-[#2d1215] p-6 rounded-none flex flex-col justify-between relative group hover:border-[#ef4444]/60 transition-all shadow-lg">
        <div>
          <div className="w-8 h-[2px] bg-[#ef4444] mb-3"></div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#a1a1aa] font-medium flex items-center gap-1.5 font-mono">
            <Scale className="w-3.5 h-3.5 text-[#ef4444]" />
            Legal Enforcement
          </p>
        </div>
        <div className="my-3 flex items-baseline gap-3 font-serif">
          <div>
            <span className="text-3xl font-light text-[#f8fafc]">{indictmentCount}</span>
            <span className="text-xs text-[#ef4444] font-sans font-bold uppercase tracking-wider ml-1">DOJ</span>
          </div>
          <span className="text-[#52525b]">|</span>
          <div>
            <span className="text-2xl font-light text-[#e2e8f0]">{sanctionCount}</span>
            <span className="text-xs text-[#f59e0b] font-sans font-bold uppercase tracking-wider ml-1">OFAC</span>
          </div>
        </div>
        <p className="text-xs text-[#71717a] leading-relaxed">
          Unsealed US DOJ indictments, Treasury & EU sanctions
        </p>
      </div>

      {/* Top Targeted Sector Focus */}
      <div className="bg-[#991b1b] p-6 rounded-none flex flex-col justify-between text-[#fef2f2] shadow-xl border border-[#b91c1c]">
        <div>
          <div className="w-8 h-[2px] bg-[#f59e0b] mb-3"></div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#fef2f2]/90 flex items-center gap-1.5 font-mono">
            <Cpu className="w-3.5 h-3.5 text-[#f59e0b]" />
            Primary Target Sectors
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 my-3">
          {sortedSectors.map(([sector, count]) => (
            <span
              key={sector}
              className="text-[10px] font-mono px-2 py-0.5 bg-[#450a0a]/60 border border-[#f59e0b]/30 text-[#fef2f2] font-semibold"
            >
              {sector} <span className="font-bold text-[#f59e0b]">({count})</span>
            </span>
          ))}
        </div>
        <p className="text-xs font-medium text-[#fef2f2]/80 leading-relaxed">
          Highest frequency operational targets
        </p>
      </div>

    </div>
  );
};
