import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// Types for the photosynthesis simulation
interface PhotosynthesisPart {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  position: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  visible?: boolean;
}

interface AnimatedMoleculeProps {
  position: [number, number, number];
  color: string;
  size?: number;
  speed?: number;
  path?: "linear" | "curve" | "circle";
  destination?: [number, number, number];
  visible?: boolean;
  id: string;
}

// Photosynthesis parts with positions
const photosynthesisParts: PhotosynthesisPart[] = [
  {
    id: "leaf-epidermis",
    name: "Epidermis",
    nameBn: "এপিডার্মিস",
    description:
      "The outer protective layer of the leaf that prevents water loss and protects against physical damage.",
    descriptionBn:
      "পাতার বাহিরের প্রতিরক্ষামূলক স্তর যা পানি হারানো রোধ করে এবং শারীরিক ক্ষতি থেকে রক্ষা করে।",
    position: [0, 1.2, 0],
    color: "#c8e6c9",
  },
  {
    id: "stomata",
    name: "Stomata",
    nameBn: "পত্ররন্ধ্র",
    description:
      "Pores in leaves that allow gas exchange (CO₂ in, O₂ out). Controlled by guard cells that open and close.",
    descriptionBn:
      "পাতায় ছিদ্র যা গ্যাস বিনিময়ের অনুমতি দেয় (CO₂ ভিতরে, O₂ বাইরে)। রক্ষী কোষ দ্বারা নিয়ন্ত্রিত যা খোলে এবং বন্ধ হয়।",
    position: [-0.8, 0.9, 0.5],
    scale: [0.3, 0.2, 0.3],
    color: "#80cbc4",
  },
  {
    id: "mesophyll",
    name: "Mesophyll Cells",
    nameBn: "মেসোফিল কোষ",
    description:
      "Cells containing chloroplasts where photosynthesis occurs. Arranged to maximize light absorption.",
    descriptionBn:
      "ক্লোরোপ্লাস্টযুক্ত কোষ যেখানে সালোকসংশ্লেষণ হয়। আলোক শোষণ সর্বাধিক করার জন্য সাজানো।",
    position: [0, 0, 0],
    color: "#a5d6a7",
  },
  {
    id: "chloroplast",
    name: "Chloroplast",
    nameBn: "ক্লোরোপ্লাস্ট",
    description:
      "Organelle containing chlorophyll where light energy is captured and converted to chemical energy.",
    descriptionBn:
      "ক্লোরোফিল ধারণকারী অঙ্গাণু যেখানে আলোক শক্তি ধরা হয় এবং রাসায়নিক শক্তিতে রূপান্তরিত হয়।",
    position: [0.5, 0, 0.3],
    scale: [0.4, 0.3, 0.2],
    color: "#4caf50",
  },
  {
    id: "xylem",
    name: "Xylem",
    nameBn: "জাইলেম",
    description:
      "Vascular tissue that transports water and minerals from roots to leaves through capillary action.",
    descriptionBn:
      "সংবহন টিস্যু যা কেশিকা ক্রিয়ার মাধ্যমে শিকড় থেকে পাতায় পানি ও খনিজ পরিবহন করে।",
    position: [0, -0.8, 0],
    color: "#90caf9",
  },
  {
    id: "phloem",
    name: "Phloem",
    nameBn: "ফ্লোয়েম",
    description:
      "Vascular tissue that transports glucose and other nutrients throughout the plant.",
    descriptionBn:
      "সংবহন টিস্যু যা গ্লুকোজ এবং অন্যান্য পুষ্টি উদ্ভিদের সর্বত্র পরিবহন করে।",
    position: [0.3, -0.8, 0],
    color: "#ffcc80",
  },
  {
    id: "sunlight",
    name: "Sunlight",
    nameBn: "সূর্যালোক",
    description:
      "Energy source for photosynthesis, absorbed by chlorophyll pigments.",
    descriptionBn:
      "সালোকসংশ্লেষণের জন্য শক্তির উৎস, ক্লোরোফিল বর্ণক দ্বারা শোষিত।",
    position: [0, 2, 0],
    scale: [1.5, 0.2, 1.5],
    color: "#ffeb3b",
    visible: true,
  },
  {
    id: "carbon-dioxide",
    name: "Carbon Dioxide (CO₂)",
    nameBn: "কার্বন ডাই অক্সাইড (CO₂)",
    description:
      "A gas absorbed through stomata, providing carbon atoms for glucose production.",
    descriptionBn:
      "পত্ররন্ধ্রের মাধ্যমে শোষিত একটি গ্যাস, গ্লুকোজ উৎপাদনের জন্য কার্বন পরমাণু সরবরাহ করে।",
    position: [-1.5, 0.9, 0],
    scale: [0.3, 0.3, 0.3],
    color: "#9e9e9e",
    visible: true,
  },
  {
    id: "water",
    name: "Water (H₂O)",
    nameBn: "পানি (H₂O)",
    description:
      "Absorbed through roots and transported to leaves by xylem, providing hydrogen and oxygen atoms.",
    descriptionBn:
      "শিকড়ের মাধ্যমে শোষিত এবং জাইলেমের মাধ্যমে পাতায় পরিবহিত, হাইড্রোজেন ও অক্সিজেন পরমাণু সরবরাহ করে।",
    position: [0, -1.5, 0],
    scale: [0.3, 0.3, 0.3],
    color: "#29b6f6",
    visible: true,
  },
  {
    id: "oxygen",
    name: "Oxygen (O₂)",
    nameBn: "অক্সিজেন (O₂)",
    description:
      "A gas released as byproduct of photosynthesis when water molecules are split.",
    descriptionBn:
      "পানির অণু বিভক্ত হওয়ার সময় সালোকসংশ্লেষণের উপজাত হিসাবে নির্গত একটি গ্যাস।",
    position: [-0.8, 1.2, 0.5],
    scale: [0.3, 0.3, 0.3],
    color: "#80deea",
    visible: true,
  },
  {
    id: "glucose",
    name: "Glucose (C₆H₁₂O₆)",
    nameBn: "গ্লুকোজ (C₆H₁₂O₆)",
    description:
      "Sugar produced by photosynthesis, used for plant growth or stored as starch.",
    descriptionBn:
      "সালোকসংশ্লেষণ দ্বারা উৎপন্ন শর্করা, উদ্ভিদের বৃদ্ধির জন্য ব্যবহৃত বা স্টার্চ হিসাবে সঞ্চিত হয়।",
    position: [0.8, -0.8, 0],
    scale: [0.4, 0.3, 0.3],
    color: "#ffb74d",
    visible: true,
  },
  {
    id: "cuticle",
    name: "Cuticle",
    nameBn: "কিউটিকল",
    description:
      "Waxy coating on the leaf surface that prevents water loss and provides protection.",
    descriptionBn:
      "পাতার পৃষ্ঠের মোমের আবরণ যা পানি হারানো রোধ করে এবং সুরক্ষা প্রদান করে।",
    position: [0, 1.4, 0],
    scale: [1.6, 0.1, 1.6],
    color: "#d7ccc8",
    visible: true,
  },
  {
    id: "guard-cells",
    name: "Guard Cells",
    nameBn: "রক্ষী কোষ",
    description:
      "Specialized cells that control the opening and closing of stomata.",
    descriptionBn: "বিশেষ কোষ যা পত্ররন্ধ্রের খোলা ও বন্ধ নিয়ন্ত্রণ করে।",
    position: [-0.95, 0.9, 0.5],
    scale: [0.15, 0.15, 0.15],
    color: "#66bb6a",
    visible: true,
  },
];

// Define photosynthesis process stages for animations
const processStages = [
  {
    id: "light-absorption",
    name: "Light Absorption",
    nameBn: "আলোক শোষণ",
    description: "Chlorophyll pigments capture light energy from the sun",
    descriptionBn: "ক্লোরোফিল বর্ণক সূর্য থেকে আলোক শক্তি ধারণ করে",
    duration: 2000, // milliseconds
  },
  {
    id: "water-splitting",
    name: "Water Splitting",
    nameBn: "পানি বিভাজন",
    description: "Water molecules are split into hydrogen and oxygen",
    descriptionBn: "পানির অণু হাইড্রোজেন এবং অক্সিজেনে বিভক্ত হয়",
    duration: 1500,
  },
  {
    id: "co2-fixation",
    name: "CO₂ Fixation",
    nameBn: "CO₂ স্থিরীকরণ",
    description: "Carbon dioxide is incorporated into organic compounds",
    descriptionBn: "কার্বন ডাই অক্সাইড জৈব যৌগে অন্তর্ভুক্ত হয়",
    duration: 2000,
  },
  {
    id: "glucose-synthesis",
    name: "Glucose Synthesis",
    nameBn: "গ্লুকোজ সংশ্লেষণ",
    description: "Production of glucose from carbon dioxide and water",
    descriptionBn: "কার্বন ডাই অক্সাইড এবং পানি থেকে গ্লুকোজ উৎপাদন",
    duration: 2500,
  },
];

interface PhotosynthesisModelProps {
  onPartClick: (part: any) => void;
  language?: "en" | "bn";
  difficulty?: "beginner" | "intermediate" | "advanced";
}

// Component for animated molecules
const AnimatedMolecule = ({
  position,
  color,
  size = 0.1,
  speed = 0.02,
  path = "linear",
  destination,
  visible = true,
  id,
}: AnimatedMoleculeProps) => {
  const ref = useRef<THREE.Mesh>(null);
  const time = useRef(Math.random() * 100);
  const groupRef = useRef<THREE.Group>(null);

  // Set up molecule with specific appearance based on ID
  const getMoleculeGeometry = () => {
    if (id.includes("carbon")) {
      // CO2 molecule - a central carbon atom with two oxygen atoms
      return (
        <group ref={groupRef}>
          <mesh castShadow>
            <sphereGeometry args={[size, 16, 16]} />
            <meshStandardMaterial color="#555555" />
          </mesh>
          <mesh castShadow position={[size * 1.2, 0, 0]}>
            <sphereGeometry args={[size * 0.8, 16, 16]} />
            <meshStandardMaterial color="#ff5252" />
          </mesh>
          <mesh castShadow position={[-size * 1.2, 0, 0]}>
            <sphereGeometry args={[size * 0.8, 16, 16]} />
            <meshStandardMaterial color="#ff5252" />
          </mesh>
        </group>
      );
    }

    if (id.includes("water")) {
      // H2O molecule - oxygen with two hydrogen atoms
      return (
        <group ref={groupRef}>
          <mesh castShadow>
            <sphereGeometry args={[size, 16, 16]} />
            <meshStandardMaterial color="#29b6f6" />
          </mesh>
          <mesh castShadow position={[size * 0.8, size * 0.8, 0]}>
            <sphereGeometry args={[size * 0.5, 16, 16]} />
            <meshStandardMaterial color="#e3f2fd" />
          </mesh>
          <mesh castShadow position={[-size * 0.8, size * 0.8, 0]}>
            <sphereGeometry args={[size * 0.5, 16, 16]} />
            <meshStandardMaterial color="#e3f2fd" />
          </mesh>
        </group>
      );
    }

    if (id.includes("oxygen")) {
      // O2 molecule - two oxygen atoms
      return (
        <group ref={groupRef}>
          <mesh castShadow position={[size * 0.6, 0, 0]}>
            <sphereGeometry args={[size, 16, 16]} />
            <meshStandardMaterial color="#80deea" />
          </mesh>
          <mesh castShadow position={[-size * 0.6, 0, 0]}>
            <sphereGeometry args={[size, 16, 16]} />
            <meshStandardMaterial color="#80deea" />
          </mesh>
        </group>
      );
    }

    if (id.includes("glucose")) {
      // Simplified glucose molecule (hexagon shape for C6H12O6)
      return (
        <group ref={groupRef}>
          <mesh castShadow>
            <cylinderGeometry args={[size * 1.2, size * 1.2, size * 0.5, 6]} />
            <meshStandardMaterial color="#ffb74d" />
          </mesh>
          {/* Add small spheres for hydrogen and oxygen atoms */}
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh
              key={`c-${i}`}
              castShadow
              position={[
                Math.sin((i * Math.PI) / 3) * size * 0.8,
                0,
                Math.cos((i * Math.PI) / 3) * size * 0.8,
              ]}
            >
              <sphereGeometry args={[size * 0.3, 8, 8]} />
              <meshStandardMaterial color="#795548" />
            </mesh>
          ))}
        </group>
      );
    }

    // Default molecule
    return (
      <mesh ref={ref} castShadow>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  };

  // Animation logic for molecule movement
  useFrame(() => {
    if (!groupRef.current || !visible) return;

    time.current += 0.01;

    if (path === "linear" && destination) {
      // Move from position to destination
      const t = (Math.sin(time.current * speed * 10) + 1) / 2; // 0 to 1 oscillation

      groupRef.current.position.x = position[0] * (1 - t) + destination[0] * t;
      groupRef.current.position.y = position[1] * (1 - t) + destination[1] * t;
      groupRef.current.position.z = position[2] * (1 - t) + destination[2] * t;
    } else if (path === "curve") {
      // Move in a curved path
      groupRef.current.position.x =
        position[0] + Math.sin(time.current * speed * 5) * 0.3;
      groupRef.current.position.y =
        position[1] + Math.cos(time.current * speed * 3) * 0.2;
      groupRef.current.position.z =
        position[2] + Math.sin(time.current * speed * 4) * 0.2;
    } else if (path === "circle") {
      // Move in a circular path
      groupRef.current.position.x =
        position[0] + Math.sin(time.current * speed) * 0.3;
      groupRef.current.position.y = position[1];
      groupRef.current.position.z =
        position[2] + Math.cos(time.current * speed) * 0.3;
    }

    // Add small wiggle/rotation for all molecules
    groupRef.current.rotation.x += 0.01;
    groupRef.current.rotation.y += 0.01;
    groupRef.current.rotation.z += 0.005;
  });

  if (!visible) return null;

  // Render the molecule with its label
  return (
    <group position={position}>
      {getMoleculeGeometry()}
      <Html
        center
        position={[0, size * 1.5, 0]}
        style={{ pointerEvents: "none", opacity: 0.8 }}
      >
        <div className="px-2 py-1 text-xs rounded-md bg-gray-800 text-white whitespace-nowrap">
          {id.includes("carbon") && "CO₂"}
          {id.includes("water") && "H₂O"}
          {id.includes("oxygen") && "O₂"}
          {id.includes("glucose") && "C₆H₁₂O₆"}
        </div>
      </Html>
    </group>
  );
};

// Sunlight rays component with improved visuals
const SunlightRays = ({
  position,
  visible = true,
  intensity = 1,
}: {
  position: [number, number, number];
  visible?: boolean;
  intensity?: number;
}) => {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;

      // Add pulsing effect
      const pulse =
        ((Math.sin(clock.getElapsedTime() * 2) + 1) / 2) * 0.3 + 0.7;

      group.current.scale.set(pulse, pulse, pulse);
    }
  });

  if (!visible) return null;

  return (
    <group ref={group} position={position}>
      {/* Create more rays with varying lengths for more realistic sunlight */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={i}
          castShadow
          position={[0, 0, 0]}
          rotation={[0, 0, ((Math.PI * 2) / 12) * i]}
        >
          <boxGeometry args={[0.05, 2 + (i % 3) * 0.5, 0.05]} />
          <meshStandardMaterial
            transparent
            color="#ffee58"
            emissive="#ffee58"
            emissiveIntensity={intensity * 2}
            opacity={0.7}
          />
        </mesh>
      ))}
      {/* Add central glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          transparent
          color="#fff59d"
          emissive="#fff59d"
          emissiveIntensity={intensity * 3}
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

// Enhanced leaf shape component with better details
const LeafShape = ({
  quality = "high",
}: {
  quality?: "low" | "medium" | "high";
}) => {
  // Determine geometry detail based on quality setting
  const segments = quality === "high" ? 32 : quality === "medium" ? 24 : 16;

  return (
    <group position={[0, 0, 0]}>
      {/* Leaf body - slightly elliptical shape rather than perfect sphere */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1.5, segments, segments / 2]} />
        <meshStandardMaterial
          color="#4caf50"
          flatShading={false}
          metalness={0.2}
          roughness={0.7}
        />
      </mesh>

      {/* Leaf veins - central vein */}
      <mesh receiveShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[0.05, 0.05, 1.8]} />
        <meshStandardMaterial color="#388e3c" />
      </mesh>

      {/* Side veins with varying angles and lengths for more natural look */}
      {Array.from({ length: 7 }).map((_, i) => (
        <group
          key={`vein-${i}`}
          position={[0, 0.05 + (i % 2 ? 0.02 : -0.02), -0.9 + i * 0.3]}
          rotation={[0, i % 2 ? 0.6 + i * 0.1 : -0.6 - i * 0.1, 0]}
        >
          <mesh receiveShadow>
            <boxGeometry args={[0.8 - (i % 3) * 0.1, 0.03, 0.03]} />
            <meshStandardMaterial color="#388e3c" />
          </mesh>

          {/* Add smaller sub-veins */}
          {i % 2 === 0 && (
            <>
              <mesh
                receiveShadow
                position={[0.3, 0, 0.1]}
                rotation={[0, 0.3, 0]}
              >
                <boxGeometry args={[0.3, 0.02, 0.02]} />
                <meshStandardMaterial color="#388e3c" />
              </mesh>
              <mesh
                receiveShadow
                position={[0.3, 0, -0.1]}
                rotation={[0, -0.3, 0]}
              >
                <boxGeometry args={[0.3, 0.02, 0.02]} />
                <meshStandardMaterial color="#388e3c" />
              </mesh>
            </>
          )}
        </group>
      ))}

      {/* Add a subtle gradient texture to the leaf */}
      <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 3]} />
        <meshStandardMaterial
          transparent
          color="#4caf50"
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// Component for the chloroplast's internal structure
const ChloroplastInternals = ({ visible = true }: { visible?: boolean }) => {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (group.current) {
      // Subtle movement to represent fluid nature of chloroplast
      group.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.3) * 0.05;
    }
  });

  if (!visible) return null;

  return (
    <group ref={group}>
      {/* Thylakoid stacks (grana) */}
      {Array.from({ length: 5 }).map((_, i) => (
        <group
          key={`grana-${i}`}
          position={[
            ((i % 3) - 1) * 0.1,
            ((i % 2) - 0.5) * 0.15,
            (i % 2) * 0.1,
          ]}
        >
          {Array.from({ length: 4 }).map((_, j) => (
            <mesh
              key={`thylakoid-${i}-${j}`}
              position={[0, -0.05 + j * 0.03, 0]}
            >
              <torusGeometry args={[0.12, 0.02, 16, 32]} />
              <meshStandardMaterial color="#2e7d32" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Stroma matrix */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial transparent color="#81c784" opacity={0.3} />
      </mesh>

      {/* Starch granules */}
      <mesh position={[0.12, -0.1, 0.05]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial transparent color="#f5f5f5" opacity={0.6} />
      </mesh>

      {/* Chlorophyll molecules represented as small green points */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={`chlorophyll-${i}`}
          position={[
            Math.sin(i * 0.5) * 0.2,
            Math.cos(i * 0.5) * 0.2,
            Math.sin(i * 0.7) * 0.2,
          ]}
        >
          <sphereGeometry args={[0.01, 8, 8]} />
          <meshStandardMaterial
            color="#1b5e20"
            emissive="#1b5e20"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
};

// Component for the guard cells that control stomata
const GuardCells = ({
  open = true,
  animating = true,
}: {
  open?: boolean;
  animating?: boolean;
}) => {
  const leftCell = useRef<THREE.Mesh>(null);
  const rightCell = useRef<THREE.Mesh>(null);
  const [openState, setOpenState] = useState(open);

  useEffect(() => {
    setOpenState(open);
  }, [open]);

  useFrame(({ clock }) => {
    if (!leftCell.current || !rightCell.current) return;

    if (animating) {
      // Animate guard cells opening and closing
      const openAmount = Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5; // 0-1 oscillation

      leftCell.current.position.x = -0.05 - openAmount * 0.03;
      rightCell.current.position.x = 0.05 + openAmount * 0.03;
    } else {
      // Static position based on open state
      leftCell.current.position.x = openState ? -0.08 : -0.05;
      rightCell.current.position.x = openState ? 0.08 : 0.05;
    }
  });

  return (
    <group>
      {/* Left guard cell */}
      <mesh ref={leftCell} position={[-0.05, 0, 0]}>
        <capsuleGeometry args={[0.04, 0.08, 8, 8]} />
        <meshStandardMaterial color="#66bb6a" />
      </mesh>

      {/* Right guard cell */}
      <mesh ref={rightCell} position={[0.05, 0, 0]}>
        <capsuleGeometry args={[0.04, 0.08, 8, 8]} />
        <meshStandardMaterial color="#66bb6a" />
      </mesh>

      {/* Nucleus in each guard cell */}
      <mesh position={[-0.05, 0, 0.02]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#c5e1a5" />
      </mesh>
      <mesh position={[0.05, 0, 0.02]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#c5e1a5" />
      </mesh>
    </group>
  );
};

// Main photosynthesis 3D model component
const PhotosynthesisModel = ({
  onPartClick,
  language = "en",
  difficulty = "intermediate",
}: PhotosynthesisModelProps) => {
  const groupRef = useRef<THREE.Group>(null);
  // Store the selected part ID, though we currently only use the setter
  // and don't read the value directly in the component
  const [, setSelectedPartId] = useState<string | null>(null);
  const [animationState, setAnimationState] = useState({
    running: false,
    stage: 0,
    elapsed: 0,
  });
  const [visibleMolecules, setVisibleMolecules] = useState({
    water: true,
    co2: true,
    o2: true,
    glucose: true,
  });

  // Adjust visibility based on difficulty level
  useEffect(() => {
    let visibleParts = {
      water: true,
      co2: true,
      o2: true,
      glucose: true,
    };

    if (difficulty === "beginner") {
      // For beginners, show only the basic parts
      visibleParts = {
        water: true,
        co2: true,
        o2: true,
        glucose: true,
      };
    } else if (difficulty === "intermediate") {
      // For intermediate, show all basic molecules plus some animations
      visibleParts = {
        water: true,
        co2: true,
        o2: true,
        glucose: true,
      };
    } else if (difficulty === "advanced") {
      // For advanced, show all components with detailed animations
      visibleParts = {
        water: true,
        co2: true,
        o2: true,
        glucose: true,
      };
    }

    setVisibleMolecules(visibleParts);
  }, [difficulty]);

  // Handle click on a part of the model
  const handleClick = (part: PhotosynthesisPart) => {
    setSelectedPartId(part.id);
    // Ensure the part has all the properties expected by the parent component
    onPartClick({
      id: part.id,
      name: part.name,
      description: language === "en" ? part.description : part.descriptionBn,
      position: part.position,
    });
  };

  // Progress animation based on current stage
  useFrame(({ clock }) => {
    if (!animationState.running) return;

    // Calculate elapsed time and update animation state
    const currentTime = clock.getElapsedTime() * 1000; // convert to ms
    const currentStage = processStages[animationState.stage];

    if (currentTime - animationState.elapsed > currentStage.duration) {
      // Move to the next stage or loop back to start
      setAnimationState((prev) => ({
        ...prev,
        stage: (prev.stage + 1) % processStages.length,
        elapsed: currentTime,
      }));
    }
  });

  // Get part data by ID
  const getPart = (id: string) => {
    return photosynthesisParts.find((part) => part.id === id);
  };

  // Calculate camera position based on viewport size
  const { viewport } = useThree();
  const isMobile = viewport.width < 5;

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={isMobile ? 0.7 : 1}>
      {/* Base leaf structure */}
      <group
        onClick={() => handleClick(getPart("mesophyll") as PhotosynthesisPart)}
      >
        <LeafShape quality={difficulty === "advanced" ? "high" : "medium"} />
      </group>

      {/* Epidermis layer */}
      <mesh
        position={[0, 1.2, 0]}
        onClick={() =>
          handleClick(getPart("leaf-epidermis") as PhotosynthesisPart)
        }
      >
        <planeGeometry args={[3, 0.5]} />
        <meshStandardMaterial
          transparent
          color="#c8e6c9"
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Cuticle layer */}
      <mesh
        position={[0, 1.4, 0]}
        onClick={() => handleClick(getPart("cuticle") as PhotosynthesisPart)}
      >
        <planeGeometry args={[3.2, 0.2]} />
        <meshStandardMaterial
          transparent
          color="#d7ccc8"
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Chloroplast with detailed internal structure */}
      <group
        position={[0.5, 0, 0.3]}
        scale={[0.4, 0.3, 0.2]}
        onClick={() =>
          handleClick(getPart("chloroplast") as PhotosynthesisPart)
        }
      >
        <mesh castShadow>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial transparent color="#4caf50" opacity={0.8} />
        </mesh>

        <ChloroplastInternals visible={difficulty !== "beginner"} />
      </group>

      {/* Stomata with guard cells */}
      <group
        position={[-0.8, 0.9, 0.5]}
        scale={[0.3, 0.2, 0.3]}
        onClick={() => handleClick(getPart("stomata") as PhotosynthesisPart)}
      >
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 0.3, 16]} />
          <meshStandardMaterial transparent color="#80cbc4" opacity={0.5} />
        </mesh>

        <group position={[0, 0, 0]} scale={[1, 1, 1]}>
          <GuardCells
            animating={animationState.running && difficulty !== "beginner"}
            open={animationState.running}
          />
        </group>
      </group>

      {/* Vascular tissues - Xylem */}
      <group
        position={[0, -0.8, 0]}
        onClick={() => handleClick(getPart("xylem") as PhotosynthesisPart)}
      >
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.08, 1.5, 16]} />
          <meshStandardMaterial color="#90caf9" />
        </mesh>

        {/* Water molecules moving through xylem */}
        {difficulty !== "beginner" && visibleMolecules.water && (
          <>
            <AnimatedMolecule
              color="#29b6f6"
              destination={[0, 0.4, 0]}
              id="water-molecule-1"
              path="linear"
              position={[0, -0.6, 0]}
              size={0.05}
              speed={0.01}
              visible={animationState.running || !animationState.running}
            />
            <AnimatedMolecule
              color="#29b6f6"
              destination={[0, 0.6, 0]}
              id="water-molecule-2"
              path="linear"
              position={[0, -0.4, 0]}
              size={0.05}
              speed={0.015}
              visible={animationState.running || !animationState.running}
            />
          </>
        )}
      </group>

      {/* Vascular tissues - Phloem */}
      <group
        position={[0.3, -0.8, 0]}
        onClick={() => handleClick(getPart("phloem") as PhotosynthesisPart)}
      >
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.08, 1.5, 16]} />
          <meshStandardMaterial color="#ffcc80" />
        </mesh>

        {/* Glucose molecules moving through phloem */}
        {difficulty !== "beginner" && visibleMolecules.glucose && (
          <>
            <AnimatedMolecule
              color="#ffb74d"
              destination={[0, -0.6, 0]}
              id="glucose-molecule-1"
              path="linear"
              position={[0, 0.4, 0]}
              size={0.05}
              speed={0.01}
              visible={animationState.running || !animationState.running}
            />
          </>
        )}
      </group>

      {/* Sunlight rays */}
      <group position={[0, 2, 0]}>
        <SunlightRays
          intensity={
            difficulty === "beginner"
              ? 1
              : difficulty === "intermediate"
                ? 1.5
                : 2
          }
          position={[0, 0, 0]}
          visible={true}
        />
      </group>

      {/* CO2 molecules entering through stomata */}
      {visibleMolecules.co2 && (
        <AnimatedMolecule
          color="#9e9e9e"
          destination={[-0.4, 0.2, 0.5]}
          id="carbon-dioxide"
          path="linear"
          position={[-1.2, 0.9, 0.5]}
          size={0.06}
          speed={0.01}
          visible={animationState.running || !animationState.running}
        />
      )}

      {/* O2 molecules exiting through stomata */}
      {visibleMolecules.o2 && (
        <AnimatedMolecule
          color="#80deea"
          destination={[-1.2, 0.9, 0.5]}
          id="oxygen"
          path="linear"
          position={[-0.4, 0.2, 0.5]}
          size={0.06}
          speed={0.01}
          visible={animationState.running || !animationState.running}
        />
      )}

      {/* Water molecules coming from roots */}
      {visibleMolecules.water && (
        <AnimatedMolecule
          color="#29b6f6"
          destination={[0, -0.8, 0]}
          id="water"
          path="linear"
          position={[0, -1.5, 0]}
          size={0.06}
          speed={0.01}
          visible={animationState.running || !animationState.running}
        />
      )}

      {/* Glucose molecules being produced and transported */}
      {visibleMolecules.glucose && (
        <AnimatedMolecule
          color="#ffb74d"
          destination={[0.8, -0.8, 0]}
          id="glucose"
          path="linear"
          position={[0.5, 0, 0.3]}
          size={0.08}
          speed={0.005}
          visible={animationState.running || !animationState.running}
        />
      )}

      {/* Status display */}
      {difficulty !== "beginner" && (
        <Html position={[-2, 1.5, 0]}>
          <div className="bg-gray-800 text-white p-2 rounded-md text-xs">
            <p>
              {language === "en" ? "Process: " : "প্রক্রিয়া: "}
              {language === "en"
                ? processStages[animationState.stage].name
                : processStages[animationState.stage].nameBn}
            </p>
          </div>
        </Html>
      )}

      {/* Ambient light */}
      <ambientLight intensity={0.5} />

      {/* Directional light (sun) */}
      <directionalLight
        castShadow
        intensity={1}
        position={[5, 5, 5]}
        shadow-mapSize-height={1024}
        shadow-mapSize-width={1024}
      />

      {/* Fill light for better visibility */}
      <pointLight intensity={0.5} position={[-3, 3, 3]} />
    </group>
  );
};

// Export the component
export default PhotosynthesisModel;
