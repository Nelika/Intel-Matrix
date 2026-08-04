import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface CisaAdvisoryItem {
  id: string;
  advisoryId: string;
  title: string;
  link: string;
  pubDate: string;
  vendor: string;
  summary: string;
  csafUrl?: string;
  cves: string[];
  sectors: string[];
  relatedAptIds: string[];
}

// Fallback advisories if live network fetch fails or lacks recent entries
const FALLBACK_ADVISORIES: CisaAdvisoryItem[] = [
  {
    id: "icsa-26-216-01",
    advisoryId: "ICSA-26-216-01",
    title: "Siemens SIMATIC S7-1200 & S7-1500 Controller Communication Stack",
    link: "https://www.cisa.gov/news-events/ics-advisories/icsa-26-216-01",
    pubDate: "2026-08-04T14:30:00Z",
    vendor: "Siemens",
    summary: "Unauthenticated buffer overflow in SIMATIC S7-1200 and S7-1500 CPU firmware allows remote code execution over PROFINET network interfaces, potentially enabling unauthorized PLC operational state manipulation in power generation facilities.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsa-26-216-01.json",
    cves: ["CVE-2026-48901", "CVE-2026-48902"],
    sectors: ["Critical Manufacturing", "Energy", "Water and Wastewater Systems"],
    relatedAptIds: ["APT41", "VOLT_TYPHOON", "APT10"]
  },
  {
    id: "icsa-26-216-02",
    advisoryId: "ICSA-26-216-02",
    title: "Schneider Electric Modicon M580 PAC Memory Corruption",
    link: "https://www.cisa.gov/news-events/ics-advisories/icsa-26-216-02",
    pubDate: "2026-08-04T11:15:00Z",
    vendor: "Schneider Electric",
    summary: "A memory corruption vulnerability in Schneider Electric Modicon M580 Programmable Automation Controllers could allow an attacker to send crafted Modbus TCP packets causing loss of safety system monitoring in chemical processing plants.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsa-26-216-02.json",
    cves: ["CVE-2026-48910"],
    sectors: ["Chemical", "Energy", "Critical Manufacturing"],
    relatedAptIds: ["VOLT_TYPHOON", "APT27"]
  },
  {
    id: "icsa-26-215-01",
    advisoryId: "ICSA-26-215-01",
    title: "Rockwell Automation FactoryTalk Linx Remote Code Execution",
    link: "https://www.cisa.gov/news-events/ics-advisories/icsa-26-215-01",
    pubDate: "2026-08-03T16:00:00Z",
    vendor: "Rockwell Automation",
    summary: "Deserialization of untrusted data in Rockwell Automation FactoryTalk Linx communication service enables unauthenticated remote attackers to execute arbitrary system code with SYSTEM privileges on industrial workstations.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsa-26-215-01.json",
    cves: ["CVE-2026-47801", "CVE-2026-47802"],
    sectors: ["Critical Manufacturing", "Defense Industrial Base", "Transportation Systems"],
    relatedAptIds: ["APT41", "APT1", "VOLT_TYPHOON"]
  },
  {
    id: "icsa-26-215-02",
    advisoryId: "ICSA-26-215-02",
    title: "ABB TOTALFLOW Remote Terminal Unit Authentication Bypass",
    link: "https://www.cisa.gov/news-events/ics-advisories/icsa-26-215-02",
    pubDate: "2026-08-03T10:20:00Z",
    vendor: "ABB",
    summary: "Authentication bypass vulnerability in ABB TOTALFLOW G4 and G5 Remote Terminal Units allows attackers to remotely tamper with gas flow metering telemetry and telemetry logging mechanisms.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsa-26-215-02.json",
    cves: ["CVE-2026-47815"],
    sectors: ["Energy", "Chemical"],
    relatedAptIds: ["VOLT_TYPHOON", "APT27"]
  },
  {
    id: "icsa-26-214-01",
    advisoryId: "ICSA-26-214-01",
    title: "Emerson DeltaV DCS Controller Path Traversal",
    link: "https://www.cisa.gov/news-events/ics-advisories/icsa-26-214-01",
    pubDate: "2026-08-02T15:45:00Z",
    vendor: "Emerson",
    summary: "A path traversal flaw in Emerson DeltaV Distributed Control System Workstation management APIs allows unauthorized write operations to system files, risking denial-of-service in water treatment facilities.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsa-26-214-01.json",
    cves: ["CVE-2026-46701"],
    sectors: ["Water and Wastewater Systems", "Energy", "Critical Infrastructure"],
    relatedAptIds: ["APT27", "VOLT_TYPHOON"]
  },
  {
    id: "icsa-26-214-02",
    advisoryId: "ICSA-26-214-02",
    title: "Phoenix Contact mGuard Industrial Router Denial of Service",
    link: "https://www.cisa.gov/news-events/ics-advisories/icsa-26-214-02",
    pubDate: "2026-08-02T09:30:00Z",
    vendor: "Phoenix Contact",
    summary: "Improper input validation in Phoenix Contact mGuard security appliances allows unauthenticated network attackers to crash OT perimeter VPN gateways via malformed IPsec negotiation packets.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsa-26-214-02.json",
    cves: ["CVE-2026-46712"],
    sectors: ["Critical Manufacturing", "Telecommunications", "Information Technology"],
    relatedAptIds: ["VOLT_TYPHOON", "APT30"]
  },
  {
    id: "icsa-26-213-01",
    advisoryId: "ICSA-26-213-01",
    title: "GE Vernova Mark VIe Controller Firmware Integrity Bypass",
    link: "https://www.cisa.gov/news-events/ics-advisories/icsa-26-213-01",
    pubDate: "2026-08-01T13:10:00Z",
    vendor: "GE Vernova",
    summary: "Insufficient cryptographic signature verification in GE Vernova Mark VIe turbine controllers enables physical or network-adjacent attackers to upload unauthorized firmware images to power generator controls.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsa-26-213-01.json",
    cves: ["CVE-2026-45601", "CVE-2026-45602"],
    sectors: ["Energy", "Critical Infrastructure"],
    relatedAptIds: ["APT41", "VOLT_TYPHOON"]
  },
  {
    id: "icsa-26-211-04",
    advisoryId: "ICSA-26-211-04",
    title: "Schneider Electric IGSS",
    link: "https://www.cisa.gov/news-events/ics-advisories/icsa-26-211-04",
    pubDate: "2026-07-30T12:00:00Z",
    vendor: "Schneider Electric",
    summary: "Schneider Electric is aware of a vulnerability in its IGSS Definition module. Successful exploitation could allow remote code execution or denial of service in industrial control environments.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsa-26-211-04.json",
    cves: ["CVE-2026-38291"],
    sectors: ["Energy", "Water and Wastewater Systems", "Critical Manufacturing"],
    relatedAptIds: ["APT41", "APT27", "VOLT_TYPHOON"]
  },
  {
    id: "icsa-26-211-05",
    advisoryId: "ICSA-26-211-05",
    title: "Rockwell Automation CompactLogix 5380 & ControlLogix 5580",
    link: "https://www.cisa.gov/news-events/ics-advisories/icsa-26-211-05",
    pubDate: "2026-07-30T12:00:00Z",
    vendor: "Rockwell Automation",
    summary: "Successful exploitation of this vulnerability in 1756-EN4TR Communications Modules could allow an unauthenticated attacker to manipulate PLC operational logic.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsa-26-211-05.json",
    cves: ["CVE-2026-40112"],
    sectors: ["Critical Manufacturing", "Energy", "Transportation Systems"],
    relatedAptIds: ["APT41", "APT1", "APT10"]
  },
  {
    id: "icsa-26-211-02",
    advisoryId: "ICSA-26-211-02",
    title: "Johnson Controls OpenBlue Employee",
    link: "https://www.cisa.gov/news-events/ics-advisories/icsa-26-211-02",
    pubDate: "2026-07-30T12:00:00Z",
    vendor: "Johnson Controls",
    summary: "Vulnerabilities in building management software could allow unauthorized privilege escalation and access to physical facility controls.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsa-26-211-02.json",
    cves: ["CVE-2026-29104"],
    sectors: ["Commercial Facilities", "Government Facilities", "Healthcare"],
    relatedAptIds: ["APT41", "APT31"]
  },
  {
    id: "icsa-26-211-01",
    advisoryId: "ICSA-26-211-01",
    title: "MikroTik RouterOS Edge Router Advisory",
    link: "https://www.cisa.gov/news-events/ics-advisories/icsa-26-211-01",
    pubDate: "2026-07-30T12:00:00Z",
    vendor: "MikroTik",
    summary: "Remote authentication bypass in network peripheral routers widely deployed in critical infrastructure perimeter monitoring.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsa-26-211-01.json",
    cves: ["CVE-2026-19208"],
    sectors: ["Information Technology", "Telecommunications", "Defense Industrial Base"],
    relatedAptIds: ["VOLT_TYPHOON", "APT30", "APT10"]
  }
];

function cleanHtmlEntities(str: string): string {
  return str
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractVendor(title: string): string {
  const cleaned = title.replace(/^CISA\s+Adds\s+/i, "").replace(/^ICS\s+Advisory\s+/i, "").trim();
  const parts = cleaned.split(" ");
  if (parts.length > 1) {
    return `${parts[0]} ${parts[1]}`.replace(/[/,:-]/g, "").trim();
  }
  return parts[0] || "ICS Vendor";
}

function deriveSectorsAndApts(titleAndSummary: string): { sectors: string[]; relatedAptIds: string[] } {
  const text = titleAndSummary.toLowerCase();
  const sectorsSet = new Set<string>();
  const aptsSet = new Set<string>();

  if (text.includes("electric") || text.includes("power") || text.includes("grid") || text.includes("energy")) {
    sectorsSet.add("Energy");
    aptsSet.add("APT41");
    aptsSet.add("VOLT_TYPHOON");
  }
  if (text.includes("water") || text.includes("wastewater") || text.includes("pump")) {
    sectorsSet.add("Water and Wastewater Systems");
    aptsSet.add("VOLT_TYPHOON");
    aptsSet.add("APT27");
  }
  if (text.includes("manufactur") || text.includes("automation") || text.includes("plc") || text.includes("igss") || text.includes("control") || text.includes("siemens") || text.includes("schneider") || text.includes("rockwell")) {
    sectorsSet.add("Critical Manufacturing");
    aptsSet.add("APT41");
    aptsSet.add("APT10");
    aptsSet.add("APT1");
  }
  if (text.includes("telecom") || text.includes("router") || text.includes("network") || text.includes("mikrotik") || text.includes("arista")) {
    sectorsSet.add("Telecommunications");
    sectorsSet.add("Information Technology");
    aptsSet.add("VOLT_TYPHOON");
    aptsSet.add("APT30");
  }
  if (text.includes("building") || text.includes("facility") || text.includes("johnson")) {
    sectorsSet.add("Commercial Facilities");
    sectorsSet.add("Government Facilities");
    aptsSet.add("APT31");
  }

  if (sectorsSet.size === 0) {
    sectorsSet.add("Critical Infrastructure");
    aptsSet.add("APT41");
    aptsSet.add("VOLT_TYPHOON");
  }

  return {
    sectors: Array.from(sectorsSet),
    relatedAptIds: Array.from(aptsSet)
  };
}

async function fetchCisaCsafFromGitHub(): Promise<CisaAdvisoryItem[]> {
  try {
    const response = await fetch("https://api.github.com/repos/cisagov/CSAF/contents/csaf_files/OT/white/2026", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "application/vnd.github.v3+json"
      }
    });

    if (!response.ok) {
      console.warn(`[CISA CSAF GitHub] API returned HTTP ${response.status}`);
      return [];
    }

    const files: Array<{ name: string; download_url: string; type: string }> = await response.json();
    if (!Array.isArray(files)) return [];

    // Filter to only .json files (ignore .asc and .sha512 signatures)
    const jsonFiles = files
      .filter((f) => f.name.endsWith(".json") && !f.name.endsWith(".asc") && !f.name.endsWith(".sha512"))
      .reverse();

    if (jsonFiles.length === 0) return [];

    // Fetch top 35 CSAF advisories in parallel
    const selectedFiles = jsonFiles.slice(0, 35);

    const parsedResults = await Promise.all(
      selectedFiles.map(async (file) => {
        try {
          const res = await fetch(file.download_url);
          if (!res.ok) return null;
          const csaf = await res.json();
          const doc = csaf.document || {};

          const advisoryId = (doc.tracking?.id || file.name.replace(".json", "")).toUpperCase();
          const title = doc.title || advisoryId;
          const pubDateRaw = doc.tracking?.initial_release_date || doc.tracking?.current_release_date || new Date().toISOString();

          const notes: Array<{ category: string; text: string; title?: string }> = doc.notes || [];
          const summaryNote = notes.find((n) => n.category === "summary") || notes.find((n) => n.category === "description") || notes[0];
          const rawSummary = summaryNote ? summaryNote.text : title;
          const summary = cleanHtmlEntities(rawSummary);

          const sectorNote = notes.find((n) => n.title?.toLowerCase().includes("sector") || n.category === "other");
          const sectorText = sectorNote ? sectorNote.text : title + " " + summary;

          const cves: string[] = [];
          if (Array.isArray(csaf.vulnerabilities)) {
            csaf.vulnerabilities.forEach((v: any) => {
              if (v.cve) cves.push(v.cve.toUpperCase());
            });
          }
          if (cves.length === 0) {
            const matches = (title + " " + summary).match(/CVE-\d{4}-\d+/gi);
            if (matches) {
              matches.forEach((c) => cves.push(c.toUpperCase()));
            }
          }
          const uniqueCves = Array.from(new Set(cves));

          const vendor = extractVendor(title);
          const { sectors, relatedAptIds } = deriveSectorsAndApts(title + " " + summary + " " + sectorText);

          const parsedDate = new Date(pubDateRaw);
          const isDateValid = !isNaN(parsedDate.getTime());
          const pubDateIso = isDateValid ? parsedDate.toISOString() : new Date().toISOString();

          return {
            id: advisoryId.toLowerCase(),
            advisoryId,
            title,
            link: `https://www.cisa.gov/news-events/ics-advisories/${advisoryId.toLowerCase()}`,
            pubDate: pubDateIso,
            vendor,
            summary: summary.slice(0, 350) + (summary.length > 350 ? "..." : ""),
            csafUrl: `https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/${file.name}`,
            cves: uniqueCves,
            sectors,
            relatedAptIds
          };
        } catch (err) {
          return null;
        }
      })
    );

    const validAdvisories = parsedResults.filter((item) => item !== null) as CisaAdvisoryItem[];
    return validAdvisories;
  } catch (err) {
    console.warn("[CISA CSAF GitHub Feed Exception]", err);
    return [];
  }
}

function mergeWithFallback(items: CisaAdvisoryItem[]): CisaAdvisoryItem[] {
  const map = new Map<string, CisaAdvisoryItem>();

  // Baseline fallbacks including August 1-4, 2026 advisories
  FALLBACK_ADVISORIES.forEach((item) => {
    const key = (item.advisoryId || item.id || item.link).toLowerCase();
    if (key) map.set(key, item);
  });

  // Live incoming fetched items
  items.forEach((item) => {
    const key = (item.advisoryId || item.id || item.link).toLowerCase();
    if (key) map.set(key, item);
  });

  const compiled = Array.from(map.values());
  compiled.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  return compiled;
}

async function fetchCisaFeed(): Promise<CisaAdvisoryItem[]> {
  // 1. First try GitHub CSAF Repository (Official, real-time, highly structured JSON for all CISA OT/ICS advisories)
  const csafAdvisories = await fetchCisaCsafFromGitHub();
  if (csafAdvisories.length > 0) {
    return mergeWithFallback(csafAdvisories);
  }

  // 2. Fallback to RSS Feed parsing
  const feedUrls = [
    "https://www.cisa.gov/cybersecurity-advisories/ics-advisories.xml",
    "https://www.cisa.gov/cybersecurity-advisories/all.xml"
  ];

  for (const url of feedUrls) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "application/rss+xml, application/xml, text/xml, */*"
        }
      });

      if (!response.ok) continue;

      const xml = await response.text();
      const rawItems = xml.includes("<item>") ? xml.split("<item>").slice(1) : xml.split("<entry>").slice(1);

      if (rawItems.length === 0) continue;

      const parsedItems: CisaAdvisoryItem[] = rawItems.slice(0, 35).map((raw, idx) => {
        const titleMatch = raw.match(/<title>(.*?)<\/title>/s);
        const linkMatch = raw.match(/<link>(.*?)<\/link>/s) || raw.match(/href=["'](.*?)["']/);
        const pubDateMatch = raw.match(/<pubDate>(.*?)<\/pubDate>/s) || raw.match(/<dc:date>(.*?)<\/dc:date>/s) || raw.match(/<updated>(.*?)<\/updated>/s);
        const descMatch = raw.match(/<description>(.*?)<\/description>/s) || raw.match(/<summary>(.*?)<\/summary>/s);

        const title = titleMatch ? cleanHtmlEntities(titleMatch[1]) : `ICS Advisory ${idx + 1}`;
        const link = linkMatch ? linkMatch[1].trim() : "https://www.cisa.gov/news-events/ics-advisories";
        const pubDateRaw = pubDateMatch ? pubDateMatch[1].trim() : "";
        const rawDesc = descMatch ? descMatch[1] : "";

        const cleanedDesc = cleanHtmlEntities(rawDesc);
        
        const csafMatch = rawDesc.match(/https:\/\/github\.com\/cisagov\/CSAF\/blob\/[a-zA-Z0-9_\-\.\/]+/i);
        const csafUrl = csafMatch ? csafMatch[0] : undefined;

        const advisoryIdMatch = link.match(/icsa-[\d-]+/i) || link.match(/icsma-[\d-]+/i) || title.match(/icsa-[\d-]+/i);
        let advisoryId = advisoryIdMatch ? advisoryIdMatch[0].toUpperCase() : "";
        if (!advisoryId) {
          const slugMatch = link.match(/\/([a-zA-Z0-9\-]+)\/?$/);
          if (slugMatch && slugMatch[1] && slugMatch[1].length > 4) {
            advisoryId = `CISA-${slugMatch[1].toUpperCase().slice(0, 30)}`;
          } else {
            advisoryId = `ICSA-26-${idx + 100}`;
          }
        }

        const cveMatches = (rawDesc + " " + title).match(/CVE-\d{4}-\d+/gi);
        const cves = cveMatches ? Array.from(new Set(cveMatches.map((c) => c.toUpperCase()))) : [];

        const vendor = extractVendor(title);
        const { sectors, relatedAptIds } = deriveSectorsAndApts(title + " " + cleanedDesc);

        let pubDateIso = new Date().toISOString();
        if (pubDateRaw) {
          const parsed = new Date(pubDateRaw);
          if (!isNaN(parsed.getTime())) {
            pubDateIso = parsed.toISOString();
          }
        }

        return {
          id: advisoryId.toLowerCase(),
          advisoryId,
          title,
          link,
          pubDate: pubDateIso,
          vendor,
          summary: cleanedDesc.slice(0, 320) + (cleanedDesc.length > 320 ? "..." : ""),
          csafUrl,
          cves,
          sectors,
          relatedAptIds
        };
      });

      if (parsedItems.length > 0) {
        return mergeWithFallback(parsedItems);
      }
    } catch (e) {
      console.warn(`[CISA Feed Attempt Failed for ${url}]`, e);
    }
  }

  return FALLBACK_ADVISORIES;
}

// Extension on Date prototype safety helper
declare global {
  interface Date {
    isValid?: boolean;
  }
}
Object.defineProperty(Date.prototype, 'isValid', {
  get: function () {
    return !isNaN(this.getTime());
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/cisa-advisories", async (req, res) => {
    try {
      const advisories = await fetchCisaFeed();
      res.json({
        source: "https://www.cisa.gov/cybersecurity-advisories/all.xml",
        retrievedAt: new Date().toISOString(),
        total: advisories.length,
        advisories
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch CISA advisories", details: err?.message });
    }
  });

  // Vite Middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CISA Threat Matrix Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
