import React from "react";
import AtomBuilder3D from "../AtomBuilder3D";
import AtomInfoPanel from "../AtomInfoPanel";
import MiniPeriodicTable from "../MiniPeriodicTable";
import ParticlePalette from "../ParticlePalette";
import ResetButton from "../ResetButton";
import ViewToggles from "../ViewToggles";

const AtomBuilder: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <aside className="w-full md:w-1/4 flex flex-col gap-4">
        <ParticlePalette />
        <AtomInfoPanel />
        <MiniPeriodicTable />
      </aside>
      <section className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <ViewToggles />
          <ResetButton />
        </div>
        <AtomBuilder3D />
      </section>
    </div>
  );
};

export default AtomBuilder;
