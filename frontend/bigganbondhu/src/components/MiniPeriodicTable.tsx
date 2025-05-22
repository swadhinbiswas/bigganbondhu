import { elements, useAtomStore } from "@/lib/stores/atomStore";
import React, { useEffect, useRef, useState } from "react";

// Element categories for coloring the legend
const CATEGORIES = {
  alkali: { name: "Alkali metals", color: "bg-red-500 dark:bg-red-600" },
  alkaline: {
    name: "Alkaline earth metals",
    color: "bg-orange-500 dark:bg-orange-600",
  },
  transition: {
    name: "Transition metals",
    color: "bg-purple-500 dark:bg-purple-600",
  },
  post_transition: {
    name: "Post-transition metals",
    color: "bg-blue-400 dark:bg-blue-500",
  },
  metalloid: { name: "Metalloids", color: "bg-green-500 dark:bg-green-600" },
  nonmetal: {
    name: "Reactive non-metals",
    color: "bg-blue-500 dark:bg-blue-600",
  },
  noble: { name: "Noble gases", color: "bg-pink-500 dark:bg-pink-600" },
  lanthanide: {
    name: "Lanthanides",
    color: "bg-yellow-500 dark:bg-yellow-600",
  },
  actinide: { name: "Actinides", color: "bg-orange-600 dark:bg-orange-700" },
  unknown: {
    name: "Unknown properties",
    color: "bg-gray-500 dark:bg-gray-600",
  },
};

// Element category mapping
const elementCategories = {
  H: "nonmetal",
  He: "noble",
  Li: "alkali",
  Be: "alkaline",
  B: "metalloid",
  C: "nonmetal",
  N: "nonmetal",
  O: "nonmetal",
  F: "nonmetal",
  Ne: "noble",
  Na: "alkali",
  Mg: "alkaline",
  Al: "post_transition",
  Si: "metalloid",
  P: "nonmetal",
  S: "nonmetal",
  Cl: "nonmetal",
  Ar: "noble",
  K: "alkali",
  Ca: "alkaline",
  Sc: "transition",
  Ti: "transition",
  V: "transition",
  Cr: "transition",
  Mn: "transition",
  Fe: "transition",
  Co: "transition",
  Ni: "transition",
  Cu: "transition",
  Zn: "transition",
  Ga: "post_transition",
  Ge: "metalloid",
  As: "metalloid",
  Se: "nonmetal",
  Br: "nonmetal",
  Kr: "noble",
  Rb: "alkali",
  Sr: "alkaline",
  Y: "transition",
  Zr: "transition",
  Nb: "transition",
  Mo: "transition",
  Tc: "transition",
  Ru: "transition",
  Rh: "transition",
  Pd: "transition",
  Ag: "transition",
  Cd: "transition",
  In: "post_transition",
  Sn: "post_transition",
  Sb: "metalloid",
  Te: "metalloid",
  I: "nonmetal",
  Xe: "noble",
  Cs: "alkali",
  Ba: "alkaline",
  La: "lanthanide",
  Hf: "transition",
  Ta: "transition",
  W: "transition",
  Re: "transition",
  Os: "transition",
  Ir: "transition",
  Pt: "transition",
  Au: "transition",
  Hg: "transition",
  Tl: "post_transition",
  Pb: "post_transition",
  Bi: "post_transition",
  Po: "post_transition",
  At: "metalloid",
  Rn: "noble",
  Fr: "alkali",
  Ra: "alkaline",
  Ac: "actinide",
};

// Simplified periodic table for the first 36 elements
const PERIODIC_TABLE = [
  // Period 1
  [
    { number: 1, symbol: "H", name: "Hydrogen", category: "nonmetal" },
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    { number: 2, symbol: "He", name: "Helium", category: "noble" },
  ],
  // Period 2
  [
    { number: 3, symbol: "Li", name: "Lithium", category: "alkali" },
    { number: 4, symbol: "Be", name: "Beryllium", category: "alkaline" },
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    { number: 5, symbol: "B", name: "Boron", category: "metalloid" },
    { number: 6, symbol: "C", name: "Carbon", category: "nonmetal" },
    { number: 7, symbol: "N", name: "Nitrogen", category: "nonmetal" },
    { number: 8, symbol: "O", name: "Oxygen", category: "nonmetal" },
    { number: 9, symbol: "F", name: "Fluorine", category: "nonmetal" },
    { number: 10, symbol: "Ne", name: "Neon", category: "noble" },
  ],
  // Period 3
  [
    { number: 11, symbol: "Na", name: "Sodium", category: "alkali" },
    { number: 12, symbol: "Mg", name: "Magnesium", category: "alkaline" },
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    { number: 13, symbol: "Al", name: "Aluminum", category: "post_transition" },
    { number: 14, symbol: "Si", name: "Silicon", category: "metalloid" },
    { number: 15, symbol: "P", name: "Phosphorus", category: "nonmetal" },
    { number: 16, symbol: "S", name: "Sulfur", category: "nonmetal" },
    { number: 17, symbol: "Cl", name: "Chlorine", category: "nonmetal" },
    { number: 18, symbol: "Ar", name: "Argon", category: "noble" },
  ],
  // Period 4
  [
    { number: 19, symbol: "K", name: "Potassium", category: "alkali" },
    { number: 20, symbol: "Ca", name: "Calcium", category: "alkaline" },
    { number: 21, symbol: "Sc", name: "Scandium", category: "transition" },
    { number: 22, symbol: "Ti", name: "Titanium", category: "transition" },
    { number: 23, symbol: "V", name: "Vanadium", category: "transition" },
    { number: 24, symbol: "Cr", name: "Chromium", category: "transition" },
    { number: 25, symbol: "Mn", name: "Manganese", category: "transition" },
    { number: 26, symbol: "Fe", name: "Iron", category: "transition" },
    { number: 27, symbol: "Co", name: "Cobalt", category: "transition" },
    { number: 28, symbol: "Ni", name: "Nickel", category: "transition" },
    { number: 29, symbol: "Cu", name: "Copper", category: "transition" },
    { number: 30, symbol: "Zn", name: "Zinc", category: "transition" },
    { number: 31, symbol: "Ga", name: "Gallium", category: "post_transition" },
    { number: 32, symbol: "Ge", name: "Germanium", category: "metalloid" },
    { number: 33, symbol: "As", name: "Arsenic", category: "metalloid" },
    { number: 34, symbol: "Se", name: "Selenium", category: "nonmetal" },
    { number: 35, symbol: "Br", name: "Bromine", category: "nonmetal" },
    { number: 36, symbol: "Kr", name: "Krypton", category: "noble" },
  ],
];

const MiniPeriodicTable: React.FC = () => {
  const {
    protons,
    addProton,
    // removeProton,  // Removed unused
    addNeutron,
    // removeNeutron, // Removed unused
    // addElectron,   // Removed unused
    // removeElectron,// Removed unused
    resetAtom,
  } = useAtomStore();

  const activeElementRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Animation when the active element changes
  useEffect(() => {
    if (activeElementRef.current) {
      // Simple CSS animation instead of anime.js
      activeElementRef.current.style.transform = "scale(1.2)";
      setTimeout(() => {
        if (activeElementRef.current) {
          activeElementRef.current.style.transform = "scale(1)";
        }
      }, 200);
    }
  }, [protons]);

  // Initial animation for the periodic table
  useEffect(() => {
    if (tableRef.current) {
      // Simple CSS animation instead of anime.js
      tableRef.current.style.opacity = "0";
      tableRef.current.style.transform = "translateY(20px)";
      setTimeout(() => {
        if (tableRef.current) {
          tableRef.current.style.transition =
            "opacity 0.8s ease-out, transform 0.8s ease-out";
          tableRef.current.style.opacity = "1";
          tableRef.current.style.transform = "translateY(0)";
        }
      }, 100);
    }
  }, []);

  // Handle element click
  const handleElementClick = (element: any) => {
    if (!element) return;

    // First reset the atom
    resetAtom();

    // Then set it to the desired element by adding protons
    for (let i = 1; i < element.number; i++) {
      addProton();
    }

    // Add some neutrons (approximately equal to protons for simplicity)
    for (let i = 0; i < element.number; i++) {
      addNeutron();
    }
  };

  // Handle element hover for tooltip
  const handleElementHover = (element: any, event: React.MouseEvent) => {
    if (!element) return;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });

    // Get the element category
    const category =
      elementCategories[element.symbol as keyof typeof elementCategories] ||
      "unknown";

    setTooltipContent(`
      <div class="font-bold">${element.name} (${element.symbol})</div>
      <div>Atomic Number: ${element.number}</div>
      <div>Category: ${CATEGORIES[category as keyof typeof CATEGORIES]?.name || "Unknown"}</div>
    `);
    setShowTooltip(true);
  };

  // Get element by atomic number
  const getElementByNumber = (number: number) => {
    for (const row of PERIODIC_TABLE) {
      for (const element of row) {
        if (element && element.number === number) {
          return element;
        }
      }
    }
    return null;
  };

  // Get current selected element
  const selectedElement = protons > 0 ? getElementByNumber(protons) : null;

  // Function to get element background style based on its color in the elements data
  const getElementStyle = (elementNumber: number) => {
    if (elementNumber === protons) {
      return {
        backgroundColor: "#4F46E5", // Active element color
        color: "white",
        border: "1px solid #818CF8",
      };
    }

    const elementData = elements[elementNumber];
    if (!elementData) return {};

    // Convert hex color to RGB for better text contrast calculation
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 0, g: 0, b: 0 };
    };

    // Calculate if text should be dark or light based on background brightness
    const rgb = hexToRgb(elementData.color);
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    const textColor = brightness > 125 ? "black" : "white";

    return {
      backgroundColor: elementData.color,
      color: textColor,
      border: "1px solid rgba(255,255,255,0.1)",
    };
  };

  return (
    <div
      ref={tableRef}
      className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg p-3 transition-all duration-300 border border-indigo-100 dark:border-indigo-900/30"
    >
      <h2 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2 text-center">
        Periodic Table
      </h2>

      <div className="grid gap-0.5 max-w-full overflow-visible">
        {PERIODIC_TABLE.map((row, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="flex flex-wrap gap-0.5 justify-center"
          >
            {row.map((element, colIndex) => (
              <div key={`cell-${rowIndex}-${colIndex}`} className="relative">
                {element ? (
                  <div
                    ref={element.number === protons ? activeElementRef : null}
                    className="flex flex-col items-center justify-center h-7 w-7 rounded transition-all duration-200 cursor-pointer hover:shadow-sm hover:scale-105"
                    style={getElementStyle(element.number)}
                    onClick={() => handleElementClick(element)}
                    onMouseEnter={(e) => handleElementHover(element, e)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <div className="text-[6px] opacity-70">
                      {element.number}
                    </div>
                    <div className="font-bold text-[10px]">
                      {element.symbol}
                    </div>
                  </div>
                ) : (
                  <div className="h-7 w-7"></div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-2 text-xs text-center text-gray-600 dark:text-gray-400">
        {selectedElement
          ? `Selected: ${selectedElement.name} (${selectedElement.number})`
          : "No element selected"}
      </div>

      {/* Category legend - compact layout */}
      <div className="mt-2 flex flex-wrap justify-center gap-x-2 gap-y-1 text-[7px]">
        {Object.entries(CATEGORIES)
          .slice(0, 6)
          .map(([key, { name, color }]) => (
            <div key={key} className="flex items-center">
              <div className={`w-1.5 h-1.5 rounded-full ${color} mr-0.5`}></div>
              <span className="text-gray-600 dark:text-gray-300">
                {name.split(" ")[0]}
              </span>
            </div>
          ))}
      </div>

      {/* Detailed tooltip */}
      {showTooltip && (
        <div
          className="fixed bg-white dark:bg-slate-700 p-2 rounded shadow-lg text-xs z-50 pointer-events-none border border-gray-200 dark:border-gray-600"
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
