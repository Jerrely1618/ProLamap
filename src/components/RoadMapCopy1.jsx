import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";

const roadmapData = {
  PEP8: [],
  Variables: ["Functions", "Arrays", "Binary"],
  Functions: ["Lambda", "Classes"],
  Arrays: ["Tuples", "Strings", "Stacks", "Sorting"],
  Classes: ["Sets", "Optional", "Dictionaries", "Heaps"],
  Sets: ["Algorithms"],
  Optional: ["Algorithms"],
  Dictionaries: ["Algorithms"],
  Heaps: ["Algorithms"],
  Algorithms: ["Sorting", "Recursion", "Graphs"],
  Sorting: ["Merge", "Quick"],
  Merge: ["Binary Search"],
  Quick: ["Binary Search"],
  Recursion: ["DFS/BFS"],
  Graphs: ["DFS/BFS"],
};

function buildNodesAndEdges(data) {
  const nodes = [];
  const edges = [];
  let id = 0;
  const createdNodes = new Set();

  const createNode = (label, level) => {
    if (!createdNodes.has(label)) {
      nodes.push({
        id: `${id++}`,
        label,
        level,
      });
      createdNodes.add(label);
    }
  };

  const processNode = (node, level) => {
    const children = data[node] || [];
    createNode(node, level);

    children.forEach((child) => {
      processNode(child, level + 1);
      edges.push({
        source: node,
        target: child,
      });
    });
  };

  Object.keys(data).forEach((node) => {
    if (!Object.values(data).flat().includes(node)) {
      processNode(node, 0);
    }
  });

  // Set positions for nodes
  const nodeWidth = 100;
  const verticalSpacing = 75;

  const levelPositions = {};
  nodes.forEach((node) => {
    if (!levelPositions[node.level]) {
      levelPositions[node.level] = [];
    }
    levelPositions[node.level].push(node);
  });

  Object.keys(levelPositions).forEach((level) => {
    const levelNodes = levelPositions[level];
    const totalWidth = (nodeWidth + 150) * levelNodes.length;
    const startX = -totalWidth / 2 + nodeWidth / 2;
    levelNodes.forEach((node, index) => {
      node.x = startX + index * (nodeWidth + 150);
      node.y = level * verticalSpacing + verticalSpacing / 2;
    });
  });

  return { nodes, edges };
}

const { nodes, edges } = buildNodesAndEdges(roadmapData);

export default function RoadMap() {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3
      .select(svgRef.current)
      .attr("width", "100%")
      .attr("height", "100%");

    svg.selectAll("*").remove();

    const edgeOffsets = {}; // To track the number of edges between two nodes

    edges.forEach(({ source, target }) => {
      const sourceNode = nodes.find((node) => node.label === source);
      const targetNode = nodes.find((node) => node.label === target);

      const key = `${source}-${target}`;
      const index = edgeOffsets[key] || 0;
      edgeOffsets[key] = index + 1;

      const offsetY = index * 10; // Adjust for spacing

      svg
        .append("line")
        .attr("x1", sourceNode.x)
        .attr("y1", sourceNode.y + offsetY)
        .attr("x2", targetNode.x)
        .attr("y2", targetNode.y + offsetY)
        .attr("stroke", "black")
        .attr("stroke-width", 2);
    });

    const nodeWidth = 100;
    const nodeHeight = 40;

    svg
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("rect")
      .attr("class", "node")
      .attr("x", (d) => d.x - nodeWidth / 2)
      .attr("y", (d) => d.y - nodeHeight / 2)
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("fill", "#777")
      .attr("stroke", "#000");

    svg
      .selectAll(".label")
      .data(nodes)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .text((d) => d.label);
  }, []);

  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const roadmapRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomAmount = e.deltaY * -0.001;
    setScale((prevScale) => Math.max(0.5, Math.min(2, prevScale + zoomAmount)));
  };

  const handleMouseDown = (e) => {
    setIsPanning(true);
    panStart.current = {
      x: e.clientX - translate.x,
      y: e.clientY - translate.y,
    };
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setTranslate({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y,
      });
    }
  };

  return (
    <div className="w-full h-full">
      <div
        ref={roadmapRef}
        className="w-full h-full cursor-grab"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          viewBox={`-${translate.x / scale} -${translate.y / scale} ${
            window.innerWidth / scale
          } ${window.innerHeight / scale}`}
          style={{ background: "transparent", width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
