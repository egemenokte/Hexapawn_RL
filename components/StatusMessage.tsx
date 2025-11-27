import React from "react";
import { GAME_WHITE_WON, GAME_BLACK_WON, PLAYER_HUMAN, PLAYER_AI } from "../constants";

interface StatusMessageProps {
  message: string;
  gameStatus: string;
  currentPlayer: string | null;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  message,
  gameStatus,
  currentPlayer,
}) => {
  const getStatusColor = () => {
    if (gameStatus === GAME_WHITE_WON) return "text-green-600";
    if (gameStatus === GAME_BLACK_WON) return "text-red-600";
    if (currentPlayer === PLAYER_HUMAN) return "text-blue-600";
    if (currentPlayer === PLAYER_AI) return "text-purple-600";
    return "text-gray-700";
  };

  return (
    <div
      className={`mb-3 text-lg font-semibold h-8 flex items-center justify-center ${getStatusColor()}`}
    >
      {message}
    </div>
  );
};