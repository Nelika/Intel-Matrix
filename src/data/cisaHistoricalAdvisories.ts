import { CisaAdvisory } from "../components/CisaIcsAdvisoriesFeed";

export function sanitizeCisaLink(rawLink?: string, advisoryId?: string): string {
  const id = (advisoryId || "").toLowerCase();
  let link = (rawLink || "").trim();

  if ((id.startsWith("icsma-") || link.includes("/icsma-")) && link.includes("/news-events/ics-advisories/")) {
    link = link.replace("/news-events/ics-advisories/", "/news-events/ics-medical-advisories/");
  }

  if (link && link.startsWith("http://")) {
    link = link.replace("http://", "https://");
  }

  if (link && link.startsWith("https://")) {
    return link;
  }

  if (id.startsWith("icsma-")) {
    return `https://www.cisa.gov/news-events/ics-medical-advisories/${id}`;
  }
  if (id.startsWith("ics-alert") || id.startsWith("icsa-alert")) {
    return `https://www.cisa.gov/news-events/ics-alerts/${id}`;
  }
  if (id) {
    return `https://www.cisa.gov/news-events/ics-advisories/${id}`;
  }
  return "https://www.cisa.gov/news-events/ics-advisories";
}

export const HISTORICAL_CISA_ADVISORIES: CisaAdvisory[] = [
  {
    id: "icsa-26-216-01",
    advisoryId: "ICSA-26-216-01",
    title: "Siemens SIMATIC S7-1200 & S7-1500 Controller Communication Stack",
    link: "https://www.cisa.gov/news-events/ics-advisories?search=ICSA-26-216-01",
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
    link: "https://www.cisa.gov/news-events/ics-advisories?search=ICSA-26-216-02",
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
    link: "https://www.cisa.gov/news-events/ics-advisories?search=ICSA-26-215-01",
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
    link: "https://www.cisa.gov/news-events/ics-advisories?search=ICSA-26-215-02",
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
    link: "https://www.cisa.gov/news-events/ics-advisories?search=ICSA-26-214-01",
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
    link: "https://www.cisa.gov/news-events/ics-advisories?search=ICSA-26-214-02",
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
    link: "https://www.cisa.gov/news-events/ics-advisories?search=ICSA-26-213-01",
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
    title: "Schneider Electric IGSS Definition Module",
    link: "https://www.cisa.gov/news-events/ics-advisories/icsa-26-211-04",
    pubDate: "2026-07-30T12:00:00Z",
    vendor: "Schneider Electric",
    summary: "Schneider Electric IGSS Definition module contains remote code execution and heap buffer overflow vulnerabilities. Successful exploitation could allow unauthenticated attackers to disrupt power distribution SCADA systems.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsa-26-211-04.json",
    cves: ["CVE-2026-38291", "CVE-2026-38292"],
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
    summary: "Successful exploitation of this vulnerability in 1756-EN4TR Communications Modules could allow an unauthenticated attacker to manipulate PLC operational logic and freeze industrial assembly automation.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsa-26-211-05.json",
    cves: ["CVE-2026-40112"],
    sectors: ["Critical Manufacturing", "Energy", "Transportation Systems"],
    relatedAptIds: ["APT41", "APT1", "APT10"]
  },
  {
    id: "icsa-26-209-02",
    advisoryId: "ICSA-26-209-02",
    title: "Siemens Mendix Runtime & S7-1500 Controller Interface",
    link: "https://www.cisa.gov/news-events/ics-advisories/icsa-26-209-02",
    pubDate: "2026-07-28T12:00:00Z",
    vendor: "Siemens",
    summary: "Siemens Mendix Runtime access control rule configuration gap and S7-1500 communication module exposure allows privilege escalation to root levels on industrial engineering workstations.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsa-26-209-02.json",
    cves: ["CVE-2026-7891", "CVE-2026-7892"],
    sectors: ["Critical Manufacturing", "Telecommunications", "Information Technology"],
    relatedAptIds: ["APT41", "APT10", "VOLT_TYPHOON"]
  },
  {
    id: "icsa-26-209-05",
    advisoryId: "ICSA-26-209-05",
    title: "MikroTik RouterOS and Cloud Hosted Router OT Perimeter Gateway",
    link: "https://www.cisa.gov/news-events/ics-advisories/icsa-26-209-05",
    pubDate: "2026-07-28T12:00:00Z",
    vendor: "MikroTik",
    summary: "Successful exploitation of password guessing and remote authentication bypass could allow state-sponsored actors to breach OT network perimeters and perform lateral movement.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsa-26-209-05.json",
    cves: ["CVE-2026-16347"],
    sectors: ["Critical Manufacturing", "Telecommunications", "Information Technology"],
    relatedAptIds: ["VOLT_TYPHOON", "APT30", "APT10"]
  },
  {
    id: "icsa-26-204-03",
    advisoryId: "ICSA-26-204-03",
    title: "Weintek cMT3092X HMI Human-Machine Interface",
    link: "https://www.cisa.gov/news-events/ics-advisories/icsa-26-204-03",
    pubDate: "2026-07-23T12:00:00Z",
    vendor: "Weintek",
    summary: "Multiple stack buffer overflows and unauthenticated parameter exposure in EasyWeb server components allowing remote takeover of factory floor HMI display panels.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsa-26-204-03.json",
    cves: ["CVE-2026-60134", "CVE-2026-61892", "CVE-2026-61886", "CVE-2026-60135"],
    sectors: ["Critical Manufacturing", "Commercial Facilities"],
    relatedAptIds: ["APT41", "APT10", "APT1"]
  },
  {
    id: "icsa-26-204-05",
    advisoryId: "ICSA-26-204-05",
    title: "Rockwell Automation ThinManager Centralized Server",
    link: "https://www.cisa.gov/news-events/ics-advisories/icsa-26-204-05",
    pubDate: "2026-07-23T12:00:00Z",
    vendor: "Rockwell Automation",
    summary: "Directory traversal vulnerability allows authenticated remote attackers to write arbitrary system files and overwrite industrial client configurations across distributed manufacturing facilities.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsa-26-204-05.json",
    cves: ["CVE-2026-11917"],
    sectors: ["Energy", "Water and Wastewater Systems", "Critical Manufacturing"],
    relatedAptIds: ["APT41", "VOLT_TYPHOON", "APT27"]
  },
  {
    id: "icsa-26-204-07",
    advisoryId: "ICSA-26-204-07",
    title: "MZ Automation lib60870 Substation Automation Protocol Library",
    link: "https://www.cisa.gov/news-events/ics-advisories/icsa-26-204-07",
    pubDate: "2026-07-23T12:00:00Z",
    vendor: "MZ Automation",
    summary: "Out-of-bounds read and memory corruption in IEC 60870-5-104 protocol stack causing unexpected service crash and denial-of-service across electric grid substations.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsa-26-204-07.json",
    cves: ["CVE-2026-16002"],
    sectors: ["Energy", "Water and Wastewater Systems", "Critical Infrastructure"],
    relatedAptIds: ["VOLT_TYPHOON", "APT27", "APT41"]
  },
  {
    id: "icsa-26-204-02",
    advisoryId: "ICSA-26-204-02",
    title: "Johnson Controls XAAP Android Facility Mobile Controller",
    link: "https://www.cisa.gov/news-events/ics-advisories/icsa-26-204-02",
    pubDate: "2026-07-23T12:00:00Z",
    vendor: "Johnson Controls",
    summary: "Insecure credential transmission in building access management mobile application exposes API tokens enabling unauthorized physical facility entry.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsa-26-204-02.json",
    cves: ["CVE-2026-34490"],
    sectors: ["Commercial Facilities", "Government Facilities", "Healthcare"],
    relatedAptIds: ["APT31", "APT41"]
  },
  {
    id: "icsa-26-204-01",
    advisoryId: "ICSA-26-204-01",
    title: "Johnson Controls C-CURE 9000 & Victor Security Server",
    link: "https://www.cisa.gov/news-events/ics-advisories/icsa-26-204-01",
    pubDate: "2026-07-23T12:00:00Z",
    vendor: "Johnson Controls",
    summary: "Unauthenticated remote code execution and SQL injection flaws in security physical access controller allows complete domain control over sensitive federal installations.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsa-26-204-01.json",
    cves: ["CVE-2026-21655", "CVE-2026-21653", "CVE-2026-34496"],
    sectors: ["Government Facilities", "Commercial Facilities", "Defense Industrial Base"],
    relatedAptIds: ["APT31", "APT41", "APT10"]
  },
  {
    id: "icsa-26-204-04",
    advisoryId: "ICSA-26-204-04",
    title: "Panduit IntraVUE Industrial Network Visualizer",
    link: "https://www.cisa.gov/news-events/ics-advisories/icsa-26-204-04",
    pubDate: "2026-07-23T12:00:00Z",
    vendor: "Panduit",
    summary: "Hardcoded default credentials and path traversal flaws allow network attackers to manipulate industrial switches and monitor OT telemetry without authentication.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsa-26-204-04.json",
    cves: ["CVE-2026-40430", "CVE-2026-42933", "CVE-2026-44955", "CVE-2026-50044"],
    sectors: ["Energy", "Water and Wastewater Systems", "Critical Manufacturing"],
    relatedAptIds: ["APT41", "VOLT_TYPHOON", "APT27"]
  },
  {
    id: "icsa-26-190-01",
    advisoryId: "ICSA-26-190-01",
    title: "Honeywell Experion PKS & Safety Manager SCADA",
    link: "https://www.cisa.gov/news-events/ics-advisories/icsa-26-190-01",
    pubDate: "2026-07-09T12:00:00Z",
    vendor: "Honeywell",
    summary: "Vulnerability in Experion process knowledge system communication channels enables man-in-the-middle injection of false temperature telemetry in oil refineries.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsa-26-190-01.json",
    cves: ["CVE-2026-18901"],
    sectors: ["Energy", "Chemical", "Critical Manufacturing"],
    relatedAptIds: ["VOLT_TYPHOON", "APT41"]
  },
  {
    id: "icsma-26-181-01",
    advisoryId: "ICSMA-26-181-01",
    title: "OFFIS DCMTK Medical Imaging Toolkit",
    link: "https://www.cisa.gov/news-events/ics-medical-advisories/icsma-26-181-01",
    pubDate: "2026-06-30T12:00:00Z",
    vendor: "OFFIS",
    summary: "Out-of-bounds write and memory corruption vulnerabilities in OFFIS DCMTK DICOM toolkit could allow remote attackers to cause a denial-of-service condition or execute arbitrary code in medical imaging PACS servers.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsma-26-181-01.json",
    cves: ["CVE-2026-25411", "CVE-2026-25412"],
    sectors: ["Healthcare and Public Health"],
    relatedAptIds: ["APT41", "APT31"]
  },
  {
    id: "icsma-26-176-02",
    advisoryId: "ICSMA-26-176-02",
    title: "OHIF Viewers DICOM Medical Imaging Client",
    link: "https://www.cisa.gov/news-events/ics-medical-advisories/icsma-26-176-02",
    pubDate: "2026-06-25T12:00:00Z",
    vendor: "Open Health Imaging Foundation",
    summary: "Cross-site scripting (XSS) and client-side prototype pollution in OHIF web-based medical viewer allows attackers to inject malicious scripts into radiologist diagnostic web portals.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsma-26-176-02.json",
    cves: ["CVE-2026-24102"],
    sectors: ["Healthcare and Public Health"],
    relatedAptIds: ["APT41"]
  },
  {
    id: "icsma-26-176-01",
    advisoryId: "ICSMA-26-176-01",
    title: "pydicom pynetdicom Medical Imaging Library",
    link: "https://www.cisa.gov/news-events/ics-medical-advisories/icsma-26-176-01",
    pubDate: "2026-06-25T10:00:00Z",
    vendor: "pydicom",
    summary: "Improper input handling in pynetdicom network protocol parser allows remote unauthenticated attackers to cause infinite loops and memory exhaustion on medical telemetry ingestion endpoints.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsma-26-176-01.json",
    cves: ["CVE-2026-23901"],
    sectors: ["Healthcare and Public Health"],
    relatedAptIds: ["APT41", "APT10"]
  },
  {
    id: "icsa-26-120-01",
    advisoryId: "ICSA-26-120-01",
    title: "GE Vernova Mark VIe Distributed Control System",
    link: "https://www.cisa.gov/news-events/ics-advisories/icsa-26-120-01",
    pubDate: "2026-04-29T12:00:00Z",
    vendor: "GE Vernova",
    summary: "Authentication bypass in turbine controller web management portal allowing unauthenticated modification of speed control setpoints in power generation facilities.",
    csafUrl: "https://github.com/cisagov/CSAF/blob/develop/csaf_files/OT/white/2026/icsa-26-120-01.json",
    cves: ["CVE-2026-12001"],
    sectors: ["Energy", "Critical Infrastructure"],
    relatedAptIds: ["APT41", "VOLT_TYPHOON", "APT10"]
  }
];
