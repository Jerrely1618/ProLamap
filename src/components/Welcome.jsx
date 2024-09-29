import { ArrowRightIcon } from "@heroicons/react/24/solid";

export default function Welcome({ isDarkTheme, options }) {
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
        className={`text-8xl font-bold bubble ${
          isDarkTheme ? "text-dark-text1" : "text-light-secondary"
        }`}
      >
        ProlaMap
      </h1>

      <div className="overflow-hidden whitespace-nowrap body mt-5 ml-1.5 w-full">
        <div className="animate-marquee whitespace-nowrap flex">
          {options.map((option, index) => (
            <span
              key={index}
              className={`mr-8 flex items-center font-bold ${
                isDarkTheme ? "text-dark-secondary" : "text-dark-background"
              }`}
            >
              {option.label === "Coming Soon" ? (
                <span className="font-bold flex items-center">
                  {option.label}
                  <ArrowRightIcon className="h-5 w-5 pl-0.5" />
                </span>
              ) : (
                option.label
              )}
            </span>
          ))}
        </div>
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
