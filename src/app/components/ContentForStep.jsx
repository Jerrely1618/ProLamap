import {
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { useTheme } from "next-themes";
import Link from "next/link";
import PropTypes from "prop-types";
import React, { useState } from "react";
import Collapsible from "react-collapsible";
import ReactMarkdown from "react-markdown";
import ReactPlayer from "react-player";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight,
  coldarkDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeSanitize from "rehype-sanitize";

const ContentForStep = React.memo(function ContentForStep({
  step,
  selectedCourse,
  selectedTopic,
  selectedSubtopic,
  contentData,
  isMediaOnly,
}) {
  const topicContent =
    contentData[selectedCourse.value]?.[selectedTopic]?.[step] ||
    contentData[selectedCourse.value]?.[selectedTopic]?.[selectedSubtopic];
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  if (!Array.isArray(topicContent) || topicContent.length === 0) {
    return (
      <p
        className={`text-3xl justify-center ${
          theme === "dark" ? "text-white" : "text-dark-background"
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
            theme === "dark" ? "text-light-background" : "text-dark-background"
          }`}
          key={index}
        >
          {!isMediaOnly && item.type === "info" && (
            <div className="my-2">
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
                    <h2 className="text-base text-light-background">
                      {item.title}
                    </h2>
                    {isOpen ? (
                      <ChevronUpIcon
                        className={`text-white ml-auto w-5 h-5 transform transition-transform duration-300`}
                      />
                    ) : (
                      <ChevronDownIcon
                        className={`text-white ml-auto w-5 h-5 transform transition-transform duration-300`}
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
          {item.type === "title" && (
            <h2
              className={`text-xl body-bold ${
                theme === "dark"
                  ? "text-light-background"
                  : "text-dark-background"
              }`}
            >
              {item.content}
            </h2>
          )}
          {item.type === "mainTitle" && (
            <h2
              className={`text-3xl body-bold ${
                theme === "dark" ? "text-light-text1" : "text-dark-primary"
              }`}
            >
              {item.content}
            </h2>
          )}
          {!isMediaOnly && item.type === "text" && (
            <div className="text-base my-2 text-base">
              <ReactMarkdown
                rehypePlugins={[rehypeSanitize]}
                components={{
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-4">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="ml-4 font-semibold">{children}</li>
                  ),
                }}
              >
                {item.content}
              </ReactMarkdown>
            </div>
          )}
          {!isMediaOnly && item.type === "Idea" && (
            <>
              <p className="text-lg font-bold text-blue-400">Idea:</p>
              <div className="text-lg base mb-2 font-light">
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                  {item.content}
                </ReactMarkdown>
              </div>
            </>
          )}

          {!isMediaOnly && item.type === "depth" && (
            <>
              <p className={`text-3xl body-bold  `}>Learn in Depth</p>
              <div className="text-base my-2">
                <ReactMarkdown
                  rehypePlugins={[rehypeSanitize]}
                  components={{
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-4">{children}</ol>
                    ),
                    li: ({ children }) => <li className="ml-4">{children}</li>,
                    a: ({ children, href }) => (
                      <Link href={href} target="_blank" passHref>
                        <span
                          className={`${
                            theme === "dark"
                              ? "text-light-text1"
                              : "text-dark-primary"
                          } font-bold hover:underline`}
                        >
                          {children}
                        </span>
                      </Link>
                    ),
                  }}
                >
                  {item.content
                    .split("\n")
                    .map((line) => line.trim())
                    .join("\n")}
                </ReactMarkdown>
              </div>
            </>
          )}

          {item.type === "video" && (
            <div className={`flex justify-center items-center my-2 rounded`}>
              <div className="w-full max-w-2xl aspect-video rounded border-[3.5px] border-dark-text2">
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
              style={theme === "dark" ? coldarkDark : oneLight}
              className="text-base scrollbar-left-small"
            >
              {item.content}
            </SyntaxHighlighter>
          )}
        </div>
      ))}
    </>
  );
});

ContentForStep.propTypes = {
  step: PropTypes.string.isRequired,
  selectedCourse: PropTypes.shape({
    value: PropTypes.string.isRequired,
  }).isRequired,
  selectedTopic: PropTypes.string.isRequired,
  selectedSubtopic: PropTypes.string,
  contentData: PropTypes.object.isRequired,
  isMediaOnly: PropTypes.bool.isRequired,
};
export default ContentForStep;
