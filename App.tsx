import React, { useState, useEffect, useRef } from "react";
import {
  BoardState,
  Move,
  MoveTarget,
  PLAYER_HUMAN,
  PLAYER_AI,
  GAME_ONGOING,
  GAME_WHITE_WON,
  GAME_BLACK_WON,
} from "./constants";
import {
  getValidMoves,
  getAllPossibleMoves,
  getBoardMoveKey,
  checkGameStatus,
} from "./utils";

import { Header } from "./components/Header";
import { Board } from "./components/Board";
import { Controls } from "./components/Controls";
import { InfoPanel } from "./components/InfoPanel";
import { StatusMessage } from "./components/StatusMessage";

const initialBoard: BoardState = [
  [PLAYER_AI, PLAYER_AI, PLAYER_AI],
  [null, null, null],
  [PLAYER_HUMAN, PLAYER_HUMAN, PLAYER_HUMAN],
];

const HexapawnGame = () => {
  // --- State ---
  const [board, setBoard] = useState<BoardState>(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState<{
    row: number;
    col: number;
    validMoves: MoveTarget[];
  } | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(PLAYER_HUMAN);
  const [gameStatus, setGameStatus] = useState(GAME_ONGOING);
  const [message, setMessage] = useState("Your turn! White moves first.");
  const [aiPossibleMoves, setAiPossibleMoves] = useState<Move[]>([]);
  const [aiLearningState, setAiLearningState] = useState<
    Record<string, boolean>
  >({});
  const [aiScore, setAiScore] = useState(0);

  // --- Refs for Learning State ---
  const boardStateBeforeAIMoveRef = useRef<BoardState | null>(null);
  const lastAIMoveRef = useRef<Move | null>(null);
  const lastPlayerMovedRef = useRef<string | null>(null);

  // --- Effect to Prepare AI Turn ---
  useEffect(() => {
    if (currentPlayer !== PLAYER_AI || gameStatus !== GAME_ONGOING) {
      if (aiPossibleMoves.length > 0) setAiPossibleMoves([]);
      return;
    }
    const possibleMoves = getAllPossibleMoves(board, PLAYER_AI);
    if (possibleMoves.length === 0) {
      console.error("AI TURN SAFEGUARD: No moves found! White wins.");
      setGameStatus(GAME_WHITE_WON);
      setMessage("Error: AI has no moves! You win!");
      setCurrentPlayer(null);
    } else {
      setAiPossibleMoves(possibleMoves);
      setMessage("AI's turn. Arrows show potential moves. Click 'Move AI'.");
    }
  }, [currentPlayer, gameStatus, board, aiPossibleMoves.length]);

  // --- Core Game Logic ---
  const updateGameState = (newBoard: BoardState, playerWhoJustMoved: string) => {
    const previousMover = lastPlayerMovedRef.current;
    const newStatus = checkGameStatus(newBoard, playerWhoJustMoved);
    setGameStatus(newStatus);
    
    if (newStatus === GAME_WHITE_WON) {
      setMessage("You win!");
      setAiScore((prev) => prev - 1);
      const boardBeforeAI = boardStateBeforeAIMoveRef.current;
      const lastMoveByAI = lastAIMoveRef.current;
      
      if (
        playerWhoJustMoved === PLAYER_HUMAN &&
        previousMover === PLAYER_AI &&
        lastMoveByAI &&
        boardBeforeAI
      ) {
        const losingMoveKey = getBoardMoveKey(boardBeforeAI, lastMoveByAI);
        if (!aiLearningState[losingMoveKey]) {
          setAiLearningState((prev) => ({ ...prev, [losingMoveKey]: true }));
        }
      }
      setCurrentPlayer(null);
    } else if (newStatus === GAME_BLACK_WON) {
      setMessage("AI wins!");
      setAiScore((prev) => prev + 1);
      setCurrentPlayer(null);
    } else {
      const nextPlayer =
        playerWhoJustMoved === PLAYER_HUMAN ? PLAYER_AI : PLAYER_HUMAN;
      setCurrentPlayer(nextPlayer);
      if (nextPlayer === PLAYER_HUMAN) setMessage("Your turn! Select a pawn.");
    }
    lastPlayerMovedRef.current = playerWhoJustMoved;
  };

  // --- Player Interaction ---
  const handleCellClick = (row: number, col: number) => {
    if (gameStatus !== GAME_ONGOING || currentPlayer !== PLAYER_HUMAN) return;
    
    if (!selectedPiece) {
      if (board[row][col] === PLAYER_HUMAN) {
        const validMoves = getValidMoves(board, row, col, PLAYER_HUMAN);
        if (validMoves.length > 0) setSelectedPiece({ row, col, validMoves });
        setMessage(
          validMoves.length > 0
            ? "Selected. Choose destination."
            : "Pawn has no moves."
        );
      }
    } else {
      const { row: fromRow, col: fromCol, validMoves } = selectedPiece;
      const isDestination = row === fromRow && col === fromCol;
      const isValidTarget = validMoves.some(
        (move) => move.row === row && move.col === col
      );
      if (isDestination) {
        setSelectedPiece(null);
        setMessage("Selection cancelled.");
      } else if (isValidTarget) {
        const newBoard = board.map((bRow) => [...bRow]);
        newBoard[row][col] = PLAYER_HUMAN;
        newBoard[fromRow][fromCol] = null;
        setBoard(newBoard);
        setSelectedPiece(null);
        updateGameState(newBoard, PLAYER_HUMAN);
      } else if (board[row][col] === PLAYER_HUMAN) {
        const newValidMoves = getValidMoves(board, row, col, PLAYER_HUMAN);
        if (newValidMoves.length > 0)
          setSelectedPiece({ row, col, validMoves: newValidMoves });
        else setSelectedPiece(null);
        setMessage(
          newValidMoves.length > 0
            ? "Selected different pawn."
            : "New pawn has no moves."
        );
      } else {
        setMessage("Invalid move destination.");
      }
    }
  };

  // --- AI Move Execution ---
  const handleAIMoveClick = () => {
    if (
      currentPlayer !== PLAYER_AI ||
      gameStatus !== GAME_ONGOING ||
      !aiPossibleMoves ||
      aiPossibleMoves.length === 0
    ) {
      return;
    }
    let chosenMove: Move | null = null;
    
    // Check for demo forced move (Opening Book)
    const blackPawns: number[] = [];
    board.forEach((row, rIdx) =>
      row.forEach((cell, cIdx) => {
        if (cell === PLAYER_AI) blackPawns.push(rIdx);
      })
    );
    // Strict first move check: All AI pawns must be at home (row 0)
    const isAIFirstMoveStrict = blackPawns.every((r) => r === 0);
    
    if (isAIFirstMoveStrict) {
      // Logic: 
      // 1. If Human played Left (a1-a2 / (2,0)->(1,0)), AI plays Right (c3-c2 / (0,2)->(1,2)).
      // 2. Otherwise (Human played Center or Right), AI plays Center (b3-b2 / (0,1)->(1,1)).
      const humanMovedLeft = board[1][0] === PLAYER_HUMAN && board[2][0] === null;
      
      let forcedMoveTarget: Move = {
        from: { row: 0, col: 1 }, // b3
        to: { row: 1, col: 1 },   // b2
      };

      if (humanMovedLeft) {
         forcedMoveTarget = {
            from: { row: 0, col: 2 }, // c3
            to: { row: 1, col: 2 },   // c2
         };
      }

      const isForcedMoveValid = aiPossibleMoves.some(
        (m) =>
          m.from.row === forcedMoveTarget.from.row &&
          m.from.col === forcedMoveTarget.from.col &&
          m.to.row === forcedMoveTarget.to.row &&
          m.to.col === forcedMoveTarget.to.col
      );
      
      const moveKey = getBoardMoveKey(board, forcedMoveTarget);
      const isLearnedBad = aiLearningState[moveKey];

      // Only play built-in move if it hasn't been learned as bad
      if (isForcedMoveValid && !isLearnedBad) {
        chosenMove = forcedMoveTarget;
      }
    }
    
    // Fallback to Learning/Random logic if no opening book move applied
    if (!chosenMove) {
      const allowedMoves: Move[] = [];
      const learnedBadMoves: Move[] = [];
      aiPossibleMoves.forEach((move) => {
        const moveKey = getBoardMoveKey(board, move);
        if (aiLearningState[moveKey]) {
          learnedBadMoves.push(move);
        } else {
          allowedMoves.push(move);
        }
      });
      
      if (allowedMoves.length > 0) {
        const idx = Math.floor(Math.random() * allowedMoves.length);
        chosenMove = allowedMoves[idx];
      } else if (learnedBadMoves.length > 0) {
        const idx = Math.floor(Math.random() * learnedBadMoves.length);
        chosenMove = learnedBadMoves[idx];
      } else {
        setMessage("Error: AI cannot move!");
        return;
      }
    }
    
    if (chosenMove) {
      boardStateBeforeAIMoveRef.current = board.map((row) => [...row]);
      lastAIMoveRef.current = chosenMove;
      const newBoard = board.map((row) => [...row]);
      newBoard[chosenMove.to.row][chosenMove.to.col] = PLAYER_AI;
      newBoard[chosenMove.from.row][chosenMove.from.col] = null;
      setBoard(newBoard);
      updateGameState(newBoard, PLAYER_AI);
    }
  };

  const resetGame = (clearLearning = false) => {
    setBoard(initialBoard);
    setSelectedPiece(null);
    setCurrentPlayer(PLAYER_HUMAN);
    setGameStatus(GAME_ONGOING);
    setAiPossibleMoves([]);
    lastAIMoveRef.current = null;
    boardStateBeforeAIMoveRef.current = null;
    lastPlayerMovedRef.current = null;
    if (clearLearning) {
      setAiLearningState({});
      setAiScore(0);
      setMessage("Game and AI Learning Reset. Your turn!");
    } else {
      setMessage("Game Reset (AI keeps memory & score). Your turn!");
    }
  };

  return (
    <div className="flex flex-col items-center p-4 font-sans min-h-screen bg-slate-100 text-slate-900">
      <Header />
      
      <StatusMessage 
        message={message} 
        gameStatus={gameStatus} 
        currentPlayer={currentPlayer}
      />

      <Board 
        board={board}
        selectedPiece={selectedPiece}
        currentPlayer={currentPlayer}
        gameStatus={gameStatus}
        onCellClick={handleCellClick}
        aiPossibleMoves={aiPossibleMoves}
        aiLearningState={aiLearningState}
      />

      <div className="flex mt-1 mb-1 w-[240px] justify-around text-gray-500 font-medium ml-4">
        {["a", "b", "c"].map((char) => (
          <div key={char} className="w-20 text-center">
            {char}
          </div>
        ))}
      </div>

      <Controls 
        currentPlayer={currentPlayer}
        gameStatus={gameStatus}
        aiPossibleMoves={aiPossibleMoves}
        onAiMove={handleAIMoveClick}
        onReset={resetGame}
      />

      <InfoPanel 
        aiScore={aiScore}
      />

      <footer className="mt-8 mb-2 text-xs text-slate-500 text-center">
        Vibecoded by Egemen Okte using Claude and Gemini
      </footer>
    </div>
  );
};

export default HexapawnGame;