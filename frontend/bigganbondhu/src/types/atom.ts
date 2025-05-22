// Types of subatomic particles
export type ParticleType = "proton" | "neutron" | "electron";

// Basic particle properties
export interface Particle {
  id: string;
  type: ParticleType;
  position: [number, number, number]; // 3D position
}

// Properties for draggable particles
export interface DraggableParticle {
  id: string;
  type: ParticleType;
}

// Electron shell configuration
export interface ElectronShell {
  level: number;
  capacity: number;
  electrons: number;
  radius: number;
}

// Standard electron shell configuration following the 2n² rule
export const ELECTRON_SHELLS: ElectronShell[] = [
  { level: 1, capacity: 2, electrons: 0, radius: 2 }, // K shell (2)
  { level: 2, capacity: 8, electrons: 0, radius: 3.5 }, // L shell (8)
  { level: 3, capacity: 18, electrons: 0, radius: 5 }, // M shell (18)
  { level: 4, capacity: 32, electrons: 0, radius: 6.5 }, // N shell (32)
];

// Particle properties for visualization
export const PARTICLE_CONFIG = {
  proton: {
    color: "#FF5555", // Red
    size: 0.5,
    charge: 1,
    mass: 1.0073,
  },
  neutron: {
    color: "#AAAAAA", // Gray
    size: 0.5,
    charge: 0,
    mass: 1.0087,
  },
  electron: {
    color: "#5555FF", // Blue
    size: 0.25,
    charge: -1,
    mass: 0.00055,
  },
};

// Calculate electron configuration for a given electron count
export function calculateElectronConfiguration(
  totalElectrons: number,
): ElectronShell[] {
  let remainingElectrons = totalElectrons;

  return ELECTRON_SHELLS.map((shell) => {
    const shellCopy = { ...shell };
    const electronsInThisShell = Math.min(remainingElectrons, shell.capacity);

    shellCopy.electrons = electronsInThisShell;
    remainingElectrons -= electronsInThisShell;

    return shellCopy;
  });
}
