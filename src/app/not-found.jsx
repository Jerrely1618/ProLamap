"use client";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { Tooltip } from "antd";
import { useTheme } from "next-themes";
import Link from "next/link";

export default function NotFound() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex h-screen transition-all overflow-hidden duration-300">
      <div
        className={`flex flex-col flex-grow h-full transition-width transition-colors duration-300 shadow-glassy backdrop-blur-md bg-opacity-glass ${
          theme === "dark" ? "bg-dark-gradient" : "bg-light-gradient"
        }`}
      >
        <div className="m-5 flex justify-center">
          <Tooltip title="Theme Toggle" placement="bottom">
            <button
              aria-label="Theme Toggle"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`p-2 rounded transition-color duration-300  ${
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
        <div className="flex flex-col justify-center items-center h-full">
          <h1
            className={`text-[150px] md:text-[300px] sm:text-[200px] title404 ${
              theme === "dark" ? "text-dark-secondary" : "text-third-text1"
            }`}
          >
            404
          </h1>
          <p
            className={`text-2xl -mt-16 ${
              theme === "dark" ? "text-dark-secondary" : "text-third-text1"
            }`}
          >
            Page not found.
          </p>
        </div>
        <p className="text-lg flex justify-center mb-12">
          Lost?{" "}
          <Link className="ml-1" href="/">
            Take me
            <span className={`text-blue-500 ml-1`}>Home</span>, country road!
          </Link>
        </p>
      </div>
    </div>
  );
}
