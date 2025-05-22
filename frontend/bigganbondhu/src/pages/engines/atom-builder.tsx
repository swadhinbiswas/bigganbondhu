import AtomBuilder from "@/components/chemistry/AtomBuilder";
import DefaultLayout from "@/layouts/default";

export default function AtomBuilderPage() {
  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Interactive Atom Builder
        </h1>

        <div className="mb-6 bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Learning Objectives</h2>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>
              Understand the structure of atoms: protons, neutrons, and
              electrons
            </li>
            <li>Learn how the number of protons determines the element type</li>
            <li>
              Explore how electrons are arranged in shells around the nucleus
            </li>
            <li>
              Discover how the balance of particles affects stability and ionic
              charge
            </li>
            <li>
              Visualize the transition between orbital model and electron cloud
              model
            </li>
          </ul>
        </div>

        <AtomBuilder />

        <div className="mt-6 bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 pl-4">
            <li>
              Drag protons, neutrons, and electrons to the atom or click to add
              them
            </li>
            <li>
              Use the particle counter controls to add or remove specific
              particles
            </li>
            <li>
              Switch between 'Orbit' and 'Cloud' views to see different atomic
              models
            </li>
            <li>
              Notice how the element identity changes as you add or remove
              protons
            </li>
            <li>
              Observe how the charge changes as you modify the electron count
            </li>
            <li>
              Check the atom stability indicator and try to create stable
              configurations
            </li>
            <li>Use the reset button to start with a fresh atom</li>
          </ol>
        </div>
      </div>
    </DefaultLayout>
  );
}
