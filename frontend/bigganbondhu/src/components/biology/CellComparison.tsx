import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// Define the types for cell parts
interface CellPart {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  color: string;
  position: [number, number, number];
  scale: [number, number, number];
  geometry: "sphere" | "ellipsoid" | "tube" | "custom";
  rotation?: [number, number, number];
}

interface CellType {
  id: string;
  name: string;
  nameBn: string;
  parts: CellPart[];
}

// Plant cell parts
const plantCellParts: CellPart[] = [
  {
    id: "cell-wall",
    name: "Cell Wall",
    nameBn: "কোষ প্রাচীর",
    description:
      "A rigid layer outside the cell membrane that provides structure and protection.",
    descriptionBn:
      "কোষ ঝিল্লির বাইরে একটি শক্ত স্তর যা গঠন ও সুরক্ষা প্রদান করে।",
    color: "#8BC34A",
    position: [0, 0, 0],
    scale: [3.2, 3.2, 3.2],
    geometry: "sphere",
  },
  {
    id: "cell-membrane",
    name: "Cell Membrane",
    nameBn: "কোষ ঝিল্লি",
    description: "Controls what enters and exits the cell.",
    descriptionBn: "কোষে কি প্রবেশ করবে ও কি বের হবে তা নিয়ন্ত্রণ করে।",
    color: "#FFB74D",
    position: [0, 0, 0],
    scale: [3, 3, 3],
    geometry: "sphere",
  },
  {
    id: "nucleus",
    name: "Nucleus",
    nameBn: "নিউক্লিয়াস",
    description: "Contains the cell's DNA and controls cell activities.",
    descriptionBn: "কোষের DNA ধারণ করে এবং কোষের কার্যকলাপ নিয়ন্ত্রণ করে।",
    color: "#7986CB",
    position: [0, 0, 0],
    scale: [1, 1, 1],
    geometry: "sphere",
  },
  {
    id: "chloroplast",
    name: "Chloroplast",
    nameBn: "ক্লোরোপ্লাস্ট",
    description: "Contains chlorophyll and is responsible for photosynthesis.",
    descriptionBn: "ক্লোরোফিল ধারণ করে এবং সালোকসংশ্লেষণের জন্য দায়ী।",
    color: "#4CAF50",
    position: [1, 0.8, 0.5],
    scale: [0.6, 0.4, 0.2],
    geometry: "ellipsoid",
    rotation: [0, 0, Math.PI / 4],
  },
  {
    id: "chloroplast2",
    name: "Chloroplast",
    nameBn: "ক্লোরোপ্লাস্ট",
    description: "Contains chlorophyll and is responsible for photosynthesis.",
    descriptionBn: "ক্লোরোফিল ধারণ করে এবং সালোকসংশ্লেষণের জন্য দায়ী।",
    color: "#4CAF50",
    position: [-1, -0.5, 0.8],
    scale: [0.6, 0.4, 0.2],
    geometry: "ellipsoid",
    rotation: [0, Math.PI / 6, Math.PI / 3],
  },
  {
    id: "chloroplast3",
    name: "Chloroplast",
    nameBn: "ক্লোরোপ্লাস্ট",
    description: "Contains chlorophyll and is responsible for photosynthesis.",
    descriptionBn: "ক্লোরোফিল ধারণ করে এবং সালোকসংশ্লেষণের জন্য দায়ী।",
    color: "#4CAF50",
    position: [0.5, -1, 0.3],
    scale: [0.6, 0.4, 0.2],
    geometry: "ellipsoid",
    rotation: [Math.PI / 5, 0, Math.PI / 5],
  },
  {
    id: "vacuole",
    name: "Central Vacuole",
    nameBn: "কেন্দ্রীয় রসধানী",
    description: "Stores water, nutrients, and waste products.",
    descriptionBn: "পানি, পুষ্টি এবং বর্জ্য পদার্থ সঞ্চয় করে।",
    color: "#81D4FA",
    position: [0, 0, 0.3],
    scale: [1.8, 1.8, 1.8],
    geometry: "sphere",
  },
  {
    id: "mitochondria",
    name: "Mitochondria",
    nameBn: "মাইটোকন্ড্রিয়া",
    description: "Converts energy from food into a form the cell can use.",
    descriptionBn:
      "খাদ্য থেকে শক্তিকে এমন রূপে পরিবর্তন করে যা কোষ ব্যবহার করতে পারে।",
    color: "#FF5252",
    position: [1.3, -0.7, 0],
    scale: [0.5, 0.3, 0.3],
    geometry: "ellipsoid",
    rotation: [0, 0, Math.PI / 4],
  },
  {
    id: "mitochondria2",
    name: "Mitochondria",
    nameBn: "মাইটোকন্ড্রিয়া",
    description: "Converts energy from food into a form the cell can use.",
    descriptionBn:
      "খাদ্য থেকে শক্তিকে এমন রূপে পরিবর্তন করে যা কোষ ব্যবহার করতে পারে।",
    color: "#FF5252",
    position: [-1.5, 0.5, 0],
    scale: [0.5, 0.3, 0.3],
    geometry: "ellipsoid",
    rotation: [0, 0, -Math.PI / 3],
  },
  {
    id: "golgi",
    name: "Golgi Apparatus",
    nameBn: "গলজি বডি",
    description: "Packages proteins for transport within or outside the cell.",
    descriptionBn: "কোষের ভিতরে বা বাইরে পরিবহনের জন্য প্রোটিন প্যাকেজ করে।",
    color: "#FFEB3B",
    position: [-1, 1, 0],
    scale: [0.6, 0.4, 0.2],
    geometry: "ellipsoid",
  },
  {
    id: "er",
    name: "Endoplasmic Reticulum",
    nameBn: "এন্ডোপ্লাজমিক রেটিকুলাম",
    description:
      "A network of membranes involved in protein synthesis and lipid metabolism.",
    descriptionBn:
      "প্রোটিন সংশ্লেষণ এবং লিপিড বিপাকে জড়িত ঝিল্লির নেটওয়ার্ক।",
    color: "#CE93D8",
    position: [0.8, 0, -0.8],
    scale: [1, 0.2, 0.8],
    geometry: "tube",
    rotation: [Math.PI / 6, 0, Math.PI / 4],
  },
];

// Animal cell parts
const animalCellParts: CellPart[] = [
  {
    id: "cell-membrane",
    name: "Cell Membrane",
    nameBn: "কোষ ঝিল্লি",
    description: "Controls what enters and exits the cell.",
    descriptionBn: "কোষে কি প্রবেশ করবে ও কি বের হবে তা নিয়ন্ত্রণ করে।",
    color: "#FFB74D",
    position: [0, 0, 0],
    scale: [3, 3, 3],
    geometry: "sphere",
  },
  {
    id: "nucleus",
    name: "Nucleus",
    nameBn: "নিউক্লিয়াস",
    description: "Contains the cell's DNA and controls cell activities.",
    descriptionBn: "কোষের DNA ধারণ করে এবং কোষের কার্যকলাপ নিয়ন্ত্রণ করে।",
    color: "#7986CB",
    position: [0, 0, 0],
    scale: [1, 1, 1],
    geometry: "sphere",
  },
  {
    id: "mitochondria",
    name: "Mitochondria",
    nameBn: "মাইটোকন্ড্রিয়া",
    description: "Converts energy from food into a form the cell can use.",
    descriptionBn:
      "খাদ্য থেকে শক্তিকে এমন রূপে পরিবর্তন করে যা কোষ ব্যবহার করতে পারে।",
    color: "#FF5252",
    position: [1, -0.5, 0],
    scale: [0.5, 0.3, 0.3],
    geometry: "ellipsoid",
    rotation: [0, 0, Math.PI / 4],
  },
  {
    id: "mitochondria2",
    name: "Mitochondria",
    nameBn: "মাইটোকন্ড্রিয়া",
    description: "Converts energy from food into a form the cell can use.",
    descriptionBn:
      "খাদ্য থেকে শক্তিকে এমন রূপে পরিবর্তন করে যা কোষ ব্যবহার করতে পারে।",
    color: "#FF5252",
    position: [-1.2, 0.7, 0.2],
    scale: [0.5, 0.3, 0.3],
    geometry: "ellipsoid",
    rotation: [0, 0, -Math.PI / 3],
  },
  {
    id: "mitochondria3",
    name: "Mitochondria",
    nameBn: "মাইটোকন্ড্রিয়া",
    description: "Converts energy from food into a form the cell can use.",
    descriptionBn:
      "খাদ্য থেকে শক্তিকে এমন রূপে পরিবর্তন করে যা কোষ ব্যবহার করতে পারে।",
    color: "#FF5252",
    position: [0.2, 1.2, -0.3],
    scale: [0.5, 0.3, 0.3],
    geometry: "ellipsoid",
    rotation: [Math.PI / 6, 0, Math.PI / 2],
  },
  {
    id: "golgi",
    name: "Golgi Apparatus",
    nameBn: "গলজি বডি",
    description: "Packages proteins for transport within or outside the cell.",
    descriptionBn: "কোষের ভিতরে বা বাইরে পরিবহনের জন্য প্রোটিন প্যাকেজ করে।",
    color: "#FFEB3B",
    position: [-1, 0, 0.5],
    scale: [0.6, 0.4, 0.2],
    geometry: "ellipsoid",
  },
  {
    id: "er",
    name: "Endoplasmic Reticulum",
    nameBn: "এন্ডোপ্লাজমিক রেটিকুলাম",
    description:
      "A network of membranes involved in protein synthesis and lipid metabolism.",
    descriptionBn:
      "প্রোটিন সংশ্লেষণ এবং লিপিড বিপাকে জড়িত ঝিল্লির নেটওয়ার্ক।",
    color: "#CE93D8",
    position: [0.5, -0.5, -0.8],
    scale: [1, 0.2, 0.8],
    geometry: "tube",
    rotation: [Math.PI / 6, 0, Math.PI / 4],
  },
  {
    id: "lysosome",
    name: "Lysosome",
    nameBn: "লাইসোসোম",
    description:
      "Contains digestive enzymes to break down waste and cellular debris.",
    descriptionBn:
      "বর্জ্য ও কোষীয় ধ্বংসাবশেষ ভেঙে ফেলতে পাচক এনজাইম ধারণ করে।",
    color: "#F06292",
    position: [1.3, 0.8, -0.2],
    scale: [0.3, 0.3, 0.3],
    geometry: "sphere",
  },
  {
    id: "lysosome2",
    name: "Lysosome",
    nameBn: "লাইসোসোম",
    description:
      "Contains digestive enzymes to break down waste and cellular debris.",
    descriptionBn:
      "বর্জ্য ও কোষীয় ধ্বংসাবশেষ ভেঙে ফেলতে পাচক এনজাইম ধারণ করে।",
    color: "#F06292",
    position: [-0.8, -1, 0],
    scale: [0.35, 0.35, 0.35],
    geometry: "sphere",
  },
  {
    id: "centrosome",
    name: "Centrosome",
    nameBn: "সেন্ট্রোসোম",
    description: "Organizes the assembly of microtubules during cell division.",
    descriptionBn: "কোষ বিভাজনের সময় মাইক্রোটিউবুলের সমাবেশ সংগঠিত করে।",
    color: "#9575CD",
    position: [0, 0.8, 0.8],
    scale: [0.4, 0.4, 0.4],
    geometry: "sphere",
  },
];

// Define cell types
const cellTypes: CellType[] = [
  {
    id: "plant",
    name: "Plant Cell",
    nameBn: "উদ্ভিদ কোষ",
    parts: plantCellParts,
  },
  {
    id: "animal",
    name: "Animal Cell",
    nameBn: "প্রাণী কোষ",
    parts: animalCellParts,
  },
];

// Custom geometry components
const Ellipsoid = ({
  scale,
  color,
}: {
  scale: [number, number, number];
  color: string;
}) => {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 16]} />
      <meshStandardMaterial color={color} transparent opacity={0.8} />
      <mesh scale={scale} />
    </mesh>
  );
};

const Tube = ({
  scale,
  color,
  rotation,
}: {
  scale: [number, number, number];
  color: string;
  rotation?: [number, number, number];
}) => {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(-0.5, 0.5, 0),
    new THREE.Vector3(0.5, -0.5, 0),
    new THREE.Vector3(1, 0, 0),
  ]);

  return (
    <mesh rotation={rotation ? new THREE.Euler(...rotation) : undefined}>
      <tubeGeometry args={[curve, 64, 0.1, 8, false]} />
      <meshStandardMaterial color={color} transparent opacity={0.8} />
      <mesh scale={scale} />
    </mesh>
  );
};

// Cell part component
const CellPart = ({
  part,
  onClick,
}: {
  part: CellPart;
  onClick: (part: CellPart) => void;
}) => {
  const { position, scale, color, geometry, rotation = [0, 0, 0] } = part;

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick(part);
      }}
    >
      {geometry === "sphere" && (
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color={color} transparent opacity={0.8} />
          <mesh scale={scale} />
        </mesh>
      )}
      {geometry === "ellipsoid" && <Ellipsoid scale={scale} color={color} />}
      {geometry === "tube" && (
        <Tube scale={scale} color={color} rotation={rotation} />
      )}
    </group>
  );
};

// Cell component
const Cell = ({
  cellType,
  position,
  onClick,
}: {
  cellType: CellType;
  position: [number, number, number];
  onClick: (part: CellPart) => void;
}) => {
  return (
    <group position={position}>
      {/* Cell label */}
      <Html position={[0, 3.5, 0]} center>
        <div className="text-center">
          <div className="text-lg font-bold">{cellType.nameBn}</div>
          <div className="text-sm">{cellType.name}</div>
        </div>
      </Html>

      {/* Cell parts */}
      {cellType.parts.map((part) => (
        <CellPart key={part.id} part={part} onClick={onClick} />
      ))}
    </group>
  );
};

// Cell comparison scene
const CellComparisonScene = ({
  onSelectPart,
}: {
  onSelectPart: (part: CellPart) => void;
}) => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 15);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={0.8} />
      <Cell
        cellType={cellTypes[0]}
        position={[-5, 0, 0]}
        onClick={onSelectPart}
      />
      <Cell
        cellType={cellTypes[1]}
        position={[5, 0, 0]}
        onClick={onSelectPart}
      />

      {/* Divider line */}
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[0.05, 10]} />
        <meshBasicMaterial color="#ccc" transparent opacity={0.5} />
      </mesh>

      <OrbitControls enableDamping dampingFactor={0.25} />
    </>
  );
};

// Tooltip component
interface TooltipProps {
  part: CellPart | null;
  onClose: () => void;
}

const Tooltip = ({ part, onClose }: TooltipProps) => {
  if (!part) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 rounded-lg p-4 shadow-lg z-10">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        ×
      </button>
      <div className="flex items-center mb-2">
        <div
          className="w-4 h-4 mr-2 rounded-full"
          style={{ backgroundColor: part.color }}
        />
        <h3 className="text-lg font-bold">
          {part.nameBn}{" "}
          <span className="text-sm font-normal text-gray-500">
            ({part.name})
          </span>
        </h3>
      </div>
      <p className="mb-2">{part.descriptionBn}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {part.description}
      </p>
    </div>
  );
};

// ZoomControls component
const ZoomControls = ({
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 rounded-lg shadow-lg p-2 z-10">
      <button
        onClick={onZoomIn}
        className="mb-2 w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        +
      </button>
      <button
        onClick={onZoomOut}
        className="mb-2 w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        -
      </button>
      <button
        onClick={onReset}
        className="w-8 h-8 flex items-center justify-center bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        ⟳
      </button>
    </div>
  );
};

// Controls for switching between views
const ViewControls = ({
  currentView,
  setCurrentView,
  availableViews,
}: {
  currentView: string;
  setCurrentView: (view: string) => void;
  availableViews: { id: string; name: string; nameBn: string }[];
}) => {
  return (
    <div className="absolute top-4 left-4 bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 rounded-lg shadow-lg p-2 z-10">
      <div className="flex flex-wrap gap-2">
        {availableViews.map((view) => (
          <button
            key={view.id}
            onClick={() => setCurrentView(view.id)}
            className={`px-3 py-1 rounded-full text-sm ${
              currentView === view.id
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {view.nameBn}
          </button>
        ))}
      </div>
    </div>
  );
};

// Main component
const CellComparison = () => {
  const [selectedPart, setSelectedPart] = useState<CellPart | null>(null);
  const [currentView, setCurrentView] = useState<string>("comparison");

  const controlsRef = useRef<any>(null);

  const handleZoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyIn(1.2);
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyOut(1.2);
    }
  };

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const availableViews = [
    { id: "comparison", name: "Comparison", nameBn: "তুলনা" },
    { id: "plant", name: "Plant Cell", nameBn: "উদ্ভিদ কোষ" },
    { id: "animal", name: "Animal Cell", nameBn: "প্রাণী কোষ" },
  ];

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-b from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg overflow-hidden">
      <Canvas shadows>
        <CellComparisonScene onSelectPart={setSelectedPart} />
      </Canvas>

      <Tooltip part={selectedPart} onClose={() => setSelectedPart(null)} />
      <ZoomControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
      />
      <ViewControls
        currentView={currentView}
        setCurrentView={setCurrentView}
        availableViews={availableViews}
      />

      {!selectedPart && (
        <div className="absolute bottom-4 left-0 right-0 text-center text-gray-600 dark:text-gray-300 bg-white bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70 py-2">
          কোষের অংশগুলিতে ক্লিক করে বিবরণ দেখুন
          <br />
          <span className="text-sm">Click on cell parts to view details</span>
        </div>
      )}
    </div>
  );
};

export default CellComparison;
