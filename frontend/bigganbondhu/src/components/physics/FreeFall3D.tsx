import { Button } from "@heroui/button";
import { Html, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useEffect, useMemo, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import * as THREE from "three";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  CategoryScale
);

const FLOOR_Y = -2;
const UPDATE_INTERVAL = 0.016; // 60fps
const TRACE_UPDATE_INTERVAL = 0.05;
const MAX_SIMULATION_TIME = 10; // Maximum simulation time in seconds
const TIME_STEP = 0.1; // Data point interval for graphs
const MAX_DATA_POINTS = 100; // Maximum number of data points to show

interface FreeFall3DProps {
  initialHeight: number;
  initialVelocity: number;
  gravity: number;
}

function FreeFall3D({
  initialHeight,
  initialVelocity,
  gravity,
}: FreeFall3DProps) {
  const [position, setPosition] = useState([0, initialHeight, 0]);
  const [displacementData, setDisplacementData] = useState<number[]>([]);
  const [velocityData, setVelocityData] = useState<number[]>([]);
  const [timeData, setTimeData] = useState<number[]>([]);
  const traceGeometry = useRef<THREE.BufferGeometry>(
    new THREE.BufferGeometry()
  );

  const timeRef = useRef(0);
  const velocityRef = useRef(initialVelocity);
  const posYRef = useRef(initialHeight);
  const animationRef = useRef<number>();
  const [uiVelocity, setUiVelocity] = useState(initialVelocity);
  const [uiPosition, setUiPosition] = useState(initialHeight);
  const [isRunning, setIsRunning] = useState(false);
  const tracePositions: number[] = [];
  const graphsRef = useRef<HTMLDivElement>(null);

  // Add refs for both charts
  const displacementChartRef = useRef<any>(null);
  const velocityChartRef = useRef<any>(null);

  const update = () => {
    const delta = UPDATE_INTERVAL;
    const newTime = timeRef.current + delta;

    // Check if we should record a data point
    const shouldRecordData =
      Math.floor(newTime / TIME_STEP) > Math.floor(timeRef.current / TIME_STEP);

    timeRef.current = newTime;

    if (timeRef.current > MAX_SIMULATION_TIME) {
      cancelAnimationFrame(animationRef.current!);
      setIsRunning(false);
      return;
    }

    velocityRef.current = initialVelocity - gravity * timeRef.current;
    posYRef.current =
      initialHeight +
      initialVelocity * timeRef.current -
      0.5 * gravity * timeRef.current * timeRef.current;

    if (posYRef.current <= FLOOR_Y) {
      cancelAnimationFrame(animationRef.current!);
      setIsRunning(false);
      return;
    }

    setUiVelocity(velocityRef.current);
    setUiPosition(posYRef.current);
    setPosition([0, posYRef.current, 0]);

    // Only update graph data at fixed time intervals
    if (shouldRecordData) {
      setDisplacementData((prev) => {
        const newData = [...prev, initialHeight - posYRef.current];
        return newData.length > MAX_DATA_POINTS
          ? newData.slice(-MAX_DATA_POINTS)
          : newData;
      });
      setVelocityData((prev) => {
        const newData = [...prev, velocityRef.current];
        return newData.length > MAX_DATA_POINTS
          ? newData.slice(-MAX_DATA_POINTS)
          : newData;
      });
      setTimeData((prev) => {
        const newData = [...prev, Number(timeRef.current.toFixed(1))];
        return newData.length > MAX_DATA_POINTS
          ? newData.slice(-MAX_DATA_POINTS)
          : newData;
      });
    }

    if (
      Math.floor(timeRef.current / TRACE_UPDATE_INTERVAL) >
      tracePositions.length / 3
    ) {
      tracePositions.push(0, posYRef.current, 0);
      traceGeometry.current.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(tracePositions, 3)
      );
    }

    animationRef.current = requestAnimationFrame(update);
  };

  const startSimulation = () => {
    if (!isRunning) {
      setIsRunning(true);
      animationRef.current = requestAnimationFrame(update);
    }
  };

  const resetSimulation = () => {
    cancelAnimationFrame(animationRef.current!);
    timeRef.current = 0;
    velocityRef.current = initialVelocity;
    posYRef.current = initialHeight;
    setUiVelocity(initialVelocity);
    setUiPosition(initialHeight);
    setPosition([0, initialHeight, 0]);
    setDisplacementData([]);
    setVelocityData([]);
    setTimeData([]);
    traceGeometry.current = new THREE.BufferGeometry();
    setIsRunning(false);
  };

  // Reset when parameters change
  useEffect(() => {
    resetSimulation();
  }, [initialHeight, initialVelocity, gravity]);

  const exportAsImage = async () => {
    // Wait for charts to render
    await new Promise((resolve) => setTimeout(resolve, 100));
    // Get chart images
    const dispImg = displacementChartRef.current?.toBase64Image?.() || "";
    const velImg = velocityChartRef.current?.toBase64Image?.() || "";

    // Build export container
    const container = document.createElement("div");
    container.style.padding = "32px";
    container.style.background = "#fff";
    container.style.width = "1200px";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.color = "#222";
    container.style.borderRadius = "16px";
    container.style.boxShadow = "0 4px 24px rgba(0,0,0,0.08)";

    // Title and parameters
    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 2.2rem; font-weight: bold; margin-bottom: 8px; color: #1e293b;">Free Fall Simulation Results</h2>
        <div style="font-size: 1.1rem; margin-bottom: 10px;">
          <strong>Parameters:</strong>
          <ul style="margin: 6px 0 0 18px;">
            <li>Initial Height: <b>${initialHeight} m</b></li>
            <li>Initial Velocity: <b>${initialVelocity} m/s</b></li>
            <li>Gravity: <b>${gravity} m/s²</b></li>
          </ul>
        </div>
      </div>
    `;

    // Graphs row
    const graphsRow = document.createElement("div");
    graphsRow.style.display = "flex";
    graphsRow.style.gap = "32px";
    graphsRow.style.justifyContent = "center";
    graphsRow.style.marginBottom = "32px";

    // Displacement graph
    const dispDiv = document.createElement("div");
    dispDiv.style.flex = "1";
    dispDiv.style.textAlign = "center";
    dispDiv.innerHTML = `<div style='font-weight:600;font-size:1.1rem;margin-bottom:8px;color:#1e293b;'>Displacement vs Time</div><img src='${dispImg}' style='width:500px;max-width:100%;border:1px solid #ddd;border-radius:8px;background:#fff;'/>`;
    graphsRow.appendChild(dispDiv);

    // Velocity graph
    const velDiv = document.createElement("div");
    velDiv.style.flex = "1";
    velDiv.style.textAlign = "center";
    velDiv.innerHTML = `<div style='font-weight:600;font-size:1.1rem;margin-bottom:8px;color:#1e293b;'>Velocity vs Time</div><img src='${velImg}' style='width:500px;max-width:100%;border:1px solid #ddd;border-radius:8px;background:#fff;'/>`;
    graphsRow.appendChild(velDiv);

    container.appendChild(graphsRow);

    // Data table
    const dataTable = document.createElement("div");
    dataTable.style.marginTop = "12px";
    dataTable.innerHTML = `
      <h3 style="font-size:1.2rem;font-weight:bold;margin-bottom:10px;color:#1e293b;">Numerical Data</h3>
      <table style="width:100%;border-collapse:collapse;font-size:1.05rem;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:10px 8px;border:1px solid #e5e7eb;font-weight:bold;color:#222;">Time (s)</th>
            <th style="padding:10px 8px;border:1px solid #e5e7eb;font-weight:bold;color:#222;">Height (m)</th>
            <th style="padding:10px 8px;border:1px solid #e5e7eb;font-weight:bold;color:#222;">Velocity (m/s)</th>
          </tr>
        </thead>
        <tbody>
          ${timeData
            .map(
              (time, i) => `
            <tr>
              <td style="padding:8px;border:1px solid #e5e7eb;">${time.toFixed(2)}</td>
              <td style="padding:8px;border:1px solid #e5e7eb;">${(initialHeight - displacementData[i]).toFixed(2)}</td>
              <td style="padding:8px;border:1px solid #e5e7eb;">${velocityData[i].toFixed(2)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    container.appendChild(dataTable);

    document.body.appendChild(container);
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: "white",
      logging: false,
      width: 1200,
      height: container.offsetHeight,
    });
    document.body.removeChild(container);
    const link = document.createElement("a");
    link.download = "free-fall-simulation.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const exportAsPDF = async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const dispImg = displacementChartRef.current?.toBase64Image?.() || "";
    const velImg = velocityChartRef.current?.toBase64Image?.() || "";
    const container = document.createElement("div");
    container.style.padding = "32px";
    container.style.background = "#fff";
    container.style.width = "1200px";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.color = "#222";
    container.style.borderRadius = "16px";
    container.style.boxShadow = "0 4px 24px rgba(0,0,0,0.08)";
    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 2.2rem; font-weight: bold; margin-bottom: 8px; color: #1e293b;">Free Fall Simulation Results</h2>
        <div style="font-size: 1.1rem; margin-bottom: 10px;">
          <strong>Parameters:</strong>
          <ul style="margin: 6px 0 0 18px;">
            <li>Initial Height: <b>${initialHeight} m</b></li>
            <li>Initial Velocity: <b>${initialVelocity} m/s</b></li>
            <li>Gravity: <b>${gravity} m/s²</b></li>
          </ul>
        </div>
      </div>
    `;
    const graphsRow = document.createElement("div");
    graphsRow.style.display = "flex";
    graphsRow.style.gap = "32px";
    graphsRow.style.justifyContent = "center";
    graphsRow.style.marginBottom = "32px";
    const dispDiv = document.createElement("div");
    dispDiv.style.flex = "1";
    dispDiv.style.textAlign = "center";
    dispDiv.innerHTML = `<div style='font-weight:600;font-size:1.1rem;margin-bottom:8px;color:#1e293b;'>Displacement vs Time</div><img src='${dispImg}' style='width:500px;max-width:100%;border:1px solid #ddd;border-radius:8px;background:#fff;'/>`;
    graphsRow.appendChild(dispDiv);
    const velDiv = document.createElement("div");
    velDiv.style.flex = "1";
    velDiv.style.textAlign = "center";
    velDiv.innerHTML = `<div style='font-weight:600;font-size:1.1rem;margin-bottom:8px;color:#1e293b;'>Velocity vs Time</div><img src='${velImg}' style='width:500px;max-width:100%;border:1px solid #ddd;border-radius:8px;background:#fff;'/>`;
    graphsRow.appendChild(velDiv);
    container.appendChild(graphsRow);
    const dataTable = document.createElement("div");
    dataTable.style.marginTop = "12px";
    dataTable.innerHTML = `      <h3 style="font-size:1.2rem;font-weight:bold;margin-bottom:10px;color:#1e293b;">Numerical Data</h3>
      <table style="width:100%;border-collapse:collapse;font-size:1.05rem;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:10px 8px;border:1px solid #e5e7eb;font-weight:bold;color:#222;">Time (s)</th>
            <th style="padding:10px 8px;border:1px solid #e5e7eb;font-weight:bold;color:#222;">Height (m)</th>
            <th style="padding:10px 8px;border:1px solid #e5e7eb;font-weight:bold;color:#222;">Velocity (m/s)</th>
          </tr>
        </thead>
        <tbody>
          ${timeData
            .map(
              (time, i) => `
            <tr>
              <td style="padding:8px;border:1px solid #e5e7eb;">${time.toFixed(2)}</td>
              <td style="padding:8px;border:1px solid #e5e7eb;">${(initialHeight - displacementData[i]).toFixed(2)}</td>
              <td style="padding:8px;border:1px solid #e5e7eb;">${velocityData[i].toFixed(2)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    container.appendChild(dataTable);
    document.body.appendChild(container);
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: "white",
      logging: false,
      width: 1200,
      height: container.offsetHeight,
    });
    document.body.removeChild(container);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;
    pdf.addImage(
      imgData,
      "PNG",
      imgX,
      imgY,
      imgWidth * ratio,
      imgHeight * ratio
    );
    pdf.save("free-fall-simulation.pdf");
  };

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      animation: {
        duration: 0,
      },
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top" as const,
          labels: { color: "#374151", font: { size: 12 } },
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (context: any) => {
              const value = context.parsed.y;
              const label = context.dataset.label;
              return `${label}: ${value.toFixed(2)}`;
            },
          },
        },
      },
      scales: {
        x: {
          type: "linear" as const,
          title: { display: true, text: "Time (s)", color: "#6b7280" },
          ticks: {
            color: "#6b7280",
            callback: function (value: number | string) {
              return typeof value === "number" ? value.toFixed(1) : value;
            },
            maxTicksLimit: 10,
          },
          grid: { color: "rgba(107,114,128,0.2)" },
        },
        y: {
          type: "linear" as const,
          title: { display: true, text: "Value", color: "#6b7280" },
          ticks: {
            color: "#6b7280",
            callback: function (value: number | string) {
              return typeof value === "number" ? value.toFixed(1) : value;
            },
            maxTicksLimit: 8,
          },
          grid: { color: "rgba(107,114,128,0.2)" },
        },
      },
    }),
    []
  );

  return (
    <div className="min-h-screen p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-center">
        3D Free Fall Simulation
      </h2>
      <div className="flex justify-center gap-4 mb-4">
        <Button onClick={startSimulation} color="primary">
          Start
        </Button>
        <Button onClick={resetSimulation} color="secondary">
          Reset
        </Button>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full h-[400px] lg:h-[500px] flex-1">
          <Canvas shadows camera={{ position: [0, 6, 10], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
            <OrbitControls target={[0, 2, 0]} />
            <gridHelper args={[10, 10]} position={[0, FLOOR_Y + 0.05, 0]} />
            <mesh position={[0, FLOOR_Y, 0]} receiveShadow>
              <boxGeometry args={[10, 0.1, 10]} />
              <meshStandardMaterial color="#e5e7eb" />
            </mesh>
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  array={new Float32Array([0, FLOOR_Y, 0, 0, initialHeight, 0])}
                  count={2}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#f87171" />
            </line>
            <mesh position={position as [number, number, number]} castShadow>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial color="#3b82f6" />
            </mesh>
            <points>
              <primitive object={traceGeometry.current} />
              <pointsMaterial color="#60a5fa" size={0.1} />
            </points>
            <Html position={[2.5, 4, 0]}>
              <div className="bg-white dark:bg-gray-800 rounded px-3 py-2 shadow text-sm">
                <p>Time: {timeRef.current.toFixed(1)}s</p>
                <p>Height: {uiPosition.toFixed(1)}m</p>
                <p>Velocity: {uiVelocity.toFixed(1)}m/s</p>
              </div>
            </Html>
          </Canvas>
        </div>

        <div
          ref={graphsRef}
          className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          <div className="h-[250px]">
            <h3 className="text-base font-semibold text-center text-gray-800 dark:text-gray-200 mb-2">
              Displacement vs Time
            </h3>
            <Line
              ref={displacementChartRef}
              data={{
                labels: timeData,
                datasets: [
                  {
                    label: "Displacement (m)",
                    data: displacementData,
                    borderColor: "#f97316",
                    fill: true,
                    backgroundColor: "rgba(251, 191, 36, 0.2)",
                    tension: 0.3,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
          <div className="h-[250px]">
            <h3 className="text-base font-semibold text-center text-gray-800 dark:text-gray-200 mb-2">
              Velocity vs Time
            </h3>
            <Line
              ref={velocityChartRef}
              data={{
                labels: timeData,
                datasets: [
                  {
                    label: "Velocity (m/s)",
                    data: velocityData,
                    borderColor: "#10b981",
                    fill: true,
                    backgroundColor: "rgba(34, 197, 94, 0.2)",
                    tension: 0.3,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-4">
        <Button onClick={exportAsImage} color="primary">
          Export as PNG
        </Button>
        <Button onClick={exportAsPDF} color="secondary">
          Export as PDF
        </Button>
      </div>
    </div>
  );
}

export default FreeFall3D;
