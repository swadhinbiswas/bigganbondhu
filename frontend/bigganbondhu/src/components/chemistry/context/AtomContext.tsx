import html2canvas from "html2canvas";
import React, { createContext, ReactNode, useContext, useState } from "react";
import {
  determineStability,
  getElementByAtomicNumber,
} from "../utils/elementData";
import {
  isSoundEnabled,
  playParticleSound,
  toggleSound,
} from "../utils/soundEffects";

// Define the shape of our atom state
export interface AtomState {
  protons: number;
  neutrons: number;
  electrons: number;
  viewMode: "orbit" | "cloud";
  showLabels: boolean;
  soundEnabled: boolean;
}

// Define the context interface
interface AtomContextType {
  atomState: AtomState;
  elementInfo: {
    name: string;
    symbol: string;
    massNumber: number;
    charge: number;
    stability: {
      isStable: boolean;
      reason: string;
    };
  };
  addProton: () => void;
  removeProton: () => void;
  addNeutron: () => void;
  removeNeutron: () => void;
  addElectron: () => void;
  removeElectron: () => void;
  resetAtom: () => void;
  toggleViewMode: () => void;
  toggleLabels: () => void;
  toggleSound: () => void;
  saveScreenshot: () => void;
  handleParticleDrop: (type: "proton" | "neutron" | "electron") => void;
}

// Create the context
const AtomContext = createContext<AtomContextType | undefined>(undefined);

// Context provider component
export const AtomProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Initial state - start with Hydrogen
  const [atomState, setAtomState] = useState<AtomState>({
    protons: 1,
    neutrons: 1,
    electrons: 1,
    viewMode: "orbit",
    showLabels: true,
    soundEnabled: isSoundEnabled(),
  });

  // Calculate element information based on current state
  const elementInfo = {
    name: getElementByAtomicNumber(atomState.protons)?.name || "Unknown",
    symbol: getElementByAtomicNumber(atomState.protons)?.symbol || "?",
    massNumber: atomState.protons + atomState.neutrons,
    charge: atomState.protons - atomState.electrons,
    stability: determineStability(
      atomState.protons,
      atomState.neutrons,
      atomState.electrons
    ),
  };

  // Function to play sound effect
  const playSound = (
    particleType: "proton" | "neutron" | "electron" | "reset" | "error",
    action: "add" | "remove" | "drop" = "add"
  ) => {
    if (atomState.soundEnabled) {
      playParticleSound(particleType, action);
    }
  };

  // Functions to modify atom state
  const addProton = () => {
    if (atomState.protons < 20) {
      // Limit to 20 elements for simplicity
      setAtomState((prev) => ({ ...prev, protons: prev.protons + 1 }));
      playSound("proton", "add");
    } else {
      playSound("error");
    }
  };

  const removeProton = () => {
    if (atomState.protons > 1) {
      setAtomState((prev) => ({ ...prev, protons: prev.protons - 1 }));
      playSound("proton", "remove");
    } else {
      playSound("error");
    }
  };

  const addNeutron = () => {
    if (atomState.neutrons < 30) {
      // Arbitrary limit
      setAtomState((prev) => ({ ...prev, neutrons: prev.neutrons + 1 }));
      playSound("neutron", "add");
    } else {
      playSound("error");
    }
  };

  const removeNeutron = () => {
    if (atomState.neutrons > 0) {
      setAtomState((prev) => ({ ...prev, neutrons: prev.neutrons - 1 }));
      playSound("neutron", "remove");
    } else {
      playSound("error");
    }
  };

  const addElectron = () => {
    if (atomState.electrons < 30) {
      // Arbitrary limit
      setAtomState((prev) => ({ ...prev, electrons: prev.electrons + 1 }));
      playSound("electron", "add");
    } else {
      playSound("error");
    }
  };

  const removeElectron = () => {
    if (atomState.electrons > 0) {
      setAtomState((prev) => ({ ...prev, electrons: prev.electrons - 1 }));
      playSound("electron", "remove");
    } else {
      playSound("error");
    }
  };

  const resetAtom = () => {
    setAtomState({
      protons: 1,
      neutrons: 1,
      electrons: 1,
      viewMode: "orbit",
      showLabels: true,
      soundEnabled: atomState.soundEnabled,
    });
    playSound("reset");
  };

  const toggleViewMode = () => {
    setAtomState((prev) => ({
      ...prev,
      viewMode: prev.viewMode === "orbit" ? "cloud" : "orbit",
    }));
  };

  const toggleLabels = () => {
    setAtomState((prev) => ({ ...prev, showLabels: !prev.showLabels }));
  };

  const toggleSoundSetting = () => {
    setAtomState((prev) => {
      const newSoundEnabled = !prev.soundEnabled;
      toggleSound(newSoundEnabled);
      return { ...prev, soundEnabled: newSoundEnabled };
    });
  };

  // Handle particle drops from drag and drop
  const handleParticleDrop = (type: "proton" | "neutron" | "electron") => {
    switch (type) {
      case "proton":
        addProton();
        playSound("proton", "drop");
        break;
      case "neutron":
        addNeutron();
        playSound("neutron", "drop");
        break;
      case "electron":
        addElectron();
        playSound("electron", "drop");
        break;
    }
  };

  // Function to save a screenshot
  const saveScreenshot = () => {
    const atomViewElement = document.querySelector(
      ".atom-builder-3d"
    ) as HTMLElement;

    if (atomViewElement) {
      // Show a temporary message
      const message = document.createElement("div");
      message.className =
        "fixed top-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg z-50";
      message.innerText = "Capturing screenshot...";
      document.body.appendChild(message);

      // Capture the atom view
      html2canvas(atomViewElement, {
        backgroundColor: null,
        useCORS: true,
        scale: 2, // Higher quality
      }).then((canvas) => {
        // Create a download link
        const link = document.createElement("a");
        link.download = `atom-${elementInfo.name}-${atomState.protons}p-${atomState.neutrons}n-${atomState.electrons}e.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        // Update message
        message.innerText = "Screenshot saved!";
        message.className =
          "fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg z-50";

        // Remove message after a delay
        setTimeout(() => {
          document.body.removeChild(message);
        }, 2000);
      });
    } else {
      console.error("Atom view element not found");
    }
  };

  // Value object to be provided to consumers
  const value = {
    atomState,
    elementInfo,
    addProton,
    removeProton,
    addNeutron,
    removeNeutron,
    addElectron,
    removeElectron,
    resetAtom,
    toggleViewMode,
    toggleLabels,
    toggleSound: toggleSoundSetting,
    saveScreenshot,
    handleParticleDrop,
  };

  return <AtomContext.Provider value={value}>{children}</AtomContext.Provider>;
};

// Custom hook for using the atom context
export const useAtom = (): AtomContextType => {
  const context = useContext(AtomContext);
  if (context === undefined) {
    throw new Error("useAtom must be used within an AtomProvider");
  }
  return context;
};
