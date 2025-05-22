import { useEffect, useRef, useState } from "react";

import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DefaultLayout from "@/layouts/default";
import apiService from "@/services/apiService";

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

// Helper function to adjust color brightness
const adjustColorBrightness = (color: string, percent: number): string => {
  // Handle non-hex colors or invalid values
  if (!color || !color.startsWith("#") || color.length < 7) {
    // Default to a light blue if color is invalid
    return percent > 0 ? "#e6f7ff" : "#a6d7ff";
  }

  // Extract RGB components
  let r = parseInt(color.substring(1, 3), 16) || 0;
  let g = parseInt(color.substring(3, 5), 16) || 0;
  let b = parseInt(color.substring(5, 7), 16) || 0;

  // Ignore alpha component if present
  const hasAlpha = color.length > 7;

  // Adjust brightness
  r = Math.min(255, Math.max(0, Math.round(r * (1 + percent / 100))));
  g = Math.min(255, Math.max(0, Math.round(g * (1 + percent / 100))));
  b = Math.min(255, Math.max(0, Math.round(b * (1 + percent / 100))));

  // Convert back to hex
  const rHex = r.toString(16).padStart(2, "0");
  const gHex = g.toString(16).padStart(2, "0");
  const bHex = b.toString(16).padStart(2, "0");

  // Return the color with original alpha if it had one
  return `#${rHex}${gHex}${bHex}${hasAlpha ? color.substring(7) : ""}`;
};

// Helper function for 3D view mode (enhanced version)
const render3DView = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  reaction: Reaction | null,
  settings: LabSettings,
  animationActive: boolean,
) => {
  if (!canvasRef.current) return null;

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  // Clear and set dimensions
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Draw 3D beaker with proper perspective
  ctx.save();

  // Parameters for 3D transformation
  const perspectiveDepth = 0.15; // Controls the 3D depth effect
  const rotationDegree = 15; // Slight rotation for 3D effect (degrees)
  const rotationRad = (rotationDegree * Math.PI) / 180;

  // Beaker dimensions adjusted for perspective
  const beakerWidth = canvas.width * 0.4;
  const beakerHeight = canvas.height * 0.5;
  const beakerDepth = beakerWidth * 0.8;
  const lipWidth = beakerWidth * 0.1;

  // Calculate vertices in 3D space
  // Front face
  const frontTopLeft = {
    x: centerX - beakerWidth / 2,
    y: centerY - beakerHeight / 2,
  };
  const frontTopRight = {
    x: centerX + beakerWidth / 2,
    y: centerY - beakerHeight / 2,
  };
  const frontBottomLeft = {
    x: centerX - beakerWidth / 2,
    y: centerY + beakerHeight / 2,
  };
  const frontBottomRight = {
    x: centerX + beakerWidth / 2,
    y: centerY + beakerHeight / 2,
  };

  // Back face with perspective
  const backTopLeft = {
    x: frontTopLeft.x - beakerDepth * Math.sin(rotationRad),
    y: frontTopLeft.y - beakerDepth * perspectiveDepth,
  };
  const backTopRight = {
    x: frontTopRight.x - beakerDepth * Math.sin(rotationRad),
    y: frontTopRight.y - beakerDepth * perspectiveDepth,
  };
  const backBottomLeft = {
    x: frontBottomLeft.x - beakerDepth * Math.sin(rotationRad),
    y: frontBottomLeft.y - beakerDepth * perspectiveDepth,
  };
  const backBottomRight = {
    x: frontBottomRight.x - beakerDepth * Math.sin(rotationRad),
    y: frontBottomRight.y - beakerDepth * perspectiveDepth,
  };

  // Lip (top edge) coordinates
  const frontLipLeft = {
    x: frontTopLeft.x - lipWidth,
    y: frontTopLeft.y - lipWidth,
  };
  const frontLipRight = {
    x: frontTopRight.x + lipWidth,
    y: frontTopRight.y - lipWidth,
  };
  const backLipLeft = {
    x: backTopLeft.x - lipWidth,
    y: backTopLeft.y - lipWidth,
  };
  const backLipRight = {
    x: backTopRight.x + lipWidth,
    y: backTopRight.y - lipWidth,
  };

  // Draw beaker with glass effect

  // Draw back face (only parts that would be visible)
  ctx.strokeStyle = "#aabbc0";
  ctx.lineWidth = 1;

  // Back left edge
  ctx.beginPath();
  ctx.moveTo(backTopLeft.x, backTopLeft.y);
  ctx.lineTo(backBottomLeft.x, backBottomLeft.y);
  ctx.stroke();

  // Back bottom edge
  ctx.beginPath();
  ctx.moveTo(backBottomLeft.x, backBottomLeft.y);
  ctx.lineTo(backBottomRight.x, backBottomRight.y);
  ctx.stroke();

  // Back right edge
  ctx.beginPath();
  ctx.moveTo(backTopRight.x, backTopRight.y);
  ctx.lineTo(backBottomRight.x, backBottomRight.y);
  ctx.stroke();

  // Draw back lip
  ctx.beginPath();
  ctx.moveTo(backLipLeft.x, backLipLeft.y);
  ctx.lineTo(backTopLeft.x, backTopLeft.y);
  ctx.lineTo(backTopRight.x, backTopRight.y);
  ctx.lineTo(backLipRight.x, backLipRight.y);
  ctx.stroke();

  // Connect front and back faces
  ctx.beginPath();
  ctx.moveTo(frontBottomLeft.x, frontBottomLeft.y);
  ctx.lineTo(backBottomLeft.x, backBottomLeft.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(frontBottomRight.x, frontBottomRight.y);
  ctx.lineTo(backBottomRight.x, backBottomRight.y);
  ctx.stroke();

  // Draw liquid in beaker with 3D perspective
  if (reaction) {
    // Liquid top surface (with perspective)
    const liquidLevel = 0.65; // Fill level (0-1)
    const liquidY = frontTopLeft.y + beakerHeight * (1 - liquidLevel);
    const liquidBackY = backTopLeft.y + beakerHeight * (1 - liquidLevel);

    // Side edges of liquid
    ctx.beginPath();
    ctx.moveTo(frontTopLeft.x, liquidY);
    ctx.lineTo(backTopLeft.x, liquidBackY);
    ctx.strokeStyle = "#8fa3b0";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(frontTopRight.x, liquidY);
    ctx.lineTo(backTopRight.x, liquidBackY);
    ctx.stroke();

    // Draw liquid back surface
    ctx.beginPath();
    ctx.moveTo(backTopLeft.x, liquidBackY);
    ctx.lineTo(backTopRight.x, liquidBackY);
    ctx.lineTo(backBottomRight.x, backBottomRight.y);
    ctx.lineTo(backBottomLeft.x, backBottomLeft.y);
    ctx.closePath();

    // Create gradient for back face of liquid
    const backLiquidGradient = ctx.createLinearGradient(
      backTopLeft.x,
      liquidBackY,
      backBottomLeft.x,
      backBottomLeft.y,
    );

    const baseColor = reaction.color || "#e0e0ff";
    const lighterColor = adjustColorBrightness(baseColor, 10);
    const darkerColor = adjustColorBrightness(baseColor, -20);

    backLiquidGradient.addColorStop(0, lighterColor);
    backLiquidGradient.addColorStop(1, darkerColor);

    ctx.fillStyle = backLiquidGradient;
    ctx.fill();

    // Draw liquid top surface (with elliptical perspective and meniscus)
    ctx.beginPath();
    // Draw slightly concave top surface for meniscus effect
    ctx.moveTo(frontTopLeft.x, liquidY);
    ctx.bezierCurveTo(
      centerX - beakerWidth / 4,
      liquidY + 5,
      centerX + beakerWidth / 4,
      liquidY + 5,
      frontTopRight.x,
      liquidY,
    );
    ctx.lineTo(backTopRight.x, liquidBackY);
    ctx.bezierCurveTo(
      centerX + beakerWidth / 4 - beakerDepth * Math.sin(rotationRad),
      liquidBackY + 5,
      centerX - beakerWidth / 4 - beakerDepth * Math.sin(rotationRad),
      liquidBackY + 5,
      backTopLeft.x,
      liquidBackY,
    );
    ctx.closePath();

    // Create gradient for liquid top surface
    const topLiquidGradient = ctx.createLinearGradient(
      frontTopLeft.x,
      liquidY,
      backTopLeft.x,
      liquidBackY,
    );

    topLiquidGradient.addColorStop(0, lighterColor);
    topLiquidGradient.addColorStop(1, adjustColorBrightness(lighterColor, 10));

    ctx.fillStyle = topLiquidGradient;
    ctx.fill();

    // Draw liquid front surface
    ctx.beginPath();
    ctx.moveTo(frontTopLeft.x, liquidY);
    ctx.bezierCurveTo(
      centerX - beakerWidth / 4,
      liquidY + 5,
      centerX + beakerWidth / 4,
      liquidY + 5,
      frontTopRight.x,
      liquidY,
    );
    ctx.lineTo(frontBottomRight.x, frontBottomRight.y);
    ctx.lineTo(frontBottomLeft.x, frontBottomLeft.y);
    ctx.closePath();

    // Create gradient for front face of liquid
    const frontLiquidGradient = ctx.createLinearGradient(
      frontTopLeft.x,
      liquidY,
      frontBottomLeft.x,
      frontBottomLeft.y,
    );

    frontLiquidGradient.addColorStop(0, lighterColor);
    frontLiquidGradient.addColorStop(1, darkerColor);

    ctx.fillStyle = frontLiquidGradient;
    ctx.fill();

    // Add illumination/reflection to liquid surface
    ctx.beginPath();
    const reflectionWidth = beakerWidth * 0.3;
    const reflectionHeight = beakerDepth * 0.1;

    ctx.ellipse(
      centerX - beakerWidth * 0.15,
      liquidY + 5,
      reflectionWidth,
      reflectionHeight,
      0,
      0,
      Math.PI * 2,
    );

    const reflectionGradient = ctx.createRadialGradient(
      centerX - beakerWidth * 0.15,
      liquidY + 5,
      0,
      centerX - beakerWidth * 0.15,
      liquidY + 5,
      reflectionWidth,
    );

    reflectionGradient.addColorStop(0, "rgba(255, 255, 255, 0.15)");
    reflectionGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = reflectionGradient;
    ctx.fill();

    // Draw reaction effects
    if (animationActive && reaction) {
      if (reaction.animation === "bubble") {
        // Draw bubbles with 3D perspective
        for (let i = 0; i < 12; i++) {
          // Calculate bubble positions within the liquid
          const bubbleX = frontTopLeft.x + Math.random() * beakerWidth;
          const bubbleY =
            liquidY + Math.random() * (frontBottomLeft.y - liquidY);
          const bubbleSize =
            (3 + Math.random() * 5) * (settings.temperature / 50);

          // Add bubble
          ctx.beginPath();
          ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);

          // Bubble gradient for 3D effect
          const bubbleGradient = ctx.createRadialGradient(
            bubbleX - bubbleSize * 0.3,
            bubbleY - bubbleSize * 0.3,
            0,
            bubbleX,
            bubbleY,
            bubbleSize,
          );

          bubbleGradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
          bubbleGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.4)");
          bubbleGradient.addColorStop(1, "rgba(255, 255, 255, 0.1)");

          ctx.fillStyle = bubbleGradient;
          ctx.fill();

          // Add highlight to bubble
          ctx.beginPath();
          ctx.arc(
            bubbleX - bubbleSize * 0.3,
            bubbleY - bubbleSize * 0.3,
            bubbleSize * 0.2,
            0,
            Math.PI * 2,
          );
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.fill();
        }
      } else if (reaction.animation === "precipitate") {
        // Draw precipitate particles
        for (let i = 0; i < 40; i++) {
          const particleX = frontTopLeft.x + Math.random() * beakerWidth;
          const particleBaseY =
            frontBottomLeft.y - Math.random() * (beakerHeight * 0.15);
          const particleSize = 1 + Math.random() * 2;

          ctx.beginPath();
          ctx.arc(particleX, particleBaseY, particleSize, 0, Math.PI * 2);
          ctx.fillStyle = "#555";
          ctx.fill();
        }

        // Draw sediment layer at bottom
        ctx.beginPath();
        ctx.moveTo(frontBottomLeft.x, frontBottomLeft.y - 5);
        ctx.lineTo(frontBottomRight.x, frontBottomRight.y - 5);
        ctx.lineTo(backBottomRight.x, backBottomRight.y - 5);
        ctx.lineTo(backBottomLeft.x, backBottomLeft.y - 5);
        ctx.closePath();
        ctx.fillStyle = "#555";
        ctx.fill();
      } else if (reaction.animation === "smoke") {
        // Draw smoke coming from liquid surface
        for (let i = 0; i < 7; i++) {
          const smokeBaseX = frontTopLeft.x + Math.random() * beakerWidth;
          const smokeBaseY = liquidY;
          const smokeSize = 10 + Math.random() * 15;

          const smokeGradient = ctx.createRadialGradient(
            smokeBaseX,
            smokeBaseY,
            0,
            smokeBaseX,
            smokeBaseY,
            smokeSize,
          );

          smokeGradient.addColorStop(0, "rgba(200, 200, 200, 0.2)");
          smokeGradient.addColorStop(1, "rgba(200, 200, 200, 0)");

          ctx.fillStyle = smokeGradient;
          ctx.beginPath();
          ctx.arc(
            smokeBaseX,
            smokeBaseY - smokeSize * 0.7,
            smokeSize,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      } else if (reaction.animation === "color-change") {
        // Add swirl patterns to visualize mixing
        const swirlRadius = beakerWidth * 0.15;

        // Create a few swirl patterns
        for (let i = 0; i < 3; i++) {
          const swirlX =
            frontTopLeft.x + beakerWidth * (0.3 + Math.random() * 0.4);
          const swirlY =
            liquidY +
            (frontBottomLeft.y - liquidY) * (0.3 + Math.random() * 0.4);

          const swirlGradient = ctx.createRadialGradient(
            swirlX,
            swirlY,
            0,
            swirlX,
            swirlY,
            swirlRadius,
          );

          const targetColor = reaction.color;
          const swirledColor = `rgba(${parseInt(targetColor.slice(1, 3), 16)}, ${parseInt(targetColor.slice(3, 5), 16)}, ${parseInt(targetColor.slice(5, 7), 16)}, 0.4)`;

          swirlGradient.addColorStop(0, swirledColor);
          swirlGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.fillStyle = swirlGradient;
          ctx.beginPath();
          ctx.arc(swirlX, swirlY, swirlRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // Draw the front edges of the beaker
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#8fa3b0";

  // Front lip
  ctx.beginPath();
  ctx.moveTo(frontLipLeft.x, frontLipLeft.y);
  ctx.lineTo(frontTopLeft.x, frontTopLeft.y);
  ctx.lineTo(frontTopRight.x, frontTopRight.y);
  ctx.lineTo(frontLipRight.x, frontLipRight.y);
  ctx.stroke();

  // Front face edges
  ctx.beginPath();
  ctx.moveTo(frontTopLeft.x, frontTopLeft.y);
  ctx.lineTo(frontBottomLeft.x, frontBottomLeft.y);
  ctx.lineTo(frontBottomRight.x, frontBottomRight.y);
  ctx.lineTo(frontTopRight.x, frontTopRight.y);
  ctx.stroke();

  // Add measurement markings
  for (let i = 0.2; i <= 0.8; i += 0.2) {
    const markY = frontTopLeft.y + beakerHeight * i;

    // Left markings
    ctx.beginPath();
    ctx.moveTo(frontTopLeft.x, markY);
    ctx.lineTo(frontTopLeft.x + beakerWidth * 0.05, markY);
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Right markings
    ctx.beginPath();
    ctx.moveTo(frontTopRight.x, markY);
    ctx.lineTo(frontTopRight.x - beakerWidth * 0.05, markY);
    ctx.stroke();

    // Labels for major markings
    if (i % 0.2 === 0) {
      ctx.font = "10px Arial";
      ctx.fillStyle = "#aaa";
      ctx.textAlign = "left";
      const markValue = Math.round((1 - i) * 100);

      ctx.fillText(`${markValue}ml`, frontTopLeft.x - 30, markY + 4);
    }
  }

  // Glass reflections for realism

  // Add long highlight on left side
  ctx.beginPath();
  ctx.moveTo(frontTopLeft.x + 5, frontTopLeft.y + 20);
  ctx.lineTo(frontTopLeft.x + 5, frontBottomLeft.y - 20);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Add smaller highlight on right side
  ctx.beginPath();
  ctx.moveTo(frontTopRight.x - 10, frontTopRight.y + 40);
  ctx.lineTo(frontTopRight.x - 10, frontTopRight.y + 80);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 2;
  ctx.stroke();

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
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchChemicals = async () => {
      try {
        setLoading(true);
        const data = await apiService.chemistry.getAll();

        setChemicals((data as any).chemicals || []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load from API, trying local data", err);
        try {
          const data = await apiService.chemistry.getChemicals();

          setChemicals((data as any).chemicals || []);
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

  // Initialize canvas when it's available
  useEffect(() => {
    if (canvasRef.current && reaction) {
      // Set initial canvas dimensions
      const canvas = canvasRef.current;

      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      // Draw reaction animation
      drawReactionAnimation(reaction.animation, reaction.color);

      // Handle window resize to maintain proper canvas dimensions
      const handleResize = () => {
        if (canvasRef.current) {
          canvasRef.current.width = canvasRef.current.clientWidth;
          canvasRef.current.height = canvasRef.current.clientHeight;
          drawReactionAnimation(reaction.animation, reaction.color);
        }
      };

      window.addEventListener("resize", handleResize);

      // Cleanup: remove event listener and cancel animations
      return () => {
        window.removeEventListener("resize", handleResize);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    } else {
      // Cleanup function when there's no reaction
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [
    canvasRef,
    reaction,
    labSettings.temperature,
    labSettings.mixingSpeed,
    labSettings.viewMode,
  ]);

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
        mixingSpeed,
      );

      setReaction(data as Reaction);
      setAnimationActive(true);

      applyLabSettingsToReaction(data as Reaction);

      const descriptionText =
        labSettings.language === "bn"
          ? (data as any).bengaliDescription || (data as any).description
          : (data as any).description;

      playAudioNarration(descriptionText);

      if (canvasRef.current) {
        drawReactionAnimation((data as any).animation, (data as any).color);
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
      reactionData.id,
    );
  };

  const drawReactionAnimation = (animationType: string, color: string) => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    // Reset any ongoing animations
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

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
      // Draw the beaker's glass with a more realistic appearance
      ctx.save();

      // Draw background reflection/shadow for 3D effect
      ctx.beginPath();
      ctx.ellipse(
        canvas.width * 0.5,
        canvas.height * 0.8 + 5,
        canvas.width * 0.35,
        10,
        0,
        0,
        Math.PI * 2,
      );
      const shadowGradient = ctx.createRadialGradient(
        canvas.width * 0.5,
        canvas.height * 0.8 + 5,
        0,
        canvas.width * 0.5,
        canvas.height * 0.8 + 5,
        canvas.width * 0.35,
      );

      shadowGradient.addColorStop(0, "rgba(0, 0, 0, 0.2)");
      shadowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = shadowGradient;
      ctx.fill();

      // Draw beaker outline with rounded corners
      const cornerRadius = 5;

      // Draw main beaker body with rounded corners at the bottom
      ctx.beginPath();
      // Top lip left
      ctx.moveTo(canvas.width * 0.25, canvas.height * 0.15);
      // Neck left side
      ctx.lineTo(canvas.width * 0.2, canvas.height * 0.2);
      // Left side down to bottom-left corner
      ctx.lineTo(canvas.width * 0.2, canvas.height * 0.8 - cornerRadius);

      // Bottom-left corner
      ctx.arcTo(
        canvas.width * 0.2,
        canvas.height * 0.8,
        canvas.width * 0.2 + cornerRadius,
        canvas.height * 0.8,
        cornerRadius,
      );

      // Bottom side
      ctx.lineTo(canvas.width * 0.8 - cornerRadius, canvas.height * 0.8);

      // Bottom-right corner
      ctx.arcTo(
        canvas.width * 0.8,
        canvas.height * 0.8,
        canvas.width * 0.8,
        canvas.height * 0.8 - cornerRadius,
        cornerRadius,
      );

      // Right side
      ctx.lineTo(canvas.width * 0.8, canvas.height * 0.2);
      // Top-right neck
      ctx.lineTo(canvas.width * 0.75, canvas.height * 0.15);
      ctx.closePath();

      // Create a glass-like fill using multiple gradients
      // First a subtle color for the glass (slightly blue tinted)
      const glassBodyGradient = ctx.createLinearGradient(
        canvas.width * 0.2,
        0,
        canvas.width * 0.8,
        0,
      );

      glassBodyGradient.addColorStop(0, "rgba(220, 240, 250, 0.08)");
      glassBodyGradient.addColorStop(0.5, "rgba(240, 245, 250, 0.05)");
      glassBodyGradient.addColorStop(1, "rgba(220, 240, 250, 0.08)");
      ctx.fillStyle = glassBodyGradient;
      ctx.fill();

      // Glass outline
      ctx.strokeStyle = "#8fa3b0";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Add light reflection highlights
      // Vertical reflection on left side
      const leftReflection = ctx.createLinearGradient(
        canvas.width * 0.21,
        canvas.height * 0.2,
        canvas.width * 0.24,
        canvas.height * 0.2,
      );

      leftReflection.addColorStop(0, "rgba(255, 255, 255, 0.4)");
      leftReflection.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.21, canvas.height * 0.2);
      ctx.lineTo(canvas.width * 0.21, canvas.height * 0.75);
      ctx.lineTo(canvas.width * 0.24, canvas.height * 0.73);
      ctx.lineTo(canvas.width * 0.24, canvas.height * 0.22);
      ctx.closePath();
      ctx.fillStyle = leftReflection;
      ctx.fill();

      // Top rim highlight
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.25, canvas.height * 0.15);
      ctx.lineTo(canvas.width * 0.75, canvas.height * 0.15);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Add measurement lines with improved styling
      for (let i = 0.3; i <= 0.7; i += 0.1) {
        const isMain = i % 0.2 === 0;
        const lineWidth = isMain ? canvas.width * 0.04 : canvas.width * 0.02;

        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.2, canvas.height * i);
        ctx.lineTo(canvas.width * 0.2 + lineWidth, canvas.height * i);
        ctx.strokeStyle = isMain ? "#a0b5c0" : "#aab0b5";
        ctx.lineWidth = isMain ? 1.5 : 1;
        ctx.stroke();

        if (isMain) {
          // Add measurement text for major lines
          ctx.font = `${Math.round(canvas.width * 0.025)}px Arial`;
          ctx.fillStyle = "#a0b5c0";
          ctx.textAlign = "left";
          ctx.fillText(
            `${Math.round((0.8 - i) * 100)}ml`,
            canvas.width * 0.2 + lineWidth + 2,
            canvas.height * i + 4,
          );
        }
      }

      ctx.restore();
    };

    drawBeaker();

    // Draw the liquid with a gradient effect for more realism
    const liquidGradient = ctx.createLinearGradient(
      0,
      canvas.height * 0.4,
      0,
      canvas.height * 0.8,
    );

    // Create more realistic color from the hex color
    const baseColor = color || "#e0e0ff";
    const lighterColor = adjustColorBrightness(baseColor, 20);
    const darkerColor = adjustColorBrightness(baseColor, -20);

    liquidGradient.addColorStop(0, lighterColor);
    liquidGradient.addColorStop(1, darkerColor);

    ctx.fillStyle = liquidGradient;
    ctx.fillRect(
      canvas.width * 0.21, // Slightly inside the beaker
      canvas.height * 0.4,
      canvas.width * 0.58,
      canvas.height * 0.39, // Slightly above bottom for 3D effect
    );

    // Add meniscus effect (curved liquid surface)
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.21, canvas.height * 0.4);
    ctx.quadraticCurveTo(
      canvas.width * 0.5,
      canvas.height * 0.39,
      canvas.width * 0.79,
      canvas.height * 0.4,
    );
    ctx.fill();

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

          // Draw liquid with gradient
          const liquidGradient = ctx.createLinearGradient(
            0,
            canvas.height * 0.4,
            0,
            canvas.height * 0.8,
          );

          const baseColor = color || "#e0e0ff";
          const lighterColor = adjustColorBrightness(baseColor, 20);
          const darkerColor = adjustColorBrightness(baseColor, -20);

          liquidGradient.addColorStop(0, lighterColor);
          liquidGradient.addColorStop(1, darkerColor);

          ctx.fillStyle = liquidGradient;
          ctx.fillRect(
            canvas.width * 0.21,
            canvas.height * 0.4,
            canvas.width * 0.58,
            canvas.height * 0.39,
          );

          // Add meniscus effect
          ctx.beginPath();
          ctx.moveTo(canvas.width * 0.21, canvas.height * 0.4);
          ctx.quadraticCurveTo(
            canvas.width * 0.5,
            canvas.height * 0.39,
            canvas.width * 0.79,
            canvas.height * 0.4,
          );
          ctx.fill();

          // Draw bubbles with more realistic appearance
          bubbles.forEach((bubble) => {
            // Create bubble gradient for 3D effect
            const bubbleGradient = ctx.createRadialGradient(
              bubble.x - bubble.r * 0.3,
              bubble.y - bubble.r * 0.3,
              0,
              bubble.x,
              bubble.y,
              bubble.r,
            );

            bubbleGradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
            bubbleGradient.addColorStop(0.9, "rgba(255, 255, 255, 0.2)");
            bubbleGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

            // Draw bubble
            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2);
            ctx.fillStyle = bubbleGradient;
            ctx.fill();

            // Add tiny highlight for realism
            ctx.beginPath();
            ctx.arc(
              bubble.x - bubble.r * 0.3,
              bubble.y - bubble.r * 0.3,
              bubble.r / 4,
              0,
              Math.PI * 2,
            );
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fill();

            // Update bubble position with wobble effect
            bubble.y -= bubble.speed * (labSettings.mixingSpeed / 50);
            bubble.x += Math.sin(bubble.y * 0.05) * 0.5; // Add sideways movement

            // Reset bubble position when it reaches the surface
            if (bubble.y < canvas.height * 0.4) {
              // Create a bubble "pop" effect at the surface
              ctx.beginPath();
              ctx.arc(
                bubble.x,
                canvas.height * 0.4,
                bubble.r * 1.5,
                0,
                Math.PI * 2,
              );
              ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
              ctx.fill();

              // Reset bubble
              bubble.y = canvas.height * 0.8;
              bubble.x =
                canvas.width * 0.21 + Math.random() * (canvas.width * 0.58);
              bubble.r =
                1 + Math.random() * (4 * (labSettings.temperature / 50)); // Size varies with temperature
              bubble.speed =
                0.5 + Math.random() * 2 * (labSettings.mixingSpeed / 50); // Speed varies with mixing speed
            }
          });

          animationFrameRef.current = requestAnimationFrame(animateBubbles);
        };

        animateBubbles();
        break;

      case "color-change":
        let progress = 0;
        // Parse initial and target colors safely
        const parseHexColor = (hex: string) => {
          if (
            !hex ||
            typeof hex !== "string" ||
            !hex.startsWith("#") ||
            hex.length < 7
          ) {
            return { r: 224, g: 224, b: 255 }; // Default light blue
          }
          try {
            return {
              r: parseInt(hex.substring(1, 3), 16) || 0,
              g: parseInt(hex.substring(3, 5), 16) || 0,
              b: parseInt(hex.substring(5, 7), 16) || 0,
            };
          } catch (e) {
            console.error("Error parsing color:", hex, e);

            return { r: 224, g: 224, b: 255 }; // Default on error
          }
        };

        // Get reaction type for special visual effects
        const isAcidBasic = reaction?.reactionType?.includes("acid") || false;

        // Choose better starting color based on reaction type
        const effectiveStartColor = isAcidBasic ? "#e6fcf5" : "#f8f9fa";

        const startRgb = parseHexColor(effectiveStartColor);
        const targetRgb = parseHexColor(color || "#e0e0ff");

        // Create swirl patterns for more realistic mixing
        const swirlPoints: {
          x: number;
          y: number;
          radius: number;
          direction: number;
          speed: number;
        }[] = [];

        for (let i = 0; i < 5; i++) {
          swirlPoints.push({
            x: canvas.width * (0.3 + Math.random() * 0.4),
            y: canvas.height * (0.45 + Math.random() * 0.3),
            radius: 10 + Math.random() * 30,
            direction: Math.random() > 0.5 ? 1 : -1,
            speed: 0.02 + Math.random() * 0.03,
          });
        }

        const animateColorChange = () => {
          // Calculate speed based on temperature and mixing speed
          const tempFactor = labSettings.temperature / 50; // 0.5 to 2
          const mixFactor = labSettings.mixingSpeed / 50; // 0.5 to 2
          const speedMultiplier = tempFactor * mixFactor;

          progress += 0.007 * speedMultiplier;

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawBeaker();

          if (progress <= 1) {
            // Calculate interpolated color
            const baseR = Math.floor(
              startRgb.r * (1 - progress) + targetRgb.r * progress,
            );
            const baseG = Math.floor(
              startRgb.g * (1 - progress) + targetRgb.g * progress,
            );
            const baseB = Math.floor(
              startRgb.b * (1 - progress) + targetRgb.b * progress,
            );

            // Convert to hex for gradient
            const baseColor = `#${baseR.toString(16).padStart(2, "0")}${baseG.toString(16).padStart(2, "0")}${baseB.toString(16).padStart(2, "0")}`;

            // Draw base liquid with gradient
            const liquidGradient = ctx.createLinearGradient(
              0,
              canvas.height * 0.4,
              0,
              canvas.height * 0.8,
            );

            const lighterColor = adjustColorBrightness(baseColor, 15);
            const darkerColor = adjustColorBrightness(baseColor, -15);

            liquidGradient.addColorStop(0, lighterColor);
            liquidGradient.addColorStop(1, darkerColor);

            ctx.fillStyle = liquidGradient;
            ctx.fillRect(
              canvas.width * 0.21,
              canvas.height * 0.4,
              canvas.width * 0.58,
              canvas.height * 0.39,
            );

            // Add meniscus effect
            ctx.beginPath();
            ctx.moveTo(canvas.width * 0.21, canvas.height * 0.4);
            ctx.quadraticCurveTo(
              canvas.width * 0.5,
              canvas.height * 0.39,
              canvas.width * 0.79,
              canvas.height * 0.4,
            );
            ctx.fill();

            // Draw color swirls for realistic mixing effect
            swirlPoints.forEach((swirl) => {
              // Create a gradient for each swirl
              const swirlGradient = ctx.createRadialGradient(
                swirl.x,
                swirl.y,
                0,
                swirl.x,
                swirl.y,
                swirl.radius,
              );

              // Target color with transparency
              const targetColorWithAlpha = `rgba(${targetRgb.r}, ${targetRgb.g}, ${targetRgb.b}, ${0.4 * progress})`;

              swirlGradient.addColorStop(0, targetColorWithAlpha);
              swirlGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

              ctx.globalCompositeOperation = "source-over";
              ctx.fillStyle = swirlGradient;
              ctx.beginPath();
              ctx.arc(swirl.x, swirl.y, swirl.radius, 0, Math.PI * 2);
              ctx.fill();

              // Move swirls based on mixing speed
              swirl.x += Math.sin(progress * 10) * swirl.direction * mixFactor;
              swirl.y +=
                Math.cos(progress * 10) * swirl.direction * mixFactor * 0.5;

              // Keep swirls within liquid bounds
              swirl.x = Math.max(
                canvas.width * 0.25,
                Math.min(swirl.x, canvas.width * 0.75),
              );
              swirl.y = Math.max(
                canvas.height * 0.45,
                Math.min(swirl.y, canvas.height * 0.75),
              );
            });

            // Add light refraction effects
            ctx.globalCompositeOperation = "lighter";
            ctx.beginPath();
            ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
            ctx.ellipse(
              canvas.width * 0.5,
              canvas.height * 0.6,
              canvas.width * 0.2,
              canvas.height * 0.1,
              0,
              0,
              Math.PI * 2,
            );
            ctx.fill();
            ctx.globalCompositeOperation = "source-over";

            // Draw surface reflections
            ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
            ctx.beginPath();
            ctx.ellipse(
              canvas.width * 0.5,
              canvas.height * 0.4,
              canvas.width * 0.25,
              canvas.height * 0.02,
              0,
              0,
              Math.PI * 2,
            );
            ctx.fill();

            // Add steam/vapor effect for exothermic reactions
            if (
              reaction?.energyChange?.includes("exothermic") &&
              labSettings.temperature > 30
            ) {
              // Create a subtle glow effect for exothermic reactions
              ctx.globalCompositeOperation = "lighter";
              const glowGradient = ctx.createRadialGradient(
                canvas.width * 0.5,
                canvas.height * 0.6,
                20,
                canvas.width * 0.5,
                canvas.height * 0.6,
                canvas.width * 0.4,
              );

              glowGradient.addColorStop(
                0,
                `rgba(255, 220, 150, ${0.1 * progress})`,
              ); // Warm glow
              glowGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
              ctx.fillStyle = glowGradient;
              ctx.fillRect(
                canvas.width * 0.21,
                canvas.height * 0.4,
                canvas.width * 0.58,
                canvas.height * 0.39,
              );
              ctx.globalCompositeOperation = "source-over";

              // Add micro-bubbles for boiling/reaction effect
              if (labSettings.temperature > 60) {
                for (let i = 0; i < 12; i++) {
                  const bubbleX = canvas.width * (0.25 + Math.random() * 0.5);
                  const bubbleY = canvas.height * (0.5 + Math.random() * 0.25);
                  const bubbleSize =
                    1 + Math.random() * 3 * (labSettings.temperature / 100);

                  ctx.beginPath();
                  ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
                  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
                  ctx.fill();
                }
              }

              // Add steam effect
              const steamCount = Math.floor(
                3 + (labSettings.temperature - 30) / 10,
              );

              for (let i = 0; i < steamCount; i++) {
                const steamX = canvas.width * (0.3 + Math.random() * 0.4);
                const steamBaseY = canvas.height * 0.39;
                const steamHeight =
                  20 + Math.random() * 15 + labSettings.temperature / 10;

                ctx.beginPath();
                ctx.moveTo(steamX, steamBaseY);
                // Create more natural curved steam path
                ctx.bezierCurveTo(
                  steamX + (Math.random() * 10 - 5),
                  steamBaseY - steamHeight * 0.3,
                  steamX + (Math.random() * 20 - 10),
                  steamBaseY - steamHeight * 0.7,
                  steamX + (Math.random() * 30 - 15),
                  steamBaseY - steamHeight,
                );

                const steamGradient = ctx.createLinearGradient(
                  0,
                  steamBaseY,
                  0,
                  steamBaseY - steamHeight,
                );

                steamGradient.addColorStop(0, "rgba(255, 255, 255, 0.5)");
                steamGradient.addColorStop(0.3, "rgba(255, 255, 255, 0.3)");
                steamGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

                ctx.strokeStyle = steamGradient;
                ctx.lineWidth = 2 + Math.random() * 2;
                ctx.stroke();
              }
            }

            animationFrameRef.current =
              requestAnimationFrame(animateColorChange);
          } else {
            // Final state - fully mixed
            const liquidGradient = ctx.createLinearGradient(
              0,
              canvas.height * 0.4,
              0,
              canvas.height * 0.8,
            );

            const lighterColor = adjustColorBrightness(color, 15);
            const darkerColor = adjustColorBrightness(color, -15);

            liquidGradient.addColorStop(0, lighterColor);
            liquidGradient.addColorStop(1, darkerColor);

            ctx.fillStyle = liquidGradient;
            ctx.fillRect(
              canvas.width * 0.21,
              canvas.height * 0.4,
              canvas.width * 0.58,
              canvas.height * 0.39,
            );

            // Add meniscus effect
            ctx.beginPath();
            ctx.moveTo(canvas.width * 0.21, canvas.height * 0.4);
            ctx.quadraticCurveTo(
              canvas.width * 0.5,
              canvas.height * 0.39,
              canvas.width * 0.79,
              canvas.height * 0.4,
            );
            ctx.fill();

            // Add light refraction effects for final state
            ctx.globalCompositeOperation = "lighter";
            ctx.beginPath();
            ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
            ctx.ellipse(
              canvas.width * 0.5,
              canvas.height * 0.6,
              canvas.width * 0.2,
              canvas.height * 0.1,
              0,
              0,
              Math.PI * 2,
            );
            ctx.fill();
            ctx.globalCompositeOperation = "source-over";
          }
        };

        animateColorChange();
        break;

      case "precipitate":
        // Define more complex precipitate particles with varying properties
        interface PrecipitateParticle {
          x: number;
          y: number;
          size: number;
          speed: number;
          opacity: number;
          settled: boolean;
          wobble: number;
          color: string;
          shape: "circle" | "crystal" | "flake";
        }

        let particles: PrecipitateParticle[] = [];

        // Use different particle appearances based on the reaction type
        const precipitateColors = reaction?.reactionType?.includes("metal")
          ? ["#d4d4d8", "#a1a1aa", "#71717a"] // Metallic
          : ["#555555", "#666666", "#777777"]; // Default

        // Create initial particles
        for (let i = 0; i < 80; i++) {
          // Create clustering effect - particles appear more in certain areas
          let xCluster = 0;

          if (i % 3 === 0) {
            xCluster = Math.random() * 0.2 + 0.2; // Left cluster
          } else if (i % 3 === 1) {
            xCluster = Math.random() * 0.2 + 0.6; // Right cluster
          } else {
            xCluster = Math.random() * 0.2 + 0.4; // Center cluster
          }

          // Randomly choose particle shape for visual variety
          const shape =
            Math.random() < 0.6
              ? "circle"
              : Math.random() < 0.5
                ? "crystal"
                : "flake";

          particles.push({
            x: canvas.width * (0.21 + xCluster * 0.58),
            y: canvas.height * 0.4 + Math.random() * (canvas.height * 0.1),
            size: 1.2 + Math.random() * 3.8,
            speed: 0.1 + Math.random() * 0.8 * (labSettings.temperature / 50),
            opacity: 0.5 + Math.random() * 0.5,
            settled: false,
            wobble: Math.random() * 6.28, // Random initial phase (0 to 2π)
            color:
              precipitateColors[
                Math.floor(Math.random() * precipitateColors.length)
              ],
            shape: shape,
          });
        }

        // Track accumulation at the bottom for sediment effect
        const sedimentMap: number[] = Array(Math.floor(canvas.width)).fill(0);

        const animatePrecipitate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawBeaker();

          // Draw the base liquid solution with gradient
          const liquidGradient = ctx.createLinearGradient(
            0,
            canvas.height * 0.4,
            0,
            canvas.height * 0.8,
          );

          const baseColor = color || "#e0e0ff";
          // Make the liquid slightly more transparent
          const lighterColor = adjustColorBrightness(baseColor, 20);
          const darkerColor = adjustColorBrightness(baseColor, -20);

          liquidGradient.addColorStop(0, lighterColor);
          liquidGradient.addColorStop(1, darkerColor);

          ctx.fillStyle = liquidGradient;
          ctx.fillRect(
            canvas.width * 0.21,
            canvas.height * 0.4,
            canvas.width * 0.58,
            canvas.height * 0.39,
          );

          // Add transparency overlay for better precipitate visibility
          ctx.globalAlpha = 0.8; // 80% opacity
          ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
          ctx.fillRect(
            canvas.width * 0.21,
            canvas.height * 0.4,
            canvas.width * 0.58,
            canvas.height * 0.39,
          );
          ctx.globalAlpha = 1.0;

          // Add meniscus effect
          ctx.beginPath();
          ctx.moveTo(canvas.width * 0.21, canvas.height * 0.4);
          ctx.quadraticCurveTo(
            canvas.width * 0.5,
            canvas.height * 0.39,
            canvas.width * 0.79,
            canvas.height * 0.4,
          );
          ctx.fill();

          // Draw the sediment layer at the bottom
          if (sedimentMap.some((h) => h > 0)) {
            const sedimentGradient = ctx.createLinearGradient(
              0,
              canvas.height * 0.79 - 10,
              0,
              canvas.height * 0.79,
            );

            sedimentGradient.addColorStop(0, "rgba(85, 85, 85, 0.1)");
            sedimentGradient.addColorStop(1, "rgba(85, 85, 85, 0.8)");

            ctx.fillStyle = sedimentGradient;

            ctx.beginPath();
            ctx.moveTo(canvas.width * 0.21, canvas.height * 0.79);

            // Create sediment surface based on the sediment map
            for (let x = 0; x < canvas.width; x++) {
              const mapIndex = Math.floor(
                (x / canvas.width) * sedimentMap.length,
              );

              if (x >= canvas.width * 0.21 && x <= canvas.width * 0.79) {
                const height = sedimentMap[mapIndex] * 0.15;

                ctx.lineTo(x, canvas.height * 0.79 - height);
              }
            }

            ctx.lineTo(canvas.width * 0.79, canvas.height * 0.79);
            ctx.closePath();
            ctx.fill();
          }

          // Draw individual particles
          particles.forEach((particle) => {
            // Skip drawing particles that have been fully integrated into the sediment
            if (particle.settled && particle.opacity <= 0) return;

            // Calculate wobble effect based on mixing speed
            const mixingFactor = labSettings.mixingSpeed / 50; // 0-2
            const wobbleAmount = mixingFactor * Math.sin(particle.wobble) * 0.5;

            // Update wobble phase
            particle.wobble += 0.05 * mixingFactor;

            // Apply temperature effects to opacity and speed
            const tempFactor = labSettings.temperature / 50; // 0-2

            // Draw the particle
            ctx.globalAlpha = particle.opacity;

            // Get base and highlight colors
            const baseColor = (particle as any).color || "#555555";
            const highlightColor = adjustColorBrightness(baseColor, 30);

            // Create a slight gradient within each particle for 3D effect
            const particleGradient = ctx.createRadialGradient(
              particle.x,
              particle.y,
              0,
              particle.x,
              particle.y,
              particle.size,
            );

            particleGradient.addColorStop(0, highlightColor);
            particleGradient.addColorStop(1, baseColor);

            ctx.fillStyle = particleGradient;
            ctx.beginPath();

            // Draw different shapes based on particle type
            if ((particle as any).shape === "crystal") {
              // Draw a crystalline shape
              const points = 5 + Math.floor(Math.random() * 3);
              const rotation = Math.random() * Math.PI;
              const size = particle.size / 2;

              ctx.save();
              ctx.translate(particle.x + wobbleAmount, particle.y);
              ctx.rotate(rotation);

              ctx.beginPath();
              for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2;
                const radius = size * (0.7 + Math.random() * 0.3);

                if (i === 0) {
                  ctx.moveTo(
                    radius * Math.cos(angle),
                    radius * Math.sin(angle),
                  );
                } else {
                  ctx.lineTo(
                    radius * Math.cos(angle),
                    radius * Math.sin(angle),
                  );
                }
              }
              ctx.closePath();
              ctx.fill();
              ctx.restore();
            } else if ((particle as any).shape === "flake") {
              // Draw a flake-like precipitate
              const size = particle.size / 2;

              ctx.save();
              ctx.translate(particle.x + wobbleAmount, particle.y);

              // Draw a 6-pointed star/flake shape
              ctx.beginPath();
              for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const longRadius = size;
                const shortRadius = size * 0.4;

                ctx.lineTo(
                  longRadius * Math.cos(angle),
                  longRadius * Math.sin(angle),
                );
                ctx.lineTo(
                  shortRadius * Math.cos(angle + Math.PI / 6),
                  shortRadius * Math.sin(angle + Math.PI / 6),
                );
              }
              ctx.closePath();
              ctx.fill();
              ctx.restore();
            } else {
              // Draw a circular particle (default)
              ctx.arc(
                particle.x + wobbleAmount,
                particle.y,
                particle.size / 2,
                0,
                Math.PI * 2,
              );
              ctx.fill();
            }

            ctx.globalAlpha = 1;

            // Update particle position if not settled
            if (!particle.settled) {
              // Apply speed modifications based on settings
              const adjustedSpeed =
                particle.speed *
                (0.5 + tempFactor * 0.5) *
                (0.5 + mixingFactor * 0.5);

              // Add horizontal drift based on mixing
              particle.x += wobbleAmount * 0.2;

              // Keep particles within beaker
              particle.x = Math.max(
                canvas.width * 0.22,
                Math.min(particle.x, canvas.width * 0.78),
              );

              // Move downward
              particle.y += adjustedSpeed;

              // Check if particle has reached bottom or sediment layer
              const mapIndex = Math.floor(
                (particle.x / canvas.width) * sedimentMap.length,
              );
              const sedimentHeight = sedimentMap[mapIndex] * 0.15;
              const bottomThreshold = canvas.height * 0.79 - sedimentHeight;

              if (particle.y > bottomThreshold - particle.size) {
                // Particle has reached bottom or sediment
                particle.y = bottomThreshold - particle.size / 2;
                particle.settled = true;

                // Add to sediment map
                sedimentMap[mapIndex] += particle.size * 0.8;

                // Start decreasing opacity to "merge" into sediment
                particle.opacity *= 0.9;
              }
            } else {
              // Particle is settled, gradually decrease opacity to merge into sediment
              particle.opacity *= 0.95;
            }
          });

          // Add new particles at a rate determined by temperature
          if (
            particles.length < 150 &&
            Math.random() < 0.1 * (labSettings.temperature / 50)
          ) {
            particles.push({
              x: canvas.width * 0.21 + Math.random() * (canvas.width * 0.58),
              y: canvas.height * 0.4 + Math.random() * 0.05,
              size: 1.5 + Math.random() * 3.5,
              speed: 0.1 + Math.random() * 0.8,
              opacity: 0.4 + Math.random() * 0.6,
              settled: false,
              wobble: Math.random() * 6.28,
              color: color || "#555",
              shape:
                Math.random() > 0.66
                  ? "crystal"
                  : Math.random() > 0.33
                    ? "flake"
                    : "circle",
            } as PrecipitateParticle);
          }

          // Remove fully settled particles to maintain performance
          particles = particles.filter((p) => !(p.settled && p.opacity < 0.05));

          animationFrameRef.current = requestAnimationFrame(animatePrecipitate);
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
          deltaSize: number;
          rotation: number;
          rotationSpeed: number;
        }[] = [];

        for (let i = 0; i < 50; i++) {
          smokeParticles.push({
            x: canvas.width * 0.3 + Math.random() * canvas.width * 0.4,
            y: canvas.height * 0.4,
            size: 5 + Math.random() * 12,
            alpha: 0.05 + Math.random() * 0.2,
            speed: 0.3 + Math.random() * 1.2,
            deltaSize: 0.05 + Math.random() * 0.1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: Math.random() * 0.02 - 0.01,
          });
        }

        const animateSmoke = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawBeaker();

          // Draw base liquid with gradient
          const liquidGradient = ctx.createLinearGradient(
            0,
            canvas.height * 0.4,
            0,
            canvas.height * 0.8,
          );

          const baseColor = color || "#e0e0ff";
          const lighterColor = adjustColorBrightness(baseColor, 20);
          const darkerColor = adjustColorBrightness(baseColor, -20);

          liquidGradient.addColorStop(0, lighterColor);
          liquidGradient.addColorStop(1, darkerColor);

          ctx.fillStyle = liquidGradient;
          ctx.fillRect(
            canvas.width * 0.21,
            canvas.height * 0.4,
            canvas.width * 0.58,
            canvas.height * 0.39,
          );

          // Add meniscus effect
          ctx.beginPath();
          ctx.moveTo(canvas.width * 0.21, canvas.height * 0.4);
          ctx.quadraticCurveTo(
            canvas.width * 0.5,
            canvas.height * 0.39,
            canvas.width * 0.79,
            canvas.height * 0.4,
          );
          ctx.fill();

          // Create a clipping region to contain bubbles inside the beaker
          ctx.save();
          ctx.beginPath();
          ctx.rect(
            canvas.width * 0.21,
            0,
            canvas.width * 0.58,
            canvas.height * 0.8,
          );
          ctx.clip();

          // Draw surface bubbles at the liquid surface
          for (let i = 0; i < 8; i++) {
            const bubbleX =
              canvas.width * 0.21 + Math.random() * (canvas.width * 0.58);
            const bubbleY = canvas.height * 0.4;
            const bubbleSize = 3 + Math.random() * 6;

            ctx.beginPath();
            ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            ctx.fill();
          }

          // Add smoke particles with improved styling and physics
          smokeParticles.forEach((particle) => {
            // Apply rotation for more organic smoke movement
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);

            // Create a cloud-like shape using multiple overlapping circles
            const smokeGradient = ctx.createRadialGradient(
              0,
              0,
              0,
              0,
              0,
              particle.size,
            );

            const tempFactor = labSettings.temperature / 50; // 0.5 to 2
            const smokeColor =
              tempFactor > 1.5
                ? `rgba(100, 100, 100, ${particle.alpha})`
                : `rgba(200, 200, 200, ${particle.alpha})`;

            smokeGradient.addColorStop(0, smokeColor);
            smokeGradient.addColorStop(1, "rgba(200, 200, 200, 0)");

            ctx.fillStyle = smokeGradient;

            // Draw main smoke puff
            ctx.beginPath();
            ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
            ctx.fill();

            // Draw a few smaller overlapping circles for texture
            for (let i = 0; i < 3; i++) {
              const offsetX = (Math.random() - 0.5) * particle.size * 0.8;
              const offsetY = (Math.random() - 0.5) * particle.size * 0.8;
              const sizeMultiplier = 0.4 + Math.random() * 0.4;

              ctx.beginPath();
              ctx.arc(
                offsetX,
                offsetY,
                particle.size * sizeMultiplier,
                0,
                Math.PI * 2,
              );
              ctx.fill();
            }

            ctx.restore();

            // Apply temperature effects to smoke behavior
            const smokeRiseFactor = labSettings.temperature / 25;
            const mixFactor = labSettings.mixingSpeed / 50;

            // Update particle properties
            particle.rotation += particle.rotationSpeed * mixFactor;
            particle.y -= particle.speed * smokeRiseFactor;

            // Add horizontal drift with sinusoidal pattern
            particle.x += Math.sin(particle.y * 0.05) * 0.8 * mixFactor;

            // Increase size as smoke rises
            particle.size += particle.deltaSize;

            // Reduce opacity over time
            particle.alpha -= 0.002 * smokeRiseFactor;

            // Reset particles when they fade or leave screen
            if (particle.alpha <= 0 || particle.y < 0) {
              particle.y = canvas.height * 0.39;
              particle.x =
                canvas.width * 0.3 + Math.random() * canvas.width * 0.4;
              particle.alpha = 0.05 + Math.random() * 0.2;
              particle.size = 5 + Math.random() * 12;
              particle.rotation = Math.random() * Math.PI * 2;
            }
          });

          // Add glowing effect at the liquid surface for chemical activity
          ctx.globalCompositeOperation = "lighter";
          const glowGradient = ctx.createRadialGradient(
            canvas.width * 0.5,
            canvas.height * 0.4,
            0,
            canvas.width * 0.5,
            canvas.height * 0.4,
            canvas.width * 0.2,
          );

          // Safely extract color components for glow
          const safeParseColor = (color: string) => {
            if (!color || !color.startsWith("#"))
              return { r: 100, g: 100, b: 255 };
            try {
              return {
                r: parseInt(color.slice(1, 3), 16) || 100,
                g: parseInt(color.slice(3, 5), 16) || 100,
                b: parseInt(color.slice(5, 7), 16) || 255,
              };
            } catch (e) {
              return { r: 100, g: 100, b: 255 };
            }
          };

          const colorRgb = safeParseColor(color);
          const glowColor = `rgba(${colorRgb.r}, ${colorRgb.g}, ${colorRgb.b}, 0.1)`;

          glowGradient.addColorStop(0, glowColor);
          glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.ellipse(
            canvas.width * 0.5,
            canvas.height * 0.4,
            canvas.width * 0.25,
            canvas.height * 0.05,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();

          ctx.globalCompositeOperation = "source-over";
          ctx.restore();

          animationFrameRef.current = requestAnimationFrame(animateSmoke);
        };

        animateSmoke();
        break;

      default:
        ctx.fillStyle = color;
        ctx.fillRect(
          canvas.width * 0.2,
          canvas.height * 0.4,
          canvas.width * 0.6,
          canvas.height * 0.4,
        );
        break;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  };

  const playAudioNarration = async (text: string) => {
    try {
      const audioUrl = apiService.audio.getAudio(text);

      const response = await fetch(audioUrl, {
        method: "GET",
      });

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);

      const audio = new Audio(url);

      audioRef.current = audio;
      audio.play();
    } catch (err) {
      console.error("Failed to play audio narration", err);
    }
  };

  const resetExperiment = () => {
    // Cancel any ongoing animations
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setReaction(null);
    setAnimationActive(false);
    setSelectedChemicals([]);
    setError(""); // Clear any error messages

    // Clear the canvas
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
    // If there's an active animation, stop it before removing the chemical
    if (animationActive) {
      // Cancel any ongoing animations
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setAnimationActive(false);
      setReaction(null);
    }

    setSelectedChemicals(selectedChemicals.filter((id) => id !== chemicalId));
  };

  const handleTemperatureChange = (value: number[]) => {
    const newTemperature = value[0];

    setLabSettings({
      ...labSettings,
      temperature: newTemperature,
    });

    // If there's an active reaction and animation, redraw with new temperature
    if (reaction && animationActive && canvasRef.current) {
      // Clear current animation frame first
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      // Redraw with updated temperature
      drawReactionAnimation(reaction.animation, reaction.color);
    }
  };

  const handleMixingSpeedChange = (value: number[]) => {
    const newMixingSpeed = value[0];

    setLabSettings({
      ...labSettings,
      mixingSpeed: newMixingSpeed,
    });

    // If there's an active reaction and animation, redraw with new mixing speed
    if (reaction && animationActive && canvasRef.current) {
      // Clear current animation frame first
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      // Redraw with updated mixing speed
      drawReactionAnimation(reaction.animation, reaction.color);
    }
  };

  const handleViewModeChange = (viewMode: "2d" | "3d") => {
    setLabSettings({
      ...labSettings,
      viewMode,
    });

    // If there's an active reaction and animation, redraw with new view mode
    if (reaction && animationActive && canvasRef.current) {
      // Clear current animation frame first
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      // Redraw with updated view mode
      drawReactionAnimation(reaction.animation, reaction.color);
    }
  };

  // const toggleLanguage = () => {
  //   setLabSettings({
  //     ...labSettings,
  //     language: labSettings.language === "en" ? "bn" : "en",
  //   });
  // };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {getText("Chemistry Lab", "রসায়ন ল্যাব")}
          </h1>

          {/* Add Atom Builder link */}
          <div className="mt-4 md:mt-0 flex gap-4">
            <a
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-md hover:bg-green-600 hover:shadow-lg transition-all"
              href="/engines/atom-builder"
            >
              <span>⚛️</span>
              <span>
                {getText("Try Atom Builder", "অ্যাটম বিল্ডার ব্যবহার করুন")}
              </span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <Tabs className="w-full" defaultValue="chemicals">
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
                className="bg-white dark:bg-gray-900 p-4 rounded-md shadow-md border border-gray-200 dark:border-gray-700"
                value="chemicals"
              >
                <h2 className="text-xl font-semibold mb-2 dark:text-gray-100">
                  {getText(
                    "Available Chemicals",
                    "উপলব্ধ রাসায়নিক পদার্থসমূহ",
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
                          className={`p-2 rounded-md border text-left text-sm ${
                            selectedChemicals.includes(chemical.id)
                              ? "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200"
                              : "bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                          } ${
                            animationActive
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={
                            selectedChemicals.includes(chemical.id) ||
                            animationActive
                          }
                          onClick={() => addChemical(chemical.id)}
                        >
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: chemical.color }}
                            />
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
                className="bg-white dark:bg-gray-900 p-4 rounded-md shadow-md border border-gray-200 dark:border-gray-700"
                value="selected"
              >
                <h2 className="text-xl font-semibold mb-2 dark:text-gray-100">
                  {getText(
                    "Selected Chemicals",
                    "নির্বাচিত রাসায়নিক পদার্থসমূহ",
                  )}
                </h2>

                {selectedChemicals.length === 0 ? (
                  <div className="text-center p-6 text-gray-500 dark:text-gray-400">
                    {getText(
                      "No chemicals selected. Go to the Chemicals tab to select some.",
                      "কোন রাসায়নিক পদার্থ নির্বাচন করা হয়নি। কিছু নির্বাচন করতে রাসায়নিক ট্যাবে যান।",
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
                                />
                                <h3 className="font-medium dark:text-gray-100">
                                  {getText(chemical.name, chemical.bengaliName)}{" "}
                                  ({chemical.formula})
                                </h3>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {getText(
                                  chemical.description,
                                  chemical.bengaliDescription,
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
                                        : "গ্যাস",
                                  )}
                                </span>
                                <span>
                                  {getText("Type", "ধরন")}: {chemical.type}
                                </span>
                              </div>
                            </div>
                            <button
                              aria-label="Remove chemical"
                              className="flex items-center justify-center w-7 h-7 rounded-full bg-red-500 dark:bg-red-900 text-white hover:bg-red-600 hover:text-white dark:text-red-100 dark:hover:bg-red-700 dark:hover:text-white"
                              onClick={() => removeChemical(chemId)}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    <div className="flex space-x-2 pt-2">
                      <button
                        className={`px-4 py-2 rounded-md text-white font-medium transition-all duration-200 ${
                          selectedChemicals.length < 2 || animationActive
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 hover:shadow-lg"
                        }`}
                        disabled={
                          selectedChemicals.length < 2 || animationActive
                        }
                        onClick={performReaction}
                      >
                        <div className="flex items-center">
                          <span className="mr-2">🧪</span>
                          {getText("Mix Chemicals", "বিক্রিয়া শুরু করুন")}
                        </div>
                      </button>

                      <button
                        className="px-4 py-2 rounded-md text-white font-medium bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 hover:shadow-lg transition-all duration-200"
                        onClick={resetExperiment}
                      >
                        <div className="flex items-center">
                          <span className="mr-2">↻</span>
                          {getText("Reset", "রিসেট করুন")}
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent
                className="bg-white dark:bg-gray-900 p-4 rounded-md shadow-md border border-gray-200 dark:border-gray-700"
                value="controls"
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
                      max={100}
                      min={0}
                      step={1}
                      value={[labSettings.temperature]}
                      onValueChange={handleTemperatureChange}
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
                      max={100}
                      min={0}
                      step={5}
                      value={[labSettings.mixingSpeed]}
                      onValueChange={handleMixingSpeedChange}
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
                          checked={labSettings.viewMode === "2d"}
                          className="form-radio"
                          name="viewMode"
                          type="radio"
                          value="2d"
                          onChange={() => handleViewModeChange("2d")}
                        />
                        <span className="ml-2 text-sm dark:text-gray-300">
                          2D
                        </span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          checked={labSettings.viewMode === "3d"}
                          className="form-radio"
                          name="viewMode"
                          type="radio"
                          value="3d"
                          onChange={() => handleViewModeChange("3d")}
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
            <div className="bg-white dark:bg-gray-900 rounded-md shadow-lg p-4 h-full flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold dark:text-gray-100 flex items-center">
                  <span className="mr-2">🧪</span>
                  {getText("Reaction Chamber", "রাসায়নিক বিক্রিয়া")}
                </h2>

                {labSettings.viewMode === "3d" && (
                  <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded">
                    3D Mode
                  </span>
                )}
              </div>

              {!reaction ? (
                <div
                  className="flex-grow flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 shadow-inner"
                  style={{ height: "300px" }}
                >
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <div className="mb-4 text-6xl animate-pulse">⚗️</div>
                    <p className="mb-2 max-w-sm">
                      {getText(
                        "Select 2 or more chemicals and mix them to see the reaction.",
                        "দুই বা ততোধিক রাসায়নিক পদার্থ নির্বাচন করে বিক্রিয়া দেখুন।",
                      )}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                      {getText(
                        "Try different combinations to see various reactions!",
                        "বিভিন্ন সংমিশ্রণ চেষ্টা করে বিভিন্ন বিক্রিয়া দেখুন!",
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="flex-grow bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden mb-4 shadow-inner border border-gray-300 dark:border-gray-700"
                    style={{ height: "300px" }}
                  >
                    <canvas ref={canvasRef} className="w-full h-full" />
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 p-5 rounded-lg shadow-inner border border-blue-100 dark:border-blue-900">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2">
                          {getText("Reaction Results", "বিক্রিয়ার ফলাফল")}
                        </h3>
                        <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded border border-blue-200 dark:border-blue-800 font-mono text-sm mb-3">
                          {reaction.equation ||
                            `${
                              getChemicalById(reaction.reactant1)?.formula
                            } + ${
                              getChemicalById(reaction.reactant2)?.formula
                            } → ${reaction.product}`}
                        </div>
                      </div>

                      <button
                        aria-label="Play audio narration"
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-md hover:from-blue-600 hover:to-cyan-600 flex items-center shadow-md transition-all duration-200"
                        onClick={() =>
                          playAudioNarration(
                            labSettings.language === "bn"
                              ? reaction.bengaliDescription ||
                                  reaction.description
                              : reaction.description,
                          )
                        }
                      >
                        <span className="mr-2">🔊</span>
                        {getText("Listen", "শুনুন")}
                      </button>
                    </div>

                    <div className="bg-white/50 dark:bg-gray-800/20 p-3 rounded-md border border-blue-100 dark:border-blue-900 mb-4">
                      <p className="text-gray-700 dark:text-gray-200">
                        {getText(
                          reaction.description,
                          reaction.bengaliDescription,
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {reaction.reactionType && (
                        <div className="bg-white dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700 flex items-center">
                          <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                            <span className="text-purple-800 dark:text-purple-200 text-xs">
                              ⚛️
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {getText("Reaction Type", "বিক্রিয়ার ধরন")}
                            </span>
                            <p className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                              {reaction.reactionType}
                            </p>
                          </div>
                        </div>
                      )}

                      {reaction.temperature && (
                        <div className="bg-white dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700 flex items-center">
                          <div className="bg-red-100 dark:bg-red-900 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                            <span className="text-red-800 dark:text-red-200 text-xs">
                              🌡️
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {getText("Temperature", "তাপমাত্রা")}
                            </span>
                            <p className="font-medium text-gray-800 dark:text-gray-200">
                              {reaction.temperature}
                            </p>
                          </div>
                        </div>
                      )}

                      {reaction.energyChange && (
                        <div className="bg-white dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700 flex items-center">
                          <div className="bg-yellow-100 dark:bg-yellow-900 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                            <span className="text-yellow-800 dark:text-yellow-200 text-xs">
                              ⚡
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {getText("Energy Change", "শক্তি পরিবর্তন")}
                            </span>
                            <p className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                              {reaction.energyChange}
                            </p>
                          </div>
                        </div>
                      )}

                      {reaction.hazards && (
                        <div className="bg-white dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700 flex items-center">
                          <div className="bg-orange-100 dark:bg-orange-900 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                            <span className="text-orange-800 dark:text-orange-200 text-xs">
                              ⚠️
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {getText("Safety Note", "নিরাপত্তা তথ্য")}
                            </span>
                            <p className="font-medium text-gray-800 dark:text-gray-200">
                              {reaction.hazards}
                            </p>
                          </div>
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
