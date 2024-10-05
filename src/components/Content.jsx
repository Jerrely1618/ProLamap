import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { Checkbox } from "antd";
import { useEffect, useState } from "react";
import Collapsible from "react-collapsible";
import ReactPlayer from "react-player";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Content({
  isDarkTheme,
  selectedCourse,
  isMediaOnly,
  selectedTopic,
  selectedSubtopic,
  setChange,
}) {
  const [contentData, setContentData] = useState(null);
  const [selectedStep, setSelectedStep] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const toggleCompletion = () => {
    const courseData = JSON.parse(localStorage.getItem("completed") || "{}");

    if (!courseData[selectedCourse.value]) {
      courseData[selectedCourse.value] = {};
    }

    if (!courseData[selectedCourse.value][selectedTopic]) {
      courseData[selectedCourse.value][selectedTopic] = new Set();
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
    localStorage.setItem("completed", JSON.stringify(courseData));

    setIsCompleted((prev) => !prev);
    setChange((prev) => !prev);
  };

  useEffect(() => {
    const courseData = JSON.parse(localStorage.getItem("completed") || "{}");
    const completedSubtopics = new Set(
      courseData[selectedCourse.value]?.[selectedTopic] || []
    );

    setIsCompleted(completedSubtopics.has(selectedStep));
  }, [selectedCourse.value, selectedTopic, selectedStep]);

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
  const handlePreviousStep = () => {
    const currentIndex = steps.indexOf(selectedStep);
    if (currentIndex > 0) {
      setSelectedStep(steps[currentIndex - 1]);
    }
  };
  const handleNextStep = () => {
    const currentIndex = steps.indexOf(selectedStep);
    if (currentIndex < steps.length - 1) {
      setSelectedStep(steps[currentIndex + 1]);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="px-5 w-full max-w-screen-lg ">
        <h1
          className={`${
            isDarkTheme ? "text-white" : "text-third-background"
          }  text-5xl body-bold transition-colors duration-300 text-left py-6 `}
        >
          {selectedTopic}
        </h1>

        <div className="flex flex-col md:flex-row-reverse">
          <div
            className={`md:w-1/4 w-full sticky transition-colors duration-300 top-0 z-10 ${
              isDarkTheme ? "bg-dark-background" : "bg-light-background"
            } border-b-light-background border-b-[5px] md:border-b-0`}
          >
            <div className="flex md:flex-col  h-full">
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-full ${
                    isDarkTheme
                      ? "bg-light-background text-black"
                      : "bg-light-background text-light-text1"
                  }`}
                >
                  <button
                    onClick={handlePreviousStep}
                    className={`px-2 md:hidden `}
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNextStep}
                    className={`px-2 md:hidden ${
                      isDarkTheme
                        ? "bg-light-background text-black"
                        : "bg-light-background text-light-text1"
                    }`}
                  >
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex md:flex-col flex-row flex-grow">
                  {steps.map((step, index) => (
                    <button
                      key={step}
                      onClick={() => setSelectedStep(step)}
                      className={`py-2 px-4 transition-colors body-bold text-base duration-300 text-left 
              ${
                selectedStep === step
                  ? isDarkTheme
                    ? "bg-light-background text-black"
                    : "bg-light-background text-black"
                  : "bg-third-background text-white"
              }
              ${
                index === steps.length - 1
                  ? "rounded-tr md:rounded-br md:rounded-tr-none"
                  : ""
              }
            `}
                    >
                      {step}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center ">
                <button
                  className={`md:mt-5 flex items-center ml-2 justify-center body-bold px-4 py-2 rounded transition-colors duration-300 ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-black"
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
                    <div className="h-5 w-5 border border-gray-400 bg-gray-200 rounded-md" />
                  )}
                  <span className="hidden md:block ml-2">
                    {isCompleted ? "Completed" : "Complete"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="content-section md:w-3/4 w-full mt-2 pr-0 md:pr-5 h-[calc(100vh-60px)]">
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
        </div>
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
  isMediaOnly,
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
          className={`body-medium text-xl  ${!isMediaOnly ? "py-2" : "py-0"} ${
            isDarkTheme ? "text-light-background" : "text-dark-background"
          }`}
          key={index}
        >
          {!isMediaOnly && item.type === "info" && (
            <div>
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
                      <InformationCircleIcon className="w-8 h-8" />
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
                  className={`py-3 px-2 text-light-background bg-dark-text1 text-base rounded-b-lg`}
                >
                  <p>{item.content}</p>
                </div>
              </Collapsible>
            </div>
          )}
          {item.type === "title" && (
            <h2
              className={`text-xl body-bold  -mb-3 ${
                isDarkTheme ? "text-light-background" : "text-dark-background"
              } ${isMediaOnly ? "pb-2" : "pb-0"}`}
            >
              {item.content}
            </h2>
          )}
          {!isMediaOnly && item.type === "text" && (
            <p className="text-base">{item.content}</p>
          )}
          {item.type === "video" && (
            <div className={`flex justify-center items-center pt-7`}>
              <div className="w-full max-w-2xl aspect-video rounded-b">
                <ReactPlayer
                  url={item.content}
                  width="100%"
                  height="100%"
                  controls={true}
                  light={true}
                  playing={false}
                  config={{
                    youtube: {
                      playerVars: { showinfo: 1, rel: 0 },
                    },
                  }}
                />
              </div>
            </div>
          )}
          {item.type === "code" && selectedCourse.value && (
            <SyntaxHighlighter
              language={selectedCourse.value}
              showLineNumbers={true}
              showInlineLineNumbers={false}
              wrapLines={true}
              style={isDarkTheme ? oneDark : oneLight}
            >
              {item.content}
            </SyntaxHighlighter>
          )}
        </div>
      ))}
    </div>
  );
}
