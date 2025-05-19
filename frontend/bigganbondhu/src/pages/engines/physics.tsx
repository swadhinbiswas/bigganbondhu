import DefaultLayout from "@/layouts/default";
import axios from "axios";
import {
  Bodies,
  Body,
  Constraint,
  Engine,
  Render,
  Runner,
  World,
} from "matter-js";
import { useEffect, useRef, useState } from "react";

type PhysicsExperiment = {
  id: string;
  title: string;
  description: string;
  type: "projectile" | "pendulum";
  params: {
    [key: string]: {
      name: string;
      min: number;
      max: number;
      default: number;
      step: number;
      unit: string;
    };
  };
};

const PhysicsEngine = () => {
  const [experiments, setExperiments] = useState<PhysicsExperiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] =
    useState<PhysicsExperiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [params, setParams] = useState<{ [key: string]: number }>({});

  // Refs for Matter.js
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const rendererRef = useRef<Render | null>(null);
  const runnerRef = useRef<Runner | null>(null);

  // Fetch physics experiments
  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:8000/api/experiments/physics"
        );
        setExperiments(response.data.experiments);
        if (response.data.experiments.length > 0) {
          setSelectedExperiment(response.data.experiments[0]);

          // Initialize params with default values
          const defaultParams: { [key: string]: number } = {};
          Object.entries(response.data.experiments[0].params).forEach(
            ([key, value]: [string, any]) => {
              defaultParams[key] = value.default;
            }
          );
          setParams(defaultParams);
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to load physics experiments");
        setLoading(false);
        console.error(err);
      }
    };

    fetchExperiments();
  }, []);

  // Initialize Matter.js
  useEffect(() => {
    if (!selectedExperiment || !sceneRef.current) return;

    // Clean up previous simulation
    if (engineRef.current) {
      Runner.stop(runnerRef.current!);
      World.clear(engineRef.current.world, false);
      Engine.clear(engineRef.current);
      rendererRef.current?.canvas.remove();
    }

    // Setup new simulation
    const engine = Engine.create();
    engineRef.current = engine;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: sceneRef.current.clientWidth,
        height: 500,
        wireframes: false,
        background: "#f0f0f0",
      },
    });
    rendererRef.current = render;

    // Create bodies based on experiment type
    if (selectedExperiment.type === "projectile") {
      setupProjectileSimulation(engine, params);
    } else if (selectedExperiment.type === "pendulum") {
      setupPendulumSimulation(engine, params);
    }

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);
    runnerRef.current = runner;

    // Handle window resize
    const handleResize = () => {
      if (sceneRef.current && render.canvas) {
        render.options.width = sceneRef.current.clientWidth;
        render.options.height = 500;
        render.canvas.width = sceneRef.current.clientWidth;
        render.canvas.height = 500;
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (engineRef.current) {
        Runner.stop(runner);
        World.clear(engineRef.current.world, false);
        Engine.clear(engineRef.current);
        render.canvas.remove();
      }
    };
  }, [selectedExperiment, params]);

  const setupProjectileSimulation = (
    engine: Engine,
    currentParams: { [key: string]: number }
  ) => {
    const { world } = engine;

    // Add ground
    World.add(world, [
      Bodies.rectangle(400, 500, 800, 50, {
        isStatic: true,
        render: { fillStyle: "#2e2e2e" },
      }),
    ]);

    // Add projectile
    const angle = currentParams.angle * (Math.PI / 180); // Convert to radians
    const velocity = currentParams.velocity;
    const projectile = Bodies.circle(50, 450, 15, {
      restitution: 0.5,
      friction: currentParams.friction || 0.1,
      mass: currentParams.mass || 1,
      render: { fillStyle: "#4285F4" },
    });

    World.add(world, projectile);

    // Apply initial velocity
    Body.setVelocity(projectile, {
      x: velocity * Math.cos(angle),
      y: -velocity * Math.sin(angle),
    });
  };

  const setupPendulumSimulation = (
    engine: Engine,
    currentParams: { [key: string]: number }
  ) => {
    const { world } = engine;

    // Add anchor point
    const anchor = Bodies.circle(400, 100, 10, {
      isStatic: true,
      render: { fillStyle: "#2e2e2e" },
    });

    // Add pendulum bob
    const bob = Bodies.circle(
      400 + 150 * Math.sin(currentParams.angle * (Math.PI / 180)),
      100 + 150 * Math.cos(currentParams.angle * (Math.PI / 180)),
      currentParams.mass * 10,
      { render: { fillStyle: "#DB4437" } }
    );

    // Add constraint (string)
    const constraint = Constraint.create({
      pointA: { x: 400, y: 100 },
      bodyB: bob,
      length: 150,
      stiffness: 0.9,
      damping: 0.05,
      render: { strokeStyle: "#555", lineWidth: 2 },
    });

    World.add(world, [anchor, bob, constraint]);
  };

  const handleParameterChange = (key: string, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const playAudioNarration = async () => {
    if (!selectedExperiment) return;

    try {
      const response = await axios.get(
        `http://localhost:8000/api/audio?text=${encodeURIComponent(selectedExperiment.description)}`,
        {
          responseType: "blob",
        }
      );

      const audio = new Audio(URL.createObjectURL(response.data));
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
          পদার্থবিজ্ঞান সিমুলেশন
        </h1>

        {/* Experiment Selector */}
        <div className="mb-4">
          <label className="block mb-1 text-base md:text-lg font-medium">
            পরীক্ষা নির্বাচন করুন:
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

                // Reset params to defaults
                const defaultParams: { [key: string]: number } = {};
                Object.entries(selected.params).forEach(
                  ([key, value]: [string, any]) => {
                    defaultParams[key] = value.default;
                  }
                );
                setParams(defaultParams);
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
                  onClick={playAudioNarration}
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

            {/* Simulation Area */}
            <div className="mb-4">
              <div
                ref={sceneRef}
                className="w-full h-[320px] md:h-[400px] bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden border border-gray-300 dark:border-gray-700"
              ></div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {selectedExperiment &&
                Object.entries(selectedExperiment.params).map(
                  ([key, param]) => (
                    <div
                      key={key}
                      className="bg-white dark:bg-gray-900 p-3 rounded-md shadow border border-gray-200 dark:border-gray-700"
                    >
                      <label
                        htmlFor={key}
                        className="block mb-1 font-medium dark:text-gray-100 text-sm md:text-base"
                      >
                        {param.name}: {params[key]} {param.unit}
                      </label>
                      <input
                        id={key}
                        type="range"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={params[key]}
                        onChange={(e) =>
                          handleParameterChange(key, parseFloat(e.target.value))
                        }
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{param.min}</span>
                        <span>{param.max}</span>
                      </div>
                    </div>
                  )
                )}
            </div>
          </>
        )}
      </div>
    </DefaultLayout>
  );
};

export default PhysicsEngine;
