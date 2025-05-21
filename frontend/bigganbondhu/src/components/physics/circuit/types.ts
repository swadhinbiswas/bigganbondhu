// Common types used across circuit simulator components

export type ComponentType =
  | "battery"
  | "resistor"
  | "wire"
  | "switch"
  | "bulb"
  | "led"
  | "capacitor"
  | "inductor";

export type CircuitComponent = {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  rotation: number;
  connections: {
    from: { x: number; y: number };
    to: { x: number; y: number };
  };
  properties: {
    voltage?: number;
    resistance?: number;
    capacitance?: number;
    inductance?: number;
    state?: "on" | "off";
    color?: string;
    scale?: number;
  };
  selected?: boolean;
  hovered?: boolean;
};

export type Connection = {
  from: string; // component id
  to: string; // component id
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
  current?: number;
  voltage?: number;
};

export type CircuitState = {
  components: CircuitComponent[];
  connections: Connection[];
  totalVoltage: number;
  totalResistance: number;
  totalCurrent: number;
};

export type CircuitMode = "series" | "parallel" | "free" | "challenge";

export interface Challenge {
  mode: "series" | "parallel" | "free";
  totalResistance?: number;
  totalVoltage?: number;
  description?: string;
}

export interface CircuitSimulatorProps {
  voltage: number;
  resistance: number;
  showLabels: boolean;
  mode?: CircuitMode;
  showCurrent?: boolean;
  challenge?: Challenge;
  onChallengeResult?: (result: "success" | "error" | "warning") => void;
}

export const componentPalette = [
  {
    type: "battery" as ComponentType,
    label: "ব্যাটারি",
    icon: "🔋",
    tooltip: "ভোল্টেজ সরবরাহকারী",
  },
  {
    type: "resistor" as ComponentType,
    label: "রেজিস্টর",
    icon: "🟫",
    tooltip: "রেজিস্ট্যান্স প্রদানকারী",
  },
  {
    type: "wire" as ComponentType,
    label: "তার",
    icon: "➖",
    tooltip: "সংযোগকারী তার",
  },
  {
    type: "switch" as ComponentType,
    label: "সুইচ",
    icon: "🔘",
    tooltip: "সার্কিট চালু/বন্ধ",
  },
  {
    type: "bulb" as ComponentType,
    label: "বাল্ব",
    icon: "💡",
    tooltip: "আলো দেখায়",
  },
  {
    type: "led" as ComponentType,
    label: "এলইডি",
    icon: "🔆",
    tooltip: "ডায়োড লাইট",
  },
  {
    type: "capacitor" as ComponentType,
    label: "ক্যাপাসিটর",
    icon: "⚡",
    tooltip: "চার্জ সঞ্চয় করে",
  },
  {
    type: "inductor" as ComponentType,
    label: "ইন্ডাক্টর",
    icon: "🧲",
    tooltip: "চৌম্বক ক্ষেত্র তৈরি করে",
  },
];

// Component size definitions
export const componentSizes = {
  battery: { width: 60, height: 40 },
  resistor: { width: 80, height: 30 },
  wire: { width: 20, height: 20 },
  switch: { width: 50, height: 30 },
  bulb: { width: 50, height: 50 },
  led: { width: 40, height: 40 },
  capacitor: { width: 60, height: 40 },
  inductor: { width: 60, height: 40 },
};

// Connection point definitions (normalized -1 to 1 coordinates)
export const connectionPoints = {
  battery: {
    input: [{ x: -1, y: 0 }],
    output: [{ x: 1, y: 0 }],
  },
  resistor: {
    input: [{ x: -1, y: 0 }],
    output: [{ x: 1, y: 0 }],
  },
  wire: {
    input: [{ x: 0, y: 0 }],
    output: [{ x: 0, y: 0 }],
  },
  switch: {
    input: [{ x: -1, y: 0 }],
    output: [{ x: 1, y: 0 }],
  },
  bulb: {
    input: [{ x: 0, y: 1 }],
    output: [{ x: 0, y: -1 }],
  },
  led: {
    input: [{ x: -1, y: 0 }],
    output: [{ x: 1, y: 0 }],
  },
  capacitor: {
    input: [{ x: -1, y: 0 }],
    output: [{ x: 1, y: 0 }],
  },
  inductor: {
    input: [{ x: -1, y: 0 }],
    output: [{ x: 1, y: 0 }],
  },
};
