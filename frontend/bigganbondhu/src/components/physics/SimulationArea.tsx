import React, { RefObject, useState } from "react";

import { PhysicsExperiment } from "../../types/physics";

import CircuitSimulator from "./CircuitSimulator";
import CircularMotionControls from "./CircularMotionControls";
import CircularMotionInfo from "./CircularMotionInfo";
import FreeFall3D from "./FreeFall3D";
import InclinedPlane from "./InclinedPlane";
import NewtonLaws3D from "./NewtonLaws3D";
import RayDiagramOptics from "./RayDiagramOptics";
import UniformCircularMotion from "./UniformCircularMotion";
import WaveInterference from "./WaveInterference";

interface SimulationAreaProps {
  selectedExperiment: PhysicsExperiment | null;
  sceneRef: RefObject<HTMLDivElement>;
  params?: { [key: string]: number };
}

const SimulationArea: React.FC<SimulationAreaProps> = ({
  selectedExperiment,
  sceneRef,
  params,
}) => {
  const [language, setLanguage] = useState<"en" | "bn">("en");
  const [showVelocityVector, setShowVelocityVector] = useState(true);
  const [showForceVector, setShowForceVector] = useState(true);
  const [showTrace, setShowTrace] = useState(false);
  const [showSlowMotion, setShowSlowMotion] = useState(false);

  if (!selectedExperiment) return null;

  // Determine whether to render the 3D component or use the div for Matter.js
  const isNewton3D = selectedExperiment.id === "newton-laws-interactive";
  const isFreeFall3D = selectedExperiment.type === "freefall";
  const isRayDiagramOptics = selectedExperiment.id === "ray-diagram-optics";
  const isWaveInterference = selectedExperiment.type === "wave";
  const isInclinedPlane = selectedExperiment.id === "inclined-plane";
  const isCircularMotion = selectedExperiment.type === "circular-motion";
  const isCircuitSimulator = selectedExperiment.type === "circuit";

  return (
    <div className="md:col-span-2 bg-white dark:bg-gray-900 p-3 sm:p-4 lg:p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-gray-100">
        Simulation
      </h2>
      <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {selectedExperiment.description}
      </p>

      {isInclinedPlane && params ? (
        <InclinedPlane
          lang={"en"}
          params={{
            mass: params.mass ?? 2,
            angle: params.angle ?? 20,
            friction: params.friction ?? 0.2,
          }}
        />
      ) : isNewton3D && params ? (
        <NewtonLaws3D
          force={params.force || 0.05}
          friction={params.friction || 0.3}
          lawNumber={params.lawNumber || 1}
          mass={params.mass || 2}
        />
      ) : isFreeFall3D && params ? (
        <FreeFall3D
          gravity={params.gravity || 9.8}
          initialHeight={params.initialHeight || 20}
          initialVelocity={params.initialVelocity || 0}
        />
      ) : isRayDiagramOptics && params ? (
        <RayDiagramOptics />
      ) : isWaveInterference ? (
        <WaveInterference />
      ) : isCircularMotion && params ? (
        <div className="space-y-3 sm:space-y-4">
          {/* Language Toggle Button */}
          <div className="flex justify-end">
            <button
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200 text-sm sm:text-base touch-optimized-button"
              onClick={() => setLanguage(language === "en" ? "bn" : "en")}
            >
              {language === "en" ? "বাংলা" : "English"}
            </button>
          </div>

          {/* Information Display */}
          <CircularMotionInfo
            language={language}
            mass={params.mass || 1}
            radius={params.radius || 3}
            speed={params.speed || 2}
          />

          <div className="space-y-3 sm:space-y-4">
            {/* Circular Motion Controls */}
            <CircularMotionControls
              showForceVector={showForceVector}
              showSlowMotion={showSlowMotion}
              showTrace={showTrace}
              showVelocityVector={showVelocityVector}
              onToggleForce={() => setShowForceVector(!showForceVector)}
              onToggleSlowMotion={() => setShowSlowMotion(!showSlowMotion)}
              onToggleTrace={() => setShowTrace(!showTrace)}
              onToggleVelocity={() =>
                setShowVelocityVector(!showVelocityVector)
              }
            />

            <UniformCircularMotion
              lang={language}
              params={{
                mass: params.mass || 1,
                radius: params.radius || 3,
                speed: params.speed || 2,
              }}
              showForceVector={showForceVector}
              showFormulas={true}
              showTrace={showTrace}
              showVelocityVector={showVelocityVector}
              slowMotion={showSlowMotion}
            />
          </div>
        </div>
      ) : isCircuitSimulator && params ? (
        <CircuitSimulator
          resistance={params.resistance || 100}
          voltage={params.voltage || 9}
        />
      ) : (
        <div
          ref={sceneRef}
          className="w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-gray-100 dark:bg-gray-800 rounded overflow-hidden shadow-inner"
        />
      )}
    </div>
  );
};

export default SimulationArea;
