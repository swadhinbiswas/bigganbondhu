import React from "react";

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="bg-white dark:bg-gray-900 border border-red-400 dark:border-red-600 text-gray-700 dark:text-gray-200 px-6 py-4 rounded-lg shadow-lg">
      <p className="font-bold text-red-600 dark:text-red-400 text-lg">Error</p>
      <p className="my-2">{message}</p>
      <p className="mt-3 text-gray-600 dark:text-gray-400">
        Please make sure the backend server is running at http://localhost:8000
      </p>
    </div>
  </div>
);

export default ErrorMessage;
