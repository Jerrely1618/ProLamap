import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  HomeIcon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { Tooltip } from "antd";
import { useRouter } from "next/navigation";
import PropTypes from "prop-types";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  Suspense,
} from "react";
import { ThreeDots } from "react-loader-spinner";
import AdVertical from "./AdVertical";
import AdHorizontal from "./AdHorizontal";

const BigContent = React.lazy(() => import("./BigContent"));
const SmallContent = React.lazy(() => import("./SmallContent"));

const InnerContent = React.memo(function InnerContent({
  isDarkTheme,
  selectedCourse,
  isMediaOnly,
  selectedTopic,
  selectedSubtopic,
  setChange,
  isExpanded,
  handleHide,
  toggleTheme,
  width,
  handleExpand,
  setIsMediaOnly,
}) {
  const [contentData, setContentData] = useState(null);
  const [selectedStep, setSelectedStep] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchContentData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/contents.json");
      const data = await response.json();
      setContentData(data);
    } catch (error) {
      console.error("Error fetching content data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContentData();
  }, [fetchContentData]);

  const toggleCompletion = useCallback(() => {
    const courseData = JSON.parse(localStorage.getItem("completed") || "{}");

    if (!courseData[selectedCourse.value]) {
      courseData[selectedCourse.value] = {};
    }

    const completedSubtopics = new Set(
      courseData[selectedCourse.value][selectedTopic] || []
    );

    if (isCompleted) {
      completedSubtopics.delete(selectedStep);
    } else {
      completedSubtopics.add(selectedStep);
    }

    courseData[selectedCourse.value][selectedTopic] =
      Array.from(completedSubtopics);
    localStorage.setItem("completed", JSON.stringify(courseData));
    setIsCompleted((prev) => !prev);
    setChange((prev) => !prev);
    updateProgress(courseData);
  }, [
    selectedCourse.value,
    selectedTopic,
    selectedStep,
    isCompleted,
    setChange,
  ]);

  const updateProgress = useCallback(
    (courseData) => {
      const completedSubtopics = Object.values(courseData[selectedCourse.value])
        .flat()
        .filter((item) => typeof item === "string");

      const totalSubtopics = Object.keys(
        contentData[selectedCourse.value] || {}
      )
        .filter((topic) => topic !== "color")
        .reduce(
          (total, topic) =>
            total +
            Object.keys(contentData[selectedCourse.value][topic]).length,
          0
        );

      console.log(
        completedSubtopics.length,
        completedSubtopics,
        totalSubtopics
      );

      const progress =
        totalSubtopics > 0
          ? (completedSubtopics.length / totalSubtopics) * 100
          : 0;

      courseData[selectedCourse.value].progress = progress;

      localStorage.setItem("completed", JSON.stringify(courseData));
    },
    [contentData, selectedCourse.value]
  );

  useEffect(() => {
    const courseData = JSON.parse(localStorage.getItem("completed") || "{}");
    const completedSubtopics = new Set(
      courseData[selectedCourse.value]?.[selectedTopic] || []
    );
    setIsCompleted(completedSubtopics.has(selectedStep));
  }, [selectedCourse.value, selectedTopic, selectedStep]);

  const topicData = useMemo(
    () => contentData?.[selectedCourse.value]?.[selectedTopic] || {},
    [contentData, selectedCourse.value, selectedTopic]
  );

  const steps = useMemo(() => {
    return selectedSubtopic
      ? Object.keys(topicData[selectedSubtopic] || {})
      : Object.keys(topicData);
  }, [selectedSubtopic, topicData]);

  useEffect(() => {
    if (steps.length > 0) setSelectedStep(steps[0]);
  }, [steps]);

  if (loading) {
    return (
      <div className="flex flex-col w-full min-w-0 text-2xl items-center justify-center h-screen">
        <ThreeDots
          height="80"
          width="80"
          color={"#2E073F"}
          ariaLabel="loading"
          visible={true}
        />
      </div>
    );
  }

  return (
    <>
      <Buttons
        handleExpand={handleExpand}
        isExpanded={isExpanded}
        isDarkTheme={isDarkTheme}
        handleHide={handleHide}
        toggleTheme={toggleTheme}
        setIsMediaOnly={setIsMediaOnly}
        isMediaOnly={isMediaOnly}
      />
      <Suspense
        fallback={
          <div
            className={` flex flex-col w-full min-w-0 text-2xl items-center justify-center h-screen ${
              isDarkTheme ? "bg-dark-background" : "bg-light-background"
            }`}
          >
            <ThreeDots
              height="80"
              width="80"
              color={"#2E073F"}
              ariaLabel="loading"
              visible={true}
            />
          </div>
        }
      >
        {window.innerWidth < 768 || width < 40 ? (
          <SmallContent
            toggleCompletion={toggleCompletion}
            isDarkTheme={isDarkTheme}
            selectedStep={selectedStep}
            setSelectedStep={setSelectedStep}
            isCompleted={isCompleted}
            contentData={contentData}
            selectedCourse={selectedCourse}
            isMediaOnly={isMediaOnly}
            selectedTopic={selectedTopic}
            isExpanded={isExpanded}
            handleHide={handleHide}
            width={width}
            toggleTheme={toggleTheme}
            setIsMediaOnly={setIsMediaOnly}
          />
        ) : (
          <div className="grid grid-cols-6">
            <div className="text-white col-span-1">
              <AdVertical />
            </div>
            <div className="col-span-4">
              <BigContent
                isDarkTheme={isDarkTheme}
                selectedStep={selectedStep}
                selectedCourse={selectedCourse}
                setSelectedStep={setSelectedStep}
                selectedTopic={selectedTopic}
                isMediaOnly={isMediaOnly}
                contentData={contentData}
                isCompleted={isCompleted}
                toggleCompletion={toggleCompletion}
              />
            </div>
            <div className="text-white col-span-1">
              <AdVertical />
            </div>
          </div>
        )}
        <AdHorizontal />
      </Suspense>
    </>
  );
});

function Buttons({
  handleExpand,
  isExpanded,
  isDarkTheme,
  handleHide,
  toggleTheme,
  setIsMediaOnly,
  isMediaOnly,
}) {
  const router = useRouter();
  const toggleSettings = useCallback(() => {
    setIsMediaOnly((prev) => !prev);
  }, [setIsMediaOnly]);

  const handleHomeClick = useCallback(() => {
    router.push(`/`);
  }, []);

  return (
    <div
      className={`flex justify-between p-4 ${
        isDarkTheme ? "bg-dark-background" : "bg-light-background"
      }`}
    >
      <div className="flex space-x-2">
        <Tooltip title="Exit" placement="top">
          <button
            aria-label="Exit"
            onClick={handleHide}
            className={`p-2 rounded transition-colors duration-300 bg-redSpecial text-white hover:bg-red-700`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </Tooltip>
        <Tooltip title="Home" placement="top">
          <button
            aria-label="Home"
            onClick={handleHomeClick}
            className={`p-2 rounded transition-color duration-300 ${
              isDarkTheme
                ? "bg-dark-secondary text-dark-background hover:bg-third-primary hover:text-white"
                : "bg-light-text1  text-light-secondary hover:bg-blue-500 hover:text-white"
            }`}
          >
            <HomeIcon className="h-5 w-5" />
          </button>
        </Tooltip>

        <Tooltip title="Theme Toggle" placement="top">
          <button
            aria-label="Theme Toggle"
            onClick={toggleTheme}
            className={`p-2 rounded transition-color duration-300 ${
              isDarkTheme
                ? "bg-dark-secondary text-dark-background hover:text-white"
                : "bg-light-text1  text-light-secondary hover:text-dark-background"
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

      <div className="flex space-x-2 relative">
        <Tooltip title="Media-Only" placement="top">
          <button
            aria-label="Media-Only"
            onClick={toggleSettings}
            className={`p-2 rounded transition-colors duration-300 hover:bg-blue-600 hover:text-white ${
              isMediaOnly
                ? "bg-blue-600 text-white "
                : isDarkTheme
                ? "bg-dark-secondary text-dark-background "
                : "bg-light-text1 text-light-secondary"
            }`}
          >
            <EyeIcon className="h-5 w-5" />
          </button>
        </Tooltip>
        <div className="absolute top-11 z-20 flex w-full flex-col -rotate-[32deg] items-center">
          <ArrowTrendingUpIcon
            className={`${
              isDarkTheme ? "text-white" : "text-dark-background"
            } h-5 w-5 w-full transform -rotate-[60deg]`}
          />
          <span
            className={`text-center text-sm toon m-0  w-full leading-tight ${
              isDarkTheme ? "text-white" : "text-dark-background"
            }`}
          >
            Only code!
          </span>
        </div>
        <Tooltip title="Expand" placement="top">
          <button
            aria-label="Expand"
            onClick={handleExpand}
            className={`p-2 rounded transition-color duration-300 ${
              isDarkTheme
                ? "bg-dark-secondary text-dark-background hover:bg-third-primary hover:text-white"
                : "bg-light-text1  text-light-secondary hover:bg-blue-500 hover:text-white"
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

InnerContent.propTypes = {
  isDarkTheme: PropTypes.bool.isRequired,
  selectedCourse: PropTypes.object.isRequired,
  selectedTopic: PropTypes.string.isRequired,
  selectedSubtopic: PropTypes.string,
  setChange: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  handleHide: PropTypes.func.isRequired,
  toggleTheme: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
  handleExpand: PropTypes.func.isRequired,
  setIsMediaOnly: PropTypes.func.isRequired,
  isMediaOnly: PropTypes.bool.isRequired,
};

export default InnerContent;
