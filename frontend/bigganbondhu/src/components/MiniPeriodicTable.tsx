import React from "react";

const MiniPeriodicTable: React.FC = () => {
  // Placeholder: Only Hydrogen highlighted
  return (
    <div className="bg-white rounded-lg shadow p-4 mt-4">
      <h2 className="font-semibold text-indigo-600 mb-2">Periodic Table</h2>
      <div className="grid grid-cols-5 gap-1 text-xs">
        <div className="bg-indigo-400 text-white rounded p-1">H</div>
        <div className="bg-gray-200 rounded p-1">He</div>
        <div className="bg-gray-200 rounded p-1">Li</div>
        <div className="bg-gray-200 rounded p-1">Be</div>
        <div className="bg-gray-200 rounded p-1">B</div>
        {/* ...add more as needed */}
      </div>
    </div>
  );
};

export default MiniPeriodicTable;
