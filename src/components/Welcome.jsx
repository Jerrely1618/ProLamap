import React, { useEffect, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";

export default function Welcome({
  isDarkTheme,
  options,
  setSelectedSubtopic,
  setSelectedTopic,
  setShowWelcome,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [contentData, setContentData] = useState(null);
  const [topics, setTopics] = useState([]);
  useEffect(() => {
    const fetchContentData = async () => {
      try {
        const response = await fetch("/contents.json");
        const data = await response.json();
        setContentData(data);

        const allTopics = [];
        for (const language in data) {
          const languageData = data[language];

          for (const topic in languageData) {
            if (topic === "color") continue;

            allTopics.push(topic);

            for (const subtopic in languageData[topic]) {
              allTopics.push(subtopic);
            }
          }
        }
        setTopics(allTopics);
      } catch (error) {
        console.error("Error fetching content data:", error);
      }
    };

    fetchContentData();
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const results = [];
    for (const language in contentData) {
      const languageData = contentData[language];
      const color = languageData.color;
      for (const topic in languageData) {
        if (topic === "color") continue;
        if (topic.toLowerCase().includes(value)) {
          results.push({ topic, language: capitalize(language), color });
        }
        for (const subtopic in languageData[topic]) {
          if (subtopic.toLowerCase().includes(value)) {
            results.push({
              topic: subtopic,
              language: capitalize(language),
              color,
              parentTopic: topic,
            });
          }
        }
      }
    }
    setFilteredTopics(results);
  };

  const handleTopicClick = (item) => {
    if (item.parentTopic) {
      setSelectedTopic(capitalize(item.parentTopic));
      setSelectedSubtopic(capitalize(item.topic));
    } else {
      setSelectedTopic(capitalize(item.topic));
      setSelectedSubtopic("");
    }
    setShowWelcome(false);
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div className="flex flex-col items-start p-4 h-screen justify-center">
      <h2
        className={`text-4xl body font-semibold mb-1 ${
          isDarkTheme ? "text-dark-secondary" : "text-dark-background"
        }`}
      >
        Welcome to
      </h2>
      <h1
        className={`text-8xl font-light bubble ${
          isDarkTheme ? "text-dark-text1" : "text-light-secondary"
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

      <input
        type="text"
        placeholder="Search topics or subtopics..."
        value={searchTerm}
        onChange={handleSearch}
        className="mt-4 px-4 py-2 w-full text-lg border border-gray-300 rounded-t-md focus:outline-none focus:ring-2 focus:ring-blue-600"
      />

      <div className="w-full">
        {filteredTopics.length !== 0 && (
          <ul className="bg-red">
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
                    isDarkTheme ? "bg-dark-secondary " : "bg-dark-background"
                  } hover:bg-blue-500 focus:bg-blue-500 transition-colors duration-200 ${
                    index === filteredTopics.length - 1 ? "rounded-bl-lg" : ""
                  }`}
                >
                  {topic.topic}
                </button>
                <button
                  className={`py-2 px-4 body-bold text-sm ${
                    index === filteredTopics.length - 1 ? "rounded-br-lg" : ""
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

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
