export const PLAYER_HUMAN = "W"; // White Pawn Unicode: ♙
export const PLAYER_AI = "B"; // Black Pawn Unicode: ♟︎
export const GAME_ONGOING = "ongoing";
export const GAME_WHITE_WON = "white-won";
export const GAME_BLACK_WON = "black-won";
export const CELL_SIZE = 80;

export type BoardState = (string | null)[][];
export type Position = { row: number; col: number };
export type Move = { from: Position; to: Position };
export type MoveTarget = { row: number; col: number };