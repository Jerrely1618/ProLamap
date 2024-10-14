import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Bars4Icon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  HomeIcon,
  InformationCircleIcon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';
import { Tooltip } from 'antd';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Collapsible from 'react-collapsible';
import { ThreeDots } from 'react-loader-spinner';
import ReactPlayer from 'react-player';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeSanitize from 'rehype-sanitize';

export default function Content({
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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const toggleCompletion = () => {
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
  };
  const updateProgress = (courseData) => {
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
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
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
  useEffect(() => {
    if (contentData && selectedCourse.value && selectedTopic) {
      const topicData = contentData[selectedCourse.value]?.[selectedTopic];
      if (topicData) {
        if (selectedSubtopic) {
          const subtopicData = topicData[selectedSubtopic];
          const steps = Object.keys(subtopicData || {});
          setSelectedStep(steps.length > 0 ? steps[0] : '');
        } else {
          const topicKeys = Object.keys(topicData || {});
          setSelectedStep(topicKeys.length > 0 ? topicKeys[0] : '');
        }
      }
    }
  }, [selectedCourse.value, selectedTopic, selectedSubtopic, contentData]);
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
    return (
      <div
        className={`flex flex-col w-full min-w-0 text-2xl items-center justify-center h-screen`}
      >
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
}
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
  const steps = Object.keys(
    contentData[selectedCourse.value][selectedTopic] || {}
  );

  return (
    <>
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
                  onClick={() => setSelectedStep(step)}
                  className={`py-5 px-4 transition-colors body-bold text-base duration-300 text-left ${
                    selectedStep === step
                      ? 'bg-third-background text-white'
                      : 'bg-dark-secondary text-white'
                  } ${
                    index === steps.length - 1
                      ? 'rounded-tr rounded-br rounded-tr-none'
                      : 'border-b'
                  }`}
                >
                  {step}
                </button>
              ))}
            </div>

            {/* Completion Button */}
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
  const toggleSettings = () => {
    setIsMediaOnly((prev) => !prev);
  };

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
              onClick={setShowWelcome}
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

      <div className="flex space-x-2">
        {!showWelcome && (
          <Tooltip title="Media-Only" placement="top">
            <button
              onClick={toggleSettings}
              className={`p-2 rounded transition-colors duration-300 ${
                isMediaOnly
                  ? 'bg-blue-600 text-white'
                  : isDarkTheme
                  ? 'bg-dark-secondary text-dark-background'
                  : 'bg-light-text1  text-light-secondary'
              }`}
            >
              <EyeIcon className="h-5 w-5" />
            </button>
          </Tooltip>
        )}
        <Tooltip title="Expand" placement="top">
          <button
            onClick={handleExpand}
            className={`p-2 rounded transition-colors duration-300 ${
              isDarkTheme
                ? 'bg-dark-secondary text-dark-background'
                : 'bg-light-text1  text-light-secondary'
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
    <>
      <h1
        className={`${
          isDarkTheme ? 'text-white' : 'text-third-background'
        } text-5xl body-bold transition-colors duration-300 text-left pb-2 px-4`}
      >
        {selectedTopic}
      </h1>
      {isMenuOpen ? (
        <div className="grid w-full min-w-0 h-full pb-[86px] overflow-y-auto grid-rows-steps-layout">
          {steps.map((step, index) => (
            <button
              key={index}
              onClick={() => setSelectedStep(step)}
              className={`py-10 px-4 transition-colors body-bold text-base duration-300 text-left ${
                selectedStep === step
                  ? isDarkTheme
                    ? 'bg-third-background text-white'
                    : 'bg-third-background text-white'
                  : 'bg-dark-secondary text-white'
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
    return (
      <p
        className={`text-3xl justify-center ${
          isDarkTheme ? 'text-white' : 'text-dark-background'
        }`}
      >
        Oooops, no content available for {step}.
      </p>
    );
  }

  if (topicContent.length === 0) {
    return (
      <p
        className={`text-3xl justify-center ${
          isDarkTheme ? 'text-white' : 'text-dark-background'
        }`}
      >
        Oooops, no content available for {step}.
      </p>
    );
  }

  return (
    <>
      {topicContent.map((item, index) => (
        <div
          className={`body-medium text-xl ${
            isDarkTheme ? 'text-light-background' : 'text-dark-background'
          }`}
          key={index}
        >
          {!isMediaOnly && item.type === 'info' && (
            <div className="my-2">
              <Collapsible
                open={isOpen}
                onTriggerOpening={() => setIsOpen(true)}
                onTriggerClosing={() => setIsOpen(false)}
                trigger={
                  <div
                    className={`flex items-center cursor-pointer bg-third-text1 p-2 ${
                      isOpen ? 'rounded-t-lg' : 'rounded-lg'
                    }`}
                  >
                    <div className="text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
                      <InformationCircleIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-base text-light-background">
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
                  <ReactMarkdown
                    rehypePlugins={[rehypeSanitize]}
                    components={{
                      ul: ({ children }) => (
                        <ul className="list-disc pl-4">{children}</ul>
                      ),
                      li: ({ children }) => (
                        <li className="ml-4">{children}</li>
                      ),
                    }}
                  >
                    {item.content}
                  </ReactMarkdown>
                </div>
              </Collapsible>
            </div>
          )}
          {item.type === 'title' && (
            <h2
              className={`text-xl body-bold ${
                isDarkTheme ? 'text-light-background' : 'text-dark-background'
              }`}
            >
              {item.content}
            </h2>
          )}
          {!isMediaOnly && item.type === 'text' && (
            <div className="text-base my-2 text-base">
              <ReactMarkdown
                rehypePlugins={[rehypeSanitize]}
                components={{
                  ul: ({ children }) => (
                    <ul className="list-disc pl-4">{children}</ul>
                  ),
                  li: ({ children }) => <li className="ml-4">{children}</li>,
                }}
              >
                {item.content}
              </ReactMarkdown>
            </div>
          )}
          {item.type === 'video' && (
            <div className={`flex justify-center items-center my-2 rounded`}>
              <div className="w-full max-w-2xl aspect-video rounded">
                <ReactPlayer
                  url={item.content}
                  width="100%"
                  height="100%"
                  controls={true}
                  light={true}
                  className="rounded"
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
          {item.type === 'code' && selectedCourse.value && (
            <SyntaxHighlighter
              language={selectedCourse.value}
              showLineNumbers={true}
              showInlineLineNumbers={false}
              wrapLines={true}
              style={isDarkTheme ? oneDark : oneLight}
              className="text-base scrollbar-left-small"
            >
              {item.content}
            </SyntaxHighlighter>
          )}
        </div>
      ))}
    </>
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
};
ContentForStep.propTypes = {
  step: PropTypes.string.isRequired,
  selectedCourse: PropTypes.shape({
    value: PropTypes.string.isRequired,
  }).isRequired,
  selectedTopic: PropTypes.string.isRequired,
  selectedSubtopic: PropTypes.string,
  contentData: PropTypes.object.isRequired,
  isMediaOnly: PropTypes.bool.isRequired,
  isDarkTheme: PropTypes.bool.isRequired,
};
