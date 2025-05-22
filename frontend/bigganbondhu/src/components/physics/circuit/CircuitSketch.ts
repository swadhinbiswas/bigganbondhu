// p5.js sketch for rendering the circuit
import {
  CircuitComponent,
  CircuitMode,
  CircuitState,
  Connection,
} from "./types";

export class CircuitSketch {
  p5: any; // Use any to allow for p5 instance methods
  circuitState: CircuitState;
  mode: CircuitMode;
  showCurrent: boolean;
  canvasWidth: number;
  canvasHeight: number;
  gridSize: number;
  selectedComponent: string | null;
  hoveredComponent: string | null;
  pulse: number;
  isDarkMode: boolean;
  connectionPreview: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  } | null;
  scale: number; // Component scale factor for resizing
  resizing: boolean; // Flag to indicate resize mode
  resizeStart: { x: number; y: number; scale: number } | null; // Starting point for resize
  connectPoints: {
    [id: string]: {
      input: { x: number; y: number }[];
      output: { x: number; y: number }[];
    };
  }; // Connection points for each component

  constructor(
    p5Instance: any,
    initialState: CircuitState,
    mode: CircuitMode,
    showCurrent: boolean,
    canvasWidth = 700,
    canvasHeight = 500
  ) {
    this.p5 = p5Instance;
    this.circuitState = initialState;
    this.mode = mode;
    this.showCurrent = showCurrent;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.gridSize = 20;
    this.selectedComponent = null;
    this.hoveredComponent = null;
    this.pulse = 0;
    this.isDarkMode = document.documentElement.classList.contains("dark");
    this.connectionPreview = null;
    this.scale = 1.0;
    this.resizing = false;
    this.resizeStart = null;
    this.connectPoints = {};
  }

  setup() {
    this.p5.createCanvas(this.canvasWidth, this.canvasHeight);
    this.p5.angleMode(this.p5.DEGREES);
    this.p5.rectMode(this.p5.CENTER);
    this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
    this.updateConnectionPoints();
  }

  // Main draw function
  draw() {
    this.pulse = (this.pulse + 1) % 100; // Update animation pulse

    // Set background based on dark mode
    if (this.isDarkMode) {
      this.p5.background(30, 41, 59); // Dark background
    } else {
      this.p5.background(240, 244, 255); // Light bluish background
    }

    this.drawGrid();
    this.drawConnections();

    // Draw connection preview if provided
    if (this.connectionPreview) {
      this.drawConnectionPreview(
        this.connectionPreview.fromX,
        this.connectionPreview.fromY,
        this.connectionPreview.toX,
        this.connectionPreview.toY
      );
    }

    this.drawComponents();

    // Draw resize handles if component is selected
    if (this.selectedComponent) {
      this.drawResizeHandles(this.selectedComponent);
    }

    // Draw connection points
    this.drawConnectionPoints();
  }

  // Draw the grid
  drawGrid() {
    this.p5.stroke(this.isDarkMode ? 60 : 229);
    this.p5.strokeWeight(0.5);

    // Vertical lines
    for (let x = 0; x <= this.canvasWidth; x += this.gridSize) {
      this.p5.line(x, 0, x, this.canvasHeight);
    }

    // Horizontal lines
    for (let y = 0; y <= this.canvasHeight; y += this.gridSize) {
      this.p5.line(0, y, this.canvasWidth, y);
    }
  }

  // Draw all connections (wires) with improved visuals
  drawConnections() {
    this.circuitState.connections.forEach((conn, idx) => {
      const from = this.circuitState.components.find((c) => c.id === conn.from);
      const to = this.circuitState.components.find((c) => c.id === conn.to);

      if (!from || !to) return;

      // Determine color and animation based on current flow
      let strokeColor;
      let strokeWeight = 2;

      if (this.showCurrent && conn.current && conn.current > 0) {
        // Animated pulsing effect for current
        const pulseIntensity = Math.abs(
          Math.sin((this.pulse + idx * 10) * 0.06)
        );
        const a = 0.5 + 0.5 * pulseIntensity;

        if (this.isDarkMode) {
          strokeColor = this.p5.color(56, 189, 248, a * 255); // Cyan for dark mode
        } else {
          strokeColor = this.p5.color(2, 132, 199, a * 255); // Blue for light mode
        }

        strokeWeight = 3 + pulseIntensity * 2;
      } else {
        strokeColor = this.isDarkMode ? this.p5.color(100) : this.p5.color(50);
      }

      // Find the closest connection points
      const fromPoints = this.connectPoints[from.id]?.output || [
        { x: from.x, y: from.y },
      ];
      const toPoints = this.connectPoints[to.id]?.input || [
        { x: to.x, y: to.y },
      ];

      let minDist = Infinity;
      let bestFromPoint = { x: from.x, y: from.y };
      let bestToPoint = { x: to.x, y: to.y };

      fromPoints.forEach((fp) => {
        toPoints.forEach((tp) => {
          const dist = Math.sqrt(
            Math.pow(fp.x - tp.x, 2) + Math.pow(fp.y - tp.y, 2)
          );
          if (dist < minDist) {
            minDist = dist;
            bestFromPoint = fp;
            bestToPoint = tp;
          }
        });
      });

      // Draw wire with Bezier curve for smoother connections
      this.p5.push();
      this.p5.stroke(strokeColor);
      this.p5.strokeWeight(strokeWeight);
      this.p5.noFill();

      // Calculate control points for the Bezier
      const dx = bestToPoint.x - bestFromPoint.x;
      const dy = bestToPoint.y - bestFromPoint.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // For short distances, use a simple line
      if (dist < 50) {
        this.p5.line(
          bestFromPoint.x,
          bestFromPoint.y,
          bestToPoint.x,
          bestToPoint.y
        );
      } else {
        // For longer distances, use a Bezier curve
        const ctrlDist = dist / 3;
        const ctrl1X = bestFromPoint.x + ctrlDist;
        const ctrl1Y = bestFromPoint.y;
        const ctrl2X = bestToPoint.x - ctrlDist;
        const ctrl2Y = bestToPoint.y;

        this.p5.bezier(
          bestFromPoint.x,
          bestFromPoint.y,
          ctrl1X,
          ctrl1Y,
          ctrl2X,
          ctrl2Y,
          bestToPoint.x,
          bestToPoint.y
        );
      }

      // Draw current direction arrow if current is flowing
      if (this.showCurrent && conn.current && conn.current > 0) {
        const midX = (bestFromPoint.x + bestToPoint.x) / 2;
        const midY = (bestFromPoint.y + bestToPoint.y) / 2;
        const angle = Math.atan2(
          bestToPoint.y - bestFromPoint.y,
          bestToPoint.x - bestFromPoint.x
        );
        const arrowSize = 8;

        this.p5.push();
        this.p5.translate(midX, midY);
        this.p5.rotate(angle);
        this.p5.fill(strokeColor);
        this.p5.noStroke();
        this.p5.triangle(
          arrowSize,
          0,
          -arrowSize / 2,
          -arrowSize / 2,
          -arrowSize / 2,
          arrowSize / 2
        );
        this.p5.pop();

        // Draw voltage/current value
        if (conn.voltage !== undefined || conn.current !== undefined) {
          this.p5.push();
          this.p5.fill(this.isDarkMode ? 255 : 0);
          this.p5.noStroke();
          this.p5.textSize(10);
          let label = "";
          if (conn.voltage !== undefined) {
            label += `${conn.voltage.toFixed(1)}V`;
          }
          if (conn.current !== undefined) {
            if (label) label += ", ";
            label += `${conn.current.toFixed(2)}A`;
          }
          this.p5.text(label, midX, midY - 10);
          this.p5.pop();
        }
      }

      this.p5.pop();
    });
  }

  // Draw connection points for all components
  drawConnectionPoints() {
    Object.keys(this.connectPoints).forEach((id) => {
      const component = this.circuitState.components.find((c) => c.id === id);
      if (!component) return;

      const isSelected = this.selectedComponent === id;
      const points = this.connectPoints[id];

      // Only show connection points for selected component or when in connection mode
      if (isSelected || this.connectionPreview) {
        // Draw input points
        points.input.forEach((point) => {
          this.p5.push();
          this.p5.fill(this.isDarkMode ? "#38bdf8" : "#0284c7");
          this.p5.stroke(255);
          this.p5.strokeWeight(1);
          this.p5.ellipse(point.x, point.y, 8, 8);
          this.p5.pop();
        });

        // Draw output points
        points.output.forEach((point) => {
          this.p5.push();
          this.p5.fill(this.isDarkMode ? "#f87171" : "#ef4444");
          this.p5.stroke(255);
          this.p5.strokeWeight(1);
          this.p5.ellipse(point.x, point.y, 8, 8);
          this.p5.pop();
        });
      }
    });
  }

  // Draw a connection preview line
  drawConnectionPreview(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ) {
    this.p5.push();
    this.p5.stroke(this.p5.color(56, 189, 248)); // Cyan
    this.p5.strokeWeight(2);

    // Draw dashed line (p5.js doesn't have setLineDash, so we implement it manually)
    const dashLength = 5;
    const gapLength = 5;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.floor(dist / (dashLength + gapLength));
    const xStep = dx / steps;
    const yStep = dy / steps;

    for (let i = 0; i < steps; i++) {
      const startX = fromX + i * xStep;
      const startY = fromY + i * yStep;
      const endX = startX + (xStep * dashLength) / (dashLength + gapLength);
      const endY = startY + (yStep * dashLength) / (dashLength + gapLength);
      this.p5.line(startX, startY, endX, endY);
    }

    // Draw arrowhead at the end
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const arrowSize = 10;

    this.p5.push();
    this.p5.translate(toX, toY);
    this.p5.rotate(angle);
    this.p5.fill(this.p5.color(56, 189, 248));
    this.p5.noStroke();
    this.p5.triangle(
      0,
      0,
      -arrowSize,
      -arrowSize / 2,
      -arrowSize,
      arrowSize / 2
    );
    this.p5.pop();

    this.p5.pop();
  }

  // Set connection preview
  setConnectionPreview(
    preview: { fromX: number; fromY: number; toX: number; toY: number } | null
  ) {
    this.connectionPreview = preview;
  }

  // Draw resize handles for a selected component
  drawResizeHandles(componentId: string) {
    const component = this.circuitState.components.find(
      (c) => c.id === componentId
    );
    if (!component) return;

    this.p5.push();
    this.p5.fill(this.isDarkMode ? "#38bdf8" : "#0284c7");
    this.p5.stroke(255);
    this.p5.strokeWeight(1);

    // Calculate corner positions based on component size and scale
    const handleSize = 8;
    const baseSize = this.getComponentSize(component);
    const scale = component.properties.scale || 1.0;
    const halfWidth = (baseSize.width * scale) / 2;
    const halfHeight = (baseSize.height * scale) / 2;

    // Draw the corner resize handles
    this.p5.rect(
      component.x + halfWidth,
      component.y + halfHeight,
      handleSize,
      handleSize
    );
    this.p5.rect(
      component.x - halfWidth,
      component.y + halfHeight,
      handleSize,
      handleSize
    );
    this.p5.rect(
      component.x + halfWidth,
      component.y - halfHeight,
      handleSize,
      handleSize
    );
    this.p5.rect(
      component.x - halfWidth,
      component.y - halfHeight,
      handleSize,
      handleSize
    );

    this.p5.pop();
  }

  // Get component size based on type
  getComponentSize(component: CircuitComponent): {
    width: number;
    height: number;
  } {
    const baseSize = this.gridSize * 2;

    switch (component.type) {
      case "battery":
        return { width: baseSize * 1.5, height: baseSize };
      case "resistor":
        return { width: baseSize * 2, height: baseSize * 0.8 };
      case "bulb":
        return { width: baseSize * 1.2, height: baseSize * 1.2 };
      case "led":
        return { width: baseSize, height: baseSize };
      case "switch":
        return { width: baseSize * 1.2, height: baseSize * 0.8 };
      case "capacitor":
        return { width: baseSize * 1.5, height: baseSize };
      case "inductor":
        return { width: baseSize * 1.5, height: baseSize };
      case "wire":
      default:
        return { width: baseSize * 0.5, height: baseSize * 0.5 };
    }
  }

  // Update connection points for all components
  updateConnectionPoints() {
    this.connectPoints = {};

    this.circuitState.components.forEach((comp) => {
      const size = this.getComponentSize(comp);
      const scale = comp.properties.scale || 1.0;
      const halfWidth = (size.width * scale) / 2;
      const halfHeight = (size.height * scale) / 2;

      // Create connection points based on component type and orientation
      const rotation = comp.rotation || 0;
      const rad = (rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      // Transform a point based on rotation
      const rotatePoint = (x: number, y: number) => {
        const rx = x * cos - y * sin;
        const ry = x * sin + y * cos;
        return { x: comp.x + rx, y: comp.y + ry };
      };

      let inputPoints: { x: number; y: number }[] = [];
      let outputPoints: { x: number; y: number }[] = [];

      switch (comp.type) {
        case "battery":
          // Battery has output on positive side (right), input on negative side (left)
          inputPoints = [rotatePoint(-halfWidth, 0)];
          outputPoints = [rotatePoint(halfWidth, 0)];
          break;
        case "resistor":
          // Resistor has input/output on both sides
          inputPoints = [rotatePoint(-halfWidth, 0), rotatePoint(halfWidth, 0)];
          outputPoints = [
            rotatePoint(-halfWidth, 0),
            rotatePoint(halfWidth, 0),
          ];
          break;
        case "switch":
          // Switch has input/output on both sides
          inputPoints = [rotatePoint(-halfWidth, 0), rotatePoint(halfWidth, 0)];
          outputPoints = [
            rotatePoint(-halfWidth, 0),
            rotatePoint(halfWidth, 0),
          ];
          break;
        case "bulb":
          // Bulb has input on bottom, output on top
          inputPoints = [rotatePoint(0, halfHeight)];
          outputPoints = [rotatePoint(0, -halfHeight)];
          break;
        case "led":
          // LED has input on negative side (left), output on positive side (right)
          inputPoints = [rotatePoint(-halfWidth, 0)];
          outputPoints = [rotatePoint(halfWidth, 0)];
          break;
        case "capacitor":
          // Capacitor has input/output on both sides
          inputPoints = [rotatePoint(-halfWidth, 0), rotatePoint(halfWidth, 0)];
          outputPoints = [
            rotatePoint(-halfWidth, 0),
            rotatePoint(halfWidth, 0),
          ];
          break;
        case "inductor":
          // Inductor has input/output on both sides
          inputPoints = [rotatePoint(-halfWidth, 0), rotatePoint(halfWidth, 0)];
          outputPoints = [
            rotatePoint(-halfWidth, 0),
            rotatePoint(halfWidth, 0),
          ];
          break;
        case "wire":
          // Wire has input/output at its position
          inputPoints = [{ x: comp.x, y: comp.y }];
          outputPoints = [{ x: comp.x, y: comp.y }];
          break;
      }

      this.connectPoints[comp.id] = {
        input: inputPoints,
        output: outputPoints,
      };
    });
  }

  // Draw all components
  drawComponents() {
    this.circuitState.components.forEach((comp) => {
      // Determine if component is selected or hovered
      const isSelected = comp.id === this.selectedComponent;
      const isHovered = comp.id === this.hoveredComponent;

      this.p5.push();
      this.p5.translate(comp.x, comp.y);
      this.p5.rotate(comp.rotation);

      // Draw selection/hover highlight
      if (isSelected || isHovered) {
        this.p5.noFill();
        this.p5.strokeWeight(2);
        this.p5.stroke(
          isSelected ? this.p5.color(59, 130, 246) : this.p5.color(34, 197, 94)
        );
        this.p5.rect(0, 0, 42, 42, 5);
      }

      // Draw the component based on its type
      switch (comp.type) {
        case "battery":
          this.drawBattery(comp);
          break;
        case "resistor":
          this.drawResistor(comp);
          break;
        case "switch":
          this.drawSwitch(comp);
          break;
        case "bulb":
          this.drawBulb(comp);
          break;
        case "wire":
          this.drawWire(comp);
          break;
        case "led":
          this.drawLED(comp);
          break;
        case "capacitor":
          this.drawCapacitor(comp);
          break;
        case "inductor":
          this.drawInductor(comp);
          break;
      }

      this.p5.pop();
    });

    // Update connection points after all components have been drawn
    this.updateConnectionPoints();
  }

  // Component drawing functions
  drawBattery(comp: CircuitComponent) {
    // Battery body
    this.p5.fill(this.isDarkMode ? 50 : 255);
    this.p5.stroke(0);
    this.p5.strokeWeight(1.5);
    this.p5.rect(0, 0, 30, 16, 2);

    // Battery terminals
    this.p5.line(-12, -8, -12, 8); // Negative terminal
    this.p5.line(-7, -4, -7, 4); // Negative pole
    this.p5.line(7, -8, 7, 8); // Positive terminal
    this.p5.line(12, -4, 12, 4); // Positive pole

    // Voltage label
    this.p5.fill(0);
    this.p5.noStroke();
    this.p5.textSize(10);
    this.p5.text(`${comp.properties.voltage || 6}V`, 0, 0);
  }

  drawResistor(comp: CircuitComponent) {
    // Resistor body
    this.p5.fill(this.isDarkMode ? 80 : 220);
    this.p5.stroke(0);
    this.p5.strokeWeight(1.5);
    this.p5.rect(0, 0, 30, 12, 2);

    // Resistor zigzag symbol
    this.p5.line(-15, 0, -10, 0);
    this.p5.line(15, 0, 10, 0);

    // Draw zigzag pattern
    const zigzagWidth = 3;
    this.p5.beginShape();
    this.p5.vertex(-10, 0);
    this.p5.vertex(-8, -zigzagWidth);
    this.p5.vertex(-4, zigzagWidth);
    this.p5.vertex(0, -zigzagWidth);
    this.p5.vertex(4, zigzagWidth);
    this.p5.vertex(8, -zigzagWidth);
    this.p5.vertex(10, 0);
    this.p5.endShape();

    // Resistance label
    this.p5.fill(0);
    this.p5.noStroke();
    this.p5.textSize(8);
    this.p5.text(`${comp.properties.resistance || 10}Ω`, 0, 0);
  }

  drawSwitch(comp: CircuitComponent) {
    const isOn = comp.properties.state === "on";

    // Switch base
    this.p5.fill(this.isDarkMode ? 60 : 200);
    this.p5.stroke(0);
    this.p5.strokeWeight(1.5);
    this.p5.rect(0, 0, 30, 14, 7);

    // Switch terminal points
    this.p5.fill(0);
    this.p5.ellipse(-10, 0, 4, 4);
    this.p5.ellipse(10, 0, 4, 4);

    // Switch lever
    this.p5.stroke(
      isOn ? this.p5.color(34, 197, 94) : this.p5.color(239, 68, 68)
    );
    this.p5.strokeWeight(2);

    if (isOn) {
      this.p5.line(-10, 0, 10, 0); // Closed position
    } else {
      this.p5.line(-10, 0, 8, -6); // Open position
    }

    // State label
    this.p5.fill(
      isOn ? this.p5.color(34, 197, 94) : this.p5.color(239, 68, 68)
    );
    this.p5.noStroke();
    this.p5.textSize(7);
    this.p5.text(isOn ? "ON" : "OFF", 0, 9);
  }

  drawBulb(_comp: CircuitComponent) {
    // Check if bulb should be lit
    const isLit =
      this.circuitState.totalCurrent > 0 &&
      !this.circuitState.components.some(
        (c) => c.type === "switch" && c.properties.state === "off"
      );

    // Bulb base
    this.p5.fill(150);
    this.p5.stroke(0);
    this.p5.strokeWeight(1);
    this.p5.rect(0, 10, 12, 6);

    // Bulb glass
    if (isLit) {
      // Glowing effect
      this.p5.fill(255, 255, 150, 100);
      this.p5.noStroke();
      this.p5.ellipse(0, 0, 30, 30); // Outer glow

      this.p5.fill(255, 255, 100);
    } else {
      this.p5.fill(this.isDarkMode ? 100 : 240);
    }
    this.p5.stroke(0);
    this.p5.strokeWeight(1);
    this.p5.ellipse(0, 0, 18, 18); // Bulb glass

    // Filament
    this.p5.stroke(isLit ? this.p5.color(255, 255, 0) : 0);
    this.p5.strokeWeight(isLit ? 2 : 1);
    this.p5.noFill();
    this.p5.beginShape();
    this.p5.vertex(0, 6);
    this.p5.vertex(0, 2);
    this.p5.vertex(-3, 0);
    this.p5.vertex(3, -2);
    this.p5.vertex(-3, -4);
    this.p5.vertex(0, -6);
    this.p5.endShape();
  }

  drawWire(_comp: CircuitComponent) {
    // Simple wire connector point
    this.p5.fill(this.isDarkMode ? 150 : 50);
    this.p5.stroke(0);
    this.p5.strokeWeight(1);
    this.p5.ellipse(0, 0, 8, 8);
  }

  drawLED(comp: CircuitComponent) {
    // Check if LED should be lit
    const isLit =
      this.circuitState.totalCurrent > 0 &&
      !this.circuitState.components.some(
        (c) => c.type === "switch" && c.properties.state === "off"
      );

    // LED body
    this.p5.fill(this.isDarkMode ? 60 : 220);
    this.p5.stroke(0);
    this.p5.strokeWeight(1);
    this.p5.rect(0, 0, 12, 16, 2, 8, 8, 2);

    // LED color/light
    const ledColor = comp.properties.color || "#ff0000";
    if (isLit) {
      // Glowing effect
      this.p5.fill(this.p5.color(ledColor));
      this.p5.noStroke();
      this.p5.ellipse(0, -4, 14, 14); // Outer glow

      this.p5.fill(this.p5.color(ledColor));
    } else {
      this.p5.fill(this.isDarkMode ? 80 : 180);
    }
    this.p5.stroke(0);
    this.p5.strokeWeight(0.5);
    this.p5.ellipse(0, -4, 8, 8);

    // LED legs
    this.p5.stroke(0);
    this.p5.strokeWeight(1.5);
    this.p5.line(-3, 8, -3, 14);
    this.p5.line(3, 8, 3, 14);
  }

  drawCapacitor(comp: CircuitComponent) {
    // Capacitor plates
    this.p5.fill(this.isDarkMode ? 60 : 220);
    this.p5.stroke(0);
    this.p5.strokeWeight(1.5);

    // Left plate
    this.p5.rect(-5, 0, 2, 16);

    // Right plate
    this.p5.rect(5, 0, 2, 16);

    // Connection wires
    this.p5.line(-15, 0, -6, 0);
    this.p5.line(15, 0, 6, 0);

    // Capacitance label
    this.p5.fill(0);
    this.p5.noStroke();
    this.p5.textSize(8);
    this.p5.text(`${comp.properties.capacitance || 100}μF`, 0, 20);
  }

  drawInductor(comp: CircuitComponent) {
    // Inductor body
    this.p5.noFill();
    this.p5.stroke(0);
    this.p5.strokeWeight(1.5);

    // Draw coil
    this.p5.line(-15, 0, -10, 0);
    this.p5.line(15, 0, 10, 0);

    // Draw coil loops
    const loopHeight = 6;
    const loopWidth = 5;
    this.p5.arc(-8, 0, loopWidth, loopHeight, 180, 360);
    this.p5.arc(-3, 0, loopWidth, loopHeight, 180, 360);
    this.p5.arc(2, 0, loopWidth, loopHeight, 180, 360);
    this.p5.arc(7, 0, loopWidth, loopHeight, 180, 360);

    // Inductance label
    this.p5.fill(0);
    this.p5.noStroke();
    this.p5.textSize(8);
    this.p5.text(`${comp.properties.inductance || 10}mH`, 0, 12);
  }

  // Update circuit state
  updateCircuitState(newState: CircuitState) {
    this.circuitState = newState;
  }

  // Update mode
  updateMode(newMode: CircuitMode) {
    this.mode = newMode;
  }

  // Update show current setting
  updateShowCurrent(show: boolean) {
    this.showCurrent = show;
  }

  // Set selected component
  setSelectedComponent(id: string | null) {
    this.selectedComponent = id;
  }

  // Set hovered component
  setHoveredComponent(id: string | null) {
    this.hoveredComponent = id;
  }

  // Creates a connection between two components
  createConnection(fromId: string, toId: string): Connection | null {
    const fromComponent = this.circuitState.components.find(
      (c) => c.id === fromId
    );
    const toComponent = this.circuitState.components.find((c) => c.id === toId);

    if (!fromComponent || !toComponent) return null;

    // Don't connect a component to itself
    if (fromId === toId) return null;

    // Check if connection already exists
    const connectionExists = this.circuitState.connections.some(
      (conn) =>
        (conn.from === fromId && conn.to === toId) ||
        (conn.from === toId && conn.to === fromId)
    );

    if (connectionExists) return null;

    // Create new connection
    const connection: Connection = {
      from: fromId,
      to: toId,
      fromPos: { x: fromComponent.x, y: fromComponent.y },
      toPos: { x: toComponent.x, y: toComponent.y },
      current: 0, // Will be calculated later
      voltage: 0, // Will be calculated later
    };

    return connection;
  }

  // Update circuit state with new component size/scale
  updateComponentScale(id: string, scale: number) {
    const updatedComponents = this.circuitState.components.map((comp) => {
      if (comp.id === id) {
        return {
          ...comp,
          properties: {
            ...comp.properties,
            scale: Math.max(0.5, Math.min(3.0, scale)), // Limit scale between 0.5 and 3.0
          },
        };
      }
      return comp;
    });

    this.updateCircuitState({
      ...this.circuitState,
      components: updatedComponents,
    });

    // Update connection points after resizing
    this.updateConnectionPoints();
  }

  // Check if a point is on a resize handle of a component
  isOnResizeHandle(componentId: string, x: number, y: number): boolean {
    const component = this.circuitState.components.find(
      (c) => c.id === componentId
    );
    if (!component) return false;

    const handleSize = 8;
    const compSize = this.getComponentSize(component);
    const scale = component.properties.scale || 1.0;
    const halfWidth = (compSize.width * scale) / 2;
    const halfHeight = (compSize.height * scale) / 2;

    // Check each corner handle
    const handles = [
      { x: component.x + halfWidth, y: component.y + halfHeight },
      { x: component.x - halfWidth, y: component.y + halfHeight },
      { x: component.x + halfWidth, y: component.y - halfHeight },
      { x: component.x - halfWidth, y: component.y - halfHeight },
    ];

    for (const handle of handles) {
      if (
        x >= handle.x - handleSize / 2 &&
        x <= handle.x + handleSize / 2 &&
        y >= handle.y - handleSize / 2 &&
        y <= handle.y + handleSize / 2
      ) {
        return true;
      }
    }

    return false;
  }
}
