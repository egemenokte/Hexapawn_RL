import React from "react";
import { PLAYER_AI, GAME_ONGOING, Move } from "../constants";

interface ControlsProps {
  currentPlayer: string | null;
  gameStatus: string;
  aiPossibleMoves: Move[];
  onAiMove: () => void;
  onReset: (clearLearning: boolean) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  currentPlayer,
  gameStatus,
  aiPossibleMoves,
  onAiMove,
  onReset,
}) => {
  return (
    <>
      {/* AI Move Button */}
      <div className="h-16 flex items-center justify-center w-64 mb-4">
        {currentPlayer === PLAYER_AI && gameStatus === GAME_ONGOING && (
          <button
            onClick={onAiMove}
            className="px-5 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 shadow-md text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={!aiPossibleMoves || aiPossibleMoves.length === 0}
          >
            Move AI
          </button>
        )}
      </div>

      {/* Reset Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => onReset(false)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow transition-colors"
        >
          New Game (Keep Memory)
        </button>
        <button
          onClick={() => onReset(true)}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 shadow transition-colors"
        >
          Reset All (Clear Memory)
        </button>
      </div>
    </>
  );
};
