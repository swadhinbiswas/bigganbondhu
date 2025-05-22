import { Route, Routes } from "react-router-dom";

import AboutPage from "@/pages/about";
import BlogPage from "@/pages/blog";
import DocsPage from "@/pages/docs";
import AtomBuilderPage from "@/pages/engines/atom-builder";
import BiologyCategories from "@/pages/engines/biology-categories";
import BiologyExperiments from "@/pages/engines/biology-experiments";
import ChemistryEngine from "@/pages/engines/chemistry";
import PhysicsEngine from "@/pages/engines/physics";
import ShapesAnimation from "@/pages/hands-on/3d-shapes";
import CircuitDesignPage from "@/pages/hands-on/circuit";
import HandsOnIndexPage from "@/pages/hands-on/index";
import SolarSystem from "@/pages/hands-on/solar-system";
import IndexPage from "@/pages/index";
import PricingPage from "@/pages/pricing";
import DNASimulation from "./components/biology/DNASimulation";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<DocsPage />} path="/docs" />
      <Route element={<PricingPage />} path="/pricing" />
      <Route element={<BlogPage />} path="/blog" />
      <Route element={<AboutPage />} path="/about" />
      <Route element={<PhysicsEngine />} path="/engines/physics" />
      <Route element={<BiologyCategories />} path="/engines/biology" />
      <Route
        element={<BiologyExperiments />}
        path="/engines/biology/:category"
      />
      <Route element={<ChemistryEngine />} path="/engines/chemistry" />
      <Route element={<AtomBuilderPage />} path="/engines/atom-builder" />
      <Route element={<HandsOnIndexPage />} path="/hands-on" />
      <Route element={<CircuitDesignPage />} path="/hands-on/circuit" />
      <Route element={<ShapesAnimation />} path="/hands-on/3d-shapes" />
      <Route element={<SolarSystem />} path="/hands-on/solar-system" />

      <Route
        element={<DNASimulation />}
        path="/hands-on/biology/dna-simulation"
      />
    </Routes>
  );
}

export default App;
