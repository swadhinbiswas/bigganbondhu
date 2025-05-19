import { Route, Routes } from "react-router-dom";

import AboutPage from "@/pages/about";
import BlogPage from "@/pages/blog";
import DocsPage from "@/pages/docs";
import BiologyEngine from "@/pages/engines/biology";
import ChemistryEngine from "@/pages/engines/chemistry";
import PhysicsEngine from "@/pages/engines/physics";
import IndexPage from "@/pages/index";
import PricingPage from "@/pages/pricing";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<DocsPage />} path="/docs" />
      <Route element={<PricingPage />} path="/pricing" />
      <Route element={<BlogPage />} path="/blog" />
      <Route element={<AboutPage />} path="/about" />
      <Route element={<PhysicsEngine />} path="/engines/physics" />
      <Route element={<BiologyEngine />} path="/engines/biology" />
      <Route element={<ChemistryEngine />} path="/engines/chemistry" />
    </Routes>
  );
}

export default App;
