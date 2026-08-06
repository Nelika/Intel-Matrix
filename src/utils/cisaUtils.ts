import { AptGroup } from '../types';
import { CisaAdvisory } from '../components/CisaIcsAdvisoriesFeed';
import { HISTORICAL_CISA_ADVISORIES, sanitizeCisaLink } from '../data/cisaHistoricalAdvisories';

/**
 * Retrieves the compiled array of baseline + localStorage accumulated CISA ICS advisories.
 */
export function getAccumulatedCisaAdvisories(): CisaAdvisory[] {
  const map = new Map<string, CisaAdvisory>();

  // 1. Load baseline historical dataset
  HISTORICAL_CISA_ADVISORIES.forEach((item) => {
    const key = (item.advisoryId || item.id || item.link).toLowerCase();
    if (key) map.set(key, item);
  });

  // 2. Merge accumulated localStorage dataset
  try {
    const saved = localStorage.getItem('cisa_ics_accumulated_advisories_v2');
    if (saved) {
      const parsed: CisaAdvisory[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          const key = (item.advisoryId || item.id || item.link).toLowerCase();
          if (key) map.set(key, item);
        });
      }
    }
  } catch (e) {
    console.warn('Could not read accumulated CISA advisories from localStorage', e);
  }

  const compiled = Array.from(map.values()).map((item) => ({
    ...item,
    link: sanitizeCisaLink(item.link, item.advisoryId),
  }));
  compiled.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  return compiled;
}

/**
 * Normalizes strings to uppercase alphanumeric for robust tag matching.
 */
function normalizeAptTag(str: string): string {
  return str.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export interface EffectiveAptStatus {
  status: 'Active' | 'Dormant' | 'Intermittent';
  isUpgradedByCisa: boolean;
  cisaAdvisoriesCount: number;
  statusLabel: string;
  lastObservedYear: number;
  advisories: CisaAdvisory[];
}

/**
 * Calculates the effective operational status for an APT group,
 * dynamically upgrading its status to 'Active' and updating lastObservedYear to 2026
 * if associated with active CISA ICS advisories.
 */
export function getEffectiveAptStatus(apt: AptGroup, advisories?: CisaAdvisory[]): EffectiveAptStatus {
  const cisaList = getAdvisoriesForApt(apt, advisories);
  const count = cisaList.length;

  if (count > 0) {
    const wasNotActive = apt.currentStatus !== 'Active';
    return {
      status: 'Active',
      isUpgradedByCisa: wasNotActive,
      cisaAdvisoriesCount: count,
      statusLabel: wasNotActive ? 'Active (CISA Upgraded)' : 'Active (CISA Verified)',
      lastObservedYear: Math.max(apt.lastObservedYear || 0, 2026),
      advisories: cisaList,
    };
  }

  return {
    status: apt.currentStatus,
    isUpgradedByCisa: false,
    cisaAdvisoriesCount: 0,
    statusLabel: apt.currentStatus,
    lastObservedYear: apt.lastObservedYear,
    advisories: [],
  };
}

/**
 * Returns all active CISA ICS advisories associated with a specific APT group.
 */
export function getAdvisoriesForApt(apt: AptGroup, advisories?: CisaAdvisory[]): CisaAdvisory[] {
  const list = advisories || getAccumulatedCisaAdvisories();

  const normAptId = apt.id ? normalizeAptTag(apt.id) : '';
  const normClass = apt.classification ? normalizeAptTag(apt.classification) : '';

  const aliasSet = new Set<string>();
  if (normAptId) aliasSet.add(normAptId);
  if (normClass) aliasSet.add(normClass);

  if (apt.aliases) {
    apt.aliases.forEach((a) => {
      const norm = normalizeAptTag(a);
      if (norm.length >= 3) aliasSet.add(norm);
    });
  }
  if (apt.microsoftTaxonomy) {
    apt.microsoftTaxonomy.split(/[\/\(\):,]/).forEach((a) => {
      const norm = normalizeAptTag(a);
      if (norm.length >= 4) aliasSet.add(norm);
    });
  }

  return list.filter((adv) => {
    if (!adv.relatedAptIds || adv.relatedAptIds.length === 0) return false;
    return adv.relatedAptIds.some((relTag) => {
      const normRel = normalizeAptTag(relTag);
      for (const alias of aliasSet) {
        if (alias === normRel) return true;
        if (
          alias.length >= 4 &&
          normRel.length >= 4 &&
          (alias.includes(normRel) || normRel.includes(alias))
        ) {
          return true;
        }
      }
      return false;
    });
  });
}
