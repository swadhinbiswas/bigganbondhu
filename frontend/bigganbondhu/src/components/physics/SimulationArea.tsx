import React, { RefObject, useState } from "react";
import { PhysicsExperiment } from "../../types/physics";
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
    <div className="md:col-span-2 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        Simulation
      </h2>
      <p className="mb-4 text-gray-700 dark:text-gray-300">
        {selectedExperiment.description}
      </p>

      {isInclinedPlane && params ? (
        <InclinedPlane
          params={{
            mass: params.mass ?? 2,
            angle: params.angle ?? 20,
            friction: params.friction ?? 0.2,
          }}
          lang={"en"}
        />
      ) : isNewton3D && params ? (
        <NewtonLaws3D
          lawNumber={params.lawNumber || 1}
          mass={params.mass || 2}
          force={params.force || 0.05}
          friction={params.friction || 0.3}
        />
      ) : isFreeFall3D && params ? (
        <FreeFall3D
          initialHeight={params.initialHeight || 20}
          initialVelocity={params.initialVelocity || 0}
          gravity={params.gravity || 9.8}
        />
      ) : isRayDiagramOptics && params ? (
        <RayDiagramOptics />
      ) : isWaveInterference ? (
        <WaveInterference />
      ) : isCircularMotion && params ? (
        <>
          {/* Language Toggle Button */}
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setLanguage(language === "en" ? "bn" : "en")}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
            >
              {language === "en" ? "বাংলা" : "English"}
            </button>
          </div>

          {/* Information Display */}
          <CircularMotionInfo
            mass={params.mass || 1}
            radius={params.radius || 3}
            speed={params.speed || 2}
            language={language}
          />

          <div className="mt-4">
            {/* Circular Motion Controls */}
            <CircularMotionControls
              showVelocityVector={showVelocityVector}
              showForceVector={showForceVector}
              showTrace={showTrace}
              showSlowMotion={showSlowMotion}
              onToggleVelocity={() =>
                setShowVelocityVector(!showVelocityVector)
              }
              onToggleForce={() => setShowForceVector(!showForceVector)}
              onToggleTrace={() => setShowTrace(!showTrace)}
              onToggleSlowMotion={() => setShowSlowMotion(!showSlowMotion)}
            />

            <UniformCircularMotion
              params={{
                mass: params.mass || 1,
                radius: params.radius || 3,
                speed: params.speed || 2,
              }}
              showVelocityVector={showVelocityVector}
              showForceVector={showForceVector}
              showFormulas={true}
              showTrace={showTrace}
              slowMotion={showSlowMotion}
              lang={language}
            />
          </div>
        </>
      ) : isCircuitSimulator && params ? (
        <CircuitSimulator
          voltage={params.voltage || 9}
          resistance={params.resistance || 100}
          showLabels={params.showLabels === 1}
        />
      ) : (
        <div
          ref={sceneRef}
          className="w-full h-[500px] bg-gray-100 dark:bg-gray-800 rounded overflow-hidden shadow-inner"
        ></div>
      )}
    </div>
  );
};

export default SimulationArea;
