import { Button } from "@heroui/button";
import { motion } from "framer-motion";
import { ChangeEvent, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { AnalysisResult, analyzeImageWithAI } from "@/utils/imageAnalysis";
import { uploadImage } from "@/utils/imageUpload";

// Define observation types with emojis
const observationTypes = [
  {
    id: "insect",
    emoji: "🐛",
    name: "পোকামাকড়",
    color: "bg-teal-100 text-teal-800 border-2 border-teal-300",
  },
  {
    id: "plant",
    emoji: "🌿",
    name: "গাছপালা",
    color: "bg-emerald-100 text-emerald-800 border-2 border-emerald-300",
  },
  {
    id: "water",
    emoji: "💧",
    name: "পানি",
    color: "bg-cyan-100 text-cyan-800 border-2 border-cyan-300",
  },
  {
    id: "trash",
    emoji: "🗑️",
    name: "আবর্জনা",
    color: "bg-blue-100 text-blue-800 border-2 border-blue-300",
  },
  {
    id: "weather",
    emoji: "☁️",
    name: "আবহাওয়া",
    color: "bg-indigo-100 text-indigo-800 border-2 border-indigo-300",
  },
  {
    id: "animal",
    emoji: "🐢",
    name: "প্রাণী",
    color: "bg-green-100 text-green-800 border-2 border-green-300",
  },
  {
    id: "other",
    emoji: "🔍",
    name: "অন্যান্য",
    color: "bg-slate-100 text-slate-800 border-2 border-slate-300",
  },
];

export default function KhudroGobeshona() {
  // State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState<AnalysisResult | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [audioNote, setAudioNote] = useState<string | null>(null);
  const [textNote, setTextNote] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to Bangladesh coordinates if location access denied
          setLocation({ lat: 23.685, lng: 90.3563 });
        }
      );
    }
  };

  // Handle image selection
  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);

      // Create preview URL
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        if (e.target?.result) {
          setPreviewUrl(e.target.result as string);
        }
      };
      fileReader.readAsDataURL(file);

      // Try to get location when image is selected
      getCurrentLocation();
    }
  };

  // Start audio recording
  const startRecording = () => {
    setIsRecording(true);
    // Simulate recording in this example
    setTimeout(() => {
      setIsRecording(false);
      setAudioNote("audio_note_example.mp3");
    }, 2000);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);

      if (selectedImage) {
        // Image upload and analysis
        const response = await uploadImage(
          selectedImage,
          `${selectedType || "Science"} Observation`
        );

        if (!response.success) {
          throw new Error(response.message || "Upload failed");
        }

        const imageUrl = response.data?.view_url || null;
        setUploadedImageUrl(imageUrl);

        if (imageUrl) {
          const analysis = await analyzeImageWithAI(imageUrl);
          setImageAnalysis(analysis);
          setShowSuccess(true);
        } else {
          throw new Error("No image URL returned from upload");
        }
      } else {
        throw new Error("Please upload an image of your observation");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      // Reset any partial results
      if (selectedImage && !imageAnalysis) {
        setUploadedImageUrl(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setUploadedImageUrl(null);
    setImageAnalysis(null);
    setErrorMessage(null);
    setShowSuccess(false);
    setSelectedType(null);
    setTextNote("");
    setAudioNote(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <>
      {/* Kid-friendly Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-teal-700 py-6 mb-8 rounded-b-3xl shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center">
              <span className="text-5xl mr-3">🔬</span>
              <span className="text-3xl mr-2">🧩</span> ক্ষুদ্র গবেষণা{" "}
              <span className="text-3xl ml-2">🧠</span>
              <span className="text-5xl ml-3">🧪</span>
            </h1>
            <p className="text-xl text-white text-center">
              <span className="bg-teal-600/40 backdrop-blur-sm px-4 py-2 rounded-full shadow-inner">
                দেখো 👀 খুঁজে বের করো 🔍 পরীক্ষা করো 🔎 শেয়ার করো 🌟
              </span>
            </p>
          </div>

          <div className="flex justify-center mt-5">
            <div className="bg-teal-600/80 rounded-full px-6 py-3 backdrop-blur-sm shadow-md">
              <p className="text-white text-center flex items-center gap-2 font-medium">
                <span className="text-3xl">👋</span> হ্যালো ছোট বিজ্ঞানী!{" "}
                <span className="text-2xl mx-1">🧒</span> তোমার আশেপাশে কি
                দেখছো? <span className="text-2xl ml-1">🤔</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Kid-friendly Warning Banner */}
      <div className="container mx-auto px-4 mb-6">
        <div className="bg-blue-900 border-2 border-yellow-400 text-white rounded-xl p-4 flex items-center shadow-md max-w-4xl mx-auto">
          <span className="text-4xl mr-3">⚠️</span>
          <div>
            <h3 className="font-bold text-lg flex items-center">
              <span className="mr-2">👧</span> শিশুদের জন্য বিশেষ পাতা{" "}
              <span className="ml-2">👦</span>
            </h3>
            <p className="text-sm">
              এই পাতাটি ছোটদের ব্যবহারের জন্য বিশেষভাবে ডিজাইন করা হয়েছে।
              অভিভাবকদের সাহায্য নিয়ে ব্যবহার করতে উৎসাহিত করা হচ্ছে।
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-4xl mx-auto"
        >
          {!showSuccess ? (
            <div className="bg-blue-900 dark:bg-blue-950 rounded-3xl shadow-xl p-6 mb-8 border-4 border-dashed border-cyan-400">
              <motion.div className="space-y-6" variants={containerVariants}>
                {/* Main upload area */}
                <motion.div variants={itemVariants}>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-64 border-4 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      previewUrl
                        ? "border-teal-400 bg-blue-800/40"
                        : "border-cyan-400 hover:bg-blue-800/30 dark:border-cyan-500 dark:hover:bg-blue-900"
                    }`}
                  >
                    {previewUrl ? (
                      <div className="relative w-full h-full">
                        <img
                          src={previewUrl}
                          alt="Selected"
                          className="h-full w-full object-contain rounded-xl"
                        />
                        <div className="absolute bottom-2 right-2 bg-teal-500 text-white p-3 rounded-full shadow-md">
                          <span className="text-2xl">✓</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-7xl mb-3">📸</div>
                        <p className="text-xl font-bold text-cyan-300 dark:text-cyan-300 flex items-center">
                          <span className="text-2xl mr-2">📱</span> তোমার ছবি
                          আপলোড করো! <span className="text-2xl ml-2">📤</span>
                        </p>
                        <p className="text-gray-300 dark:text-gray-300 mt-3 flex flex-wrap justify-center">
                          <span className="mx-1">🌿 গাছপালা</span>
                          <span className="mx-1">🐛 পোকামাকড়</span>
                          <span className="mx-1">💧 পানি</span>
                          <span className="mx-1">🌤️ আবহাওয়া</span>
                        </p>
                      </>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageSelect}
                    ref={fileInputRef}
                    className="hidden"
                  />
                </motion.div>

                {/* Observation type selection */}
                {previewUrl && (
                  <motion.div variants={itemVariants}>
                    <h3 className="text-xl font-bold mb-3 flex items-center text-cyan-300">
                      <span className="text-2xl mr-2">🧩</span> তুমি কি দেখেছো?{" "}
                      <span className="text-2xl ml-2">👁️</span>
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                      {observationTypes.map((type) => (
                        <div
                          key={type.id}
                          onClick={() => setSelectedType(type.id)}
                          className={`flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all ${
                            selectedType === type.id
                              ? `${type.color} transform scale-110 shadow-lg`
                              : "bg-blue-800 hover:bg-blue-700 text-cyan-200 border-2 border-cyan-700/50"
                          }`}
                        >
                          <span className="text-3xl mb-1">{type.emoji}</span>
                          <span className="text-sm font-medium">
                            {type.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Location info (simplified) */}
                {previewUrl && (
                  <motion.div
                    variants={itemVariants}
                    className="flex items-center bg-blue-800/70 p-4 rounded-xl border-2 border-cyan-500/30"
                  >
                    <div className="text-3xl mr-3">📍</div>
                    <div>
                      <h3 className="text-lg font-bold text-cyan-300 flex items-center">
                        <span className="mr-2">🌍</span> তোমার অবস্থান
                      </h3>
                      <p className="text-gray-300 dark:text-gray-300 flex items-center">
                        <span className="text-xl mr-2">🧭</span>
                        {location
                          ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                          : "অবস্থান নির্ধারণ করা যাচ্ছে না"}
                      </p>
                    </div>
                    <button
                      onClick={getCurrentLocation}
                      className="ml-auto bg-teal-600 text-white rounded-full p-3 hover:bg-teal-700 border border-cyan-400 shadow-md"
                    >
                      <span className="text-xl">🔄</span>
                    </button>
                  </motion.div>
                )}

                {/* Notes section */}
                {previewUrl && (
                  <motion.div
                    variants={itemVariants}
                    className="bg-blue-800/70 p-4 rounded-xl border-2 border-cyan-500/30"
                  >
                    <h3 className="text-xl font-bold mb-3 flex items-center text-cyan-300">
                      <span className="text-2xl mr-2">✏️</span> তোমার মন্তব্য{" "}
                      <span className="text-2xl ml-2">📝</span>
                    </h3>
                    <div className="flex flex-col gap-3">
                      <textarea
                        value={textNote}
                        onChange={(e) => setTextNote(e.target.value)}
                        placeholder="তুমি কি দেখেছো? তোমার মতামত লিখো..."
                        className="w-full p-3 border-2 border-cyan-500 rounded-xl bg-blue-700 text-white focus:border-cyan-400 focus:ring focus:ring-cyan-400 focus:ring-opacity-50 placeholder-cyan-200/60"
                        rows={2}
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={startRecording}
                          className={`px-4 py-2 rounded-full flex items-center gap-2 border ${
                            isRecording
                              ? "bg-red-600 text-white animate-pulse border-red-400"
                              : "bg-teal-600 text-white hover:bg-teal-700 border-cyan-400"
                          }`}
                        >
                          <span className="text-xl">
                            {isRecording ? "🔴" : "🎤"}
                          </span>
                          <span>
                            {isRecording ? "রেকর্ডিং... 🔊" : "কথা বলো 🗣️"}
                          </span>
                        </button>

                        {audioNote && (
                          <div className="px-4 py-2 bg-teal-600 text-white rounded-full flex items-center gap-2 border border-cyan-400">
                            <span className="text-xl">🔊</span>
                            <span>অডিও সংরক্ষিত ✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Action buttons */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-wrap gap-4 justify-center mt-6"
                >
                  <Button
                    color="primary"
                    onClick={handleSubmit}
                    disabled={isLoading || !selectedImage}
                    className="px-8 py-6 text-lg rounded-full flex items-center gap-2 shadow-lg bg-teal-600 border-2 border-cyan-400"
                  >
                    <span className="text-2xl">{isLoading ? "⏳" : "🚀"}</span>
                    {isLoading ? "অপেক্ষা করুন... ⌛" : "জমা দিন ✨"}
                  </Button>

                  <Button
                    color="default"
                    variant="flat"
                    onClick={resetForm}
                    disabled={isLoading}
                    className="px-6 py-4 rounded-full bg-blue-800 text-cyan-300 border-2 border-cyan-500/50"
                  >
                    <span className="text-xl mr-1">🔄</span> আবার শুরু{" "}
                    <span className="ml-1">🆕</span>
                  </Button>
                </motion.div>

                {/* Error message */}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-red-900/70 border-2 border-red-500 rounded-xl"
                  >
                    <p className="text-white text-center flex items-center justify-center">
                      <span className="text-2xl mr-2">⚠️</span>
                      {errorMessage}
                      <span className="text-2xl ml-2">❗</span>
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          ) : (
            /* Success / Results View */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-blue-900 dark:bg-blue-950 rounded-3xl shadow-xl overflow-hidden border-4 border-cyan-400"
            >
              {/* Success header */}
              <div className="bg-teal-600 p-6 text-center">
                <div className="inline-block bg-blue-900 rounded-full p-5 mb-3 animate-bounce border-4 border-cyan-400 shadow-lg">
                  <span className="text-5xl">🎉</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
                  <span className="text-3xl mr-2">🏆</span>
                  ধন্যবাদ, ছোট বিজ্ঞানী!
                  <span className="text-3xl ml-2">🏅</span>
                </h2>
                <p className="text-white text-lg flex items-center justify-center">
                  <span className="text-xl mr-2">✅</span>
                  তোমার পর্যবেক্ষণটি জমা হয়েছে
                  <span className="text-xl ml-2">📤</span>
                </p>
              </div>

              {/* Results display */}
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Image display */}
                  <div className="rounded-2xl overflow-hidden bg-blue-800 dark:bg-blue-900 shadow-md border-2 border-cyan-400">
                    <div className="border-b-2 border-cyan-400 p-4 flex items-center bg-blue-700">
                      <span className="text-2xl mr-2">🔍</span>
                      <h4 className="font-bold text-xl text-cyan-300 dark:text-cyan-300">
                        তোমার পর্যবেক্ষণ{" "}
                        <span className="text-xl ml-1">📸</span>
                      </h4>
                    </div>
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={uploadedImageUrl || ""}
                        alt="Observation"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Analysis results */}
                  <div className="bg-blue-800 dark:bg-blue-900 p-6 rounded-2xl shadow-md border-2 border-cyan-400">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-bold text-xl mb-2 flex items-center text-cyan-300">
                          <span className="text-2xl mr-2">👀</span>
                          ছবিতে যা দেখা যায়:{" "}
                          <span className="text-2xl ml-1">🔎</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {imageAnalysis?.visible_objects.map((item, idx) => (
                            <span
                              key={idx}
                              className="bg-teal-700/50 text-cyan-100 border border-cyan-500 px-3 py-1 text-md rounded-full"
                            >
                              {item}
                            </span>
                          ))}
                          {(!imageAnalysis?.visible_objects ||
                            imageAnalysis.visible_objects.length === 0) && (
                            <span className="text-gray-300 dark:text-gray-300">
                              কোন তথ্য পাওয়া যায়নি{" "}
                              <span className="ml-1">🤔</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-xl mb-2 flex items-center text-cyan-300">
                          <span className="text-2xl mr-2">🧩</span>
                          পর্যবেক্ষণের ধরন:{" "}
                          <span className="text-2xl ml-1">📋</span>
                        </h4>
                        <p>
                          <span className="bg-teal-700/50 text-cyan-100 border border-cyan-500 px-4 py-2 rounded-full text-md font-medium">
                            {imageAnalysis?.observation_type || "অনির্ধারিত"}{" "}
                            <span className="ml-1">📊</span>
                          </span>
                        </p>
                      </div>

                      <div className="mt-6 bg-blue-700 p-5 rounded-2xl border-2 border-cyan-400">
                        <h4 className="font-bold text-xl mb-2 text-cyan-300 flex items-center">
                          <span className="text-2xl mr-2">✨</span>
                          আকর্ষণীয় তথ্য:{" "}
                          <span className="text-2xl ml-1">💡</span>
                        </h4>
                        <p className="text-white text-lg">
                          {imageAnalysis?.fun_fact || "কোন তথ্য পাওয়া যায়নি"}
                        </p>
                      </div>

                      {/* Badge */}
                      <div className="flex justify-center mt-6">
                        <div className="bg-teal-600 p-1 rounded-full shadow-xl">
                          <div className="bg-blue-900 rounded-full p-4 flex flex-col items-center border-2 border-cyan-400">
                            <div className="text-4xl mb-1">🏅</div>
                            <div className="font-bold text-lg text-cyan-300">
                              প্রকৃতি পর্যবেক্ষক ব্যাজ{" "}
                              <span className="ml-1">🌟</span>
                            </div>
                            <div className="text-sm text-cyan-200">
                              অভিনন্দন! <span className="mx-1">🎊</span> তুমি
                              একজন সত্যিকারের বিজ্ঞানী!{" "}
                              <span className="ml-1">🔬</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-8 gap-4">
                  <Button
                    color="primary"
                    onClick={resetForm}
                    className="px-6 py-3 rounded-full flex items-center gap-2 bg-teal-600 border-2 border-cyan-400"
                  >
                    <span className="text-xl">🔍</span>
                    নতুন পর্যবেক্ষণ করুন <span className="ml-1">🆕</span>
                  </Button>

                  <Button
                    color="default"
                    variant="flat"
                    as={Link}
                    to="/explore-observations"
                    className="px-6 py-3 rounded-full flex items-center gap-2 bg-blue-800 text-cyan-300 border-2 border-cyan-500/50"
                  >
                    <span className="text-xl">🗺️</span>
                    অন্যদের পর্যবেক্ষণ দেখুন <span className="ml-1">👥</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Teacher info banner */}
          <motion.div
            variants={itemVariants}
            className="mt-10 bg-blue-800/70 rounded-2xl p-6 border-2 border-cyan-500/30"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">👨‍🏫</div>
              <div>
                <h3 className="text-xl font-bold text-cyan-300">
                  শিক্ষকদের জন্য
                </h3>
                <p className="text-gray-300 dark:text-gray-300">
                  আপনার শ্রেণীকক্ষের সব পর্যবেক্ষণ এক জায়গায় দেখতে{" "}
                  <Link
                    to="/teacher-dashboard"
                    className="text-cyan-400 hover:underline"
                  >
                    শিক্ষক ড্যাশবোর্ড
                  </Link>{" "}
                  দেখুন।
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Kid-friendly Footer */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-teal-700 py-8 rounded-t-3xl mt-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-blue-800/50 backdrop-blur-sm rounded-2xl p-4 border-2 border-cyan-400/50">
              <div className="text-4xl mb-2">🧠</div>
              <h3 className="text-xl font-bold text-cyan-300 mb-1">
                আরও শিখতে
              </h3>
              <p className="text-white text-opacity-90">
                বিজ্ঞান শিখতে আমাদের অন্যান্য গেম ও ইন্টারেক্টিভ টুল দেখুন
              </p>
              <Button
                as={Link}
                to="/games"
                className="mt-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full px-4 py-2 border border-cyan-400"
              >
                <span className="text-xl mr-1">🎮</span> গেমস{" "}
                <span className="ml-1">🎯</span>
              </Button>
            </div>

            <div className="bg-blue-800/50 backdrop-blur-sm rounded-2xl p-4 border-2 border-cyan-400/50">
              <div className="text-4xl mb-2">🏆</div>
              <h3 className="text-xl font-bold text-cyan-300 mb-1">
                সেরা পর্যবেক্ষণ
              </h3>
              <p className="text-white text-opacity-90">
                এই সপ্তাহের সেরা পর্যবেক্ষণগুলো দেখতে এখানে ক্লিক করুন
              </p>
              <Button
                as={Link}
                to="/top-observations"
                className="mt-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full px-4 py-2 border border-cyan-400"
              >
                <span className="text-xl mr-1">🌟</span> সেরা তালিকা{" "}
                <span className="ml-1">📊</span>
              </Button>
            </div>

            <div className="bg-blue-800/50 backdrop-blur-sm rounded-2xl p-4 border-2 border-cyan-400/50">
              <div className="text-4xl mb-2">❓</div>
              <h3 className="text-xl font-bold text-cyan-300 mb-1">সাহায্য</h3>
              <p className="text-white text-opacity-90">
                কিভাবে ক্ষুদ্র গবেষণা করবেন তা জানতে হেল্প পেজ দেখুন
              </p>
              <Button
                as={Link}
                to="/help"
                className="mt-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full px-4 py-2 border border-cyan-400"
              >
                <span className="text-xl mr-1">📚</span> সাহায্য{" "}
                <span className="ml-1">💡</span>
              </Button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-white">
              বিজ্ঞান<span className="text-cyan-300">বন্ধু</span> - ইন্টারেক্টিভ
              বিজ্ঞান শিক্ষার প্ল্যাটফর্ম &copy; {new Date().getFullYear()}
            </p>
            <div className="flex gap-6 justify-center mt-2">
              <Link
                to="/about"
                className="text-cyan-300 hover:text-cyan-200 transition-colors flex items-center"
              >
                <span className="mr-1">ℹ️</span> আমাদের সম্পর্কে
              </Link>
              <Link
                to="/privacy"
                className="text-cyan-300 hover:text-cyan-200 transition-colors flex items-center"
              >
                <span className="mr-1">🔒</span> প্রাইভেসি পলিসি
              </Link>
              <Link
                to="/contact"
                className="text-cyan-300 hover:text-cyan-200 transition-colors flex items-center"
              >
                <span className="mr-1">📧</span> যোগাযোগ
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Kid-friendly Navigation Bar */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-blue-900/90 border-2 border-cyan-400 rounded-full shadow-lg px-2 py-1">
          <div className="flex items-center gap-1 sm:gap-3">
            <Link
              to="/"
              className="p-2 hover:bg-blue-800 rounded-full text-cyan-300 transition-colors"
            >
              <div className="flex flex-col items-center">
                <span className="text-2xl">🏠</span>
                <span className="text-xs hidden sm:block">হোম</span>
              </div>
            </Link>
            <Link
              to="/games"
              className="p-2 hover:bg-blue-800 rounded-full text-cyan-300 transition-colors"
            >
              <div className="flex flex-col items-center">
                <span className="text-2xl">🎮</span>
                <span className="text-xs hidden sm:block">গেমস</span>
              </div>
            </Link>
            <Link
              to="/small-research"
              className="p-2 bg-teal-700 rounded-full text-white"
            >
              <div className="flex flex-col items-center">
                <span className="text-2xl">🔬</span>
                <span className="text-xs hidden sm:block">গবেষণা</span>
              </div>
            </Link>
            <Link
              to="/explore"
              className="p-2 hover:bg-blue-800 rounded-full text-cyan-300 transition-colors"
            >
              <div className="flex flex-col items-center">
                <span className="text-2xl">🗺️</span>
                <span className="text-xs hidden sm:block">এক্সপ্লোর</span>
              </div>
            </Link>
            <Link
              to="/profile"
              className="p-2 hover:bg-blue-800 rounded-full text-cyan-300 transition-colors"
            >
              <div className="flex flex-col items-center">
                <span className="text-2xl">👤</span>
                <span className="text-xs hidden sm:block">প্রোফাইল</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
