import React from "react";

export const Header: React.FC = () => {
  return (
    <div className="relative w-full flex items-center justify-center mb-2 py-1 px-4">
      {/* Title Group */}
      <div className="text-center z-0 border border-slate-200 rounded-xl p-6 bg-white shadow-md max-w-lg w-full">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-600 tracking-tight">
          Hexapawn AI
        </h1>
        <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">
          "AI" learns by playing.
          <br />
          Arrows show moves (Green=Good, Grey=Learned Bad).
        </p>
      </div>
    </div>
  );
};