import { useState, useRef, useEffect } from "react";
import { MoonIcon, SunIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import RoadMap from "../components/RoadMap";
import Select from "react-select";

export default function Home() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [width, setWidth] = useState(40);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const dragRef = useRef(null);
  const isDragging = useRef(false);
  const widthRef = useRef(width);
  const [selectedOption, setSelectedOption] = useState({
    value: "python",
    label: "Python",
    percentage: 70,
  });

  const options = [
    { value: "python", label: "Python", percentage: 70 },
    { value: "java", label: "Java", percentage: 20 },
    {
      value: "coming-soon",
      label: "Coming Soon",
      percentage: 0,
      isDisabled: true,
    },
  ];
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
  const toggleTheme = () => {
    setIsDarkTheme((prev) => {
      const newTheme = !prev;
      document.documentElement.classList.toggle("dark", newTheme);
      return newTheme;
    });
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

  useEffect(() => {
    const handleResize = () => {
      setWidth((prevWidth) => Math.max(40, Math.min(90, prevWidth)));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {!isHidden && (
        <div
          ref={dragRef}
          className={`p-3.5 shadow-lg flex flex-col justify-between ${
            isDarkTheme ? "bg-dark-background" : "bg-light-background"
          }`}
          style={{ width: `${width}%`, height: "100vh" }}
        >
          <h2
            className={`text-2xl font-bold mb-1.5 ${
              isDarkTheme ? "text-dark-text1" : "text-light-text1"
            }`}
          >
            Welcome
          </h2>

          <div className="flex-grow p-4">
            <p
              className={`${
                isDarkTheme ? "text-dark-text1" : "text-light-text1"
              }`}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
              lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod
              malesuada. Nulla facilisi. Pellentesque habitant morbi tristique
              senectus et netus et malesuada fames ac turpis egestas.
            </p>
            <p
              className={`${
                isDarkTheme ? "text-dark-text1" : "text-light-text1"
              }`}
            >
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur.
            </p>
          </div>

          <div className="flex justify-end space-x-2 mb-1">
            <button
              onClick={handleExpand}
              className={`p-2 rounded ${
                isDarkTheme
                  ? "bg-dark.secondary text-dark-text1"
                  : "bg-light.secondary text-light-text1"
              }`}
            >
              {isExpanded ? (
                <ArrowLeftIcon className="h-5 w-5" />
              ) : (
                <ArrowRightIcon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={handleHide}
              className={`p-2 rounded ${
                isDarkTheme
                  ? "bg-dark.secondary text-dark-text1"
                  : "bg-light.secondary text-light-text1"
              }`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded ${
                isDarkTheme
                  ? "bg-dark.secondary text-dark-text1"
                  : "bg-light.secondary text-light-text1"
              }`}
            >
              {isDarkTheme ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      )}

      {!isHidden && !isExpanded && (
        <div
          className={`cursor-col-resize h-screen relative 
      ${
        isDarkTheme
          ? "border-l-light-background border-r-light-background"
          : "border-l-dark-background border-r-dark-background"
      } 
      border-l-[4.5px] border-r-[4.5px]`}
          onMouseDown={handleMouseDown}
        >
          <svg
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            width="20"
            height="20"
            viewBox="0 0 30 60"
          >
            <circle cx="15" cy="10" r="5" fill="gray" />
            <circle cx="15" cy="30" r="5" fill="gray" />
            <circle cx="15" cy="50" r="5" fill="gray" />
          </svg>
        </div>
      )}

      {!isExpanded && (
        <div
          className={`flex-grow transition-all duration-300 flex flex-col ${
            isDarkTheme
              ? "bg-dark-background text-dark-text1"
              : "bg-light-background text-light-text1"
          }`}
          style={{
            backgroundImage: `
        linear-gradient(90deg, ${
          isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
        } 1px, transparent 1px),
        linear-gradient(180deg, ${
          isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
        } 1px, transparent 1px)
      `,
            backgroundSize: "20px 20px",
          }}
        >
          <div className="flex justify-between">
            <h1 className="text-2xl my-1.5 py-3.5 ml-5">ProlaMap</h1>

            <div className="flex flex-col items-center mt-4 mx-5 rounded">
              <Select
                options={options}
                className={`w-48 rounded bg-transparent ${
                  isDarkTheme ? "text-dark-text1" : "text-light-text1"
                }`}
                placeholder="Select..."
                value={selectedOption}
                onChange={(option) => setSelectedOption(option)}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    cursor: "pointer",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    display: "flex",
                    justifyContent: "space-between",
                  }),
                  indicatorSeparator: () => null,
                  dropdownIndicator: (provided, state) => ({
                    ...provided,
                    transition: "opacity 0.2s ease",
                    opacity: state.isFocused ? 1 : 0,
                    "&:hover": {
                      opacity: 1,
                    },
                  }),
                  menu: (provided) => ({
                    ...provided,
                    marginTop: 0,
                    marginBottom: 0,
                    borderBottomLeftRadius: "8px",
                    borderBottomRightRadius: "8px",
                    borderTopRadius: "0px",
                    overflow: "hidden",
                  }),
                  menuList: (provided) => ({
                    ...provided,
                    paddingTop: 0,
                    paddingBottom: 0,
                  }),
                }}
                components={{
                  Option: (props) => (
                    <div
                      {...props.innerProps}
                      className={`p-2  cursor-pointer font-bold ${
                        props.isFocused
                          ? "bg-gray-200 text-black"
                          : isDarkTheme
                          ? "bg-light-background text-light-text1"
                          : " bg-dark-background text-dark-text1"
                      }`}
                    >
                      {props.data.label}
                      <div className="w-full h-1 mt-1 bg-gray-300">
                        <div
                          className="h-full bg-blue-500 rounded"
                          style={{ width: `${props.data.percentage}%` }}
                        />
                      </div>
                    </div>
                  ),
                }}
              />

              {selectedOption && (
                <div className="w-full mt-4">
                  <div className="relative h-2 bg-gray-300 rounded">
                    <div
                      id="progress-bar"
                      className="absolute h-full bg-blue-500 rounded"
                      style={{ width: `${selectedOption.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-center">
                    {selectedOption.percentage}%
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex-grow flex items-center justify-center overflow-hidden">
            <RoadMap isDarkTheme={isDarkTheme} />
          </div>
        </div>
      )}

      {isHidden && (
        <button
          onClick={() => setIsHidden(false)}
          className="absolute bottom-4 left-4 bg-black text-white p-2 rounded"
        >
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
