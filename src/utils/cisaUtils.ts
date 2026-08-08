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

export interface MonthBucket {
  label: string;
  year: number;
  month: number;
  count: number;
}

export interface AptAlertInfo {
  alertLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'NONE';
  rank: number; // 3 for CRITICAL, 2 for HIGH, 1 for ELEVATED, 0 for NONE
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  pulse: boolean;
  label: string;
  summary: string;
  latestAdvisoryId?: string;
  latestAdvisoryTitle?: string;
  latestAdvisoryDate?: string;
  daysAgo?: number;
  advisoryCount: number;
  isNewDetection: boolean;
}

/**
 * Calculates high-risk alert metadata for an APT group based on its CISA ICS advisories.
 */
export function getAptAlertInfo(apt: AptGroup, advisories?: CisaAdvisory[]): AptAlertInfo {
  const cisaList = getAdvisoriesForApt(apt, advisories);
  const advisoryCount = cisaList.length;

  if (advisoryCount === 0) {
    return {
      alertLevel: 'NONE',
      rank: 0,
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-500',
      badgeBorder: 'border-slate-200',
      pulse: false,
      label: 'CLEAR',
      summary: 'No active CISA advisories detected',
      advisoryCount: 0,
      isNewDetection: false,
    };
  }

  // Sort advisories by pubDate descending
  const sorted = [...cisaList].sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );
  const latest = sorted[0];
  const latestTime = new Date(latest.pubDate).getTime();
  const now = Date.now();
  const daysAgo = isNaN(latestTime)
    ? 30
    : Math.max(0, Math.floor((now - latestTime) / (1000 * 60 * 60 * 24)));

  const isUpgradedStatus = apt.currentStatus !== 'Active';

  if (daysAgo <= 14 || advisoryCount >= 3 || (daysAgo <= 30 && isUpgradedStatus)) {
    return {
      alertLevel: 'CRITICAL',
      rank: 3,
      badgeBg: 'bg-red-950',
      badgeText: 'text-red-300',
      badgeBorder: 'border-red-500/80',
      pulse: true,
      label: 'CRITICAL ALERT',
      summary: `Newly detected high-risk activity (${daysAgo === 0 ? 'Today' : `${daysAgo}d ago`})`,
      latestAdvisoryId: latest.advisoryId,
      latestAdvisoryTitle: latest.title,
      latestAdvisoryDate: latest.pubDate,
      daysAgo,
      advisoryCount,
      isNewDetection: true,
    };
  }

  if (daysAgo <= 60 || isUpgradedStatus) {
    return {
      alertLevel: 'HIGH',
      rank: 2,
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-900',
      badgeBorder: 'border-red-300',
      pulse: true,
      label: 'HIGH RISK',
      summary: `High risk advisory (${daysAgo}d ago)`,
      latestAdvisoryId: latest.advisoryId,
      latestAdvisoryTitle: latest.title,
      latestAdvisoryDate: latest.pubDate,
      daysAgo,
      advisoryCount,
      isNewDetection: daysAgo <= 30,
    };
  }

  return {
    alertLevel: 'ELEVATED',
    rank: 1,
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-300',
    pulse: false,
    label: 'ELEVATED',
    summary: `${advisoryCount} CISA ICS Advisories logged`,
    latestAdvisoryId: latest.advisoryId,
    latestAdvisoryTitle: latest.title,
    latestAdvisoryDate: latest.pubDate,
    daysAgo,
    advisoryCount,
    isNewDetection: false,
  };
}

/**
 * Groups advisories into 12 monthly buckets (past 12 months) for sparkline visualization.
 */
export function get12MonthCisaCounts(advisories: CisaAdvisory[]): { buckets: MonthBucket[]; total12M: number; maxCount: number } {
  const refDate = new Date();
  const buckets: MonthBucket[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
    const yr = d.getFullYear();
    const mo = d.getMonth();
    const monthName = d.toLocaleString('en-US', { month: 'short' });
    const yearShort = yr.toString().slice(-2);

    buckets.push({
      label: `${monthName} '${yearShort}`,
      year: yr,
      month: mo,
      count: 0,
    });
  }

  let total12M = 0;
  advisories.forEach((adv) => {
    const advDate = new Date(adv.pubDate);
    if (isNaN(advDate.getTime())) return;

    const advYr = advDate.getFullYear();
    const advMo = advDate.getMonth();

    const matched = buckets.find((b) => b.year === advYr && b.month === advMo);
    if (matched) {
      matched.count++;
      total12M++;
    }
  });

  const maxCount = Math.max(...buckets.map((b) => b.count), 1);
  return { buckets, total12M, maxCount };
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
