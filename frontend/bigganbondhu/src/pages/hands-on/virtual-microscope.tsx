import {
  faBiohazard,
  faEye,
  faHouse,
  faInfo,
  faLeaf,
  faMicroscope,
  faPlay,
  faSearchMinus,
  faSearchPlus,
  faWater,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { OrbitControls, PresentationControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";

import DefaultLayout from "@/layouts/default";

// Model component - Creating a simple microscope using Three.js primitives
function MicroscopeModel() {
  return (
    <group position={[0, -1.5, 0]} scale={1.5}>
      {/* Base */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[1.2, 1.5, 0.3, 16]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Pillar */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
        <meshStandardMaterial color="#34495e" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Stage */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.1, 16]} />
        <meshStandardMaterial color="#ecf0f1" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Objective lens holder */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.2, 0.5, 8]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Eyepiece */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 8]} />
        <meshStandardMaterial color="#34495e" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Focusing knobs */}
      <mesh position={[0.7, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 8]} />
        <meshStandardMaterial color="#e74c3c" metalness={0.5} roughness={0.3} />
      </mesh>

      <mesh position={[-0.7, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 8]} />
        <meshStandardMaterial color="#e74c3c" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Light source */}
      <mesh position={[0, -1.2, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color="#f1c40f"
          emissive="#f1c40f"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

// Sample interface
interface Sample {
  id: string;
  name: string;
  banglaName: string;
  icon: any;
  image: string;
  description: string;
}

export default function VirtualMicroscopePage() {
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const [position] = useState({ x: 23.7529, y: 90.4267 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [microscopeRotation, setMicroscopeRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMicroscopeRotation((prev) => prev + 0.01);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Sample data
  const samplesList: Sample[] = [
    {
      id: "microorganism",
      name: "Microorganisms",
      banglaName: "অণুজীব",
      icon: faBiohazard,
      image:
        "https://d2jx2rerrg6sh3.cloudfront.net/image-handler/picture/2021/11/shutterstock_1018974583_(1).jpg",
      description:
        "অণুজীবের জগতে প্রবেশ করুন। এখানে আপনি বিভিন্ন ধরণের ব্যাকটেরিয়া, প্রোটোজোয়া এবং অন্যান্য অণুজীব দেখতে পাবেন।",
    },
    {
      id: "plant",
      name: "Plant Cells",
      banglaName: "উদ্ভিদকোষ",
      icon: faLeaf,
      image:
        "https://sciencenotes.org/wp-content/uploads/2025/03/Plant-Cell-No-Labels-1024x683.png",
      description:
        "উদ্ভিদ কোষের বিভিন্ন অংশ যেমন কোষপ্রাচীর, ক্লোরোপ্লাস্ট, নিউক্লিয়াস ইত্যাদি পর্যবেক্ষণ করুন।",
    },
    {
      id: "water",
      name: "Water Samples",
      banglaName: "পানি",
      icon: faWater,
      image:
        "https://media.istockphoto.com/id/1574992350/vector/glass-of-water-and-magnifying-glass-different-bacteria-and-dirty-water-in-magnifier.jpg?s=612x612&w=0&k=20&c=KE2Lm7WPYGxcCDuJHsuzaOOliUBs143bYPrOxJYDIWQ=",
      description:
        "বিভিন্ন উৎস থেকে পানির নমুনা দেখুন এবং তাতে থাকা জীবাণু ও অন্যান্য উপাদান চিহ্নিত করুন।",
    },
    {
      id: "blood",
      name: "Blood Cells",
      banglaName: "রক্তকণিকা",
      icon: faEye,
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Hematopoiesis_simple.svg/1200px-Hematopoiesis_simple.svg.png",
      description:
        "রক্তের বিভিন্ন উপাদান যেমন লোহিত রক্তকণিকা, শ্বেত রক্তকণিকা এবং অণুচক্রিকা পর্যবেক্ষণ করুন।",
    },
    {
      id: "bacteria",
      name: "Bacteria",
      banglaName: "ব্যাকটেরিয়া",
      icon: faBiohazard,
      image:
        "https://upload.wikimedia.org/wikipedia/commons/3/3e/Bacteria-.svg",
      description:
        "বিভিন্ন ধরনের ব্যাকটেরিয়া এবং তাদের আকৃতি ও বৈশিষ্ট্য পর্যবেক্ষণ করুন।",
    },
    {
      id: "tissue",
      name: "Animal Tissue",
      banglaName: "প্রাণীর টিস্যু",
      icon: faHouse,
      image:
        "https://www.shutterstock.com/image-photo/study-basic-animal-tissue-under-600nw-2459815289.jpg",
      description:
        "প্রাণীদেহের বিভিন্ন টিস্যু যেমন এপিথেলিয়াল, কানেক্টিভ, মাংসপেশি ও স্নায়ু টিস্যু পর্যবেক্ষণ করুন।",
    },
  ];

  // Mobile navigation handler
  const handleSampleSelect = (sampleId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedSample(sampleId === selectedSample ? null : sampleId);
      setIsLoading(false);
    }, 500);
  };

  return (
    <DefaultLayout>
      <div
        className="relative min-h-screen overflow-x-hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Enhanced Warning banner with animation */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600/10 animate-pulse" />
          <div className="max-w-7xl mx-auto flex items-center justify-center relative z-10">
            <FontAwesomeIcon
              className="text-yellow-300 mr-3 text-xl animate-bounce"
              icon={faInfo}
            />
            <p className="text-center text-sm sm:text-base">
              <span className="font-bold text-yellow-100">
                শিক্ষার্থীদের জন্য বিশেষ পাতা
              </span>
              <span className="hidden sm:inline text-blue-100">
                {" "}
                - এই নোটটি শিক্ষকদের সাহায্যে ব্যবহার করা উচিত
              </span>
            </p>
          </div>
        </div>

        {/* Enhanced Hero Section */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20" />
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div
              className="w-full h-full bg-blue-300 bg-opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.1) 2px, transparent 2px)",
                backgroundSize: "30px 30px",
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <FontAwesomeIcon
                  className="text-6xl mr-6 text-blue-200"
                  icon={faMicroscope}
                  style={{ transform: `rotate(${microscopeRotation * 10}deg)` }}
                />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-ping" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  ভার্চুয়াল মাইক্রোস্কোপ
                </h1>
                <p className="text-blue-200 mt-2 text-lg">
                  বিজ্ঞানের ক্ষুদ্র জগতে স্বাগতম
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full text-sm flex items-center transition-all duration-300 hover:scale-105 border border-white/20">
                <FontAwesomeIcon className="mr-2" icon={faEye} />
                খালি চোখে দেখা
              </button>
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full text-sm flex items-center transition-all duration-300 hover:scale-105 border border-white/20">
                <FontAwesomeIcon className="mr-2" icon={faPlay} />
                শুরু করো
              </button>
              <button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-emerald-500/25">
                পরীক্ষা করো
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Hint */}
        <div className="block sm:hidden bg-blue-50 dark:bg-blue-900/30 p-3 mx-4 mb-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
            📱 স্ক্রোল করুন সকল বৈশিষ্ট্য দেখার জন্য
          </p>
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 py-2 md:py-6 md:px-6">
          <div className="flex flex-col xl:grid xl:grid-cols-3 gap-4 md:gap-6 xl:gap-8 min-h-0">
            {/* 3D Microscope */}
            <div className="xl:col-span-2 order-1 w-full">
              <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl mb-8 border border-gray-100 dark:border-gray-700">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 p-4 border-b border-gray-200 dark:border-gray-600">
                  <h2 className="font-bold text-lg flex items-center text-gray-800 dark:text-white">
                    <div className="bg-blue-500 p-2 rounded-lg mr-3">
                      <FontAwesomeIcon
                        className="text-white"
                        icon={faMicroscope}
                      />
                    </div>
                    ৩ডি মাইক্রোস্কোপ
                    <div className="ml-auto flex gap-2">
                      <button className="p-2 hover:bg-blue-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                        <FontAwesomeIcon
                          className="text-blue-600 dark:text-blue-400"
                          icon={faPlay}
                        />
                      </button>
                      <button className="p-2 hover:bg-blue-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                        <FontAwesomeIcon
                          className="text-blue-600 dark:text-blue-400"
                          icon={faHouse}
                        />
                      </button>
                    </div>
                  </h2>
                </div>

                <div className="h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] w-full">
                  <Canvas
                    camera={{ position: [0, 0, 5], fov: 50 }}
                    onCreated={(state) => {
                      state.gl.setClearColor("#f5f5f5");
                    }}
                  >
                    <ambientLight intensity={0.6} />
                    <directionalLight intensity={0.8} position={[5, 5, 5]} />
                    <spotLight
                      angle={0.15}
                      intensity={0.5}
                      penumbra={1}
                      position={[10, 10, 10]}
                    />
                    <PresentationControls
                      global
                      azimuth={[-Math.PI / 4, Math.PI / 4]}
                      polar={[-Math.PI / 4, Math.PI / 4]}
                      rotation={[0, -Math.PI / 4, 0]}
                      zoom={0.8}
                    >
                      <MicroscopeModel />
                    </PresentationControls>
                    <OrbitControls
                      enablePan={true}
                      enableRotate={true}
                      enableZoom={true}
                      maxDistance={10}
                      minDistance={2}
                    />
                  </Canvas>
                </div>
              </div>

              {/* Enhanced Interactive Viewer */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700 mb-6 xl:mb-0">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 p-3 md:p-4 border-b border-gray-200 dark:border-gray-600">
                  <h2 className="font-bold text-base md:text-lg flex items-center text-gray-800 dark:text-white">
                    <div className="bg-green-500 p-2 rounded-lg mr-3">
                      <FontAwesomeIcon
                        className="text-white text-sm md:text-base"
                        icon={faEye}
                      />
                    </div>
                    <span className="truncate">
                      {selectedSample
                        ? samplesList.find((s) => s.id === selectedSample)
                            ?.banglaName || "সাধারণ দৃশ্য"
                        : "সাধারণ দৃশ্য"}
                    </span>
                    {isLoading && (
                      <div className="ml-auto flex-shrink-0">
                        <div className="w-5 h-5 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
                      </div>
                    )}
                  </h2>
                </div>

                <div className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
                  {selectedSample ? (
                    <div className="h-full w-full flex items-center justify-center">
                      <img
                        alt="Microscope view"
                        className="max-h-full object-contain"
                        src={
                          samplesList.find((s) => s.id === selectedSample)
                            ?.image || "/samples/default.jpg"
                        }
                        style={{ transform: `scale(${zoomLevel})` }}
                      />
                    </div>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <p className="text-white">নমুনা নির্বাচন করুন</p>
                    </div>
                  )}

                  {/* Enhanced Overlay controls - Mobile Responsive */}
                  <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 bg-black/70 backdrop-blur-sm rounded-xl p-2 md:p-4 text-white text-xs md:text-sm border border-white/10 max-w-[calc(100%-1rem)]">
                    <div className="mb-2 md:mb-3 text-xs text-gray-300 hidden md:block">
                      অবস্থান: {position.x.toFixed(4)}, {position.y.toFixed(4)}
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <button
                        className="bg-red-600 hover:bg-red-500 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg transition-all hover:scale-105 shadow-lg"
                        onClick={() =>
                          setZoomLevel(Math.max(0.5, zoomLevel - 0.5))
                        }
                      >
                        <FontAwesomeIcon
                          className="text-xs md:text-sm"
                          icon={faSearchMinus}
                        />
                      </button>
                      <div className="flex-1 text-center font-medium bg-gray-800 px-2 md:px-3 py-1 md:py-2 rounded-lg min-w-[50px]">
                        {(zoomLevel * 100).toFixed(0)}%
                      </div>
                      <button
                        className="bg-green-600 hover:bg-green-500 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg transition-all hover:scale-105 shadow-lg"
                        onClick={() =>
                          setZoomLevel(Math.min(5, zoomLevel + 0.5))
                        }
                      >
                        <FontAwesomeIcon
                          className="text-xs md:text-sm"
                          icon={faSearchPlus}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Sample Selection */}
            <div className="order-2 xl:order-3">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 p-3 md:p-4 border-b border-gray-200 dark:border-gray-600">
                  <h2 className="font-bold text-base md:text-lg flex items-center text-gray-800 dark:text-white">
                    <div className="bg-purple-500 p-2 rounded-lg mr-3">
                      <FontAwesomeIcon
                        className="text-white text-sm md:text-base"
                        icon={faEye}
                      />
                    </div>
                    তুমি কি দেখেছো?
                  </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-2 gap-3 p-4 md:p-6 overflow-x-auto md:landscape:flex md:landscape:overflow-x-auto md:landscape:gap-4">
                  {samplesList.map((sample) => (
                    <div
                      key={sample.id}
                      className={`flex flex-col items-center justify-center p-3 md:p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 min-h-[100px] md:landscape:min-w-[120px] md:landscape:flex-shrink-0 ${
                        selectedSample === sample.id
                          ? "bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 border-2 border-blue-500 shadow-lg"
                          : "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-500 border border-gray-200 dark:border-gray-600"
                      }`}
                      onClick={() => handleSampleSelect(sample.id)}
                    >
                      <div
                        className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white mb-2 md:mb-3 shadow-lg ${
                          selectedSample === sample.id
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                            : "bg-gradient-to-br from-gray-500 to-gray-600"
                        }`}
                      >
                        <FontAwesomeIcon
                          className="text-sm md:text-lg"
                          icon={sample.icon}
                        />
                      </div>
                      <span className="text-center text-xs md:text-sm font-medium text-gray-800 dark:text-white leading-tight">
                        {sample.banglaName}
                      </span>
                      {selectedSample === sample.id && (
                        <div className="mt-1 md:mt-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Enhanced Sample Description */}
                {selectedSample && (
                  <div className="mx-4 md:mx-6 mb-4 md:mb-6 p-4 md:p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-blue-200 dark:border-gray-600 shadow-lg">
                    <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3 text-blue-800 dark:text-blue-200 flex items-center">
                      <FontAwesomeIcon
                        className="mr-2 text-sm md:text-base"
                        icon={faMicroscope}
                      />
                      <span className="truncate">
                        {
                          samplesList.find((s) => s.id === selectedSample)
                            ?.banglaName
                        }
                      </span>
                    </h3>
                    <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {
                        samplesList.find((s) => s.id === selectedSample)
                          ?.description
                      }
                    </p>
                  </div>
                )}

                <div className="p-4 md:p-6">
                  <h3 className="font-bold mb-3 flex items-center text-gray-800 dark:text-white text-sm md:text-base">
                    <FontAwesomeIcon
                      className="mr-2 text-blue-500 text-sm md:text-base"
                      icon={faInfo}
                    />
                    তোমার অবস্থান
                  </h3>
                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 p-3 md:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between border border-gray-300 dark:border-gray-600 shadow-md">
                    <div className="text-xs md:text-sm font-mono bg-white dark:bg-gray-800 px-2 md:px-3 py-2 rounded-lg border">
                      <span className="text-blue-600 dark:text-blue-400">
                        X:
                      </span>{" "}
                      {position.x.toFixed(4)}
                      <br />
                      <span className="text-green-600 dark:text-green-400">
                        Y:
                      </span>{" "}
                      {position.y.toFixed(4)}
                    </div>
                    <button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-emerald-500/25 w-full sm:w-auto">
                      সংরক্ষণ করো
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
