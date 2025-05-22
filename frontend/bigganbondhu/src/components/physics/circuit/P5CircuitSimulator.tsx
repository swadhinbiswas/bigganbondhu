import p5 from "p5";
import React, { useEffect, useRef, useState } from "react";

import { CircuitSketch } from "./CircuitSketch";
import { calculateCircuit } from "./circuitUtils";
import {
  CircuitComponent,
  CircuitMode,
  CircuitSimulatorProps,
  CircuitState,
  ComponentType,
  componentPalette,
} from "./types";

const initialCircuitState: CircuitState = {
  components: [],
  connections: [],
  totalVoltage: 0,
  totalResistance: 0,
  totalCurrent: 0,
};

const P5CircuitSimulator: React.FC<CircuitSimulatorProps> = ({
  voltage = 6,
  resistance = 10,
  mode: modeProp = "free",
  showCurrent: showCurrentProp = true,
  challenge,
  onChallengeResult,
}) => {
  // Component state
  const [circuitState, setCircuitState] =
    useState<CircuitState>(initialCircuitState);
  const [mode, setMode] = useState<CircuitMode>(modeProp);
  const [showCurrent, setShowCurrent] = useState<boolean>(showCurrentProp);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null,
  );
  const [, setHoveredComponent] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizeStartPos, setResizeStartPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [resizeStartScale, setResizeStartScale] = useState<number>(1.0);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [gridSize] = useState<number>(20);
  // Make canvas size responsive based on window size
  const [canvasSize, setCanvasSize] = useState({
    width: Math.min(window.innerWidth - 300, 1200),
    height: Math.min(window.innerHeight - 100, 800),
  });
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [challengeResult, setChallengeResult] = useState<
    "success" | "error" | "warning" | null
  >(null);
  const [challengeMessage, setChallengeMessage] = useState<string>("");
  const [dragGhost, setDragGhost] = useState<{
    type: string;
    x: number;
    y: number;
  } | null>(null);
  const [connectionStartId, setConnectionStartId] = useState<string | null>(
    null,
  );
  const [connectionPreview, setConnectionPreview] = useState<{
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  } | null>(null);

  // Refs for p5.js instance and canvas
  const p5ContainerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<any | null>(null);
  const sketchRef = useRef<CircuitSketch | null>(null);

  // Instructions tooltip with responsive design
  const renderInstructions = () => {
    // Simplified instructions for mobile
    if (isMobile) {
      return (
        <div className="absolute top-2 right-2 bg-blue-600 text-white p-2 rounded-lg shadow-md text-xs z-20">
          <span className="flex items-center">
            <span className="mr-1">ℹ️</span> কম্পোনেন্ট বাটন ক্লিক করে ব্যবহার
            করুন
          </span>
        </div>
      );
    }

    // Detailed instructions for desktop
    return (
      <div className="absolute top-2 right-2 bg-blue-50 dark:bg-blue-900/80 p-3 rounded-lg shadow-md border border-blue-200 dark:border-blue-800 max-w-xs text-sm z-20">
        <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200 flex items-center">
          <span className="mr-1">ℹ️</span> নির্দেশাবলী
        </h3>
        <ul className="list-disc pl-4 text-gray-700 dark:text-gray-300 space-y-1">
          <li>পালেট থেকে কম্পোনেন্ট ড্র্যাগ করুন</li>
          <li>
            কম্পোনেন্ট রোটেট করতে{" "}
            <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
              R
            </kbd>{" "}
            চাপুন
          </li>
          <li>
            কম্পোনেন্ট ডিলিট করতে{" "}
            <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
              Delete
            </kbd>{" "}
            চাপুন
          </li>
          <li>কম্পোনেন্ট রিসাইজ করতে কোণায় ক্লিক করে টেনে আনুন</li>
          <li>সংযোগ করতে Alt চেপে কম্পোনেন্টে ক্লিক করুন</li>
          <li>
            বাতিল করতে{" "}
            <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
              Esc
            </kbd>{" "}
            চাপুন
          </li>
        </ul>
      </div>
    );
  };

  // Render mobile warning with improved visibility and information
  const renderMobileWarning = () => {
    return (
      <>
        {/* Floating info banner that can be dismissed */}
        <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white py-2 px-3 text-center z-40 shadow-lg">
          <div className="flex flex-col items-center">
            <p className="font-bold text-sm">📱 মোবাইলে সীমিত ফাংশনালিটি</p>
            <p className="text-xs mt-0.5">
              ভাল অভিজ্ঞতার জন্য কম্পিউটার ব্যবহার করুন
            </p>
          </div>
        </div>

        {/* Small icon on canvas */}
        <div className="absolute top-2 left-2 bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center z-30 shadow-md">
          <span className="text-lg">📱</span>
        </div>
      </>
    );
  };

  // Initialize p5.js sketch
  useEffect(() => {
    if (!p5ContainerRef.current) return;

    // Clean up any previous p5 instance
    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
    }

    // Create a new p5 instance
    const p5Instance = new p5((p: p5) => {
      // Setup function
      (p as any).setup = () => {
        const canvas = p.createCanvas(canvasSize.width, canvasSize.height);

        canvas.parent(p5ContainerRef.current!);

        // Set up mouse events
        canvas.mousePressed(handleCanvasClick);
        canvas.mouseMoved(handleCanvasMouseMove);
        canvas.mouseDragged(handleCanvasMouseDrag);
        canvas.mouseReleased(handleCanvasMouseRelease);
      };

      // Draw function
      (p as any).draw = () => {
        if (sketchRef.current) {
          sketchRef.current.draw();
        }
      };

      // Mouse click handler
      function handleCanvasClick() {
        const mouseX = p.mouseX;
        const mouseY = p.mouseY;

        // Handle component selection
        const clickedComponent = circuitState.components.find((comp) => {
          const distance = p.dist(comp.x, comp.y, mouseX, mouseY);

          return distance < 20; // Threshold for selection
        });

        if (clickedComponent) {
          // Check if the click is on a resize handle
          if (
            sketchRef.current &&
            sketchRef.current.isOnResizeHandle(
              clickedComponent.id,
              mouseX,
              mouseY,
            )
          ) {
            setIsResizing(true);
            setResizeStartPos({ x: mouseX, y: mouseY });
            setResizeStartScale(clickedComponent.properties.scale || 1.0);

            return;
          }

          // Handle component selection
          setSelectedComponent(clickedComponent.id);

          // If we're in connection creation mode (connectionStartId is set)
          if (connectionStartId !== null) {
            // Create connection between connectionStartId and clicked component
            if (sketchRef.current) {
              const newConnection = sketchRef.current.createConnection(
                connectionStartId,
                clickedComponent.id,
              );

              if (newConnection) {
                setCircuitState((prev) => ({
                  ...prev,
                  connections: [...prev.connections, newConnection],
                }));
              }
            }

            // Reset connection creation mode
            setConnectionStartId(null);
            setConnectionPreview(null);
          } else {
            // Toggle switch if clicked
            if (clickedComponent.type === "switch") {
              toggleSwitch(clickedComponent.id);
            } else {
              // Start connection if component clicked with Alt key pressed
              if (p.keyIsDown(p.ALT)) {
                setConnectionStartId(clickedComponent.id);
                setConnectionPreview({
                  fromX: clickedComponent.x,
                  fromY: clickedComponent.y,
                  toX: mouseX,
                  toY: mouseY,
                });
              }
            }
          }
        } else {
          // Handle component placement if drag ghost exists
          if (dragGhost) {
            const snapX = snapToGrid
              ? Math.round(mouseX / gridSize) * gridSize
              : mouseX;
            const snapY = snapToGrid
              ? Math.round(mouseY / gridSize) * gridSize
              : mouseY;

            addComponentAt(dragGhost.type, snapX, snapY);
            setDragGhost(null);
          } else {
            // Cancel connection creation if clicked on empty space
            if (connectionStartId !== null) {
              setConnectionStartId(null);
              setConnectionPreview(null);
            }
            setSelectedComponent(null);
          }
        }
      }

      function handleCanvasMouseDrag() {
        const mouseX = p.mouseX;
        const mouseY = p.mouseY;

        // Handle resizing component
        if (isResizing && selectedComponent) {
          const component = circuitState.components.find(
            (c) => c.id === selectedComponent,
          );

          if (component && resizeStartPos && resizeStartScale) {
            // Calculate distance from start position as scale factor
            const distX = mouseX - resizeStartPos.x;
            const distY = mouseY - resizeStartPos.y;
            const dist = Math.sqrt(distX * distX + distY * distY);
            const direction = distX > 0 || distY > 0 ? 1 : -1;

            // Scale factor based on drag distance
            const scaleFactor = Math.max(
              0.5,
              resizeStartScale + (direction * dist) / 100,
            );

            // Update the component scale
            if (sketchRef.current) {
              sketchRef.current.updateComponentScale(
                selectedComponent,
                scaleFactor,
              );
            }
          }

          return;
        }

        // Handle dragging selected component
        if (selectedComponent && !isResizing) {
          setIsDragging(true);
          const snapX = snapToGrid
            ? Math.round(mouseX / gridSize) * gridSize
            : mouseX;
          const snapY = snapToGrid
            ? Math.round(mouseY / gridSize) * gridSize
            : mouseY;

          // Update component position
          setCircuitState((prev) => ({
            ...prev,
            components: prev.components.map((comp) => {
              if (comp.id === selectedComponent) {
                return { ...comp, x: snapX, y: snapY };
              }

              return comp;
            }),
          }));
        }

        // Update connection preview when creating connection
        if (connectionStartId !== null) {
          const startComp = circuitState.components.find(
            (c) => c.id === connectionStartId,
          );

          if (startComp) {
            setConnectionPreview({
              fromX: startComp.x,
              fromY: startComp.y,
              toX: mouseX,
              toY: mouseY,
            });
          }
        }
      }

      function handleCanvasMouseMove() {
        const mouseX = p.mouseX;
        const mouseY = p.mouseY;

        // Update hover state
        const hoverComp = circuitState.components.find((comp) => {
          const distance = p.dist(comp.x, comp.y, mouseX, mouseY);

          return distance < 20;
        });

        setHoveredComponent(hoverComp ? hoverComp.id : null);

        // Update drag ghost position if dragging component from palette
        if (dragGhost) {
          setDragGhost({
            ...dragGhost,
            x: mouseX,
            y: mouseY,
          });
        }

        // Update connection preview when creating connection
        if (connectionStartId !== null) {
          const startComp = circuitState.components.find(
            (c) => c.id === connectionStartId,
          );

          if (startComp) {
            setConnectionPreview({
              fromX: startComp.x,
              fromY: startComp.y,
              toX: mouseX,
              toY: mouseY,
            });
          }
        }

        // Update sketch connection preview
        if (sketchRef.current && connectionPreview) {
          sketchRef.current.setConnectionPreview(connectionPreview);
        }
      }

      function handleCanvasMouseRelease() {
        setIsDragging(false);
        setIsResizing(false);
        setResizeStartPos(null);

        // Recalculate circuit after changes
        const updatedCircuit = calculateCircuit(circuitState, mode);

        setCircuitState(updatedCircuit);
      }
    });

    p5InstanceRef.current = p5Instance;

    // Create the circuit sketch
    const sketch = new CircuitSketch(
      p5Instance,
      circuitState,
      mode,
      showCurrent,
      canvasSize.width,
      canvasSize.height,
    );

    sketchRef.current = sketch;
    sketch.setup();

    // Add event listeners for keyboard events
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup function
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    circuitState,
    mode,
    showCurrent,
    selectedComponent,
    isDragging,
    isResizing,
    dragGhost,
    connectionStartId,
    connectionPreview,
    gridSize,
    snapToGrid,
    canvasSize.width,
    canvasSize.height,
  ]);

  // Setup HTML5 drag and drop support for better desktop experience
  useEffect(() => {
    if (!p5ContainerRef.current) return;

    // Add drop event listeners to the canvas container
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault(); // Allow drop
      e.dataTransfer!.dropEffect = "move";
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();

      // Get the dragged component type
      const componentType = e.dataTransfer!.getData("text/plain");

      if (!componentType) return;

      // Calculate drop position relative to canvas
      const rect = p5ContainerRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Snap to grid if enabled
      const snapX = snapToGrid ? Math.round(x / gridSize) * gridSize : x;
      const snapY = snapToGrid ? Math.round(y / gridSize) * gridSize : y;

      // Add component at drop position
      addComponentAt(componentType, snapX, snapY);
    };

    const container = p5ContainerRef.current;

    container.addEventListener("dragover", handleDragOver);
    container.addEventListener("drop", handleDrop);

    return () => {
      container.removeEventListener("dragover", handleDragOver);
      container.removeEventListener("drop", handleDrop);
    };
  }, [p5ContainerRef.current, gridSize, snapToGrid]);

  // Add resize handler to update canvas size when window size changes
  useEffect(() => {
    // Define a debounced resize handler
    let resizeTimeout: number | null = null;

    const handleResize = () => {
      const isMobileDevice = window.innerWidth < 768;

      setIsMobile(isMobileDevice);

      // Get container dimensions if available
      const containerWidth =
        p5ContainerRef.current?.parentElement?.clientWidth || 0;

      // Calculate new canvas dimensions based on container or viewport
      const newWidth = Math.min(
        containerWidth > 0
          ? containerWidth
          : window.innerWidth - (isMobileDevice ? 32 : 300),
        isMobileDevice ? window.innerWidth - 32 : 1200, // Limit width based on device
      );

      // Calculate optimal height based on device and orientation
      let aspectRatio = 0.65; // Default aspect ratio (closer to square for better component visibility)

      if (isMobileDevice && window.innerWidth > window.innerHeight) {
        // Mobile landscape mode
        aspectRatio = 0.5; // Lower height ratio for landscape
      } else if (window.innerWidth > 1200) {
        // Large desktop
        aspectRatio = 0.6; // Slightly taller
      }

      const aspectRatioHeight = newWidth * aspectRatio;
      const maxHeight = window.innerHeight - (isMobileDevice ? 300 : 180); // More space for controls on mobile
      const newHeight = Math.min(aspectRatioHeight, maxHeight);

      // Update state
      setCanvasSize({
        width: newWidth,
        height: newHeight,
      });

      // Update the circuit sketch if it exists
      if (sketchRef.current) {
        sketchRef.current.canvasWidth = newWidth;
        sketchRef.current.canvasHeight = newHeight;

        // Recreate canvas with new dimensions if p5 instance exists
        if (p5InstanceRef.current) {
          try {
            // Cast to any to access p5 methods
            const p5Inst = p5InstanceRef.current as any;

            if (typeof p5Inst.resizeCanvas === "function") {
              p5Inst.resizeCanvas(newWidth, newHeight);
              console.log(`Canvas resized to ${newWidth}x${newHeight}`);
            }
          } catch (error) {
            console.error("Error resizing canvas:", error);
          }
        }
      }
    };

    // Debounced window resize handler
    const debouncedResize = () => {
      if (resizeTimeout) {
        window.clearTimeout(resizeTimeout);
      }

      resizeTimeout = window.setTimeout(handleResize, 250);
    };

    // Add the event listener
    window.addEventListener("resize", debouncedResize);

    // Initial call to set dimensions
    handleResize();

    // Clean up
    return () => {
      window.removeEventListener("resize", debouncedResize);
      if (resizeTimeout) {
        window.clearTimeout(resizeTimeout);
      }
    };
  }, []);

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent) => {
    // Escape key cancels connection creation and deselects component
    if (e.key === "Escape") {
      setConnectionStartId(null);
      setConnectionPreview(null);
      setSelectedComponent(null);
      setDragGhost(null);
    }

    // Delete key removes selected component
    if (e.key === "Delete" && selectedComponent) {
      removeComponent(selectedComponent);
    }

    // R key rotates selected component
    if (e.key === "r" && selectedComponent) {
      rotateComponent(selectedComponent);
    }
  };

  // Rotate the selected component
  const rotateComponent = (id: string) => {
    setCircuitState((prev) => ({
      ...prev,
      components: prev.components.map((comp) => {
        if (comp.id === id) {
          // Rotate by 90 degrees increments
          const newRotation = ((comp.rotation || 0) + 90) % 360;

          return { ...comp, rotation: newRotation };
        }

        return comp;
      }),
    }));
  };

  // Add a new component to the canvas
  const addComponentAt = (type: string, x: number, y: number) => {
    // Check if position is already occupied
    const isOccupied = circuitState.components.some(
      (comp) => Math.abs(comp.x - x) < 20 && Math.abs(comp.y - y) < 20,
    );

    if (isOccupied) {
      console.warn("Position is already occupied by another component");

      return;
    }

    // Create a new component
    const newComponent: CircuitComponent = {
      id: `${type}-${Date.now()}`,
      type: type as ComponentType,
      x,
      y,
      rotation: 0,
      connections: {
        from: { x: 0, y: 0 },
        to: { x: 0, y: 0 },
      },
      properties: {
        voltage: type === "battery" ? voltage : undefined,
        resistance: type === "resistor" ? resistance : undefined,
        capacitance: type === "capacitor" ? 10 : undefined,
        inductance: type === "inductor" ? 5 : undefined,
        state: type === "switch" ? ("off" as const) : undefined,
        scale: 1.0, // Initial scale
      },
    };

    // Add to circuit state
    setCircuitState((prev) => ({
      ...prev,
      components: [...prev.components, newComponent],
    }));

    // Select the new component
    setSelectedComponent(newComponent.id);
  };

  // Toggle switch state
  const toggleSwitch = (id: string) => {
    setCircuitState((prev) => {
      // Create new components array with type-safe switch state
      const newComponents = prev.components.map((comp) => {
        if (comp.id === id && comp.type === "switch") {
          // Ensure we're handling the switch state correctly
          const newState = comp.properties.state === "on" ? "off" : "on";

          return {
            ...comp,
            properties: {
              ...comp.properties,
              state: newState,
            },
          };
        }

        return comp;
      });

      // Recalculate circuit when switch state changes
      return calculateCircuit(
        {
          ...prev,
          components: newComponents as CircuitComponent[],
        },
        mode,
      );
    });
  };

  // Remove a component from the circuit
  const removeComponent = (id: string) => {
    setCircuitState((prev) => {
      // Remove component and any connections to it
      const newComponents = prev.components.filter((c) => c.id !== id);
      const newConnections = prev.connections.filter(
        (c) => c.from !== id && c.to !== id,
      );

      // Recalculate circuit after component removal
      return calculateCircuit(
        {
          ...prev,
          components: newComponents,
          connections: newConnections,
        },
        mode,
      );
    });

    // Deselect component if it was selected
    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
  };

  // Start dragging a component from the palette
  const addComponent = (type: string) => {
    // Add a small offset from cursor to make the ghost visible
    const mousePos = p5InstanceRef.current?.mouseX || canvasSize.width / 2;
    const mouseY = p5InstanceRef.current?.mouseY || canvasSize.height / 2;

    // Set drag ghost with initial position
    setDragGhost({
      type,
      x: mousePos,
      y: mouseY,
    });

    // Show visual feedback in console that drag has started
    console.log(`Starting drag for component: ${type}`);
  };

  // Handle component button click from palette - improved for mobile and desktop
  const handleComponentButtonClick = (type: string) => {
    if (isMobile) {
      // For mobile, directly add the component to the center of the canvas
      const centerX = canvasSize.width / 2;
      const centerY = canvasSize.height / 2;

      // Find an unoccupied spot near the center
      let placementX = centerX;
      let placementY = centerY;
      let offset = 0;

      // Try to find an unoccupied spot in a spiral pattern
      while (
        circuitState.components.some(
          (comp) =>
            Math.abs(comp.x - placementX) < 40 &&
            Math.abs(comp.y - placementY) < 40,
        ) &&
        offset < 200
      ) {
        offset += 40;
        placementX = centerX + Math.cos(offset / 40) * offset;
        placementY = centerY + Math.sin(offset / 40) * offset;
      }

      // Add component directly for mobile
      addComponentAt(type, placementX, placementY);
    } else {
      // For desktop, either use HTML5 drag and drop or fallback to click-to-place
      addComponent(type);

      // Capture mouse position for drag
      const handleMouseMove = (e: MouseEvent) => {
        if (dragGhost && dragGhost.type === type) {
          const canvasRect = p5ContainerRef.current?.getBoundingClientRect();

          if (canvasRect) {
            const x = e.clientX - canvasRect.left;
            const y = e.clientY - canvasRect.top;

            // Only update if mouse is within canvas bounds
            if (
              x >= 0 &&
              x <= canvasSize.width &&
              y >= 0 &&
              y <= canvasSize.height
            ) {
              setDragGhost({
                ...dragGhost,
                x: x,
                y: y,
              });
            }
          }
        }
      };

      // Handle click to place component
      const handleMouseUp = (e: MouseEvent) => {
        if (dragGhost && dragGhost.type === type) {
          const canvasRect = p5ContainerRef.current?.getBoundingClientRect();

          if (canvasRect) {
            const x = e.clientX - canvasRect.left;
            const y = e.clientY - canvasRect.top;

            // Check if click is within canvas bounds
            if (
              x >= 0 &&
              x <= canvasSize.width &&
              y >= 0 &&
              y <= canvasSize.height
            ) {
              // Snap to grid
              const snapX = snapToGrid
                ? Math.round(x / gridSize) * gridSize
                : x;
              const snapY = snapToGrid
                ? Math.round(y / gridSize) * gridSize
                : y;

              // Add component at position
              addComponentAt(type, snapX, snapY);
            }
          }

          // Clean up
          setDragGhost(null);
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        }
      };

      // Add event listeners for tracking drag
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
  };

  // Change circuit mode
  const handleModeChange = (newMode: CircuitMode) => {
    setMode(newMode);
  };

  // Delete the selected component
  const handleDeleteSelected = () => {
    if (selectedComponent) {
      removeComponent(selectedComponent);
    }
  };

  // Challenge validation
  useEffect(() => {
    if (challenge && modeProp === "challenge") {
      let result: "success" | "error" | "warning" = "error";
      let message = "";

      // Check if circuit has minimum required components
      if (circuitState.components.length < 2) {
        result = "warning";
        message =
          "সার্কিট অসম্পূর্ণ। কমপক্ষে একটি ব্যাটারি এবং একটি রেজিস্টর প্রয়োজন।";
      }
      // Check for short circuit
      else if (circuitState.totalResistance < 0.01) {
        result = "warning";
        message = "শর্ট সার্কিট! অনুগ্রহ করে কোনো রেজিস্টর যোগ করুন।";
      }
      // Check if challenge criteria are met
      else if (
        challenge.mode === mode &&
        (challenge.totalResistance === undefined ||
          Math.abs(circuitState.totalResistance - challenge.totalResistance!) /
            challenge.totalResistance! <
            0.05)
      ) {
        result = "success";
        message = "অভিনন্দন! আপনি চ্যালেঞ্জটি সফলভাবে পূরণ করেছেন।";
      } else {
        result = "error";
        message = "চ্যালেঞ্জের শর্ত পূরণ হয়নি। আবার চেষ্টা করুন।";
      }

      setChallengeResult(result);
      setChallengeMessage(message);

      if (onChallengeResult) {
        onChallengeResult(result);
      }
    }
  }, [circuitState, mode, challenge, modeProp, onChallengeResult]);

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full max-w-full overflow-hidden">
      {/* Mobile Component Palette (horizontal) - Improved for touch */}
      {isMobile && (
        <div className="w-full mb-2 px-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-2 border border-blue-100 dark:border-blue-800">
            <h3 className="text-base font-semibold mb-1 text-center">
              কম্পোনেন্ট প্যালেট
            </h3>
            <div className="flex flex-wrap justify-center gap-1">
              {componentPalette.map((component) => (
                <button
                  key={component.type}
                  className="flex flex-col items-center justify-center px-1 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition shadow w-[52px] h-[52px] touch-manipulation"
                  style={{
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent", // Remove tap highlight on iOS
                  }}
                  title={component.tooltip}
                  onClick={() => handleComponentButtonClick(component.type)}
                >
                  <span className="text-xl">{component.icon}</span>
                  <span className="text-xs text-center mt-1 line-clamp-1">
                    {component.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Component Palette (vertical) */}
      {!isMobile && (
        <div className="w-64 flex-shrink-0 flex flex-col gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-blue-100 dark:border-blue-800">
            <h3 className="text-lg font-semibold mb-3 text-center">
              কম্পোনেন্ট প্যালেট
            </h3>
            <div className="flex flex-col gap-2">
              {componentPalette.map((component) => (
                <button
                  key={component.type}
                  className="flex items-center gap-2 px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition shadow cursor-grab active:cursor-grabbing"
                  draggable="true"
                  title={component.tooltip}
                  onClick={() => handleComponentButtonClick(component.type)}
                  onDragEnd={() => {
                    // Clean up any drag state
                    setDragGhost(null);
                  }}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", component.type);
                    e.dataTransfer.effectAllowed = "move";

                    // Create a custom drag image
                    const dragImage = document.createElement("div");

                    dragImage.className =
                      "rounded-lg bg-blue-500 text-white p-2 flex items-center justify-center";
                    dragImage.style.width = "50px";
                    dragImage.style.height = "50px";
                    dragImage.style.fontSize = "24px";
                    dragImage.innerHTML = component.icon;
                    dragImage.style.position = "absolute";
                    dragImage.style.top = "-1000px";
                    document.body.appendChild(dragImage);

                    // Use the drag image
                    e.dataTransfer.setDragImage(dragImage, 25, 25);

                    // Set timeout to remove the element
                    setTimeout(() => {
                      document.body.removeChild(dragImage);
                    }, 0);

                    // Also trigger our custom drag tracking
                    addComponent(component.type);
                  }}
                >
                  <span className="text-xl">{component.icon}</span>
                  <span>{component.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Circuit Mode Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-blue-100 dark:border-blue-800">
            <h3 className="text-lg font-semibold mb-3 text-center">
              সার্কিট মোড
            </h3>
            <div className="flex flex-col gap-2">
              <button
                className={`px-3 py-2 rounded border transition ${
                  mode === "series"
                    ? "bg-green-500 text-white border-green-600"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                }`}
                onClick={() => handleModeChange("series")}
              >
                সিরিজ
              </button>
              <button
                className={`px-3 py-2 rounded border transition ${
                  mode === "parallel"
                    ? "bg-green-500 text-white border-green-600"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                }`}
                onClick={() => handleModeChange("parallel")}
              >
                প্যারালাল
              </button>
              <button
                className={`px-3 py-2 rounded border transition ${
                  mode === "free"
                    ? "bg-green-500 text-white border-green-600"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                }`}
                onClick={() => handleModeChange("free")}
              >
                ফ্রি
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-blue-100 dark:border-blue-800">
            <h3 className="text-lg font-semibold mb-3 text-center">সেটিংস</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  checked={snapToGrid}
                  className="rounded"
                  type="checkbox"
                  onChange={() => setSnapToGrid(!snapToGrid)}
                />
                <span>গ্রিডে স্ন্যাপ করুন</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  checked={showCurrent}
                  className="rounded"
                  type="checkbox"
                  onChange={() => {
                    setShowCurrent(!showCurrent);
                    if (sketchRef.current) {
                      sketchRef.current.updateShowCurrent(!showCurrent);
                    }
                  }}
                />
                <span>কারেন্ট দেখান</span>
              </label>
            </div>
          </div>

          {/* Circuit Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-blue-100 dark:border-blue-800">
            <h3 className="text-lg font-semibold mb-3 text-center">
              সার্কিট তথ্য
            </h3>
            <div className="text-center space-y-1">
              <p>মোট ভোল্টেজ: {circuitState.totalVoltage.toFixed(2)} V</p>
              <p>
                মোট রেজিস্ট্যান্স: {circuitState.totalResistance.toFixed(2)} Ω
              </p>
              <p>মোট কারেন্ট: {circuitState.totalCurrent.toFixed(3)} A</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {mode === "series"
                  ? "R = R₁ + R₂ + ... + Rₙ"
                  : mode === "parallel"
                    ? "1/R = 1/R₁ + 1/R₂ + ... + 1/Rₙ"
                    : ""}
              </p>
            </div>
          </div>

          {/* Challenge Result */}
          {modeProp === "challenge" && challengeResult && (
            <div
              className={`rounded-xl shadow-md p-4 text-center ${
                challengeResult === "success"
                  ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                  : challengeResult === "warning"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                    : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
              }`}
            >
              <p className="font-medium">{challengeMessage}</p>
            </div>
          )}
        </div>
      )}

      {/* Circuit Canvas */}
      <div className="flex-1 flex flex-col items-center">
        {/* Enhanced circuit canvas wrapper with drop zone support */}
        <div
          className="relative w-full rounded-xl overflow-hidden shadow-lg flex-grow"
          style={{
            backgroundColor: "#f0f4ff",
            minHeight: isMobile ? "300px" : "450px",
            maxWidth: "100%",
            height: `${canvasSize.height}px`,
            border: dragGhost ? "3px dashed #2563eb" : "1px solid #d1d5db",
            boxShadow: dragGhost
              ? "0 0 15px rgba(37, 99, 235, 0.35)"
              : "0 4px 6px rgba(0, 0, 0, 0.1)",
            transition: "all 0.2s ease-in-out",
            cursor: dragGhost ? "pointer" : "default",
            touchAction: "none", // Prevent browser handling of touch events for better drag behavior
          }}
          onClick={(e) => {
            // Click to place component when dragging
            if (dragGhost) {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;

              // Snap to grid if enabled
              const snapX = snapToGrid
                ? Math.round(x / gridSize) * gridSize
                : x;
              const snapY = snapToGrid
                ? Math.round(y / gridSize) * gridSize
                : y;

              // Add component at clicked position
              addComponentAt(dragGhost.type, snapX, snapY);
              setDragGhost(null);
              e.stopPropagation(); // Prevent other click handlers
            }
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove("bg-blue-50");
          }}
          onDragOver={(e) => {
            e.preventDefault(); // Allow drop
            e.dataTransfer.dropEffect = "move";

            // Visual feedback during drag over
            e.currentTarget.classList.add("bg-blue-50");
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("bg-blue-50");

            // Get the dragged component type
            const componentType = e.dataTransfer.getData("text/plain");

            if (!componentType) return;

            // Calculate drop position relative to canvas
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Snap to grid if enabled
            const snapX = snapToGrid ? Math.round(x / gridSize) * gridSize : x;
            const snapY = snapToGrid ? Math.round(y / gridSize) * gridSize : y;

            // Add component at drop position
            addComponentAt(componentType, snapX, snapY);
            setDragGhost(null);
          }}
          onMouseMove={(e) => {
            // Manual drag tracking when using click-to-place mode
            if (dragGhost) {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;

              setDragGhost({
                ...dragGhost,
                x,
                y,
              });
            }
          }}
        >
          <div
            ref={p5ContainerRef}
            className="absolute inset-0 w-full h-full"
          />
          {renderInstructions()}

          {/* Enhanced drag ghost visualization with improved animation and feedback */}
          {dragGhost && (
            <>
              {/* Component ghost that follows cursor with improved animation */}
              <div
                className="absolute pointer-events-none z-20"
                style={{
                  left: `${dragGhost.x - 25}px`,
                  top: `${dragGhost.y - 25}px`,
                  width: "50px",
                  height: "50px",
                  backgroundColor: "rgba(59, 130, 246, 0.9)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 20px rgba(37, 99, 235, 0.6)",
                  border: "2px solid white",
                  animation: "pulse 1.5s infinite",
                  transform: "scale(1)",
                  transition: "transform 0.1s ease-out",
                }}
              >
                <span className="text-2xl text-white">
                  {componentPalette.find((c) => c.type === dragGhost.type)
                    ?.icon || "⚙️"}
                </span>
              </div>

              {/* Grid snap indicator with animation */}
              {snapToGrid && (
                <div
                  className="absolute pointer-events-none z-10"
                  style={{
                    left: `${Math.round(dragGhost.x / gridSize) * gridSize - 10}px`,
                    top: `${Math.round(dragGhost.y / gridSize) * gridSize - 10}px`,
                    width: "20px",
                    height: "20px",
                    border: "2px solid rgba(59, 130, 246, 0.8)",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                    boxShadow: "0 0 8px rgba(59, 130, 246, 0.5)",
                    animation: "targetPulse 1.5s infinite",
                  }}
                />
              )}

              {/* Enhanced instruction overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white p-2 px-4 rounded-lg shadow-md z-10 text-center">
                <p className="font-medium text-sm">
                  {isMobile
                    ? "ক্লিক করুন"
                    : "যেখানে রাখতে চান সেখানে ক্লিক করুন"}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Mobile Warning */}
        {isMobile && renderMobileWarning()}

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedComponent}
            onClick={handleDeleteSelected}
          >
            কম্পোনেন্ট মুছুন
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedComponent}
            onClick={() =>
              selectedComponent && rotateComponent(selectedComponent)
            }
          >
            রোটেট করুন
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 transition"
            onClick={() => {
              const updatedCircuit = calculateCircuit(circuitState, mode);

              setCircuitState(updatedCircuit);
            }}
          >
            সিমুলেট করুন
          </button>
        </div>

        {/* Mobile Control Panel - Better organized and more compact */}
        {isMobile && (
          <div className="w-full mt-2 mb-12">
            {" "}
            {/* Added bottom margin to account for fixed warning */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 border border-blue-100 dark:border-blue-800">
              {/* Tabs for better organization */}
              <div className="flex border-b border-blue-100 dark:border-gray-700 mb-2">
                <button className="px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-500">
                  কন্ট্রোল
                </button>
              </div>

              {/* Circuit Modes - Improved buttons */}
              <div className="flex justify-center gap-2 mb-2">
                <button
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    mode === "series"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                  onClick={() => handleModeChange("series")}
                >
                  সিরিজ
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    mode === "parallel"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                  onClick={() => handleModeChange("parallel")}
                >
                  প্যারালাল
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    mode === "free"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                  onClick={() => handleModeChange("free")}
                >
                  ফ্রি
                </button>
              </div>

              {/* Quick actions row */}
              <div className="flex flex-wrap justify-center gap-1 mb-2">
                <button
                  className="px-2 py-1 bg-red-500 text-white text-sm rounded-md shadow-sm hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled={!selectedComponent}
                  onClick={handleDeleteSelected}
                >
                  <span className="mr-1">🗑️</span> মুছুন
                </button>
                <button
                  className="px-2 py-1 bg-blue-500 text-white text-sm rounded-md shadow-sm hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled={!selectedComponent}
                  onClick={() =>
                    selectedComponent && rotateComponent(selectedComponent)
                  }
                >
                  <span className="mr-1">🔄</span> রোটেট
                </button>
                <button
                  className="px-2 py-1 bg-green-500 text-white text-sm rounded-md shadow-sm hover:bg-green-600 transition flex items-center"
                  onClick={() => {
                    const updatedCircuit = calculateCircuit(circuitState, mode);

                    setCircuitState(updatedCircuit);
                  }}
                >
                  <span className="mr-1">▶️</span> সিমুলেট
                </button>
              </div>

              {/* Circuit measurements in a nice card */}
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-md p-2 mb-2">
                <div className="flex justify-between items-center text-xs font-medium">
                  <div className="flex flex-col items-center">
                    <span className="text-blue-800 dark:text-blue-200">
                      ভোল্টেজ
                    </span>
                    <span className="font-bold">
                      {circuitState.totalVoltage.toFixed(1)}V
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-blue-800 dark:text-blue-200">
                      রেজিস্ট্যান্স
                    </span>
                    <span className="font-bold">
                      {circuitState.totalResistance.toFixed(1)}Ω
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-blue-800 dark:text-blue-200">
                      কারেন্ট
                    </span>
                    <span className="font-bold">
                      {circuitState.totalCurrent.toFixed(2)}A
                    </span>
                  </div>
                </div>
              </div>

              {/* Settings toggles */}
              <div className="flex justify-center items-center gap-4">
                <label className="flex items-center gap-1 text-xs">
                  <input
                    checked={snapToGrid}
                    className="h-3 w-3"
                    type="checkbox"
                    onChange={() => setSnapToGrid(!snapToGrid)}
                  />
                  <span>গ্রিডে স্ন্যাপ</span>
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    checked={showCurrent}
                    className="h-3 w-3"
                    type="checkbox"
                    onChange={() => {
                      setShowCurrent(!showCurrent);
                      if (sketchRef.current) {
                        sketchRef.current.updateShowCurrent(!showCurrent);
                      }
                    }}
                  />
                  <span>কারেন্ট দেখান</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default P5CircuitSimulator;
