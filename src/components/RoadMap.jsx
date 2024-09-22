import React, { useState, useRef, useEffect } from "react";
import { Row, Col } from "antd";

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

const getLevels = (data) => {
  const levels = {};
  const nodeLevels = {};

  const findLevel = (node, level) => {
    if (!nodeLevels[node]) {
      nodeLevels[node] = level;
      if (!levels[level]) levels[level] = [];
      levels[level].push(node);
    }

    if (data[node]) {
      data[node].forEach((child) => findLevel(child, level + 1));
    }
  };

  Object.keys(data).forEach((node) => {
    if (Object.values(data).every((children) => !children.includes(node))) {
      findLevel(node, 0);
    }
  });

  return levels;
};

const RoadMapBubble = ({ text }) => (
  <button className="bg-gray-500 text-white w-28 py-1.5 my-2 rounded-xl shadow-md transition">
    {text}
  </button>
);

const Arrow = ({ from, to }) => (
  <svg
    style={{
      position: "absolute",
      top: from.y,
      left: from.x,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
    }}
    viewBox="0 0 100 100"
  >
    <line
      x1={from.x + 50}
      y1={from.y + 50}
      x2={to.x + 50}
      y2={to.y}
      stroke="black"
      strokeWidth="2"
    />
    <polygon
      points={`${to.x + 50},${to.y} ${to.x + 45},${to.y + 5} ${to.x + 55},${
        to.y + 5
      }`}
      fill="black"
    />
  </svg>
);

const RoadMap = () => {
  const levels = getLevels(roadmapData);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({
    x: 0,
    y: window.innerHeight / 4,
  });
  const roadmapRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const nodeRefs = useRef({});

  useEffect(() => {
    // Clear refs on unmount
    return () => {
      nodeRefs.current = {};
    };
  }, []);

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

  const handleMouseUp = () => setIsPanning(false);

  const handleMouseMove = (e) => {
    if (isPanning) {
      setTranslate({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y,
      });
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        ref={roadmapRef}
        className="w-full h-full cursor-grab flex flex-col items-center"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transition: isPanning ? "none" : "transform 0.2s ease",
        }}
      >
        <div className="relative">
          {Object.keys(levels).map((level) => (
            <Row key={level} justify="center" gutter={[24, 5]}>
              {levels[level].map((node, index) => {
                const nodeRef = React.createRef();
                nodeRefs.current[node] = nodeRef;

                const hasParent = Object.values(roadmapData).some((children) =>
                  children.includes(node)
                );
                const hasChildren = roadmapData[node]?.length > 0;

                return (
                  <Col
                    key={node}
                    span={4}
                    style={{ margin: "0 12px", position: "relative" }}
                    ref={nodeRef}
                  >
                    {/* Draw arrow to parent if exists */}
                    {hasParent && index > 0 && (
                      <Arrow
                        from={{
                          x:
                            nodeRefs.current[
                              Object.keys(roadmapData).find((key) =>
                                roadmapData[key].includes(node)
                              )
                            ]?.current?.offsetLeft || 0,
                          y:
                            nodeRefs.current[
                              Object.keys(roadmapData).find((key) =>
                                roadmapData[key].includes(node)
                              )
                            ]?.current?.offsetTop || 0,
                        }}
                        to={{
                          x: nodeRef.current.offsetLeft,
                          y: nodeRef.current.offsetTop,
                        }}
                      />
                    )}
                    {/* Draw arrow to children if exists */}
                    {hasChildren && (
                      <Arrow
                        from={{
                          x: nodeRef.current.offsetLeft,
                          y:
                            nodeRef.current.offsetTop +
                            nodeRef.current.offsetHeight,
                        }}
                        to={{
                          x: nodeRef.current.offsetLeft + 25,
                          y:
                            nodeRef.current.offsetTop +
                            nodeRef.current.offsetHeight +
                            20,
                        }}
                      />
                    )}
                    <RoadMapBubble text={node} />
                  </Col>
                );
              })}
            </Row>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoadMap;
