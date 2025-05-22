import { Html, OrbitControls, Text, useTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import DefaultLayout from "@/layouts/default";

// Define types for planet data
interface PlanetDetails {
  atmosphere: string;
  moons: string;
  dayLength: string;
  yearLength: string;
  surfaceTemp: string;
  distanceFromSun: string;
}

interface PlanetData {
  name: string;
  englishName: string;
  radius: number;
  position?: [number, number, number];
  orbitRadius?: number;
  rotationSpeed?: number;
  color: string;
  textureUrl: string;
  facts: string[];
  hasRings?: boolean;
  details?: PlanetDetails;
}

// Planet data with realistic proportions (but scaled for visibility)
const PLANET_DATA: PlanetData[] = [
  {
    name: "সূর্য", // Sun
    englishName: "Sun",
    radius: 6, // Scaled
    position: [0, 0, 0],
    color: "#FDB813",
    textureUrl: "/images/sun.jpg",
    facts: [
      "সৌরজগতের কেন্দ্রে অবস্থিত",
      "একটি গ্যাসীয় বল যা হাইড্রোজেন এবং হিলিয়াম দিয়ে গঠিত",
      "পৃথিবী থেকে 149.6 মিলিয়ন কিলোমিটার দূরে",
    ],
  },
  {
    name: "বুধ", // Mercury
    englishName: "Mercury",
    radius: 0.38,
    orbitRadius: 10,
    rotationSpeed: 0.004,
    color: "#A5A5A5",
    textureUrl: "/images/mercury.jpg",
    facts: [
      "সৌরজগতের সবচেয়ে ছোট গ্রহ",
      "সূর্যের সবচেয়ে কাছে",
      "একটি চক্র সম্পূর্ণ করতে 88 দিন লাগে",
    ],
  },
  {
    name: "শুক্র", // Venus
    englishName: "Venus",
    radius: 0.95,
    orbitRadius: 14,
    rotationSpeed: 0.0035,
    color: "#E6BB99",
    textureUrl: "/images/venus.jpg",
    facts: [
      "পৃথিবীর প্রায় সমান আকারের",
      "ঘন মেঘাচ্ছন্ন বায়ুমণ্ডল",
      "পৃথিবী থেকে দেখা সবচেয়ে উজ্জ্বল গ্রহ",
    ],
  },
  {
    name: "পৃথিবী", // Earth
    englishName: "Earth",
    radius: 1,
    orbitRadius: 18,
    rotationSpeed: 0.003,
    color: "#2E8BC0",
    textureUrl: "/images/earth.jpg",
    facts: [
      "জলের উপস্থিতি",
      "অক্সিজেন সমৃদ্ধ বায়ুমণ্ডল",
      "প্রাণের একমাত্র জানা আবাসস্থল",
    ],
    details: {
      atmosphere: "নাইট্রোজেন (78%), অক্সিজেন (21%), অন্যান্য (1%)",
      moons: "1 (চাঁদ)",
      dayLength: "24 ঘন্টা",
      yearLength: "365.25 দিন",
      surfaceTemp: "-88°C থেকে 58°C",
      distanceFromSun: "149.6 মিলিয়ন কিলোমিটার",
    },
  },
  {
    name: "মঙ্গল", // Mars
    englishName: "Mars",
    radius: 0.53,
    orbitRadius: 22,
    rotationSpeed: 0.0024,
    color: "#E27B58",
    textureUrl: "/images/mars.jpg",
    facts: [
      "লাল গ্রহ",
      "মেরু অঞ্চলে বরফ আছে",
      "ওলিম্পাস মন্স - সৌরজগতের সর্বোচ্চ পর্বত এখানে অবস্থিত",
    ],
    details: {
      atmosphere: "কার্বন ডাই অক্সাইড (95%), অন্যান্য (5%)",
      moons: "2 (ফোবোস, ডেইমোস)",
      dayLength: "24.6 ঘন্টা",
      yearLength: "687 দিন",
      surfaceTemp: "-153°C থেকে 20°C",
      distanceFromSun: "227.9 মিলিয়ন কিলোমিটার",
    },
  },
  {
    name: "বৃহস্পতি", // Jupiter
    englishName: "Jupiter",
    radius: 2.6,
    orbitRadius: 30,
    rotationSpeed: 0.0013,
    color: "#C88B3A",
    textureUrl: "/images/jupiter.jpg",
    facts: [
      "সৌরজগতের সবচেয়ে বড় গ্রহ",
      "লাল মহাকাল চিহ্ন আছে - একটি বিশাল ঝড়",
      "বৃহৎ গ্যাসীয় গ্রহ",
    ],
  },
  {
    name: "শনি", // Saturn
    englishName: "Saturn",
    radius: 2.2,
    orbitRadius: 40,
    rotationSpeed: 0.0009,
    color: "#E4CD9E",
    textureUrl: "/images/saturn.jpg",
    facts: [
      "বিখ্যাত বলয় সিস্টেম আছে",
      "দ্বিতীয় বৃহত্তম গ্রহ",
      "প্রধানত হাইড্রোজেন এবং হিলিয়াম দিয়ে গঠিত",
    ],
    hasRings: true,
  },
  {
    name: "ইউরেনাস", // Uranus
    englishName: "Uranus",
    radius: 1.8,
    orbitRadius: 50,
    rotationSpeed: 0.0006,
    color: "#D1E7E7",
    textureUrl: "/images/uranus.jpg",
    facts: [
      "পার্শ্ব ঘূর্ণন - 'শুয়ে আছে'",
      "নীল-সবুজ রঙের",
      "মিথেন গ্যাসের জন্য নীল রঙ",
    ],
  },
  {
    name: "নেপচুন", // Neptune
    englishName: "Neptune",
    radius: 1.7,
    orbitRadius: 60,
    rotationSpeed: 0.0004,
    color: "#3E54E8",
    textureUrl: "/images/neptune.jpg",
    facts: [
      "সৌরজগতের সবচেয়ে দূরের গ্রহ",
      "গতিশীল ঝড় এবং দ্রুত বায়ু আছে",
      "গভীর নীল রঙের",
    ],
  },
];

// Sun component with glow effect
interface SunProps {
  radius: number;
  color: string;
  textureUrl: string;
  facts: string[];
}

function Sun({ radius, color, textureUrl, facts }: SunProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const glowMesh = useRef<THREE.Mesh>(null);
  const texture = useTexture(textureUrl);
  const [hovered, setHover] = useState(false);

  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.002;
    }
    if (glowMesh.current) {
      glowMesh.current.rotation.y -= 0.001;
      glowMesh.current.rotation.z += 0.001;
    }
  });

  return (
    <group>
      {/* Sun sphere */}
      <mesh
        ref={mesh}
        onPointerOut={() => setHover(false)}
        onPointerOver={() => setHover(true)}
      >
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          emissive={color}
          emissiveIntensity={0.6}
          map={texture}
        />

        {/* Hover info */}
        {hovered && (
          <Html
            className="pointer-events-none"
            distanceFactor={15}
            position={[0, radius + 2, 0]}
          >
            <div className="bg-slate-900 dark:bg-slate-800 bg-opacity-90 p-3 rounded-lg text-white w-48 shadow-lg border border-slate-700">
              <h3 className="text-xl font-bold mb-2">সূর্য</h3>
              <ul className="text-sm">
                {facts.map((fact, i) => (
                  <li key={i} className="mb-1">
                    • {fact}
                  </li>
                ))}
              </ul>
            </div>
          </Html>
        )}
      </mesh>

      {/* Glow effect */}
      <mesh ref={glowMesh}>
        <sphereGeometry args={[radius + 0.2, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          opacity={0.3}
          transparent={true}
        />
      </mesh>
    </group>
  );
}

// Saturn rings component
interface SaturnRingsProps {
  radius: number;
}

function SaturnRings({ radius }: SaturnRingsProps) {
  return (
    <mesh rotation={[Math.PI / 6, 0, 0]}>
      <ringGeometry args={[radius + 1, radius + 3, 64]} />
      <meshStandardMaterial
        color="#E4CD9E"
        opacity={0.8}
        side={THREE.DoubleSide}
        transparent={true}
      />
    </mesh>
  );
}

// Planet component with orbit
interface PlanetProps {
  name: string;
  englishName: string;
  radius: number;
  orbitRadius: number;
  rotationSpeed: number;
  color: string;
  textureUrl: string;
  facts: string[];
  hasRings?: boolean;
  details?: PlanetDetails;
}

function Planet({
  name,
  englishName,
  radius,
  orbitRadius,
  rotationSpeed,
  color: _color,
  textureUrl,
  facts,
  hasRings,
  details,
}: PlanetProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.LineSegments>(null);
  const texture = useTexture(textureUrl);
  const [hovered, setHover] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [angle, setAngle] = useState(Math.random() * Math.PI * 2);

  useFrame(() => {
    // Planet rotation
    if (mesh.current) {
      mesh.current.rotation.y += 0.01;
    }

    // Orbit rotation
    setAngle((angle) => angle + rotationSpeed);
    if (mesh.current) {
      mesh.current.position.x = Math.cos(angle) * orbitRadius;
      mesh.current.position.z = Math.sin(angle) * orbitRadius;
    }
  });

  // Render orbit path
  const orbitPoints = [];
  const orbitSegments = 64;

  for (let i = 0; i <= orbitSegments; i++) {
    const theta = (i / orbitSegments) * Math.PI * 2;

    orbitPoints.push(
      new THREE.Vector3(
        Math.cos(theta) * orbitRadius,
        0,
        Math.sin(theta) * orbitRadius,
      ),
    );
  }
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);

  return (
    <group>
      {/* Orbit path */}
      <lineSegments ref={orbitRef}>
        <bufferGeometry attach="geometry" {...orbitGeometry} />
        <lineBasicMaterial
          transparent
          attach="material"
          color="#666"
          opacity={0.3}
        />
      </lineSegments>

      {/* Planet */}
      <group>
        <mesh
          ref={mesh}
          onClick={() => details && setShowDetails(!showDetails)}
          onPointerOut={() => setHover(false)}
          onPointerOver={() => setHover(true)}
        >
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial map={texture} />

          {/* Rings for Saturn */}
          {hasRings && <SaturnRings radius={radius} />}

          {/* Planet label */}
          <Text
            anchorX="center"
            anchorY="middle"
            color="white"
            fontSize={0.7}
            position={[0, radius + 0.8, 0]}
          >
            {name}
          </Text>

          {/* Hover info */}
          {hovered && (
            <Html
              className="pointer-events-none"
              distanceFactor={15}
              position={[0, radius + 1.5, 0]}
            >
              <div className="bg-slate-900 dark:bg-slate-800 bg-opacity-90 p-3 rounded-lg text-white w-48 shadow-lg border border-slate-700">
                <h3 className="text-xl font-bold mb-2">{name}</h3>
                <ul className="text-sm">
                  {facts.map((fact, i) => (
                    <li key={i} className="mb-1">
                      • {fact}
                    </li>
                  ))}
                </ul>
              </div>
            </Html>
          )}

          {/* Detailed comparison panel for Earth and Mars */}
          {showDetails &&
            details &&
            (englishName === "Earth" || englishName === "Mars") && (
              <Html distanceFactor={15} position={[0, 0, 0]}>
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
                  <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl shadow-xl border border-blue-500 w-96">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {name} তথ্য
                      </h2>
                      <button
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDetails(false);
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3 text-slate-800 dark:text-slate-200">
                      <div className="flex justify-between">
                        <span className="text-blue-600 dark:text-blue-400">
                          বায়ুমণ্ডল:
                        </span>
                        <span>{details.atmosphere}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600 dark:text-blue-400">
                          চাঁদ:
                        </span>
                        <span>{details.moons}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600 dark:text-blue-400">
                          দিনের দৈর্ঘ্য:
                        </span>
                        <span>{details.dayLength}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600 dark:text-blue-400">
                          বছরের দৈর্ঘ্য:
                        </span>
                        <span>{details.yearLength}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600 dark:text-blue-400">
                          পৃষ্ঠের তাপমাত্রা:
                        </span>
                        <span>{details.surfaceTemp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600 dark:text-blue-400">
                          সূর্য থেকে দূরত্ব:
                        </span>
                        <span>{details.distanceFromSun}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Html>
            )}
        </mesh>
      </group>
    </group>
  );
}

// Earth-Mars comparison component
interface ComparisonProps {
  isVisible: boolean;
  onClose: () => void;
}

function EarthMarsComparison({ isVisible, onClose }: ComparisonProps) {
  if (!isVisible) return null;

  // const earth = PLANET_DATA.find((p) => p.englishName === "Earth");
  // const mars = PLANET_DATA.find((p) => p.englishName === "Mars");

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-slate-100 dark:bg-slate-800 p-6 rounded-xl shadow-xl border border-blue-500 max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          পৃথিবী ও মঙ্গল তুলনা
        </h2>
        <button
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 text-slate-800 dark:text-slate-200">
        <div className="col-span-1" />
        <div className="col-span-1 text-center font-bold text-blue-600 dark:text-blue-400">
          পৃথিবী
        </div>
        <div className="col-span-1 text-center font-bold text-red-600 dark:text-red-400">
          মঙ্গল
        </div>

        <div className="col-span-1 text-blue-600 dark:text-blue-400">ব্যাস</div>
        <div className="col-span-1 text-center">12,742 কিমি</div>
        <div className="col-span-1 text-center">6,779 কিমি</div>

        <div className="col-span-1 text-blue-600 dark:text-blue-400">
          বায়ুমণ্ডল
        </div>
        <div className="col-span-1 text-center">অক্সিজেন সমৃদ্ধ</div>
        <div className="col-span-1 text-center">পাতলা, CO₂ সমৃদ্ধ</div>

        <div className="col-span-1 text-blue-600 dark:text-blue-400">
          পৃষ্ঠের তাপমাত্রা
        </div>
        <div className="col-span-1 text-center">-88°C থেকে 58°C</div>
        <div className="col-span-1 text-center">-153°C থেকে 20°C</div>

        <div className="col-span-1 text-blue-600 dark:text-blue-400">চাঁদ</div>
        <div className="col-span-1 text-center">1</div>
        <div className="col-span-1 text-center">2 (ফোবোস, ডেইমোস)</div>

        <div className="col-span-1 text-blue-600 dark:text-blue-400">
          দিনের দৈর্ঘ্য
        </div>
        <div className="col-span-1 text-center">24 ঘন্টা</div>
        <div className="col-span-1 text-center">24.6 ঘন্টা</div>

        <div className="col-span-1 text-blue-600 dark:text-blue-400">
          বছরের দৈর্ঘ্য
        </div>
        <div className="col-span-1 text-center">365.25 দিন</div>
        <div className="col-span-1 text-center">687 দিন</div>
      </div>

      <div className="mt-4 text-slate-700 dark:text-slate-300 text-sm">
        <p>
          পৃথিবী ও মঙ্গল গ্রহদ্বয় "টেরেস্ট্রিয়াল" বা পাথুরে গ্রহ হিসাবে একই
          শ্রেণীর অন্তর্গত। তবে, পৃথিবীতে জল এবং অক্সিজেন থাকায় এখানে জীবন
          সম্ভব হয়েছে। মঙ্গলে প্রাচীনকালে জল ছিল বলে বিজ্ঞানীরা মনে করেন, এবং
          এখনও মেরু অঞ্চলে বরফ রয়েছে।
        </p>
      </div>
    </div>
  );
}

// Planets scene component
function PlanetsScene() {
  const { camera } = useThree();

  useEffect(() => {
    // Set initial camera position
    camera.position.set(0, 30, 70);
  }, [camera]);

  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.2} />

      {/* Point light at sun position */}
      <pointLight color="#FDB813" intensity={1.5} position={[0, 0, 0]} />

      {/* Sun */}
      <Sun
        color={PLANET_DATA[0].color}
        facts={PLANET_DATA[0].facts}
        radius={PLANET_DATA[0].radius}
        textureUrl={PLANET_DATA[0].textureUrl}
      />

      {/* Planets */}
      {PLANET_DATA.slice(1).map((planet, index) => (
        <Planet
          key={index}
          color={planet.color}
          details={planet.details}
          englishName={planet.englishName}
          facts={planet.facts}
          hasRings={planet.hasRings}
          name={planet.name}
          orbitRadius={planet.orbitRadius || 0}
          radius={planet.radius}
          rotationSpeed={planet.rotationSpeed || 0}
          textureUrl={planet.textureUrl}
        />
      ))}

      {/* Stars background */}
      <Stars />
    </>
  );
}

// Stars background component
function Stars() {
  const starsRef = useRef<THREE.Points>(null);

  useEffect(() => {
    if (!starsRef.current) return;

    // Generate random stars
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    for (let i = 0; i < 5000; i++) {
      // Create stars in a spherical pattern around the scene
      const r = 100 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      vertices.push(x, y, z);
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    starsRef.current.geometry = geometry;
  }, []);

  return (
    <points ref={starsRef}>
      <pointsMaterial color="#FFFFFF" size={0.2} />
    </points>
  );
}

// Main component
export default function SolarSystem() {
  const [showComparison, setShowComparison] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  return (
    <DefaultLayout>
      <div className="w-full h-[calc(100vh-4rem)] relative bg-slate-100 dark:bg-slate-900">
        {/* Canvas for Three.js scene */}
        <Canvas shadows>
          <PlanetsScene />
          <OrbitControls
            autoRotate={autoRotate}
            autoRotateSpeed={0.5}
            enablePan={true}
            enableRotate={true}
            enableZoom={true}
          />
        </Canvas>

        {/* UI Controls */}
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-4">
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center"
            onClick={() => setAutoRotate(!autoRotate)}
          >
            {autoRotate ? "অটো রোটেশন বন্ধ করুন" : "অটো রোটেশন চালু করুন"}
          </button>

          <button
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center"
            onClick={() => setShowComparison(true)}
          >
            পৃথিবী-মঙ্গল তুলনা দেখুন
          </button>
        </div>

        {/* Title and Instructions */}
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            সৌরজগৎ
          </h1>
          <p className="text-slate-700 dark:text-slate-200 mt-2">
            গ্রহের উপর মাউস রাখুন তথ্য দেখতে, পৃথিবী ও মঙ্গলে ক্লিক করুন
            বিস্তারিত জানতে
          </p>
        </div>

        {/* Earth-Mars Comparison Modal */}
        <EarthMarsComparison
          isVisible={showComparison}
          onClose={() => setShowComparison(false)}
        />

        {/* Back button */}
        <div className="absolute top-5 left-5">
          <a
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
            href="/hands-on"
          >
            <span>←</span>
            <span>হ্যান্ডস-অন এক্সপেরিয়েন্সে ফিরে যান</span>
          </a>
        </div>
      </div>
    </DefaultLayout>
  );
}
