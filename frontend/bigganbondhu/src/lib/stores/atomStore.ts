import { create } from "zustand";

// Element data for display
export interface ElementData {
  symbol: string;
  name: string;
  color: string;
}

// Mapping of atomic numbers to element data
export const elements: Record<number, ElementData> = {
  1: { symbol: "H", name: "Hydrogen", color: "#FFFFFF" },
  2: { symbol: "He", name: "Helium", color: "#D9FFFF" },
  3: { symbol: "Li", name: "Lithium", color: "#CC80FF" },
  4: { symbol: "Be", name: "Beryllium", color: "#C2FF00" },
  5: { symbol: "B", name: "Boron", color: "#FFB5B5" },
  6: { symbol: "C", name: "Carbon", color: "#909090" },
  7: { symbol: "N", name: "Nitrogen", color: "#3050F8" },
  8: { symbol: "O", name: "Oxygen", color: "#FF0D0D" },
  9: { symbol: "F", name: "Fluorine", color: "#90E050" },
  10: { symbol: "Ne", name: "Neon", color: "#B3E3F5" },
  11: { symbol: "Na", name: "Sodium", color: "#AB5CF2" },
  12: { symbol: "Mg", name: "Magnesium", color: "#8AFF00" },
  13: { symbol: "Al", name: "Aluminum", color: "#BFA6A6" },
  14: { symbol: "Si", name: "Silicon", color: "#F0C8A0" },
  15: { symbol: "P", name: "Phosphorus", color: "#FF8000" },
  16: { symbol: "S", name: "Sulfur", color: "#FFFF30" },
  17: { symbol: "Cl", name: "Chlorine", color: "#1FF01F" },
  18: { symbol: "Ar", name: "Argon", color: "#80D1E3" },
  19: { symbol: "K", name: "Potassium", color: "#8F40D4" },
  20: { symbol: "Ca", name: "Calcium", color: "#3DFF00" },
  21: { symbol: "Sc", name: "Scandium", color: "#E6E6E6" },
  22: { symbol: "Ti", name: "Titanium", color: "#BFC2C7" },
  23: { symbol: "V", name: "Vanadium", color: "#A6A6AB" },
  24: { symbol: "Cr", name: "Chromium", color: "#8A99C7" },
  25: { symbol: "Mn", name: "Manganese", color: "#9C7AC7" },
  26: { symbol: "Fe", name: "Iron", color: "#E06633" },
  27: { symbol: "Co", name: "Cobalt", color: "#F090A0" },
  28: { symbol: "Ni", name: "Nickel", color: "#50D050" },
  29: { symbol: "Cu", name: "Copper", color: "#C88033" },
  30: { symbol: "Zn", name: "Zinc", color: "#7D80B0" },
  31: { symbol: "Ga", name: "Gallium", color: "#C28F8F" },
  32: { symbol: "Ge", name: "Germanium", color: "#668F8F" },
  33: { symbol: "As", name: "Arsenic", color: "#BD80E3" },
  34: { symbol: "Se", name: "Selenium", color: "#FFA000" },
  35: { symbol: "Br", name: "Bromine", color: "#A62929" },
  36: { symbol: "Kr", name: "Krypton", color: "#5CB8D1" },
  37: { symbol: "Rb", name: "Rubidium", color: "#702EB8" },
  38: { symbol: "Sr", name: "Strontium", color: "#00FF00" },
  39: { symbol: "Y", name: "Yttrium", color: "#94FFFF" },
  40: { symbol: "Zr", name: "Zirconium", color: "#94E0E0" },
  41: { symbol: "Nb", name: "Niobium", color: "#73A3C7" },
  42: { symbol: "Mo", name: "Molybdenum", color: "#54B5B5" },
  43: { symbol: "Tc", name: "Technetium", color: "#3B9595" },
  44: { symbol: "Ru", name: "Ruthenium", color: "#248F8F" },
  45: { symbol: "Rh", name: "Rhodium", color: "#0A7D8C" },
  46: { symbol: "Pd", name: "Palladium", color: "#006985" },
  47: { symbol: "Ag", name: "Silver", color: "#C0C0C0" },
  48: { symbol: "Cd", name: "Cadmium", color: "#FFD98F" },
  49: { symbol: "In", name: "Indium", color: "#A67573" },
  50: { symbol: "Sn", name: "Tin", color: "#668080" },
  51: { symbol: "Sb", name: "Antimony", color: "#9E63B5" },
  52: { symbol: "Te", name: "Tellurium", color: "#D47A00" },
  53: { symbol: "I", name: "Iodine", color: "#940094" },
  54: { symbol: "Xe", name: "Xenon", color: "#429EB0" },
  55: { symbol: "Cs", name: "Cesium", color: "#57178F" },
  56: { symbol: "Ba", name: "Barium", color: "#00C900" },
  57: { symbol: "La", name: "Lanthanum", color: "#70D4FF" },
  58: { symbol: "Ce", name: "Cerium", color: "#FFFFC7" },
  59: { symbol: "Pr", name: "Praseodymium", color: "#D9FFC7" },
  60: { symbol: "Nd", name: "Neodymium", color: "#C7FFC7" },
  61: { symbol: "Pm", name: "Promethium", color: "#A3FFC7" },
  62: { symbol: "Sm", name: "Samarium", color: "#8FFFC7" },
  63: { symbol: "Eu", name: "Europium", color: "#61FFC7" },
  64: { symbol: "Gd", name: "Gadolinium", color: "#45FFC7" },
  65: { symbol: "Tb", name: "Terbium", color: "#30FFC7" },
  66: { symbol: "Dy", name: "Dysprosium", color: "#1FFFC7" },
  67: { symbol: "Ho", name: "Holmium", color: "#00FF9C" },
  68: { symbol: "Er", name: "Erbium", color: "#00E675" },
  69: { symbol: "Tm", name: "Thulium", color: "#00D452" },
  70: { symbol: "Yb", name: "Ytterbium", color: "#00BF38" },
  71: { symbol: "Lu", name: "Lutetium", color: "#00AB24" },
  72: { symbol: "Hf", name: "Hafnium", color: "#4DC2FF" },
  73: { symbol: "Ta", name: "Tantalum", color: "#4DA6FF" },
  74: { symbol: "W", name: "Tungsten", color: "#2194D6" },
  75: { symbol: "Re", name: "Rhenium", color: "#267D9C" },
  76: { symbol: "Os", name: "Osmium", color: "#266696" },
  77: { symbol: "Ir", name: "Iridium", color: "#175487" },
  78: { symbol: "Pt", name: "Platinum", color: "#D0D0E0" },
  79: { symbol: "Au", name: "Gold", color: "#FFD123" },
  80: { symbol: "Hg", name: "Mercury", color: "#B8B8D0" },
  81: { symbol: "Tl", name: "Thallium", color: "#A6544D" },
  82: { symbol: "Pb", name: "Lead", color: "#575961" },
  83: { symbol: "Bi", name: "Bismuth", color: "#9E4FB5" },
  84: { symbol: "Po", name: "Polonium", color: "#AB5C00" },
  85: { symbol: "At", name: "Astatine", color: "#754F45" },
  86: { symbol: "Rn", name: "Radon", color: "#428296" },
  87: { symbol: "Fr", name: "Francium", color: "#420066" },
  88: { symbol: "Ra", name: "Radium", color: "#007D00" },
  89: { symbol: "Ac", name: "Actinium", color: "#70ABFA" },
  90: { symbol: "Th", name: "Thorium", color: "#00BAFF" },
  91: { symbol: "Pa", name: "Protactinium", color: "#00A1FF" },
  92: { symbol: "U", name: "Uranium", color: "#008FEE" },
  93: { symbol: "Np", name: "Neptunium", color: "#0080FF" },
  94: { symbol: "Pu", name: "Plutonium", color: "#006BFF" },
  95: { symbol: "Am", name: "Americium", color: "#545CF2" },
  96: { symbol: "Cm", name: "Curium", color: "#785CE3" },
  97: { symbol: "Bk", name: "Berkelium", color: "#8A4FE3" },
  98: { symbol: "Cf", name: "Californium", color: "#A00FE3" },
  99: { symbol: "Es", name: "Einsteinium", color: "#B310E3" },
  100: { symbol: "Fm", name: "Fermium", color: "#B310E3" },
};

export type ViewMode = "orbit" | "cloud";

interface AtomState {
  protons: number;
  neutrons: number;
  electrons: number;
  viewMode: ViewMode;
  isStable: boolean;

  // Derived values
  element: ElementData | null;
  massNumber: number;
  netCharge: number;
  stability: "stable" | "unstable" | "neutral";

  // Actions
  addProton: () => void;
  removeProton: () => void;
  addNeutron: () => void;
  removeNeutron: () => void;
  addElectron: () => void;
  removeElectron: () => void;
  setViewMode: (mode: ViewMode) => void;
  resetAtom: () => void;
}

export const useAtomStore = create<AtomState>((set) => ({
  protons: 1,
  neutrons: 0,
  electrons: 1,
  viewMode: "orbit",
  isStable: true,

  // Initial derived values
  element: elements[1] || null,
  massNumber: 1,
  netCharge: 0,
  stability: "neutral",

  // Actions
  addProton: () =>
    set((state) => {
      const newProtons = state.protons + 1;
      if (newProtons > 100) return state; // Limit to elements we have data for

      return {
        protons: newProtons,
        element: elements[newProtons] || null,
        massNumber: newProtons + state.neutrons,
        netCharge: newProtons - state.electrons,
        stability: calculateStability(
          newProtons,
          state.neutrons,
          state.electrons
        ),
        isStable: isAtomStable(newProtons, state.neutrons, state.electrons),
      };
    }),

  removeProton: () =>
    set((state) => {
      const newProtons = Math.max(0, state.protons - 1);
      return {
        protons: newProtons,
        element: newProtons > 0 ? elements[newProtons] : null,
        massNumber: newProtons + state.neutrons,
        netCharge: newProtons - state.electrons,
        stability: calculateStability(
          newProtons,
          state.neutrons,
          state.electrons
        ),
        isStable: isAtomStable(newProtons, state.neutrons, state.electrons),
      };
    }),

  addNeutron: () =>
    set((state) => {
      const newNeutrons = state.neutrons + 1;
      return {
        neutrons: newNeutrons,
        massNumber: state.protons + newNeutrons,
        stability: calculateStability(
          state.protons,
          newNeutrons,
          state.electrons
        ),
        isStable: isAtomStable(state.protons, newNeutrons, state.electrons),
      };
    }),

  removeNeutron: () =>
    set((state) => {
      const newNeutrons = Math.max(0, state.neutrons - 1);
      return {
        neutrons: newNeutrons,
        massNumber: state.protons + newNeutrons,
        stability: calculateStability(
          state.protons,
          newNeutrons,
          state.electrons
        ),
        isStable: isAtomStable(state.protons, newNeutrons, state.electrons),
      };
    }),

  addElectron: () =>
    set((state) => {
      const newElectrons = state.electrons + 1;
      return {
        electrons: newElectrons,
        netCharge: state.protons - newElectrons,
        stability: calculateStability(
          state.protons,
          state.neutrons,
          newElectrons
        ),
        isStable: isAtomStable(state.protons, state.neutrons, newElectrons),
      };
    }),

  removeElectron: () =>
    set((state) => {
      const newElectrons = Math.max(0, state.electrons - 1);
      return {
        electrons: newElectrons,
        netCharge: state.protons - newElectrons,
        stability: calculateStability(
          state.protons,
          state.neutrons,
          newElectrons
        ),
        isStable: isAtomStable(state.protons, state.neutrons, newElectrons),
      };
    }),

  setViewMode: (mode) => set({ viewMode: mode }),

  resetAtom: () =>
    set({
      protons: 1,
      neutrons: 0,
      electrons: 1,
      element: elements[1],
      massNumber: 1,
      netCharge: 0,
      stability: "neutral",
      isStable: true,
    }),
}));

// Helper function to determine stability
function calculateStability(
  protons: number,
  neutrons: number,
  electrons: number
): "stable" | "unstable" | "neutral" {
  if (protons === electrons) return "neutral";
  return protons > electrons ? "positive" : ("negative" as any);
}

// Simplified stability calculation
function isAtomStable(
  protons: number,
  neutrons: number,
  electrons: number
): boolean {
  // Very simple stability check - could be more sophisticated
  // For small atoms, we want near equal protons and neutrons
  if (protons <= 4) {
    return Math.abs(protons - neutrons) <= 1;
  }
  // For larger atoms, we typically want more neutrons than protons
  return neutrons >= protons && neutrons <= protons * 1.5;
}
