import React from "react";

import { cn } from "@/lib/utils";

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
  enableHorizontalScroll?: boolean;
}

export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  className = "",
  mobileClassName = "",
  tabletClassName = "",
  desktopClassName = "",
  enableHorizontalScroll = false,
}) => {
  const baseClasses = cn(
    "w-full",
    enableHorizontalScroll && "overflow-x-auto",
    className,
  );

  const responsiveClasses = cn(
    // Mobile classes (< 768px)
    `sm:max-md:${mobileClassName}`,
    // Tablet classes (768px - 1024px)
    `md:max-lg:${tabletClassName}`,
    // Desktop classes (> 1024px)
    `lg:${desktopClassName}`,
  );

  return (
    <div
      className={cn(baseClasses, responsiveClasses)}
      style={{
        WebkitOverflowScrolling: "touch",
        overscrollBehavior: "contain",
      }}
    >
      {children}
    </div>
  );
};

export default ResponsiveWrapper;
