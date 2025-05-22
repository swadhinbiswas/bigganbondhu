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
      </div>
    </DefaultLayout>
  );
}
