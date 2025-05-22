import {
  Bodies,
  Body,
  Constraint,
  Engine,
  Mouse,
  MouseConstraint,
  Render,
  Runner,
  World,
} from "matter-js";
import { useEffect, useRef, useState } from "react";

import ErrorMessage from "@/components/physics/ErrorMessage";
import ExperimentSelector from "@/components/physics/ExperimentSelector";
import LoadingSpinner from "@/components/physics/LoadingSpinner";
import ParameterControls from "@/components/physics/ParameterControls";
import SimulationArea from "@/components/physics/SimulationArea";
import DefaultLayout from "@/layouts/default";
import apiService from "@/services/apiService";
import { PhysicsExperiment } from "@/types/physics";

// --- Simulation setup functions ---
function setupProjectileSimulation(
  engine: Engine,
  currentParams: { [key: string]: number },
) {
  const { world } = engine;

  // Add ground
  World.add(world, [
    Bodies.rectangle(400, 500, 800, 50, {
      isStatic: true,
      render: {
        fillStyle: document.documentElement.classList.contains("dark")
          ? "#334155"
          : "#cbd5e1",
      },
    }),
  ]);
  // Add projectile
  const angle = currentParams.angle * (Math.PI / 180); // Convert to radians
  const velocity = currentParams.velocity;
  const projectile = Bodies.circle(50, 450, 15, {
    restitution: 0.5,
    friction: currentParams.friction || 0.1,
    mass: currentParams.mass || 1,
    render: {
      fillStyle: document.documentElement.classList.contains("dark")
        ? "#34d399"
        : "#10b981",
    },
  });

  World.add(world, projectile);
  // Apply initial velocity
  Body.setVelocity(projectile, {
    x: velocity * Math.cos(angle),
    y: -velocity * Math.sin(angle),
  });
}

function setupCircuitSimulation(
  _engine: Engine,
  _currentParams: { [key: string]: number },
) {
  // For the circuit simulator, we don't need to use the Matter.js engine
  // This is a placeholder since we'll be using a custom React component
  // We're just returning without adding any physical bodies
  return;
}

function setupPendulumSimulation(
  engine: Engine,
  currentParams: { [key: string]: number },
) {
  const { world } = engine;
  // Add anchor point
  const anchor = Bodies.circle(400, 100, 10, {
    isStatic: true,
    render: {
      fillStyle: document.documentElement.classList.contains("dark")
        ? "#94a3b8"
        : "#64748b",
    },
  });
  // Add pendulum bob
  const bob = Bodies.circle(
    400 + 150 * Math.sin(currentParams.angle * (Math.PI / 180)),
    100 + 150 * Math.cos(currentParams.angle * (Math.PI / 180)),
    currentParams.mass * 10,
    {
      render: {
        fillStyle: document.documentElement.classList.contains("dark")
          ? "#f87171"
          : "#ef4444",
      },
    },
  );
  // Add constraint (string)
  const constraint = Constraint.create({
    pointA: { x: 400, y: 100 },
    bodyB: bob,
    length: 150,
    stiffness: 0.9,
    damping: currentParams.damping || 0.05,
    render: {
      strokeStyle: document.documentElement.classList.contains("dark")
        ? "#e2e8f0"
        : "#94a3b8",
      lineWidth: 2,
    },
  });

  World.add(world, [anchor, bob, constraint]);
}

function setupNewtonLawsSimulation(
  engine: Engine,
  currentParams: { [key: string]: number },
) {
  const { world } = engine;
  const canvasWidth = 800;
  const canvasHeight = 500;
  const isDarkMode = document.documentElement.classList.contains("dark");

  // Ground
  World.add(world, [
    Bodies.rectangle(canvasWidth / 2, canvasHeight, canvasWidth, 50, {
      isStatic: true,
      render: {
        fillStyle: isDarkMode ? "#334155" : "#cbd5e1",
      },
      friction: currentParams.friction,
    }),
  ]);
  // Add divider in the middle
  World.add(world, [
    Bodies.rectangle(canvasWidth / 2, canvasHeight - 25, 5, 50, {
      isStatic: true,
      render: {
        fillStyle: isDarkMode ? "#94a3b8" : "#64748b",
      },
    }),
  ]);
  // Calculate acceleration based on F = ma
  // const acceleration = currentParams.force / currentParams.mass;
  // Left side - Cart Push
  const cartWidth = 80;
  const cartHeight = 40;
  const cartX = canvasWidth / 4 - 40;
  const cartY = canvasHeight - 45;
  const cart = Bodies.rectangle(cartX, cartY, cartWidth, cartHeight, {
    chamfer: { radius: 10 },
    render: {
      fillStyle: isDarkMode ? "#3b82f6" : "#2563eb",
    },
    friction: currentParams.friction,
    mass: currentParams.mass / 2,
    label: "cart",
  });
  // Add wheels to cart
  const wheel1 = Bodies.circle(
    cartX - cartWidth / 3,
    cartY + cartHeight / 2,
    10,
    {
      render: {
        fillStyle: isDarkMode ? "#1e293b" : "#334155",
      },
      friction: currentParams.friction / 2,
    },
  );
  const wheel2 = Bodies.circle(
    cartX + cartWidth / 3,
    cartY + cartHeight / 2,
    10,
    {
      render: {
        fillStyle: isDarkMode ? "#1e293b" : "#334155",
      },
      friction: currentParams.friction / 2,
    },
  );
  const cartComposite = Body.create({
    parts: [cart, wheel1, wheel2],
    friction: currentParams.friction,
  });
  // Right side - Rickshaw Pull
  const rickshawWidth = 100;
  const rickshawHeight = 50;
  const rickshawX = (canvasWidth * 3) / 4 + 40;
  const rickshawY = canvasHeight - 50;
  const rickshaw = Bodies.rectangle(
    rickshawX,
    rickshawY,
    rickshawWidth,
    rickshawHeight,
    {
      chamfer: { radius: 10 },
      render: {
        fillStyle: isDarkMode ? "#a855f7" : "#9333ea",
      },
      friction: currentParams.friction,
      mass: currentParams.mass / 2,
      label: "rickshaw",
    },
  );
  // Add wheels to rickshaw
  const rickshawWheel1 = Bodies.circle(
    rickshawX - rickshawWidth / 3,
    rickshawY + rickshawHeight / 2,
    15,
    {
      render: {
        fillStyle: isDarkMode ? "#1e293b" : "#334155",
      },
      friction: currentParams.friction / 2,
    },
  );
  const rickshawWheel2 = Bodies.circle(
    rickshawX + rickshawWidth / 3,
    rickshawY + rickshawHeight / 2,
    15,
    {
      render: {
        fillStyle: isDarkMode ? "#1e293b" : "#334155",
      },
      friction: currentParams.friction / 2,
    },
  );
  const rickshawComposite = Body.create({
    parts: [rickshaw, rickshawWheel1, rickshawWheel2],
    friction: currentParams.friction,
  });

  // Add all objects to the world
  World.add(world, [cartComposite, rickshawComposite]);
  // Apply forces based on parameters
  const forceValue = currentParams.force;

  // Apply force to cart (pushing)
  Body.applyForce(
    cartComposite,
    { x: cartX - cartWidth / 2, y: cartY },
    { x: forceValue / 5000, y: 0 },
  );
  // Apply force to rickshaw (pulling)
  Body.applyForce(
    rickshawComposite,
    { x: rickshawX + rickshawWidth / 2, y: rickshawY },
    { x: -forceValue / 5000, y: 0 },
  );
}

function setupNewtonsLawsInteractiveSimulation(
  engine: Engine,
  currentParams: { [key: string]: number },
  sceneRef: React.RefObject<HTMLDivElement>,
  rendererRef: React.RefObject<Render>,
) {
  const { world } = engine;
  const canvasWidth = 800;
  const canvasHeight = 500;
  const isDarkMode = document.documentElement.classList.contains("dark");

  // Add ground
  World.add(world, [
    Bodies.rectangle(canvasWidth / 2, canvasHeight, canvasWidth, 50, {
      isStatic: true,
      render: {
        fillStyle: isDarkMode ? "#334155" : "#cbd5e1",
      },
      friction: currentParams.friction || 0.3,
    }),
  ]);

  // Add objects based on which law is selected
  const selectedLaw = currentParams.lawNumber || 1;

  if (selectedLaw === 1) {
    // First Law: Object stays at rest or in motion unless acted upon by force

    // Object at rest
    const restObject = Bodies.rectangle(200, canvasHeight - 75, 60, 40, {
      chamfer: { radius: 5 },
      render: {
        fillStyle: isDarkMode ? "#f87171" : "#ef4444",
      },
      friction: currentParams.friction || 0.3,
      mass: currentParams.mass || 1,
      label: "restObject",
    });

    // Object in motion
    const movingObject = Bodies.rectangle(600, canvasHeight - 75, 60, 40, {
      chamfer: { radius: 5 },
      render: {
        fillStyle: isDarkMode ? "#60a5fa" : "#3b82f6",
      },
      friction: 0.01, // Lower friction for the moving object
      mass: currentParams.mass || 1,
      label: "movingObject",
    });

    // Apply initial velocity to the moving object
    Body.setVelocity(movingObject, { x: -2, y: 0 });

    World.add(world, [restObject, movingObject]);

    // Add text labels using DOM elements outside of canvas
    if (sceneRef.current) {
      const labelDiv = document.createElement("div");

      labelDiv.className =
        "absolute top-4 left-4 bg-white dark:bg-gray-800 p-2 rounded shadow-lg";
      labelDiv.innerHTML = `<p class="text-gray-800 dark:text-gray-200 font-bold">Newton's 1st Law: Objects in motion stay in motion, objects at rest stay at rest</p>`;
      sceneRef.current.appendChild(labelDiv);
    }
  } else if (selectedLaw === 2) {
    // Second Law: F = ma
    const objectMass = currentParams.mass || 1;
    const objectSize = 30 + objectMass * 10; // Size based on mass

    const object = Bodies.rectangle(
      canvasWidth / 2,
      canvasHeight - 75 - objectSize / 2,
      objectSize,
      objectSize,
      {
        chamfer: { radius: 5 },
        render: {
          fillStyle: isDarkMode ? "#a855f7" : "#9333ea",
        },
        friction: currentParams.friction || 0.3,
        mass: objectMass,
        label: "massObject",
      },
    );

    // Apply force based on parameter
    const forceValue = currentParams.force || 0.05;

    Body.applyForce(
      object,
      { x: object.position.x, y: object.position.y },
      { x: forceValue, y: 0 },
    );

    World.add(world, [object]);

    // Add force arrow and formula display
    if (sceneRef.current) {
      const infoDiv = document.createElement("div");

      infoDiv.className =
        "absolute top-4 left-4 bg-white dark:bg-gray-800 p-2 rounded shadow-lg";
      infoDiv.innerHTML = `
        <p class="text-gray-800 dark:text-gray-200 font-bold">Newton's 2nd Law: F = m × a</p>
        <p class="text-gray-700 dark:text-gray-300">Mass: ${objectMass} kg</p>
        <p class="text-gray-700 dark:text-gray-300">Force: ${forceValue} N</p>
        <p class="text-gray-700 dark:text-gray-300">Acceleration: ${(forceValue / objectMass).toFixed(2)} m/s²</p>
      `;
      sceneRef.current.appendChild(infoDiv);
    }
  } else if (selectedLaw === 3) {
    // Third Law: Action and Reaction

    // Create two objects that will push against each other
    const leftObject = Bodies.rectangle(300, canvasHeight - 75, 70, 50, {
      chamfer: { radius: 8 },
      render: {
        fillStyle: isDarkMode ? "#f87171" : "#ef4444",
      },
      friction: currentParams.friction || 0.3,
      mass: currentParams.mass || 1,
      label: "leftObject",
    });

    const rightObject = Bodies.rectangle(500, canvasHeight - 75, 70, 50, {
      chamfer: { radius: 8 },
      render: {
        fillStyle: isDarkMode ? "#60a5fa" : "#3b82f6",
      },
      friction: currentParams.friction || 0.3,
      mass: currentParams.mass || 1,
      label: "rightObject",
    });

    // Add a spring constraint between the objects
    const constraint = Constraint.create({
      bodyA: leftObject,
      bodyB: rightObject,
      stiffness: 0.01,
      damping: 0.1,
      length: 200,
      render: {
        type: "line",
        strokeStyle: isDarkMode ? "#94a3b8" : "#64748b",
      },
    });

    World.add(world, [leftObject, rightObject, constraint]);

    // Apply initial forces
    const forceValue = currentParams.force || 0.05;

    Body.applyForce(
      leftObject,
      { x: leftObject.position.x, y: leftObject.position.y },
      { x: forceValue, y: 0 },
    );

    // The reaction force happens automatically due to physics engine

    // Add explanation text
    if (sceneRef.current) {
      const infoDiv = document.createElement("div");

      infoDiv.className =
        "absolute top-4 left-4 bg-white dark:bg-gray-800 p-2 rounded shadow-lg";
      infoDiv.innerHTML = `
        <p class="text-gray-800 dark:text-gray-200 font-bold">Newton's 3rd Law: For every action, there is an equal and opposite reaction</p>
        <p class="text-gray-700 dark:text-gray-300">Watch how forces are transmitted between objects</p>
      `;
      sceneRef.current.appendChild(infoDiv);
    }
  }

  // Add mouse control for dragging and pushing objects
  if (rendererRef.current) {
    const mouse = Mouse.create(rendererRef.current.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: true,
        },
      },
    });

    World.add(world, mouseConstraint);
    rendererRef.current.mouse = mouse;
  }
}

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
        const data = await apiService.physics.getExperiments();

        // Add null check for the experiments array
        if (
          data &&
          (data as any).experiments &&
          Array.isArray((data as any).experiments)
        ) {
          setExperiments((data as any).experiments);

          if ((data as any).experiments.length > 0) {
            setSelectedExperiment((data as any).experiments[0]);

            // Initialize params with default values
            const defaultParams: { [key: string]: number } = {};

            // Make sure params exist before attempting to iterate
            if ((data as any).experiments[0].params) {
              Object.entries((data as any).experiments[0].params).forEach(
                ([key, value]: [string, any]) => {
                  defaultParams[key] = value.default;
                },
              );
            }
            setParams(defaultParams);
          }
        } else {
          // Handle case when experiments array is missing or invalid
          console.warn("Invalid experiments data format received:", data);
          setExperiments([]);
        }
        setLoading(false);
      } catch (err: any) {
        let errorMessage = "Failed to load physics experiments";

        if (err?.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorMessage = `Error ${err.response.status}: ${err.response.data?.detail || errorMessage}`;
        } else if (err?.request) {
          // The request was made but no response was received
          errorMessage =
            "Could not connect to the server. Please check if the backend is running.";
        }
        setError(errorMessage);
        setLoading(false);
        console.error("Error fetching physics experiments:", err);
      }
    };

    fetchExperiments();
  }, []);

  // After fetching experiments, add the wave experiment and circular motion experiment
  useEffect(() => {
    if (
      !loading &&
      experiments &&
      Array.isArray(experiments) &&
      experiments.length > 0 &&
      !experiments.some((e) => e.id === "wave-interference")
    ) {
      setExperiments((prev) => [
        ...prev,
        {
          id: "wave-interference",
          title: "Wave Interference & Beats",
          description:
            "Visualize the superposition of two waves and observe beat formation when their frequencies are close. Adjust amplitude and frequency to explore constructive, destructive interference, and beats.",
          type: "wave",
          params: {},
        },
        {
          id: "uniform-circular-motion",
          title: "Uniform Circular Motion",
          description:
            "Visualize uniform circular motion and explore the relationship between velocity, centripetal force, and radius. Adjust mass, speed, and radius to understand how they affect centripetal force.",
          type: "circular-motion",
          params: {
            mass: {
              name: "Mass",
              min: 0.5,
              max: 5,
              default: 1,
              step: 0.1,
              unit: "kg",
            },
            radius: {
              name: "Radius",
              min: 1,
              max: 10,
              default: 3,
              step: 0.5,
              unit: "m",
            },
            speed: {
              name: "Speed",
              min: 1,
              max: 10,
              default: 2,
              step: 0.5,
              unit: "m/s",
            },
          },
        },
      ]);
    }
  }, [loading, experiments]);

  // Initialize Matter.js
  useEffect(() => {
    if (!selectedExperiment || !sceneRef.current) return;

    // Clear the scene ref regardless of experiment type
    if (sceneRef.current.childNodes.length > 0) {
      sceneRef.current.innerHTML = "";
    }

    // Skip Matter.js setup for SVG animations and 3D Newton's Laws
    if (
      selectedExperiment.type === "svganimation" ||
      selectedExperiment.id === "newton-laws-interactive"
    )
      return;

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

    // Check if dark mode is enabled
    const isDarkMode = document.documentElement.classList.contains("dark");

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: sceneRef.current.clientWidth,
        height: 500,
        wireframes: false,
        background: isDarkMode ? "#1e293b" : "#f8fafc",
      },
    });

    rendererRef.current = render;

    // Create bodies based on experiment type
    if (selectedExperiment.type === "projectile") {
      setupProjectileSimulation(engine, params);
    } else if (selectedExperiment.type === "pendulum") {
      setupPendulumSimulation(engine, params);
    } else if (selectedExperiment.type === "newton") {
      setupNewtonLawsSimulation(engine, params);
    } else if (selectedExperiment.id === "newton-laws") {
      setupNewtonLawsSimulation(engine, params);
    } else if (selectedExperiment.type === "circuit") {
      setupCircuitSimulation(engine, params);
    } else if (selectedExperiment.id === "newton-laws-interactive") {
      setupNewtonsLawsInteractiveSimulation(
        engine,
        params,
        sceneRef,
        rendererRef,
      );
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

  // Handle SVG animation rendering
  useEffect(() => {
    if (
      selectedExperiment?.type === "svganimation" &&
      selectedExperiment?.svgPath &&
      sceneRef.current
    ) {
      // Clear any existing content
      if (sceneRef.current.childNodes.length > 0) {
        sceneRef.current.innerHTML = "";
      }

      const fetchAndRenderSVG = async () => {
        try {
          // Fetch SVG from the server
          if (!selectedExperiment || !selectedExperiment.svgPath) {
            console.warn("No SVG path available for the selected experiment");

            return;
          }

          const svgUrl = apiService.getSvgUrl(selectedExperiment.svgPath);
          const response = await fetch(svgUrl);
          const data = await response.text();

          if (data) {
            // Create a container and set the SVG content
            const svgContainer = document.createElement("div");

            svgContainer.innerHTML = data;
            svgContainer.className =
              "w-full h-full flex items-center justify-center";

            // Apply dark mode class if needed
            const isDarkMode = document.documentElement.classList.contains(
              "dark",
            )
              ? true
              : false;

            document.documentElement.classList.contains("dark");

            const svgElement = svgContainer.querySelector("svg");

            if (svgElement) {
              // Make SVG responsive
              svgElement.setAttribute("width", "100%");
              svgElement.setAttribute("height", "100%");
              svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");

              // Apply dark mode class if needed
              if (isDarkMode) {
                svgElement.classList.add("dark-mode");
              } else {
                svgElement.classList.remove("dark-mode");
              }

              // Apply parameter values to modify the SVG if needed
              if (selectedExperiment.id === "pressure") {
                // Special handling for pressure simulation
                const weight = params.weight || 60; // Default to 60 if undefined
                const footArea = params.footArea || 150; // Default to 150 if undefined
                const shoeArea = params.shoeArea || 300; // Default to 300 if undefined
                const mudSoftness = params.mudSoftness || 5; // Default to 5 if undefined

                // Calculate pressures (P = F/A)
                const barefootPressure = (weight * 9.8) / (footArea / 10000); // Convert cm² to m²
                const shoePressure = (weight * 9.8) / (shoeArea / 10000); // Convert cm² to m²
                const pressureRatio = (barefootPressure / shoePressure).toFixed(
                  1,
                );

                // Update the barefoot pressure visualization
                const barefootPressureIndicator = svgElement.querySelector(
                  "#barefootPressureIndicator",
                );

                if (barefootPressureIndicator) {
                  barefootPressureIndicator.setAttribute(
                    "r",
                    (40 + mudSoftness * 2).toString(),
                  );
                }
                // Update the shoe pressure visualization
                const shoePressureIndicator = svgElement.querySelector(
                  "#shoePressureIndicator",
                );

                if (shoePressureIndicator) {
                  shoePressureIndicator.setAttribute(
                    "height",
                    (80 - mudSoftness * 2).toString(),
                  );
                }
                // Update the pressure value text
                const barefootPressureValue = svgElement.querySelector(
                  "#barefootPressureValue",
                );

                if (barefootPressureValue) {
                  barefootPressureValue.textContent =
                    barefootPressure > shoePressure ? "উচ্চ চাপ" : "কম চাপ";
                }
                const shoePressureValue =
                  svgElement.querySelector("#shoePressureValue");

                if (shoePressureValue) {
                  shoePressureValue.textContent =
                    shoePressure < barefootPressure ? "কম চাপ" : "উচ্চ চাপ";
                }
                // Update the comparison value
                const comparisonValue =
                  svgElement.querySelector("#comparisonValue");

                if (comparisonValue) {
                  comparisonValue.textContent = `চাপের অনুপাত: ${pressureRatio}x`;
                }
              }
            }
            if (sceneRef.current) {
              sceneRef.current.appendChild(svgContainer);
            }
          }
        } catch (err) {
          setError("Failed to load SVG animation.");
        }
      };

      fetchAndRenderSVG();
    }
  }, [selectedExperiment, params]);

  const handleParameterChange = (key: string, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const playAudioNarration = async () => {
    if (!selectedExperiment || !selectedExperiment.description) return;
    try {
      const audioUrl = apiService.audio.getAudio(
        selectedExperiment.description,
      );
      const audio = new Audio(audioUrl);

      audio.play();
    } catch (err) {
      console.error("Error playing audio narration:", err);
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <LoadingSpinner />
      </DefaultLayout>
    );
  }

  if (error) {
    return (
      <DefaultLayout>
        <ErrorMessage message={error} />
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
          Physics Simulation Lab
        </h1>
        <ExperimentSelector
          experiments={experiments}
          selectedExperiment={selectedExperiment}
          onSelect={(exp) => {
            // Clean up previous simulation
            if (engineRef.current) {
              Runner.stop(runnerRef.current!);
              World.clear(engineRef.current.world, false);
              Engine.clear(engineRef.current);
              rendererRef.current?.canvas.remove();
            }
            if (sceneRef.current) {
              sceneRef.current.innerHTML = "";
            }
            setSelectedExperiment(exp);
            // Reset params to default
            const defaultParams: { [key: string]: number } = {};

            Object.entries(exp.params).forEach(
              ([key, value]: [string, any]) => {
                defaultParams[key] = value.default;
              },
            );
            setParams(defaultParams);
          }}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ParameterControls
            params={params}
            selectedExperiment={selectedExperiment}
            onParamChange={handleParameterChange}
            onPlayAudio={playAudioNarration}
          />
          <SimulationArea
            params={params}
            sceneRef={sceneRef!}
            selectedExperiment={selectedExperiment}
          />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default PhysicsEngine;
