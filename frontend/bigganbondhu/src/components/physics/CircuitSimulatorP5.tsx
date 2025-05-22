// Import p5 types and constructor
import p5, { Image as P5Image } from "p5";
import { useEffect, useRef, useState } from "react";
// Enhanced component list with better icons and descriptions
const COMPONENTS = [
  {
    type: "battery",
    label: "ব্যাটারি",
    icon: "🔋",
    description: "voltage source",
  },
  {
    type: "resistor",
    label: "রেজিস্টর",
    icon: "🟫",
    description: "limits current flow",
  },
  {
    type: "wire",
    label: "তার",
    icon: "➖",
    description: "conducts electricity",
  },
  {
    type: "switch",
    label: "সুইচ",
    icon: "",
    description: "controls circuit flow",
  },
  {
    type: "bulb",
    label: "বাল্ব",
    icon: "💡",
    description: "lights up with current",
  },
  {
    type: "ammeter",
    label: "অ্যামিটার",
    icon: "🔎",
    description: "measures current",
  },
  {
    type: "voltmeter",
    label: "ভোল্টমিটার",
    icon: "🔍",
    description: "measures voltage",
  },
  {
    type: "led",
    label: "এলইডি",
    icon: "🔦",
    description: "light-emitting diode",
  },
];

// Layout constants for responsive design
const GRID_SIZE = 40;
const CANVAS_W = 700;
const CANVAS_H = 500;

// SVG ASSET IMPORTS
const COMPONENT_SVGS: Record<string, string> = {
  battery: "/images/battery.svg",
  resistor: "/images/resistor.svg",
  bulb: "/images/bulb.svg",
  switch: "/images/switch.svg",
  wire: "", // wires are drawn
  ammeter: "/images/ammeter.svg",
  voltmeter: "/images/voltmeter.svg",
  led: "/images/led.svg",
};

// WIRE DATA MODEL
const DEFAULT_WIRE_COLOR = "#f59e42";
const WIRE_COLORS = [
  "#f59e42", // orange (default)
  "#38bdf8", // blue
  "#22d3ee", // cyan
  "#f43f5e", // red
  "#a3e635", // lime
  "#fbbf24", // amber
  "#6366f1", // indigo
  "#e11d48", // rose
  "#10b981", // emerald
  "#fff", // white
  "#000", // black
];

// Component type definitions for better type safety
type ComponentType =
  | "battery"
  | "resistor"
  | "wire"
  | "switch"
  | "bulb"
  | "ammeter"
  | "voltmeter"
  | "led";

interface CircuitComponent {
  id?: string;
  type: ComponentType;
  x: number;
  y: number;
  value?: number;
  on?: boolean;
  selected?: boolean;
}

interface Wire {
  points: { x: number; y: number }[];
  color: string;
  from: number;
  to: number;
  selected?: boolean;
}

export default function CircuitSimulatorP5() {
  // DOM Refs
  const canvasRef = useRef<HTMLDivElement>(null);

  // Drag State
  const [dragType, setDragType] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  // Circuit State
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [result, setResult] = useState<{ status: string; message: string }>({
    status: "info",
    message: "সার্কিট তৈরি করুন!",
  });

  // Wire State
  const [wires, setWires] = useState<Wire[]>([]);
  const [connectFrom, setConnectFrom] = useState<number | null>(null);
  const [mode, setMode] = useState<"normal" | "connect">("normal");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [wireHoverIdx, setWireHoverIdx] = useState<number | null>(null);
  const [selectedWireIdx] = useState<number | null>(null);

  // Audio Context
  const [audioCtx] = useState(() =>
    typeof window !== "undefined" && window.AudioContext
      ? new window.AudioContext()
      : null
  );

  // SVG IMAGE PRELOAD
  const svgImagesRef = useRef<{ [key: string]: P5Image | null }>({});
  const [svgLoaded, setSvgLoaded] = useState(false);

  // UNDO/REDO STATE
  const [history, setHistory] = useState<
    { components: CircuitComponent[]; wires: Wire[] }[]
  >([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);

  // Wire drawing state
  // const [drawingWire, setDrawingWire] = useState<{
  //   from: number;
  //   points: { x: number; y: number }[];
  //   color: string;
  // } | null>(null);

  // SVG image preloading
  useEffect(() => {
    // Preload SVGs using p5.js
    let loaded = 0;
    let total = Object.keys(COMPONENT_SVGS).length;
    let svgImages: { [key: string]: P5Image | null } = {};
    const p5Instance = new p5(() => {});

    Object.entries(COMPONENT_SVGS).forEach(([type, url]) => {
      if (!url) {
        svgImages[type] = null;
        loaded++;
        if (loaded === total) {
          svgImagesRef.current = svgImages;
          setSvgLoaded(true);
        }
        return;
      }

      // Use the loadImage method from p5
      (p5Instance as any).loadImage(
        url,
        (img: P5Image) => {
          svgImages[type] = img;
          loaded++;
          if (loaded === total) {
            svgImagesRef.current = svgImages;
            setSvgLoaded(true);
          }
        },
        () => {
          console.warn(`Failed to load SVG for ${type}`);
          svgImages[type] = null;
          loaded++;
          if (loaded === total) {
            svgImagesRef.current = svgImages;
            setSvgLoaded(true);
          }
        }
      );
    });

    return () => {
      (p5Instance as any).remove();
    };
  }, []);

  // p5 instance creation and main sketch
  useEffect(() => {
    if (!canvasRef.current) return;

    let p5Instance: p5;
    let dragIdx: number | null = null;
    let dragOffset = { x: 0, y: 0 };

    const sketch = (p: p5) => {
      (p as any).setup = () => {
        (p as any).createCanvas(CANVAS_W, CANVAS_H);
      };

      (p as any).draw = () => {
        // Background gradient
        p.noStroke();
        for (let i = 0; i < CANVAS_H; i++) {
          const c1 = p.color("#f0f4ff");
          const c2 = p.color("#e0e7ef");
          const inter = i / CANVAS_H;
          const c = (p as any).lerpColor(c1, c2, inter);
          p.fill(c);
          p.rect(0, i, CANVAS_W, 1);
        }

        // Grid
        p.stroke("#dbeafe");
        p.strokeWeight(1);
        for (let x = 0; x <= CANVAS_W; x += GRID_SIZE) {
          p.line(x, 0, x, CANVAS_H);
        }
        for (let y = 0; y <= CANVAS_H; y += GRID_SIZE) {
          p.line(0, y, CANVAS_W, y);
        }

        // Highlight grid cell under drag
        if (dragType && dragPos) {
          const gx = Math.round(dragPos.x / GRID_SIZE) * GRID_SIZE;
          const gy = Math.round(dragPos.y / GRID_SIZE) * GRID_SIZE;
          p.noFill();
          p.stroke("#38bdf8");
          p.strokeWeight(3);
          p.rect(
            gx - GRID_SIZE / 2,
            gy - GRID_SIZE / 2,
            GRID_SIZE,
            GRID_SIZE,
            6
          );
        }

        // Draw components (SVG)
        components.forEach((c, i) => {
          const isHovered = hovered === i;
          p.push();
          p.translate(c.x, c.y);
          p.strokeWeight(isHovered ? 4 : 2);
          p.stroke(isHovered ? "#22d3ee" : "#222");
          p.noFill();

          // Render SVG for component
          const svgImg = svgImagesRef.current[c.type];
          if (svgImg) {
            (p as any).image(
              svgImg,
              -GRID_SIZE / 2,
              -GRID_SIZE / 2,
              GRID_SIZE,
              GRID_SIZE
            );
          } else {
            // fallback: draw icon
            p.fill("#fff");
            p.rect(-GRID_SIZE / 2, -GRID_SIZE / 2, GRID_SIZE, GRID_SIZE, 8);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(28);
            p.fill("#333");
            p.text(
              COMPONENTS.find((comp) => comp.type === c.type)?.icon || "?",
              0,
              0
            );
          }

          // For switches, show on/off state
          if (c.type === "switch" && c.on) {
            p.stroke("#10b981");
            p.strokeWeight(3);
            p.noFill();
            p.ellipse(0, 0, GRID_SIZE * 0.7);
          }

          p.pop();
        });

        // Draw drag ghost
        if (dragType && dragPos) {
          p.push();
          p.translate(dragPos.x, dragPos.y);
          p.stroke("#38bdf8");
          p.strokeWeight(2);
          p.fill("#e0f2fe");
          p.rect(-GRID_SIZE / 2, -GRID_SIZE / 2, GRID_SIZE, GRID_SIZE, 8);
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(28);
          p.fill("#333");
          p.text(
            COMPONENTS.find((comp) => comp.type === dragType)?.icon || "?",
            0,
            0
          );
          p.pop();
        }
        // Draw wires (bendable, colored)
        wires.forEach((w, i) => {
          p.push();
          p.stroke(w.color || DEFAULT_WIRE_COLOR);
          p.strokeWeight(selectedWireIdx === i ? 8 : 5);
          p.noFill();

          if (w.points.length > 1) {
            p.beginShape();
            w.points.forEach((pt) => p.vertex(pt.x, pt.y));
            p.endShape();
          } else if (components[w.from] && components[w.to]) {
            // Default wire path if no custom points
            const c1 = components[w.from];
            const c2 = components[w.to];
            p.line(c1.x, c1.y, c2.x, c2.y);
          }

          // Draw draggable points if selected
          if (selectedWireIdx === i) {
            w.points.forEach((pt) => {
              p.fill("#fff");
              p.stroke("#38bdf8");
              p.strokeWeight(2);
              p.ellipse(pt.x, pt.y, 16, 16);
            });
          }
          p.pop();
        });

        // Draw connect mode highlight
        if (
          mode === "connect" &&
          connectFrom !== null &&
          hovered !== null &&
          hovered !== connectFrom
        ) {
          const c1 = components[connectFrom];
          const c2 = components[hovered];
          if (c1 && c2) {
            p.stroke("#38bdf8");
            p.strokeWeight(4);
            p.line(c1.x, c1.y, c2.x, c2.y);
          }
        }
      };

      // Mouse event handlers
      (p as any).mousePressed = () => {
        // Only process events inside the canvas
        if (
          p.mouseX < 0 ||
          p.mouseX > CANVAS_W ||
          p.mouseY < 0 ||
          p.mouseY > CANVAS_H
        )
          return;

        // Check if clicking on a component
        for (let i = 0; i < components.length; i++) {
          const c = components[i];
          if (p.dist(p.mouseX, p.mouseY, c.x, c.y) < GRID_SIZE / 2) {
            dragIdx = i;
            dragOffset = { x: c.x - p.mouseX, y: c.y - p.mouseY };
            return;
          }
        }

        // Connect mode
        if (mode === "connect" && hovered !== null) {
          if (connectFrom === null) {
            setConnectFrom(hovered);
          } else if (connectFrom !== hovered) {
            // Create a new wire between components
            const c1 = components[connectFrom];
            const c2 = components[hovered];

            // Add two points by default for the wire
            const newWire = {
              points: [
                { x: c1.x, y: c1.y },
                { x: c2.x, y: c2.y },
              ],
              color: DEFAULT_WIRE_COLOR,
              from: connectFrom,
              to: hovered,
            };

            setWires((prev) => [...prev, newWire]);
            setConnectFrom(null);
            setMode("normal");
            playClick();
          }
          return;
        }

        // Edit component values
        if (
          hovered !== null &&
          ["resistor", "battery"].includes(components[hovered].type)
        ) {
          setEditIdx(hovered);
        }

        // Toggle switch
        if (hovered !== null && components[hovered].type === "switch") {
          setComponents((prev) =>
            prev.map((c, i) => (i === hovered ? { ...c, on: !c.on } : c))
          );
          playClick();
        }

        // Remove wire if hovered (in normal mode)
        if (mode === "normal" && wireHoverIdx !== null) {
          setWires((prev) => prev.filter((_, idx) => idx !== wireHoverIdx));
          setWireHoverIdx(null);
          playPop();
          setResult({ status: "info", message: "একটি তার মুছে ফেলা হয়েছে!" });
          return;
        }
      };

      (p as any).mouseDragged = () => {
        if (dragIdx !== null) {
          const newComps = [...components];
          // Snap to grid
          const gx =
            Math.round((p.mouseX + dragOffset.x) / GRID_SIZE) * GRID_SIZE;
          const gy =
            Math.round((p.mouseY + dragOffset.y) / GRID_SIZE) * GRID_SIZE;

          newComps[dragIdx] = {
            ...newComps[dragIdx],
            x: gx,
            y: gy,
          };
          setComponents(newComps);

          // Update connected wires
          setWires((prev) =>
            prev.map((wire) => {
              if (wire.from === dragIdx || wire.to === dragIdx) {
                return {
                  ...wire,
                  points: wire.points.map((pt, i) => {
                    // Update endpoint positions
                    if (wire.from === dragIdx && i === 0) {
                      return { x: gx, y: gy };
                    }
                    if (wire.to === dragIdx && i === wire.points.length - 1) {
                      return { x: gx, y: gy };
                    }
                    return pt;
                  }),
                };
              }
              return wire;
            })
          );
        }

        // Update drag position for component placement
        if (dragType && dragPos) {
          setDragPos({ x: p.mouseX, y: p.mouseY });
        }
      };

      (p as any).mouseReleased = () => {
        if (dragType && dragPos) {
          // Snap to grid
          const gx = Math.round(dragPos.x / GRID_SIZE) * GRID_SIZE;
          const gy = Math.round(dragPos.y / GRID_SIZE) * GRID_SIZE;

          // Check if position is already occupied
          const isOccupied = components.some((c) => c.x === gx && c.y === gy);

          if (!isOccupied) {
            // Add new component
            setComponents((prev) => [
              ...prev,
              {
                type: dragType as ComponentType,
                x: gx,
                y: gy,
                value:
                  dragType === "battery"
                    ? 6
                    : dragType === "resistor"
                      ? 10
                      : undefined,
                on: dragType === "switch" ? false : undefined,
              },
            ]);
          } else {
            // Show feedback for occupied position
            setResult({
              status: "warning",
              message: "এই জায়গায় ইতিমধ্যে একটি কম্পোনেন্ট আছে!",
            });
          }

          setDragType(null);
          setDragPos(null);
        }

        dragIdx = null;
      };

      (p as any).mouseMoved = () => {
        // Hover detection for components
        let found = null;
        for (let i = 0; i < components.length; i++) {
          const c = components[i];
          if (p.dist(p.mouseX, p.mouseY, c.x, c.y) < GRID_SIZE / 2) {
            found = i;
            break;
          }
        }
        setHovered(found);

        // Wire hover detection
        let foundWire = null;
        for (let i = 0; i < wires.length; i++) {
          const w = wires[i];

          // Check wire path for hover
          if (w.points.length >= 2) {
            for (let j = 0; j < w.points.length - 1; j++) {
              const pt1 = w.points[j];
              const pt2 = w.points[j + 1];

              // Calculate distance from mouse to line segment
              const d = distToSegment({ x: p.mouseX, y: p.mouseY }, pt1, pt2);

              if (d < 10) {
                foundWire = i;
                break;
              }
            }
          } else {
            // Fallback for wires without custom points
            const c1 = components[w.from];
            const c2 = components[w.to];
            if (!c1 || !c2) continue;

            // Check distance to midpoint
            if (
              p.dist(p.mouseX, p.mouseY, (c1.x + c2.x) / 2, (c1.y + c2.y) / 2) <
              18
            ) {
              foundWire = i;
              break;
            }
          }
        }
        setWireHoverIdx(foundWire);
      };
    };

    // Initialize p5 instance
    p5Instance = new p5(sketch, canvasRef.current);

    // Cleanup
    return () => {
      (p5Instance as any).remove();
    };
  }, [
    components,
    wires,
    dragType,
    dragPos,
    hovered,
    mode,
    connectFrom,
    result.status,
    wireHoverIdx,
    selectedWireIdx,
    svgLoaded,
  ]);

  // Helper function for wire hover detection
  function distToSegment(
    p: { x: number; y: number },
    v: { x: number; y: number },
    w: { x: number; y: number }
  ) {
    const l2 = dist2(v, w);
    if (l2 === 0) return dist2(p, v);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.sqrt(
      dist2(p, {
        x: v.x + t * (w.x - v.x),
        y: v.y + t * (w.y - v.y),
      })
    );
  }

  function dist2(v: { x: number; y: number }, w: { x: number; y: number }) {
    return (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
  }

  // Palette click handler
  const handlePaletteClick = (type: string) => {
    setDragType(type);
    setDragPos({ x: CANVAS_W / 2, y: CANVAS_H / 2 });
    playClick();
  };

  // Calculation/results panel
  useEffect(() => {
    if (components.length === 0) {
      setResult({ status: "info", message: "সার্কিট তৈরি করুন!" });
    } else {
      calculateCircuit();
    }
  }, [components, wires]);

  // Edit value prompt
  useEffect(() => {
    if (editIdx !== null) {
      const c = components[editIdx];
      const val = prompt(
        `নতুন ${c.type === "resistor" ? "রেজিস্ট্যান্স (Ω)" : "ভোল্টেজ (V)"} দিন:`,
        c.value?.toString() || ""
      );
      if (val !== null && !isNaN(Number(val))) {
        setComponents((prev) =>
          prev.map((comp, i) =>
            i === editIdx ? { ...comp, value: Number(val) } : comp
          )
        );
      }
      setEditIdx(null);
    }
  }, [editIdx]);

  // Sound stubs
  const playClick = () => {
    if (!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "triangle";
    o.frequency.value = 660;
    g.gain.value = 0.1;
    o.connect(g).connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + 0.08);
  };

  const playBuzz = () => {
    if (!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "sawtooth";
    o.frequency.value = 120;
    g.gain.value = 0.15;
    o.connect(g).connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + 0.18);
  };

  const playPop = () => {
    if (!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "square";
    o.frequency.value = 320;
    g.gain.value = 0.18;
    o.connect(g).connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + 0.07);
  };

  // Calculation logic
  const calculateCircuit = () => {
    // Find all batteries and resistors
    const batteries = components.filter((c) => c.type === "battery");
    const resistors = components.filter((c) => c.type === "resistor");
    const switches = components.filter((c) => c.type === "switch");

    if (batteries.length === 0) {
      setResult({ status: "warning", message: "কোনো ব্যাটারি নেই!" });
      return;
    }
    if (resistors.length === 0) {
      setResult({ status: "warning", message: "কোনো রেজিস্টর নেই!" });
      return;
    }

    // Check if all components are connected in a single loop
    if (wires.length < components.length - 1) {
      setResult({ status: "warning", message: "সার্কিট অসম্পূর্ণ!" });
      return;
    }

    // Check for open switches (open circuit)
    const openSwitches = switches.filter((s) => !s.on);
    if (openSwitches.length > 0) {
      setResult({
        status: "warning",
        message: "সার্কিট খোলা আছে! সবগুলো সুইচ বন্ধ করুন।",
      });
      return;
    }

    // For now, assume series if all resistors are chained, else parallel if all connect to battery
    let totalVoltage = batteries.reduce((sum, b) => sum + (b.value || 6), 0);
    let totalResistance = 0;
    let mode = "series";

    // Simple detection: if all resistors are connected to battery, call it parallel
    const batteryIdx = components.findIndex((c) => c.type === "battery");
    if (
      batteryIdx !== -1 &&
      resistors.every((r) =>
        wires.some(
          (w) =>
            (w.from === batteryIdx && w.to === components.indexOf(r)) ||
            (w.to === batteryIdx && w.from === components.indexOf(r))
        )
      )
    ) {
      mode = "parallel";
      totalResistance =
        1 / resistors.reduce((sum, r) => sum + 1 / (r.value || 10), 0);
    } else {
      mode = "series";
      totalResistance = resistors.reduce((sum, r) => sum + (r.value || 10), 0);
    }

    const totalCurrent = totalVoltage / totalResistance;

    // Bengali feedback
    let msg = `মোট ভোল্টেজ: ${totalVoltage.toFixed(2)} V, মোট রেজিস্টেন্স: ${totalResistance.toFixed(2)} Ω, মোট কারেন্ট: ${totalCurrent.toFixed(2)} A (${mode === "series" ? "সিরিজ" : "সমান্তরাল"})`;

    if (totalCurrent > 5) {
      msg += " ⚠️ কারেন্ট বেশি! শর্ট সার্কিট হতে পারে!";
      playBuzz();
      setResult({ status: "warning", message: msg });
      return;
    }

    if (totalCurrent > 0.01) {
      playClick();
      setResult({ status: "success", message: msg + " ✅" });
    } else {
      setResult({ status: "warning", message: msg + " (কারেন্ট খুব কম)" });
      playBuzz();
    }
  };

  // SAVE/LOAD
  const handleSave = () => {
    const data = JSON.stringify({ components, wires });
    localStorage.setItem("circuit-sim-save", data);
    setResult({ status: "info", message: "সার্কিট সংরক্ষণ করা হয়েছে!" });
    playClick();
  };

  const handleLoad = () => {
    const data = localStorage.getItem("circuit-sim-save");
    if (data) {
      try {
        const { components: comps, wires: ws } = JSON.parse(data);
        setComponents(comps);
        setWires(ws);
        setResult({ status: "info", message: "সংরক্ষিত সার্কিট লোড হয়েছে!" });
        playClick();
      } catch (e) {
        setResult({
          status: "warning",
          message: "সংরক্ষিত সার্কিট লোড করতে ব্যর্থ!",
        });
        playBuzz();
      }
    } else {
      setResult({ status: "warning", message: "কোনো সংরক্ষিত সার্কিট নেই!" });
      playBuzz();
    }
  };

  const handleReset = () => {
    if (confirm("আপনি কি সত্যিই সার্কিট রিসেট করতে চান?")) {
      setComponents([]);
      setWires([]);
      setResult({ status: "info", message: "সার্কিট রিসেট হয়েছে!" });
      playPop();
    }
  };

  // UNDO/REDO HANDLERS
  const pushHistory = () => {
    const newHist = history.slice(0, historyIdx + 1);
    newHist.push({
      components: JSON.parse(JSON.stringify(components)),
      wires: JSON.parse(JSON.stringify(wires)),
    });
    setHistory(newHist);
    setHistoryIdx(newHist.length - 1);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      setComponents(history[historyIdx - 1].components);
      setWires(history[historyIdx - 1].wires);
      setHistoryIdx(historyIdx - 1);
      setResult({ status: "info", message: "পূর্ববর্তী ধাপে ফিরে গেছেন" });
      playClick();
    } else {
      playBuzz();
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      setComponents(history[historyIdx + 1].components);
      setWires(history[historyIdx + 1].wires);
      setHistoryIdx(historyIdx + 1);
      setResult({ status: "info", message: "পরবর্তী ধাপে এগিয়েছেন" });
      playClick();
    } else {
      playBuzz();
    }
  };

  useEffect(() => {
    if (components.length > 0 || wires.length > 0) {
      pushHistory();
    }
  }, [components, wires]);

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-start p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
      {/* Left Sidebar - Component Palette */}
      <div className="w-full md:w-52 flex-shrink-0 flex flex-col gap-3">
        <div className="bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-800 rounded-xl shadow-md p-3">
          <h3 className="text-lg font-bold mb-2 text-center text-blue-900 dark:text-blue-100">
            কম্পোনেন্ট প্যালেট
          </h3>
          <div className="flex flex-col gap-2">
            {COMPONENTS.map((component) => (
              <button
                key={component.type}
                className="flex items-center gap-2 px-3 py-2 rounded bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition shadow-sm hover:shadow-md"
                onClick={() => handlePaletteClick(component.type)}
                title={`${component.label}: ${component.description}`}
              >
                <span className="text-xl">{component.icon}</span>
                <span className="flex-1">{component.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-800 rounded-xl shadow-md p-3">
          <h3 className="text-lg font-bold mb-2 text-center text-blue-900 dark:text-blue-100">
            টুলবার
          </h3>

          {/* Connection Mode */}
          <button
            className={`flex items-center gap-2 px-3 py-2 w-full mb-2 rounded font-medium border transition shadow-sm ${
              mode === "connect"
                ? "bg-green-500 text-white border-green-600"
                : "bg-gray-100 text-green-800 border-green-400 hover:bg-green-200 dark:bg-gray-700 dark:text-green-300"
            }`}
            onClick={() => setMode(mode === "connect" ? "normal" : "connect")}
            title="সংযোগ মোড (তার সংযোগ করতে ক্লিক করুন)"
          >
            <span className="text-xl">🔗</span>
            <span className="flex-1">সংযোগ মোড</span>
            {mode === "connect" && (
              <span className="text-xs whitespace-nowrap">(চলমান)</span>
            )}
          </button>

          {/* Tool Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleUndo}
              className="flex flex-col items-center justify-center p-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              title="পূর্ববর্তী ধাপ"
              disabled={historyIdx <= 0}
            >
              <span className="text-lg">↩️</span>
              <span className="text-xs">আনডু</span>
            </button>

            <button
              onClick={handleRedo}
              className="flex flex-col items-center justify-center p-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              title="পরবর্তী ধাপ"
              disabled={historyIdx >= history.length - 1}
            >
              <span className="text-lg">↪️</span>
              <span className="text-xs">রিডু</span>
            </button>

            <button
              onClick={handleSave}
              className="flex flex-col items-center justify-center p-2 rounded bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700"
              title="সার্কিট সংরক্ষণ করুন"
            >
              <span className="text-lg">💾</span>
              <span className="text-xs">সেভ</span>
            </button>

            <button
              onClick={handleLoad}
              className="flex flex-col items-center justify-center p-2 rounded bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700"
              title="সার্কিট লোড করুন"
            >
              <span className="text-lg">📂</span>
              <span className="text-xs">লোড</span>
            </button>

            <button
              onClick={handleReset}
              className="flex flex-col items-center justify-center p-2 col-span-2 rounded bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800"
              title="সার্কিট রিসেট করুন"
            >
              <span className="text-lg">🗑️</span>
              <span className="text-xs">রিসেট</span>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-800 rounded-xl shadow-md p-3">
          <h3 className="text-md font-bold mb-1 text-center text-blue-900 dark:text-blue-100">
            ব্যবহার নির্দেশিকা
          </h3>
          <ul className="text-xs space-y-1 text-gray-700 dark:text-gray-300">
            <li>• কম্পোনেন্ট নির্বাচন করে ক্যানভাসে রাখুন</li>
            <li>• সংযোগ মোড ব্যবহার করে তারের সংযোগ করুন</li>
            <li>• কম্পোনেন্টে ডাবল ক্লিক করে মান পরিবর্তন করুন</li>
            <li>• সুইচে ক্লিক করে অন/অফ করুন</li>
          </ul>
        </div>
      </div>

      {/* Main Canvas and Results */}
      <div className="flex-1 flex flex-col items-center">
        <div className="flex w-full justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-center text-blue-900 dark:text-blue-100">
            সার্কিট ডিজাইনার
          </h2>

          <div
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              result.status === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : result.status === "warning"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            }`}
          >
            {result.message}
          </div>
        </div>

        {/* Canvas Container */}
        <div
          ref={canvasRef}
          className="rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
          style={{ width: CANVAS_W, height: CANVAS_H }}
        />

        {/* Wire Color Palette - Show when a wire is selected */}
        {selectedWireIdx !== null && (
          <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md">
            <h3 className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              তারের রঙ নির্বাচন করুন
            </h3>
            <div className="flex flex-wrap gap-1">
              {WIRE_COLORS.map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded-full border border-gray-300 hover:border-blue-500 transition"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setWires((prev) =>
                      prev.map((w, i) =>
                        i === selectedWireIdx ? { ...w, color } : w
                      )
                    );
                    playClick();
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
