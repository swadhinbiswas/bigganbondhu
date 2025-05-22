export interface Element {
  number: number;
  symbol: string;
  name: string;
  mass: number;
  electronConfig: number[];
  color: string;
  category: string;
}

// Simplified periodic table data with first 20 elements
export const elements: Element[] = [
  {
    number: 1,
    symbol: "H",
    name: "Hydrogen",
    mass: 1.008,
    electronConfig: [1],
    color: "#CCCCCC",
    category: "nonmetal",
  },
  {
    number: 2,
    symbol: "He",
    name: "Helium",
    mass: 4.0026,
    electronConfig: [2],
    color: "#D9FFFF",
    category: "noble gas",
  },
  {
    number: 3,
    symbol: "Li",
    name: "Lithium",
    mass: 6.94,
    electronConfig: [2, 1],
    color: "#CC80FF",
    category: "alkali metal",
  },
  {
    number: 4,
    symbol: "Be",
    name: "Beryllium",
    mass: 9.0122,
    electronConfig: [2, 2],
    color: "#C2FF00",
    category: "alkaline earth metal",
  },
  {
    number: 5,
    symbol: "B",
    name: "Boron",
    mass: 10.81,
    electronConfig: [2, 3],
    color: "#FFB5B5",
    category: "metalloid",
  },
  {
    number: 6,
    symbol: "C",
    name: "Carbon",
    mass: 12.011,
    electronConfig: [2, 4],
    color: "#909090",
    category: "nonmetal",
  },
  {
    number: 7,
    symbol: "N",
    name: "Nitrogen",
    mass: 14.007,
    electronConfig: [2, 5],
    color: "#3050F8",
    category: "nonmetal",
  },
  {
    number: 8,
    symbol: "O",
    name: "Oxygen",
    mass: 15.999,
    electronConfig: [2, 6],
    color: "#FF0D0D",
    category: "nonmetal",
  },
  {
    number: 9,
    symbol: "F",
    name: "Fluorine",
    mass: 18.998,
    electronConfig: [2, 7],
    color: "#90E050",
    category: "halogen",
  },
  {
    number: 10,
    symbol: "Ne",
    name: "Neon",
    mass: 20.18,
    electronConfig: [2, 8],
    color: "#B3E3F5",
    category: "noble gas",
  },
  {
    number: 11,
    symbol: "Na",
    name: "Sodium",
    mass: 22.99,
    electronConfig: [2, 8, 1],
    color: "#AB5CF2",
    category: "alkali metal",
  },
  {
    number: 12,
    symbol: "Mg",
    name: "Magnesium",
    mass: 24.305,
    electronConfig: [2, 8, 2],
    color: "#8AFF00",
    category: "alkaline earth metal",
  },
  {
    number: 13,
    symbol: "Al",
    name: "Aluminum",
    mass: 26.982,
    electronConfig: [2, 8, 3],
    color: "#BFA6A6",
    category: "post-transition metal",
  },
  {
    number: 14,
    symbol: "Si",
    name: "Silicon",
    mass: 28.085,
    electronConfig: [2, 8, 4],
    color: "#F0C8A0",
    category: "metalloid",
  },
  {
    number: 15,
    symbol: "P",
    name: "Phosphorus",
    mass: 30.974,
    electronConfig: [2, 8, 5],
    color: "#FF8000",
    category: "nonmetal",
  },
  {
    number: 16,
    symbol: "S",
    name: "Sulfur",
    mass: 32.06,
    electronConfig: [2, 8, 6],
    color: "#FFFF30",
    category: "nonmetal",
  },
  {
    number: 17,
    symbol: "Cl",
    name: "Chlorine",
    mass: 35.45,
    electronConfig: [2, 8, 7],
    color: "#1FF01F",
    category: "halogen",
  },
  {
    number: 18,
    symbol: "Ar",
    name: "Argon",
    mass: 39.948,
    electronConfig: [2, 8, 8],
    color: "#80D1E3",
    category: "noble gas",
  },
  {
    number: 19,
    symbol: "K",
    name: "Potassium",
    mass: 39.098,
    electronConfig: [2, 8, 8, 1],
    color: "#8F40D4",
    category: "alkali metal",
  },
  {
    number: 20,
    symbol: "Ca",
    name: "Calcium",
    mass: 40.078,
    electronConfig: [2, 8, 8, 2],
    color: "#3DFF00",
    category: "alkaline earth metal",
  },
];

// Get element by atomic number
export const getElementByAtomicNumber = (
  number: number
): Element | undefined => {
  return elements.find((element) => element.number === number);
};

// Determine stability of atom based on protons, neutrons, and electrons
export const determineStability = (
  protons: number,
  neutrons: number,
  electrons: number
): {
  isStable: boolean;
  reason: string;
} => {
  // Check if it's a noble gas configuration (filled outer shell)
  const element = getElementByAtomicNumber(protons);
  if (!element) return { isStable: false, reason: "Unknown element" };

  // Simple stability check - this is simplified science for educational purposes
  const isNeutral = protons === electrons;
  const hasNobleGasConfig = [2, 10, 18].includes(electrons);
  const hasReasonableNeutronCount =
    neutrons >= protons - 1 && neutrons <= protons + 1;

  if (hasNobleGasConfig && isNeutral && hasReasonableNeutronCount) {
    return { isStable: true, reason: "Stable noble gas configuration" };
  } else if (!isNeutral) {
    return {
      isStable: false,
      reason: "Charged atom (unequal protons and electrons)",
    };
  } else if (!hasReasonableNeutronCount) {
    return { isStable: false, reason: "Unstable neutron count" };
  } else {
    return { isStable: false, reason: "Incomplete electron shell" };
  }
};

// Get electron shell capacity
export const getShellCapacity = (shellIndex: number): number => {
  const shellCapacities = [2, 8, 18, 32, 50];
  return shellIndex < shellCapacities.length ? shellCapacities[shellIndex] : 0;
};

// Calculate which shell an electron should go in based on total electron count
export const calculateElectronShell = (electronIndex: number): number => {
  let shellIndex = 0;
  let electronCount = 0;

  while (electronCount <= electronIndex) {
    electronCount += getShellCapacity(shellIndex);
    if (electronCount > electronIndex) {
      return shellIndex;
    }
    shellIndex++;
  }

  return shellIndex;
};
