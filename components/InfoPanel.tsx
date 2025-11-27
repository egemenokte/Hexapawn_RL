import React from "react";

interface InfoPanelProps {
  aiScore: number;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ aiScore }) => {
  return (
    <div className="flex flex-col items-center w-full max-w-md mt-4">
      {/* AI Score Display */}
      <div className="w-full p-4 bg-white rounded text-lg shadow text-center mb-4 border border-slate-200">
        <span className="font-semibold text-slate-800">AI Cumulative Score: </span>
        <span
          className={`font-bold ${
            aiScore > 0
              ? "text-green-600"
              : aiScore < 0
              ? "text-red-600"
              : "text-gray-700"
          }`}
        >
          {aiScore > 0 ? `+${aiScore}` : aiScore}
        </span>
        <p className="text-xs text-gray-500 mt-1">
          (AI Wins - Player Wins across games since last 'Reset All')
        </p>
      </div>

      {/* Rules/Explanation */}
      <div className="w-full p-4 bg-white rounded text-sm shadow border border-slate-200">
        <h3 className="font-bold mb-2 text-slate-900">How to Play & AI Learning:</h3>
        <ul className="list-disc pl-5 space-y-1 text-slate-700">
          <li>
            Player: White (♙ - bottom), AI: Black (♟︎ - top). Regular chess pawn
            piece rules apply.
          </li>
          <li>
            Someone wins if they reach the end of board, capture all pieces, or
            opponent has no moves left.
          </li>
          <li>
            In AI's turn, arrows show potential moves. Click "Move AI" to make
            AI randomly select a green arrow (unless only grey are available).
          </li>
          <li>
            <span className="text-green-600 font-bold">Green Arrow</span>:
            Potential good move (not yet known to lead to loss).
          </li>
          <li>
            <span className="text-gray-500 font-bold">Grey Arrow</span>: Move AI
            learned previously led to defeat from this exact board state.
          </li>
          <li>
            If AI makes a move and the player wins immediately after, the AI
            "learns" by marking its last move from that board state as 'bad'
            (grey) for future games.
          </li>
          <li>
            Use "New Game" to reset the board but keep AI memory and score. Use
            "Reset All" to clear everything.
          </li>
        </ul>
      </div>
    </div>
  );
};