import { DragTypes } from "@/lib/dragTypes";
import { useAtomStore } from "@/lib/stores/atomStore";
import { animate } from "animejs";
import React, { useRef } from "react";
import { useDrag } from "react-dnd";
import { v4 as uuidv4 } from "uuid";

const ParticlePalette: React.FC = () => {
  const {
    addProton,
    addNeutron,
    addElectron,
    removeProton,
    removeNeutron,
    removeElectron,
  } = useAtomStore();

  const protonRef = useRef<HTMLDivElement>(null);
  const neutronRef = useRef<HTMLDivElement>(null);
  const electronRef = useRef<HTMLDivElement>(null);

  // Create draggable proton
  const [{ isDraggingProton }, dragProton] = useDrag(() => ({
    type: DragTypes.PARTICLE,
    item: { id: uuidv4(), type: "proton" },
    collect: (monitor) => ({
      isDraggingProton: monitor.isDragging(),
    }),
    end: (item, monitor) => {
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
    end: (item, monitor) => {
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
    end: (item, monitor) => {
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

    animate(element, {
      scale: [1, 1.25, 1],
      backgroundColor: [color, "#FFFFFF", color],
      duration: 300,
      easing: "easeInOutQuad",
    });
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
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex flex-col gap-3">
      <h2 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
        Particles
      </h2>

      <div className="flex flex-col gap-4">
        {/* Proton */}
        <div className="flex items-center justify-between">
          <div
            ref={(node) => {
              dragProton(node);
              if (node) protonRef.current = node;
            }}
            className={`w-10 h-10 rounded-full bg-red-400 flex items-center justify-center text-white font-bold cursor-move ${isDraggingProton ? "opacity-50" : ""}`}
            onClick={handleProtonClick}
          >
            p⁺
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => removeProton()}
              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
            >
              -
            </button>
            <button
              onClick={handleProtonClick}
              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
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
              if (node) neutronRef.current = node;
            }}
            className={`w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold cursor-move ${isDraggingNeutron ? "opacity-50" : ""}`}
            onClick={handleNeutronClick}
          >
            n⁰
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => removeNeutron()}
              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
            >
              -
            </button>
            <button
              onClick={handleNeutronClick}
              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
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
              if (node) electronRef.current = node;
            }}
            className={`w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold cursor-move ${isDraggingElectron ? "opacity-50" : ""}`}
            onClick={handleElectronClick}
          >
            e⁻
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => removeElectron()}
              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
            >
              -
            </button>
            <button
              onClick={handleElectronClick}
              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
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
