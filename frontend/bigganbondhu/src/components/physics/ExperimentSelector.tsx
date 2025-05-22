import React from "react";

import { PhysicsExperiment } from "../../types/physics";

interface ExperimentSelectorProps {
  experiments: PhysicsExperiment[];
  selectedExperiment: PhysicsExperiment | null;
  onSelect: (experiment: PhysicsExperiment) => void;
}

const ExperimentSelector: React.FC<ExperimentSelectorProps> = ({
  experiments,
  selectedExperiment,
  onSelect,
}) => {
  return (
    <div className="mb-6">
      <label className="block text-gray-700 dark:text-gray-300 mb-2">
        Select Experiment:
      </label>
      <select
        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        value={selectedExperiment?.id || ""}
        onChange={(e) => {
          const selected = experiments.find((exp) => exp.id === e.target.value);

          if (selected) onSelect(selected);
        }}
      >
        {experiments.map((experiment) => (
          <option key={experiment.id} value={experiment.id}>
            {experiment.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ExperimentSelector;
