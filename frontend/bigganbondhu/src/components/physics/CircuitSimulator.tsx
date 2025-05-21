import React, { useEffect, useRef, useState } from "react";

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

// Palette components
const componentPalette = [
  {
    type: "battery",
    label: "ব্যাটারি",
    icon: "🔋",
    tooltip: "ভোল্টেজ সরবরাহকারী",
  },
  {
    type: "resistor",
    label: "রেজিস্টর",
    icon: "🟫",
    tooltip: "রেজিস্ট্যান্স প্রদানকারী",
  },
  { type: "wire", label: "তার", icon: "➖", tooltip: "সংযোগকারী তার" },
  { type: "switch", label: "সুইচ", icon: "🔘", tooltip: "সার্কিট চালু/বন্ধ" },
  { type: "bulb", label: "বাল্ব", icon: "💡", tooltip: "আলো দেখায়" },
];

interface CircuitSimulatorProps {
  voltage: number;
  resistance: number;
  showLabels: boolean;
  mode?: "series" | "parallel" | "free" | "challenge";
  showCurrent?: boolean;
  challenge?: Challenge;
  onChallengeResult?: (result: "success" | "error" | "warning") => void;
}

const CircuitSimulator: React.FC<CircuitSimulatorProps> = ({
  voltage,
  resistance,
  showLabels,
  mode: modeProp = "free",
  showCurrent: showCurrentProp = true,
  challenge,
  onChallengeResult,
}) => {
  const stageRef = useRef<any>(null);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null
  );
  const [circuitState, setCircuitState] = useState<CircuitState>({
    components: [],
    connections: [],
    totalVoltage: voltage,
    totalResistance: resistance,
    totalCurrent: voltage / resistance,
  });
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [mode, setMode] = useState<
    "series" | "parallel" | "free" | "challenge"
  >(modeProp);
  const [showCircuitInfo, setShowCircuitInfo] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [gridSize] = useState<number>(20);
  const [canvasSize] = useState({ width: 800, height: 600 });
  const [showCurrent, setShowCurrent] = useState<boolean>(showCurrentProp);
  const [challengeResult, setChallengeResult] = useState<
    "success" | "error" | "warning" | null
  >(null);
  const [challengeMessage, setChallengeMessage] = useState<string>("");
  const [dragGhost, setDragGhost] = useState<{
    type: string;
    x: number;
    y: number;
  } | null>(null);
  const [hoveredGrid, setHoveredGrid] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [pulse, setPulse] = useState(0);

  // Update circuit calculations when voltage or resistance changes from props
  useEffect(() => {
    calculateCircuit();
  }, [voltage, resistance, circuitState.components, circuitState.connections]);

  // Sync mode/showCurrent with props if they change
  useEffect(() => {
    setMode(modeProp);
  }, [modeProp]);
  useEffect(() => {
    setShowCurrent(showCurrentProp);
  }, [showCurrentProp]);

  // Validation logic for challenge mode
  useEffect(() => {
    if (modeProp === "challenge" && challenge) {
      let result: "success" | "error" | "warning" = "error";
      let msg = "";
      // Check for short circuit
      if (circuitState.totalResistance < 0.01) {
        result = "warning";
        msg = "শর্ট সার্কিট! মোট রেজিস্টেন্স খুবই কম।";
      } else if (
        (!challenge.mode || challenge.mode === mode) &&
        (challenge.totalResistance === undefined ||
          Math.abs(circuitState.totalResistance - challenge.totalResistance) /
            challenge.totalResistance <
            0.05)
      ) {
        result = "success";
        msg = "অভিনন্দন! আপনি চ্যালেঞ্জটি সফলভাবে সম্পন্ন করেছেন।";
      } else {
        result = "error";
        msg = "চ্যালেঞ্জের শর্ত পূরণ হয়নি। আবার চেষ্টা করুন।";
      }
      setChallengeResult(result);
      setChallengeMessage(msg);
      if (onChallengeResult) onChallengeResult(result);
    } else {
      setChallengeResult(null);
      setChallengeMessage("");
    }
  }, [modeProp, challenge, circuitState.totalResistance, mode]);

  const calculateCircuit = () => {
    // Simple implementation for demo - assumes a simple circuit
    if (circuitState.components.length === 0) return;

    let totalVoltage = 0;
    let totalResistance = 0;

    // Sum all battery voltages
    circuitState.components.forEach((comp) => {
      if (comp.type === "battery") {
        totalVoltage += comp.properties.voltage || voltage;
      }
      if (comp.type === "resistor") {
        if (mode === "series") {
          // Series: resistances add up
          totalResistance += comp.properties.resistance || resistance;
        } else if (mode === "parallel") {
          // Parallel: reciprocal of sum of reciprocals
          totalResistance =
            totalResistance === 0
              ? comp.properties.resistance || resistance
              : (totalResistance * (comp.properties.resistance || resistance)) /
                (totalResistance + (comp.properties.resistance || resistance));
        }
      }
    });

    // If no resistors yet, use default resistance
    if (totalResistance === 0) totalResistance = resistance;
    if (totalVoltage === 0) totalVoltage = voltage;

    // Calculate current using Ohm's Law: I = V/R
    const totalCurrent = totalVoltage / totalResistance;

    // Update connections with current and voltage values
    const updatedConnections = circuitState.connections.map((conn) => {
      // For series circuit, current is the same everywhere
      conn.current = totalCurrent;

      // For voltage across components, find connected component
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

  const addComponent = (
    type: "battery" | "resistor" | "wire" | "switch" | "bulb"
  ) => {
    setDragGhost({ type, x: 350, y: 250 });
  };

  const removeComponent = (id: string) => {
    setCircuitState((prev) => ({
      ...prev,
      components: prev.components.filter((c) => c.id !== id),
      connections: prev.connections.filter((c) => c.from !== id && c.to !== id),
    }));

    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedComponent(id);
    setIsDragging(true);
  };

  const handleDragEnd = (e: React.DragEvent, id: string) => {
    setIsDragging(false);
    setDraggedComponent(null);

    if (!snapToGrid) return;

    // Snap to grid
    const pos = e.target.getBoundingClientRect();
    const newX =
      Math.round((pos.left - pos.width / 2) / gridSize) * gridSize +
      gridSize / 2;
    const newY =
      Math.round((pos.top - pos.height / 2) / gridSize) * gridSize +
      gridSize / 2;

    setCircuitState((prev) => ({
      ...prev,
      components: prev.components.map((c) => {
        if (c.id === id) {
          return { ...c, x: newX, y: newY };
        }
        return c;
      }),
    }));
  };

  const toggleSwitch = (id: string) => {
    setCircuitState((prev) => ({
      ...prev,
      components: prev.components.map((c) => {
        if (c.id === id && c.type === "switch") {
          return {
            ...c,
            properties: {
              ...c.properties,
              state: c.properties.state === "on" ? "off" : "on",
            },
          };
        }
        return c;
      }),
    }));

    // Recalculate circuit when switch state changes
    calculateCircuit();
  };

  const connect = (fromId: string, toId: string) => {
    if (fromId === toId) return;

    const fromComp = circuitState.components.find((c) => c.id === fromId);
    const toComp = circuitState.components.find((c) => c.id === toId);

    if (!fromComp || !toComp) return;

    const newConnection: Connection = {
      from: fromId,
      to: toId,
      fromPos: { x: fromComp.x, y: fromComp.y },
      toPos: { x: toComp.x, y: toComp.y },
    };

    setCircuitState((prev) => ({
      ...prev,
      connections: [...prev.connections, newConnection],
    }));

    calculateCircuit();
  };

  // Component rendering functions
  const renderBattery = (component: CircuitComponent, isSelected: boolean) => (
    <div
      className={`w-10 h-4 border border-black ${isSelected ? "bg-blue-200" : "bg-white"}`}
      style={{
        transform: `translate(${component.x}px, ${component.y}px) rotate(${component.rotation}deg)`,
      }}
      draggable
      onDragStart={(e) => handleDragStart(e, component.id)}
      onDragEnd={(e) => handleDragEnd(e, component.id)}
    >
      <div className="w-full h-full flex items-center justify-center">
        {component.properties.voltage || voltage}V
      </div>
    </div>
  );

  const renderResistor = (component: CircuitComponent, isSelected: boolean) => (
    <div
      className={`w-10 h-2 border border-black ${isSelected ? "bg-blue-200" : "bg-gray-200"}`}
      style={{
        transform: `translate(${component.x}px, ${component.y}px) rotate(${component.rotation}deg)`,
      }}
      draggable
      onDragStart={(e) => handleDragStart(e, component.id)}
      onDragEnd={(e) => handleDragEnd(e, component.id)}
    >
      <div className="w-full h-full flex items-center justify-center">
        {component.properties.resistance || resistance}Ω
      </div>
    </div>
  );

  const renderSwitch = (component: CircuitComponent, isSelected: boolean) => (
    <div
      className={`w-4 h-3 border border-black ${isSelected ? "bg-blue-200" : "bg-gray-200"}`}
      style={{
        transform: `translate(${component.x}px, ${component.y}px) rotate(${component.rotation}deg)`,
      }}
      draggable
      onDragStart={(e) => handleDragStart(e, component.id)}
      onDragEnd={(e) => handleDragEnd(e, component.id)}
      onClick={() => toggleSwitch(component.id)}
    >
      <div className="w-full h-full flex items-center justify-center">
        {component.properties.state === "on" ? "ON" : "OFF"}
      </div>
    </div>
  );

  const renderWire = (component: CircuitComponent, isSelected: boolean) => (
    <div
      className={`w-1 h-1 border border-black ${isSelected ? "bg-blue-200" : "bg-gray-200"}`}
      style={{
        transform: `translate(${component.x}px, ${component.y}px) rotate(${component.rotation}deg)`,
      }}
      draggable
      onDragStart={(e) => handleDragStart(e, component.id)}
      onDragEnd={(e) => handleDragEnd(e, component.id)}
    ></div>
  );

  const renderBulb = (component: CircuitComponent, isSelected: boolean) => {
    // Determine if bulb should be lit based on circuit state
    const isLit =
      circuitState.totalCurrent > 0 &&
      circuitState.components.find((c) =>
        c.type === "switch" ? c.properties.state === "on" : true
      );

    return (
      <div
        className={`w-20 h-20 border border-black ${isSelected ? "bg-yellow-200" : "bg-white"}`}
        style={{
          transform: `translate(${component.x}px, ${component.y}px) rotate(${component.rotation}deg)`,
        }}
        draggable
        onDragStart={(e) => handleDragStart(e, component.id)}
        onDragEnd={(e) => handleDragEnd(e, component.id)}
      >
        <div className="w-full h-full flex items-center justify-center">
          {isLit && (
            <div className="w-10 h-10 bg-yellow-500 rounded-full"></div>
          )}
        </div>
      </div>
    );
  };

  const renderConnection = (connection: Connection) => {
    const fromComp = circuitState.components.find(
      (c) => c.id === connection.from
    );
    const toComp = circuitState.components.find((c) => c.id === connection.to);

    if (!fromComp || !toComp) return null;

    // Determine the color based on current flow
    const currentIntensity = connection.current || 0;
    let strokeColor = "black";
    let strokeWidth = 2;

    if (showCurrent && currentIntensity > 0) {
      // Color gradient based on current intensity
      const intensity = Math.min(255, Math.round(currentIntensity * 50));
      strokeColor = `rgb(0, ${intensity}, 255)`;
      strokeWidth = 2 + Math.min(3, currentIntensity);
    }

    return (
      <div
        key={`${connection.from}-${connection.to}`}
        className={`absolute w-full h-full ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{
          transform: `translate(${fromComp.x}px, ${fromComp.y}px) rotate(${fromComp.rotation}deg)`,
        }}
      >
        <div
          className={`absolute w-full h-full ${strokeColor} ${strokeWidth > 2 ? "opacity-50" : ""}`}
          style={{
            transform: `translate(${toComp.x - fromComp.x}px, ${toComp.y - fromComp.y}px) rotate(${toComp.rotation - fromComp.rotation}deg)`,
          }}
        ></div>
      </div>
    );
  };

  const renderGrid = () => {
    const grid = [];
    for (let i = 0; i < canvasSize.width; i += gridSize) {
      grid.push(
        <div
          key={`v-${i}`}
          className="absolute w-full h-1 bg-gray-200"
          style={{ left: `${i}px`, top: "0px" }}
        ></div>
      );
    }
    for (let i = 0; i < canvasSize.height; i += gridSize) {
      grid.push(
        <div
          key={`h-${i}`}
          className="absolute w-1 h-full bg-gray-200"
          style={{ left: "0px", top: `${i}px` }}
        ></div>
      );
    }
    return grid;
  };

  // Mouse move handler for canvas
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!dragGhost) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(700, e.clientX - rect.left));
    const y = Math.max(0, Math.min(500, e.clientY - rect.top));
    setDragGhost({ ...dragGhost, x, y });
    // Snap preview
    setHoveredGrid({
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    });
  };

  // Mouse up handler for canvas
  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    if (!dragGhost) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(700, e.clientX - rect.left));
    const y = Math.max(0, Math.min(500, e.clientY - rect.top));
    const snapX = Math.round(x / gridSize) * gridSize;
    const snapY = Math.round(y / gridSize) * gridSize;
    const id = `${dragGhost.type}-${Date.now()}`;
    const newComponent: CircuitComponent = {
      id,
      type: dragGhost.type as any,
      x: snapX,
      y: snapY,
      rotation: 0,
      connections: {
        from: { x: 0, y: 0 },
        to: { x: 0, y: 0 },
      },
      properties: {
        voltage: dragGhost.type === "battery" ? voltage : undefined,
        resistance: dragGhost.type === "resistor" ? resistance : undefined,
        state: dragGhost.type === "switch" ? "off" : undefined,
      },
    };
    setCircuitState((prev) => ({
      ...prev,
      components: [...prev.components, newComponent],
    }));
    setSelectedComponent(id);
    setDragGhost(null);
    setHoveredGrid(null);
  };

  // Wire animation: use a pulsing color for current
  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => (p + 1) % 100), 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full justify-center items-start">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-6">
        {/* Palette */}
        <div className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-800 rounded-xl shadow p-4 mb-2">
          <h3 className="text-lg font-bold mb-3 text-center">
            কম্পোনেন্ট প্যালেট
          </h3>
          <div className="flex flex-col gap-3">
            {componentPalette.map((component) => (
              <button
                key={component.type}
                className="flex items-center gap-2 px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 transition shadow relative"
                onClick={() => addComponent(component.type as any)}
                title={component.tooltip}
                onMouseEnter={() => setHoveredComponent(component.type)}
                onMouseLeave={() => setHoveredComponent(null)}
              >
                <span className="text-xl">{component.icon}</span>
                {component.label}
                {/* Tooltip */}
                {hoveredComponent === component.type && (
                  <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1 bg-black text-white text-xs rounded shadow z-50 whitespace-nowrap">
                    {component.tooltip}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        {/* Mode */}
        <div className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-800 rounded-xl shadow p-4 mb-2">
          <h3 className="text-lg font-bold mb-3 text-center">সার্কিট মোড</h3>
          <div className="flex flex-col gap-2">
            <button
              className={`px-4 py-2 rounded font-semibold border ${mode === "series" ? "bg-green-500 text-white border-green-600" : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700"}`}
              onClick={() => setMode("series")}
              title="সিরিজ: সব রেজিস্টর এক লাইনে"
            >
              সিরিজ
            </button>
            <button
              className={`px-4 py-2 rounded font-semibold border ${mode === "parallel" ? "bg-green-500 text-white border-green-600" : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700"}`}
              onClick={() => setMode("parallel")}
              title="প্যারালাল: রেজিস্টর পাশাপাশি"
            >
              প্যারালাল
            </button>
            <button
              className={`px-4 py-2 rounded font-semibold border ${mode === "free" ? "bg-green-500 text-white border-green-600" : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700"}`}
              onClick={() => setMode("free")}
              title="ফ্রি: যেকোনো সংযোগ"
            >
              ফ্রি
            </button>
          </div>
        </div>
        {/* Settings */}
        <div className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-800 rounded-xl shadow p-4">
          <h3 className="text-lg font-bold mb-3 text-center">সেটিংস</h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={snapToGrid}
                onChange={() => setSnapToGrid(!snapToGrid)}
              />
              গ্রিডে স্ন্যাপ করুন
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showCircuitInfo}
                onChange={() => setShowCircuitInfo(!showCircuitInfo)}
              />
              সার্কিট তথ্য দেখান
            </label>
          </div>
        </div>
        {/* Challenge mode feedback (if any) */}
        {modeProp === "challenge" && challenge && (
          <div
            className={`mt-4 p-3 rounded text-center font-bold text-base ${
              challengeResult === "success"
                ? "bg-green-100 text-green-800 border border-green-400"
                : challengeResult === "warning"
                  ? "bg-yellow-100 text-yellow-800 border border-yellow-400"
                  : challengeResult === "error"
                    ? "bg-red-100 text-red-800 border border-red-400"
                    : "bg-blue-100 text-blue-800 border border-blue-400"
            }`}
          >
            {challenge.description || "চ্যালেঞ্জ: নির্দিষ্ট সার্কিট তৈরি করুন"}
            <br />
            {challenge.totalResistance !== undefined && (
              <span>লক্ষ্য মোট রেজিস্টেন্স: {challenge.totalResistance} Ω</span>
            )}
            {challengeResult && <div className="mt-2">{challengeMessage}</div>}
          </div>
        )}
      </div>
      {/* Canvas and Info */}
      <div className="flex-1 flex flex-col items-center">
        <div
          className="relative w-[700px] max-w-full h-[500px] rounded-xl shadow-lg overflow-hidden mb-4"
          style={{
            background: "linear-gradient(135deg, #f0f4ff 0%, #e0e7ef 100%)",
          }}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
        >
          {/* SVG Grid */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 700 500"
            className="absolute left-0 top-0 w-full h-full z-0"
          >
            {/* Soft grid lines */}
            {Array.from({ length: 36 }).map((_, i) => (
              <line
                key={"v" + i}
                x1={i * 20}
                y1={0}
                x2={i * 20}
                y2={500}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
            ))}
            {Array.from({ length: 26 }).map((_, i) => (
              <line
                key={"h" + i}
                x1={0}
                y1={i * 20}
                x2={700}
                y2={i * 20}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
            ))}
            {/* Highlight hovered grid cell */}
            {hoveredGrid && (
              <rect
                x={hoveredGrid.x - gridSize / 2}
                y={hoveredGrid.y - gridSize / 2}
                width={gridSize}
                height={gridSize}
                fill="#38bdf8"
                fillOpacity={0.15}
                stroke="#38bdf8"
                strokeWidth={2}
                rx={4}
              />
            )}
          </svg>
          {/* SVG Connections (wires) */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 700 500"
            className="absolute left-0 top-0 w-full h-full z-10 pointer-events-none"
          >
            {circuitState.connections.map((conn, idx) => {
              const from = circuitState.components.find(
                (c) => c.id === conn.from
              );
              const to = circuitState.components.find((c) => c.id === conn.to);
              if (!from || !to) return null;
              let color = "#888";
              if (showCurrent && conn.current && conn.current > 0) {
                const pulseColor = Math.round(
                  180 + 75 * Math.sin((pulse + idx * 10) * 0.06)
                );
                color = `rgb(56,189,248,${0.5 + 0.5 * Math.abs(Math.sin((pulse + idx * 10) * 0.06))})`;
              }
              return (
                <line
                  key={conn.from + "-" + conn.to + idx}
                  x1={from.x + 20}
                  y1={from.y + 10}
                  x2={to.x + 20}
                  y2={to.y + 10}
                  stroke={color}
                  strokeWidth={
                    showCurrent && conn.current && conn.current > 0 ? 4 : 2
                  }
                  markerEnd="url(#arrowhead)"
                />
              );
            })}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L8,3 z" fill="#38bdf8" />
              </marker>
            </defs>
          </svg>
          {/* Drag Ghost */}
          {dragGhost && (
            <div
              className="absolute z-30 pointer-events-none opacity-70"
              style={{ left: dragGhost.x - 20, top: dragGhost.y - 10 }}
            >
              <div className="w-10 h-4 border-2 border-blue-400 bg-blue-100 rounded flex items-center justify-center text-xl shadow-lg">
                {componentPalette.find((c) => c.type === dragGhost.type)?.icon}
              </div>
            </div>
          )}
          {/* Components */}
          {circuitState.components.map((component) => {
            const isSelected = component.id === selectedComponent;
            const isHovered = hoveredComponent === component.id;
            return (
              <div
                key={component.id}
                className={`absolute z-20 cursor-pointer transition-all duration-150 ${isSelected ? "ring-4 ring-blue-400" : ""} ${isHovered ? "ring-2 ring-green-400" : ""} shadow-lg`}
                style={{ left: component.x - 20, top: component.y - 10 }}
                onMouseEnter={() => setHoveredComponent(component.id)}
                onMouseLeave={() => setHoveredComponent(null)}
                onClick={() => setSelectedComponent(component.id)}
              >
                <div className="w-10 h-4 bg-white border border-black rounded flex items-center justify-center text-xl">
                  {
                    componentPalette.find((c) => c.type === component.type)
                      ?.icon
                  }
                </div>
                {/* Tooltip/info popup */}
                {isHovered && (
                  <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 px-3 py-2 bg-black text-white text-xs rounded shadow z-50 whitespace-nowrap">
                    <div>
                      টাইপ:{" "}
                      {
                        componentPalette.find((c) => c.type === component.type)
                          ?.label
                      }
                    </div>
                    {component.type === "battery" && (
                      <div>ভোল্টেজ: {component.properties.voltage} V</div>
                    )}
                    {component.type === "resistor" && (
                      <div>
                        রেজিস্ট্যান্স: {component.properties.resistance} Ω
                      </div>
                    )}
                    {component.type === "switch" && (
                      <div>
                        অবস্থা:{" "}
                        {component.properties.state === "on" ? "চালু" : "বন্ধ"}
                      </div>
                    )}
                    {component.type === "bulb" && <div>বাল্ব</div>}
                    {component.type === "wire" && <div>তার</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Info Panel */}
        {showCircuitInfo && (
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
        )}
      </div>
    </div>
  );
};

export default CircuitSimulator;
