"use client";
import React, { useRef, useEffect, useCallback, useReducer, lazy } from "react";
import { useTheme } from "next-themes";
import PropTypes from "prop-types";
import {
  ArrowsPointingInIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Select from "react-select";
const Welcome = lazy(() => import("./components/Welcome"));
const RoadMap = lazy(() => import("./components/RoadMap"));
import { Button, Switch, Tooltip } from "antd";
import { useExpanded } from "./providers/ExpansionProvider";
const languages = [
  { value: "python", label: "Python" },
  {
    value: "coming-soon",
    label: "More Coming Soon",
    percentage: 0,
    isDisabled: true,
  },
];
const initialState = {
  isDraggable: true,
  showSettings: false,
  eliminateLanguage: "python",
  confirmDelete: "",
  returnToCenter: false,
  selectedOption: {},
  options: [],
  windowWidth: 0,
  screenWidth: 0,
  change: false,
  progressBarWidth: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_STATE":
      return { ...state, ...action.payload };
    case "SET_OPTIONS":
      return { ...state, options: action.payload };
    case "SET_SELECTED_OPTION":
      return { ...state, selectedOption: action.payload };
    default:
      return state;
  }
}

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { theme } = useTheme();
  const { expanded, setExpanded } = useExpanded();
  const {
    isDraggable,
    showSettings,
    eliminateLanguage,
    confirmDelete,
    returnToCenter,
    selectedOption,
    options,
    windowWidth,
    screenWidth,
    change,
    progressBarWidth,
  } = state;

  const isDragging = useRef(false);
  const settingsRef = useRef(null);

  useEffect(() => {
    const initialProgress = languages.map((option) => ({
      ...option,
      progress: getProgressFromLocalStorage(option.value),
    }));
    dispatch({ type: "SET_OPTIONS", payload: initialProgress });

    const lastSelected = JSON.parse(localStorage.getItem("lastSelectedOption"));
    if (lastSelected) {
      dispatch({ type: "SET_SELECTED_OPTION", payload: lastSelected });
    } else if (initialProgress.length > 0) {
      dispatch({ type: "SET_SELECTED_OPTION", payload: initialProgress[0] });
    }
  }, [change]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setScreenWidth(window.screen.width);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (selectedOption) {
      const selectedProgress = getProgressFromLocalStorage(
        selectedOption.value
      );
      dispatch({
        type: "SET_STATE",
        payload: { progressBarWidth: selectedProgress },
      });
    }
  }, [selectedOption]);

  useEffect(() => {
    const lastSelected = JSON.parse(localStorage.getItem("lastSelectedOption"));
    if (lastSelected) {
      dispatch({ type: "SET_SELECTED_OPTION", payload: lastSelected });
    } else if (options.length > 0) {
      dispatch({ type: "SET_SELECTED_OPTION", payload: options[0] });
    }
  }, [options]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const setScreenWidth = (value) =>
    dispatch({ type: "SET_STATE", payload: { screenWidth: value } });
  const setWindowWidth = (value) =>
    dispatch({ type: "SET_STATE", payload: { windowWidth: value } });
  const setIsDraggable = (value) =>
    dispatch({ type: "SET_STATE", payload: { isDraggable: value } });
  const setShowSettings = (value) =>
    dispatch({ type: "SET_STATE", payload: { showSettings: value } });
  const setEliminateLanguage = (value) =>
    dispatch({ type: "SET_STATE", payload: { eliminateLanguage: value } });
  const setSelectedTopic = (value) =>
    dispatch({ type: "SET_STATE", payload: { selectedTopic: value } });
  const setConfirmDelete = (value) =>
    dispatch({ type: "SET_STATE", payload: { confirmDelete: value } });
  const setReturnToCenter = (value) =>
    dispatch({ type: "SET_STATE", payload: { returnToCenter: value } });

  const getProgressFromLocalStorage = (value) => {
    const storedOptions = JSON.parse(localStorage.getItem("completed")) || {};
    return storedOptions[value]?.progress || 0;
  };

  const handleMouseMove = (event) => {
    if (isDragging.current) {
      handleDrag(event.clientX);
    }
  };

  const handleTouchMove = (event) => {
    if (isDragging.current) {
      const touch = event.touches[0];
      handleDrag(touch.clientX);
    }
  };

  const handleDrag = useCallback((clientX) => {
    const newWidth = (clientX / window.innerWidth) * 100;

    if (newWidth >= 35 && newWidth <= 100) {
      setExpanded(newWidth);
    }
  }, []);

  const handleClickOutside = (event) => {
    if (settingsRef.current && !settingsRef.current.contains(event.target)) {
      setShowSettings(false);
      setConfirmDelete("");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setShowSettings(false);
      setConfirmDelete("");
    }
  };

  const handleMouseUp = () => {
    if (isDragging.current) {
      isDragging.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleMouseUp);
    }
  };

  const handleMouseDown = () => {
    isDragging.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleMouseUp);
  };

  const handleTouchStart = () => {
    isDragging.current = true;
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleMouseUp);
  };



  const handleOptionChange = (option) => {
    dispatch({ type: "SET_SELECTED_OPTION", payload: option });
  };

  const handleDeleteLanguage = (language) => {
    dispatch({
      type: "SET_STATE",
      payload: { confirmDelete: "lang", eliminateLanguage: language },
    });
  };

  const handleConfirmDelete = () => {
    dispatch({
      type: "SET_STATE",
      payload: { change: !change, confirmDelete: "" },
    });
    const completed = JSON.parse(localStorage.getItem("completed")) || {};
    delete completed[eliminateLanguage];
    localStorage.setItem("completed", JSON.stringify(completed));
  };

  const handleCancelDelete = () => {
    dispatch({ type: "SET_STATE", payload: { confirmDelete: "" } });
  };

  const handleDeleteAllProgress = () => {
    dispatch({ type: "SET_STATE", payload: { confirmDelete: "all" } });
  };

  const handleComfirmDeleteAllProgress = () => {
    dispatch({
      type: "SET_STATE",
      payload: { change: !change, confirmDelete: "" },
    });
    localStorage.removeItem("completed");
    localStorage.removeItem("lastSelectedOption");
  };

  const handleCancelDeleteAllProgress = () => {
    dispatch({ type: "SET_STATE", payload: { confirmDelete: "" } });
  };

  return (
    <div className="flex h-screen transition-all overflow-hidden duration-300">

      {expanded <= 100 && (
        <div
          className={`flex flex-col flex-grow h-full transition-width transition-colors duration-300 shadow-glassy backdrop-blur-md bg-opacity-glass ${
            theme === "dark" ? "bg-dark-gradient" : "bg-light-gradient"
          }`}
          style={{ width: `${expanded}%` }}
        >
          <div className="flex-grow flex flex-col-reverse md:flex-col h-full w-full">
            <Welcome/>
          </div>
        </div>
      )}
      {expanded < 100 && (
        <Separation
          handleMouseDown={handleMouseDown}
          handleTouchStart={handleTouchStart}
        />
      )}
      {expanded <= 100 && (
        <div
          className={`flex flex-col flex-grow overflow-hidden transition-all transition-colors duration-300 ${
            theme === "dark"
              ? "bg-dark-background text-dark-text1"
              : "bg-light-background text-light-text1"
          }`}
          style={{
            width: `${100 - expanded}%`,
            backgroundImage: `
        linear-gradient(90deg, ${
          theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
        } 1px, transparent 1px),
        linear-gradient(180deg, ${
          theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
        } 1px, transparent 1px)
      `,
            backgroundSize: "20px 20px",
            position: "relative",
          }}
        >
          <div className="flex z-10 items-center justify-between  p-3 mx-5 sm:mx-2 md:mx-4 lg:mx-5">
            <Tooltip title="Settings" placement="top">
              <button
                aria-label="Settings"
                onClick={() => setShowSettings(true)}
                className={`p-2 rounded z-10 absolute top-[25px] left-[5px] bg-redSpecial text-white`}
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </button>
            </Tooltip>
            {selectedOption && (
              <div className="flex items-center justify-center z-10 mx-5 w-full sm:mx-2">
                {screenWidth > 0 &&
                (windowWidth / screenWidth) * 100 > 50 &&
                expanded < 70 ? (
                  <div
                    className={`relative flex-grow h-4 rounded  mx-2 ${
                      theme === "dark"
                        ? "bg-light-background border-light-background"
                        : "bg-third-background border-dark-background"
                    }`}
                  >
                    <div
                      id="progress-bar"
                      className={`absolute h-full rounded bg-green-500`}
                      style={{ width: `${progressBarWidth}%` }}
                    />
                  </div>
                ) : (
                  <p
                    className={`text-right font-bold text-3xl bg-red ${
                      theme === "dark"
                        ? "text-light-background"
                        : "text-dark-background"
                    }`}
                  >{`${Math.round(progressBarWidth)}%`}</p>
                )}
              </div>
            )}

            <div className="flex flex-col items-center">
              <Selection
                selectedOption={selectedOption}
                setSelectedOption={handleOptionChange}
                options={options}
              />
            </div>
          </div>

          <div className="flex items-center h-full justify-center transition-colors duration-300 max-w-full">
            <RoadMap
              width={100 - expanded}
              change={change}
              isDraggable={isDraggable}
              setSelectedTopic={setSelectedTopic}
              selectedCourse={selectedOption}
              returnToCenter={returnToCenter}
            />
          </div>

          <Tooltip title="Center Roadmap" placement="top">
            <button
              aria-label="Center Roadmap"
              onClick={setReturnToCenter}
              className={`p-2 rounded absolute  bottom-[14px] left-5 ${
                theme === "dark"
                  ? "bg-dark-secondary text-dark-background"
                  : "bg-light-text1  text-light-secondary"
              }  ${expanded === 0 ? "left-[60px] bottom-4 " : ""}`}
            >
              <ArrowsPointingInIcon className="h-5 w-5" />
            </button>
          </Tooltip>
          <h1
            className={`text-2xl my-1 absolute bottom-[17px] right-10 ${
              theme === "dark" ? "text-dark-secondary" : "text-light-secondary"
            } body`}
          >
            Re
          </h1>
        </div>
      )}
      {expanded === 0 && (
        <button
          aria-label="Show"
          onClick={() => setExpanded(40)}
          className={`absolute bottom-5 left-4 p-2 rounded ${
            theme === "dark"
                  ? "bg-dark-secondary text-dark-background"
                  : "bg-light-text1  text-light-secondary"
          }`}
        >
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      )}
      {showSettings && (
        <div className="absolute inset-0 flex items-center  justify-center backdrop-blur-md bg-white/30 dark:bg-gray-800/70 z-50">
          <div
            ref={settingsRef}
            className="bg-white dark:bg-gray-800 border min-h-[365px] rounded shadow-lg p-6 w-96"
          >
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl body-bold text-light-background`}>
                Settings
              </h2>

              <button
                aria-label="Close"
                onClick={() => setShowSettings(false)}
                className={`p-2 rounded bg-redSpecial hover:bg-red-700 ${
                  theme === "dark"
                    ? " text-light-background"
                    : "text-light-text1"
                }`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div
              className={`${
                confirmDelete ? "my-24 justify-center items-center" : ""
              }`}
            >
              {confirmDelete ? (
                <div className="flex flex-col justify-center items-center mt-5">
                  <p className="text-white text-2xl ">Are you sure?</p>
                  <div className="mt-3 flex space-x-4">
                    <Button
                      aria-label="Yes"
                      className="bg-red-700 text-white"
                      type="primary"
                      onClick={
                        confirmDelete === "lang"
                          ? handleConfirmDelete
                          : handleComfirmDeleteAllProgress
                      }
                    >
                      Yes
                    </Button>
                    <Button
                      onClick={
                        confirmDelete === "lang"
                          ? handleCancelDelete
                          : handleCancelDeleteAllProgress
                      }
                      aria-label="No"
                    >
                      No
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col mt-4">
                    <label className="flex items-center justify-between mt-4">
                      <span
                        className={`body-bold text-lg text-light-background`}
                      >
                        Draggable
                      </span>
                      <Switch
                        checked={isDraggable}
                        onChange={(checked) => setIsDraggable(checked)}
                      />
                    </label>
                    <div className="mt-28 flex items-center justify-between">
                      <select
                        onChange={(e) => setEliminateLanguage(e.target.value)}
                        className="border rounded-md text-xl flex-grow py-1 px-2 mr-2"
                      >
                        {languages.map(
                          (lang) =>
                            lang.label !== "More Coming Soon" && (
                              <option key={lang.value} value={lang.value}>
                                {lang.label}
                              </option>
                            )
                        )}
                      </select>
                      <button
                        aria-label="Delete"
                        onClick={() => handleDeleteLanguage(eliminateLanguage)}
                        className="bg-redSpecial text-lg body-bold text-white rounded-lg p-2 hover:bg-red-700"
                      >
                        Delete Progress
                      </button>
                    </div>
                    <button
                      aria-label="Delete All"
                      onClick={handleDeleteAllProgress}
                      className="bg-redSpecial text-lg body-bold text-white mt-2 rounded-lg p-2 hover:bg-red-700"
                    >
                      Delete All Progress
                    </button>
                  </div>
                  <Tooltip title="Info" placement="bottom">
                    <div className="flex  justify-center pt-3 ">
                      <InformationCircleIcon className="text-white h-7 w-7" />
                    </div>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
const Separation = React.memo(function Separation({
  handleMouseDown,
  handleTouchStart,
}) {
  const { theme } = useTheme();
  return (
    <div
      className={`cursor-col-resize h-screen relative px-2 transition-colors duration-300 
          ${theme === "dark" ? "bg-dark-background" : "bg-light-background"}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
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
});

const Selection = React.memo(function Selection({
  selectedOption,
  setSelectedOption,
  options,
}) {
  const { theme } = useTheme();
  const selectStyles = {
    control: (provided) => ({
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
      color: theme === "dark" ? "#e2eff1" : "#1a202c",
    }),
    indicatorSeparator: () => null,
    dropdownIndicator: (provided) => ({
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
  };

  const Option = React.memo(function Option({ innerProps, isFocused, data }) {
    return (
      <div
        {...innerProps}
        className={`p-2 cursor-pointer font-bold ${
          isFocused
            ? "bg-gray-200 text-light-text1"
            : theme === "dark"
            ? "bg-light-background text-light-text1"
            : "bg-dark-background text-light-background"
        }`}
      >
        {data.label}
        {data.label !== "More Coming Soon" && (
          <div className="w-full h-1 mt-1 bg-gray-300">
            <div
              className={"h-full bg-dark-secondary rounded"}
              style={{ width: ` ${data.percentage}% ` }}
            />
          </div>
        )}
      </div>
    );
  });

  return (
    <div>
      <label htmlFor="select-language" className="font-bold text-sm">
        Select language
      </label>
      <Select
        id="select-option"
        options={options}
        className="w-48 rounded"
        placeholder="Select..."
        value={selectedOption}
        onChange={setSelectedOption}
        styles={selectStyles}
        components={{ Option }}
      />
    </div>
  );
});

Separation.propTypes = {
  handleMouseDown: PropTypes.func.isRequired,
  handleTouchStart: PropTypes.func.isRequired,
};
Selection.propTypes = {
  selectedOption: PropTypes.object.isRequired,
  setSelectedOption: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  innerProps: PropTypes.object,
  isFocused: PropTypes.bool,
  data: PropTypes.shape({
    label: PropTypes.string,
    percentage: PropTypes.number,
  }),
};
