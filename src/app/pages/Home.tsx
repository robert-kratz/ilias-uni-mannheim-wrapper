import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home(): React.ReactElement {
  const navigate = useNavigate();

  const goSettings = () => {
    navigate("/settings");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center mx-10">
        <h1 className="text-4xl font-bold text-gray-800">🚀 Ilias Ultimate</h1>
        <button
          className="mt-4 px-4 py-2 text-white bg-blue-500 rounded-md"
          onClick={goSettings}
        >
          Go to Settings
        </button>
      </div>
    </div>
  );
}
