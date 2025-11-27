import {
  BoardState,
  Move,
  MoveTarget,
  PLAYER_HUMAN,
  PLAYER_AI,
  GAME_WHITE_WON,
  GAME_BLACK_WON,
  GAME_ONGOING,
} from "./constants";

export const getValidMoves = (
  board: BoardState,
  row: number,
  col: number,
  player: string
): MoveTarget[] => {
  const moves: MoveTarget[] = [];
  const direction = player === PLAYER_HUMAN ? -1 : 1;
  const newRow = row + direction;
  if (newRow < 0 || newRow >= 3) return moves;
  if (board[newRow]?.[col] === null) moves.push({ row: newRow, col });
  for (const offset of [-1, 1]) {
    const newCol = col + offset;
    if (newCol < 0 || newCol >= 3) continue;
    if (board[newRow]?.[newCol] !== null && board[newRow]?.[newCol] !== player)
      moves.push({ row: newRow, col: newCol });
  }
  return moves;
};

export const getAllPossibleMoves = (
  currentBoard: BoardState,
  player: string
): Move[] => {
  const possibleMoves: Move[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (currentBoard[row][col] === player) {
        const validMoves = getValidMoves(currentBoard, row, col, player);
        validMoves.forEach((move) => {
          possibleMoves.push({ from: { row, col }, to: move });
        });
      }
    }
  }
  return possibleMoves;
};

export const hasLegalMoves = (board: BoardState, player: string) => {
  return getAllPossibleMoves(board, player).length > 0;
};

export const getBoardMoveKey = (boardState: BoardState, move: Move) => {
  const boardString = boardState
    .map((row) => row.map((cell) => cell || "-").join(""))
    .join("|");
  return `${boardString}_${move.from.row},${move.from.col}-${move.to.row},${move.to.col}`;
};

export const checkGameStatus = (
  newBoard: BoardState,
  playerWhoMoved: string
) => {
  if (playerWhoMoved === PLAYER_HUMAN && newBoard[0].includes(PLAYER_HUMAN))
    return GAME_WHITE_WON;
  if (playerWhoMoved === PLAYER_AI && newBoard[2].includes(PLAYER_AI))
    return GAME_BLACK_WON;
  const whiteExists = newBoard.flat().includes(PLAYER_HUMAN);
  const blackExists = newBoard.flat().includes(PLAYER_AI);
  if (!blackExists) return GAME_WHITE_WON;
  if (!whiteExists) return GAME_BLACK_WON;
  const opponentPlayer =
    playerWhoMoved === PLAYER_HUMAN ? PLAYER_AI : PLAYER_HUMAN;
  if (!hasLegalMoves(newBoard, opponentPlayer)) {
    return playerWhoMoved === PLAYER_HUMAN ? GAME_WHITE_WON : GAME_BLACK_WON;
  }
  return GAME_ONGOING;
};
