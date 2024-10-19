import { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
  HomeIcon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { Trie, serializeTrie, deserializeTrie } from "../utils/Trie";
import PropTypes from "prop-types";
import { Tooltip } from "antd";
import Link from "next/link";
import debounce from "lodash.debounce";
import { FixedSizeList as List } from "react-window";

export default function Welcome({
  isDarkTheme,
  setShowWelcome,
  setSelectedTopic,
  handleExpand,
  isExpanded,
  handleHide,
  toggleTheme,
  showWelcome,
  width,
  setIsMediaOnly,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [topics, setTopics] = useState([]);
  const [trie, setTrie] = useState(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const cachedTrie = localStorage.getItem("searchTrie");
    if (cachedTrie) {
      const deserializedTrie = deserializeTrie(cachedTrie);
      setTrie(deserializedTrie);
      setTopics(deserializedTrie.getAllTopics());
    } else {
      const fetchContentData = async () => {
        const response = await fetch("/contents.json");
        const data = await response.json();
        const newTrie = new Trie();
        const allTopics = [];

        for (const language in data) {
          const languageData = data[language];
          const color = languageData.color;

          for (const topic in languageData) {
            if (topic === "color") continue;
            allTopics.push(topic);
            newTrie.insert(topic, { topic, language, color });

            for (const subtopic in languageData[topic]) {
              allTopics.push(subtopic);
              newTrie.insert(subtopic, {
                topic: subtopic,
                language,
                color,
                parentTopic: topic,
              });
            }
          }
        }

        localStorage.setItem("searchTrie", serializeTrie(newTrie));
        setTrie(newTrie);
        setTopics(allTopics);
      };
      fetchContentData();
    }
  }, []);

  useEffect(() => {
    if (listRef.current && selectedIndex >= 0 && filteredTopics.length > 0) {
      listRef.current.scrollToItem(selectedIndex);
    }
  }, [selectedIndex, filteredTopics]);

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setFilteredTopics([]);
        setSearchTerm("");
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = useCallback(
    debounce((value) => {
      if (trie) {
        const results = trie.searchPrefix(value);
        setFilteredTopics(results);
      }
    }, 300),
    [trie]
  );

  const handleSearchChange = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    setSelectedIndex(-1);
    handleSearch(value);
  };

  const handleTopicClick = (item) => {
    setSelectedTopic(
      item.parentTopic ? capitalize(item.parentTopic) : capitalize(item.topic)
    );
    setShowWelcome(false);
  };

  const handleKeyDown = (event) => {
    if (filteredTopics.length > 0) {
      if (event.key === "ArrowDown") {
        setSelectedIndex((prevIndex) =>
          prevIndex < filteredTopics.length - 1 ? prevIndex + 1 : prevIndex
        );
      } else if (event.key === "ArrowUp") {
        setSelectedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : prevIndex
        );
      } else if (event.key === "Enter" && selectedIndex >= 0) {
        handleTopicClick(filteredTopics[selectedIndex]);
      }
    }
  };

  return (
    <>
      <div className="flex flex-col items-start p-4 h-screen justify-center">
        <div
          className={`body-bold flex space-x-5 ${
            isDarkTheme ? "text-dark-secondary" : "text-dark-background"
          } absolute md:top-5 bottom-5`}
        >
          <div>
            <span>#Learn</span>
            <span>Reapply</span>
            <span>Remember</span>
            <span>Code!</span>
          </div>
        </div>
        <h2
          className={`md:text-4xl text-3xl sm:text-2xl body font-semibold mb-1 ${
            isDarkTheme ? "text-dark-secondary" : "text-dark-background"
          }`}
        >
          Welcome to
        </h2>
        <h1
          className={`md:text-8xl text-4xl sm:text-5xl font-light bubble ${
            isDarkTheme ? "text-dark-secondary" : "text-third-text1"
          }`}
        >
          ProlaDict
        </h1>

        <div className="overflow-hidden z-10 whitespace-nowrap body mt-0 ml-1.5 w-full">
          <div className="animate-marquee whitespace-nowrap flex will-change-transform">
            {topics.map((topic, index) => (
              <span
                key={index}
                className={`mr-8 flex items-center font-bold ${
                  isDarkTheme ? "text-dark-secondary" : "text-dark-background"
                }`}
              >
                {topic}
              </span>
            ))}
            <span
              className={`mr-8 flex items-center font-bold ${
                isDarkTheme ? "text-dark-secondary" : "text-dark-background"
              }`}
            >
              <span className="font-bold flex items-center">
                Learn Fast
                <ArrowRightIcon className="h-5 w-5 pl-0.5" />
              </span>
            </span>
          </div>
        </div>

        <div className="w-full z-10">
          <div ref={searchRef}>
            <input
              type="text"
              placeholder="Search topics or subtopics..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="mt-4 px-4 py-2 w-full text-lg border border-gray-300 rounded-t-md focus:outline-none"
            />
            {filteredTopics.length > 0 && (
              <div
                style={{ width: `${width}%` }}
                className="absolute left-0 px-4 transition-all duration-300"
              >
                <List
                  height={200}
                  itemCount={filteredTopics.length}
                  itemSize={35}
                  width={"100%"}
                  ref={listRef}
                >
                  {({ index, style }) => (
                    <div
                      key={index}
                      style={style}
                      className="transition-all ease-in-out duration-300"
                    >
                      <button
                        aria-label={filteredTopics[index].topic}
                        onClick={() => handleTopicClick(filteredTopics[index])}
                        className={`flex-grow py-2 px-4 w-full text-light-background body-bold text-left text-xl ${
                          selectedIndex === index
                            ? "bg-blue-300"
                            : isDarkTheme
                            ? "bg-dark-secondary"
                            : "bg-dark-background"
                        } hover:bg-blue-500 focus:bg-blue-500 transition-colors duration-200`}
                      >
                        {filteredTopics[index].topic}
                        <button
                          aria-label={filteredTopics[index].language}
                          className={`py-2 px-4 capitalize body-bold text-sm ${
                            isDarkTheme
                              ? "text-dark-background"
                              : "text-light-background"
                          }`}
                          style={{
                            backgroundColor: filteredTopics[index].color,
                          }}
                        >
                          {filteredTopics[index].language}
                        </button>
                      </button>
                    </div>
                  )}
                </List>
              </div>
            )}
          </div>
        </div>

        <style jsx="true">{`
          @keyframes marquee {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
          .animate-marquee {
            display: inline-flex;
            animation: marquee 100s linear infinite;
            will-change: transform; /* Optimize for performance */
          }
        `}</style>
      </div>
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
}) {
  const toggleSettings = useCallback(() => {
    setIsMediaOnly((prev) => !prev);
  }, [setIsMediaOnly]);

  const handleHomeClick = useCallback(() => {
    setShowWelcome(true);
  }, [setShowWelcome]);

  return (
    <div className="flex justify-between justify-center items-center bg-transparent m-4 z-10">
      <div className="flex space-x-2">
        <Tooltip title="Exit" placement="top">
          <button
            aria-label="Settings"
            onClick={handleHide}
            className={`p-2 rounded bg-redSpecial text-white hover:bg-red-800`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </Tooltip>
        {!showWelcome && (
          <Tooltip title="Home" placement="top">
            <button
              aria-label="Home"
              onClick={handleHomeClick}
              className={`p-2 rounded ${
                isDarkTheme
                  ? "bg-dark-secondary text-dark-background"
                  : "bg-light-text1  text-light-secondary"
              }`}
            >
              <HomeIcon className="h-5 w-5" />
            </button>
          </Tooltip>
        )}

        <Tooltip title="Theme Toggle" placement="top">
          <button
            aria-label="Theme Toggle"
            onClick={toggleTheme}
            className={`p-2 rounded ${
              isDarkTheme
                ? "bg-dark-secondary text-dark-background"
                : "bg-light-text1  text-light-secondary"
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
      <div
        className={`flex flex-col text-sm justify-center text-center items-center`}
      >
        <p
          className={`font-bold justify-center items-center  px-2 ${
            isDarkTheme ? "text-dark-secondary" : "text-light-secondary"
          }  `}
        >
          Copyright ©2024 Proladict. All rights reserved.
        </p>
        {/* <Link
          to="/terms"
          className={`font-semibold text-white ${
            isDarkTheme ? "text-white" : "text-blue-700"
          }`}
        >
          Terms of Use
        </Link> */}
      </div>
      <div className="flex space-x-2">
        {!showWelcome && (
          <Tooltip title="Media-Only" placement="top">
            <button
              aria-label="Media-Only"
              onClick={toggleSettings}
              className={`p-2 rounded ${
                isDarkTheme
                  ? "bg-dark-secondary text-dark-background"
                  : "bg-light-text1  text-light-secondary"
              }`}
            >
              <EyeIcon className="h-5 w-5" />
            </button>
          </Tooltip>
        )}
        <Tooltip title="Expand" placement="top">
          <button
            aria-label="Expand"
            onClick={handleExpand}
            className={`p-2 rounded ${
              isDarkTheme
                ? "bg-dark-secondary text-dark-background"
                : "bg-light-text1  text-light-secondary"
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
Buttons.propTypes = {
  handleExpand: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  isDarkTheme: PropTypes.bool.isRequired,
  handleHide: PropTypes.func.isRequired,
  toggleTheme: PropTypes.func.isRequired,
  setShowWelcome: PropTypes.func.isRequired,
  showWelcome: PropTypes.oneOfType([PropTypes.bool, PropTypes.object])
    .isRequired,
  setIsMediaOnly: PropTypes.func.isRequired,
};
Welcome.propTypes = {
  isDarkTheme: PropTypes.bool.isRequired,
  setSelectedTopic: PropTypes.func.isRequired,
  setShowWelcome: PropTypes.func.isRequired,
  handleExpand: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  width: PropTypes.number.isRequired,
  handleHide: PropTypes.func.isRequired,
  toggleTheme: PropTypes.func.isRequired,
  showWelcome: PropTypes.oneOfType([PropTypes.bool, PropTypes.object])
    .isRequired,
  setIsMediaOnly: PropTypes.func.isRequired,
};
