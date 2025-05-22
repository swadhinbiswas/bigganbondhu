import { Html, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// DNA base pairs colors (used via ENZYME_COLORS below)
// Removed variable declaration as it's unused directly
// Color values:
// A: Blue (#1e88e5) - Adenine
// T: Red (#e53935) - Thymine
// G: Green (#43a047) - Guanine
// C: Yellow (#fdd835) - Cytosine

// Enzyme colors
const ENZYME_COLORS = {
  helicase: new THREE.Color("#9c27b0"), // Purple
  polymerase: new THREE.Color("#ff9800"), // Orange
  primase: new THREE.Color("#00bcd4"), // Cyan
  ligase: new THREE.Color("#8bc34a"), // Light Green
};

// Base pair types
type BasePair = {
  id: number;
  type1: "A" | "T" | "G" | "C";
  type2: "A" | "T" | "G" | "C";
  position: THREE.Vector3;
  rotation: THREE.Euler;
};

// Enzyme types
type Enzyme = {
  id: number;
  type: "helicase" | "polymerase" | "primase" | "ligase";
  position: [number, number, number];
  targetPosition: [number, number, number];
  active: boolean;
};

// Utility to convert array to Vector3
const toVector3 = (arr: [number, number, number]) => new THREE.Vector3(...arr);

// Complementary base pairs
const getComplementaryBase = (
  base: "A" | "T" | "G" | "C",
): "A" | "T" | "G" | "C" => {
  switch (base) {
    case "A":
      return "T";
    case "T":
      return "A";
    case "G":
      return "C";
    case "C":
      return "G";
  }
};

// Modify the DNA Strand component to simplify labels
const DNAStrand: React.FC<{
  basePairs: BasePair[];
  showLabels: boolean;
  language: "en" | "bn";
  replicationActive: boolean;
}> = ({ basePairs, showLabels, language }) => {
  // Removed unused replicationActive parameter
  // Simplify base names to just the letter codes in both languages
  const baseNames = {
    en: { A: "A", T: "T", G: "G", C: "C" },
    bn: { A: "এ", T: "টি", G: "জি", C: "সি" },
  };

  return (
    <group>
      {basePairs.map((basePair) => (
        <group
          key={basePair.id}
          position={basePair.position}
          rotation={basePair.rotation}
        >
          {/* Base 1 */}
          <mesh position={[0.3, 0, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial
              color={
                basePair.type1 === "A"
                  ? "#ff0000" // Red
                  : basePair.type1 === "T"
                    ? "#00ff00" // Green
                    : basePair.type1 === "G"
                      ? "#0000ff" // Blue
                      : "#ffff00" // Yellow
              }
            />
          </mesh>

          {/* Hydrogen Bond */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.6, 0.02, 0.02]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>

          {/* Base 2 */}
          <mesh position={[-0.3, 0, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial
              color={
                basePair.type2 === "A"
                  ? "#ff0000" // Red
                  : basePair.type2 === "T"
                    ? "#00ff00" // Green
                    : basePair.type2 === "G"
                      ? "#0000ff" // Blue
                      : "#ffff00" // Yellow
              }
            />
          </mesh>

          {/* Simplified labels if showLabels is true */}
          {showLabels && (
            <>
              <Html
                center
                position={[0.3, 0.1, 0]}
                style={{ pointerEvents: "none" }}
              >
                <div className="px-1 py-0 rounded bg-white bg-opacity-70 dark:bg-gray-900 dark:bg-opacity-70 text-xs font-medium text-gray-900 dark:text-gray-100">
                  {baseNames[language][basePair.type1]}
                </div>
              </Html>
              <Html
                center
                position={[-0.3, 0.1, 0]}
                style={{ pointerEvents: "none" }}
              >
                <div className="px-1 py-0 rounded bg-white bg-opacity-70 dark:bg-gray-900 dark:bg-opacity-70 text-xs font-medium text-gray-900 dark:text-gray-100">
                  {baseNames[language][basePair.type2]}
                </div>
              </Html>
            </>
          )}

          {/* Backbone connections */}
          {basePair.id > 0 && (
            <>
              {/* Right backbone */}
              <mesh position={[0.3, 0.25, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
                <meshStandardMaterial color="#888888" />
              </mesh>
              {/* Left backbone */}
              <mesh position={[-0.3, 0.25, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
                <meshStandardMaterial color="#888888" />
              </mesh>
            </>
          )}
        </group>
      ))}
    </group>
  );
};

// Modify the EnzymeComponent to simplify labels
const EnzymeComponent: React.FC<{
  enzyme: Enzyme;
  showLabels: boolean;
  language: "en" | "bn";
}> = ({ enzyme, showLabels, language }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Simplify enzyme names to shorter versions
  const enzymeNames = {
    en: {
      helicase: "H",
      polymerase: "P",
      primase: "Pr",
      ligase: "L",
    },
    bn: {
      helicase: "হে",
      polymerase: "পলি",
      primase: "প্রাই",
      ligase: "লাই",
    },
  };

  // Different shapes for different enzymes
  let geometry;

  switch (enzyme.type) {
    case "helicase":
      geometry = <icosahedronGeometry args={[0.2, 1]} />;
      break;
    case "polymerase":
      geometry = <boxGeometry args={[0.2, 0.2, 0.2]} />;
      break;
    case "primase":
      geometry = <tetrahedronGeometry args={[0.2, 0]} />;
      break;
    case "ligase":
      geometry = <octahedronGeometry args={[0.2, 0]} />;
      break;
  }

  return (
    <group position={enzyme.position}>
      <mesh ref={meshRef}>
        {geometry}
        <meshStandardMaterial
          color={ENZYME_COLORS[enzyme.type]}
          emissive={ENZYME_COLORS[enzyme.type]}
          emissiveIntensity={enzyme.active ? 0.5 : 0}
        />
      </mesh>

      {showLabels && (
        <Html center position={[0, 0.3, 0]} style={{ pointerEvents: "none" }}>
          <div className="px-1 py-0 rounded bg-white bg-opacity-70 dark:bg-gray-900 dark:bg-opacity-70 text-xs font-medium text-gray-900 dark:text-gray-100">
            {enzymeNames[language][enzyme.type]}
          </div>
        </Html>
      )}
    </group>
  );
};

// Quiz component
const QuizMode: React.FC<{
  onAnswerSubmit: (correct: boolean) => void;
  language: "en" | "bn";
}> = ({ onAnswerSubmit, language }) => {
  const [quizBase, setQuizBase] = useState<"A" | "T" | "G" | "C">(() => {
    const bases = ["A", "T", "G", "C"] as const;

    return bases[Math.floor(Math.random() * 4)];
  });
  const [selectedBase, setSelectedBase] = useState<
    "A" | "T" | "G" | "C" | null
  >(null);

  const texts = {
    en: {
      question: "Which base pairs with",
      submit: "Submit",
      title: "DNA Quiz",
    },
    bn: {
      question: "কোন বেস যুক্ত হবে",
      submit: "জমা দিন",
      title: "ডিএনএ কুইজ",
    },
  };

  const handleSubmit = () => {
    if (selectedBase) {
      const correct = selectedBase === getComplementaryBase(quizBase);

      onAnswerSubmit(correct);
      // Generate new question
      const bases = ["A", "T", "G", "C"] as const;

      setQuizBase(bases[Math.floor(Math.random() * 4)]);
      setSelectedBase(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md w-64 text-gray-900 dark:text-gray-100">
      <h3 className="text-lg font-bold mb-2 text-center">
        {texts[language].title}
      </h3>
      <p className="mb-4 text-center">
        {texts[language].question}{" "}
        <span className="font-bold text-lg">{quizBase}</span>?
      </p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {(["A", "T", "G", "C"] as const).map((base) => (
          <button
            key={base}
            className={`p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-blue-200 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 transition`}
            onClick={() => setSelectedBase(base)}
          >
            {base}
          </button>
        ))}
      </div>

      <button
        className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 transition"
        disabled={!selectedBase}
        onClick={handleSubmit}
      >
        {texts[language].submit}
      </button>
    </div>
  );
};

// Controls component
const SimulationControls: React.FC<{
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  showLabels: boolean;
  setShowLabels: (show: boolean) => void;
  language: "en" | "bn";
  setLanguage: (lang: "en" | "bn") => void;
  showQuiz: boolean;
  setShowQuiz: (show: boolean) => void;
  currentPhase: string;
}> = ({
  playing,
  setPlaying,
  speed,
  setSpeed,
  showLabels,
  setShowLabels,
  language,
  setLanguage,
  showQuiz,
  setShowQuiz,
  currentPhase,
}) => {
  const texts = {
    en: {
      play: "Play",
      pause: "Pause",
      speed: "Speed",
      labels: "Labels",
      quiz: "Quiz Mode",
      language: "English",
      phase: "Phase",
    },
    bn: {
      play: "চালু",
      pause: "বিরতি",
      speed: "গতি",
      labels: "লেবেল",
      quiz: "কুইজ মোড",
      language: "বাংলা",
      phase: "পর্যায়",
    },
  };

  const phases = {
    en: {
      initiation: "Initiation",
      elongation: "Elongation",
      termination: "Termination",
    },
    bn: {
      initiation: "ইনিশিয়েশন",
      elongation: "এলঙ্গেশন",
      termination: "টার্মিনেশন",
    },
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md text-gray-900 dark:text-gray-100">
      <div className="flex gap-2 mb-4">
        <button
          className={`flex-1 py-2 px-4 rounded-md ${
            playing
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          } text-white`}
          onClick={() => setPlaying(!playing)}
        >
          {playing ? texts[language].pause : texts[language].play}
        </button>

        <button
          className={`py-2 px-4 rounded-md ${
            language === "en" ? "bg-blue-500" : "bg-purple-500"
          } text-white hover:opacity-90`}
          onClick={() => setLanguage(language === "en" ? "bn" : "en")}
        >
          {language === "en" ? "বাংলা" : "English"}
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          {texts[language].speed}
        </label>
        <input
          className="w-full bg-gray-200 dark:bg-gray-700"
          max="2"
          min="0.1"
          step="0.1"
          type="range"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <label className="flex items-center cursor-pointer mr-4">
          <input
            checked={showLabels}
            className="form-checkbox accent-blue-500 dark:accent-blue-400"
            type="checkbox"
            onChange={() => setShowLabels(!showLabels)}
          />
          <span className="ml-2">Labels</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            checked={showQuiz}
            className="form-checkbox accent-green-500 dark:accent-green-400"
            type="checkbox"
            onChange={() => setShowQuiz(!showQuiz)}
          />
          <span className="ml-2">Quiz Mode</span>
        </label>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
        <div className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Phase
        </div>
        <div className="font-bold text-gray-800 dark:text-gray-100">
          {phases[language][currentPhase as keyof typeof phases.en]}
        </div>
      </div>
    </div>
  );
};

// Main DNA Simulation component
const DNASimulation: React.FC<{
  onPartClick?: (part: {
    id: string;
    name: string;
    description: string;
    position: number[];
  }) => void;
}> = ({ onPartClick }) => {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showLabels, setShowLabels] = useState(false); // Default to false
  const [language, setLanguage] = useState<"en" | "bn">("en");
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    show: boolean;
    correct: boolean;
  } | null>(null);
  const [currentPhase, setCurrentPhase] = useState<
    "initiation" | "elongation" | "termination"
  >("initiation");
  const [replicationProgress, setReplicationProgress] = useState(0);

  // DNA structure
  const [basePairs, setBasePairs] = useState<BasePair[]>([]);
  const [enzymes, setEnzymes] = useState<Enzyme[]>([]);

  // Fullscreen state and ref
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Add animation ref for frame management
  const animationRef = useRef<number | null>(null);

  // Animation logic for enzymes (state-driven)
  useEffect(() => {
    if (!playing || basePairs.length === 0) return;

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [playing, speed, basePairs.length, replicationProgress]);

  // Fix the animate function for better enzyme coordination
  const animate = () => {
    if (!playing) return;

    const deltaTime = 0.016 * speed; // ~60fps with speed multiplier

    // Ensure progress stays within bounds and wraps correctly
    setReplicationProgress((prev) => {
      const newProgress = prev + deltaTime * 0.01;

      // Phase transitions
      if (newProgress < 0.3) {
        setCurrentPhase("initiation");
      } else if (newProgress < 0.8) {
        setCurrentPhase("elongation");
      } else {
        setCurrentPhase("termination");
      }

      return newProgress > 1 ? 0 : newProgress;
    });

    // Update enzyme positions more smoothly with better easing
    setEnzymes((prevEnzymes) =>
      prevEnzymes.map((enzyme) => {
        // Calculate current position based on target with smooth interpolation
        const currentPos = toVector3(enzyme.position);
        const targetPos = toVector3(enzyme.targetPosition);

        // Use smooth interpolation for position
        const lerpFactor = 0.05 * speed; // Adjust based on speed
        const newX = currentPos.x + (targetPos.x - currentPos.x) * lerpFactor;
        const newY = currentPos.y + (targetPos.y - currentPos.y) * lerpFactor;
        const newZ = currentPos.z + (targetPos.z - currentPos.z) * lerpFactor;

        return {
          ...enzyme,
          position: [newX, newY, newZ] as [number, number, number],
        };
      }),
    );

    // Coordinate enzyme targets based on replication phase
    setEnzymes((prevEnzymes) => {
      return prevEnzymes.map((enzyme) => {
        let newTarget: [number, number, number] = enzyme.targetPosition;

        if (replicationProgress < 0.3) {
          // Initiation phase - helicase active
          const targetPairIndex = Math.floor(
            replicationProgress * 3 * basePairs.length,
          );

          if (
            enzyme.type === "helicase" &&
            targetPairIndex < basePairs.length
          ) {
            // Better positioning for helicase along the DNA strand
            const targetPosition = basePairs[
              targetPairIndex
            ].position.toArray() as [number, number, number];

            // Add slight offset for better visual positioning
            newTarget = [
              targetPosition[0],
              targetPosition[1] + 0.1,
              targetPosition[2],
            ];
          }
        } else if (replicationProgress < 0.8) {
          // Elongation phase - polymerase and primase active
          const progress = (replicationProgress - 0.3) / 0.5;
          const targetPairIndex = Math.floor(progress * basePairs.length);

          // Better coordination between polymerase and primase
          if (targetPairIndex < basePairs.length) {
            const basePosition = basePairs[
              targetPairIndex
            ].position.toArray() as [number, number, number];

            if (enzyme.type === "polymerase") {
              // Position polymerase on the leading strand
              newTarget = [
                basePosition[0] + 0.5,
                basePosition[1],
                basePosition[2],
              ];
            } else if (enzyme.type === "primase") {
              // Position primase on the lagging strand with offset
              newTarget = [
                basePosition[0] - 0.5,
                basePosition[1],
                basePosition[2] - 0.2,
              ];
            } else if (enzyme.type === "helicase") {
              // Keep helicase ahead of the replication fork
              newTarget = [
                basePosition[0],
                basePosition[1] + 0.5,
                basePosition[2],
              ];
            }
          }
        } else {
          // Termination phase - ligase active
          const progress = (replicationProgress - 0.8) / 0.2;
          const targetPairIndex = Math.floor(progress * basePairs.length);

          if (enzyme.type === "ligase" && targetPairIndex < basePairs.length) {
            const basePosition = basePairs[
              targetPairIndex
            ].position.toArray() as [number, number, number];

            // Position ligase to connect Okazaki fragments
            newTarget = [
              basePosition[0],
              basePosition[1] - 0.2,
              basePosition[2],
            ];
          } else if (
            enzyme.type === "polymerase" ||
            enzyme.type === "primase" ||
            enzyme.type === "helicase"
          ) {
            // Move other enzymes to the end of the DNA strand when terminating
            if (basePairs.length > 0) {
              const lastPair = basePairs[basePairs.length - 1];
              const lastPos = lastPair.position.toArray() as [
                number,
                number,
                number,
              ];

              // Different offsets for different enzymes
              const offsetMap = {
                polymerase: [0.5, 0.5, 0],
                primase: [-0.5, 0.5, 0],
                helicase: [0, 1, 0],
              };

              const offset = offsetMap[enzyme.type];

              newTarget = [
                lastPos[0] + offset[0],
                lastPos[1] + offset[1],
                lastPos[2] + offset[2],
              ];
            }
          }
        }

        return {
          ...enzyme,
          targetPosition: newTarget,
          active:
            JSON.stringify(enzyme.targetPosition) !== JSON.stringify(newTarget), // Activate enzyme when moving to a new target
        };
      });
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  // Handle quiz answers
  const handleQuizAnswer = (correct: boolean) => {
    setQuizResult({ show: true, correct });

    // Hide the result after 2 seconds
    setTimeout(() => {
      setQuizResult(null);
    }, 2000);
  };

  // Fullscreen handlers
  const handleFullscreenToggle = () => {
    if (!isFullscreen) {
      if (containerRef.current) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          (containerRef.current as any).webkitRequestFullscreen();
        }
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(
        !!document.fullscreenElement &&
          containerRef.current === document.fullscreenElement,
      );
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        onFullscreenChange,
      );
    };
  }, []);

  // Initialize DNA structure
  useEffect(() => {
    // Create a double helix structure with 20 base pairs
    const dnaLength = 20;
    const newBasePairs: BasePair[] = [];
    const basePairTypes: Array<"A" | "T" | "G" | "C"> = ["A", "T", "G", "C"];

    for (let i = 0; i < dnaLength; i++) {
      // Randomly select base type
      const baseIndex = Math.floor(Math.random() * 4);
      const baseType1 = basePairTypes[baseIndex];
      const baseType2 = getComplementaryBase(baseType1);

      // Calculate position in a helix
      const angle = (i / dnaLength) * Math.PI * 4; // 2 full turns
      const y = i * 0.3 - (dnaLength * 0.3) / 2; // Distribute along y-axis
      const x = Math.cos(angle) * 0.5;
      const z = Math.sin(angle) * 0.5;

      newBasePairs.push({
        id: i,
        type1: baseType1,
        type2: baseType2,
        position: new THREE.Vector3(x, y, z),
        rotation: new THREE.Euler(0, angle, 0),
      });
    }

    setBasePairs(newBasePairs);

    // Initialize enzymes with array positions
    setEnzymes([
      {
        id: 1,
        type: "helicase",
        position: [0, -2, 0],
        targetPosition: [0, -2, 0],
        active: false,
      },
      {
        id: 2,
        type: "polymerase",
        position: [1, -2, 0],
        targetPosition: [1, -2, 0],
        active: false,
      },
      {
        id: 3,
        type: "primase",
        position: [-1, -2, 0],
        targetPosition: [-1, -2, 0],
        active: false,
      },
      {
        id: 4,
        type: "ligase",
        position: [0, -3, 0],
        targetPosition: [0, -3, 0],
        active: false,
      },
    ]);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[600px] bg-gradient-to-b from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg overflow-hidden${isFullscreen ? " z-50" : ""}`}
      style={
        isFullscreen ? { height: "100vh", width: "100vw", borderRadius: 0 } : {}
      }
    >
      {/* Fullscreen toggle button */}
      <button
        aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        className="absolute top-4 right-4 z-20 bg-white dark:bg-gray-900 bg-opacity-80 dark:bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100 dark:hover:bg-opacity-100 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 flex items-center justify-center"
        style={{ fontSize: 22 }}
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        onClick={handleFullscreenToggle}
      >
        {isFullscreen ? (
          // Exit fullscreen SVG icon
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polyline points="9 9 3 9 3 3" />
            <polyline points="15 9 21 9 21 3" />
            <polyline points="15 15 21 15 21 21" />
            <polyline points="9 15 3 15 3 21" />
          </svg>
        ) : (
          // Enter fullscreen SVG icon
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polyline points="4 4 10 4 10 10" />
            <polyline points="20 4 14 4 14 10" />
            <polyline points="14 20 14 14 20 14" />
            <polyline points="4 20 10 20 10 14" />
          </svg>
        )}
      </button>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight intensity={1} position={[10, 10, 10]} />
        <pointLight intensity={0.5} position={[-10, -10, -10]} />

        {/* DNA Strand */}
        <DNAStrand
          basePairs={basePairs}
          language={language}
          replicationActive={playing && replicationProgress > 0.3}
          showLabels={showLabels}
        />

        {/* Enzymes */}
        {enzymes.map((enzyme) => (
          <EnzymeComponent
            key={enzyme.id}
            enzyme={enzyme}
            language={language}
            showLabels={showLabels}
          />
        ))}

        {/* Controls */}
        <OrbitControls enablePan={true} enableRotate={true} enableZoom={true} />

        {/* Part clicking handler for integration with main app */}
        {onPartClick &&
          basePairs.map((pair, index) => (
            <mesh
              key={`clickable-${index}`}
              position={pair.position}
              onClick={(e) => {
                e.stopPropagation();
                onPartClick({
                  id: `base-pair-${index}`,
                  name: `Base Pair ${index + 1}`,
                  description: `${pair.type1}-${pair.type2} base pair at position ${index + 1}`,
                  position: pair.position.toArray(),
                });
              }}
            >
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          ))}
      </Canvas>

      {/* UI Controls overlay */}
      <div className="absolute top-4 right-4 z-10">
        <SimulationControls
          currentPhase={currentPhase}
          language={language}
          playing={playing}
          setLanguage={setLanguage}
          setPlaying={setPlaying}
          setShowLabels={setShowLabels}
          setShowQuiz={setShowQuiz}
          setSpeed={setSpeed}
          showLabels={showLabels}
          showQuiz={showQuiz}
          speed={speed}
        />
      </div>

      {/* Quiz overlay */}
      {showQuiz && (
        <div className="absolute bottom-4 left-4 z-10">
          <QuizMode language={language} onAnswerSubmit={handleQuizAnswer} />
        </div>
      )}

      {/* Quiz result notification */}
      {quizResult && (
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20
          py-3 px-6 rounded-lg shadow-lg text-xl font-bold
          ${quizResult.correct ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
        >
          {quizResult.correct
            ? language === "en"
              ? "Correct!"
              : "সঠিক!"
            : language === "en"
              ? "Try Again!"
              : "আবার চেষ্টা করুন!"}
        </div>
      )}
    </div>
  );
};

export default DNASimulation;
