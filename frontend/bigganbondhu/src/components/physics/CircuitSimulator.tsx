import React, { useEffect, useState } from "react";

// Component types
type CircuitComponent = {
  id: string;
  type: "battery" | "resistor" | "wire" | "switch" | "bulb";
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
    state?: "on" | "off";
  };
};

type Connection = {
  from: string; // component id
  to: string; // component id
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
  current?: number;
  voltage?: number;
};

type CircuitState = {
  components: CircuitComponent[];
  connections: Connection[];
  totalVoltage: number;
  totalResistance: number;
  totalCurrent: number;
};

interface Challenge {
  mode: "series" | "parallel" | "free";
  totalResistance?: number;
  totalVoltage?: number;
  description?: string;
}

interface CircuitSimulatorProps {
  voltage: number;
  resistance: number;
  mode?: "series" | "parallel" | "free" | "challenge";
  challenge?: Challenge;
  onChallengeResult?: (result: "success" | "error" | "warning") => void;
}

const CircuitSimulator: React.FC<CircuitSimulatorProps> = ({
  voltage,
  resistance,
  mode: modeProp = "free",
  challenge,
  onChallengeResult,
}) => {
  const [circuitState, setCircuitState] = useState<CircuitState>({
    components: [],
    connections: [],
    totalVoltage: voltage,
    totalResistance: resistance,
    totalCurrent: voltage / resistance,
  });
  const [mode, setMode] = useState<
    "series" | "parallel" | "free" | "challenge"
  >(modeProp);
  const [gridSize] = useState<number>(20);

  // Update circuit calculations when voltage or resistance changes from props
  useEffect(() => {
    calculateCircuit();
  }, [voltage, resistance, circuitState.components, circuitState.connections]);

  // Sync mode with props if it changes
  useEffect(() => {
    setMode(modeProp);
  }, [modeProp]);

  useEffect(() => {
    const setChallengeResult = (
      result: "success" | "error" | "warning" | null
    ) => {
      if (onChallengeResult && result) {
        onChallengeResult(result);
      }
    };

    if (modeProp === "challenge" && challenge) {
      let result: "success" | "error" | "warning" = "error";
      if (circuitState.totalResistance < 0.01) {
        result = "warning";
      } else if (
        (!challenge.mode || challenge.mode === mode) &&
        (challenge.totalResistance === undefined ||
          Math.abs(circuitState.totalResistance - challenge.totalResistance) /
            challenge.totalResistance <
            0.05)
      ) {
        result = "success";
      } else {
        result = "error";
      }

      setChallengeResult(result);
      if (onChallengeResult) onChallengeResult(result);
    } else {
      setChallengeResult(null);
    }
  }, [
    modeProp,
    challenge,
    circuitState.totalResistance,
    mode,
    onChallengeResult,
  ]);

  const calculateCircuit = () => {
    if (circuitState.components.length === 0) return;

    let totalVoltage = 0;
    let totalResistance = 0;

    circuitState.components.forEach((comp) => {
      if (comp.type === "battery") {
        totalVoltage += comp.properties.voltage || voltage;
      }
      if (comp.type === "resistor") {
        if (mode === "series") {
          totalResistance += comp.properties.resistance || resistance;
        } else if (mode === "parallel") {
          totalResistance =
            totalResistance === 0
              ? comp.properties.resistance || resistance
              : (totalResistance * (comp.properties.resistance || resistance)) /
                (totalResistance + (comp.properties.resistance || resistance));
        }
      }
    });

    if (totalResistance === 0) totalResistance = resistance;
    if (totalVoltage === 0) totalVoltage = voltage;

    const totalCurrent = totalVoltage / totalResistance;

    const updatedConnections = circuitState.connections.map((conn) => {
      conn.current = totalCurrent;

      const connectedComp = circuitState.components.find(
        (c) => c.id === conn.to
      );
      if (connectedComp && connectedComp.type === "resistor") {
        conn.voltage =
          totalCurrent * (connectedComp.properties.resistance || resistance);
      } else {
        conn.voltage = 0;
      }

      return conn;
    });

    setCircuitState((prev) => ({
      ...prev,
      connections: updatedConnections,
      totalVoltage,
      totalResistance,
      totalCurrent,
    }));
  };

  const grid = [];
  for (let i = 0; i < 800; i += gridSize) {
    grid.push(
      <div
        key={`h-${i}`}
        className="absolute h-px w-full bg-gray-100 dark:bg-gray-800"
        style={{ left: "0px", top: `${i}px` }}
      />
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-md shadow-md">
      <div className="flex flex-col gap-4">
        <div className="relative min-h-[600px] border border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800">
          {grid}
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-800 rounded-lg shadow p-4 text-center">
            <h4 className="font-bold mb-2">সার্কিট তথ্য</h4>
            <p>মোট ভোল্টেজ: {circuitState.totalVoltage.toFixed(2)} V</p>
            <p>মোট রেজিস্টেন্স: {circuitState.totalResistance.toFixed(2)} Ω</p>
            <p>মোট কারেন্ট: {circuitState.totalCurrent.toFixed(3)} A</p>
            <p className="mt-2 text-sm text-gray-600">( I = V/R )</p>
            <p className="text-sm text-gray-600">
              {mode === "series"
                ? "সিরিজ: Rₜ = R₁ + R₂ + ... + Rₙ"
                : mode === "parallel"
                  ? "প্যারালাল: 1/Rₜ = 1/R₁ + 1/R₂ + ... + 1/Rₙ"
                  : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircuitSimulator;
