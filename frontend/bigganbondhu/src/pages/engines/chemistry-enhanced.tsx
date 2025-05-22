import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DefaultLayout from "@/layouts/default";
import apiService from "@/services/apiService";
import { useEffect, useRef, useState } from "react";

type Chemical = {
  id: string;
  name: string;
  bengaliName?: string;
  formula: string;
  color: string;
  state: "solid" | "liquid" | "gas";
  type: string;
  description: string;
  bengaliDescription?: string;
  safetyInfo?: string;
};

type Reaction = {
  id: string;
  reactant1: string;
  reactant2: string;
  product: string;
  equation?: string;
  reactionType?: string;
  description: string;
  bengaliDescription?: string;
  animation: "bubble" | "color-change" | "precipitate" | "smoke" | "none";
  color: string;
  temperature?: string;
  energyChange?: string;
  hazards?: string;
};

type LabSettings = {
  language: "en" | "bn";
  temperature: number; // 0-100 (Celsius)
  mixingSpeed: number; // 0-100
  viewMode: "2d" | "3d";
};

// Helper function for 3D view mode (simplified - implemented as an enhanced 2D view)
const render3DView = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  reaction: Reaction | null,
  labSettings: LabSettings,
  animationActive: boolean
) => {
  if (!canvasRef.current) return null;

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Draw a perspective/3D looking beaker with contents
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Set dimensions
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Draw 3D looking beaker
  ctx.save();

  // Top ellipse (opening)
  ctx.beginPath();
  ctx.ellipse(centerX, centerY - 100, 100, 40, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Bottom ellipse
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + 150, 100, 40, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Left side
  ctx.beginPath();
  ctx.moveTo(centerX - 100, centerY - 100);
  ctx.lineTo(centerX - 100, centerY + 150);
  ctx.stroke();

  // Right side
  ctx.beginPath();
  ctx.moveTo(centerX + 100, centerY - 100);
  ctx.lineTo(centerX + 100, centerY + 150);
  ctx.stroke();

  // Fill with color
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + 50, 95, 38, 0, 0, Math.PI * 2);
  ctx.fillStyle = reaction?.color || "#e0e0ff";
  ctx.fill();

  // Draw liquid surface with perspective
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + 50, 95, 38, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "#ffffff55";
  ctx.stroke();

  // Draw effects based on reaction animation type
  if (reaction?.animation === "bubble" && animationActive) {
    // Draw bubbles rising
    for (let i = 0; i < 15; i++) {
      const x = centerX - 70 + Math.random() * 140;
      const y = centerY + 100 - Math.random() * 150;
      const radius = 2 + Math.random() * 6;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fill();
    }
  } else if (reaction?.animation === "precipitate" && animationActive) {
    // Draw precipitate particles
    for (let i = 0; i < 30; i++) {
      const x = centerX - 80 + Math.random() * 160;
      const y = centerY + 80 + Math.random() * 60;
      const size = 2 + Math.random() * 3;

      ctx.fillStyle = "#555";
      ctx.fillRect(x, y, size, size);
    }
  } else if (reaction?.animation === "smoke" && animationActive) {
    // Draw smoke rising
    ctx.save();
    for (let i = 0; i < 10; i++) {
      const x = centerX - 50 + Math.random() * 100;
      const y = centerY - 50 - Math.random() * 100;
      const radius = 10 + Math.random() * 20;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(200, 200, 200, 0.4)";
      ctx.fill();
    }
    ctx.restore();
  }

  // Add 3D label
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("3D View Mode", centerX, canvas.height - 20);

  ctx.restore();
};

// Helper function for 3D view mode (simplified)
const renderLabView3D = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  reaction: Reaction | null,
  labSettings: LabSettings
) => {
  if (!canvasRef.current) return null;

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Draw a perspective/3D looking beaker with contents
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Set dimensions
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Draw 3D looking beaker
  ctx.save();

  // Top ellipse (opening)
  ctx.beginPath();
  ctx.ellipse(centerX, centerY - 100, 100, 40, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Bottom ellipse
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + 150, 100, 40, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Left side
  ctx.beginPath();
  ctx.moveTo(centerX - 100, centerY - 100);
  ctx.lineTo(centerX - 100, centerY + 150);
  ctx.stroke();

  // Right side
  ctx.beginPath();
  ctx.moveTo(centerX + 100, centerY - 100);
  ctx.lineTo(centerX + 100, centerY + 150);
  ctx.stroke();

  // Fill with color
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + 50, 95, 38, 0, 0, Math.PI * 2);
  ctx.fillStyle = reaction?.color || "#e0e0ff";
  ctx.fill();

  // Draw liquid surface with perspective
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + 50, 95, 38, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "#ffffff55";
  ctx.stroke();

  // Draw effects based on reaction animation type
  if (reaction?.animation === "bubble") {
    // Draw bubbles rising
    for (let i = 0; i < 15; i++) {
      const x = centerX - 70 + Math.random() * 140;
      const y = centerY + 100 - Math.random() * 150;
      const radius = 2 + Math.random() * 6;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fill();
    }
  } else if (reaction?.animation === "precipitate") {
    // Draw precipitate particles
    for (let i = 0; i < 30; i++) {
      const x = centerX - 80 + Math.random() * 160;
      const y = centerY + 80 + Math.random() * 60;
      const size = 2 + Math.random() * 3;

      ctx.fillStyle = "#555";
      ctx.fillRect(x, y, size, size);
    }
  } else if (reaction?.animation === "smoke") {
    // Draw smoke rising
    ctx.save();
    for (let i = 0; i < 10; i++) {
      const x = centerX - 50 + Math.random() * 100;
      const y = centerY - 50 - Math.random() * 100;
      const radius = 10 + Math.random() * 20;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(200, 200, 200, 0.4)";
      ctx.fill();
    }
    ctx.restore();
  }

  // Add 3D label
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("3D View Mode", centerX, canvas.height - 20);

  ctx.restore();
};

const ChemistryEngine = () => {
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [selectedChemicals, setSelectedChemicals] = useState<string[]>([]);
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [animationActive, setAnimationActive] = useState(false);
  const [labSettings, setLabSettings] = useState<LabSettings>({
    language: "en",
    temperature: 25,
    mixingSpeed: 50,
    viewMode: "2d",
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchChemicals = async () => {
      try {
        setLoading(true);
        const data = await apiService.chemistry.getAll();
        setChemicals(data.chemicals || []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load from API, trying local data", err);
        try {
          const data = await apiService.chemistry.getChemicals();
          setChemicals(data.chemicals || []);
          setLoading(false);
        } catch (fetchErr) {
          setError("Failed to load chemistry data");
          setLoading(false);
          console.error(fetchErr);
        }
      }
    };

    fetchChemicals();
  }, []);

  const performReaction = async () => {
    if (selectedChemicals.length < 2) {
      return;
    }

    try {
      const chem1 = selectedChemicals[0];
      const chem2 = selectedChemicals[1];
      const temperature = labSettings.temperature;
      const mixingSpeed = labSettings.mixingSpeed;

      const data = await apiService.chemistry.performReaction(
        chem1,
        chem2,
        temperature,
        mixingSpeed
      );

      setReaction(data);
      setAnimationActive(true);

      applyLabSettingsToReaction(data);

      const descriptionText =
        labSettings.language === "bn"
          ? data.bengaliDescription || data.description
          : data.description;

      playAudioNarration(descriptionText);

      if (canvasRef.current) {
        drawReactionAnimation(data.animation, data.color);
      }
    } catch (err) {
      console.error("Failed to perform reaction", err);
      const errorMsg =
        labSettings.language === "bn"
          ? "রাসায়নিক বিক্রিয়া খুঁজে পাওয়া যায়নি।"
          : "No reaction found for these chemicals.";
      setError(errorMsg);
    }
  };

  const applyLabSettingsToReaction = (reactionData: Reaction) => {
    console.log(
      "Applying lab settings:",
      labSettings,
      "to reaction:",
      reactionData.id
    );
  };

  const drawReactionAnimation = (animationType: string, color: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check if we should render in 3D mode
    if (labSettings.viewMode === "3d") {
      render3DView(canvasRef, reaction, labSettings, animationActive);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const drawBeaker = () => {
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.2, canvas.height * 0.2);
      ctx.lineTo(canvas.width * 0.2, canvas.height * 0.8);
      ctx.lineTo(canvas.width * 0.8, canvas.height * 0.8);
      ctx.lineTo(canvas.width * 0.8, canvas.height * 0.2);
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    drawBeaker();

    ctx.fillStyle = "#e0e0ff";
    ctx.fillRect(
      canvas.width * 0.2,
      canvas.height * 0.4,
      canvas.width * 0.6,
      canvas.height * 0.4
    );

    let animationFrame: number;

    switch (animationType) {
      case "bubble":
        let bubbles: { x: number; y: number; r: number; speed: number }[] = [];

        for (let i = 0; i < 20; i++) {
          bubbles.push({
            x: canvas.width * 0.2 + Math.random() * canvas.width * 0.6,
            y: canvas.height * 0.8,
            r: 2 + Math.random() * 5,
            speed: 0.5 + Math.random() * 2,
          });
        }

        const animateBubbles = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawBeaker();

          ctx.fillStyle = color;
          ctx.fillRect(
            canvas.width * 0.2,
            canvas.height * 0.4,
            canvas.width * 0.6,
            canvas.height * 0.4
          );

          ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
          bubbles.forEach((bubble) => {
            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2);
            ctx.fill();

            bubble.y -= bubble.speed * (labSettings.mixingSpeed / 50);

            if (bubble.y < canvas.height * 0.4) {
              bubble.y = canvas.height * 0.8;
              bubble.x =
                canvas.width * 0.2 + Math.random() * canvas.width * 0.6;
            }
          });

          animationFrame = requestAnimationFrame(animateBubbles);
        };

        animateBubbles();
        break;

      case "color-change":
        let progress = 0;

        const animateColorChange = () => {
          const speedMultiplier = labSettings.temperature > 50 ? 1.5 : 1;
          progress += 0.01 * speedMultiplier;

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawBeaker();

          if (progress <= 1) {
            const r = Math.floor(
              224 * (1 - progress) + parseInt(color.slice(1, 3), 16) * progress
            );
            const g = Math.floor(
              224 * (1 - progress) + parseInt(color.slice(3, 5), 16) * progress
            );
            const b = Math.floor(
              255 * (1 - progress) + parseInt(color.slice(5, 7), 16) * progress
            );

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(
              canvas.width * 0.2,
              canvas.height * 0.4,
              canvas.width * 0.6,
              canvas.height * 0.4
            );

            animationFrame = requestAnimationFrame(animateColorChange);
          } else {
            ctx.fillStyle = color;
            ctx.fillRect(
              canvas.width * 0.2,
              canvas.height * 0.4,
              canvas.width * 0.6,
              canvas.height * 0.4
            );
          }
        };

        animateColorChange();
        break;

      case "precipitate":
        let particles: { x: number; y: number; size: number; speed: number }[] =
          [];

        for (let i = 0; i < 30; i++) {
          particles.push({
            x: canvas.width * 0.2 + Math.random() * canvas.width * 0.6,
            y: canvas.height * 0.4 + Math.random() * (canvas.height * 0.2),
            size: 1 + Math.random() * 3,
            speed: 0.2 + Math.random() * 0.6,
          });
        }

        const animatePrecipitate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawBeaker();

          ctx.fillStyle = color;
          ctx.fillRect(
            canvas.width * 0.2,
            canvas.height * 0.4,
            canvas.width * 0.6,
            canvas.height * 0.4
          );

          ctx.fillStyle = "#555";
          particles.forEach((particle) => {
            ctx.beginPath();
            ctx.rect(particle.x, particle.y, particle.size, particle.size);
            ctx.fill();

            const adjustedSpeed =
              particle.speed * (1 + (labSettings.mixingSpeed - 50) / 100);
            particle.y += adjustedSpeed;

            if (particle.y > canvas.height * 0.79 - particle.size) {
              particle.y = canvas.height * 0.79 - particle.size;
            }
          });

          animationFrame = requestAnimationFrame(animatePrecipitate);
        };

        animatePrecipitate();
        break;

      case "smoke":
        let smokeParticles: {
          x: number;
          y: number;
          size: number;
          alpha: number;
          speed: number;
        }[] = [];

        for (let i = 0; i < 40; i++) {
          smokeParticles.push({
            x: canvas.width * 0.3 + Math.random() * canvas.width * 0.4,
            y: canvas.height * 0.4,
            size: 5 + Math.random() * 10,
            alpha: 0.1 + Math.random() * 0.3,
            speed: 0.5 + Math.random() * 1,
          });
        }

        const animateSmoke = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawBeaker();

          ctx.fillStyle = color;
          ctx.fillRect(
            canvas.width * 0.2,
            canvas.height * 0.4,
            canvas.width * 0.6,
            canvas.height * 0.4
          );

          smokeParticles.forEach((particle) => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 200, 200, ${particle.alpha})`;
            ctx.fill();

            const tempFactor = labSettings.temperature / 25;

            particle.y -= particle.speed * tempFactor;
            particle.x += Math.sin(particle.y * 0.1) * 0.5;

            particle.alpha -= 0.003;

            if (particle.alpha <= 0 || particle.y < 0) {
              particle.y = canvas.height * 0.4;
              particle.x =
                canvas.width * 0.3 + Math.random() * canvas.width * 0.4;
              particle.alpha = 0.1 + Math.random() * 0.3;
            }
          });

          animationFrame = requestAnimationFrame(animateSmoke);
        };

        animateSmoke();
        break;

      default:
        ctx.fillStyle = color;
        ctx.fillRect(
          canvas.width * 0.2,
          canvas.height * 0.4,
          canvas.width * 0.6,
          canvas.height * 0.4
        );
        break;
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  };

  const playAudioNarration = async (text: string) => {
    try {
      const audioEndpoint = apiService.audio.getAudio(text);
      const response = await fetch(audioEndpoint, {
        method: "GET",
      });

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play();
    } catch (err) {
      console.error("Failed to play audio narration", err);
    }
  };

  const resetExperiment = () => {
    setReaction(null);
    setAnimationActive(false);
    setSelectedChemicals([]);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const getChemicalById = (id: string) => {
    return chemicals.find((c) => c.id === id);
  };

  const addChemical = (chemicalId: string) => {
    if (selectedChemicals.includes(chemicalId)) return;
    setSelectedChemicals([...selectedChemicals, chemicalId]);
  };

  const removeChemical = (chemicalId: string) => {
    setSelectedChemicals(selectedChemicals.filter((id) => id !== chemicalId));
  };

  const handleTemperatureChange = (value: number[]) => {
    setLabSettings({
      ...labSettings,
      temperature: value[0],
    });
  };

  const handleMixingSpeedChange = (value: number[]) => {
    setLabSettings({
      ...labSettings,
      mixingSpeed: value[0],
    });
  };

  const toggleLanguage = () => {
    setLabSettings({
      ...labSettings,
      language: labSettings.language === "en" ? "bn" : "en",
    });
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

  if (error && !reaction) {
    return (
      <DefaultLayout>
        <div className="text-center p-4 text-red-500">{error}</div>
      </DefaultLayout>
    );
  }

  const chemicalsByType: Record<string, Chemical[]> = {};
  chemicals.forEach((chemical) => {
    if (!chemicalsByType[chemical.type]) {
      chemicalsByType[chemical.type] = [];
    }
    chemicalsByType[chemical.type].push(chemical);
  });

  const getText = (en: string, bn?: string) => {
    return labSettings.language === "bn" && bn ? bn : en;
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto px-2 py-4 max-w-6xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            {getText("Chemistry Lab", "রসায়ন পরীক্ষাগার")}
          </h1>
          <button
            onClick={toggleLanguage}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {labSettings.language === "en" ? "বাংলা" : "English"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="chemicals" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="chemicals">
                  {getText("Chemicals", "রাসায়নিক")}
                </TabsTrigger>
                <TabsTrigger value="selected">
                  {getText("Selected", "নির্বাচিত")}
                </TabsTrigger>
                <TabsTrigger value="controls">
                  {getText("Controls", "নিয়ন্ত্রণ")}
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="chemicals"
                className="bg-white dark:bg-gray-900 p-4 rounded-md shadow-md border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-xl font-semibold mb-2 dark:text-gray-100">
                  {getText(
                    "Available Chemicals",
                    "উপলব্ধ রাসায়নিক পদার্থসমূহ"
                  )}
                </h2>

                {Object.entries(chemicalsByType).map(([type, chems]) => (
                  <div key={type} className="mb-4">
                    <h3 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-300 capitalize">
                      {type}s
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {chems.map((chemical) => (
                        <button
                          key={chemical.id}
                          onClick={() => addChemical(chemical.id)}
                          disabled={
                            selectedChemicals.includes(chemical.id) ||
                            animationActive
                          }
                          className={`p-2 rounded-md border text-left text-sm ${
                            selectedChemicals.includes(chemical.id)
                              ? "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200"
                              : "bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                          } ${
                            animationActive
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: chemical.color }}
                            ></div>
                            <div>
                              <span className="font-medium">
                                {getText(chemical.name, chemical.bengaliName)}
                              </span>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {chemical.formula}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent
                value="selected"
                className="bg-white dark:bg-gray-900 p-4 rounded-md shadow-md border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-xl font-semibold mb-2 dark:text-gray-100">
                  {getText(
                    "Selected Chemicals",
                    "নির্বাচিত রাসায়নিক পদার্থসমূহ"
                  )}
                </h2>

                {selectedChemicals.length === 0 ? (
                  <div className="text-center p-6 text-gray-500 dark:text-gray-400">
                    {getText(
                      "No chemicals selected. Go to the Chemicals tab to select some.",
                      "কোন রাসায়নিক পদার্থ নির্বাচন করা হয়নি। কিছু নির্বাচন করতে রাসায়নিক ট্যাবে যান।"
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedChemicals.map((chemId) => {
                      const chemical = getChemicalById(chemId);
                      if (!chemical) return null;

                      return (
                        <div
                          key={chemId}
                          className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center">
                                <div
                                  className="w-4 h-4 rounded-full mr-2"
                                  style={{ backgroundColor: chemical.color }}
                                ></div>
                                <h3 className="font-medium dark:text-gray-100">
                                  {getText(chemical.name, chemical.bengaliName)}{" "}
                                  ({chemical.formula})
                                </h3>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {getText(
                                  chemical.description,
                                  chemical.bengaliDescription
                                )}
                              </p>
                              <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <span className="mr-3">
                                  {getText("State", "অবস্থা")}:{" "}
                                  {getText(
                                    chemical.state === "solid"
                                      ? "Solid"
                                      : chemical.state === "liquid"
                                        ? "Liquid"
                                        : "Gas",
                                    chemical.state === "solid"
                                      ? "কঠিন"
                                      : chemical.state === "liquid"
                                        ? "তরল"
                                        : "গ্যাস"
                                  )}
                                </span>
                                <span>
                                  {getText("Type", "ধরন")}: {chemical.type}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeChemical(chemId)}
                              disabled={animationActive}
                              className={`text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ${
                                animationActive
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={performReaction}
                        disabled={
                          selectedChemicals.length < 2 || animationActive
                        }
                        className={`px-4 py-2 rounded-md text-white ${
                          selectedChemicals.length < 2 || animationActive
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {getText("Mix Chemicals", "বিক্রিয়া শুরু করুন")}
                      </button>

                      <button
                        onClick={resetExperiment}
                        className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        {getText("Reset", "রিসেট করুন")}
                      </button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="controls"
                className="bg-white dark:bg-gray-900 p-4 rounded-md shadow-md border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
                  {getText("Lab Settings", "ল্যাব সেটিংস")}
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium dark:text-gray-100">
                      {getText("Temperature", "তাপমাত্রা")}:{" "}
                      {labSettings.temperature}°C
                    </label>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[labSettings.temperature]}
                      onValueChange={handleTemperatureChange}
                      disabled={animationActive}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0°C</span>
                      <span>25°C</span>
                      <span>100°C</span>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium dark:text-gray-100">
                      {getText("Mixing Speed", "মিশ্রণের গতি")}:{" "}
                      {labSettings.mixingSpeed}%
                    </label>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      value={[labSettings.mixingSpeed]}
                      onValueChange={handleMixingSpeedChange}
                      disabled={animationActive}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{getText("Slow", "ধীর")}</span>
                      <span>{getText("Medium", "মাঝারি")}</span>
                      <span>{getText("Fast", "দ্রুত")}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium dark:text-gray-100">
                      {getText("View Mode", "ভিউ মোড")}
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio"
                          name="viewMode"
                          value="2d"
                          checked={labSettings.viewMode === "2d"}
                          onChange={() =>
                            setLabSettings({ ...labSettings, viewMode: "2d" })
                          }
                          disabled={animationActive}
                        />
                        <span className="ml-2 text-sm dark:text-gray-300">
                          2D
                        </span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio"
                          name="viewMode"
                          value="3d"
                          checked={labSettings.viewMode === "3d"}
                          onChange={() =>
                            setLabSettings({ ...labSettings, viewMode: "3d" })
                          }
                          disabled={animationActive}
                        />
                        <span className="ml-2 text-sm dark:text-gray-300">
                          3D
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-900 rounded-md shadow-md p-4 h-full flex flex-col border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
                {getText("Reaction Chamber", "রাসায়নিক বিক্রিয়া")}
              </h2>

              {!reaction ? (
                <div className="flex-grow flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md p-4">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <p className="mb-2">
                      {getText(
                        "Select 2 or more chemicals and mix them to see the reaction.",
                        "দুই বা ততোধিক রাসায়নিক পদার্থ নির্বাচন করে বিক্রিয়া দেখুন।"
                      )}
                    </p>
                    <span className="text-4xl">⚗️</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-grow bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden mb-4">
                    <canvas ref={canvasRef} className="w-full h-full"></canvas>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold mb-1 dark:text-gray-100">
                          {getText("Reaction Results", "বিক্রিয়ার ফলাফল")}:
                        </h3>
                        <p className="text-sm mb-2 dark:text-gray-200">
                          {reaction.equation ||
                            `${
                              getChemicalById(reaction.reactant1)?.formula
                            } + ${
                              getChemicalById(reaction.reactant2)?.formula
                            } → ${reaction.product}`}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          playAudioNarration(
                            labSettings.language === "bn"
                              ? reaction.bengaliDescription ||
                                  reaction.description
                              : reaction.description
                          )
                        }
                        className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 flex items-center"
                        aria-label="Play audio narration"
                      >
                        <span className="mr-1">🔊</span>{" "}
                        {getText("Listen", "শুনুন")}
                      </button>
                    </div>

                    <p className="text-gray-700 dark:text-gray-200 mb-2">
                      {getText(
                        reaction.description,
                        reaction.bengaliDescription
                      )}
                    </p>

                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800 grid grid-cols-2 gap-2 text-sm">
                      {reaction.reactionType && (
                        <div>
                          <span className="font-medium dark:text-gray-300">
                            {getText("Reaction Type", "বিক্রিয়ার ধরন")}:
                          </span>{" "}
                          <span className="text-gray-700 dark:text-gray-400 capitalize">
                            {reaction.reactionType}
                          </span>
                        </div>
                      )}

                      {reaction.temperature && (
                        <div>
                          <span className="font-medium dark:text-gray-300">
                            {getText("Temperature", "তাপমাত্রা")}:
                          </span>{" "}
                          <span className="text-gray-700 dark:text-gray-400">
                            {reaction.temperature}
                          </span>
                        </div>
                      )}

                      {reaction.energyChange && (
                        <div>
                          <span className="font-medium dark:text-gray-300">
                            {getText("Energy Change", "শক্তি পরিবর্তন")}:
                          </span>{" "}
                          <span className="text-gray-700 dark:text-gray-400 capitalize">
                            {reaction.energyChange}
                          </span>
                        </div>
                      )}

                      {reaction.hazards && (
                        <div>
                          <span className="font-medium dark:text-gray-300">
                            {getText("Safety Note", "নিরাপত্তা তথ্য")}:
                          </span>{" "}
                          <span className="text-gray-700 dark:text-gray-400">
                            {reaction.hazards}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ChemistryEngine;
