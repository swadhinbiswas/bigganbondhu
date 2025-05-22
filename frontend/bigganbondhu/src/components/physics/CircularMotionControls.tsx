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
    <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
      <button
        className={`px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm font-medium touch-optimized-button ${
          showVelocityVector
            ? "bg-green-600 text-white"
            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
        }`}
        onClick={onToggleVelocity}
      >
        Velocity Vector
      </button>

      <button
        className={`px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm font-medium touch-optimized-button ${
          showForceVector
            ? "bg-red-600 text-white"
            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
        }`}
        onClick={onToggleForce}
      >
        Force Vector
      </button>

      <button
        className={`px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm font-medium touch-optimized-button ${
          showTrace
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
        }`}
        onClick={onToggleTrace}
      >
        Show Trace
      </button>

      <button
        className={`px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm font-medium touch-optimized-button ${
          showSlowMotion
            ? "bg-purple-600 text-white"
            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
        }`}
        onClick={onToggleSlowMotion}
      >
        Slow Motion
      </button>
    </div>
  );
};

export default CircularMotionControls;
