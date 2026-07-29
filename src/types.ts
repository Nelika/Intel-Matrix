export interface AptGroup {
  id: string; // e.g. "G0006" or "C0014"
  classification: string; // e.g. "APT 1"
  aliases: string[]; // e.g. ["Comment Crew", "Comment Group", "Comment Panda"]
  sponsoringAuthority: string; // e.g. "PLA Unit 61398"
  sponsoringOrgType: 'MSS' | 'PLA' | 'MPS' | 'Joint / Independent' | 'Defense / MSS';
  frontCompany: string; // e.g. "Military Intelligence Unit"
  targetedSectors: string[]; // e.g. ["Broad US industrial base", "Aerospace", "Defense", "Energy"]
  rawTargetedSectors: string; // Original string from dataset
  legalActions: string; // e.g. "US DOJ Indictments against 5 PLA Officers (May 2014)"
  legalCategory: 'Indictment' | 'Sanctions' | 'Advisory' | 'Asset Freeze' | 'Exposure Report';
}

export type SortField = 'id' | 'classification' | 'sponsoringAuthority' | 'frontCompany';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  searchQuery: string;
  sponsoringOrgType: string;
  selectedSector: string;
  legalCategory: string;
}
