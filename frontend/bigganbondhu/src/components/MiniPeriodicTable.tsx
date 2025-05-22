import { elements, useAtomStore } from "@/lib/stores/atomStore";
import { animate } from "animejs";
import React, { useEffect, useRef, useState } from "react";

const MiniPeriodicTable: React.FC = () => {
  const {
    protons,
    addProton,
    removeProton,
    addNeutron,
    removeNeutron,
    addElectron,
    removeElectron,
    resetAtom,
  } = useAtomStore();

  const activeElementRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // First 20 elements arranged in a grid matching their position in the periodic table
  const periodicTableLayout = [
    // Row 1
    { number: 1, symbol: "H", group: 1, period: 1, category: "nonmetal" },
    { number: 0, symbol: "", group: 2, period: 1 }, // Empty cell
    { number: 0, symbol: "", group: 13, period: 1 }, // Empty cell
    { number: 0, symbol: "", group: 14, period: 1 }, // Empty cell
    { number: 0, symbol: "", group: 15, period: 1 }, // Empty cell
    { number: 0, symbol: "", group: 16, period: 1 }, // Empty cell
    { number: 0, symbol: "", group: 17, period: 1 }, // Empty cell
    { number: 2, symbol: "He", group: 18, period: 1, category: "noble" },

    // Row 2
    { number: 3, symbol: "Li", group: 1, period: 2, category: "alkali" },
    { number: 4, symbol: "Be", group: 2, period: 2, category: "alkaline" },
    { number: 0, symbol: "", group: 3, period: 2 }, // Empty cell
    { number: 0, symbol: "", group: 4, period: 2 }, // Empty cell
    { number: 0, symbol: "", group: 5, period: 2 }, // Empty cell
    { number: 0, symbol: "", group: 6, period: 2 }, // Empty cell
    { number: 0, symbol: "", group: 7, period: 2 }, // Empty cell
    { number: 0, symbol: "", group: 8, period: 2 }, // Empty cell
    { number: 0, symbol: "", group: 9, period: 2 }, // Empty cell
    { number: 0, symbol: "", group: 10, period: 2 }, // Empty cell
    { number: 0, symbol: "", group: 11, period: 2 }, // Empty cell
    { number: 0, symbol: "", group: 12, period: 2 }, // Empty cell
    { number: 5, symbol: "B", group: 13, period: 2, category: "metalloid" },
    { number: 6, symbol: "C", group: 14, period: 2, category: "nonmetal" },
    { number: 7, symbol: "N", group: 15, period: 2, category: "nonmetal" },
    { number: 8, symbol: "O", group: 16, period: 2, category: "nonmetal" },
    { number: 9, symbol: "F", group: 17, period: 2, category: "halogen" },
    { number: 10, symbol: "Ne", group: 18, period: 2, category: "noble" },

    // Row 3
    { number: 11, symbol: "Na", group: 1, period: 3, category: "alkali" },
    { number: 12, symbol: "Mg", group: 2, period: 3, category: "alkaline" },
    { number: 0, symbol: "", group: 3, period: 3 }, // Empty cell
    { number: 0, symbol: "", group: 4, period: 3 }, // Empty cell
    { number: 0, symbol: "", group: 5, period: 3 }, // Empty cell
    { number: 0, symbol: "", group: 6, period: 3 }, // Empty cell
    { number: 0, symbol: "", group: 7, period: 3 }, // Empty cell
    { number: 0, symbol: "", group: 8, period: 3 }, // Empty cell
    { number: 0, symbol: "", group: 9, period: 3 }, // Empty cell
    { number: 0, symbol: "", group: 10, period: 3 }, // Empty cell
    { number: 0, symbol: "", group: 11, period: 3 }, // Empty cell
    { number: 0, symbol: "", group: 12, period: 3 }, // Empty cell
    { number: 13, symbol: "Al", group: 13, period: 3, category: "metal" },
    { number: 14, symbol: "Si", group: 14, period: 3, category: "metalloid" },
    { number: 15, symbol: "P", group: 15, period: 3, category: "nonmetal" },
    { number: 16, symbol: "S", group: 16, period: 3, category: "nonmetal" },
    { number: 17, symbol: "Cl", group: 17, period: 3, category: "halogen" },
    { number: 18, symbol: "Ar", group: 18, period: 3, category: "noble" },

    // Row 4 (first two elements only)
    { number: 19, symbol: "K", group: 1, period: 4, category: "alkali" },
    { number: 20, symbol: "Ca", group: 2, period: 4, category: "alkaline" },
  ];

  // Filter out empty cells
  const displayElements = periodicTableLayout.filter((el) => el.number > 0);

  // Animation when the active element changes
  useEffect(() => {
    if (activeElementRef.current) {
      animate(activeElementRef.current, {
        scale: [1, 1.2, 1],
        backgroundColor: ["#4F46E5", "#6366F1", "#4F46E5"],
        duration: 500,
        easing: "easeInOutQuad",
      });
    }
  }, [protons]);

  // Initial animation for the periodic table
  useEffect(() => {
    if (tableRef.current) {
      animate(tableRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        easing: "easeOutQuad",
      });
    }
  }, []);

  // Get element info for tooltip
  const getElementInfo = (atomicNumber: number) => {
    const element = elements[atomicNumber];
    if (!element) return "";
    return `${element.name} (${atomicNumber})`;
  };

  // Handle element click
  const handleElementClick = (atomicNumber: number) => {
    // First reset the atom
    resetAtom();

    // Then set it to the desired element by adding protons
    for (let i = 1; i < atomicNumber; i++) {
      addProton();
    }

    // Add some neutrons (approximately equal to protons for simplicity)
    for (let i = 0; i < atomicNumber; i++) {
      addNeutron();
    }
  };

  // Handle element hover for detailed tooltip
  const handleElementHover = (
    atomicNumber: number,
    event: React.MouseEvent
  ) => {
    const element = elements[atomicNumber];
    if (!element) return;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });

    setTooltipContent(`
      <div class="font-bold">${element.name} (${element.symbol})</div>
      <div>Atomic Number: ${atomicNumber}</div>
    `);
    setShowTooltip(true);
  };

  // Get color class based on element category
  const getCategoryColorClass = (category?: string) => {
    switch (category) {
      case "alkali":
        return "bg-red-500 hover:bg-red-400";
      case "alkaline":
        return "bg-orange-500 hover:bg-orange-400";
      case "metal":
        return "bg-yellow-600 hover:bg-yellow-500";
      case "metalloid":
        return "bg-green-600 hover:bg-green-500";
      case "nonmetal":
        return "bg-blue-500 hover:bg-blue-400";
      case "halogen":
        return "bg-purple-500 hover:bg-purple-400";
      case "noble":
        return "bg-pink-500 hover:bg-pink-400";
      default:
        return "bg-gray-500 hover:bg-gray-400";
    }
  };

  return (
    <div
      ref={tableRef}
      className="bg-white dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg p-4 transition-all duration-300"
    >
      <h2 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
        Periodic Table
      </h2>

      <div className="grid grid-cols-9 gap-1 text-xs">
        {displayElements.map((el) => (
          <div
            key={el.number}
            ref={el.number === protons ? activeElementRef : null}
            className={`
              flex flex-col items-center justify-center
              h-9 w-9 rounded
              ${
                el.number === protons
                  ? "bg-indigo-600 text-white font-bold shadow-lg ring-2 ring-indigo-300 dark:ring-indigo-500 transform scale-110 z-10"
                  : `${getCategoryColorClass(el.category)} text-white`
              }
              transition-all duration-200 cursor-pointer
              hover:shadow-md hover:scale-105
            `}
            onClick={() => handleElementClick(el.number)}
            onMouseEnter={(e) => handleElementHover(el.number, e)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <div className="text-[8px] opacity-70">{el.number}</div>
            <div className="font-bold text-sm">{el.symbol}</div>
          </div>
        ))}
      </div>

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {protons > 0
          ? `Selected: ${elements[protons]?.name} (${protons})`
          : "No element selected"}
      </div>

      {/* Category legend */}
      <div className="mt-3 grid grid-cols-3 gap-x-2 gap-y-1 text-[9px]">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
          <span className="text-gray-600 dark:text-gray-300">
            Alkali Metals
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-orange-500 mr-1"></div>
          <span className="text-gray-600 dark:text-gray-300">
            Alkaline Earth
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
          <span className="text-gray-600 dark:text-gray-300">Nonmetals</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-600 mr-1"></div>
          <span className="text-gray-600 dark:text-gray-300">Metalloids</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-purple-500 mr-1"></div>
          <span className="text-gray-600 dark:text-gray-300">Halogens</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-pink-500 mr-1"></div>
          <span className="text-gray-600 dark:text-gray-300">Noble Gases</span>
        </div>
      </div>

      {/* Detailed tooltip */}
      {showTooltip && (
        <div
          className="fixed bg-white dark:bg-slate-700 p-2 rounded shadow-lg text-xs z-50 pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y - 5}px`,
            transform: "translate(-50%, -100%)",
          }}
          dangerouslySetInnerHTML={{ __html: tooltipContent }}
        />
      )}
    </div>
  );
};

export default MiniPeriodicTable;
