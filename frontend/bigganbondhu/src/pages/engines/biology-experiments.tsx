import AnimalCellModel from "@/components/biology/AnimalCellModel";
import CellComparison from "@/components/biology/CellComparison";
import DNASimulation from "@/components/biology/DNASimulation";
import PhotosynthesisModel from "@/components/biology/PhotosynthesisModel";
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
import { useNavigate, useParams } from "react-router-dom";
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
    position?: [number, number, number];
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
      <div className="bg-blue-100 p-6 rounded-lg shadow-lg border border-blue-200">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
        <p className="mt-4 font-medium text-lg">
          মডেল লোড হচ্ছে... {progress.toFixed(0)}%
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress.toFixed(0)}%` }}
          ></div>
        </div>
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
          position={
            part.position
              ? new THREE.Vector3(...part.position)
              : new THREE.Vector3(0, 0, 0)
          }
          onClick={(e) => {
            e.stopPropagation();
            onPartClick(part);
          }}
        >
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial color="red" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
};

const BiologyExperiments = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [experiments, setExperiments] = useState<BiologyExperiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] =
    useState<BiologyExperiment | null>(null);
  const [selectedModel, setSelectedModel] = useState<BiologyModel | null>(null);
  const [selectedPart, setSelectedPart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryTitle, setCategoryTitle] = useState({ bn: "", en: "" });

  // Audio player ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Set category title based on the URL parameter
    switch (category) {
      case "introduction":
        setCategoryTitle({
          bn: "জীবন বিজ্ঞান পরিচিতি",
          en: "Introduction to Life Science",
        });
        break;
      case "systems":
        setCategoryTitle({
          bn: "জৈবিক সিস্টেম ও প্রক্রিয়া",
          en: "Systems & Processes",
        });
        break;
      case "advanced":
        setCategoryTitle({
          bn: "উন্নত ধারণাসমূহ",
          en: "Advanced Concepts",
        });
        break;
      default:
        setCategoryTitle({
          bn: "জীববিজ্ঞান",
          en: "Biology",
        });
    }

    // Fetch biology experiments
    const fetchExperiments = async () => {
      try {
        setLoading(true);
        let apiUrl = "http://localhost:8000/api/experiments/biology";

        // If we have a category, add it as a query parameter
        if (category) {
          apiUrl += `?category=${category}`;
        }

        const response = await axios.get(apiUrl);

        console.log("Loaded experiments:", response.data.experiments);

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
  }, [category]);

  // Effect for cleanup of audio resources
  useEffect(() => {
    return () => {
      // Clean up audio playback when component unmounts
      if (audioRef.current) {
        // If there's a URL object stored in the audio src, revoke it
        if (audioRef.current.src && audioRef.current.src.startsWith("blob:")) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePartClick = (part: any) => {
    // Ensure part has all necessary properties before setting it as selected
    const safePartData = {
      ...part,
      position: part.position || [0, 0, 0], // Set default position if it doesn't exist
    };
    setSelectedPart(safePartData);
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

      // Stop any currently playing audio to prevent AbortError
      if (audioRef.current) {
        // If there's a previous audioUrl stored, revoke it to prevent memory leaks
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        audioRef.current.pause();
      }

      const audioBlob = new Blob([response.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);

      // Store the audio element for later cleanup
      audioRef.current = audio;

      // Set up ended event to clean up the URL object
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };

      // Use try-catch specifically for the play() Promise to handle AbortError
      try {
        await audio.play();
      } catch (playError) {
        // Handle AbortError or other play errors
        console.warn("Audio playback was interrupted:", playError);
        // Clean up the URL if play fails
        URL.revokeObjectURL(audioUrl);
      }
    } catch (error) {
      console.error("Error playing audio narration:", error);
    }
  };

  return (
    <DefaultLayout>
      <div className="w-full">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold mb-2 text-blue-600 dark:text-blue-400">
                {categoryTitle.bn}
              </h1>
              <div className="w-24 h-1 bg-blue-500 mx-auto mb-3 rounded-full"></div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {categoryTitle.en}
              </p>

              <button
                onClick={() => navigate("/engines/biology")}
                className="inline-flex items-center px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                বিভাগে ফিরে যান / Back to categories
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-800 p-4 rounded-md text-center">
              {error}
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left sidebar for experiments list */}
              <div className="md:w-1/4">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center mb-4">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></div>
                    <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      এক্সপেরিমেন্টস
                    </h3>
                  </div>
                  <div className="space-y-1.5">
                    {experiments.map((experiment) => (
                      <div
                        key={experiment.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                          selectedExperiment?.id === experiment.id
                            ? "bg-blue-100 dark:bg-blue-900/40 border-l-4 border-blue-500 pl-2"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700 border-l-4 border-transparent pl-2"
                        }`}
                        onClick={() => {
                          setSelectedExperiment(experiment);
                          if (experiment.models.length > 0) {
                            setSelectedModel(experiment.models[0]);
                            setSelectedPart(null);
                          }
                        }}
                      >
                        <div className="font-medium">{experiment.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div className="md:w-3/4">
                {selectedExperiment ? (
                  <div className="bg-white dark:bg-gray-800 p-0 rounded-xl shadow-lg overflow-hidden">
                    <div className="relative overflow-hidden bg-blue-600 dark:bg-blue-700 p-6">
                      <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <svg
                          className="w-full h-full"
                          viewBox="0 0 100 100"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <defs>
                            <pattern
                              id="grid"
                              width="10"
                              height="10"
                              patternUnits="userSpaceOnUse"
                            >
                              <path
                                d="M 10 0 L 0 0 0 10"
                                fill="none"
                                stroke="white"
                                strokeWidth="1"
                              />
                            </pattern>
                          </defs>
                          <rect width="100" height="100" fill="url(#grid)" />
                        </svg>
                      </div>
                      <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-white mb-2">
                          {selectedExperiment.title}
                        </h2>
                        <p className="text-blue-100 dark:text-blue-200 text-sm max-w-3xl">
                          {selectedExperiment.description}
                        </p>
                      </div>
                    </div>
                    <div className="p-5">{/* Main content starts here */}</div>

                    {/* Model viewer */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-4">
                      <div className="h-[600px] w-full bg-gray-50 dark:bg-gray-900">
                        <ErrorBoundary
                          fallback={
                            <div className="h-full flex justify-center items-center">
                              <div className="bg-red-100 p-4 rounded-md">
                                <p className="text-red-800">
                                  মডেল লোড করতে ত্রুটি হয়েছে
                                </p>
                              </div>
                            </div>
                          }
                        >
                          {selectedExperiment?.id === "cell-comparison" ? (
                            <CellComparison />
                          ) : selectedExperiment?.id === "photosynthesis" ? (
                            <Canvas
                              camera={{ position: [0, 0, 7], fov: 45 }}
                              style={{ height: "100%" }}
                              shadows
                            >
                              {/* Rendering photosynthesis model */}
                              <ambientLight intensity={0.8} />
                              <spotLight
                                position={[10, 10, 10]}
                                angle={0.15}
                                penumbra={1}
                                castShadow
                                intensity={1}
                              />
                              <pointLight
                                position={[-10, -10, -10]}
                                intensity={0.5}
                              />
                              <Suspense fallback={<ModelLoader />}>
                                <PhotosynthesisModel
                                  onPartClick={handlePartClick}
                                />
                              </Suspense>
                              <OrbitControls
                                enablePan={true}
                                enableZoom={true}
                                maxDistance={15}
                                minDistance={3}
                              />
                            </Canvas>
                          ) : selectedModel?.id === "animal-cell" &&
                            selectedModel.modelUrl.includes(
                              "animalcell.glb"
                            ) ? (
                            <Canvas
                              camera={{ position: [0, 0, 7], fov: 45 }}
                              style={{ height: "100%" }}
                              shadows
                            >
                              <ambientLight intensity={0.8} />
                              <spotLight
                                position={[10, 10, 10]}
                                angle={0.15}
                                penumbra={1}
                                castShadow
                                intensity={1}
                              />
                              <pointLight
                                position={[-10, -10, -10]}
                                intensity={0.5}
                              />
                              <Suspense fallback={<ModelLoader />}>
                                <AnimalCellModel
                                  modelUrl={selectedModel.modelUrl}
                                  onPartClick={handlePartClick}
                                />
                              </Suspense>
                              <OrbitControls
                                enablePan={true}
                                enableZoom={true}
                                maxDistance={15}
                                minDistance={3}
                              />
                            </Canvas>
                          ) : selectedModel?.modelUrl.includes(
                              "sketchfab.com"
                            ) ? (
                            <div className="h-full w-full flex flex-col">
                              {/* Enhanced model container with professional styling */}
                              <div className="flex-grow border-2 border-blue-300 dark:border-blue-700 rounded-xl overflow-hidden shadow-xl relative">
                                <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-blue-600 to-blue-700 flex items-center px-4 z-10">
                                  <div className="flex items-center">
                                    <svg
                                      className="w-5 h-5 text-white mr-2"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                                      />
                                    </svg>
                                    <span className="text-white font-semibold text-sm">
                                      {selectedModel.title.split("(")[0].trim()}
                                    </span>
                                  </div>
                                  <div className="ml-auto hidden md:flex items-center bg-blue-800 rounded-full px-3 py-1 text-xs text-white">
                                    <svg
                                      className="w-4 h-4 mr-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                      />
                                    </svg>
                                    ইন্টারেক্টিভ মডেল
                                  </div>
                                </div>
                                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
                                <div className="w-full h-full relative">
                                  {/* Modern loading animation */}
                                  <div className="absolute inset-0 flex items-center justify-center z-0">
                                    <div className="flex flex-col items-center">
                                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                                      <p className="text-blue-600 dark:text-blue-400 font-medium">
                                        ত্রিমাত্রিক মডেল লোড হচ্ছে...
                                      </p>
                                      <p className="text-gray-500 text-sm">
                                        Loading 3D model...
                                      </p>
                                    </div>
                                  </div>
                                  <iframe
                                    title={selectedModel.title}
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    allowFullScreen={true}
                                    allow="autoplay; fullscreen; xr-spatial-tracking"
                                    src={selectedModel.modelUrl}
                                    className="w-full h-full border-none relative z-10"
                                    style={{ background: "transparent" }}
                                  ></iframe>
                                </div>
                              </div>

                              {/* Enhanced part selector with visual design */}
                              {selectedModel.parts &&
                                selectedModel.parts.length > 0 && (
                                  <div className="bg-blue-50 dark:bg-gray-800 p-4 mt-4 rounded-xl shadow-md">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center">
                                        <div className="w-2 h-10 bg-blue-500 rounded-full mr-3"></div>
                                        <h3 className="text-base font-semibold text-blue-600 dark:text-blue-400">
                                          অংশগুলি অন্বেষণ করুন | Explore Parts
                                        </h3>
                                      </div>
                                      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-full px-3 py-1 flex items-center text-xs text-blue-600 dark:text-blue-400">
                                        <svg
                                          className="w-4 h-4 mr-1"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                          />
                                        </svg>
                                        অংশটি বিস্তারিত দেখতে ক্লিক করুন
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                      {selectedModel.parts.map((part) => (
                                        <button
                                          key={part.id}
                                          className={`px-4 py-3 flex items-center justify-between text-sm rounded-lg transition-all duration-200 ${
                                            selectedPart?.id === part.id
                                              ? "bg-blue-500 text-white shadow-lg"
                                              : "bg-white dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-700"
                                          }`}
                                          onClick={() => handlePartClick(part)}
                                        >
                                          <div className="flex items-center">
                                            <div
                                              className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                                                selectedPart?.id === part.id
                                                  ? "bg-white/20"
                                                  : "bg-blue-100 dark:bg-blue-900"
                                              }`}
                                            >
                                              {/* Different icon for each digestive system part */}
                                              {part.id === "mouth" && (
                                                <svg
                                                  className="w-5 h-5"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                                  />
                                                </svg>
                                              )}
                                              {part.id === "esophagus" && (
                                                <svg
                                                  className="w-5 h-5"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                                  />
                                                </svg>
                                              )}
                                              {part.id === "stomach" && (
                                                <svg
                                                  className="w-5 h-5"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                  />
                                                </svg>
                                              )}
                                              {part.id ===
                                                "small-intestine" && (
                                                <svg
                                                  className="w-5 h-5"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                                  />
                                                </svg>
                                              )}
                                              {part.id ===
                                                "large-intestine" && (
                                                <svg
                                                  className="w-5 h-5"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                                                  />
                                                </svg>
                                              )}
                                              {part.id === "liver" && (
                                                <svg
                                                  className="w-5 h-5"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                                  />
                                                </svg>
                                              )}
                                              {part.id === "pancreas" && (
                                                <svg
                                                  className="w-5 h-5"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                                  />
                                                </svg>
                                              )}
                                              {![
                                                "mouth",
                                                "esophagus",
                                                "stomach",
                                                "small-intestine",
                                                "large-intestine",
                                                "liver",
                                                "pancreas",
                                              ].includes(part.id) && (
                                                <svg
                                                  className="w-5 h-5"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                  />
                                                </svg>
                                              )}
                                            </div>
                                            <span className="font-medium">
                                              {part.name.split("(")[0]}
                                            </span>
                                          </div>
                                          <svg
                                            className="w-4 h-4 flex-shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M9 5l7 7-7 7"
                                            />
                                          </svg>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                          ) : selectedModel?.modelUrl ===
                            "/custom-threejs-dna-simulation" ? (
                            <div className="h-full w-full">
                              <DNASimulation onPartClick={handlePartClick} />
                            </div>
                          ) : selectedModel ? (
                            <Canvas
                              camera={{ position: [0, 0, 5], fov: 50 }}
                              style={{ height: "100%" }}
                            >
                              <ambientLight intensity={0.7} />
                              <spotLight
                                position={[10, 10, 10]}
                                angle={0.15}
                                penumbra={1}
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
                              />
                            </Canvas>
                          ) : (
                            <div className="h-full flex justify-center items-center">
                              কোন মডেল নির্বাচিত হয়নি
                            </div>
                          )}
                        </ErrorBoundary>
                      </div>
                    </div>

                    {/* Model selector */}
                    {selectedExperiment.models.length > 1 && (
                      <div className="mb-4">
                        <h3 className="text-lg font-bold mb-2">
                          মডেল নির্বাচন করুন
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedExperiment.models.map((model) => (
                            <button
                              key={model.id}
                              className={`px-4 py-2 rounded ${
                                selectedModel?.id === model.id
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                              }`}
                              onClick={() => {
                                setSelectedModel(model);
                                setSelectedPart(null);
                              }}
                            >
                              {model.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Enhanced selected part information with modern design */}
                    {selectedPart && (
                      <div className="mt-6 bg-white dark:bg-gray-800 p-0 rounded-xl shadow-lg border border-blue-100 dark:border-blue-800 overflow-hidden">
                        <div className="bg-blue-500 dark:bg-blue-600 py-3 px-5 text-white flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                              {selectedPart.id === "mouth" && (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                  />
                                </svg>
                              )}
                              {selectedPart.id === "esophagus" && (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                  />
                                </svg>
                              )}
                              {selectedPart.id === "stomach" && (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                              )}
                              {!["mouth", "esophagus", "stomach"].includes(
                                selectedPart.id
                              ) && (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              )}
                            </div>
                            <h3 className="text-lg font-bold">
                              {selectedPart.name}
                            </h3>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs bg-white/20 rounded-full px-2 py-1">
                              অঙ্গ / Part
                            </span>
                          </div>
                        </div>

                        <div className="p-5">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                              {selectedPart.description}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between">
                          <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                            ত্রিমাত্রিক মডেল থেকে নির্বাচিত অংশ
                          </div>
                          <button
                            onClick={() =>
                              playAudioNarration(selectedPart.description)
                            }
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs transition-colors duration-200"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.414l-2.829-2.828a2 2 0 010-2.828l2.829-2.828m7.072 7.072l3.536 3.536M5.586 8.586l4.243 4.242m0 0l-4.243 4.243"
                              />
                            </svg>
                            শুনুন / Listen
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow text-center">
                    <p>
                      কোন এক্সপেরিমেন্ট নির্বাচিত হয়নি। বাম দিক থেকে একটি
                      এক্সপেরিমেন্ট নির্বাচন করুন।
                    </p>
                    <p className="text-gray-500 mt-2">
                      No experiment selected. Please select an experiment from
                      the left sidebar.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default BiologyExperiments;
