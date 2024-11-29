import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useExpanded } from "../providers/ExpansionProvider";

const randomFloat = (min, max) => Math.random() * (max - min) + min;

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

const RoadMapBubble = React.memo(function RoadMapBubble({
  text,
  isHoveringRoadmap,
  subtopics,
  handleTopicClick,
  selectedCourse,
  change,
}) {
  const [hovered, setHovered] = useState(false);
  const { theme } = useTheme();
  const [completedSubtopics, setCompletedSubtopics] = useState([]);

  const updateCompletedSubtopics = useCallback(() => {
    const completedFromStorage =
      JSON.parse(localStorage.getItem("completed") || "{}")?.[
        selectedCourse.value
      ]?.[text] || [];
    setCompletedSubtopics(completedFromStorage);
  }, [selectedCourse.value, text]);

  useEffect(() => {
    updateCompletedSubtopics();
  }, [updateCompletedSubtopics, change]);

  const allCompleted = useMemo(
    () =>
      Object.keys(subtopics).every((subtopic) =>
        completedSubtopics.includes(subtopic)
      ),
    [subtopics, completedSubtopics]
  );

  const handleHoverStart = () => setHovered(true);
  const handleHoverEnd = () => setHovered(false);

  const subtopicKeys = useMemo(() => Object.keys(subtopics), [subtopics]);

  return (
    <motion.button
      aria-label={text}
      className={`w-32 py-1.5 my-2 mx-2 rounded-xl body-bold shadow-md transition font-semibold items-center justify-center text-xl
        ${
          allCompleted
            ? "text-white bg-green-500"
            : theme === "dark"
            ? "bg-light-background text-dark-background"
            : "bg-third-background text-light-background"
        }
      `}
      animate={{
        x: hovered || !isHoveringRoadmap ? 0 : randomFloat(-7, 7),
        y: hovered || !isHoveringRoadmap ? 0 : randomFloat(-7, 7),
      }}
      transition={{
        x: { repeat: Infinity, duration: randomFloat(0.5, 1), ease: "linear" },
        y: { repeat: Infinity, duration: randomFloat(0.5, 1), ease: "linear" },
      }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      whileHover={{
        scale: 1.15,
        transition: { duration: 0.05, ease: "linear" },
      }}
      onClick={() => handleTopicClick(text, false)}
    >
      {text}
      <div className="flex flex-wrap px-5 mt-0.5 items-center justify-center">
        {subtopicKeys.length > 0 &&
          subtopicKeys.map((subtopic) => (
            <div
              key={subtopic}
              className={`w-3 h-3 rounded-full mx-0.5 my-0.5 ${
                completedSubtopics.includes(subtopic)
                  ? "bg-green-700"
                  : "bg-gray-400"
              }`}
            />
          ))}
      </div>
    </motion.button>
  );
});

const RoadMap = ({
  returnToCenter,
  isDraggable,
  selectedCourse,
  change,
}) => {
  const router = useRouter();
  const [scale, setScale] = useState(1.1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [topics, setTopics] = useState([]);
  const panStart = useRef({ x: 0, y: 0 });
  const [isHoveringRoadmap, setIsHoveringRoadmap] = useState(false);
  const lastTouchY = useRef(0);
  const lastTouchX = useRef(0);
  const [levels, setLevels] = useState({});
  const lastDistance = useRef(0);
  const {expanded, setExpanded} = useExpanded();
  const updateScale = useCallback(() => {
    const widthPercentage = (window.innerWidth / window.screen.width) * 100;
    const heightPercentage = (window.innerHeight / window.screen.height) * 100;

    const roadmapScale = Math.min(
      widthPercentage / 75,
      heightPercentage / 110,
      expanded / 75
    );
    setScale(Math.max(0.2, Math.min(1.1, roadmapScale)));
  }, [expanded]);
  const handleTopicClick = (text) => {
    router.push(`/content/${text}`);
  };

  useEffect(() => {
    updateScale();
    const handleResize = () => {
      clearTimeout(window.resizeTimeout);
      window.resizeTimeout = setTimeout(updateScale, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [updateScale]);

  useEffect(() => {
    if (returnToCenter) {
      updateScale();
      setTranslate({
        x:
          (window.innerWidth * scale) / 2 -
          containerRef.current.offsetWidth / 1.75,
        y: window.innerHeight / 2 - containerRef.current.offsetHeight / 2,
      });
    }
  }, [returnToCenter]);

  useEffect(() => {
    const fetchContentData = async () => {
      try {
        const response = await fetch("/topics.json");
        const data = await response.json();
        if (selectedCourse.value) {
          const levelsData = getLevels(data[selectedCourse.value]);
          setLevels(levelsData);
        }
      } catch (error) {
        console.error("Error fetching content data:", error);
      }
      try {
        const response = await fetch("/contents.json");
        const data = await response.json();
        if (selectedCourse.value) {
          setTopics(data[selectedCourse.value]);
        }
      } catch (error) {
        console.error("Error fetching topic data:", error);
      }
    };

    fetchContentData();
  }, [selectedCourse]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const zoomAmount = e.deltaY * -0.001;
    setScale((prevScale) => Math.max(0.2, Math.min(2, prevScale + zoomAmount)));
  }, []);

  const handleTouchStart = (e) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      lastDistance.current = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
    } else if (e.touches.length === 1 && isDraggable) {
      setIsPanning(true);
      lastTouchX.current = e.touches[0].clientX - translate.x;
      lastTouchY.current = e.touches[0].clientY - translate.y;
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();

    if (e.touches.length === 2) {
      const currentDistance = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
      const zoomAmount = (currentDistance - lastDistance.current) * 0.002;
      setScale((prevScale) =>
        Math.max(0.2, Math.min(2, prevScale + zoomAmount))
      );
      lastDistance.current = currentDistance;
    } else if (e.touches.length === 1 && isDraggable && isPanning) {
      setTranslate({
        x: e.touches[0].clientX - lastTouchX.current,
        y: e.touches[0].clientY - lastTouchY.current,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    lastDistance.current = 0;
  };

  const handleMouseDown = (e) => {
    if (isDraggable) {
      setIsPanning(true);
      panStart.current = {
        x: e.clientX - translate.x,
        y: e.clientY - translate.y,
      };
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleMouseMove = useCallback(
    (e) => {
      if (isPanning && isDraggable) {
        setTranslate({
          x: e.clientX - panStart.current.x,
          y: e.clientY - panStart.current.y,
        });
      }
    },
    [isPanning, isDraggable]
  );

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <div
        className={`w-full h-full items-center justify-center ${
          isDraggable ? "cursor-grab" : ""
        }`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => (setIsPanning(false), setIsHoveringRoadmap(false))}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsHoveringRoadmap(true)}
        ref={containerRef}
      >
        <motion.div
          className="grid grid-cols-1 gap-4"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          }}
        >
          {Object.entries(levels).map(([level, nodes]) => (
            <div key={level} className="flex flex-row justify-center">
              {nodes.map((node, index) => (
                <div
                  key={node}
                  className={`flex-shrink-0 ${index > 0 ? "ml-2" : ""}`}
                >
                  <RoadMapBubble
                    text={node}
                    isHoveringRoadmap={isHoveringRoadmap}
                    handleTopicClick={handleTopicClick}
                    subtopics={topics[node] || {}}
                    selectedCourse={selectedCourse}
                    change={change}
                  />
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

RoadMapBubble.propTypes = {
  text: PropTypes.string.isRequired,
  isHoveringRoadmap: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  subtopics: PropTypes.object.isRequired,
  selectedCourse: PropTypes.object.isRequired,
  change: PropTypes.any.isRequired,
};

RoadMap.propTypes = {
  setSelectedTopic: PropTypes.func.isRequired,
  returnToCenter: PropTypes.bool.isRequired,
  isDraggable: PropTypes.bool.isRequired,
  selectedCourse: PropTypes.object.isRequired,
  change: PropTypes.any.isRequired,
};

export default RoadMap;
