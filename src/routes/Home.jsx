import { useState, useRef, useEffect } from "react";
import {
  Cog6ToothIcon,
  EyeIcon,
  HomeIcon,
  InformationCircleIcon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import RoadMap from "../components/RoadMap";
import Select from "react-select";
import Welcome from "../components/Welcome";
import Content from "../components/Content";
import { Switch, Tooltip } from "antd";
const languages = [
  { value: "python", label: "Python" },
  {
    value: "coming-soon",
    label: "Coming Soon",
    percentage: 0,
    isDisabled: true,
  },
];
export default function Home() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [width, setWidth] = useState(40);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const dragRef = useRef(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isDraggable, setIsDraggable] = useState(true);
  const [selectedSubtopic, setSelectedSubtopic] = useState();
  const [showSettings, setShowSettings] = useState(false);
  const [isMediaOnly, setIsMediaOnly] = useState(false);
  const isDragging = useRef(false);
  const settingsRef = useRef(null);
  const widthRef = useRef(width);
  const [selectedTopic, setSelectedTopic] = useState();
  const [selectedOption, setSelectedOpt] = useState({});
  const [options, setOptions] = useState([]);
  const [change, setChange] = useState(false);
  const setAllOptionsInLocalStorage = (options) => {
    localStorage.setItem("languageProgress", JSON.stringify(options));
  };

  const getProgressFromLocalStorage = (value) => {
    const storedOptions =
      JSON.parse(localStorage.getItem("languageProgress")) || [];
    const option = storedOptions.find((option) => option.value === value);
    return option ? option.progress : 0;
  };
  useEffect(() => {
    const initialProgress = languages.map((option) => ({
      ...option,
      progress: getProgressFromLocalStorage(option.value),
    }));
    setOptions(initialProgress);
  }, []);

  useEffect(() => {
    if (options.length > 0) {
      setSelectedOption(options[0]);
    }
  }, [options]);
  const setSelectedOption = (option) => {
    setSelectedOpt(option);
    const updatedOptions = options.map((opt) =>
      opt.value === option.value ? { ...opt, progress: opt.progress } : opt
    );
    setAllOptionsInLocalStorage(updatedOptions);
  };

  useEffect(() => {
    const lastSelected = JSON.parse(localStorage.getItem("lastSelectedOption"));
    if (lastSelected) {
      setSelectedOption(lastSelected);
    } else if (options.length > 0) {
      setSelectedOption(options[0]);
    }
  }, [options]);
  const handleMouseMove = (event) => {
    if (isDragging.current) {
      const newWidth = (event.clientX / window.innerWidth) * 100;
      widthRef.current = Math.max(40, Math.min(90, newWidth));
      dragRef.current.style.width = `${widthRef.current}%`;
    }
  };
  const handleClickOutside = (event) => {
    if (settingsRef.current && !settingsRef.current.contains(event.target)) {
      setShowSettings(false);
    }
  };
  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setShowSettings(false);
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
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <div className="flex h-screen transition-colors overflow-hidden duration-300">
      {!isHidden && (
        <div
          ref={dragRef}
          className={`pb-3.5 pl-3.5 transition-colors duration-300 shadow-lg flex flex-col justify-between ${
            isDarkTheme ? "bg-dark-background" : "bg-light-background"
          }`}
          style={{ width: `${width}%`, height: "100vh" }}
        >
          {showWelcome ? (
            <Welcome
              isDarkTheme={isDarkTheme}
              options={options}
              setSelectedSubtopic={setSelectedSubtopic}
              setShowWelcome={setShowWelcome}
              setSelectedTopic={setSelectedTopic}
            />
          ) : (
            <div className="overflow-y-auto h-[calc(100vh-60px)] pr-2 scrollbar-left">
              <Content
                isDarkTheme={isDarkTheme}
                selectedTopic={selectedTopic}
                selectedCourse={selectedOption}
                isMediaOnly={isMediaOnly}
                setChange={setChange}
              />
            </div>
          )}
          <Buttons
            handleExpand={handleExpand}
            isExpanded={isExpanded}
            isDarkTheme={isDarkTheme}
            handleHide={handleHide}
            toggleTheme={toggleTheme}
            setShowWelcome={setShowWelcome}
            showWelcome={showWelcome}
            setIsMediaOnly={setIsMediaOnly}
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
          className={`flex-grow transition-all transition-colors duration-300  flex flex-col ${
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

          <div className="flex-grow flex items-center justify-center transition-colors duration-300 overflow-hidden">
            <RoadMap
              change={change}
              isDraggable={isDraggable}
              isDarkTheme={isDarkTheme}
              setShowWelcome={setShowWelcome}
              setSelectedTopic={setSelectedTopic}
              selectedCourse={selectedOption}
            />
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className={`p-2 rounded absolute bottom-5 left-5 ${
              isDarkTheme
                ? "bg-dark-secondary text-dark-background"
                : "bg-light-secondary text-light-text1"
            } ${isHidden ? "left-16 bottom-4 " : ""}`}
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
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
          className={`absolute bottom-5 left-4 p-2 rounded ${
            isDarkTheme
              ? "bg-dark-secondary text-dark-background"
              : "bg-light-secondary text-light-text1"
          }`}
        >
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      )}
      {showSettings && (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-md bg-white/30 dark:bg-gray-800/70 z-50">
          <div
            ref={settingsRef}
            className="bg-white dark:bg-gray-800 border rounded shadow-lg p-6 w-96"
          >
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl body-bold text-light-background`}>
                Settings
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className={`p-2 rounded ${
                  isDarkTheme
                    ? "bg-dark-secondary text-dark-background"
                    : "bg-light-secondary text-light-text1"
                }`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col space-y-2 mt-2">
              <label className="flex items-center mt-4 px-5 justify-between">
                <span className={` body-bold text-lg  text-light-background`}>
                  Draggable
                </span>
                <Switch
                  checked={isDraggable}
                  onChange={(checked) => setIsDraggable(checked)}
                />
              </label>
              <div className="align-right pt-10">
                <InformationCircleIcon className="text-white h-7 w-7" />
              </div>
            </div>
          </div>
        </div>
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
  setShowWelcome,
  showWelcome,
  setIsMediaOnly,
}) {
  const toggleSettings = () => {
    setIsMediaOnly((prev) => !prev);
  };

  return (
    <div className="flex justify-between my-1 mt-3">
      <div className="flex space-x-2">
        <Tooltip title="Exit" placement="top">
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
        </Tooltip>
        {!showWelcome && (
          <Tooltip title="Home" placement="top">
            <button
              onClick={setShowWelcome}
              className={`p-2 rounded ${
                isDarkTheme
                  ? "bg-dark-secondary text-dark-background"
                  : "bg-light-secondary text-light-text1"
              }`}
            >
              <HomeIcon className="h-5 w-5" />
            </button>
          </Tooltip>
        )}

        <Tooltip title="Theme Toggle" placement="top">
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
        </Tooltip>
      </div>

      <div className="flex space-x-2">
        {!showWelcome && (
          <Tooltip title="Media-Only" placement="top">
            <button
              onClick={toggleSettings}
              className={`p-2 rounded ${
                isDarkTheme
                  ? "bg-dark-secondary text-dark-background"
                  : "bg-light-secondary text-light-text1"
              }`}
            >
              <EyeIcon className="h-5 w-5" />
            </button>
          </Tooltip>
        )}
        <Tooltip title="Expand" placement="top">
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
        </Tooltip>
      </div>
    </div>
  );
}
function Separation({ isDarkTheme, handleMouseDown }) {
  return (
    <div
      className={`cursor-col-resize h-screen relative px-2 transition-colors duration-300 
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
