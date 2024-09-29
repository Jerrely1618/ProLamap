import React, { useEffect, useState } from "react";

export default function Content({
  isDarkTheme,
  selectedCourse,
  selectedTopic,
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
          setSelectedStep(
            Object.keys(data[selectedCourse.value][selectedTopic])[0]
          );
        }

        console.log(data, selectedCourse, selectedTopic);
      } catch (error) {
        console.error("Error fetching content data:", error);
      }
    };

    fetchContentData();
  }, [selectedCourse.value, selectedTopic]);

  if (!contentData) {
    return <div>Loading...</div>;
  }

  const steps = Object.keys(
    contentData[selectedCourse.value][selectedTopic] || {}
  );

  return (
    <div className="mt-10 mx-5">
      <h1 className="text-dark-text1 text-5xl body-bold">{selectedTopic}</h1>
      <div className="mb-4 border-b border-gray-300">
        {steps.map((step) => (
          <button
            key={step}
            onClick={() => setSelectedStep(step)}
            className={`py-2 px-4 rounded-t transition-colors duration-300 mt-10
            ${
              selectedStep === step
                ? "bg-blue-600 text-white rounded-t"
                : "bg-gray-200 text-black hover:bg-blue-600 hover:text-white rounded-t"
            }`}
          >
            {step}
          </button>
        ))}
      </div>
      <ContentForStep
        step={selectedStep}
        selectedCourse={selectedCourse}
        selectedTopic={selectedTopic}
        contentData={contentData}
      />
    </div>
  );
}

function ContentForStep({ step, selectedCourse, selectedTopic, contentData }) {
  const topicContent =
    contentData[selectedCourse.value]?.[selectedTopic]?.[step] || [];

  if (topicContent.length === 0) {
    return <p>No content available for {step}</p>;
  }

  return (
    <div>
      {topicContent.map((item, index) => (
        <div key={index}>
          {item.type === "text" && <p>{item.content}</p>}
          {item.type === "video" && (
            <a href={item.content} target="_blank" rel="noopener noreferrer">
              Watch Video
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
