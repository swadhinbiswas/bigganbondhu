import { Html, useGLTF, useProgress } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
const AnimalCellModel = ({
  modelUrl,
  onPartClick,
}: {
  modelUrl: string;
  onPartClick: (part: any) => void;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [error, setError] = useState(false);
  const { progress, errors } = useProgress();

  // Troubleshooting log
  useEffect(() => {
    console.log("Loading model from URL:", modelUrl);
    console.log("Current loading progress:", progress);
    if (errors.length > 0) {
      console.error("Loading errors:", errors);
      setError(true);
    }
  }, [modelUrl, progress, errors]);

  // Use try-catch with useGLTF to handle loading errors
  const result = useGLTF(modelUrl, undefined, undefined, (error) => {
    console.error("Error loading model:", error);
    setError(true);
  });

  const { scene } = result;

  // Auto rotation effect
  useFrame(() => {
    if (groupRef.current && !hoveredPart) {
      groupRef.current.rotation.y += 0.002;
    }
  });
  useEffect(() => {
    if (scene) {
      try {
        // Apply materials and setup model
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            // Make sure all materials are properly configured
            if (object.material) {
              // Clone the material to prevent shared materials issues
              const material = object.material.clone();

              // Enhance the material
              if (material instanceof THREE.MeshStandardMaterial) {
                material.roughness = 0.7;
                material.metalness = 0.3;
                material.transparent = true;
                material.opacity = 0.9;
              }
              object.material = material;
              object.castShadow = true;
              object.receiveShadow = true;
            }
          }
        });
        setModelLoaded(true);
      } catch (err) {
        console.error("Error setting up model:", err);
        setError(true);
      }
    }
    // Preload model
    try {
      useGLTF.preload(modelUrl);
    } catch (err) {
      console.error("Error preloading model:", err);
      setError(true);
    }

    return () => {
      // Clean up
      try {
        useGLTF.clear(modelUrl);
      } catch (err) {
        // Ignore cleanup errors
        console.warn("Cleanup error:", err);
      }
    };
  }, [scene, modelUrl]);

  // Define cell parts and their positions
  // These would ideally be detected from the actual model or provided by metadata
  const cellParts = [
    {
      id: "nucleus",
      name: "নিউক্লিয়াস",
      description:
        "নিউক্লিয়াস হল কোষের কেন্দ্রীয় অংশ যা ডিএনএ (DNA) ধারণ করে এবং কোষের সমস্ত কার্যকলাপ নিয়ন্ত্রণ করে।",
      position: [0, 0, 1],
    },
    {
      id: "mitochondria",
      name: "মাইটোকন্ড্রিয়া",
      description:
        "মাইটোকন্ড্রিয়া হল কোষের 'শক্তি কেন্দ্র' যা খাদ্য থেকে শক্তি (ATP) উৎপাদন করে।",
      position: [1.5, 0.8, 0.5],
    },
    {
      id: "endoplasmic-reticulum",
      name: "এন্ডোপ্লাজমিক রেটিকুলাম",
      description:
        "এন্ডোপ্লাজমিক রেটিকুলাম একটি ঝিল্লি নেটওয়ার্ক যা প্রোটিন সংশ্লেষণ এবং লিপিড উৎপাদনে সাহায্য করে।",
      position: [-1.2, 0.6, 1],
    },
    {
      id: "golgi-apparatus",
      name: "গলজি বডি",
      description: "গলজি বডি প্রোটিন প্যাকেজিং এবং পরিবহনের কাজ করে।",
      position: [-0.8, -1, 0.8],
    },
    {
      id: "lysosome",
      name: "লাইসোসোম",
      description:
        "লাইসোসোম পাচক এনজাইম ধারণ করে এবং কোষীয় ধ্বংসাবশেষ হজম করে।",
      position: [1, -0.9, 0.5],
    },
    {
      id: "cell-membrane",
      name: "কোষ ঝিল্লি",
      description:
        "কোষ ঝিল্লি কোষকে ঢেকে রাখে এবং নির্বাচিতভাবে পদার্থের প্রবেশ ও বহির্গমন নিয়ন্ত্রণ করে।",
      position: [0, 1.8, 0],
    },
  ]; // If there's an error, show error message

  if (error) {
    return (
      <Html center>
        <div className="bg-red-100 p-4 rounded-md">
          <p className="text-red-800 font-bold">মডেল লোড করতে ত্রুটি হয়েছে</p>
          <p className="text-red-600 text-sm">
            ফাইল লোড করতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।
          </p>
          <button
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => window.location.reload()}
          >
            পুনরায় চেষ্টা করুন
          </button>
        </div>
      </Html>
    );
  }

  return (
    <group ref={groupRef}>
      {/* The main cell model */}
      {scene && (
        <primitive
          castShadow
          receiveShadow
          object={scene}
          position={[0, 0, 0]}
          scale={3}
          onPointerOut={() => setHoveredPart(null)}
          onPointerOver={() => setHoveredPart("cell")}
        />
      )}

      {/* Interactive hotspots for each part - only show if model is loaded */}
      {modelLoaded &&
        cellParts.map((part) => (
          <group key={part.id} position={new THREE.Vector3(...part.position)}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onPartClick(part);
              }}
              onPointerOut={() => setHoveredPart(null)}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredPart(part.id);
              }}
            >
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshBasicMaterial
                transparent
                color={hoveredPart === part.id ? "#ff4d4d" : "#ff8080"}
                opacity={hoveredPart === part.id ? 0.9 : 0.7}
              />
            </mesh>

            {/* Label that appears on hover */}
            {hoveredPart === part.id && (
              <Html center position={[0, 0.4, 0]}>
                <div className="bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 p-3 rounded-md shadow-md text-center pointer-events-none border border-blue-200">
                  <p className="font-bold text-base">{part.name}</p>
                </div>
              </Html>
            )}
          </group>
        ))}

      {/* Loading message with progress */}
      {!modelLoaded && !error && (
        <Html center>
          <div className="bg-blue-100 p-6 rounded-lg shadow-lg border border-blue-200">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto" />
            <p className="mt-4 font-medium text-lg">
              প্রাণী কোষের মডেল লোড হচ্ছে... {Math.round(progress)}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${Math.round(progress)}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              ({modelUrl} থেকে লোড হচ্ছে)
            </p>
            <p className="text-sm text-gray-600">
              (মডেল সাইজ বড় হওয়ায় কিছু সময় লাগতে পারে)
            </p>
          </div>
        </Html>
      )}
    </group>
  );
};

export default AnimalCellModel;
