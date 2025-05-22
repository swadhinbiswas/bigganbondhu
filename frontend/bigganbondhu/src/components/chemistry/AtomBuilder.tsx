import React from "react";

import AtomBuilder3D from "../AtomBuilder3D";
import AtomInfoPanel from "../AtomInfoPanel";
import MiniPeriodicTable from "../MiniPeriodicTable";
import ParticlePalette from "../ParticlePalette";
import ResetButton from "../ResetButton";
import ViewToggles from "../ViewToggles";

const AtomBuilder: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-2 sm:p-4 lg:p-8 min-h-screen">
      {/* Top Section: Sidebar and 3D Builder */}
      <div className="flex flex-col lg:flex-row gap-4 flex-grow">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-1/4 flex flex-col gap-4">
          <ParticlePalette />
          <AtomInfoPanel />
        </aside>
        {/* Main 3D Builder Section */}
        <section className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <ViewToggles />
            <ResetButton />
          </div>
          <AtomBuilder3D />
        </section>
      </div>
      {/* Bottom Section: Full-width Periodic Table */}
      <div className="w-full mt-4">
        <MiniPeriodicTable />
      </div>
    </div>
  );
};

export default AtomBuilder;
