# Hexapawn AI

A React-based implementation of **Hexapawn**, a simple chess variant played on a 3x3 board, featuring a Reinforcement Learning AI that learns from its mistakes.

## 🎮 How to Play

Hexapawn is played on a 3x3 board with 3 pawns for each player.
*   **White (You)**: Starts on the bottom row.
*   **Black (AI)**: Starts on the top row.

### Rules
1.  **Movement**: Pawns move forward one square to an empty space.
2.  **Capturing**: Pawns capture diagonally forward (like Chess).
3.  **Winning**: You win if:
    *   One of your pawns reaches the opposite side of the board.
    *   You capture all enemy pawns.
    *   The opponent has no legal moves left.

## 🧠 The AI (How it Learns)

The AI starts with no strategic knowledge other than the rules of the game and a basic opening book. It learns through a process similar to the classic **MENACE** (Matchbox Educable Noughts and Crosses Engine) experiment.

1.  **Visualization**: When it's the AI's turn, it displays arrows for all possible moves.
    *   🟢 **Green Arrow**: A valid move that hasn't led to a loss *yet*.
    *   ⚪ **Grey Arrow**: A move that the AI has learned leads to a loss from the current position.
2.  **Selection**: The AI randomly selects a green arrow. If only grey arrows are available (meaning all moves lead to a loss), it is forced to resign/lose, but continues to play randomly.
3.  **Punishment**: If the AI makes a move and the Human wins immediately (or the AI gets stuck), the AI remembers the specific board state and the move it made. In future games, that specific move will be marked as "Bad" (Grey) for that specific board arrangement.

Over time, the AI prunes away all losing variations until it becomes unbeatable (perfect play).

### Features
*   **Interactive UI**: Click to move, visual indicators for selected pieces and valid moves.
*   **Visual Debugging**: See exactly what the AI is "thinking" via the colored arrows.
*   **Persistence**: The AI's memory persists between games (until you click "Reset All").
*   **Opening Book**: The AI has hardcoded opening responses to demonstrate specific learning scenarios, provided those moves haven't been proven bad yet.

## 🛠️ Tech Stack

*   **React** (TypeScript)
*   **Tailwind CSS** for styling
*   **Vite** (implied build tool)

## ⚠️ Disclaimer

**Vibecoded by Egemen Okte using Claude and Gemini**
