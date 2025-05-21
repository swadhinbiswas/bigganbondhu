import React from "react";
import { PhysicsExperiment } from "../../types/physics";

interface ParameterControlsProps {
  selectedExperiment: PhysicsExperiment | null;
  params: { [key: string]: number };
  onParamChange: (key: string, value: number) => void;
  onPlayAudio: () => void;
}

const ParameterControls: React.FC<ParameterControlsProps> = ({
  selectedExperiment,
  params,
  onParamChange,
  onPlayAudio,
}) => {
  if (!selectedExperiment) return null;
  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        Parameters
      </h2>
      <div className="space-y-4">
        {Object.entries(selectedExperiment.params).map(
          ([key, param]: [string, any]) => (
            <div key={key}>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">
                {param.name} ({param.unit})
              </label>
              <input
                type="range"
                min={param.min}
                max={param.max}
                step={param.step}
                value={params[key] || param.default}
                onChange={(e) => onParamChange(key, parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{param.min}</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {params[key] || param.default} {param.unit}
                </span>
                <span>{param.max}</span>
              </div>
            </div>
          )
        )}
        <button
          onClick={onPlayAudio}
          className="mt-4 w-full py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded hover:bg-emerald-700 dark:hover:bg-emerald-600 transition duration-200 shadow-lg"
        >
          Play Audio Explanation
        </button>
      </div>
    </div>
  );
};

export default ParameterControls;
