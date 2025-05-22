import { animate } from "animejs";
import React, { useEffect, useRef } from "react";

import { useAtomStore, ViewMode } from "@/lib/stores/atomStore";

const ViewToggles: React.FC = () => {
  const { viewMode, setViewMode } = useAtomStore();
  const orbitButtonRef = useRef<HTMLButtonElement>(null);
  const cloudButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initial animation
  useEffect(() => {
    if (containerRef.current) {
      animate(containerRef.current, {
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 800,
        easing: "easeOutQuad",
        delay: 200,
      });
    }
  }, []);

  // Animation when changing view mode
  useEffect(() => {
    if (viewMode === "orbit" && orbitButtonRef.current) {
      animate(orbitButtonRef.current, {
        scale: [1, 1.1, 1],
        boxShadow: [
          "0 0 0 rgba(79, 70, 229, 0)",
          "0 0 20px rgba(79, 70, 229, 0.5)",
          "0 0 0 rgba(79, 70, 229, 0)",
        ],
        duration: 500,
        easing: "easeInOutQuad",
      });
    } else if (viewMode === "cloud" && cloudButtonRef.current) {
      animate(cloudButtonRef.current, {
        scale: [1, 1.1, 1],
        boxShadow: [
          "0 0 0 rgba(79, 70, 229, 0)",
          "0 0 20px rgba(79, 70, 229, 0.5)",
          "0 0 0 rgba(79, 70, 229, 0)",
        ],
        duration: 500,
        easing: "easeInOutQuad",
      });
    }
  }, [viewMode]);

  // Handle toggle clicks
  const handleToggleView = (mode: ViewMode) => {
    setViewMode(mode);
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col sm:flex-row gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-indigo-100 dark:border-indigo-900"
    >
      <button
        ref={orbitButtonRef}
        className={`px-3 sm:px-4 py-2 rounded-md font-semibold transition-all duration-300 flex items-center justify-center text-sm sm:text-base touch-optimized-button ${
          viewMode === "orbit"
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md transform scale-105"
            : "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 hover:shadow"
        }`}
        onClick={() => handleToggleView("orbit")}
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
          <path
            d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z"
            stroke="currentColor"
            strokeDasharray="5 5"
            strokeWidth="2"
          />
        </svg>
        <span className="hidden sm:inline">Orbit View</span>
        <span className="sm:hidden">Orbit</span>
      </button>

      <button
        ref={cloudButtonRef}
        className={`px-3 sm:px-4 py-2 rounded-md font-semibold transition-all duration-300 flex items-center justify-center text-sm sm:text-base touch-optimized-button ${
          viewMode === "cloud"
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md transform scale-105"
            : "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 hover:shadow"
        }`}
        onClick={() => handleToggleView("cloud")}
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" fill="currentColor" r="2" />
          <circle cx="8" cy="10" fill="currentColor" r="1" />
          <circle cx="15" cy="9" fill="currentColor" r="1" />
          <circle cx="17" cy="12" fill="currentColor" r="1" />
          <circle cx="14" cy="15" fill="currentColor" r="1" />
          <circle cx="9" cy="15" fill="currentColor" r="1" />
          <circle cx="6" cy="12" fill="currentColor" r="1" />
          <path
            d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
        <span className="hidden sm:inline">Electron Cloud</span>
        <span className="sm:hidden">Cloud</span>
      </button>
    </div>
  );
};

export default ViewToggles;
