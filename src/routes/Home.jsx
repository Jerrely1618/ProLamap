import { useState, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import RoadMap from "../components/RoadMap";

export default function Home() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [width, setWidth] = useState(40);
  const dragRef = useRef(null);
  const isDragging = useRef(false);
  const widthRef = useRef(width);

  const handleMouseMove = (event) => {
    if (isDragging.current) {
      const newWidth = (event.clientX / window.innerWidth) * 100;
      widthRef.current = Math.max(40, Math.min(90, newWidth));
      dragRef.current.style.width = `${widthRef.current}%`;
    }
  };

  const handleMouseUp = () => {
    if (isDragging.current) {
      isDragging.current = false;
      setWidth(widthRef.current);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
  };

  const handleMouseDown = () => {
    isDragging.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    setWidth(isExpanded ? 40 : 100);
  };

  const handleHide = () => {
    setIsHidden(true);
  };

  return (
    <div className="flex h-screen">
      {!isHidden && (
        <div
          ref={dragRef}
          className={`bg-gray-200 p-4 shadow-lg`}
          style={{ width: `${width}%` }}
        >
          <div className="flex justify-between m-1 items-start">
            <h2 className="text-2xl font-semibold">Welcome</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleExpand}
                className="bg-black text-white p-2 rounded"
              >
                {isExpanded ? (
                  <ArrowLeftIcon className="h-5 w-5" />
                ) : (
                  <ArrowRightIcon className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={handleHide}
                className="bg-black text-white p-2 rounded"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {!isHidden && (
        <div
          className="w-1.5 bg-black cursor-col-resize"
          onMouseDown={handleMouseDown}
          style={{ height: "100vh", position: "relative" }}
        />
      )}

      <div className={`flex-grow transition-all duration-300 flex flex-col`}>
        <h1
          className={`text-2xl mb-2 font-bold ${isHidden ? "ml-20" : "ml-5"}`}
        >
          Roadmap
        </h1>

        <div className="flex-grow flex items-center justify-center overflow-hidden">
          <RoadMap />
        </div>
      </div>

      {isHidden && (
        <button
          onClick={() => setIsHidden(false)}
          className="absolute top-4 left-4 bg-black text-white p-2 rounded"
        >
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
