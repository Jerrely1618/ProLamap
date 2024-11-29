import { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
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
import { useTheme } from "next-themes";
import { useExpanded } from "../providers/ExpansionProvider";

export default function Welcome() {
  const router = useRouter();
  const { theme } = useTheme();
  const { expanded } = useExpanded();
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
      }`
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
          theme === "dark" ? "text-dark-secondary" : "text-dark-background"
        } absolute md:top-5 bottom-5 z-10`}
      >
        <div>
          <span>#Quick</span>
          <span>Relearn</span>
          <span>Remember</span>
          <span>Reapply!</span>
        </div>
      </div>
      <div className="flex flex-col items-center p-4 h-screen justify-center z-10">
        <div className="w-full max-w-2xl z-20 mt-[20vh]">
          <h1 className={`flex justify-center items-end font-light pb-2 title`}>
            <svg
              width="155"
              height="64"
              viewBox="0 0 1780 614"
              className="h-auto"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M214.316 594V164V159H214.239C211.773 79.338 150.593 13.9508 71.1361 1.96537C79.513 0.670918 88.0882 0 96.8157 0C191.533 0 268.316 79.0217 268.316 176.5C268.316 177.335 268.31 178.168 268.299 179H268.316V614H167.316V594H214.316ZM0 322.206C27.5524 341.634 60.8944 353 96.8157 353C105.481 353 113.996 352.339 122.316 351.062V309.892C99.0891 321.466 72.7411 328 44.8159 328C29.3022 328 14.2754 325.983 0 322.206ZM324 290V1.99999H445.6C448.4 1.99999 452.133 2.13332 456.8 2.39998C461.6 2.53332 465.867 2.93333 469.6 3.59999C486.8 6.26666 500.867 11.9333 511.8 20.6C522.867 29.2666 531 40.2 536.2 53.4C541.4 66.4667 544 81.0667 544 97.2C544 121.333 538 142 526 159.2C518.592 169.736 508.593 177.782 496.002 183.338L548 290H486.4L439.099 192.4H378.4V290H324ZM378.4 141.6H443.2C446 141.6 449.067 141.467 452.4 141.2C455.733 140.933 458.8 140.4 461.6 139.6C468.933 137.6 474.6 134.267 478.6 129.6C482.6 124.8 485.333 119.533 486.8 113.8C488.4 107.933 489.2 102.4 489.2 97.2C489.2 92 488.4 86.5333 486.8 80.8C485.333 74.9333 482.6 69.6667 478.6 65C474.6 60.2 468.933 56.8 461.6 54.8C458.8 54 455.733 53.4667 452.4 53.2C449.067 52.9333 446 52.8 443.2 52.8H378.4V141.6ZM591.969 290V1.99999H779.969V52.8H646.369V114.4H755.969V165.2H646.369V239.2H779.969V290H591.969ZM324 614V326H445.6C448.4 326 452.133 326.133 456.8 326.4C461.6 326.533 465.867 326.933 469.6 327.6C486.8 330.267 500.867 335.933 511.8 344.6C522.867 353.267 531 364.2 536.2 377.4C541.4 390.467 544 405.067 544 421.2C544 445.333 538 466 526 483.2C518.592 493.736 508.593 501.782 496.002 507.338L548 614H486.4L439.099 516.4H378.4V614H324ZM378.4 465.6H443.2C446 465.6 449.067 465.467 452.4 465.2C455.733 464.933 458.8 464.4 461.6 463.6C468.933 461.6 474.6 458.267 478.6 453.6C482.6 448.8 485.333 443.533 486.8 437.8C488.4 431.933 489.2 426.4 489.2 421.2C489.2 416 488.4 410.533 486.8 404.8C485.333 398.933 482.6 393.667 478.6 389C474.6 384.2 468.933 380.8 461.6 378.8C458.8 378 455.733 377.467 452.4 377.2C449.067 376.933 446 376.8 443.2 376.8H378.4V465.6ZM591.969 614V326H779.969V376.8H646.369V438.4H755.969V489.2H646.369V563.2H779.969V614H591.969ZM810.5 1.99998V614H926.1V406.6H1055.09L1155.6 614H1286.5L1176 387.342C1202.76 375.536 1224.01 358.438 1239.75 336.05C1265.25 299.5 1278 255.583 1278 204.3C1278 170.017 1272.47 138.992 1261.43 111.225C1250.38 83.175 1233.09 59.9416 1209.57 41.5249C1186.34 23.1083 1156.45 11.0666 1119.9 5.39998C1111.97 3.98332 1102.9 3.13331 1092.7 2.84996C1082.78 2.28331 1074.85 1.99998 1068.9 1.99998H810.5ZM1063.8 298.65H926.1V109.95H1063.8C1069.75 109.95 1076.27 110.233 1083.35 110.8C1090.43 111.367 1096.95 112.5 1102.9 114.2C1118.48 118.45 1130.53 125.675 1139.03 135.875C1147.53 145.792 1153.33 156.983 1156.45 169.45C1159.85 181.633 1161.55 193.25 1161.55 204.3C1161.55 215.35 1159.85 227.108 1156.45 239.575C1153.33 251.758 1147.53 262.95 1139.03 273.15C1130.53 283.067 1118.48 290.15 1102.9 294.4C1096.95 296.1 1090.43 297.233 1083.35 297.8C1076.27 298.367 1069.75 298.65 1063.8 298.65ZM1379.93 1.99998V614H1779.43V506.05H1495.53V348.8H1728.43V240.85H1495.53V109.95H1779.43V1.99998H1379.93Z"
                fill={`${theme === "dark" ? "#BECDFA" : "#2E073F"}`}
              />
            </svg>

            <span className="text-xl md:text-2xl sm:text-xl flex flex-col justify-end pl-2">
              <span className={`text-blue-500`}>Language,</span>
              <span
                className={`${
                  theme === "dark" ? "text-dark-secondary" : "text-third-text1"
                }`}
              >
                Data Structure & Algorithms
              </span>
            </span>
          </h1>
          <div className="flex flex-col items-center justify-center w-full">
            {expanded > 50 && (
              <div className="overflow-hidden z-20 whitespace-nowrap body mt-0 ml-1.5 w-full">
                <div className="animate-marquee whitespace-nowrap flex will-change-transform">
                  {topics.map((topic, index) => (
                    <span
                      key={index}
                      className={`mr-8 flex items-center text-xs md:text-sm sm:text-sm font-bold ${
                        theme === "dark"
                          ? "text-dark-secondary"
                          : "text-dark-background"
                      }`}
                    >
                      {topic}
                    </span>
                  ))}
                  <span
                    className={`mr-8 flex items-center font-bold ${
                      theme === "dark"
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
                  className={`mt-4 px-4 py-2 w-full text-lg border border-gray-300 focus:outline-none bg-white ${
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
                                : theme === "dark"
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
                    theme === "dark"
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
      <Buttons/>
    </>
  );
}
function Buttons() {
  const { theme, setTheme } = useTheme();
  const { expanded, setExpanded } = useExpanded();
  const handleHide = () => setExpanded(0);
  const handleExpand = () => setExpanded(100);
  const handleMinimize = () => setExpanded(40);
  return (
    <div className="flex justify-between justify-center items-center bg-transparent m-4 z-10">
      <div className="flex space-x-2">
        {expanded > 0 && (
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
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`p-2 rounded transition-color duration-300 ${
              theme === "dark"
                ? "bg-dark-secondary text-dark-background hover:text-white"
                : "bg-light-text1  text-light-secondary hover:text-dark-background"
            }`}
          >
            {theme === "dark" ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
        </Tooltip>
      </div>
      <div
        className={`flex flex-col text-sm justify-center text-center items-center ${
          expanded === 100 ? "" : "-ml-10"
        } ${
          theme === "dark" ? "text-dark-secondary" : "text-light-secondary"
        } `}
      >
        <p className={`font-bold justify-center items-center  px-2  `}>
          Copyright ©2024 qReReRe. All rights reserved.
        </p>
        <Link href="/terms" className={`font-semibold`}>
          Terms of Use
        </Link>
      </div>
      <div className="flex space-x-2">
        <Tooltip title="Expand" placement="top">
          <button
            aria-label="Expand"
            onClick={expanded > 40 ? handleMinimize : handleExpand}
            className={`p-2 rounded transition-color duration-300 ${
              theme === "dark"
                ? "bg-dark-secondary text-dark-background hover:bg-third-primary hover:text-white"
                : "bg-light-text1  text-light-secondary hover:bg-blue-500 hover:text-white"
            }`}
          >
            {expanded > 40 ? (
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
