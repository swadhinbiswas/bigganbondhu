import React from "react";

interface CircularMotionControlsProps {
  showVelocityVector: boolean;
  showForceVector: boolean;
  showTrace: boolean;
  showSlowMotion: boolean;
  onToggleVelocity: () => void;
  onToggleForce: () => void;
  onToggleTrace: () => void;
  onToggleSlowMotion: () => void;
}

const CircularMotionControls: React.FC<CircularMotionControlsProps> = ({
  showVelocityVector,
  showForceVector,
  showTrace,
  showSlowMotion,
  onToggleVelocity,
  onToggleForce,
  onToggleTrace,
  onToggleSlowMotion,
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={onToggleVelocity}
        className={`px-3 py-1 rounded text-sm font-medium ${
          showVelocityVector
            ? "bg-green-600 text-white"
            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
        }`}
      >
        Velocity Vector
      </button>

      <button
        onClick={onToggleForce}
        className={`px-3 py-1 rounded text-sm font-medium ${
          showForceVector
            ? "bg-red-600 text-white"
            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
        }`}
      >
        Force Vector
      </button>

      <button
        onClick={onToggleTrace}
        className={`px-3 py-1 rounded text-sm font-medium ${
          showTrace
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
        }`}
      >
        Show Trace
      </button>

      <button
        onClick={onToggleSlowMotion}
        className={`px-3 py-1 rounded text-sm font-medium ${
          showSlowMotion
            ? "bg-purple-600 text-white"
            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
        }`}
      >
        Slow Motion
      </button>
    </div>
  );
};

export default CircularMotionControls;
