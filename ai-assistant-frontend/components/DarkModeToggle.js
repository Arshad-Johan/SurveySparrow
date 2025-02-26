// components/DarkModeToggle.js
import { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  // On mount, optionally read system or local preference
  useEffect(() => {
    // If you want to respect system preference:
    // If localStorage has a theme, use it; otherwise, use system preference
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setDarkMode(true);
    }
  }, []);

  // Whenever darkMode changes, update <html> class and localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  }, [darkMode]);

  function toggleDarkMode() {
    setDarkMode(!darkMode);
  }

  return (
    <button
      className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full transition"
      onClick={toggleDarkMode}
      title="Toggle Light/Dark Mode"
    >
      {darkMode ? (
        <SunIcon className="h-5 w-5 text-yellow-500" />
      ) : (
        <MoonIcon className="h-5 w-5 text-gray-900" />
      )}
    </button>
  );
}
