import { create } from "zustand";

// Element data for display
export interface ElementData {
  symbol: string;
  name: string;
  color: string;
}

// Mapping of atomic numbers to element data
export const elements: Record<number, ElementData> = {
  1: { symbol: "H", name: "Hydrogen", color: "#CCCCCC" },
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
      if (newProtons > 20) return state; // Limit to elements we have data for

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
