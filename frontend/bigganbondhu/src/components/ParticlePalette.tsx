import React, { useRef } from "react";
import { useDrag } from "react-dnd";
import { v4 as uuidv4 } from "uuid";

import { useAtomStore } from "@/lib/stores/atomStore";
import { DragTypes } from "@/lib/dragTypes";

const ParticlePalette: React.FC = () => {
  const {
    addProton,
    addNeutron,
    addElectron,
    removeProton,
    removeNeutron,
    removeElectron,
  } = useAtomStore();

  const protonRef = useRef<HTMLDivElement | null>(null);
  const neutronRef = useRef<HTMLDivElement | null>(null);
  const electronRef = useRef<HTMLDivElement | null>(null);

  // Create draggable proton
  const [{ isDraggingProton }, dragProton] = useDrag(() => ({
    type: DragTypes.PARTICLE,
    item: { id: uuidv4(), type: "proton" },
    collect: (monitor) => ({
      isDraggingProton: monitor.isDragging(),
    }),
    end: (_, monitor) => {
      const didDrop = monitor.didDrop();

      if (didDrop) {
        // Successfully dropped on target
        addProton();
        pulseAnimation(protonRef.current, "#FF5555");
      }
    },
  }));

  // Create draggable neutron
  const [{ isDraggingNeutron }, dragNeutron] = useDrag(() => ({
    type: DragTypes.PARTICLE,
    item: { id: uuidv4(), type: "neutron" },
    collect: (monitor) => ({
      isDraggingNeutron: monitor.isDragging(),
    }),
    end: (_, monitor) => {
      const didDrop = monitor.didDrop();

      if (didDrop) {
        // Successfully dropped on target
        addNeutron();
        pulseAnimation(neutronRef.current, "#AAAAAA");
      }
    },
  }));

  // Create draggable electron
  const [{ isDraggingElectron }, dragElectron] = useDrag(() => ({
    type: DragTypes.PARTICLE,
    item: { id: uuidv4(), type: "electron" },
    collect: (monitor) => ({
      isDraggingElectron: monitor.isDragging(),
    }),
    end: (_, monitor) => {
      const didDrop = monitor.didDrop();

      if (didDrop) {
        // Successfully dropped on target
        addElectron();
        pulseAnimation(electronRef.current, "#5555FF");
      }
    },
  }));

  // Animation for adding particles via click
  const pulseAnimation = (element: HTMLElement | null, color: string) => {
    if (!element) return;

    // Simple CSS animation instead of anime.js
    element.style.transform = "scale(1.25)";
    element.style.backgroundColor = color;
    element.style.transition =
      "transform 0.3s ease-in-out, background-color 0.3s ease-in-out";

    setTimeout(() => {
      if (element) {
        element.style.transform = "scale(1)";
        element.style.backgroundColor = color;
      }
    }, 300);
  };

  // Click handlers for adding particles
  const handleProtonClick = () => {
    addProton();
    pulseAnimation(protonRef.current, "#FF5555");
  };

  const handleNeutronClick = () => {
    addNeutron();
    pulseAnimation(neutronRef.current, "#AAAAAA");
  };

  const handleElectronClick = () => {
    addElectron();
    pulseAnimation(electronRef.current, "#5555FF");
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-3 sm:p-4 flex flex-col gap-3">
      <h2 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2 text-sm sm:text-base">
        Particles
      </h2>

      <div className="flex flex-col sm:flex-col gap-3 sm:gap-4">
        {/* Proton */}
        <div className="flex items-center justify-between">
          <div
            ref={(node) => {
              dragProton(node);
              // Store reference for animations
              if (node) {
                // Using proper ref assignment
                protonRef.current = node;
              }
            }}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-400 flex items-center justify-center text-white font-bold cursor-move touch-optimized-button ${isDraggingProton ? "opacity-50" : ""}`}
            onClick={handleProtonClick}
          >
            p⁺
          </div>
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
              onClick={() => removeProton()}
            >
              -
            </button>
            <button
              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
              onClick={handleProtonClick}
            >
              +
            </button>
          </div>
        </div>

        {/* Neutron */}
        <div className="flex items-center justify-between">
          <div
            ref={(node) => {
              dragNeutron(node);
              // Store reference for animations
              if (node) {
                // Using proper ref assignment
                neutronRef.current = node;
              }
            }}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold cursor-move touch-optimized-button ${isDraggingNeutron ? "opacity-50" : ""}`}
            onClick={handleNeutronClick}
          >
            n⁰
          </div>
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
              onClick={() => removeNeutron()}
            >
              -
            </button>
            <button
              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
              onClick={handleNeutronClick}
            >
              +
            </button>
          </div>
        </div>

        {/* Electron */}
        <div className="flex items-center justify-between">
          <div
            ref={(node) => {
              dragElectron(node);
              // Store reference for animations
              if (node) {
                // Using proper ref assignment
                electronRef.current = node;
              }
            }}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold cursor-move touch-optimized-button ${isDraggingElectron ? "opacity-50" : ""}`}
            onClick={handleElectronClick}
          >
            e⁻
          </div>
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
              onClick={() => removeElectron()}
            >
              -
            </button>
            <button
              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
              onClick={handleElectronClick}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Drag particles to the atom or click to add
      </div>
    </div>
  );
};

export default ParticlePalette;
