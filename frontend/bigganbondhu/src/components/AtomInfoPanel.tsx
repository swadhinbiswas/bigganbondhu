import React from "react";

const AtomInfoPanel: React.FC = () => {
  // Placeholder values
  return (
    <div className="bg-white rounded-lg shadow p-4 mt-4">
      <h2 className="font-semibold text-indigo-600 mb-2">Atom Info</h2>
      <div className="flex flex-col gap-1">
        <div>
          Element: <span className="font-bold">Hydrogen</span>
        </div>
        <div>
          Protons: <span className="font-bold">1</span>
        </div>
        <div>
          Neutrons: <span className="font-bold">0</span>
        </div>
        <div>
          Electrons: <span className="font-bold">1</span>
        </div>
        <div>
          Net Charge: <span className="font-bold">0</span>
        </div>
        <div>
          Mass Number: <span className="font-bold">1</span>
        </div>
        <div>
          Status: <span className="font-bold text-green-600">Neutral</span>
        </div>
      </div>
    </div>
  );
};

export default AtomInfoPanel;
