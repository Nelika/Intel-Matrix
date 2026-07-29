import React from 'react';
import { ShieldAlert, Download, FileCode, Radio, Database } from 'lucide-react';
import { AptGroup } from '../types';

interface HeaderProps {
  totalCount: number;
  filteredCount: number;
  filteredData: AptGroup[];
}

export const Header: React.FC<HeaderProps> = ({ totalCount, filteredCount, filteredData }) => {
  const exportCSV = () => {
    const headers = [
      'MITRE ATT&CK ID',
      'APT / Classification',
      'Major Aliases / Associated Groups',
      'Sponsoring State Authority',
      'Front Company / Contractor Entity',
      'Primary Targeted Sectors',
      'Legal and Regulatory Actions',
    ];

    const rows = filteredData.map((item) => [
      `"${item.id}"`,
      `"${item.classification}"`,
      `"${item.aliases.join(', ')}"`,
      `"${item.sponsoringAuthority.replace(/"/g, '""')}"`,
      `"${item.frontCompany.replace(/"/g, '""')}"`,
      `"${item.rawTargetedSectors.replace(/"/g, '""')}"`,
      `"${item.legalActions.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apt_threat_matrix_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredData, null, 2)
    )}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `apt_threat_matrix_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="border-b border-[#2d1215] bg-[#0c0c0e]/95 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Title & Status */}
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-[#1a0a0c] border border-[#3d1418] text-[#ef4444] mt-1 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#f59e0b] px-2 py-0.5 rounded bg-[#1a0a0c] border border-[#3d1418]">
                  INTEL MATRIX
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-[#a1a1aa] font-mono">
                  <Radio className="w-3 h-3 text-[#ef4444] animate-pulse" />
                  LIVE DATABASE
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-light tracking-tight text-[#f8fafc]">
                APT Threat Intelligence Matrix
              </h1>
              <p className="text-xs sm:text-sm text-[#a1a1aa] max-w-2xl font-sans mt-0.5 leading-relaxed">
                Comprehensive mapping of state-sponsored Advanced Persistent Threat groups, front entities, targeted sectors, and regulatory actions.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end md:self-auto">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#16161a] border border-[#2d1215] text-xs font-mono text-[#e2e8f0]">
              <Database className="w-3.5 h-3.5 text-[#ef4444]" />
              <span>
                {filteredCount} / {totalCount} Records
              </span>
            </div>

            <button
              onClick={exportCSV}
              title="Export visible matrix data to CSV"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#16161a] hover:bg-[#251014] border border-[#2d1215] hover:border-[#ef4444]/60 text-[#e2e8f0] hover:text-[#ef4444] text-xs font-mono font-medium transition-all active:scale-95 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#ef4444]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={exportJSON}
              title="Export visible matrix data to JSON"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#16161a] hover:bg-[#251014] border border-[#2d1215] hover:border-[#ef4444]/60 text-[#e2e8f0] hover:text-[#ef4444] text-xs font-mono font-medium transition-all active:scale-95 shadow-sm"
            >
              <FileCode className="w-3.5 h-3.5 text-[#ef4444]" />
              <span>Export JSON</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
