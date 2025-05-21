// Circuit calculation utilities
import {
  CircuitComponent,
  CircuitMode,
  CircuitState,
  Connection,
} from "./types";

/**
 * Calculate the total resistance in a circuit based on the mode
 */
export const calculateTotalResistance = (
  components: CircuitComponent[],
  mode: CircuitMode
): number => {
  const resistors = components.filter((comp) => comp.type === "resistor");

  if (resistors.length === 0) return 0;

  // Get resistance values (or default to 10 ohms)
  const resistances = resistors.map((r) => r.properties.resistance || 10);

  if (mode === "series") {
    // Series: resistances add up
    return resistances.reduce((sum, r) => sum + r, 0);
  } else if (mode === "parallel") {
    // Parallel: reciprocal of sum of reciprocals
    const reciprocalSum = resistances.reduce((sum, r) => sum + 1 / r, 0);
    return 1 / reciprocalSum;
  } else {
    // Free mode or challenge - for now, treat as series
    // In a more advanced implementation, this would do proper nodal analysis
    return resistances.reduce((sum, r) => sum + r, 0);
  }
};

/**
 * Calculate the total voltage in the circuit
 */
export const calculateTotalVoltage = (
  components: CircuitComponent[]
): number => {
  const batteries = components.filter((comp) => comp.type === "battery");

  if (batteries.length === 0) return 0;

  // Sum all battery voltages (or default to 6V)
  return batteries.reduce(
    (sum, battery) => sum + (battery.properties.voltage || 6),
    0
  );
};

/**
 * Calculate the total capacitance in a circuit based on mode
 */
export const calculateTotalCapacitance = (
  components: CircuitComponent[],
  mode: CircuitMode
): number => {
  const capacitors = components.filter((comp) => comp.type === "capacitor");

  if (capacitors.length === 0) return 0;

  // Get capacitance values (default to 10 μF)
  const capacitances = capacitors.map((c) => c.properties.capacitance || 10);

  if (mode === "series") {
    // Series: reciprocal of sum of reciprocals
    const reciprocalSum = capacitances.reduce((sum, c) => sum + 1 / c, 0);
    return 1 / reciprocalSum;
  } else if (mode === "parallel") {
    // Parallel: capacitances add up
    return capacitances.reduce((sum, c) => sum + c, 0);
  } else {
    // Default to parallel behavior for free mode
    return capacitances.reduce((sum, c) => sum + c, 0);
  }
};

/**
 * Calculate the total inductance in a circuit based on mode
 */
export const calculateTotalInductance = (
  components: CircuitComponent[],
  mode: CircuitMode
): number => {
  const inductors = components.filter((comp) => comp.type === "inductor");

  if (inductors.length === 0) return 0;

  // Get inductance values (default to 5 mH)
  const inductances = inductors.map((i) => i.properties.inductance || 5);

  if (mode === "series") {
    // Series: inductances add up
    return inductances.reduce((sum, i) => sum + i, 0);
  } else if (mode === "parallel") {
    // Parallel: reciprocal of sum of reciprocals
    const reciprocalSum = inductances.reduce((sum, i) => sum + 1 / i, 0);
    return 1 / reciprocalSum;
  } else {
    // Default to series behavior for free mode
    return inductances.reduce((sum, i) => sum + i, 0);
  }
};

/**
 * Calculate the current through a component
 */
export const calculateCurrent = (
  totalVoltage: number,
  totalResistance: number
): number => {
  // Prevent division by zero
  if (totalResistance <= 0) return 0;

  // Ohm's Law: I = V/R
  return totalVoltage / totalResistance;
};

/**
 * Check if the circuit is complete (has at least one battery and one resistor)
 */
export const isCircuitComplete = (components: CircuitComponent[]): boolean => {
  const hasBattery = components.some((comp) => comp.type === "battery");
  const hasResistor = components.some((comp) => comp.type === "resistor");
  const hasSwitch = components.some((comp) => comp.type === "switch");

  // If there is a switch, it must be ON for the circuit to be complete
  const switchesOn = hasSwitch
    ? components
        .filter((comp) => comp.type === "switch")
        .every((sw) => sw.properties.state === "on")
    : true;

  return hasBattery && hasResistor && switchesOn;
};

/**
 * Calculate the voltage drop across a component
 */
export const calculateVoltageAcrossComponent = (
  component: CircuitComponent,
  totalVoltage: number,
  totalResistance: number,
  mode: CircuitMode
): number => {
  if (component.type !== "resistor") return 0;

  const resistance = component.properties.resistance || 10;

  if (mode === "series") {
    // In series, voltage is proportional to resistance
    return (resistance / totalResistance) * totalVoltage;
  } else if (mode === "parallel") {
    // In parallel, all components have the same voltage
    return totalVoltage;
  } else {
    // Free mode - simplified, actual calculation would need path analysis
    return (resistance / totalResistance) * totalVoltage;
  }
};

/**
 * Calculate all circuit properties
 */
export const calculateCircuit = (
  circuitState: CircuitState,
  mode: CircuitMode
): CircuitState => {
  const { components, connections } = circuitState;

  // Calculate total voltage and resistance
  const totalVoltage = calculateTotalVoltage(components);
  const totalResistance = calculateTotalResistance(components, mode);

  // Calculate total current using Ohm's Law
  const totalCurrent = calculateCurrent(totalVoltage, totalResistance);

  // Additional calculations for capacitors and inductors
  const totalCapacitance = calculateTotalCapacitance(components, mode);
  const totalInductance = calculateTotalInductance(components, mode);

  // Update connections with current values
  const updatedConnections: Connection[] = connections.map((conn) => {
    // For series circuit, current is the same everywhere
    let current = totalCurrent;

    // In parallel, current divides based on resistance ratios
    if (mode === "parallel") {
      const toComp = components.find((c) => c.id === conn.to);
      if (toComp && toComp.type === "resistor") {
        const resistance = toComp.properties.resistance || 10;
        // Current division formula
        current = totalVoltage / resistance;
      }
    }

    // Voltage across the component
    let voltage = 0;
    const connectedComp = components.find((c) => c.id === conn.to);
    if (connectedComp) {
      if (connectedComp.type === "resistor") {
        voltage = calculateVoltageAcrossComponent(
          connectedComp,
          totalVoltage,
          totalResistance,
          mode
        );
      } else if (connectedComp.type === "led") {
        // LED has a forward voltage drop (typically around 2V)
        voltage = Math.min(totalVoltage, 2);
      } else if (connectedComp.type === "bulb") {
        // Simplified bulb voltage calculation
        voltage = Math.min(totalVoltage, 3);
      }
    }

    return {
      ...conn,
      current,
      voltage,
    };
  });

  return {
    components,
    connections: updatedConnections,
    totalVoltage,
    totalResistance,
    totalCurrent,
  };
};

/**
 * Get the available connection points for a component based on its type
 */
export const getConnectionPoints = (
  component: CircuitComponent
): {
  input: { x: number; y: number }[];
  output: { x: number; y: number }[];
} => {
  const scale = component.properties.scale || 1.0;
  const size = 40 * scale; // Base size
  const rotation = component.rotation || 0;
  const rad = (rotation * Math.PI) / 180;

  // Function to rotate a point around the component center
  const rotatePoint = (x: number, y: number) => {
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;
    return { x: component.x + rx, y: component.y + ry };
  };

  switch (component.type) {
    case "battery":
      return {
        input: [rotatePoint(-size / 2, 0)],
        output: [rotatePoint(size / 2, 0)],
      };
    case "resistor":
      return {
        input: [rotatePoint(-size / 2, 0)],
        output: [rotatePoint(size / 2, 0)],
      };
    case "switch":
      return {
        input: [rotatePoint(-size / 2, 0)],
        output: [rotatePoint(size / 2, 0)],
      };
    case "bulb":
      return {
        input: [rotatePoint(0, size / 2)],
        output: [rotatePoint(0, -size / 2)],
      };
    case "led":
      return {
        input: [rotatePoint(-size / 2, 0)],
        output: [rotatePoint(size / 2, 0)],
      };
    case "capacitor":
      return {
        input: [rotatePoint(-size / 2, 0)],
        output: [rotatePoint(size / 2, 0)],
      };
    case "inductor":
      return {
        input: [rotatePoint(-size / 2, 0)],
        output: [rotatePoint(size / 2, 0)],
      };
    case "wire":
    default:
      return {
        input: [rotatePoint(0, 0)],
        output: [rotatePoint(0, 0)],
      };
  }
};
