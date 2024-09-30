import { CodeBlock } from "@atlaskit/code";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import React, { useEffect, useState } from "react";
import Collapsible from "react-collapsible";
import ReactPlayer from "react-player";

export default function Content({
  isDarkTheme,
  selectedCourse,
  selectedTopic,
  selectedSubtopic,
}) {
  const [contentData, setContentData] = useState(null);
  const [selectedStep, setSelectedStep] = useState("");

  useEffect(() => {
    const fetchContentData = async () => {
      try {
        const response = await fetch("/contents.json");
        const data = await response.json();
        setContentData(data);

        if (
          data[selectedCourse.value] &&
          data[selectedCourse.value][selectedTopic]
        ) {
          if (selectedSubtopic) {
            const subtopicData = data[selectedCourse.value][selectedTopic];
            const stepKeys = Object.keys(subtopicData);
            setSelectedStep(stepKeys.length > 0 ? stepKeys[0] : "");
          } else {
            const topicKeys = Object.keys(
              data[selectedCourse.value][selectedTopic]
            );
            setSelectedStep(topicKeys.length > 0 ? topicKeys[0] : "");
          }
        }
      } catch (error) {
        console.error("Error fetching content data:", error);
      }
    };

    fetchContentData();
  }, [selectedCourse.value, selectedTopic, selectedSubtopic]);

  useEffect(() => {
    if (selectedSubtopic && contentData) {
      const subtopicData =
        contentData[selectedCourse.value]?.[selectedTopic]?.[selectedSubtopic];
      if (subtopicData) {
        const steps = Object.keys(subtopicData);
        if (steps.length > 0) {
          setSelectedStep(steps[0]);
        }
      }
    }
  }, [selectedSubtopic, contentData, selectedCourse.value, selectedTopic]);

  if (!contentData) {
    return <div>Loading...</div>;
  }

  const steps = Object.keys(
    contentData[selectedCourse.value][selectedTopic] || {}
  );

  return (
    <div className="mt-10 mx-5 flex flex-col">
      <div className="sticky top-0 z-10 bg-light-background dark:bg-dark-background pt-4">
        <h1 className="text-dark-text1 text-5xl body-bold">{selectedTopic}</h1>

        <div className="mb-0.5 border-b border-dark-text1">
          {steps.map((step, index) => (
            <button
              key={step}
              onClick={() => setSelectedStep(step)}
              className={`py-2 px-4 transition-colors duration-300 mt-10
                ${
                  selectedStep === step
                    ? "bg-dark-text1 text-white"
                    : "bg-light-background text-black"
                }
                ${index === 0 ? "rounded-tl" : ""}
                ${index === steps.length - 1 ? "rounded-tr" : ""}
              `}
            >
              {step}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100vh-60px)] scrollbar-left">
        <ContentForStep
          step={selectedStep}
          selectedCourse={selectedCourse}
          selectedTopic={selectedTopic}
          selectedSubtopic={selectedSubtopic}
          contentData={contentData}
          isDarkTheme={isDarkTheme}
        />
      </div>
    </div>
  );
}

function ContentForStep({
  step,
  selectedCourse,
  selectedTopic,
  selectedSubtopic,
  contentData,
  isDarkTheme,
}) {
  const topicContent =
    contentData[selectedCourse.value]?.[selectedTopic]?.[step] ||
    contentData[selectedCourse.value]?.[selectedTopic]?.[selectedSubtopic];

  const [isOpen, setIsOpen] = useState(false);

  if (!Array.isArray(topicContent)) {
    return <p>No content available for {step}</p>;
  }

  if (topicContent.length === 0) {
    return <p>No content available for {step}</p>;
  }

  return (
    <div>
      {topicContent.map((item, index) => (
        <div
          className={`body-medium text-xl py-2 ${
            isDarkTheme ? "text-light-background" : "text-dark-background"
          }`}
          key={index}
        >
          {item.type === "info" && (
            <div className="mb-4">
              <Collapsible
                open={isOpen}
                onTriggerOpening={() => setIsOpen(true)}
                onTriggerClosing={() => setIsOpen(false)}
                trigger={
                  <div
                    className={`flex items-center cursor-pointer bg-third-text1 p-2 ${
                      isOpen ? "rounded-t-lg" : "rounded-lg"
                    }`}
                  >
                    <div className="text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
                      <InformationCircleIcon className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg text-light-background">
                      {item.title}
                    </h2>
                    {isOpen ? (
                      <ChevronUpIcon
                        className={`ml-auto w-5 h-5 transform transition-transform duration-300`}
                      />
                    ) : (
                      <ChevronDownIcon
                        className={`ml-auto w-5 h-5 transform transition-transform duration-300`}
                      />
                    )}
                  </div>
                }
              >
                <div
                  className={`py-3 px-2 text-light-background bg-third-secondary text-base rounded-b-lg ${
                    isOpen ? "" : ""
                  }`}
                >
                  <p>{item.content}</p>
                </div>
              </Collapsible>
            </div>
          )}
          {item.type === "text" && <p>{item.content}</p>}
          {item.type === "video" && (
            <div className="video-container">
              <ReactPlayer
                url={item.content}
                width="100%"
                height="100%"
                controls={true}
                light={false}
                playing={false}
                config={{
                  youtube: {
                    playerVars: { showinfo: 1, rel: 0 },
                  },
                }}
              />
            </div>
          )}
          {item.type === "code" && (
            <div className="text-xl custom-codeblock">
              <CodeBlock
                language={selectedCourse}
                showLineNumbers={false}
                text={item.content}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
