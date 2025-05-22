import React from "react";

const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-600 dark:border-emerald-500" />
  </div>
);

export default LoadingSpinner;
