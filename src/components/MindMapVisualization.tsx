'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { MindMapNode } from '@/types/mindmap';
import { Button } from './ui/button';
import { Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MindMapVisualizationProps {
  data: MindMapNode;
  width?: number;
  height?: number;
}

interface D3Node extends d3.HierarchyNode<MindMapNode> {
  x0?: number;
  y0?: number;
  _children?: D3Node[];
}

const MindMapVisualization: React.FC<MindMapVisualizationProps> = ({
  data,
  width = 1000,
  height = 600
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  
  useEffect(() => {
    if (!svgRef.current || !data) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const g = svg.append("g");

    // Setup zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior);

    // Create tree layout
    const tree = d3.tree<MindMapNode>()
      .size([width - 200, height - 200])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    // Process data
    const root = d3.hierarchy(data) as D3Node;
    root.x0 = width / 2;
    root.y0 = 0;

    // Color scale for different levels
    const colorScale = d3.scaleOrdinal<number, string>()
      .domain([0, 1, 2, 3, 4])
      .range(['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444']);

    function update(source: D3Node) {
      const treeData = tree(root);
      const nodes = treeData.descendants() as D3Node[];
      const links = treeData.descendants().slice(1);

      // Normalize for fixed-depth
      nodes.forEach(d => {
        d.y = d.depth * 180;
      });

      // Update nodes
      const node = g.selectAll('g.node')
        .data(nodes, (d: any) => d.id || (d.id = ++i));

      // Enter new nodes
      const nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${source.x0},${source.y0})`)
        .on('click', click);

      // Add circles for nodes
      nodeEnter.append('circle')
        .attr('class', 'node-circle')
        .attr('r', 1e-6)
        .style('fill', d => d._children ? colorScale(d.depth) : '#fff')
        .style('stroke', d => colorScale(d.depth))
        .style('stroke-width', '3px')
        .style('cursor', 'pointer');

      // Add labels
      nodeEnter.append('text')
        .attr('class', 'node-text')
        .attr('dy', '.35em')
        .attr('x', d => d.children || d._children ? -13 : 13)
        .style('text-anchor', d => d.children || d._children ? 'end' : 'start')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .style('fill', '#374151')
        .text(d => d.data.label);

      // Transition nodes to their new position
      const nodeUpdate = nodeEnter.merge(node as any);

      nodeUpdate.transition()
        .duration(750)
        .attr('transform', d => `translate(${d.x},${d.y})`);

      nodeUpdate.select('circle')
        .attr('r', 10)
        .style('fill', d => d._children ? colorScale(d.depth) : '#fff');

      // Remove exiting nodes
      const nodeExit = node.exit().transition()
        .duration(750)
        .attr('transform', d => `translate(${source.x},${source.y})`)
        .remove();

      nodeExit.select('circle').attr('r', 1e-6);
      nodeExit.select('text').style('fill-opacity', 1e-6);

      // Update links
      const link = g.selectAll('path.link')
        .data(links, (d: any) => d.id);

      const linkEnter = link.enter().insert('path', 'g')
        .attr('class', 'link')
        .style('fill', 'none')
        .style('stroke', '#ccc')
        .style('stroke-width', '2px')
        .attr('d', d => {
          const o = { x: source.x0, y: source.y0 };
          return diagonal(o, o);
        });

      const linkUpdate = linkEnter.merge(link as any);

      linkUpdate.transition()
        .duration(750)
        .attr('d', d => diagonal(d, d.parent));

      link.exit().transition()
        .duration(750)
        .attr('d', d => {
          const o = { x: source.x, y: source.y };
          return diagonal(o, o);
        })
        .remove();

      // Store old positions
      nodes.forEach(d => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    // Diagonal path generator
    function diagonal(s: any, d: any) {
      return `M ${s.x} ${s.y}
              C ${(s.x + d.x) / 2} ${s.y},
                ${(s.x + d.x) / 2} ${d.y},
                ${d.x} ${d.y}`;
    }

    // Toggle children on click
    function click(event: any, d: D3Node) {
      if (d.children) {
        d._children = d.children;
        d.children = undefined;
      } else {
        d.children = d._children;
        d._children = undefined;
      }
      update(d);
    }

    let i = 0;
    update(root);

    // Center the visualization
    svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(100, height / 2));

  }, [data, width, height]);

  const handleExport = () => {
    if (!svgRef.current) return;
    
    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = 'mindmap.svg';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
      1.2
    );
  };

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
      0.8
    );
  };

  const handleReset = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().transform as any,
      d3.zoomIdentity.translate(100, height / 2)
    );
  };

  return (
    <div className="relative w-full h-full border rounded-lg bg-white">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomIn}
          className="bg-white"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomOut}
          className="bg-white"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReset}
          className="bg-white"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          onClick={handleExport}
          className="bg-primary text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          تصدير
        </Button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 z-10 bg-black/80 text-white px-2 py-1 rounded text-sm">
        {Math.round(zoom * 100)}%
      </div>

      {/* SVG Container */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full"
      />
    </div>
  );
};

export default MindMapVisualization;