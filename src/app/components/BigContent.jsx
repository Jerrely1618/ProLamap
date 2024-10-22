import { CheckIcon } from "@heroicons/react/24/solid";
import PropTypes from "prop-types";
import React, { useCallback, useMemo } from "react";
const ContentForStep = lazy(() => import("./ContentForStep"));

const BigContent = React.memo(function BigContent({
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
    <div
      className={`max-w-screen-lg justify-center flex flex-col ${
        isDarkTheme ? "bg-dark-background" : "bg-light-background"
      }`}
    >
      <h1
        className={`${
          isDarkTheme ? "text-white" : "text-third-background"
        } text-5xl body-bold  transition-colors duration-300 text-left pb-2 px-4`}
      >
        {selectedTopic}
      </h1>

      <div className="overflow-y-auto grid grid-cols-4 min-w-0 w-full h-screen pb-[180px]">
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
          className={`transition-colors duration-300 col-span-1 bg-transparent h-full`}
        >
          <div className={`grid w-full bg-transparent border-b-0`}>
            <div className="grid">
              {steps.map((step, index) => (
                <button
                  aria-label={step}
                  key={step}
                  onClick={() => handleStepSelection(step)}
                  className={`py-5 px-4 transition-all text-white duration-300 body-bold text-base text-left relative ${
                    selectedStep === step
                      ? "ml-5 bg-third-background  z-0"
                      : `ml-0 z-10 shadow-xl bg-light-text1`
                  } ${index === 0 && "rounded-tl-lg"} ${
                    index === steps.length - 1 && "rounded-bl-lg"
                  } `}
                >
                  {step}
                </button>
              ))}
            </div>

            <div className="flex justify-center bg-transparent">
              <button
                aria-label="Complete"
                className={`mt-5 flex items-center justify-center body-bold px-5 py-2 rounded transition-colors duration-300 ${
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
                  <div className="h-5 w-5 border bg-gray-400 rounded-t-md" />
                )}
                <span className="ml-2">
                  {isCompleted ? "Completed" : "Complete"}
                </span>
              </button>
            </div>

            <div className="flex flex-col text-sm mt-10 text-center">
              <p
                className={`font-bold ${
                  isDarkTheme ? "text-dark-secondary" : "text-light-secondary"
                }`}
              >
                Copyright ©2024 Re. All rights reserved.
              </p>
              <a
                href="/"
                className={`font-semibold ${
                  isDarkTheme ? "text-white" : "text-blue-700"
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
});

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

export default BigContent;
