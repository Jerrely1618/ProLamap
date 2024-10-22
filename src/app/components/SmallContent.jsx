import React, { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Bars4Icon,
  CheckIcon,
} from "@heroicons/react/24/solid";
import ContentForStep from "./ContentForStep";

const SmallContent = React.memo(function SmallContent({
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
    [contentData, selectedCourse.value, selectedTopic]
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
          isDarkTheme ? "text-white" : "text-third-background"
        } text-5xl body-bold transition-all duration-300 text-left pb-2 px-4`}
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
              aria-label={step}
              key={index}
              onClick={() => setSelectedStep(step)}
              className={`px-4 transition-all duration-300 body-bold text-base text-left relative ${
                selectedStep === step
                  ? "bg-third-background py-6 text-white"
                  : "bg-dark-secondary py-2 text-white"
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
        className={`fixed bottom-0 transition-colors duration-300 w-full ${
          isDarkTheme ? "bg-dark-background" : "bg-light-background"
        } ${
          isCompleted ? "border-t-green-500" : "border-t-light-background"
        } border-t-[5px]`}
      >
        <div className="flex w-full">
          <div className="flex items-center justify-between w-auto">
            <div
              className={`flex h-full ${
                isDarkTheme
                  ? "bg-light-background text-black"
                  : "bg-light-background text-light-text1"
              }`}
            >
              <button
                aria-label="Previous Subtopic"
                onClick={handlePreviousStep}
                className="px-4"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <button
                aria-label="Next Subtopic"
                onClick={handleNextStep}
                className="px-4"
              >
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
              aria-label="Complete"
              className={`flex items-center justify-center body-bold px-5 py-2 transition-colors duration-300 ${
                isCompleted
                  ? "bg-green-500 text-white"
                  : "bg-light-background text-black"
              }`}
              onClick={toggleCompletion}
              style={{
                border: "none",
                cursor: "pointer",
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
});

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

export default SmallContent;
