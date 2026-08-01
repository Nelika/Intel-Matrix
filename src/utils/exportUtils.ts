import { AptGroup, FilterState, getMitreUrl } from '../types';

/**
 * Escapes CSV field values according to RFC 4180 standard.
 */
const escapeCsvCell = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  // Replace internal double quotes with escaped double quotes (" -> "")
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
};

/**
 * Generates a clean filename with record count and timestamp
 */
const getFormattedFilename = (prefix: string, recordCount: number, extension: string): string => {
  const dateStr = new Date().toISOString().split('T')[0];
  return `${prefix}_${recordCount}_records_${dateStr}.${extension}`;
};

/**
 * Triggers browser download for a Blob
 */
const triggerBlobDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exports currently filtered APT dataset to a CSV file.
 */
export const exportFilteredDataToCSV = (
  filteredData: AptGroup[],
  customFilename?: string
) => {
  const headers = [
    'MITRE ATT&CK ID',
    'APT Classification',
    'Microsoft Taxonomy',
    'Kaspersky / Securelist Alias',
    'Aliases',
    'Sponsoring Authority',
    'Sponsoring Org Type',
    'Front Company / Contractor Entity',
    'Targeted Sectors',
    'Legal Action Category',
    'Legal Actions / Indictments',
    'Legal Action Year',
    'Current Status',
    'First Observed Year',
    'Last Observed Year',
    'MITRE ATT&CK URL',
  ];

  const rows = filteredData.map((item) => [
    escapeCsvCell(item.id),
    escapeCsvCell(item.classification),
    escapeCsvCell(item.microsoftTaxonomy || ''),
    escapeCsvCell(item.kasperskySecurelist || ''),
    escapeCsvCell(item.aliases ? item.aliases.join('; ') : ''),
    escapeCsvCell(item.sponsoringAuthority),
    escapeCsvCell(item.sponsoringOrgType),
    escapeCsvCell(item.frontCompany),
    escapeCsvCell(
      Array.isArray(item.targetedSectors) && item.targetedSectors.length > 0
        ? item.targetedSectors.join('; ')
        : item.rawTargetedSectors || ''
    ),
    escapeCsvCell(item.legalCategory || ''),
    escapeCsvCell(item.legalActions || ''),
    escapeCsvCell(item.legalActionYear || ''),
    escapeCsvCell(item.currentStatus || ''),
    escapeCsvCell(item.firstObservedYear || ''),
    escapeCsvCell(item.lastObservedYear || ''),
    escapeCsvCell(getMitreUrl(item)),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });

  const filename = customFilename || getFormattedFilename('china_apt_filtered_export', filteredData.length, 'csv');
  triggerBlobDownload(blob, filename);
};

/**
 * Exports currently filtered APT dataset to a structured JSON file.
 */
export const exportFilteredDataToJSON = (
  filteredData: AptGroup[],
  filters?: FilterState,
  customFilename?: string
) => {
  const exportPayload = {
    metadata: {
      title: 'China APT Threat Intelligence Matrix Export',
      generatedAt: new Date().toISOString(),
      recordCount: filteredData.length,
      activeFilters: filters || null,
    },
    records: filteredData.map((item) => ({
      id: item.id,
      classification: item.classification,
      microsoftTaxonomy: item.microsoftTaxonomy,
      kasperskySecurelist: item.kasperskySecurelist,
      aliases: item.aliases,
      sponsoringAuthority: item.sponsoringAuthority,
      sponsoringOrgType: item.sponsoringOrgType,
      frontCompany: item.frontCompany,
      targetedSectors: item.targetedSectors,
      rawTargetedSectors: item.rawTargetedSectors,
      legalActions: item.legalActions,
      legalCategory: item.legalCategory,
      legalActionYear: item.legalActionYear,
      legalActionDate: item.legalActionDate,
      currentStatus: item.currentStatus,
      firstObservedYear: item.firstObservedYear,
      lastObservedYear: item.lastObservedYear,
      mitreUrl: getMitreUrl(item),
    })),
  };

  const jsonContent = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });

  const filename = customFilename || getFormattedFilename('china_apt_filtered_export', filteredData.length, 'json');
  triggerBlobDownload(blob, filename);
};

/**
 * Exports currently filtered APT dataset to a Markdown report file.
 */
export const exportFilteredDataToMarkdown = (
  filteredData: AptGroup[],
  filters?: FilterState,
  customFilename?: string
) => {
  const filterDesc = filters
    ? `**Active Filters:** Query: "${filters.searchQuery || 'None'}" | Org: "${
        filters.sponsoringOrgType || 'All'
      }" | Sector: "${filters.selectedSector || 'All'}" | Enforcement: "${
        filters.legalCategory || 'All'
      }"`
    : '';

  let markdown = `# China APT Threat Intelligence Export Report\n\n`;
  markdown += `*Generated on: ${new Date().toLocaleDateString()} (${new Date().toLocaleTimeString()})*\n`;
  markdown += `*Total Matching Threat Groups: ${filteredData.length}*\n\n`;
  if (filterDesc) markdown += `${filterDesc}\n\n`;

  markdown += `| ID | Group Name | Authority | Front Company | Targeted Sectors | Enforcement Action |\n`;
  markdown += `|---|---|---|---|---|---|\n`;

  filteredData.forEach((item) => {
    const sectors = item.targetedSectors.join(', ');
    markdown += `| [${item.id}](${getMitreUrl(item)}) | **${item.classification}** | ${
      item.sponsoringAuthority
    } (${item.sponsoringOrgType}) | ${item.frontCompany} | ${sectors} | ${item.legalActions} |\n`;
  });

  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
  const filename = customFilename || getFormattedFilename('china_apt_threat_report', filteredData.length, 'md');
  triggerBlobDownload(blob, filename);
};
