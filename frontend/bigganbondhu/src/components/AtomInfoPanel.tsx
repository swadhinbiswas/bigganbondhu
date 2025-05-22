import { animate } from "animejs";
import React, { useEffect, useRef } from "react";

import { useAtomStore } from "@/lib/stores/atomStore";

const AtomInfoPanel: React.FC = () => {
  const {
    protons,
    neutrons,
    electrons,
    element,
    massNumber,
    netCharge,
    // stability, // Removed unused variable
    isStable,
  } = useAtomStore();

  const protonCountRef = useRef<HTMLSpanElement>(null);
  const neutronCountRef = useRef<HTMLSpanElement>(null);
  const electronCountRef = useRef<HTMLSpanElement>(null);
  const massNumberRef = useRef<HTMLSpanElement>(null);
  const netChargeRef = useRef<HTMLSpanElement>(null);
  const elementNameRef = useRef<HTMLDivElement>(null); // Changed to HTMLDivElement
  const panelRef = useRef<HTMLDivElement>(null);

  // Initial panel animation
  useEffect(() => {
    if (panelRef.current) {
      animate(panelRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        easing: "easeOutQuad",
      });
    }
  }, []);

  // Animation when values change
  useEffect(() => {
    if (protonCountRef.current) {
      animate(protonCountRef.current, {
        scale: [1, 1.25, 1],
        color: ["#FF0000", "#FF5555", "#FF0000"],
        duration: 300,
        easing: "easeInOutQuad",
      });
    }
  }, [protons]);

  useEffect(() => {
    if (neutronCountRef.current) {
      animate(neutronCountRef.current, {
        scale: [1, 1.25, 1],
        color: ["#777777", "#AAAAAA", "#777777"],
        duration: 300,
        easing: "easeInOutQuad",
      });
    }
  }, [neutrons]);

  useEffect(() => {
    if (electronCountRef.current) {
      animate(electronCountRef.current, {
        scale: [1, 1.25, 1],
        color: ["#0000FF", "#5555FF", "#0000FF"],
        duration: 300,
        easing: "easeInOutQuad",
      });
    }
  }, [electrons]);

  useEffect(() => {
    if (elementNameRef.current && element) {
      animate(elementNameRef.current, {
        translateY: [10, 0],
        opacity: [0, 1],
        duration: 400,
        easing: "easeOutQuad",
      });
    }
  }, [element?.name]);

  // Determine status color based on charge
  const getStatusColor = () => {
    if (netCharge > 0) return "text-red-600 dark:text-red-400";
    if (netCharge < 0) return "text-blue-600 dark:text-blue-400";

    return "text-green-600 dark:text-green-400";
  };

  // Determine status text
  const getStatusText = () => {
    if (netCharge > 0) return `Positive (${netCharge}+)`;
    if (netCharge < 0) return `Negative (${Math.abs(netCharge)}-)`;

    return "Neutral";
  };

  // Determine stability text
  const getStabilityText = () => {
    if (!isStable) return "Unstable";
    if (netCharge !== 0) return "Ionized";

    return "Stable";
  };

  // Determine stability color
  const getStabilityColor = () => {
    if (!isStable) return "text-red-600 dark:text-red-400";
    if (netCharge !== 0) return "text-yellow-600 dark:text-yellow-400";

    return "text-green-600 dark:text-green-400";
  };

  return (
    <div
      ref={panelRef}
      className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg p-4 transition-all duration-300 border border-indigo-100 dark:border-indigo-900"
    >
      <h2 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-4 pb-2 border-b border-indigo-100 dark:border-indigo-800/50">
        Atom Info
      </h2>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="text-gray-600 dark:text-gray-300 flex items-center">
            <svg
              className="w-4 h-4 mr-1.5 text-indigo-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                fillRule="evenodd"
              />
            </svg>
            Element:
          </div>
          <div
            ref={elementNameRef}
            className="font-bold text-right text-lg text-indigo-700 dark:text-indigo-300"
          >
            {element ? element.name : "None"}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-100 dark:border-red-800/30">
            <div className="text-gray-600 dark:text-gray-300 text-sm mb-1">
              Protons:
            </div>
            <div className="text-center">
              <span
                ref={protonCountRef}
                className="font-bold text-xl text-red-600 dark:text-red-400"
              >
                {protons}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/20 p-2 rounded-lg border border-gray-100 dark:border-gray-700/30">
            <div className="text-gray-600 dark:text-gray-300 text-sm mb-1">
              Neutrons:
            </div>
            <div className="text-center">
              <span
                ref={neutronCountRef}
                className="font-bold text-xl text-gray-600 dark:text-gray-400"
              >
                {neutrons}
              </span>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-800/30">
            <div className="text-gray-600 dark:text-gray-300 text-sm mb-1">
              Electrons:
            </div>
            <div className="text-center">
              <span
                ref={electronCountRef}
                className="font-bold text-xl text-blue-600 dark:text-blue-400"
              >
                {electrons}
              </span>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg border border-purple-100 dark:border-purple-800/30">
            <div className="text-gray-600 dark:text-gray-300 text-sm mb-1">
              Mass Number:
            </div>
            <div className="text-center">
              <span
                ref={massNumberRef}
                className="font-bold text-xl text-purple-600 dark:text-purple-400"
              >
                {massNumber}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
          <div className="flex justify-between items-center">
            <div className="text-gray-600 dark:text-gray-300">Net Charge:</div>
            <div>
              <span
                ref={netChargeRef}
                className={`font-bold ${getStatusColor()}`}
              >
                {getStatusText()}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center mt-2">
            <div className="text-gray-600 dark:text-gray-300">Status:</div>
            <div>
              <span className={`font-bold ${getStabilityColor()}`}>
                {getStabilityText()}
              </span>
            </div>
          </div>
        </div>

        {element && (
          <div className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400 italic">
            {element.symbol} - {element.name}
          </div>
        )}
      </div>
    </div>
  );
};

export default AtomInfoPanel;
