import DefaultLayout from "@/layouts/default";
import { Html, OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import axios from "axios";
import {
  Component,
  ReactNode,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import * as THREE from "three";

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
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
      <div className="bg-blue-100 p-3 rounded-md">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2">মডেল লোড হচ্ছে... {progress.toFixed(0)}%</p>
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
        <Html position={[0, 1.5, 0]} center>
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
          <meshBasicMaterial color="red" transparent opacity={0.6} />
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
        const response = await axios.get(
          "http://localhost:8000/api/experiments/biology"
        );
        setExperiments(response.data.experiments);
        if (response.data.experiments.length > 0) {
          setSelectedExperiment(response.data.experiments[0]);
          if (response.data.experiments[0].models.length > 0) {
            setSelectedModel(response.data.experiments[0].models[0]);
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
      const response = await axios.get(
        `http://localhost:8000/api/audio?text=${encodeURIComponent(text)}`,
        {
          responseType: "blob",
        }
      );

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audioBlob = new Blob([response.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);

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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DefaultLayout>
    );
  }

  if (error) {
    return (
      <DefaultLayout>
        <div className="text-center p-4 text-red-500">{error}</div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="container mx-auto px-2 py-4 max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">
          জীববিজ্ঞান অধ্যয়ন
        </h1>

        {/* Experiment Selector */}
        <div className="mb-4">
          <label className="block mb-1 text-base md:text-lg font-medium">
            অধ্যয়ন নির্বাচন করুন:
          </label>
          <select
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
            value={selectedExperiment?.id}
            onChange={(e) => {
              const selected = experiments.find(
                (exp) => exp.id === e.target.value
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
            <div className="mb-4 bg-blue-50 dark:bg-blue-950 p-3 md:p-4 rounded-md">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-0 dark:text-gray-100">
                  {selectedExperiment.title}
                </h2>
                <button
                  onClick={() =>
                    playAudioNarration(selectedExperiment.description)
                  }
                  className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 flex items-center"
                  aria-label="Play audio narration"
                >
                  <span className="mr-1">🔊</span> শুনুন
                </button>
              </div>
              <p className="text-gray-700 dark:text-gray-200 text-sm md:text-base">
                {selectedExperiment.description}
              </p>
            </div>

            {/* Model Selector (if multiple models) */}
            {selectedExperiment.models.length > 1 && (
              <div className="mb-4">
                <label className="block mb-1 text-base md:text-lg font-medium">
                  মডেল নির্বাচন করুন:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedExperiment.models.map((model) => (
                    <button
                      key={model.id}
                      className={`p-4 border rounded-md text-center transition-colors text-gray-900 dark:text-gray-100 ${
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 3D Viewer */}
              <div className="lg:col-span-2">
                <div
                  className="bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden border border-gray-300 dark:border-gray-700 flex items-center justify-center"
                  style={{ height: "340px" }}
                >
                  {selectedModel ? (
                    selectedModel.title.includes("হৃদপিণ্ড") ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <iframe
                          title="3d Animated Realistic Human Heart V1.0"
                          frameBorder="0"
                          allowFullScreen
                          mozAllowFullScreen={true}
                          webkitAllowFullScreen={true}
                          allow="autoplay; fullscreen; xr-spatial-tracking"
                          xr-spatial-tracking="true"
                          execution-while-out-of-viewport="true"
                          execution-while-not-rendered="true"
                          web-share="true"
                          src="https://sketchfab.com/models/a70c0c47fe4b4bbfabfc8f445365d5a4/embed"
                          className="w-full h-[320px] md:h-[340px] rounded-md border-none"
                          style={{ background: "transparent" }}
                        ></iframe>
                      </div>
                    ) : (
                      <ErrorBoundary
                        fallback={
                          <div className="flex flex-col items-center justify-center h-full">
                            <div className="bg-red-100 p-4 rounded-md text-red-800 text-center">
                              <p className="text-lg font-bold">ত্রুটি!</p>
                              <p>3D মডেল লোড করা যাচ্ছে না</p>
                            </div>
                          </div>
                        }
                      >
                        <Canvas
                          camera={{ position: [0, 0, 5], fov: 50 }}
                          shadows
                          dpr={[1, 2]}
                          gl={{ alpha: false }}
                        >
                          <color attach="background" args={["#f0f0f0"]} />
                          <ambientLight intensity={0.5} />
                          <spotLight
                            position={[10, 10, 10]}
                            angle={0.15}
                            penumbra={1}
                            castShadow
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
                            enableZoom={true}
                            enableRotate={true}
                          />
                        </Canvas>
                      </ErrorBoundary>
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 dark:text-gray-400">
                        No model selected
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    টিপ: মডেলটি ঘোরাতে ক্লিক করে টেনে আনুন, জুম করতে স্ক্রোল
                    করুন
                  </p>
                </div>
              </div>

              {/* Part Information */}
              <div className="bg-white dark:bg-gray-900 rounded-md shadow-md p-4 h-min border border-gray-200 dark:border-gray-700">
                {selectedPart ? (
                  <>
                    <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">
                      {selectedPart.name}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-200 mb-4">
                      {selectedPart.description}
                    </p>
                    <button
                      onClick={() =>
                        playAudioNarration(selectedPart.description)
                      }
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 flex items-center"
                      aria-label="Play audio narration for this part"
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
