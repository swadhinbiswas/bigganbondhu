import { Html, Line, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";

import { Slider } from "../ui/slider";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

// Supported types
const OPTICS_TYPES = [
  { value: "convex-lens", label: { en: "Convex Lens", bn: "উত্তল লেন্স" } },
  { value: "concave-lens", label: { en: "Concave Lens", bn: "অবতল লেন্স" } },
  { value: "convex-mirror", label: { en: "Convex Mirror", bn: "উত্তল দর্পণ" } },
  {
    value: "concave-mirror",
    label: { en: "Concave Mirror", bn: "অবতল দর্পণ" },
  },
];

const DEFAULTS = {
  type: "convex-lens",
  objectPos: 6,
  focalLength: 3,
  language: "en",
};

const LABELS = {
  F: { en: "F", bn: "ফোকাস" },
  "2F": { en: "2F", bn: "২ফোকাস" },
  O: { en: "Object", bn: "বস্তু" },
  I: { en: "Image", bn: "প্রতিচ্ছবি" },
  C: { en: "C", bn: "কেন্দ্র" },
  axis: { en: "Principal Axis", bn: "প্রধান অক্ষ" },
  formula: {
    en: "1/f = 1/v + 1/u",
    bn: "১/ƒ = ১/v + ১/u",
  },
  lensFormula: {
    en: "1/f = 1/v - 1/u",
    bn: "১/ƒ = ১/v - ১/u",
  },
  mirrorFormula: {
    en: "1/f = 1/v + 1/u",
    bn: "১/ƒ = ১/v + ১/u",
  },
  magnification: {
    en: "m = -v/u",
    bn: "m = -v/u",
  },
  real: { en: "Real Image", bn: "বাস্তব প্রতিচ্ছবি" },
  virtual: { en: "Virtual Image", bn: "ভার্চুয়াল প্রতিচ্ছবি" },
  upright: { en: "Upright", bn: "উলম্ব" },
  inverted: { en: "Inverted", bn: "উল্টানো" },
  caption: {
    en: "Move the object and focal length sliders to see how the image changes. Hover on labels for explanations.",
    bn: "বস্তু ও ফোকাসের অবস্থান পরিবর্তন করুন এবং প্রতিচ্ছবির পরিবর্তন দেখুন। লেবেলে হোভার করুন বিস্তারিত জানতে।",
  },
};

function getLabel(key: keyof typeof LABELS, lang: "en" | "bn") {
  return LABELS[key][lang] || LABELS[key]["en"];
}

// Utility: Calculate image position and magnification for lens/mirror
function getImageData({
  type,
  objectPos,
  focalLength,
}: {
  type: string;
  objectPos: number;
  focalLength: number;
}) {
  let v = null;
  let m = null;
  let isReal = false;
  let isInverted = false;
  let imageHeight = 3; // default object height

  // Sign convention:
  // - For lenses: Real images are positive, virtual are negative
  // - For mirrors: Real images are negative, virtual are positive
  // - Object distance (u) is always positive
  // - Focal length: For convex lens and concave mirror: positive; concave lens and convex mirror: negative

  const u = objectPos; // Always positive (to the left)

  // Apply the correct formula based on type
  if (type === "convex-lens") {
    const f = focalLength; // Positive for convex lens

    v = (u * f) / (u - f); // Lens formula
    m = -v / u; // Magnification
    isReal = v > 0;
    isInverted = m < 0;
    imageHeight = Math.abs(m * 3);
  } else if (type === "concave-lens") {
    const f = -focalLength; // Negative for concave lens

    v = (u * f) / (u - f); // Lens formula
    m = -v / u; // Magnification
    isReal = v > 0; // Always virtual for concave lens
    isInverted = m < 0;
    imageHeight = Math.abs(m * 3);
  } else if (type === "convex-mirror") {
    const f = -focalLength; // Negative for convex mirror

    v = (u * f) / (u + f); // Mirror formula
    m = v / u; // Magnification
    isReal = v < 0; // Always virtual for convex mirror
    isInverted = m < 0;
    imageHeight = Math.abs(m * 3);
  } else if (type === "concave-mirror") {
    const f = focalLength; // Positive for concave mirror

    v = (u * f) / (u + f); // Mirror formula
    m = v / u; // Magnification
    isReal = v < 0 && u > f; // Real when object beyond F
    isInverted = m < 0;
    imageHeight = Math.abs(m * 3);
  }

  return { v, m, isReal, isInverted, imageHeight };
}

export default function RayDiagramOptics() {
  const [type, setType] = useState(DEFAULTS.type);
  const [objectPos, setObjectPos] = useState(DEFAULTS.objectPos);
  const [focalLength, setFocalLength] = useState(DEFAULTS.focalLength);
  const [language, setLanguage] = useState<"en" | "bn">(
    DEFAULTS.language as "en" | "bn",
  );

  const imageData = getImageData({ type, objectPos, focalLength });

  // Ray points for different optical elements
  let rays: Array<{
    points: [number, number][];
    color: string;
    dashed?: boolean;
  }> = [];

  let imageArrow = null;
  let imageLabel = null;

  // Function to calculate rays for each type
  const calculateRays = () => {
    if (imageData.v === null || imageData.m === null) return [];

    if (type === "convex-lens") {
      // Ray 1: Parallel to axis, then through focus
      rays.push({
        points: [
          [-objectPos, 1.5],
          [0, 1.5],
          [imageData.v, -imageData.m * 1.5],
        ],
        color: "#ef4444",
      });

      // Ray 2: Through center (undeviated)
      rays.push({
        points: [
          [-objectPos, 1.5],
          [0, 0],
          [imageData.v, -imageData.m * 1.5],
        ],
        color: "#3b82f6",
      });

      // Ray 3: Through F on left, emerges parallel
      rays.push({
        points: [
          [-objectPos, 1.5],
          [-focalLength, 0],
          [0, ((focalLength + objectPos) * -1.5) / objectPos],
          [imageData.v, -imageData.m * 1.5],
        ],
        color: "#10b981",
      });
    } else if (type === "concave-lens") {
      // Ray 1: Parallel to axis, then away from focus (virtual refraction)
      const slope = 1.5 / objectPos;
      const extension = imageData.v - 0;

      rays.push({
        points: [
          [-objectPos, 1.5],
          [0, 1.5],
          [imageData.v, 1.5 - slope * extension],
        ],
        color: "#ef4444",
      });

      // Ray 2: Through center (undeviated)
      rays.push({
        points: [
          [-objectPos, 1.5],
          [0, 0],
          [imageData.v, -imageData.m * 1.5],
        ],
        color: "#3b82f6",
      });

      // Ray 3: Toward focus on right, then parallel to axis
      const virtualPoint = -focalLength;
      const interceptY = 1.5 - ((objectPos - virtualPoint) * 1.5) / objectPos;

      rays.push({
        points: [
          [-objectPos, 1.5],
          [0, interceptY],
          [imageData.v, interceptY],
        ],
        color: "#10b981",
      });

      // Backward extension rays (dashed - virtual image)
      rays.push({
        points: [
          [imageData.v, -imageData.m * 1.5],
          [0, 1.5],
        ],
        color: "#ef4444",
        dashed: true,
      });

      rays.push({
        points: [
          [imageData.v, -imageData.m * 1.5],
          [0, interceptY],
        ],
        color: "#10b981",
        dashed: true,
      });
    } else if (type === "convex-mirror") {
      // Ray 1: Parallel to axis, then away from focus
      rays.push({
        points: [
          [-objectPos, 1.5],
          [0, 1.5],
          [imageData.v, -imageData.m * 1.5],
        ],
        color: "#ef4444",
      });

      // Ray 2: Toward center, reflected symmetrically
      const incidentAngle = Math.atan2(1.5, objectPos);
      const reflectedY = Math.tan(incidentAngle) * imageData.v;

      rays.push({
        points: [
          [-objectPos, 1.5],
          [0, 0],
          [imageData.v, reflectedY],
        ],
        color: "#3b82f6",
      });

      // Backward extension rays (dashed - virtual image)
      rays.push({
        points: [
          [imageData.v, -imageData.m * 1.5],
          [0, 1.5],
        ],
        color: "#ef4444",
        dashed: true,
      });

      rays.push({
        points: [
          [imageData.v, -imageData.m * 1.5],
          [0, 0],
        ],
        color: "#3b82f6",
        dashed: true,
      });
    } else if (type === "concave-mirror") {
      // Ray 1: Parallel to axis, then through focus
      rays.push({
        points: [
          [-objectPos, 1.5],
          [0, 1.5],
          [imageData.v, -imageData.m * 1.5],
        ],
        color: "#ef4444",
      });

      // Ray 2: Through center, reflected back along same line
      rays.push({
        points: [
          [-objectPos, 1.5],
          [0, 0],
          [imageData.v, -imageData.m * 1.5],
        ],
        color: "#3b82f6",
      });

      // Ray 3: Through focus on right, then parallel
      rays.push({
        points: [
          [-objectPos, 1.5],
          [-focalLength / 2, 0.75],
          [0, 0],
          [imageData.v, -imageData.m * 1.5],
        ],
        color: "#10b981",
      });

      // For virtual image, add dashed extension lines
      if (!imageData.isReal) {
        rays.push({
          points: [
            [imageData.v, -imageData.m * 1.5],
            [0, 1.5],
          ],
          color: "#ef4444",
          dashed: true,
        });

        rays.push({
          points: [
            [imageData.v, -imageData.m * 1.5],
            [0, 0],
          ],
          color: "#3b82f6",
          dashed: true,
        });
      }
    }

    return rays;
  };

  // Calculate rays based on type
  rays = calculateRays();

  // Image arrow and label
  if (imageData.v !== null && imageData.m !== null) {
    const imagePosition = type.includes("mirror")
      ? imageData.isReal
        ? imageData.v
        : imageData.v // Mirrors have different sign convention
      : imageData.v;

    // Image arrow
    imageArrow = (
      <mesh position={[imagePosition, -imageData.m * 1.5, 0.1]}>
        <cylinderGeometry args={[0.07, 0.07, imageData.imageHeight, 12]} />
        <meshStandardMaterial
          transparent
          color={imageData.isReal ? "#f59e42" : "#f472b6"}
          opacity={0.8}
        />
      </mesh>
    );

    // Image label
    imageLabel = (
      <Html
        center
        position={[
          imagePosition,
          -imageData.m * 1.5 + (imageData.isInverted ? -0.7 : 0.7),
          0.2,
        ]}
      >
        <span
          className="text-xs bg-white/80 px-1 rounded shadow cursor-help"
          title={
            imageData.isReal
              ? language === "en"
                ? "Real Image"
                : "বাস্তব প্রতিচ্ছবি"
              : language === "en"
                ? "Virtual Image"
                : "ভার্চুয়াল প্রতিচ্ছবি"
          }
        >
          {getLabel("I", language)}
        </span>
      </Html>
    );
  }

  // Object emoji
  let objectEmoji = (
    <Html center position={[-objectPos, 3, 0.2]}>
      <span
        className="text-3xl drop-shadow-lg cursor-pointer animate-bounce"
        style={{ filter: "drop-shadow(0 2px 6px #f59e42)" }}
        title={
          language === "en"
            ? "This is the object! Move me closer or farther."
            : "এটাই বস্তু! আমাকে কাছে বা দূরে সরান।"
        }
      >
        🧑‍🎓
      </span>
    </Html>
  );

  // Image emoji
  let imageEmoji = null;

  if (imageData.v !== null && imageData.m !== null) {
    const imagePosition = type.includes("mirror")
      ? imageData.isReal
        ? imageData.v
        : imageData.v // Mirrors have different sign convention
      : imageData.v;

    imageEmoji = (
      <Html
        center
        position={[
          imagePosition,
          -imageData.m * 1.5 + (imageData.isInverted ? -1.2 : 1.2),
          0.2,
        ]}
      >
        <span
          className="text-3xl drop-shadow-lg cursor-pointer animate-bounce"
          style={{
            filter: imageData.isReal
              ? "drop-shadow(0 2px 6px #f59e42)"
              : "drop-shadow(0 2px 6px #f472b6)",
            transform: imageData.isInverted ? "rotate(180deg)" : "none",
          }}
          title={
            imageData.isReal
              ? language === "en"
                ? "This is the real image!"
                : "এটাই বাস্তব প্রতিচ্ছবি!"
              : language === "en"
                ? "This is a virtual image!"
                : "এটা ভার্চুয়াল প্রতিচ্ছবি!"
          }
        >
          {imageData.isReal ? "💡" : "😃"}
        </span>
      </Html>
    );
  }

  // Generate opticsElement based on type
  const renderOpticsElement = () => {
    if (type === "convex-lens") {
      return (
        <mesh position={[0, 0, 0.1]}>
          <cylinderGeometry args={[1.5, 1.5, 6, 12]} />
          <meshStandardMaterial transparent color="#3b82f6" opacity={0.5} />
        </mesh>
      );
    } else if (type === "concave-lens") {
      return (
        <group position={[0, 0, 0.1]}>
          <mesh position={[-0.25, 0, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 6, 12]} />
            <meshStandardMaterial transparent color="#3b82f6" opacity={0.5} />
          </mesh>
          <mesh position={[0.25, 0, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 6, 12]} />
            <meshStandardMaterial transparent color="#3b82f6" opacity={0.5} />
          </mesh>
        </group>
      );
    } else if (type === "convex-mirror") {
      return (
        <mesh position={[0, 0, 0.1]} rotation={[0, 0, Math.PI / 2]}>
          <sphereGeometry args={[3, 32, 16, 0, Math.PI / 4, 0, Math.PI]} />
          <meshStandardMaterial transparent color="#e2e8f0" opacity={0.7} />
        </mesh>
      );
    } else if (type === "concave-mirror") {
      return (
        <mesh position={[0, 0, 0.1]} rotation={[0, 0, -Math.PI / 2]}>
          <sphereGeometry args={[3, 32, 16, 0, Math.PI / 4, 0, Math.PI]} />
          <meshStandardMaterial transparent color="#e2e8f0" opacity={0.7} />
        </mesh>
      );
    }
  };

  // Function to render focal and 2F points based on type
  const renderFocalPoints = () => {
    const points = [];

    // First focal point (left side)
    points.push(
      <Html key="F-left" center position={[-focalLength, -0.5, 0.2]}>
        <span
          className="text-xs bg-white/80 px-1 rounded shadow cursor-help"
          title={language === "en" ? "Focus (F)" : "ফোকাস (F)"}
        >
          {getLabel("F", language)}
        </span>
      </Html>,
    );

    // Second focal point (right side)
    points.push(
      <Html key="F-right" center position={[focalLength, -0.5, 0.2]}>
        <span
          className="text-xs bg-white/80 px-1 rounded shadow cursor-help"
          title={language === "en" ? "Focus (F)" : "ফোকাস (F)"}
        >
          {getLabel("F", language)}
        </span>
      </Html>,
    );

    // 2F points (both sides)
    points.push(
      <Html key="2F-left" center position={[-2 * focalLength, -0.5, 0.2]}>
        <span
          className="text-xs bg-white/80 px-1 rounded shadow cursor-help"
          title={language === "en" ? "Twice Focus (2F)" : "দ্বিগুণ ফোকাস (২F)"}
        >
          {getLabel("2F", language)}
        </span>
      </Html>,
    );

    points.push(
      <Html key="2F-right" center position={[2 * focalLength, -0.5, 0.2]}>
        <span
          className="text-xs bg-white/80 px-1 rounded shadow cursor-help"
          title={language === "en" ? "Twice Focus (2F)" : "দ্বিগুণ ফোকাস (২F)"}
        >
          {getLabel("2F", language)}
        </span>
      </Html>,
    );

    // Only for mirrors, show C point (center of curvature)
    if (type.includes("mirror")) {
      points.push(
        <Html key="C" center position={[-2 * focalLength, -0.5, 0.2]}>
          <span
            className="text-xs bg-white/80 px-1 rounded shadow cursor-help"
            title={
              language === "en"
                ? "Center of Curvature (C)"
                : "বক্রতার কেন্দ্র (C)"
            }
          >
            {getLabel("C", language)}
          </span>
        </Html>,
      );
    }

    return points;
  };

  // Image position and characteristics
  const getImageInfo = () => {
    if (imageData.v === null || imageData.m === null) return null;

    const imagePosition = Math.abs(imageData.v).toFixed(2);
    const magnification = Math.abs(imageData.m).toFixed(2);

    return (
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded text-blue-900 dark:text-blue-100 text-sm">
        <h3 className="font-bold mb-2">
          {language === "en" ? "Image Information:" : "প্রতিচ্ছবির তথ্য:"}
        </h3>
        <ul className="space-y-1">
          <li>
            <span className="font-medium mr-1">
              {language === "en" ? "Type:" : "ধরণ:"}
            </span>
            {imageData.isReal
              ? language === "en"
                ? "Real"
                : "বাস্তব"
              : language === "en"
                ? "Virtual"
                : "ভার্চুয়াল"}
          </li>
          <li>
            <span className="font-medium mr-1">
              {language === "en" ? "Orientation:" : "অভিমুখ:"}
            </span>
            {imageData.isInverted
              ? language === "en"
                ? "Inverted"
                : "উল্টানো"
              : language === "en"
                ? "Upright"
                : "উলম্ব"}
          </li>
          <li>
            <span className="font-medium mr-1">
              {language === "en" ? "Position:" : "অবস্থান:"}
            </span>
            {imagePosition} {language === "en" ? "units" : "ইউনিট"}
            {imageData.isReal
              ? language === "en"
                ? " (right)"
                : " (ডানে)"
              : language === "en"
                ? " (left)"
                : " (বামে)"}
          </li>
          <li>
            <span className="font-medium mr-1">
              {language === "en" ? "Magnification:" : "বিবর্ধন:"}
            </span>
            {magnification}×
            {parseFloat(magnification) > 1
              ? language === "en"
                ? " (enlarged)"
                : " (বড়)"
              : parseFloat(magnification) < 1
                ? language === "en"
                  ? " (diminished)"
                  : " (ছোট)"
                : ""}
          </li>
        </ul>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded shadow-2xl">
      <h2 className="text-2xl font-bold mb-2 text-center">
        {language === "en"
          ? "Ray Diagram Simulator (Lenses & Mirrors) 🧑‍🔬"
          : "রশ্মি চিত্র সিমুলেটর (লেন্স ও দর্পণ) 🧑‍🔬"}
      </h2>
      <div className="flex flex-col md:flex-row gap-4 mb-4 items-center justify-center">
        <Tabs value={type} onValueChange={setType}>
          <TabsList>
            {OPTICS_TYPES.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label[language]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <button
          className="ml-4 px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
          onClick={() => setLanguage(language === "en" ? "bn" : "en")}
        >
          {language === "en" ? "বাংলা" : "English"}
        </button>
        <button
          className="ml-2 px-3 py-1 rounded bg-gray-400 text-white hover:bg-gray-500"
          onClick={() => {
            setType(DEFAULTS.type);
            setObjectPos(DEFAULTS.objectPos);
            setFocalLength(DEFAULTS.focalLength);
          }}
        >
          {language === "en" ? "Reset" : "রিসেট"}
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 min-w-[350px] h-[420px] bg-gradient-to-br from-blue-100 via-pink-100 to-yellow-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-xl relative border-2 border-blue-200 dark:border-blue-900 shadow-lg">
          <Canvas camera={{ position: [0, 0, 18], fov: 40 }}>
            <ambientLight intensity={0.8} />
            <directionalLight intensity={0.8} position={[0, 10, 10]} />
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 2}
            />
            {/* Principal axis */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[16, 0.05, 0.01]} />
              <meshStandardMaterial color="#60a5fa" />
            </mesh>

            {/* Lens/Mirror element */}
            {renderOpticsElement()}

            {/* Object (emoji) */}
            {objectEmoji}

            {/* Object (arrow, faded for context) */}
            <mesh position={[-objectPos, 1.5, 0.1]}>
              <cylinderGeometry args={[0.07, 0.07, 3, 12]} />
              <meshStandardMaterial transparent color="#f59e42" opacity={0.3} />
            </mesh>

            {/* Draw rays */}
            {rays.map((ray, i) => (
              <group key={i}>
                <Line
                  color={ray.color}
                  dashScale={ray.dashed ? 0.5 : 0}
                  dashSize={ray.dashed ? 0.2 : 0}
                  dashed={ray.dashed}
                  derivatives={false}
                  gapSize={ray.dashed ? 0.1 : 0}
                  lineWidth={3}
                  points={ray.points.map(([x, y]) => [x, y, 0.15])}
                />
              </group>
            ))}

            {/* Image (emoji) */}
            {imageEmoji}

            {/* Image arrow and label */}
            {imageArrow}
            {imageLabel}

            {/* Labels (F, 2F, C, etc.) */}
            {renderFocalPoints()}

            {/* Object label */}
            <Html center position={[-objectPos, 2.2, 0.2]}>
              <span
                className="text-xs bg-white/80 px-1 rounded shadow cursor-help"
                title={language === "en" ? "Object" : "বস্তু"}
              >
                {getLabel("O", language)}
              </span>
            </Html>
          </Canvas>
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {language === "en" ? "Object Position (u)" : "বস্তুর অবস্থান (u)"}
            </label>
            <Slider
              max={12}
              min={2}
              step={0.1}
              value={[objectPos]}
              onValueChange={(v) => setObjectPos(v[0])}
            />
            <div className="text-xs mt-1 text-gray-600 dark:text-gray-300">
              {language === "en"
                ? `Distance from lens/mirror: ${objectPos} units`
                : `লেন্স/দর্পণ থেকে দূরত্ব: ${objectPos} ইউনিট`}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {language === "en" ? "Focal Length (f)" : "ফোকাল দৈর্ঘ্য (ƒ)"}
            </label>
            <Slider
              max={6}
              min={1}
              step={0.1}
              value={[focalLength]}
              onValueChange={(v) => setFocalLength(v[0])}
            />
            <div className="text-xs mt-1 text-gray-600 dark:text-gray-300">
              {language === "en"
                ? `Focal length: ${focalLength} units`
                : `ফোকাল দৈর্ঘ্য: ${focalLength} ইউনিট`}
            </div>
          </div>
          {getImageInfo()}
          <div className="mt-4 p-2 bg-blue-50 dark:bg-blue-900 rounded text-blue-900 dark:text-blue-100 text-sm">
            <span className="font-semibold mr-2">
              {language === "en" ? "Formula:" : "সূত্র:"}
            </span>
            <span>
              {type.includes("lens")
                ? getLabel("lensFormula", language)
                : getLabel("mirrorFormula", language)}
            </span>
            <div className="mt-2">
              <span className="font-semibold mr-2">
                {language === "en" ? "Magnification:" : "বিবর্ধন:"}
              </span>
              <span>{getLabel("magnification", language)}</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-700 dark:text-gray-200">
            {getLabel("caption", language)}
          </div>
        </div>
      </div>
    </div>
  );
}
