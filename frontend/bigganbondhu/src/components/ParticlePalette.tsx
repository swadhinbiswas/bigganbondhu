import React from "react";

const ParticlePalette: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
      <h2 className="font-semibold text-indigo-600 mb-2">Particles</h2>
      <div className="flex gap-2">
        <div className="w-10 h-10 rounded-full bg-red-400 flex items-center justify-center text-white font-bold cursor-pointer">
          p⁺
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold cursor-pointer">
          n⁰
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold cursor-pointer">
          e⁻
        </div>
      </div>
    </div>
  );
};

export default ParticlePalette;
