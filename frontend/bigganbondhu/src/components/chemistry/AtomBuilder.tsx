import React from "react";
import AtomBuilder3D from "../AtomBuilder3D";
import ParticlePalette from "../ParticlePalette";
import AtomInfoPanel from "../AtomInfoPanel";
import MiniPeriodicTable from "../MiniPeriodicTable";
import ViewToggles from "../ViewToggles";
import ResetButton from "../ResetButton";

const AtomBuilder: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8 h-screen"> {/* Added padding and h-screen for full height context */}
      {/* Top Section: Sidebar and 3D Builder */}
      <div className="flex flex-col md:flex-row gap-4 flex-grow"> {/* flex-grow allows this section to take available space */}
        {/* Left Sidebar */}
        <aside className="w-full md:w-1/4 flex flex-col gap-4">
          <ParticlePalette />
          <AtomInfoPanel />
          {/* MiniPeriodicTable is removed from here */}
        </aside>

        {/* Main 3D Builder Section */}
        <section className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <ViewToggles />
            <ResetButton />
          </div>
          <AtomBuilder3D />
        </section>
      </div>

      {/* Bottom Section: Full-width Periodic Table */}
      <div className="w-full mt-4"> {/* w-full makes it take full width, mt-4 adds margin-top */}
        <MiniPeriodicTable />
      </div>
    </div>
  );
};

export default AtomBuilder;