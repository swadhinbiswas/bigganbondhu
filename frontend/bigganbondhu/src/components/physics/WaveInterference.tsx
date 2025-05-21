import { useEffect, useRef, useState } from "react";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import WaveInterference3D from "./WaveInterference3D";

// Types for wave parameters
interface WaveParams {
  amplitude: number;
  frequency: number;
  visible: boolean;
}

// Labels for bilingual support
const LABELS = {
  title: {
    en: "Wave Interference and Beats Simulator",
    bn: "তরঙ্গ ব্যতিচার এবং বিট সিমুলেটর",
  },
  subtitle: {
    en: "Explore wave superposition and beat formation",
    bn: "তরঙ্গের সমন্বয় এবং বিট গঠন অন্বেষণ করুন",
  },
  wave1: {
    en: "Wave A",
    bn: "তরঙ্গ A",
  },
  wave2: {
    en: "Wave B",
    bn: "তরঙ্গ B",
  },
  resultant: {
    en: "Resultant Wave",
    bn: "লব্ধি তরঙ্গ",
  },
  amplitude: {
    en: "Amplitude",
    bn: "বিস্তার",
  },
  frequency: {
    en: "Frequency",
    bn: "কম্পাংক",
  },
  show: {
    en: "Show",
    bn: "দেখান",
  },
  hide: {
    en: "Hide",
    bn: "লুকান",
  },
  beatFrequency: {
    en: "Beat Frequency",
    bn: "বিট কম্পাংক",
  },
  mode: {
    en: "Mode",
    bn: "মোড",
  },
  interference: {
    en: "Interference",
    bn: "ব্যতিচার",
  },
  beats: {
    en: "Beats",
    bn: "বিট",
  },
  tooltips: {
    amplitude: {
      en: "Height of the wave from equilibrium position",
      bn: "সাম্যাবস্থা থেকে তরঙ্গের উচ্চতা",
    },
    frequency: {
      en: "Number of complete oscillations per second",
      bn: "প্রতি সেকেন্ডে সম্পূর্ণ দোলনের সংখ্যা",
    },
    beatFrequency: {
      en: "Frequency of amplitude modulation when two waves of similar frequencies interfere",
      bn: "কাছাকাছি কম্পাংকের দুটি তরঙ্গ ব্যতিচার করলে বিস্তারের পরিবর্তনের হার",
    },
  },
};

const getLabel = (key: keyof typeof LABELS, lang: "en" | "bn") => {
  const label = LABELS[key];
  if (
    typeof label === "object" &&
    label !== null &&
    "en" in label &&
    "bn" in label
  ) {
    return label[lang as "en" | "bn"] ?? label["en"];
  }
  return "";
};

// Wave calculation function
const calculateWave = (
  amplitude: number,
  frequency: number,
  time: number,
  x: number
) => {
  return amplitude * Math.sin(2 * Math.PI * frequency * (time + x));
};

// Main Wave Interference Component
const WaveInterference = () => {
  // State for wave parameters
  const [wave1, setWave1] = useState<WaveParams>({
    amplitude: 1,
    frequency: 1,
    visible: true,
  });
  const [wave2, setWave2] = useState<WaveParams>({
    amplitude: 1,
    frequency: 1.1, // Slightly different for beat demonstration
    visible: true,
  });
  const [resultantVisible, setResultantVisible] = useState(true);
  const [language, setLanguage] = useState<"en" | "bn">("en");
  const [time, setTime] = useState(0);
  const [mode, setMode] = useState<"interference" | "beats">("interference");
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");

  // Canvas and animation references
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // Effect for wave animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      if (!canvas || !ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set up coordinate system
      ctx.save();
      ctx.translate(0, canvas.height / 2);
      ctx.scale(1, -1); // Flip y-axis

      // Draw grid
      drawGrid(ctx, canvas.width, canvas.height);

      // Draw waves
      const points = 200;
      const dx = canvas.width / points;

      if (wave1.visible) {
        drawWave(ctx, wave1, "#ef4444", dx, points, time); // Red
      }
      if (wave2.visible) {
        drawWave(ctx, wave2, "#3b82f6", dx, points, time); // Blue
      }
      if (resultantVisible) {
        drawResultantWave(ctx, wave1, wave2, "#10b981", dx, points, time); // Green
      }

      // Draw beat envelope if in beats mode
      if (mode === "beats" && resultantVisible) {
        drawBeatEnvelope(ctx, wave1, wave2, "#f97316", dx, points, time);
      }

      ctx.restore();

      // Update time
      setTime((t) => t + 0.02);

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [wave1, wave2, resultantVisible, mode]);

  // Draw grid function
  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 0.5;

    // Vertical grid lines
    for (let x = 0; x <= width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, -height / 2);
      ctx.lineTo(x, height / 2);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = -height / 2; y <= height / 2; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw x and y axes
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.moveTo(0, -height / 2);
    ctx.lineTo(0, height / 2);
    ctx.stroke();
  };

  // Draw single wave function
  const drawWave = (
    ctx: CanvasRenderingContext2D,
    wave: WaveParams,
    color: string,
    dx: number,
    points: number,
    time: number
  ) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i <= points; i++) {
      const x = i * dx;
      const y = calculateWave(
        wave.amplitude * 100,
        wave.frequency,
        time,
        i / points
      );

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  };

  // Draw resultant wave function
  const drawResultantWave = (
    ctx: CanvasRenderingContext2D,
    wave1: WaveParams,
    wave2: WaveParams,
    color: string,
    dx: number,
    points: number,
    time: number
  ) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i <= points; i++) {
      const x = i * dx;
      const y1 = calculateWave(
        wave1.amplitude * 100,
        wave1.frequency,
        time,
        i / points
      );
      const y2 = calculateWave(
        wave2.amplitude * 100,
        wave2.frequency,
        time,
        i / points
      );
      const y = y1 + y2; // Superposition

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  };

  // Draw beat envelope function
  const drawBeatEnvelope = (
    ctx: CanvasRenderingContext2D,
    wave1: WaveParams,
    wave2: WaveParams,
    color: string,
    dx: number,
    points: number,
    time: number
  ) => {
    const beatFrequency = Math.abs(wave1.frequency - wave2.frequency);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();

    for (let i = 0; i <= points; i++) {
      const x = i * dx;
      const envelope =
        (wave1.amplitude + wave2.amplitude) *
        100 *
        Math.abs(Math.cos(Math.PI * beatFrequency * (time + i / points)));

      if (i === 0) {
        ctx.moveTo(x, envelope);
      } else {
        ctx.lineTo(x, envelope);
      }
    }

    ctx.stroke();
    ctx.beginPath();

    for (let i = 0; i <= points; i++) {
      const x = i * dx;
      const envelope =
        -(wave1.amplitude + wave2.amplitude) *
        100 *
        Math.abs(Math.cos(Math.PI * beatFrequency * (time + i / points)));

      if (i === 0) {
        ctx.moveTo(x, envelope);
      } else {
        ctx.lineTo(x, envelope);
      }
    }

    ctx.stroke();
    ctx.setLineDash([]);
  };

  // Calculate beat frequency
  const beatFrequency = Math.abs(wave1.frequency - wave2.frequency);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-xl shadow-2xl">
      {/* View Mode Toggle */}
      <div className="flex justify-end mb-2">
        <button
          className={`px-3 py-1 rounded-l ${viewMode === "2d" ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
          onClick={() => setViewMode("2d")}
        >
          2D
        </button>
        <button
          className={`px-3 py-1 rounded-r ${viewMode === "3d" ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
          onClick={() => setViewMode("3d")}
        >
          3D
        </button>
      </div>
      {viewMode === "2d" ? (
        <>
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold mb-2">
              {getLabel("title", language)}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {getLabel("subtitle", language)}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Wave Display */}
            <div className="flex-1 min-h-[400px] bg-white dark:bg-gray-800 rounded-lg p-4 shadow-inner">
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="w-full h-full"
              />
            </div>

            {/* Controls */}
            <div className="flex-1 space-y-6">
              {/* Mode Selection */}
              <div className="mb-4">
                <Label>{getLabel("mode", language)}</Label>
                <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="interference">
                      {getLabel("interference", language)}
                    </TabsTrigger>
                    <TabsTrigger value="beats">
                      {getLabel("beats", language)}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Wave 1 Controls */}
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-red-600 dark:text-red-400">
                    {getLabel("wave1", language)}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={wave1.visible}
                      onCheckedChange={(checked: boolean) =>
                        setWave1({ ...wave1, visible: checked })
                      }
                    />
                    <Label>
                      {wave1.visible
                        ? getLabel("show", language)
                        : getLabel("hide", language)}
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label title={LABELS.tooltips.amplitude[language]}>
                      {getLabel("amplitude", language)}
                    </Label>
                    <Slider
                      min={0}
                      max={2}
                      step={0.1}
                      value={[wave1.amplitude]}
                      onValueChange={(value) =>
                        setWave1({ ...wave1, amplitude: value[0] })
                      }
                    />
                  </div>
                  <div>
                    <Label title={LABELS.tooltips.frequency[language]}>
                      {getLabel("frequency", language)}
                    </Label>
                    <Slider
                      min={0.5}
                      max={2}
                      step={0.1}
                      value={[wave1.frequency]}
                      onValueChange={(value) =>
                        setWave1({ ...wave1, frequency: value[0] })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Wave 2 Controls */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-blue-600 dark:text-blue-400">
                    {getLabel("wave2", language)}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={wave2.visible}
                      onCheckedChange={(checked: boolean) =>
                        setWave2({ ...wave2, visible: checked })
                      }
                    />
                    <Label>
                      {wave2.visible
                        ? getLabel("show", language)
                        : getLabel("hide", language)}
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label title={LABELS.tooltips.amplitude[language]}>
                      {getLabel("amplitude", language)}
                    </Label>
                    <Slider
                      min={0}
                      max={2}
                      step={0.1}
                      value={[wave2.amplitude]}
                      onValueChange={(value) =>
                        setWave2({ ...wave2, amplitude: value[0] })
                      }
                    />
                  </div>
                  <div>
                    <Label title={LABELS.tooltips.frequency[language]}>
                      {getLabel("frequency", language)}
                    </Label>
                    <Slider
                      min={0.5}
                      max={2}
                      step={0.1}
                      value={[wave2.frequency]}
                      onValueChange={(value) =>
                        setWave2({ ...wave2, frequency: value[0] })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Resultant Wave Controls */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-green-600 dark:text-green-400">
                    {getLabel("resultant", language)}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={resultantVisible}
                      onCheckedChange={(checked: boolean) =>
                        setResultantVisible(checked)
                      }
                    />
                    <Label>
                      {resultantVisible
                        ? getLabel("show", language)
                        : getLabel("hide", language)}
                    </Label>
                  </div>
                </div>

                {mode === "beats" && (
                  <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-900/20 rounded">
                    <Label
                      className="block mb-2"
                      title={LABELS.tooltips.beatFrequency[language]}
                    >
                      {getLabel("beatFrequency", language)}:{" "}
                      <span className="font-mono">
                        {beatFrequency.toFixed(2)} Hz
                      </span>
                    </Label>
                  </div>
                )}
              </div>

              {/* Language Toggle */}
              <button
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setLanguage(language === "en" ? "bn" : "en")}
              >
                {language === "en" ? "বাংলা" : "English"}
              </button>
            </div>
          </div>
        </>
      ) : (
        <WaveInterference3D
          wave1={wave1}
          wave2={wave2}
          resultantVisible={resultantVisible}
          mode={mode}
        />
      )}
    </div>
  );
};

export default WaveInterference;
