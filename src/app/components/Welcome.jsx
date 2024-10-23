import { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
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
import { useRouter } from "next/navigation";

export default function Welcome({
  isDarkTheme,
  handleExpand,
  isExpanded,
  handleHide,
  toggleTheme,
}) {
  const router = useRouter();
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
        const searchTerms = value
          .split(" ")
          .map((term) => term.trim())
          .filter((term) => term);

        const results = [];

        searchTerms.forEach((term) => {
          const matchedTopics = trie.searchFuzzy(term);
          results.push(...matchedTopics);
        });

        const uniqueResults = Array.from(
          new Set(results.map(JSON.stringify))
        ).map(JSON.parse);
        setFilteredTopics(uniqueResults);
      }
    }, 50),
    [trie]
  );

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setSelectedIndex(-1);
    handleSearch(event.target.value);
  };

  const handleTopicClick = (item) => {
    router.push(
      `/content/${
        item.parentTopic ? item.parentTopic : item.topic
      }?isExpanded=${isExpanded}&isDarkTheme=${isDarkTheme}`
    );
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
      <div
        className={`body-bold flex space-x-5 left-20 ${
          isDarkTheme ? "text-dark-secondary" : "text-dark-background"
        } absolute md:top-5 bottom-5 z-10`}
      >
        <div>
          <span>#Learn</span>
          <span>Reapply</span>
          <span>Remember</span>
          <span>Code!</span>
        </div>
      </div>
      <div className="flex flex-col items-center p-4 h-screen justify-center z-10">
        <div className="w-full max-w-2xl z-20 mt-[20vh]">
          <h1 className={`flex justify-center items-end font-light pb-2 title`}>
            <span
              className={`${
                isDarkTheme ? "text-dark-secondary" : "text-third-text1"
              } flex items-end`}
            >
              <span className="text-5xl md:text-7xl sm:text-6xl pr-1">|</span>
              <span className="text-5xl md:text-7xl sm:text-6xl">Re:</span>
            </span>

            <span className="text-sm md:text-2xl sm:text-xl flex flex-col justify-end pl-4">
              <span className={`text-blue-500`}>Language,</span>
              <span
                className={`${
                  isDarkTheme ? "text-dark-secondary" : "text-third-text1"
                }`}
              >
                Data Structure & Algorithms
              </span>
            </span>
          </h1>
          <div className="flex flex-col items-center justify-center w-full">
            {isExpanded && (
              <div className="overflow-hidden z-20 whitespace-nowrap body mt-0 ml-1.5 w-full">
                <div className="animate-marquee whitespace-nowrap flex will-change-transform">
                  {topics.map((topic, index) => (
                    <span
                      key={index}
                      className={`mr-8 flex items-center text-xs md:text-sm sm:text-sm font-bold ${
                        isDarkTheme
                          ? "text-dark-secondary"
                          : "text-dark-background"
                      }`}
                    >
                      {topic}
                    </span>
                  ))}
                  <span
                    className={`mr-8 flex items-center font-bold ${
                      isDarkTheme
                        ? "text-dark-secondary"
                        : "text-dark-background"
                    }`}
                  >
                    <span className="font-bold flex items-center">
                      Learn Fast
                      <ArrowRightIcon className="h-5 w-5 pl-0.5" />
                    </span>
                  </span>
                </div>
              </div>
            )}

            <div className="w-full z-20 flex flex-col items-center">
              <div className="w-full" ref={searchRef}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  className={`mt-4 px-4 py-2 w-full text-lg border border-gray-300 focus:outline-none ${
                    filteredTopics.length > 0 ? "rounded-t-md" : "rounded-md"
                  }`}
                />
                <div className="relative z-10 transition-all duration-300 min-h-[30vh]">
                  {filteredTopics.length > 0 && (
                    <List
                      height={Math.max(window.innerHeight * 0.3)}
                      itemCount={filteredTopics.length}
                      itemSize={35}
                      width="100%"
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
                            onClick={() =>
                              handleTopicClick(filteredTopics[index])
                            }
                            className={`flex justify-between h-full pl-4 w-full text-light-background body-bold text-left text-xl ${
                              selectedIndex === index
                                ? "bg-blue-300"
                                : isDarkTheme
                                ? "bg-dark-background"
                                : "bg-light-text2"
                            } hover:bg-blue-500 focus:bg-blue-500 transition-colors duration-200 
                            ${
                              index === filteredTopics.length - 1
                                ? "rounded-b-lg"
                                : ""
                            }`}
                          >
                            <div className="flex items-end space-x-2 py-2">
                              <span className="font-bold">
                                {filteredTopics[index].topic}
                              </span>
                              {filteredTopics[index].parentTopic && (
                                <span className="text-sm font-medium">
                                  {filteredTopics[index].parentTopic}
                                </span>
                              )}
                            </div>
                            <div
                              aria-label={filteredTopics[index].language}
                              className={`py-2 px-4 h-full text-dark-background capitalize body-medium text-lg ml-4 `}
                              style={{
                                backgroundColor: filteredTopics[index].color,
                              }}
                            >
                              {filteredTopics[index].language}
                            </div>
                          </button>
                        </div>
                      )}
                    </List>
                  )}
                </div>
              </div>
              <div className="absolute bottom-28 inline-block">
                <button
                  className={`relative justify-center items-center p-2 transition-color duration-300 bg-rounded body-bold shadow-glassy backdrop-blur-md rounded-md ${
                    isDarkTheme
                      ? "bg-dark-secondary text-dark-background hover:bg-third-primary hover:text-white"
                      : "bg-light-text1 text-white hover:bg-third-background"
                  }`}
                >
                  Community Tab
                </button>

                <div
                  className="absolute top-0 left-0 drop-shadow-lg transform -rotate-12 bg-blue-500 text-white shadow-xl text-black px-2 py-1 text-xs font-bold"
                  style={{
                    transform: "translate(-20%, -50%) rotate(-15deg)",
                  }}
                >
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
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
          will-change: transform;
        }
      `}</style>
      <Buttons
        handleExpand={handleExpand}
        isExpanded={isExpanded}
        isDarkTheme={isDarkTheme}
        handleHide={handleHide}
        toggleTheme={toggleTheme}
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
}) {
  return (
    <div className="flex justify-between justify-center items-center bg-transparent m-4 z-10">
      <div className="flex space-x-2">
        {!isExpanded && (
          <Tooltip title="Exit" placement="top">
            <button
              aria-label="Exit"
              onClick={handleHide}
              className={`p-2 rounded bg-redSpecial text-white hover:bg-red-700`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </Tooltip>
        )}

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
      <div
        className={`flex flex-col text-sm justify-center text-center items-center ${
          isExpanded ? "" : "-ml-10"
        } ${isDarkTheme ? "text-dark-secondary" : "text-light-secondary"} `}
      >
        <p className={`font-bold justify-center items-center  px-2  `}>
          Copyright ©2024 Re. All rights reserved.
        </p>
        <Link href="/terms" className={`font-semibold`}>
          Terms of Use
        </Link>
      </div>
      <div className="flex space-x-2">
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
Buttons.propTypes = {
  handleExpand: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  isDarkTheme: PropTypes.bool.isRequired,
  handleHide: PropTypes.func.isRequired,
  toggleTheme: PropTypes.func.isRequired,
};
Welcome.propTypes = {
  isDarkTheme: PropTypes.bool.isRequired,
  setSelectedTopic: PropTypes.func.isRequired,
  handleExpand: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  width: PropTypes.number.isRequired,
  handleHide: PropTypes.func.isRequired,
  toggleTheme: PropTypes.func.isRequired,
};
