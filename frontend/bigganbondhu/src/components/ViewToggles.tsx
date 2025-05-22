import React from "react";

const ViewToggles: React.FC = () => {
  return (
    <div className="flex gap-2">
      <button className="px-3 py-1 rounded bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition">
        Orbit View
      </button>
      <button className="px-3 py-1 rounded bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200 transition">
        Electron Cloud
      </button>
    </div>
  );
};

export default ViewToggles;
