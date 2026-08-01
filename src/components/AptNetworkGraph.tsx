import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import {
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Search,
  Filter,
  Shield,
  Building2,
  Building,
  Target,
  Sliders,
  X,
  ExternalLink,
  Download,
  Info,
  Sparkles,
  Layers,
  ChevronRight,
  Eye,
  EyeOff,
  GitCommit,
  Compass,
  Zap,
  Activity,
  FileCode,
  Radio,
  Maximize,
  Minimize,
  Workflow,
  Sparkle,
} from 'lucide-react';
import { AptGroup } from '../types';

interface AptNetworkGraphProps {
  data: AptGroup[];
  onSelectApt: (apt: AptGroup) => void;
  searchQuery?: string;
}

export interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'apt' | 'sponsor' | 'front' | 'sector';
  orgType?: string;
  aptGroup?: AptGroup;
  connectionsCount: number;
  radius: number;
  color: string;
  subtitle?: string;
  legalCategory?: string;
}

export interface NetworkLink extends d3.SimulationLinkDatum<NetworkNode> {
  source: string | NetworkNode;
  target: string | NetworkNode;
  relation: 'sponsored_by' | 'front_company_for' | 'targets_sector';
  label: string;
}

type LayoutMode = 'force' | 'concentric' | 'hierarchical';
type ColorMode = 'type' | 'org' | 'legal';

const TYPE_COLORS = {
  apt: '#06b6d4',      // Cyan
  sponsor: '#a855f7',  // Purple
  front: '#f59e0b',    // Amber
  sector: '#10b981',   // Emerald
};

const ORG_COLORS: Record<string, string> = {
  MSS: '#818cf8',                 // Indigo
  PLA: '#f43f5e',                 // Rose/Red
  MPS: '#fbbf24',                 // Amber
  'Joint / Independent': '#34d399',// Emerald
  'Defense / MSS': '#38bdf8',      // Sky
  Unknown: '#94a3b8',              // Slate
};

const LEGAL_COLORS: Record<string, string> = {
  Indicted: '#ef4444',            // Red
  Sanctioned: '#f97316',           // Orange
  'Active Defense': '#06b6d4',     // Cyan
  Unknown: '#64748b',              // Slate
};

const TYPE_LABELS = {
  apt: 'APT Group',
  sponsor: 'Sponsoring Authority',
  front: 'Front / Cover Entity',
  sector: 'Targeted Sector',
};

export const AptNetworkGraph: React.FC<AptNetworkGraphProps> = ({
  data,
  onSelectApt,
  searchQuery: initialSearchQuery = '',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Layout & Color Modes
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('force');
  const [colorMode, setColorMode] = useState<ColorMode>('type');

  // Search & Filters
  const [nodeSearch, setNodeSearch] = useState(initialSearchQuery);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showSponsors, setShowSponsors] = useState(true);
  const [showFronts, setShowFronts] = useState(true);
  const [showSectors, setShowSectors] = useState(true);
  const [selectedOrgType, setSelectedOrgType] = useState<string>('ALL');

  // Pathfinder Mode State
  const [isPathfinderMode, setIsPathfinderMode] = useState(false);
  const [pathSourceId, setPathSourceId] = useState<string>('');
  const [pathTargetId, setPathTargetId] = useState<string>('');

  // Simulation Physics Parameters
  const [chargeStrength, setChargeStrength] = useState<number>(-380);
  const [linkDistance, setLinkDistance] = useState<number>(85);
  const [showPhysicsPanel, setShowPhysicsPanel] = useState<boolean>(false);

  // Selection & Inspector State
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Tooltip position
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Sync prop query
  useEffect(() => {
    if (initialSearchQuery) setNodeSearch(initialSearchQuery);
  }, [initialSearchQuery]);

  // Determine node color helper based on active colorMode
  const getNodeColor = useCallback(
    (type: NetworkNode['type'], orgType?: string, legalCategory?: string): string => {
      if (colorMode === 'org' && orgType) {
        return ORG_COLORS[orgType] || TYPE_COLORS[type];
      }
      if (colorMode === 'legal' && legalCategory) {
        if (legalCategory.toLowerCase().includes('indicted') || legalCategory.toLowerCase().includes('doj')) {
          return LEGAL_COLORS['Indicted'];
        }
        if (legalCategory.toLowerCase().includes('sanctioned') || legalCategory.toLowerCase().includes('treasury')) {
          return LEGAL_COLORS['Sanctioned'];
        }
        return LEGAL_COLORS['Active Defense'];
      }
      return TYPE_COLORS[type];
    },
    [colorMode]
  );

  // Build Graph Nodes & Links from dataset
  const { nodes, links, stats } = useMemo(() => {
    let filteredData = data;
    if (selectedOrgType !== 'ALL') {
      filteredData = data.filter((d) => d.sponsoringOrgType === selectedOrgType);
    }

    const nodeMap = new Map<string, NetworkNode>();
    const rawLinks: NetworkLink[] = [];

    let aptCount = 0;
    let sponsorCount = 0;
    let frontCount = 0;
    let sectorCount = 0;

    filteredData.forEach((apt) => {
      // 1. APT Node
      const aptNodeId = `apt-${apt.id}`;
      if (!nodeMap.has(aptNodeId)) {
        nodeMap.set(aptNodeId, {
          id: aptNodeId,
          label: apt.classification,
          subtitle: `${apt.id} • ${apt.sponsoringOrgType}`,
          type: 'apt',
          orgType: apt.sponsoringOrgType,
          aptGroup: apt,
          connectionsCount: 0,
          radius: 20,
          legalCategory: apt.legalCategory,
          color: getNodeColor('apt', apt.sponsoringOrgType, apt.legalCategory),
        });
        aptCount++;
      }

      // 2. Sponsoring Authority Node
      if (showSponsors && apt.sponsoringAuthority && apt.sponsoringAuthority !== 'Unknown') {
        const sponsorNodeId = `sponsor-${apt.sponsoringAuthority}`;
        if (!nodeMap.has(sponsorNodeId)) {
          nodeMap.set(sponsorNodeId, {
            id: sponsorNodeId,
            label: apt.sponsoringAuthority,
            subtitle: `Sponsoring Authority (${apt.sponsoringOrgType})`,
            type: 'sponsor',
            orgType: apt.sponsoringOrgType,
            connectionsCount: 0,
            radius: 16,
            color: getNodeColor('sponsor', apt.sponsoringOrgType),
          });
          sponsorCount++;
        }

        rawLinks.push({
          source: aptNodeId,
          target: sponsorNodeId,
          relation: 'sponsored_by',
          label: 'Sponsored By',
        });
      }

      // 3. Front Company Node
      if (showFronts && apt.frontCompany && apt.frontCompany !== 'None' && apt.frontCompany !== 'Unknown') {
        const frontNodeId = `front-${apt.frontCompany}`;
        if (!nodeMap.has(frontNodeId)) {
          nodeMap.set(frontNodeId, {
            id: frontNodeId,
            label: apt.frontCompany,
            subtitle: 'Front / Cover Entity',
            type: 'front',
            orgType: apt.sponsoringOrgType,
            connectionsCount: 0,
            radius: 14,
            color: getNodeColor('front', apt.sponsoringOrgType),
          });
          frontCount++;
        }

        rawLinks.push({
          source: aptNodeId,
          target: frontNodeId,
          relation: 'front_company_for',
          label: 'Cover Entity',
        });
      }

      // 4. Targeted Sectors Nodes
      if (showSectors && apt.targetedSectors && apt.targetedSectors.length > 0) {
        apt.targetedSectors.forEach((sec) => {
          const trimmedSec = sec.trim();
          if (!trimmedSec) return;
          const sectorNodeId = `sector-${trimmedSec}`;
          if (!nodeMap.has(sectorNodeId)) {
            nodeMap.set(sectorNodeId, {
              id: sectorNodeId,
              label: trimmedSec,
              subtitle: 'Targeted Sector',
              type: 'sector',
              connectionsCount: 0,
              radius: 12,
              color: getNodeColor('sector'),
            });
            sectorCount++;
          }

          rawLinks.push({
            source: aptNodeId,
            target: sectorNodeId,
            relation: 'targets_sector',
            label: 'Targets',
          });
        });
      }
    });

    // Count degree connections
    rawLinks.forEach((link) => {
      const srcId = typeof link.source === 'string' ? link.source : (link.source as NetworkNode).id;
      const tgtId = typeof link.target === 'string' ? link.target : (link.target as NetworkNode).id;
      const srcNode = nodeMap.get(srcId);
      const tgtNode = nodeMap.get(tgtId);
      if (srcNode) srcNode.connectionsCount++;
      if (tgtNode) tgtNode.connectionsCount++;
    });

    // Adjust radius by connection count
    nodeMap.forEach((node) => {
      if (node.type === 'apt') node.radius = 18 + Math.min(node.connectionsCount * 1.2, 12);
      else if (node.type === 'sponsor') node.radius = 16 + Math.min(node.connectionsCount * 1.5, 12);
      else if (node.type === 'front') node.radius = 13 + Math.min(node.connectionsCount * 1.2, 8);
      else node.radius = 11 + Math.min(node.connectionsCount * 0.8, 8);
    });

    const nodesList = Array.from(nodeMap.values());

    // Compute central hub node (highest connections)
    let topHubNode: NetworkNode | null = null;
    let maxConn = -1;
    nodesList.forEach((n) => {
      if (n.connectionsCount > maxConn) {
        maxConn = n.connectionsCount;
        topHubNode = n;
      }
    });

    // Calculate density
    const v = nodesList.length;
    const e = rawLinks.length;
    const density = v > 1 ? ((2 * e) / (v * (v - 1))).toFixed(3) : '0';

    return {
      nodes: nodesList,
      links: rawLinks,
      stats: {
        totalNodes: nodesList.length,
        totalLinks: rawLinks.length,
        aptCount,
        sponsorCount,
        frontCount,
        sectorCount,
        topHubNode,
        density,
      },
    };
  }, [data, selectedOrgType, showSponsors, showFronts, showSectors, getNodeColor]);

  // BFS Shortest Path Calculation for Pathfinder
  const pathfinderNodesSet = useMemo(() => {
    if (!isPathfinderMode || !pathSourceId || !pathTargetId || pathSourceId === pathTargetId) {
      return null;
    }

    // Build adjacency graph
    const adj = new Map<string, string[]>();
    links.forEach((l) => {
      const s = typeof l.source === 'string' ? l.source : (l.source as NetworkNode).id;
      const t = typeof l.target === 'string' ? l.target : (l.target as NetworkNode).id;

      if (!adj.has(s)) adj.set(s, []);
      if (!adj.has(t)) adj.set(t, []);
      adj.get(s)!.push(t);
      adj.get(t)!.push(s);
    });

    // BFS
    const queue: string[] = [pathSourceId];
    const visited = new Set<string>([pathSourceId]);
    const parent = new Map<string, string>();

    let found = false;
    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr === pathTargetId) {
        found = true;
        break;
      }

      const neighbors = adj.get(curr) || [];
      for (const nxt of neighbors) {
        if (!visited.has(nxt)) {
          visited.add(nxt);
          parent.set(nxt, curr);
          queue.push(nxt);
        }
      }
    }

    if (!found) return new Set<string>();

    // Reconstruct path
    const path = new Set<string>();
    let curr: string | undefined = pathTargetId;
    while (curr) {
      path.add(curr);
      curr = parent.get(curr);
    }
    return path;
  }, [isPathfinderMode, pathSourceId, pathTargetId, links]);

  // Active Focus highlighting logic
  const activeFocusId = selectedNode?.id || hoveredNode?.id || null;
  const activeFocusConnections = useMemo(() => {
    if (pathfinderNodesSet) return pathfinderNodesSet;
    if (!activeFocusId) return new Set<string>();

    const connected = new Set<string>([activeFocusId]);
    links.forEach((link) => {
      const srcId = typeof link.source === 'string' ? link.source : (link.source as NetworkNode).id;
      const tgtId = typeof link.target === 'string' ? link.target : (link.target as NetworkNode).id;

      if (srcId === activeFocusId) connected.add(tgtId);
      if (tgtId === activeFocusId) connected.add(srcId);
    });
    return connected;
  }, [activeFocusId, links, pathfinderNodesSet]);

  // Search Matching Nodes
  const searchMatchingNodeIds = useMemo(() => {
    if (!nodeSearch.trim()) return null;
    const q = nodeSearch.toLowerCase().trim();
    const matches = new Set<string>();

    nodes.forEach((node) => {
      if (
        node.label.toLowerCase().includes(q) ||
        node.subtitle?.toLowerCase().includes(q) ||
        (node.aptGroup &&
          (node.aptGroup.id.toLowerCase().includes(q) ||
            node.aptGroup.aliases.some((a) => a.toLowerCase().includes(q))))
      ) {
        matches.add(node.id);
      }
    });
    return matches;
  }, [nodes, nodeSearch]);

  // Filtered dropdown suggestions for search
  const searchSuggestions = useMemo(() => {
    if (!nodeSearch.trim()) return [];
    const q = nodeSearch.toLowerCase().trim();
    return nodes
      .filter((n) => n.label.toLowerCase().includes(q) || n.subtitle?.toLowerCase().includes(q))
      .slice(0, 6);
  }, [nodes, nodeSearch]);

  // Zoom & Center camera onto node
  const zoomToNode = useCallback((node: NetworkNode) => {
    if (!svgRef.current) return;
    const svg = (svgRef.current as any).__svgObj;
    const zoom = (svgRef.current as any).__zoomObj;
    if (!svg || !zoom) return;

    const width = containerRef.current?.clientWidth || 900;
    const height = 620;
    const scale = 1.8;

    const x = node.x ?? width / 2;
    const y = node.y ?? height / 2;

    svg
      .transition()
      .duration(750)
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(scale)
          .translate(-x, -y)
      );

    setSelectedNode(node);
  }, []);

  // Setup D3 Simulation
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 900;
    const height = 620;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g').attr('class', 'graph-container');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Defs & Filters
    const defs = svg.append('defs');

    // Glow filter
    const filterGlow = defs
      .append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    filterGlow.append('feGaussianBlur').attr('stdDeviation', '5').attr('result', 'coloredBlur');
    const feMerge = filterGlow.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Deep copy nodes & links
    const simNodes: NetworkNode[] = nodes.map((n) => ({ ...n }));
    const simLinks: NetworkLink[] = links.map((l) => ({ ...l }));

    // Apply Layout Positioning logic
    if (layoutMode === 'concentric') {
      const sponsors = simNodes.filter((n) => n.type === 'sponsor');
      const apts = simNodes.filter((n) => n.type === 'apt');
      const outer = simNodes.filter((n) => n.type === 'front' || n.type === 'sector');

      sponsors.forEach((n, i) => {
        const angle = (i / Math.max(1, sponsors.length)) * 2 * Math.PI;
        n.fx = width / 2 + Math.cos(angle) * 110;
        n.fy = height / 2 + Math.sin(angle) * 110;
      });

      apts.forEach((n, i) => {
        const angle = (i / Math.max(1, apts.length)) * 2 * Math.PI;
        n.fx = width / 2 + Math.cos(angle) * 230;
        n.fy = height / 2 + Math.sin(angle) * 230;
      });

      outer.forEach((n, i) => {
        const angle = (i / Math.max(1, outer.length)) * 2 * Math.PI;
        n.fx = width / 2 + Math.cos(angle) * 330;
        n.fy = height / 2 + Math.sin(angle) * 330;
      });
    } else if (layoutMode === 'hierarchical') {
      const sponsors = simNodes.filter((n) => n.type === 'sponsor');
      const apts = simNodes.filter((n) => n.type === 'apt');
      const fronts = simNodes.filter((n) => n.type === 'front');
      const sectors = simNodes.filter((n) => n.type === 'sector');

      sponsors.forEach((n, i) => {
        n.fy = 100;
        n.fx = (width / (sponsors.length + 1)) * (i + 1);
      });
      apts.forEach((n, i) => {
        n.fy = 240;
        n.fx = (width / (apts.length + 1)) * (i + 1);
      });
      fronts.forEach((n, i) => {
        n.fy = 390;
        n.fx = (width / (fronts.length + 1)) * (i + 1);
      });
      sectors.forEach((n, i) => {
        n.fy = 520;
        n.fx = (width / (sectors.length + 1)) * (i + 1);
      });
    }

    // Force Simulation Setup
    const simulation = d3
      .forceSimulation<NetworkNode>(simNodes)
      .force(
        'link',
        d3
          .forceLink<NetworkNode, NetworkLink>(simLinks)
          .id((d) => d.id)
          .distance(linkDistance)
      )
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'collide',
        d3.forceCollide<NetworkNode>().radius((d) => d.radius + 14)
      );

    if (layoutMode === 'force') {
      simulation
        .force('x', d3.forceX(width / 2).strength(0.04))
        .force('y', d3.forceY(height / 2).strength(0.04));
    }

    // Link Lines
    const linkGroup = g.append('g').attr('class', 'links');
    const linkLines = linkGroup
      .selectAll<SVGLineElement, NetworkLink>('line')
      .data(simLinks)
      .enter()
      .append('line')
      .attr('stroke-width', (d) => (d.relation === 'sponsored_by' ? 2 : 1.5))
      .attr('stroke', (d) => {
        if (d.relation === 'sponsored_by') return '#a855f7';
        if (d.relation === 'front_company_for') return '#f59e0b';
        return '#34d399';
      })
      .attr('stroke-opacity', 0.4)
      .attr('stroke-dasharray', (d) => (d.relation === 'targets_sector' ? '3,3' : 'none'));

    // Nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const nodeSelection = nodeGroup
      .selectAll<SVGGElement, NetworkNode>('g')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('class', 'node-item')
      .style('cursor', 'pointer')
      .call(
        d3
          .drag<SVGGElement, NetworkNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            if (layoutMode === 'force') {
              d.fx = null;
              d.fy = null;
            }
          })
      );

    // Node Outer Ring
    nodeSelection
      .append('circle')
      .attr('r', (d) => d.radius + 3)
      .attr('fill', 'none')
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6);

    // Node Core
    nodeSelection
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => d.color)
      .attr('fill-opacity', 0.85)
      .attr('stroke', '#020617')
      .attr('stroke-width', 2);

    // Node Icons
    nodeSelection
      .append('text')
      .text((d) => {
        if (d.type === 'apt') return '🛡️';
        if (d.type === 'sponsor') return '🏛️';
        if (d.type === 'front') return '🏢';
        return '🎯';
      })
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', (d) => Math.max(10, d.radius * 0.85))
      .attr('pointer-events', 'none');

    // Node Text Label
    nodeSelection
      .append('text')
      .text((d) => (d.label.length > 20 ? `${d.label.substring(0, 18)}...` : d.label))
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.radius + 14)
      .attr('fill', '#e2e8f0')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('font-weight', (d) => (d.type === 'apt' ? 'bold' : 'normal'))
      .attr('pointer-events', 'none')
      .attr('paint-order', 'stroke')
      .attr('stroke', '#020617')
      .attr('stroke-width', 3)
      .attr('stroke-linejoin', 'round');

    // Mouse Listeners
    nodeSelection
      .on('mouseover', (event, d) => {
        setHoveredNode(d);
        const [x, y] = d3.pointer(event, containerRef.current);
        setTooltipPos({ x, y });
      })
      .on('mousemove', (event) => {
        const [x, y] = d3.pointer(event, containerRef.current);
        setTooltipPos({ x, y });
      })
      .on('mouseout', () => {
        setHoveredNode(null);
        setTooltipPos(null);
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode((prev) => (prev?.id === d.id ? null : d));
      });

    svg.on('click', () => {
      setSelectedNode(null);
      setShowSearchResults(false);
    });

    simulation.on('tick', () => {
      linkLines
        .attr('x1', (d) => (d.source as NetworkNode).x || 0)
        .attr('y1', (d) => (d.source as NetworkNode).y || 0)
        .attr('x2', (d) => (d.target as NetworkNode).x || 0)
        .attr('y2', (d) => (d.target as NetworkNode).y || 0);

      nodeSelection.attr('transform', (d) => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    (svgRef.current as any).__zoomObj = zoom;
    (svgRef.current as any).__svgObj = svg;

    return () => {
      simulation.stop();
    };
  }, [nodes, links, chargeStrength, linkDistance, layoutMode]);

  // Update Highlight Visual Transitions
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // Nodes Opacity & Glow
    svg.selectAll<SVGGElement, NetworkNode>('.node-item').each(function (d) {
      const nodeEl = d3.select(this);

      let isDimmed = false;

      if (activeFocusConnections.size > 0) {
        isDimmed = !activeFocusConnections.has(d.id);
      } else if (searchMatchingNodeIds) {
        isDimmed = !searchMatchingNodeIds.has(d.id);
      }

      nodeEl
        .transition()
        .duration(200)
        .style('opacity', isDimmed ? 0.15 : 1)
        .attr('filter', !isDimmed && activeFocusConnections.has(d.id) ? 'url(#glow)' : null);
    });

    // Links Opacity
    svg.selectAll<SVGLineElement, NetworkLink>('.links line').each(function (d) {
      const lineEl = d3.select(this);
      const srcId = typeof d.source === 'string' ? d.source : (d.source as NetworkNode).id;
      const tgtId = typeof d.target === 'string' ? d.target : (d.target as NetworkNode).id;

      let isHighlighted = false;

      if (activeFocusConnections.size > 0) {
        isHighlighted = activeFocusConnections.has(srcId) && activeFocusConnections.has(tgtId);
      } else if (searchMatchingNodeIds) {
        isHighlighted = searchMatchingNodeIds.has(srcId) && searchMatchingNodeIds.has(tgtId);
      } else {
        isHighlighted = true;
      }

      lineEl
        .transition()
        .duration(200)
        .attr('stroke-opacity', isHighlighted ? 0.9 : 0.08)
        .attr('stroke-width', isHighlighted ? 2.5 : 1);
    });
  }, [activeFocusConnections, searchMatchingNodeIds]);

  // Zoom Helpers
  const handleZoomIn = () => {
    if (!svgRef.current) return;
    const svg = (svgRef.current as any).__svgObj;
    const zoom = (svgRef.current as any).__zoomObj;
    if (svg && zoom) svg.transition().duration(300).call(zoom.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;
    const svg = (svgRef.current as any).__svgObj;
    const zoom = (svgRef.current as any).__zoomObj;
    if (svg && zoom) svg.transition().duration(300).call(zoom.scaleBy, 0.7);
  };

  const handleResetZoom = () => {
    if (!svgRef.current) return;
    const svg = (svgRef.current as any).__svgObj;
    const zoom = (svgRef.current as any).__zoomObj;
    if (svg && zoom) svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity);
  };

  // Export STIX 2.1 Relationship Bundle
  const handleExportStixBundle = () => {
    const stixBundle = {
      type: 'bundle',
      id: `bundle--${crypto.randomUUID ? crypto.randomUUID() : 'threat-graph-export'}`,
      spec_version: '2.1',
      objects: links.map((link) => {
        const sId = typeof link.source === 'string' ? link.source : (link.source as NetworkNode).id;
        const tId = typeof link.target === 'string' ? link.target : (link.target as NetworkNode).id;
        return {
          type: 'relationship',
          id: `relationship--${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)}`,
          spec_version: '2.1',
          relationship_type: link.relation,
          source_ref: sId,
          target_ref: tId,
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
        };
      }),
    };

    const blob = new Blob([JSON.stringify(stixBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stix21_threat_network_topology.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export SVG Graphic
  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `china_apt_network_topology_${new Date().toISOString().split('T')[0]}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Selected Node Details for Drawer
  const selectedNodeDetails = useMemo(() => {
    if (!selectedNode) return null;

    const connectedLinks = links.filter((l) => {
      const sId = typeof l.source === 'string' ? l.source : (l.source as NetworkNode).id;
      const tId = typeof l.target === 'string' ? l.target : (l.target as NetworkNode).id;
      return sId === selectedNode.id || tId === selectedNode.id;
    });

    const neighbors = connectedLinks
      .map((l) => {
        const sId = typeof l.source === 'string' ? l.source : (l.source as NetworkNode).id;
        const tId = typeof l.target === 'string' ? l.target : (l.target as NetworkNode).id;
        const neighborId = sId === selectedNode.id ? tId : sId;
        return {
          node: nodes.find((n) => n.id === neighborId),
          relation: l.relation,
          label: l.label,
        };
      })
      .filter((item): item is { node: NetworkNode; relation: string; label: string } => item.node !== undefined);

    return {
      node: selectedNode,
      neighbors,
      connectedCount: neighbors.length,
    };
  }, [selectedNode, links, nodes]);

  return (
    <div
      className={`bg-slate-950 border border-cyan-900/80 rounded-2xl p-4 sm:p-6 mb-8 shadow-2xl text-slate-100 relative overflow-hidden transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none mb-0 overflow-y-auto' : ''
      }`}
    >
      {/* Laser Top Accent */}
      <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 absolute top-0 left-0 right-0" />

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-cyan-900/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-700/80 text-cyan-400">
              <Share2 className="w-5 h-5 animate-pulse" />
            </span>
            <h3 className="text-xl font-mono font-bold text-white flex items-center gap-2">
              <span>Threat Network Topology & Relational Map</span>
              <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                D3 v7 Interactive Engine
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-300 font-sans max-w-3xl">
            A standalone graph engine mapping structural relationships across APT Threat Groups, State Sponsoring Authorities (MSS, PLA, MPS), Front Entities, and Targeted Sectors.
          </p>
        </div>

        {/* Intelligence HUD Metrics */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {stats.topHubNode && (
            <div className="px-3 py-1.5 bg-slate-900/90 border border-cyan-700/80 rounded-lg flex items-center gap-2 text-cyan-300 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Central Hub: <strong className="text-white">{stats.topHubNode.label}</strong> ({stats.topHubNode.connectionsCount} links)
              </span>
            </div>
          )}

          <div className="px-3 py-1.5 bg-slate-900/90 border border-purple-800/80 rounded-lg flex items-center gap-2 text-purple-300">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>Graph Density: <strong className="text-white">{stats.density}</strong></span>
          </div>

          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-cyan-800 text-cyan-300 rounded-lg transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Control & Filter Toolbar Bar */}
      <div className="py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-900 text-xs font-mono">
        
        {/* Left: Node Type Toggles & Branch Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Include Layers:</span>

          <button
            onClick={() => setShowSponsors((v) => !v)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              showSponsors
                ? 'bg-purple-950 text-purple-300 border border-purple-600/80'
                : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}
          >
            {showSponsors ? <Eye className="w-3.5 h-3.5 text-purple-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            <span>Sponsors ({stats.sponsorCount})</span>
          </button>

          <button
            onClick={() => setShowFronts((v) => !v)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              showFronts
                ? 'bg-amber-950 text-amber-300 border border-amber-600/80'
                : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}
          >
            {showFronts ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            <span>Front Companies ({stats.frontCount})</span>
          </button>

          <button
            onClick={() => setShowSectors((v) => !v)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              showSectors
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/80'
                : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}
          >
            {showSectors ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            <span>Sectors ({stats.sectorCount})</span>
          </button>

          {/* Org Filter Dropdown */}
          <select
            value={selectedOrgType}
            onChange={(e) => setSelectedOrgType(e.target.value)}
            className="bg-slate-900 border border-cyan-800/80 text-cyan-200 py-1 px-2.5 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Org Branches</option>
            <option value="MSS">MSS (State Security)</option>
            <option value="PLA">PLA (Military)</option>
            <option value="MPS">MPS (Public Security)</option>
            <option value="Joint / Independent">Joint / Independent</option>
          </select>
        </div>

        {/* Center/Right: Layout Preset & Color Customizer */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Layout Preset */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
            <span className="text-[10px] text-slate-400 uppercase font-bold px-1.5">Layout:</span>
            <button
              onClick={() => setLayoutMode('force')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                layoutMode === 'force' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Force
            </button>
            <button
              onClick={() => setLayoutMode('concentric')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                layoutMode === 'concentric' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Radial
            </button>
            <button
              onClick={() => setLayoutMode('hierarchical')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                layoutMode === 'hierarchical' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Layers
            </button>
          </div>

          {/* Color Mode */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
            <span className="text-[10px] text-slate-400 uppercase font-bold px-1.5">Color:</span>
            <button
              onClick={() => setColorMode('type')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                colorMode === 'type' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Type
            </button>
            <button
              onClick={() => setColorMode('org')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                colorMode === 'org' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Agency
            </button>
            <button
              onClick={() => setColorMode('legal')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                colorMode === 'legal' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Legal
            </button>
          </div>

          {/* Pathfinder Mode Toggle */}
          <button
            onClick={() => setIsPathfinderMode((v) => !v)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
              isPathfinderMode
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Pathfinder</span>
          </button>

          {/* Physics Drawer Toggle */}
          <button
            onClick={() => setShowPhysicsPanel((v) => !v)}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              showPhysicsPanel ? 'bg-cyan-950 text-cyan-300 border border-cyan-600' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
            title="Adjust layout physics"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Physics</span>
          </button>
        </div>
      </div>

      {/* Pathfinder Toolbar Panel */}
      <AnimatePresence>
        {isPathfinderMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-950/40 border border-amber-600/60 rounded-xl p-3 my-3 text-xs font-mono space-y-2 overflow-hidden"
          >
            <div className="flex items-center justify-between text-amber-300 font-bold border-b border-amber-800/60 pb-2">
              <span className="flex items-center gap-1.5">
                <Workflow className="w-4 h-4 text-amber-400" />
                <span>Shortest Relational Link Finder (BFS Path Tracer)</span>
              </span>
              <button onClick={() => setIsPathfinderMode(false)} className="text-amber-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] text-amber-200 uppercase font-bold block mb-1">Source Node:</label>
                <select
                  value={pathSourceId}
                  onChange={(e) => setPathSourceId(e.target.value)}
                  className="w-full bg-slate-900 border border-amber-700/80 text-amber-100 p-1.5 rounded-lg focus:outline-none"
                >
                  <option value="">-- Select Source Node --</option>
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      [{n.type.toUpperCase()}] {n.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-amber-200 uppercase font-bold block mb-1">Target Node:</label>
                <select
                  value={pathTargetId}
                  onChange={(e) => setPathTargetId(e.target.value)}
                  className="w-full bg-slate-900 border border-amber-700/80 text-amber-100 p-1.5 rounded-lg focus:outline-none"
                >
                  <option value="">-- Select Target Node --</option>
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      [{n.type.toUpperCase()}] {n.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {pathfinderNodesSet && (
              <div className="text-[11px] text-emerald-300 pt-2 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Path Found! ({pathfinderNodesSet.size} connected nodes highlighted in gold).
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Physics Sliders Drawer */}
      <AnimatePresence>
        {showPhysicsPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900/90 border border-cyan-900/80 rounded-xl p-3 my-3 text-xs font-mono space-y-3 overflow-hidden"
          >
            <div className="flex items-center justify-between text-cyan-300 font-bold border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Simulation Physics Parameters</span>
              </span>
              <button onClick={() => setShowPhysicsPanel(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center justify-between text-slate-300 mb-1">
                  <span>Charge Repulsion ({chargeStrength}):</span>
                  <span className="text-[10px] text-slate-500">More Negative = Spread Out</span>
                </label>
                <input
                  type="range"
                  min="-1000"
                  max="-100"
                  step="20"
                  value={chargeStrength}
                  onChange={(e) => setChargeStrength(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-slate-300 mb-1">
                  <span>Link Elastic Distance ({linkDistance}px):</span>
                  <span className="text-[10px] text-slate-500">Length Between Nodes</span>
                </label>
                <input
                  type="range"
                  min="40"
                  max="220"
                  step="5"
                  value={linkDistance}
                  onChange={(e) => setLinkDistance(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Node Jump-To Search Bar */}
      <div className="relative my-3">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={nodeSearch}
            onChange={(e) => {
              setNodeSearch(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="Search & jump directly to any node (e.g. APT41, MSS, i-SOON, Healthcare)..."
            className="w-full bg-slate-900 border border-cyan-800/80 rounded-xl pl-9 pr-24 py-2 text-xs font-mono text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          {nodeSearch && (
            <button
              onClick={() => {
                setNodeSearch('');
                setShowSearchResults(false);
              }}
              className="absolute right-3 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-cyan-800 rounded-xl shadow-2xl z-30 font-mono text-xs overflow-hidden">
            {searchSuggestions.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  zoomToNode(n);
                  setShowSearchResults(false);
                }}
                className="px-4 py-2.5 hover:bg-slate-800 border-b border-slate-800/60 last:border-0 cursor-pointer flex items-center justify-between text-slate-200 hover:text-cyan-300"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: n.color }} />
                  <span className="font-bold">{n.label}</span>
                  <span className="text-[10px] text-slate-400">({n.subtitle})</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Jump To Node
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Canvas & Inspector Drawer Container */}
      <div
        className="relative bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden min-h-[620px] flex"
        ref={containerRef}
      >
        {/* SVG Network Canvas */}
        <div className="flex-1 relative">
          <svg ref={svgRef} className="w-full h-[620px] bg-slate-950 cursor-grab active:cursor-grabbing block" />

          {/* Floating Zoom & Canvas Controls */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl shadow-xl backdrop-blur-md z-10">
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-800" />
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Export Action Controls */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={handleExportStixBundle}
              className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-emerald-700/80 text-emerald-300 font-mono font-bold text-xs rounded-xl transition-all shadow-xl backdrop-blur-md flex items-center gap-1.5 cursor-pointer"
              title="Export STIX 2.1 Relationship Bundle"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>STIX 2.1 JSON</span>
            </button>

            <button
              onClick={handleExportSvg}
              className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-cyan-700/80 text-cyan-300 font-mono font-bold text-xs rounded-xl transition-all shadow-xl backdrop-blur-md flex items-center gap-1.5 cursor-pointer"
              title="Export Vector Graphic SVG"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>SVG Graphic</span>
            </button>
          </div>

          {/* Hover Floating Tooltip */}
          {hoveredNode && tooltipPos && (
            <div
              style={{
                left: `${tooltipPos.x + 15}px`,
                top: `${tooltipPos.y - 10}px`,
              }}
              className="absolute pointer-events-none z-30 bg-slate-900/95 border border-cyan-500/60 p-3 rounded-xl shadow-2xl backdrop-blur-md max-w-xs font-mono text-xs space-y-1 transform -translate-y-1/2"
            >
              <div className="flex items-center gap-1.5 font-bold text-white">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: hoveredNode.color }} />
                <span>{hoveredNode.label}</span>
              </div>
              <div className="text-[11px] text-cyan-300">{hoveredNode.subtitle}</div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                <span>Relational Degrees:</span>
                <span className="font-bold text-white">{hoveredNode.connectionsCount} link(s)</span>
              </div>
            </div>
          )}

          {/* Legend Overlay */}
          <div className="absolute top-4 left-4 bg-slate-900/80 border border-slate-800 p-3 rounded-xl backdrop-blur-md text-[11px] font-mono space-y-2 z-10 pointer-events-none hidden sm:block">
            <div className="text-slate-400 font-bold uppercase text-[10px] mb-1">Color Scheme Legend</div>
            {colorMode === 'type' ? (
              <>
                <div className="flex items-center gap-2 text-cyan-300">
                  <span className="w-3 h-3 rounded-full bg-cyan-400" />
                  <span>APT Group</span>
                </div>
                <div className="flex items-center gap-2 text-purple-300">
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>Sponsoring Authority</span>
                </div>
                <div className="flex items-center gap-2 text-amber-300">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>Front Company</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Targeted Sector</span>
                </div>
              </>
            ) : colorMode === 'org' ? (
              <>
                <div className="flex items-center gap-2 text-indigo-300">
                  <span className="w-3 h-3 rounded-full bg-indigo-400" />
                  <span>MSS (State Security)</span>
                </div>
                <div className="flex items-center gap-2 text-rose-300">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span>PLA (Military Intelligence)</span>
                </div>
                <div className="flex items-center gap-2 text-amber-300">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span>MPS (Public Security)</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-red-300">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span>DOJ Indicted</span>
                </div>
                <div className="flex items-center gap-2 text-orange-300">
                  <span className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>Treasury Sanctioned</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-300">
                  <span className="w-3 h-3 rounded-full bg-cyan-400" />
                  <span>Active Defense</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Inspector Drawer */}
        <AnimatePresence>
          {selectedNodeDetails && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-80 sm:w-96 bg-slate-900 border-l border-cyan-900/80 p-5 shadow-2xl flex flex-col justify-between z-20 shrink-0 overflow-y-auto"
            >
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase"
                      style={{
                        borderColor: selectedNodeDetails.node.color,
                        color: selectedNodeDetails.node.color,
                        backgroundColor: `${selectedNodeDetails.node.color}15`,
                      }}
                    >
                      {TYPE_LABELS[selectedNodeDetails.node.type]}
                    </span>
                    <h4 className="text-lg font-mono font-bold text-white mt-1.5 flex items-center gap-2">
                      <span>{selectedNodeDetails.node.label}</span>
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedNodeDetails.node.subtitle}</p>
                  </div>

                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* APT Specific Details */}
                {selectedNodeDetails.node.aptGroup && (
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-cyan-900/60 space-y-2 text-xs font-mono">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Dossier Overview</div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Microsoft Taxonomy:</span>
                      <span className="text-cyan-300 font-bold">
                        {selectedNodeDetails.node.aptGroup.microsoftTaxonomy}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span
                        className={`font-bold ${
                          selectedNodeDetails.node.aptGroup.currentStatus === 'Active'
                            ? 'text-emerald-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {selectedNodeDetails.node.aptGroup.currentStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Legal Category:</span>
                      <span className="text-amber-400 font-bold">
                        {selectedNodeDetails.node.aptGroup.legalCategory}
                      </span>
                    </div>
                  </div>
                )}

                {/* Direct Connections List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                    <span>Direct Relational Links ({selectedNodeDetails.connectedCount})</span>
                  </div>

                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {selectedNodeDetails.neighbors.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedNode(item.node)}
                        className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-700/60 transition-all cursor-pointer flex items-center justify-between text-xs font-mono group"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.node.color }} />
                          <div className="truncate">
                            <div className="text-white group-hover:text-cyan-300 font-bold truncate">
                              {item.node.label}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">{item.label}</div>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              {selectedNodeDetails.node.aptGroup && (
                <div className="pt-4 border-t border-slate-800">
                  <button
                    onClick={() => {
                      if (selectedNodeDetails.node.aptGroup) {
                        onSelectApt(selectedNodeDetails.node.aptGroup);
                      }
                    }}
                    className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>View Full APT Dossier</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info Bar */}
      <div className="mt-3 pt-3 border-t border-slate-900 text-xs font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>
            Drag nodes to pin locations or click any node to trace connected command lines and targeted sectors.
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          {stats.totalNodes} Nodes &bull; {stats.totalLinks} Relational Edges
        </div>
      </div>
    </div>
  );
};
