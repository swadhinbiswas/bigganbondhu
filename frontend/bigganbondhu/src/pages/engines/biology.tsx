import { Html, OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  Component,
  ReactNode,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import * as THREE from "three";

import apiService from "@/services/apiService";
import DefaultLayout from "@/layouts/default";

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

type BiologyModel = {
  id: string;
  title: string;
  description: string;
  modelUrl: string;
  scale: number;
  position: [number, number, number];
  parts: {
    id: string;
    name: string;
    description: string;
    position: [number, number, number];
  }[];
};

type BiologyExperiment = {
  id: string;
  title: string;
  description: string;
  models: BiologyModel[];
};

// Loading component for 3D models
function ModelLoader() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="bg-blue-100 p-2 sm:p-3 rounded-md">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-blue-500 mx-auto" />
        <p className="mt-2 text-xs sm:text-sm">
          মডেল লোড হচ্ছে... {progress.toFixed(0)}%
        </p>
      </div>
    </Html>
  );
}

// Model component with interactive parts
const Model = ({
  model,
  onPartClick,
}: {
  model: BiologyModel;
  onPartClick: (part: any) => void;
}) => {
  const [modelError, setModelError] = useState(false);
  const { scene } = useGLTF(model.modelUrl, undefined, undefined, (error) => {
    console.error("Error loading model:", error);
    setModelError(true);
  });

  useEffect(() => {
    // Preload the model to ensure it's available
    if (model.modelUrl) {
      try {
        useGLTF.preload(model.modelUrl);
      } catch (error) {
        console.error("Error preloading model:", error);
        setModelError(true);
      }
    }

    // Cleanup function
    return () => {
      try {
        useGLTF.clear(model.modelUrl);
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, [model.modelUrl]);

  if (modelError) {
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
        <Html center position={[0, 1.5, 0]}>
          <div
            className="bg-red-100 p-2 rounded text-red-800 text-center"
            style={{ width: "200px" }}
          >
            <p>মডেল লোড করা যায়নি</p>
            <p className="text-xs">(Could not load model)</p>
          </div>
        </Html>
      </mesh>
    );
  }

  return (
    <group position={new THREE.Vector3(...model.position)} scale={model.scale}>
      <primitive object={scene} />

      {/* Interactive hotspots for parts */}
      {model.parts.map((part) => (
        <mesh
          key={part.id}
          position={new THREE.Vector3(...part.position)}
          onClick={(e) => {
            e.stopPropagation();
            onPartClick(part);
          }}
        >
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial transparent color="red" opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
};

const BiologyEngine = () => {
  const [experiments, setExperiments] = useState<BiologyExperiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] =
    useState<BiologyExperiment | null>(null);
  const [selectedModel, setSelectedModel] = useState<BiologyModel | null>(null);
  const [selectedPart, setSelectedPart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Audio player ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch biology experiments
  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        setLoading(true);
        const data = (await apiService.biology.getExperiments()) as any;

        setExperiments(data.experiments);
        if (data.experiments.length > 0) {
          setSelectedExperiment(data.experiments[0]);
          if (data.experiments[0].models.length > 0) {
            setSelectedModel(data.experiments[0].models[0]);
          }
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to load biology experiments");
        setLoading(false);
        console.error(err);
      }
    };

    fetchExperiments();
  }, []);

  const handlePartClick = (part: any) => {
    setSelectedPart(part);
    playAudioNarration(part.description);
  };

  const playAudioNarration = async (text: string) => {
    try {
      // Get the full URL for the audio endpoint
      const audioUrl = apiService.audio.getAudio(text);

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Create and play new audio
      const audio = new Audio(audioUrl);

      audioRef.current = audio;
      audio.play();
    } catch (err) {
      console.error("Failed to play audio narration", err);
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-32 sm:h-64">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      </DefaultLayout>
    );
  }

  if (error) {
    return (
      <DefaultLayout>
        <div className="text-center p-3 sm:p-4 text-red-500 text-sm sm:text-base">
          {error}
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 max-w-5xl">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-center">
          জীববিজ্ঞান অধ্যয়ন
        </h1>

        {/* Experiment Selector */}
        <div className="mb-3 sm:mb-4">
          <label className="block mb-1 sm:mb-2 text-sm sm:text-base md:text-lg font-medium">
            অধ্যয়ন নির্বাচন করুন:
          </label>
          <select
            className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
            value={selectedExperiment?.id}
            onChange={(e) => {
              const selected = experiments.find(
                (exp) => exp.id === e.target.value,
              );

              if (selected) {
                setSelectedExperiment(selected);
                if (selected.models.length > 0) {
                  setSelectedModel(selected.models[0]);
                } else {
                  setSelectedModel(null);
                }
                setSelectedPart(null);
              }
            }}
          >
            {experiments.map((exp) => (
              <option key={exp.id} value={exp.id}>
                {exp.title}
              </option>
            ))}
          </select>
        </div>

        {selectedExperiment && (
          <>
            {/* Description and Audio */}
            <div className="mb-3 sm:mb-4 bg-blue-50 dark:bg-blue-950 p-3 sm:p-4 rounded-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-0 dark:text-gray-100">
                  {selectedExperiment.title}
                </h2>
                <button
                  aria-label="Play audio narration"
                  className="bg-blue-600 text-white px-3 py-1 sm:py-2 rounded-md hover:bg-blue-700 flex items-center text-sm sm:text-base touch-optimized-button"
                  onClick={() =>
                    playAudioNarration(selectedExperiment.description)
                  }
                >
                  <span className="mr-1">🔊</span> শুনুন
                </button>
              </div>
              <p className="text-gray-700 dark:text-gray-200 text-xs sm:text-sm md:text-base mt-2">
                {selectedExperiment.description}
              </p>
            </div>

            {/* Model Selector (if multiple models) */}
            {selectedExperiment.models.length > 1 && (
              <div className="mb-3 sm:mb-4">
                <label className="block mb-1 sm:mb-2 text-sm sm:text-base md:text-lg font-medium">
                  মডেল নির্বাচন করুন:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                  {selectedExperiment.models.map((model) => (
                    <button
                      key={model.id}
                      className={`p-3 sm:p-4 border rounded-md text-center transition-colors text-gray-900 dark:text-gray-100 text-sm sm:text-base touch-optimized-button ${
                        selectedModel?.id === model.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                          : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => setSelectedModel(model)}
                    >
                      {model.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3D Model Display and Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* 3D Viewer */}
              <div className="lg:col-span-2">
                <div
                  className="bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden border border-gray-300 dark:border-gray-700 flex items-center justify-center"
                  style={{ height: "280px", minHeight: "250px" }}
                >
                  {selectedModel ? (
                    selectedModel.title.includes("হৃদপিণ্ড") ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <iframe
                          allowFullScreen
                          allow="autoplay; fullscreen; xr-spatial-tracking"
                          className="w-full h-full rounded-md border-none"
                          frameBorder="0"
                          src="https://sketchfab.com/models/a70c0c47fe4b4bbfabfc8f445365d5a4/embed"
                          style={{ background: "transparent" }}
                          title="3d Animated Realistic Human Heart V1.0"
                        />
                      </div>
                    ) : (
                      <ErrorBoundary
                        fallback={
                          <div className="flex flex-col items-center justify-center h-full">
                            <div className="bg-red-100 p-3 sm:p-4 rounded-md text-red-800 text-center">
                              <p className="text-base sm:text-lg font-bold">
                                ত্রুটি!
                              </p>
                              <p className="text-sm sm:text-base">
                                3D মডেল লোড করা যাচ্ছে না
                              </p>
                            </div>
                          </div>
                        }
                      >
                        <Canvas
                          shadows
                          camera={{ position: [0, 0, 5], fov: 50 }}
                          dpr={[1, 2]}
                          gl={{ alpha: false }}
                        >
                          <color args={["#f0f0f0"]} attach="background" />
                          <ambientLight intensity={0.5} />
                          <spotLight
                            castShadow
                            angle={0.15}
                            penumbra={1}
                            position={[10, 10, 10]}
                          />
                          <pointLight position={[-10, -10, -10]} />

                          <Suspense fallback={<ModelLoader />}>
                            <Model
                              model={selectedModel}
                              onPartClick={handlePartClick}
                            />
                          </Suspense>

                          <OrbitControls
                            enablePan={true}
                            enableRotate={true}
                            enableZoom={true}
                          />
                        </Canvas>
                      </ErrorBoundary>
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                        No model selected
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    টিপ: মডেলটি ঘোরাতে ক্লিক করে টেনে আনুন, জুম করতে স্ক্রোল
                    করুন
                  </p>
                </div>
              </div>

              {/* Part Information */}
              <div className="bg-white dark:bg-gray-900 rounded-md shadow-md p-3 sm:p-4 h-min border border-gray-200 dark:border-gray-700">
                {selectedPart ? (
                  <>
                    <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">
                      {selectedPart.name}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-200 mb-4">
                      {selectedPart.description}
                    </p>
                    <button
                      aria-label="Play audio narration for this part"
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 flex items-center"
                      onClick={() =>
                        playAudioNarration(selectedPart.description)
                      }
                    >
                      <span className="mr-1">🔊</span> এই অংশ সম্পর্কে শুনুন
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="text-5xl mb-4">👆</div>
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      মডেলের লাল বিন্দুগুলিতে ক্লিক করে বিস্তারিত দেখুন
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DefaultLayout>
  );
};

export default BiologyEngine;
