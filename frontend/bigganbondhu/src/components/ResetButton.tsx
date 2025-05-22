import { useAtomStore } from "@/lib/stores/atomStore";
import { animate } from "animejs";
import React, { useEffect, useRef } from "react";

const ResetButton: React.FC = () => {
  const { resetAtom } = useAtomStore();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initial animation
  useEffect(() => {
    if (containerRef.current) {
      animate(containerRef.current, {
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 800,
        easing: "easeOutQuad",
        delay: 300,
      });
    }
  }, []);

  const handleReset = () => {
    resetAtom();

    if (buttonRef.current) {
      // Play animation when reset is clicked
      animate(buttonRef.current, {
        scale: [1, 0.9, 1],
        boxShadow: [
          "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          "0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        ],
        duration: 400,
        easing: "easeInOutBack",
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-red-100 dark:border-red-900/30"
    >
      <button
        ref={buttonRef}
        className="px-4 py-2 rounded-md bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold
                hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800
                shadow-md hover:shadow-lg transition-all duration-300
                flex items-center justify-center"
        onClick={handleReset}
      >
        <svg
          className="w-5 h-5 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
          <path d="M3 3v5h5"></path>
        </svg>
        Reset
      </button>
    </div>
  );
};

export default ResetButton;
