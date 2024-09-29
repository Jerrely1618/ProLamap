import { useState, useRef, useEffect } from "react";
import { MoonIcon, SunIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import RoadMap from "../components/RoadMap";
import Select from "react-select";
import Welcome from "../components/Welcome";
import Content from "../components/Content";

export default function Home() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [width, setWidth] = useState(40);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const dragRef = useRef(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const isDragging = useRef(false);
  const widthRef = useRef(width);
  const [selectedTopic, setSelectedTopic] = useState();
  const [selectedOption, setSelectedOption] = useState({
    value: "python",
    label: "Python",
    percentage: 70,
  });
  const options = [
    { value: "python", label: "Python", percentage: 70 },
    { value: "java", label: "Java", percentage: 20 },
    { value: "javascript", label: "JavaScript", percentage: 60 },
    { value: "csharp", label: "C#", percentage: 30 },
    { value: "ruby", label: "Ruby", percentage: 40 },
    { value: "typescript", label: "TypeScript", percentage: 50 },
    { value: "go", label: "Go", percentage: 25 },
    { value: "rust", label: "Rust", percentage: 15 },
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
    setIsExpanded(false);
  };
  const handleOptionChange = (option) => {
    setSelectedOption(option);
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
          {showWelcome ? (
            <Welcome isDarkTheme={isDarkTheme} options={options} />
          ) : (
            <Content
              isDarkTheme={isDarkTheme}
              selectedTopic={selectedTopic}
              selectedCourse={selectedOption}
            />
          )}
          <Buttons
            handleExpand={handleExpand}
            isExpanded={isExpanded}
            isDarkTheme={isDarkTheme}
            handleHide={handleHide}
            toggleTheme={toggleTheme}
          />
        </div>
      )}

      {!isHidden && !isExpanded && (
        <Separation
          isDarkTheme={isDarkTheme}
          handleMouseDown={handleMouseDown}
        />
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
            position: "relative",
          }}
        >
          <div className="flex items-center justify-between p-3 mx-5">
            {selectedOption && (
              <div className="flex items-center mx-5 w-full">
                <div
                  className={`relative flex-grow h-4 rounded border-2 mx-2 ${
                    isDarkTheme
                      ? "bg-dark-background border-light-background"
                      : "bg-light-background border-dark-background"
                  }`}
                >
                  <div
                    id="progress-bar"
                    className={`absolute h-full rounded ${
                      isDarkTheme ? "bg-light-background" : "bg-dark-background"
                    }`}
                    style={{ width: `${selectedOption.percentage}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col items-center">
              <Selection
                selectedOption={selectedOption}
                setSelectedOption={handleOptionChange}
                isDarkTheme={isDarkTheme}
                options={options}
              />
            </div>
          </div>

          <div className="flex-grow flex items-center justify-center overflow-hidden">
            <RoadMap
              isDarkTheme={isDarkTheme}
              setShowWelcome={setShowWelcome}
              setSelectedTopic={setSelectedTopic}
            />
          </div>

          <h1
            className={`text-2xl my-1 absolute bottom-5 right-5 ${
              isDarkTheme ? "text-dark-text1" : "text-dark-background"
            } body`}
          >
            ProlaMap
          </h1>
        </div>
      )}

      {isHidden && (
        <button
          onClick={() => setIsHidden(false)}
          className={`absolute bottom-4 left-4 p-2 rounded ${
            isDarkTheme
              ? "bg-dark-secondary text-dark-background"
              : "bg-light-secondary text-light-text1"
          }`}
        >
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

function Buttons({
  handleExpand,
  isExpanded,
  isDarkTheme,
  handleHide,
  toggleTheme,
}) {
  return (
    <div className="flex justify-end space-x-2 mb-1">
      <button
        onClick={handleExpand}
        className={`p-2 rounded ${
          isDarkTheme
            ? "bg-dark-secondary text-dark-background"
            : "bg-light-secondary text-light-text1"
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
            ? "bg-dark-secondary text-dark-background"
            : "bg-light-secondary text-light-text1"
        }`}
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
      <button
        onClick={toggleTheme}
        className={`p-2 rounded ${
          isDarkTheme
            ? "bg-dark-secondary text-dark-background"
            : "bg-light-secondary text-light-text1"
        }`}
      >
        {isDarkTheme ? (
          <SunIcon className="h-5 w-5" />
        ) : (
          <MoonIcon className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
function Separation({ isDarkTheme, handleMouseDown }) {
  return (
    <div
      className={`cursor-col-resize h-screen relative px-2
          ${isDarkTheme ? "bg-dark-background" : "bg-light-background"} `}
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
  );
}
function Selection({
  selectedOption,
  setSelectedOption,
  isDarkTheme,
  options,
}) {
  return (
    <Select
      options={options}
      className={`w-48 rounded`}
      placeholder="Select..."
      value={selectedOption}
      onChange={(option) => setSelectedOption(option)}
      styles={{
        control: (provided, state) => ({
          ...provided,
          backgroundColor: "transparent",
          cursor: "pointer",
          border: "none",
          boxShadow: "none",
        }),
        singleValue: (provided) => ({
          ...provided,
          display: "flex",
          justifyContent: "space-between",
          fontSize: "1.5rem",
          margin: "0rem",
          padding: "0rem",
          fontWeight: "bold",
          color: isDarkTheme ? "#e2eff1" : "#1a202c",
        }),
        indicatorSeparator: () => null,
        dropdownIndicator: (provided, state) => ({
          ...provided,
        }),
        menu: (provided) => ({
          ...provided,
          backgroundColor: "transparent",
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
          backgroundColor: "transparent",
        }),
      }}
      components={{
        Option: (props) => (
          <div
            {...props.innerProps}
            className={`p-2 cursor-pointer font-bold ${
              props.isFocused
                ? "bg-gray-200 text-light-text1"
                : isDarkTheme
                ? "bg-light-background text-light-text1"
                : " bg-dark-background text-light-background"
            }`}
          >
            {props.data.label}
            <div className="w-full h-1 mt-1 bg-gray-300">
              <div
                className={`h-full bg-dark-secondary rounded `}
                style={{ width: `${props.data.percentage}%` }}
              />
            </div>
          </div>
        ),
      }}
    />
  );
}
