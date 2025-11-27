import React from "react";
import {
  BoardState,
  Move,
  MoveTarget,
  PLAYER_HUMAN,
  PLAYER_AI,
  GAME_ONGOING,
  CELL_SIZE,
} from "../constants";
import { getBoardMoveKey } from "../utils";

interface BoardProps {
  board: BoardState;
  selectedPiece: { row: number; col: number; validMoves: MoveTarget[] } | null;
  currentPlayer: string | null;
  gameStatus: string;
  onCellClick: (row: number, col: number) => void;
  aiPossibleMoves: Move[];
  aiLearningState: Record<string, boolean>;
}

export const Board: React.FC<BoardProps> = ({
  board,
  selectedPiece,
  currentPlayer,
  gameStatus,
  onCellClick,
  aiPossibleMoves,
  aiLearningState,
}) => {
  const renderCell = (row: number, col: number) => {
    const piece = board[row][col];
    const isPlayerSelected =
      selectedPiece?.row === row && selectedPiece?.col === col;
    const isPlayerTarget = selectedPiece?.validMoves.some(
      (move) => move.row === row && move.col === col
    );
    let cellClass =
      "relative flex items-center justify-center w-20 h-20 border ";
    cellClass +=
      (row + col) % 2 === 0
        ? "bg-amber-200 border-amber-400"
        : "bg-amber-100 border-amber-300";
    if (isPlayerSelected) cellClass += " border-blue-500 border-4 ";
    else if (isPlayerTarget) cellClass += " border-sky-400 border-4 ";
    else cellClass += " border-2 ";
    const isClickable =
      gameStatus === GAME_ONGOING &&
      currentPlayer === PLAYER_HUMAN &&
      (piece === PLAYER_HUMAN || isPlayerTarget);
    cellClass += isClickable ? " cursor-pointer" : " cursor-default";
    return (
      <div
        key={`${row}-${col}`}
        className={cellClass}
        onClick={() => onCellClick(row, col)}
      >
        {piece && (
          <span
            className={`text-5xl ${
              piece === PLAYER_HUMAN ? "text-white" : "text-black"
            }`}
            style={
              piece === PLAYER_HUMAN
                ? {
                    WebkitTextStroke: "2.3px black",
                    paintOrder: "stroke fill",
                    textShadow: "1px 1px 2px rgba(0,0,0,1)",
                  }
                : {}
            }
          >
            {piece === PLAYER_HUMAN ? "♙" : "♟︎"}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center mb-1">
      {/* Rank Numbers */}
      <div className="flex flex-col justify-around text-gray-500 font-medium mr-2 self-stretch">
        {[3, 2, 1].map((num) => (
          <div key={num} className="h-20 flex items-center justify-center">
            {num}
          </div>
        ))}
      </div>
      {/* Board Grid & Overlay */}
      <div className="relative">
        <div className="border-4 border-amber-800 bg-amber-800 rounded shadow-lg overflow-hidden">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
            </div>
          ))}
        </div>
        {/* Render arrows only when it's AI's turn and game is ongoing */}
        {currentPlayer === PLAYER_AI && gameStatus === GAME_ONGOING && (
          <RenderArrowsOverlay
            moves={aiPossibleMoves}
            board={board}
            learningState={aiLearningState}
            cellSize={CELL_SIZE}
          />
        )}
      </div>
    </div>
  );
};

// --- Helper Arrow Component ---
interface RenderArrowsOverlayProps {
  moves: Move[];
  board: BoardState;
  learningState: Record<string, boolean>;
  cellSize: number;
}

const RenderArrowsOverlay: React.FC<RenderArrowsOverlayProps> = ({
  moves,
  board,
  learningState,
  cellSize,
}) => {
  if (!moves || moves.length === 0) {
    return null;
  }
  const arrowColorGood = "#22c55e"; // Tailwind green-500
  const arrowColorBad = "#6b7280"; // Tailwind gray-500

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10,
      }}
      viewBox={`0 0 ${cellSize * 3} ${cellSize * 3}`}
    >
      <defs>
        <marker
          id="arrowhead-good"
          markerWidth="5"
          markerHeight="3.5"
          refX="1"
          refY="1.75"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 5 1.75, 0 3.5" fill={arrowColorGood} />
        </marker>
        <marker
          id="arrowhead-bad"
          markerWidth="5"
          markerHeight="3.5"
          refX="1"
          refY="1.75"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 5 1.75, 0 3.5" fill={arrowColorBad} />
        </marker>
      </defs>
      {moves.map((move) => {
        const moveKey = getBoardMoveKey(board, move);
        const isLearnedBad = learningState[moveKey];
        const color = isLearnedBad ? arrowColorBad : arrowColorGood;
        const markerId = isLearnedBad
          ? "url(#arrowhead-bad)"
          : "url(#arrowhead-good)";

        const fromCenterX = move.from.col * cellSize + cellSize / 2;
        const fromCenterY = move.from.row * cellSize + cellSize / 2;
        const toCenterX = move.to.col * cellSize + cellSize / 2;
        const toCenterY = move.to.row * cellSize + cellSize / 2;

        const angle = Math.atan2(
          toCenterY - fromCenterY,
          toCenterX - fromCenterX
        );
        const shortAmount = 10; // Slightly increased for bigger cells
        const adjustedToX = toCenterX - shortAmount * Math.cos(angle);
        const adjustedToY = toCenterY - shortAmount * Math.sin(angle);

        return (
          <line
            key={moveKey}
            x1={fromCenterX}
            y1={fromCenterY}
            x2={adjustedToX}
            y2={adjustedToY}
            stroke={color}
            strokeWidth="4" // Thicker arrows for bigger board
            markerEnd={markerId}
            opacity={0.85}
          />
        );
      })}
    </svg>
  );
};