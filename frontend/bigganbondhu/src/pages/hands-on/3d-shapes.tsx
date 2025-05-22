import { animate } from "animejs";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import DefaultLayout from "@/layouts/default";

export default function ShapesAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const pyramidRef = useRef<HTMLDivElement>(null);
  const hexagonRef = useRef<HTMLDivElement>(null);
  const customShapeRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // State for custom shape
  const [numSides, setNumSides] = useState<number>(5);
  const [customShapeColor, setCustomShapeColor] = useState<string>("#ff5722");
  const [showCustomShape, setShowCustomShape] = useState<boolean>(false);

  // Generate polygon points based on number of sides
  const generatePolygonPoints = (
    sides: number,
    radius: number = 70,
  ): string => {
    let points = [];
    const angleStep = (Math.PI * 2) / sides;
    const centerX = 75;
    const centerY = 75;

    for (let i = 0; i < sides; i++) {
      const angle = i * angleStep - Math.PI / 2; // Start from top (subtract 90 degrees)
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      points.push(`${x},${y}`);
    }

    return points.join(" ");
  };

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    // Set up animation
    const cubeAnimation = cubeRef.current
      ? animate(cubeRef.current, {
          rotateY: [0, 360],
          rotateX: [0, 360],
          duration: 8000,
          loop: true,
          easing: "linear",
        })
      : null;

    const pyramidAnimation = pyramidRef.current
      ? animate(pyramidRef.current, {
          rotateY: [0, -360],
          rotateX: [45, 405],
          duration: 10000,
          loop: true,
          easing: "linear",
        })
      : null;

    const hexagonAnimation = hexagonRef.current
      ? animate(hexagonRef.current, {
          rotateZ: [0, 360],
          rotateX: [30, 390],
          duration: 12000,
          loop: true,
          easing: "linear",
        })
      : null;

    // Custom shape animation
    let customShapeAnimation: any;

    if (showCustomShape && customShapeRef.current) {
      customShapeAnimation = animate(customShapeRef.current, {
        rotateZ: [0, 360],
        rotateY: [0, 360],
        duration: 9000,
        loop: true,
        easing: "linear",
      });
    }

    // Mouse interaction for controlling rotation
    let mouseX = 0;
    let mouseY = 0;
    let isMouseDown = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;

      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;

      mouseX = e.clientX;
      mouseY = e.clientY;

      // Pause automatic animations when user interacts
      if (cubeAnimation) cubeAnimation.pause();
      if (pyramidAnimation) pyramidAnimation.pause();
      if (hexagonAnimation) hexagonAnimation.pause();
      if (customShapeAnimation) customShapeAnimation.pause();

      const cube = cubeRef.current;
      const pyramid = pyramidRef.current;
      const hexagon = hexagonRef.current;
      const customShape = customShapeRef.current;

      if (cube) {
        const rotateYMatch = cube.style.transform.match(/rotateY\(([^)]+)\)/);
        const currentRotateY = parseFloat(rotateYMatch ? rotateYMatch[1] : "0");
        const rotateXMatch = cube.style.transform.match(/rotateX\(([^)]+)\)/);
        const currentRotateX = parseFloat(rotateXMatch ? rotateXMatch[1] : "0");

        cube.style.transform = `rotateY(${currentRotateY + deltaX * 0.5}deg) rotateX(${currentRotateX - deltaY * 0.5}deg)`;
      }

      if (pyramid) {
        const rotateYMatch =
          pyramid.style.transform.match(/rotateY\(([^)]+)\)/);
        const currentRotateY = parseFloat(rotateYMatch ? rotateYMatch[1] : "0");
        const rotateXMatch =
          pyramid.style.transform.match(/rotateX\(([^)]+)\)/);
        const currentRotateX = parseFloat(
          rotateXMatch ? rotateXMatch[1] : "45",
        );

        pyramid.style.transform = `rotateY(${currentRotateY + deltaX * 0.5}deg) rotateX(${currentRotateX - deltaY * 0.5}deg)`;
      }

      if (hexagon) {
        const rotateZMatch =
          hexagon.style.transform.match(/rotateZ\(([^)]+)\)/);
        const currentRotateZ = parseFloat(rotateZMatch ? rotateZMatch[1] : "0");
        const rotateXMatch =
          hexagon.style.transform.match(/rotateX\(([^)]+)\)/);
        const currentRotateX = parseFloat(
          rotateXMatch ? rotateXMatch[1] : "30",
        );

        hexagon.style.transform = `rotateZ(${currentRotateZ + deltaX * 0.5}deg) rotateX(${currentRotateX - deltaY * 0.5}deg)`;
      }

      if (customShape && showCustomShape) {
        const rotateZMatch =
          customShape.style.transform.match(/rotateZ\(([^)]+)\)/);
        const currentRotateZ = parseFloat(rotateZMatch ? rotateZMatch[1] : "0");
        const rotateYMatch =
          customShape.style.transform.match(/rotateY\(([^)]+)\)/);
        const currentRotateY = parseFloat(rotateYMatch ? rotateYMatch[1] : "0");

        customShape.style.transform = `rotateZ(${currentRotateZ + deltaX * 0.5}deg) rotateY(${currentRotateY - deltaY * 0.5}deg)`;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isMouseDown = false;

      // Resume animations when user stops interacting
      if (cubeAnimation) cubeAnimation.play();
      if (pyramidAnimation) pyramidAnimation.play();
      if (hexagonAnimation) hexagonAnimation.play();
      if (customShapeAnimation) customShapeAnimation.play();
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      if (cubeAnimation) cubeAnimation.pause();
      if (pyramidAnimation) pyramidAnimation.pause();
      if (hexagonAnimation) hexagonAnimation.pause();
      if (customShapeAnimation) customShapeAnimation.pause();

      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [showCustomShape, numSides]);

  // Handle creating a new custom shape
  const handleCreateShape = () => {
    setShowCustomShape(true);
  };

  return (
    <DefaultLayout>
      <div className="max-w-5xl mx-auto py-8 px-2">
        {/* Back button */}
        <button
          className="mb-6 bg-blue-600 text-white flex items-center justify-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => navigate("/hands-on")}
        >
          <svg
            className="h-5 w-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clipRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              fillRule="evenodd"
            />
          </svg>
          হ্যান্ডস-অন এক্সপেরিয়েন্সে ফিরে যান
        </button>

        <h1 className="text-3xl font-bold mb-2 text-center">
          ৩ডি জ্যামিতিক আকৃতি অ্যানিমেশন
        </h1>

        {/* Custom shape creator */}
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <h2 className="text-xl font-bold mb-2">
            আপনার নিজের আকৃতি তৈরি করুন
          </h2>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                বাহুর সংখ্যা (৩-২০)
              </label>
              <input
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-blue-900"
                max="20"
                min="3"
                type="range"
                value={numSides}
                onChange={(e) => setNumSides(parseInt(e.target.value))}
              />
              <div className="flex justify-between">
                <span className="text-xs">৩</span>
                <span className="text-xs font-medium">{numSides}</span>
                <span className="text-xs">২০</span>
              </div>
            </div>

            <div className="flex-1 w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                রঙ নির্বাচন করুন
              </label>
              <input
                className="h-8 w-full"
                type="color"
                value={customShapeColor}
                onChange={(e) => setCustomShapeColor(e.target.value)}
              />
            </div>

            <div className="flex-1 w-full md:w-auto">
              <button
                className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                onClick={handleCreateShape}
              >
                আকৃতি তৈরি করুন
              </button>
            </div>
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative h-[500px] w-full bg-gray-900 rounded-xl overflow-hidden shadow-2xl my-8"
          style={{ perspective: "1000px" }}
        >
          {/* Cube */}
          <div
            ref={cubeRef}
            className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              transformStyle: "preserve-3d",
              width: "150px",
              height: "150px",
            }}
          >
            {/* Front face */}
            <div
              className="absolute w-full h-full border-2 border-[#00ffcc] bg-gray-900 bg-opacity-50"
              style={{
                transform: "translateZ(75px)",
                boxShadow: "0 0 15px 5px rgba(0, 255, 204, 0.3)",
              }}
            />
            {/* Back face */}
            <div
              className="absolute w-full h-full border-2 border-[#00ffcc] bg-gray-900 bg-opacity-50"
              style={{
                transform: "translateZ(-75px) rotateY(180deg)",
                boxShadow: "0 0 15px 5px rgba(0, 255, 204, 0.3)",
              }}
            />
            {/* Left face */}
            <div
              className="absolute w-full h-full border-2 border-[#00ffcc] bg-gray-900 bg-opacity-50"
              style={{
                transform: "translateX(-75px) rotateY(-90deg)",
                boxShadow: "0 0 15px 5px rgba(0, 255, 204, 0.3)",
              }}
            />
            {/* Right face */}
            <div
              className="absolute w-full h-full border-2 border-[#00ffcc] bg-gray-900 bg-opacity-50"
              style={{
                transform: "translateX(75px) rotateY(90deg)",
                boxShadow: "0 0 15px 5px rgba(0, 255, 204, 0.3)",
              }}
            />
            {/* Top face */}
            <div
              className="absolute w-full h-full border-2 border-[#00ffcc] bg-gray-900 bg-opacity-50"
              style={{
                transform: "translateY(-75px) rotateX(90deg)",
                boxShadow: "0 0 15px 5px rgba(0, 255, 204, 0.3)",
              }}
            />
            {/* Bottom face */}
            <div
              className="absolute w-full h-full border-2 border-[#00ffcc] bg-gray-900 bg-opacity-50"
              style={{
                transform: "translateY(75px) rotateX(-90deg)",
                boxShadow: "0 0 15px 5px rgba(0, 255, 204, 0.3)",
              }}
            />
          </div>

          {/* Pyramid */}
          <div
            ref={pyramidRef}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              transformStyle: "preserve-3d",
              width: "150px",
              height: "150px",
            }}
          >
            {/* Base */}
            <div
              className="absolute w-full h-full border-2 border-[#ff00cc] bg-gray-900 bg-opacity-50"
              style={{
                transform: "translateY(75px) rotateX(-90deg)",
                boxShadow: "0 0 15px 5px rgba(255, 0, 204, 0.3)",
              }}
            />

            {/* Front face (triangle) */}
            <div
              className="absolute w-0 h-0 top-0 left-0 right-0 mx-auto"
              style={{
                borderLeft: "75px solid transparent",
                borderRight: "75px solid transparent",
                borderBottom: "150px solid rgba(255, 0, 204, 0.7)",
                filter: "drop-shadow(0 0 15px rgba(255, 0, 204, 0.3))",
                transform: "translateZ(0) rotateX(30deg) translateY(-75px)",
              }}
            />

            {/* Right face (triangle) */}
            <div
              className="absolute w-0 h-0 top-0 left-0 right-0 mx-auto"
              style={{
                borderLeft: "75px solid transparent",
                borderRight: "75px solid transparent",
                borderBottom: "150px solid rgba(255, 0, 204, 0.7)",
                filter: "drop-shadow(0 0 15px rgba(255, 0, 204, 0.3))",
                transform:
                  "translateZ(0) rotateY(90deg) rotateX(30deg) translateY(-75px)",
              }}
            />

            {/* Back face (triangle) */}
            <div
              className="absolute w-0 h-0 top-0 left-0 right-0 mx-auto"
              style={{
                borderLeft: "75px solid transparent",
                borderRight: "75px solid transparent",
                borderBottom: "150px solid rgba(255, 0, 204, 0.7)",
                filter: "drop-shadow(0 0 15px rgba(255, 0, 204, 0.3))",
                transform:
                  "translateZ(0) rotateY(180deg) rotateX(30deg) translateY(-75px)",
              }}
            />

            {/* Left face (triangle) */}
            <div
              className="absolute w-0 h-0 top-0 left-0 right-0 mx-auto"
              style={{
                borderLeft: "75px solid transparent",
                borderRight: "75px solid transparent",
                borderBottom: "150px solid rgba(255, 0, 204, 0.7)",
                filter: "drop-shadow(0 0 15px rgba(255, 0, 204, 0.3))",
                transform:
                  "translateZ(0) rotateY(270deg) rotateX(30deg) translateY(-75px)",
              }}
            />
          </div>

          {/* Hexagon */}
          <div
            ref={hexagonRef}
            className="absolute top-1/2 left-3/4 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              transformStyle: "preserve-3d",
              width: "150px",
              height: "150px",
            }}
          >
            <svg
              height="150"
              style={{ filter: "drop-shadow(0 0 15px rgba(0, 102, 255, 0.7))" }}
              viewBox="0 0 150 150"
              width="150"
            >
              <polygon
                fill="rgba(18, 18, 30, 0.7)"
                points="75,10 140,45 140,105 75,140 10,105 10,45"
                stroke="#0066ff"
                strokeWidth="3"
              />
              <polygon
                fill="rgba(18, 18, 30, 0.5)"
                points="75,30 120,55 120,95 75,120 30,95 30,55"
                stroke="#0066ff"
                strokeWidth="2"
              />
              <polygon
                fill="rgba(18, 18, 30, 0.3)"
                points="75,50 100,65 100,85 75,100 50,85 50,65"
                stroke="#0066ff"
                strokeWidth="1"
              />
            </svg>
          </div>

          {/* Custom Shape */}
          {showCustomShape && (
            <div
              ref={customShapeRef}
              className="absolute top-1/2 transform -translate-y-1/2"
              style={{
                transformStyle: "preserve-3d",
                width: "150px",
                height: "150px",
                left: "85%",
              }}
            >
              <svg
                height="150"
                style={{
                  filter: `drop-shadow(0 0 15px ${customShapeColor}66)`,
                }}
                viewBox="0 0 150 150"
                width="150"
              >
                <polygon
                  fill={`${customShapeColor}22`}
                  points={generatePolygonPoints(numSides, 70)}
                  stroke={customShapeColor}
                  strokeWidth="3"
                />
                {numSides >= 4 && (
                  <polygon
                    fill={`${customShapeColor}44`}
                    points={generatePolygonPoints(numSides, 50)}
                    stroke={customShapeColor}
                    strokeWidth="2"
                  />
                )}
                {numSides >= 5 && (
                  <polygon
                    fill={`${customShapeColor}66`}
                    points={generatePolygonPoints(numSides, 30)}
                    stroke={customShapeColor}
                    strokeWidth="1"
                  />
                )}
              </svg>
            </div>
          )}

          {/* Glow effect at the bottom */}
          <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-blue-500/20 to-transparent" />
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            মাউস দিয়ে ক্লিক করে ধরে রাখুন এবং ঘোরান আকৃতিগুলো নিয়ন্ত্রণ করার
            জন্য।
          </p>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            মাউস ছেড়ে দিলে স্বয়ংক্রিয় অ্যানিমেশন আবার শুরু হবে।
          </p>
        </div>
      </div>
    </DefaultLayout>
  );
}
