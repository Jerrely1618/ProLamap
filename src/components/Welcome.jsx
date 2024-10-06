import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { Trie, serializeTrie, deserializeTrie } from "../utils/Trie";

export default function Welcome({
  isDarkTheme,
  setSelectedTopic,
  setShowWelcome,
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
      const allTopics = deserializedTrie.getAllTopics();
      setTopics(allTopics);
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

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    setSelectedIndex(-1);

    if (trie) {
      const results = trie.searchPrefix(value);
      setFilteredTopics(results);
    }
  };
  const handleTopicClick = (item) => {
    if (item.parentTopic) {
      setSelectedTopic(capitalize(item.parentTopic));
    } else {
      setSelectedTopic(capitalize(item.topic));
    }
    setShowWelcome(false);
  };
  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      setSelectedIndex((prevIndex) =>
        prevIndex < filteredTopics.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (event.key === "ArrowUp") {
      setSelectedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : prevIndex
      );
    } else if (event.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < filteredTopics.length) {
        handleTopicClick(filteredTopics[selectedIndex]);
      }
    }
  };
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedItem = listRef.current.children[selectedIndex];
      if (selectedItem) {
        selectedItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedIndex]);
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
  return (
    <div className="flex flex-col items-start p-4 h-screen justify-center">
      <h2
        className={`md:text-4xl text-3xl sm:text-2xl body font-semibold mb-1 ${
          isDarkTheme ? "text-dark-secondary" : "text-dark-background"
        }`}
      >
        Welcome to
      </h2>
      <h1
        className={`md:text-8xl text-4xl sm:text-5xl font-light bubble ${
          isDarkTheme ? "text-dark-secondary" : " text-third-text1"
        } `}
      >
        ProlaMap
      </h1>

      <div className="overflow-hidden whitespace-nowrap body mt-5 ml-1.5 w-full">
        <div className="animate-marquee whitespace-nowrap flex">
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

      <div className="w-full">
        <div ref={searchRef}>
          <input
            type="text"
            placeholder="Search topics or subtopics..."
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            className="mt-4 px-4 py-2 w-full text-lg border border-gray-300 rounded-t-md focus:outline-none "
          />
          <div className="w-full max-h-60 overflow-y-auto scrollbar-left">
            {filteredTopics.length !== 0 && (
              <ul ref={listRef} className="bg-red">
                {filteredTopics.map((topic, index) => (
                  <li
                    key={index}
                    className={`flex ${
                      index === filteredTopics.length - 1 ? "rounded-b-lg" : ""
                    }`}
                  >
                    <button
                      onClick={() => handleTopicClick(topic)}
                      className={`flex-grow py-2 px-4 w-full text-light-background body-bold text-left text-xl ${
                        selectedIndex === index
                          ? "bg-blue-300"
                          : isDarkTheme
                          ? "bg-dark-secondary"
                          : "bg-dark-background"
                      }  hover:bg-blue-500 focus:bg-blue-500 transition-colors duration-200 
                      `}
                    >
                      {topic.topic}
                    </button>
                    <button
                      className={`py-2 px-4 capitalize body-bold text-sm ${
                        index === filteredTopics.length - 1
                          ? "rounded-br-lg"
                          : ""
                      } ${
                        isDarkTheme
                          ? "text-dark-background"
                          : "text-light-background"
                      }`}
                      style={{ backgroundColor: topic.color }}
                    >
                      {topic.language}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(10%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 45s linear infinite;
        }
      `}</style>
    </div>
  );
}
