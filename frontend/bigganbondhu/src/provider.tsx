import type { NavigateOptions } from "react-router-dom";

import { HeroUIProvider } from "@heroui/system";
import { useTheme } from "@heroui/use-theme";
import { useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { useHref, useNavigate } from "react-router-dom";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

// Detect touch device
const isTouchDevice = () => {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Choose appropriate backend based on device
  const backend = isTouchDevice() ? TouchBackend : HTML5Backend;

  useEffect(() => {
    if (typeof document !== "undefined") {
      const html = document.documentElement;
      if (theme === "dark") {
        html.classList.add("dark");
      } else {
        html.classList.remove("dark");
      }
    }
  }, [theme]);

  return (
    <DndProvider backend={backend}>
      <HeroUIProvider navigate={navigate} useHref={useHref}>
        {children}
      </HeroUIProvider>
    </DndProvider>
  );
}
