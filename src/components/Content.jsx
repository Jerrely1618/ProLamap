import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  Bars4Icon,
  CheckIcon,
  EyeIcon,
  HomeIcon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { Tooltip } from 'antd';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ThreeDots } from 'react-loader-spinner';
import ContentForStep from './ContentStep';

const Content = React.memo(function Content({
  isDarkTheme,
  selectedCourse,
  isMediaOnly,
  selectedTopic,
  selectedSubtopic,
  setChange,
  isExpanded,
  handleHide,
  toggleTheme,
  setShowWelcome,
  showWelcome,
  width,
  handleExpand,
  setIsMediaOnly,
}) {
  const [contentData, setContentData] = useState(null);
  const [selectedStep, setSelectedStep] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  const toggleCompletion = useCallback(() => {
    const courseData = JSON.parse(localStorage.getItem('completed') || '{}');

    if (!courseData[selectedCourse.value]) {
      courseData[selectedCourse.value] = {};
    }

    if (!courseData[selectedCourse.value][selectedTopic]) {
      courseData[selectedCourse.value][selectedTopic] = [];
    }

    let completedSubtopics = new Set(
      courseData[selectedCourse.value][selectedTopic]
    );
    if (isCompleted) {
      completedSubtopics.delete(selectedStep);
    } else {
      completedSubtopics.add(selectedStep);
    }

    courseData[selectedCourse.value][selectedTopic] =
      Array.from(completedSubtopics);

    localStorage.setItem('completed', JSON.stringify(courseData));
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
      let completedSubtopics = new Set();

      for (const topic in courseData[selectedCourse.value]) {
        if (topic === 'progress') continue;
        const subtopicData = courseData[selectedCourse.value][topic] || [];
        subtopicData.forEach((subtopic) => completedSubtopics.add(subtopic));
      }

      const totalSubtopics = Object.keys(
        contentData[selectedCourse.value] || {}
      ).reduce((total, topic) => {
        if (topic === 'color') return total;
        const subtopicKeys = Object.keys(
          contentData[selectedCourse.value][topic] || {}
        );
        return total + subtopicKeys.length;
      }, 0);

      const totalCompleted = completedSubtopics.size;
      const progress =
        totalSubtopics > 0 ? (totalCompleted / totalSubtopics) * 100 : 0;

      courseData[selectedCourse.value].progress = progress;
      localStorage.setItem('completed', JSON.stringify(courseData));
    },
    [contentData, selectedCourse.value]
  );

  useEffect(() => {
    const courseData = JSON.parse(localStorage.getItem('completed') || '{}');
    const completedSubtopics = new Set(
      courseData[selectedCourse.value]?.[selectedTopic] || []
    );
    setIsCompleted(completedSubtopics.has(selectedStep));
  }, [selectedCourse.value, selectedTopic, selectedStep]);

  useEffect(() => {
    const fetchContentData = async () => {
      try {
        const response = await fetch('/contents.json');
        const data = await response.json();
        setContentData(data);
      } catch (error) {
        console.error('Error fetching content data:', error);
      }
    };

    fetchContentData();
  }, []);

  const topicData = useMemo(() => {
    return contentData?.[selectedCourse.value]?.[selectedTopic] || {};
  }, [contentData, selectedCourse.value, selectedTopic]);

  const steps = useMemo(() => {
    if (selectedSubtopic) {
      const subtopicData = topicData?.[selectedSubtopic] || {};
      return Object.keys(subtopicData);
    } else {
      return Object.keys(topicData);
    }
  }, [selectedSubtopic, topicData]);

  useEffect(() => {
    if (steps.length > 0) {
      setSelectedStep(steps[0]);
    }
  }, [steps]);

  if (!contentData) {
    return (
      <div className="flex flex-col w-full min-w-0 text-2xl items-center justify-center h-screen">
        <ThreeDots
          height="80"
          width="80"
          color={'#2E073F'}
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
        setShowWelcome={setShowWelcome}
        showWelcome={showWelcome}
        setIsMediaOnly={setIsMediaOnly}
        isMediaOnly={isMediaOnly}
      />
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
          setShowWelcome={setShowWelcome}
          showWelcome={showWelcome}
          setIsMediaOnly={setIsMediaOnly}
        />
      ) : (
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
      )}
    </>
  );
});
function BigContent({
  isDarkTheme,
  selectedStep,
  selectedCourse,
  setSelectedStep,
  selectedTopic,
  isMediaOnly,
  contentData,
  isCompleted,
  toggleCompletion,
}) {
  const steps = useMemo(
    () => Object.keys(contentData[selectedCourse.value]?.[selectedTopic] || {}),
    [contentData, selectedCourse.value, selectedTopic]
  );
  const handleStepSelection = useCallback(
    (step) => setSelectedStep(step),
    [setSelectedStep]
  );

  return (
    <div>
      <h1
        className={`${
          isDarkTheme ? 'text-white' : 'text-third-background'
        } text-5xl body-bold scrollbar-left transition-colors duration-300 text-left pb-2 px-4`}
      >
        {selectedTopic}
      </h1>

      <div className="overflow-y-auto scrollbar-left mb-auto grid grid-rows-[1fr_auto] grid-cols-4 min-w-0 w-full h-screen pb-[180px]">
        <div className="col-span-3 px-5">
          <ContentForStep
            step={selectedStep}
            selectedCourse={selectedCourse}
            selectedTopic={selectedTopic}
            selectedSubtopic={selectedStep}
            isMediaOnly={isMediaOnly}
            contentData={contentData}
            isDarkTheme={isDarkTheme}
          />
        </div>

        <div
          className={`transition-colors duration-300 col-span-1 ${
            isDarkTheme ? 'bg-dark-background' : 'bg-light-background'
          } h-full`}
        >
          <div
            className={`grid grid-rows-auto w-full ${
              isCompleted ? 'border-b-green-500' : 'border-b-light-background'
            } border-b-0`}
          >
            <div className="grid grid-rows-auto">
              {steps.map((step, index) => (
                <button
                  key={step}
                  onClick={() => handleStepSelection(step)}
                  className={`py-5 px-4 transition-all duration-300 body-bold text-base text-left relative ${
                    selectedStep === step
                      ? 'ml-5 bg-third-background text-white z-0'
                      : `ml-0 text-white z-10 shadow-xl ${
                          isDarkTheme ? 'bg-dark-secondary' : 'bg-light-text1'
                        }`
                  } ${index === 0 && 'rounded-tl-lg'} ${
                    index === steps.length - 1 && 'rounded-bl-lg'
                  } `}
                >
                  {step}
                </button>
              ))}
            </div>

            <div className="flex justify-center bg-transparent">
              <button
                className={`mt-5 flex items-center justify-center body-bold px-5 py-2 rounded transition-colors duration-300 ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-light-background text-black'
                }`}
                onClick={toggleCompletion}
                style={{
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {isCompleted ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <div className="h-5 w-5 border border-light-background bg-gray-400 rounded-t-md" />
                )}
                <span className="ml-2">
                  {isCompleted ? 'Completed' : 'Complete'}
                </span>
              </button>
            </div>
            <div
              className={`flex flex-col text-sm mt-1 0 justify-center text-center items-center`}
            >
              <p
                className={`font-bold justify-center items-center ${
                  isDarkTheme ? 'text-dark-secondary' : 'text-light-secondary'
                }  `}
              >
                Copyright ©2024 Proladict. All rights reserved.
              </p>
              <a
                href="/"
                className={`font-semibold text-white ${
                  isDarkTheme ? 'text-white' : 'text-blue-700'
                }`}
              >
                Terms of Use
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function SmallContent({
  toggleCompletion,
  isDarkTheme,
  selectedStep,
  setSelectedStep,
  isCompleted,
  contentData,
  width,
  selectedCourse,
  selectedTopic,
  isMediaOnly,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const steps = useMemo(
    () => Object.keys(contentData[selectedCourse.value]?.[selectedTopic] || {}),
    [contentData, selectedCourse.value, selectedTopic],
    [contentData]
  );

  const handlePreviousStep = useCallback(() => {
    const currentIndex = steps.indexOf(selectedStep);
    if (currentIndex > 0) {
      setSelectedStep(steps[currentIndex - 1]);
    }
  }, [steps, selectedStep, setSelectedStep]);

  const handleNextStep = useCallback(() => {
    const currentIndex = steps.indexOf(selectedStep);
    if (currentIndex < steps.length - 1) {
      setSelectedStep(steps[currentIndex + 1]);
    }
  }, [steps, selectedStep, setSelectedStep]);
  return (
    <>
      <h1
        className={`${
          isDarkTheme ? 'text-white' : 'text-third-background'
        } text-5xl body-bold transition-all  duration-300 text-left pb-2 px-4`}
      >
        {selectedTopic}
      </h1>
      {isMenuOpen ? (
        <div
          className="overflow-y-auto h-full grid w-full pb-[150px] transition-all duration-300 grid-rows-steps-layout"
          style={{ maxHeight: `${window.innerHeight}px` }}
        >
          {steps.map((step, index) => (
            <button
              key={index}
              onClick={() => setSelectedStep(step)}
              className={`px-4 transition-all duration-300 body-bold text-base text-left relative ${
                selectedStep === step
                  ? 'bg-third-background py-6 text-white'
                  : 'bg-dark-secondary py-2 text-white'
              }`}
            >
              {step}
            </button>
          ))}
        </div>
      ) : (
        <div className="overflow-y-auto pb-[180px] px-5 h-full w-full">
          <ContentForStep
            step={selectedStep}
            selectedCourse={selectedCourse}
            selectedTopic={selectedTopic}
            selectedSubtopic={selectedStep}
            isMediaOnly={isMediaOnly}
            contentData={contentData}
            isDarkTheme={isDarkTheme}
          />
        </div>
      )}

      <div
        className={`fixed bottom-0 transition-colors duration-300 ${
          isDarkTheme ? 'bg-dark-background' : 'bg-light-background'
        } ${
          isCompleted ? 'border-t-green-500' : 'border-t-light-background'
        } border-t-[5px]`}
        style={{ width: `${width}%` }}
      >
        <div className={`flex w-full  `}>
          <div className="flex items-center justify-between w-auto">
            <div
              className={`flex h-full ${
                isDarkTheme
                  ? 'bg-light-background text-black'
                  : 'bg-light-background text-light-text1'
              }`}
            >
              <button onClick={handlePreviousStep} className="px-4">
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <button onClick={handleNextStep} className="px-4">
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="h-auto w-full py-3 px-4 flex items-center justify-center bg-white transition-colors body-bold text-base duration-300 text-center flex-grow">
            <Bars4Icon
              className="h-6 w-6 cursor-pointer"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            />
          </div>
          <div className="flex md:justify-center">
            <button
              className={` flex items-center justify-center body-bold px-5 py-2  transition-colors duration-300 ${
                isCompleted
                  ? 'bg-green-500 text-white'
                  : 'bg-light-background text-black'
              }`}
              onClick={toggleCompletion}
              style={{
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {isCompleted ? (
                <CheckIcon className="h-5 w-5" />
              ) : (
                <div className="h-5 w-5 border border-light-background bg-gray-400 rounded-t-md" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
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
  isMediaOnly,
}) {
  const toggleSettings = useCallback(() => {
    setIsMediaOnly((prev) => !prev);
  }, [setIsMediaOnly]);

  const handleHomeClick = useCallback(() => {
    setShowWelcome(true);
  }, [setShowWelcome]);

  return (
    <div className="flex justify-between bg-transparent m-4">
      <div className="flex space-x-2">
        <Tooltip title="Exit" placement="top">
          <button
            onClick={handleHide}
            className={`p-2 rounded transition-colors duration-300 bg-redSpecial text-white hover:bg-red-800`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </Tooltip>
        {!showWelcome && (
          <Tooltip title="Home" placement="top">
            <button
              onClick={handleHomeClick}
              className={`p-2 rounded transition-colors duration-300 ${
                isDarkTheme
                  ? 'bg-dark-secondary text-dark-background'
                  : 'bg-light-text1  text-light-secondary'
              }`}
            >
              <HomeIcon className="h-5 w-5" />
            </button>
          </Tooltip>
        )}

        <Tooltip title="Theme Toggle" placement="top">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded transition-colors duration-300 ${
              isDarkTheme
                ? 'bg-dark-secondary text-dark-background'
                : 'bg-light-text1  text-light-secondary'
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
        {!showWelcome && (
          <Tooltip title="Media-Only" placement="top">
            <button
              onClick={toggleSettings}
              className={`p-2 rounded transition-colors duration-300 ${
                isMediaOnly
                  ? 'bg-blue-600 text-white'
                  : isDarkTheme
                  ? 'bg-dark-secondary text-dark-background'
                  : 'bg-light-text1 text-light-secondary'
              }`}
            >
              <EyeIcon className="h-5 w-5" />
            </button>
          </Tooltip>
        )}

        <div className="absolute top-11 z-20 flex w-full flex-col -rotate-[32deg] items-center">
          <ArrowTrendingUpIcon
            className={`${
              isDarkTheme ? 'text-white' : 'text-dark-background'
            } h-5 w-5 w-full transform -rotate-[60deg]`}
          />
          <span
            className={`text-center text-xl toon m-0  w-full leading-tight ${
              isDarkTheme ? 'text-white' : 'text-dark-background'
            }`}
          >
            Only code!
          </span>
        </div>

        <Tooltip title="Expand" placement="top">
          <button
            onClick={handleExpand}
            className={`p-2 rounded transition-colors duration-300 ${
              isDarkTheme
                ? 'bg-dark-secondary text-dark-background'
                : 'bg-light-text1 text-light-secondary'
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

Content.propTypes = {
  isDarkTheme: PropTypes.bool.isRequired,
  selectedCourse: PropTypes.shape({
    value: PropTypes.string.isRequired,
  }).isRequired,
  isMediaOnly: PropTypes.bool.isRequired,
  selectedTopic: PropTypes.string.isRequired,
  selectedSubtopic: PropTypes.string,
  setChange: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  handleHide: PropTypes.func.isRequired,
  toggleTheme: PropTypes.func.isRequired,
  setShowWelcome: PropTypes.func.isRequired,
  showWelcome: PropTypes.bool.isRequired,
  width: PropTypes.number.isRequired,
  handleExpand: PropTypes.func.isRequired,
  setIsMediaOnly: PropTypes.func.isRequired,
};
BigContent.propTypes = {
  isDarkTheme: PropTypes.bool.isRequired,
  selectedStep: PropTypes.string.isRequired,
  selectedCourse: PropTypes.shape({
    value: PropTypes.string.isRequired,
  }).isRequired,
  setSelectedStep: PropTypes.func.isRequired,
  selectedTopic: PropTypes.string.isRequired,
  isMediaOnly: PropTypes.bool.isRequired,
  contentData: PropTypes.object.isRequired,
  isCompleted: PropTypes.bool.isRequired,
  toggleCompletion: PropTypes.func.isRequired,
};
Buttons.propTypes = {
  handleExpand: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  isDarkTheme: PropTypes.bool.isRequired,
  handleHide: PropTypes.func.isRequired,
  toggleTheme: PropTypes.func.isRequired,
  setShowWelcome: PropTypes.func.isRequired,
  showWelcome: PropTypes.bool.isRequired,
  setIsMediaOnly: PropTypes.func.isRequired,
  isMediaOnly: PropTypes.bool.isRequired,
};

SmallContent.propTypes = {
  toggleCompletion: PropTypes.func.isRequired,
  isDarkTheme: PropTypes.bool.isRequired,
  selectedStep: PropTypes.string.isRequired,
  setSelectedStep: PropTypes.func.isRequired,
  isCompleted: PropTypes.bool.isRequired,
  contentData: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  selectedCourse: PropTypes.shape({
    value: PropTypes.string.isRequired,
  }).isRequired,
  selectedTopic: PropTypes.string.isRequired,
  isMediaOnly: PropTypes.bool.isRequired,
};
export default Content;
