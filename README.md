# China APT Threat Intelligence Matrix & CISA Advisory Stream

> **This is a vibecoded website compiled with known Advanced Persistent Threats (APT) of China (PRC) and the platform also integrates Advisory Stream from CISA and gives detailed analysis on sectors effected.**

---

## 🛡️ Overview

The **China APT Threat Intelligence Matrix** is a cybersecurity intelligence and threat analysis platform. It provides detailed tracking, cross-entity relational mapping, sector impact analytics, and real-time CISA Industrial Control Systems (ICS) advisory feed ingestion for state-sponsored threat groups operating under the People's Republic of China (PRC).

Created & Designed by **Govind Nelika**.

---

## ✨ Key Features

- **China APT Intelligence Database**: Comprehensive profiling of state-sponsored threat actors (e.g., VOLT TYPHOON, APT41, APT10, APT27, APT30, APT31, APT1) including aliases, primary state affiliations, operational methods, targeted infrastructure, and known malware toolsets.
- **CISA ICS Advisory Stream Integration**: Real-time automated ingestion and local accumulation of CISA ICS advisories covering SCADA, OT, PLC, and critical infrastructure vulnerabilities with CSAF (Common Security Advisory Framework) JSON support.
- **Dual Runtime Support**: Operates as a full-stack Node.js/Express server or as a standalone client-side SPA (e.g., GitHub Pages) with direct client-side CSAF streaming fallback.
- **Sector Impact Analysis**: Interactive threat heatmaps, network visualizers, and targeted sector distributions across Energy, Water, Critical Manufacturing, Telecommunications, Defense, Healthcare, and Finance.
- **MITRE ATT&CK Mapping & SDK**: Visual technique matrix mapping actor behaviors directly to the MITRE ATT&CK framework with JSON export capabilities.
- **Executive Briefing & PDF Export**: One-click generation of formatted threat intelligence briefing documents and filtered CSV/JSON dataset exports.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **Visualization**: Recharts, Canvas / SVG network graphs
- **Backend / API**: Express, Node.js (with esbuild CJS bundling for production Cloud Run execution)
- **Deployment**: Supports Cloud Run / Docker containers and GitHub Pages static hosting

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Nelika/Intel-Matrix.git
cd Intel-Matrix
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
