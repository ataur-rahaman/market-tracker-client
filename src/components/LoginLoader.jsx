import React from "react";
import { FaSpinner } from "react-icons/fa";

const LoginLoader = () => {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <FaSpinner className="animate-spin text-blue-500 text-5xl mb-4" />

        <p className="text-lg font-medium text-gray-600">
          trying to login...
        </p>

        <progress className="progress progress-primary w-56 mt-4"></progress>
      </div>
    </div>
  );
};

export default LoginLoader;
