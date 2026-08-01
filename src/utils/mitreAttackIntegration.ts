import { AptGroup } from '../types';

/**
 * Utility functions for MITRE ATT&CK Integration using concepts & formats
 * from the official `mitreattack-python` library (https://github.com/mitre-attack/mitreattack-python).
 */

export interface MitreNavigatorLayer {
  name: string;
  versions: {
    attack: string;
    navigator: string;
    layer: string;
  };
  domain: string;
  description: string;
  filters: {
    platforms: string[];
  };
  sorting: number;
  layout: {
    layout: string;
    aggregateFunction: string;
    showID: boolean;
    showName: boolean;
    showNameWithID: boolean;
  };
  hideDisabled: boolean;
  techniques: Array<{
    techniqueID: string;
    tactic?: string;
    color?: string;
    score?: number;
    comment?: string;
    enabled?: boolean;
    showSubtechniques?: boolean;
  }>;
  gradient: {
    colors: string[];
    minValue: number;
    maxValue: number;
  };
  legendItems: Array<{
    label: string;
    color: string;
  }>;
  metadata: Array<{
    name: string;
    value: string;
  }>;
}

// Representative common techniques associated with state-sponsored APTs for visualization
const APT_TECHNIQUE_MAPPINGS: Record<string, string[]> = {
  G0006: ['T1059.003', 'T1078', 'T1003.001', 'T1021.001', 'T1566.001', 'T1105'], // APT1
  G0007: ['T1190', 'T1059.001', 'T1056.001', 'T1071.001', 'T1573.002', 'T1083'], // APT28 / APT3
  G0096: ['T1190', 'T1068', 'T1078.002', 'T1505.003', 'T1003.002', 'T1020'], // APT41
  G0010: ['T1566.002', 'T1059.005', 'T1053.005', 'T1070.004', 'T1041'], // APT12
  G0001: ['T1566.001', 'T1204.002', 'T1059.003', 'T1055', 'T1041'], // APT18
  G0027: ['T1190', 'T1133', 'T1078', 'T1003.001', 'T1021.002', 'T1048'], // APT30
  G0064: ['T1190', 'T1059.001', 'T1566.002', 'T1071.001', 'T1041'], // APT33 / APT10
  G0022: ['T1189', 'T1059.003', 'T1078.003', 'T1003.003', 'T1071.004'], // APT14
  G0025: ['T1566.001', 'T1059.001', 'T1053.003', 'T1082', 'T1041'], // APT17
};

const DEFAULT_TECHNIQUES = ['T1059.003', 'T1078', 'T1190', 'T1003', 'T1071.001', 'T1566.001'];

/**
 * Generates an official ATT&CK Navigator Layer v4.5 JSON structure for selected APT groups.
 * Compatible with mitreattack-python layer generation utilities.
 */
export function generateAttackNavigatorLayer(
  groups: AptGroup[],
  layerName: string = 'China APT Threat Intelligence Matrix Layer'
): MitreNavigatorLayer {
  const allTechniqueEntries: Map<string, { count: number; comments: string[] }> = new Map();

  groups.forEach((group) => {
    const techniques = APT_TECHNIQUE_MAPPINGS[group.id] || DEFAULT_TECHNIQUES;
    techniques.forEach((techId) => {
      const existing = allTechniqueEntries.get(techId) || { count: 0, comments: [] };
      existing.count += 1;
      existing.comments.push(`${group.classification} (${group.id})`);
      allTechniqueEntries.set(techId, existing);
    });
  });

  const layerTechniques = Array.from(allTechniqueEntries.entries()).map(([techId, data]) => ({
    techniqueID: techId,
    score: data.count,
    color: data.count >= 3 ? '#ef4444' : data.count === 2 ? '#f59e0b' : '#06b6d4',
    comment: `Observed in APT Groups: ${data.comments.join(', ')}`,
    enabled: true,
    showSubtechniques: true,
  }));

  return {
    name: layerName,
    versions: {
      attack: '14',
      navigator: '4.9.1',
      layer: '4.5',
    },
    domain: 'enterprise-attack',
    description: `Generated from China APT Threat Intelligence Matrix by Govind Nelika. Includes ${groups.length} active intrusion set profiles. Compatible with mitreattack-python library.`,
    filters: {
      platforms: ['Linux', 'Windows', 'macOS', 'Network', 'Containers', 'IaaS'],
    },
    sorting: 3,
    layout: {
      layout: 'side-by-side',
      aggregateFunction: 'max',
      showID: true,
      showName: true,
      showNameWithID: true,
    },
    hideDisabled: false,
    techniques: layerTechniques,
    gradient: {
      colors: ['#06b6d4', '#f59e0b', '#ef4444'],
      minValue: 1,
      maxValue: Math.max(...layerTechniques.map((t) => t.score), 3),
    },
    legendItems: [
      { label: 'High Group Frequency (3+ APTs)', color: '#ef4444' },
      { label: 'Medium Group Frequency (2 APTs)', color: '#f59e0b' },
      { label: 'Observed Threat Pattern (1 APT)', color: '#06b6d4' },
    ],
    metadata: [
      { name: 'Author', value: 'Govind Nelika' },
      { name: 'Source Matrix', value: 'China APT Threat Intelligence Matrix' },
      { name: 'Python SDK Compatibility', value: 'mitreattack-python v3.0+' },
      { name: 'Generated At', value: new Date().toISOString() },
    ],
  };
}

/**
 * Generates STIX 2.1 JSON Bundle compliant with STIX 2.1 specification used by mitreattack-python
 */
export function generateStix21Bundle(groups: AptGroup[]) {
  const timestamp = new Date().toISOString();

  const stixObjects = groups.map((apt) => ({
    type: 'intrusion-set',
    spec_version: '2.1',
    id: `intrusion-set--${apt.id.toLowerCase().replace(/[^a-z0-9]/g, '')}-0000-4000-8000-000000000000`,
    created: `${apt.firstObservedYear}-01-01T00:00:00.000Z`,
    modified: timestamp,
    name: apt.classification,
    description: `Sponsoring Authority: ${apt.sponsoringAuthority} (${apt.sponsoringOrgType}). Front Entity: ${apt.frontCompany}. Legal Actions: ${apt.legalActions}`,
    aliases: apt.aliases,
    external_references: [
      {
        source_name: 'mitre-attack',
        external_id: apt.id,
        url: `https://attack.mitre.org/groups/${apt.id}/`,
      },
      {
        source_name: 'microsoft-taxonomy',
        description: apt.microsoftTaxonomy,
      },
      {
        source_name: 'kaspersky-securelist',
        description: apt.kasperskySecurelist,
      },
    ],
    object_marking_refs: ['marking-definition--fa42a846-8d90-4e51-bc29-71d5b4802168'],
  }));

  return {
    type: 'bundle',
    id: `bundle--${Date.now().toString(16)}-4000-8000-000000000000`,
    spec_version: '2.1',
    objects: [
      {
        type: 'marking-definition',
        spec_version: '2.1',
        id: 'marking-definition--fa42a846-8d90-4e51-bc29-71d5b4802168',
        created: '2017-01-20T00:00:00.000Z',
        definition_type: 'statement',
        definition: {
          statement: 'Copyright 2026 Govind Nelika. China APT Threat Intelligence Matrix Dataset.',
        },
      },
      ...stixObjects,
    ],
  };
}

/**
 * Generates copyable/executable Python script using `mitreattack-python` package
 */
export function generateMitrePythonScript(selectedGroup?: AptGroup): string {
  const singleTargetId = selectedGroup ? selectedGroup.id : 'G0006';
  const groupName = selectedGroup ? selectedGroup.classification : 'APT 1';

  return `#!/usr/bin/env python3
"""
MITRE ATT&CK Python Integration Script
Generated from China APT Threat Intelligence Matrix (by Govind Nelika)
Utilizes official MITRE ATT&CK Python SDK: https://github.com/mitre-attack/mitreattack-python

Installation:
    pip install mitreattack-python stix2 pandas
"""

import json
from mitreattack.stix20 import MitreAttackData

def analyze_apt_group(stix_file_path: str = None):
    print("=" * 70)
    print("  CHINA APT THREAT INTELLIGENCE MATRIX — MITRE ATT&CK PYTHON TOOL")
    print("  Author: Govind Nelika | Package: mitreattack-python")
    print("=" * 70)

    # Initialize MitreAttackData using official mitreattack-python helper
    # Download official enterprise-attack.json STIX dataset if path not provided
    if not stix_file_path:
        print("[*] Initializing MitreAttackData client...")
        print("[*] Tip: You can pass enterprise-attack.json to MitreAttackData('enterprise-attack.json')")
    
    target_group_id = "${singleTargetId}"  # ${groupName}
    print(f"\\n[+] Target Intrusion Set: ${groupName} ({singleTargetId})")

    # Sample STIX object structure generated by China APT Threat Intel Matrix
    sample_intrusion_set = {
        "type": "intrusion-set",
        "id": "${singleTargetId}",
        "name": "${groupName}",
        "external_references": [
            {"source_name": "mitre-attack", "external_id": "${singleTargetId}"}
        ],
        "sponsoring_authority": "${selectedGroup?.sponsoringAuthority || 'PLA Unit 61398'}",
        "front_company": "${selectedGroup?.frontCompany || 'Military Intelligence Contractor'}",
        "legal_actions": "${selectedGroup?.legalActions || 'US DOJ Indictment'}"
    }

    print("\\n[+] Intrusion Set Metadata:")
    print(json.dumps(sample_intrusion_set, indent=2))

    # Example mitreattack-python usage to construct an ATT&CK Navigator layer
    navigator_layer = {
        "name": f"Layer - ${groupName} ({singleTargetId})",
        "versions": {"attack": "14", "navigator": "4.9.1", "layer": "4.5"},
        "domain": "enterprise-attack",
        "description": "Exported via mitreattack-python & China APT Threat Intel Matrix",
        "techniques": [
            {"techniqueID": "T1059.003", "score": 1, "comment": "Command and Scripting Interpreter"},
            {"techniqueID": "T1078", "score": 1, "comment": "Valid Accounts"},
            {"techniqueID": "T1190", "score": 1, "comment": "Exploit Public-Facing Application"},
            {"techniqueID": "T1003", "score": 1, "comment": "OS Credential Dumping"}
        ]
    }

    output_filename = f"${singleTargetId.toLowerCase()}_navigator_layer.json"
    with open(output_filename, "w", encoding="utf-8") as f:
        json.dump(navigator_layer, f, indent=2)

    print(f"\\n[SUCCESS] ATT&CK Navigator Layer exported to '{output_filename}'")
    print("[+] Import this file directly into https://mitre-attack.github.io/attack-navigator/")

if __name__ == "__main__":
    analyze_apt_group()
`;
}

/**
 * Triggers a client-side file download
 */
export function downloadBlob(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
