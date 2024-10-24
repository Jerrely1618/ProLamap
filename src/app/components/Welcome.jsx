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
import Image from "next/image";

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
            <svg
              width="100"
              height="64"
              viewBox="0 0 1204 614"
              className="h-auto"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M214.316 164V594H167.316V614H268.316V179H268.299C268.31 178.168 268.316 177.335 268.316 176.5C268.316 79.0217 191.533 0 96.8157 0C88.0882 0 79.513 0.670918 71.1361 1.96537C150.593 13.9508 211.773 79.338 214.239 159H214.316V164ZM96.8157 353C60.8944 353 27.5524 341.634 0 322.206C14.2754 325.983 29.3022 328 44.8159 328C72.7411 328 99.0891 321.466 122.316 309.892V351.062C113.996 352.339 105.481 353 96.8157 353ZM348.816 74V614H450.816V431H564.627L653.316 614H768.816L671.32 414.008C694.927 403.59 713.676 388.504 727.566 368.75C750.066 336.5 761.316 297.75 761.316 252.5C761.316 222.25 756.441 194.875 746.691 170.375C736.941 145.625 721.691 125.125 700.941 108.875C680.441 92.625 654.066 82 621.816 77C614.816 75.75 606.816 75 597.816 74.75C589.066 74.25 582.066 74 576.816 74H348.816ZM572.316 335.75H450.816V169.25H572.316C577.566 169.25 583.316 169.5 589.566 170C595.816 170.5 601.566 171.5 606.816 173C620.566 176.75 631.191 183.125 638.691 192.125C646.191 200.875 651.316 210.75 654.066 221.75C657.066 232.5 658.566 242.75 658.566 252.5C658.566 262.25 657.066 272.625 654.066 283.625C651.316 294.375 646.191 304.25 638.691 313.25C631.191 322 620.566 328.25 606.816 332C601.566 333.5 595.816 334.5 589.566 335C583.316 335.5 577.566 335.75 572.316 335.75ZM851.257 74V614H1203.76V518.75H953.257V380H1158.76V284.75H953.257V169.25H1203.76V74H851.257Z"
                fill={`${isDarkTheme ? "#BECDFA" : "#2E073F"}`}
              />
            </svg>
            {/* <svg
              width="100"
              height="64"
              className="h-auto"
              viewBox="0 0 1196 614"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M260.053 179C260.064 178.168 260.07 177.335 260.07 176.5C260.07 79.0217 183.287 0 88.5698 0C56.1611 0 25.852 9.25158 0 25.3285C87.2222 31.0372 156.725 110.444 159.356 208.626H159.433V214.401V614H260.07V179H260.053ZM340.57 74V614H442.57V431H556.381L645.07 614H760.57L663.074 414.008C686.682 403.59 705.43 388.504 719.32 368.75C741.82 336.5 753.07 297.75 753.07 252.5C753.07 222.25 748.195 194.875 738.445 170.375C728.695 145.625 713.445 125.125 692.695 108.875C672.195 92.625 645.82 82 613.57 77C606.57 75.75 598.57 75 589.57 74.75C580.82 74.25 573.82 74 568.57 74H340.57ZM564.07 335.75H442.57V169.25H564.07C569.32 169.25 575.07 169.5 581.32 170C587.57 170.5 593.32 171.5 598.57 173C612.32 176.75 622.945 183.125 630.445 192.125C637.945 200.875 643.07 210.75 645.82 221.75C648.82 232.5 650.32 242.75 650.32 252.5C650.32 262.25 648.82 272.625 645.82 283.625C643.07 294.375 637.945 304.25 630.445 313.25C622.945 322 612.32 328.25 598.57 332C593.32 333.5 587.57 334.5 581.32 335C575.07 335.5 569.32 335.75 564.07 335.75ZM843.011 74V614H1195.51V518.75H945.011V380H1150.51V284.75H945.011V169.25H1195.51V74H843.011Z"
                fill={`${isDarkTheme ? "#BECDFA" : "#2E073F"}`}
              />
            </svg> */}

            <span className="text-xl md:text-2xl sm:text-xl flex flex-col justify-end pl-2">
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
