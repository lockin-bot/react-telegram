/// <reference types="@react-telegram/core" />
import React, { useState, useEffect, useRef } from "react";
import { MtcuteAdapter } from "@react-telegram/mtcute-adapter";

// Tetris constants
const BOARD_WIDTH = 15;
const BOARD_HEIGHT = 15;
const TICK_SPEED = 2000; // milliseconds (2 seconds)

// Piece definitions (7 tetrominos)
const PIECES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: '🟦'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '🟨'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '🟪'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: '🟩'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: '🟥'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '🟦'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '🟧'
  }
};

type PieceType = keyof typeof PIECES;
type Board = (string | null)[][];

interface GameState {
  board: Board;
  currentPiece: {
    type: PieceType;
    x: number;
    y: number;
    rotation: number;
  } | null;
  nextPiece: PieceType;
  score: number;
  lines: number;
  level: number;
  gameOver: boolean;
  paused: boolean;
}

const createEmptyBoard = (): Board => {
  return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));
};

const getRandomPiece = (): PieceType => {
  const pieces = Object.keys(PIECES) as PieceType[];
  return pieces[Math.floor(Math.random() * pieces.length)];
};

const rotatePiece = (shape: number[][]): number[][] => {
  const n = shape.length;
  const rotated = Array(n).fill(null).map(() => Array(n).fill(0));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      rotated[j][n - 1 - i] = shape[i][j];
    }
  }
  
  return rotated;
};

const getPieceShape = (type: PieceType, rotation: number): number[][] => {
  let shape = PIECES[type].shape;
  for (let i = 0; i < rotation; i++) {
    shape = rotatePiece(shape);
  }
  return shape;
};

const isValidMove = (board: Board, piece: GameState['currentPiece'], dx = 0, dy = 0, newRotation?: number): boolean => {
  if (!piece) return false;
  
  const rotation = newRotation !== undefined ? newRotation : piece.rotation;
  const shape = getPieceShape(piece.type, rotation);
  const newX = piece.x + dx;
  const newY = piece.y + dy;
  
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const boardX = newX + x;
        const boardY = newY + y;
        
        if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
          return false;
        }
        
        if (boardY >= 0 && board[boardY][boardX]) {
          return false;
        }
      }
    }
  }
  
  return true;
};

const placePiece = (board: Board, piece: GameState['currentPiece']): Board => {
  if (!piece) return board;
  
  const newBoard = board.map(row => [...row]);
  const shape = getPieceShape(piece.type, piece.rotation);
  const color = PIECES[piece.type].color;
  
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] && piece.y + y >= 0) {
        newBoard[piece.y + y][piece.x + x] = color;
      }
    }
  }
  
  return newBoard;
};

const clearLines = (board: Board): { board: Board; linesCleared: number } => {
  const newBoard = board.filter(row => row.some(cell => !cell));
  const linesCleared = BOARD_HEIGHT - newBoard.length;
  
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(null));
  }
  
  return { board: newBoard, linesCleared };
};

const TetrisGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: getRandomPiece(),
    score: 0,
    lines: 0,
    level: 1,
    gameOver: false,
    paused: false
  });
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize game
  useEffect(() => {
    if (!gameState.currentPiece && !gameState.gameOver) {
      spawnNewPiece();
    }
  }, [gameState.currentPiece, gameState.gameOver]);
  
  // Game loop
  useEffect(() => {
    if (gameState.gameOver || gameState.paused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }
    
    if (gameState.currentPiece) {
      gameLoopRef.current = setInterval(() => {
        movePiece(0, 1);
      }, TICK_SPEED);
    }
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.currentPiece, gameState.gameOver, gameState.paused]);
  
  const spawnNewPiece = () => {
    const newPiece = {
      type: gameState.nextPiece,
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 0,
      rotation: 0
    };
    
    if (!isValidMove(gameState.board, newPiece)) {
      setGameState(prev => ({ ...prev, gameOver: true }));
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      currentPiece: newPiece,
      nextPiece: getRandomPiece()
    }));
  };
  
  const movePiece = (dx: number, dy: number) => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.gameOver) return prev;
      
      if (isValidMove(prev.board, prev.currentPiece, dx, dy)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            x: prev.currentPiece.x + dx,
            y: prev.currentPiece.y + dy
          }
        };
      } else if (dy > 0) {
        // Piece can't move down, place it
        const boardWithPiece = placePiece(prev.board, prev.currentPiece);
        const { board: clearedBoard, linesCleared } = clearLines(boardWithPiece);
        
        const newScore = prev.score + linesCleared * 100 * prev.level + 10;
        const newLines = prev.lines + linesCleared;
        const newLevel = Math.floor(newLines / 10) + 1;
        
        return {
          ...prev,
          board: clearedBoard,
          currentPiece: null,
          score: newScore,
          lines: newLines,
          level: newLevel
        };
      }
      
      return prev;
    });
  };
  
  const rotatePieceAction = () => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.gameOver) return prev;
      
      const newRotation = (prev.currentPiece.rotation + 1) % 4;
      if (isValidMove(prev.board, prev.currentPiece, 0, 0, newRotation)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            rotation: newRotation
          }
        };
      }
      
      return prev;
    });
  };
  
  const dropPiece = () => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.gameOver) return prev;
      
      let dropDistance = 0;
      while (isValidMove(prev.board, prev.currentPiece, 0, dropDistance + 1)) {
        dropDistance++;
      }
      
      return {
        ...prev,
        currentPiece: {
          ...prev.currentPiece,
          y: prev.currentPiece.y + dropDistance
        }
      };
    });
  };
  
  const togglePause = () => {
    setGameState(prev => ({ ...prev, paused: !prev.paused }));
  };
  
  const resetGame = () => {
    setGameState({
      board: createEmptyBoard(),
      currentPiece: null,
      nextPiece: getRandomPiece(),
      score: 0,
      lines: 0,
      level: 1,
      gameOver: false,
      paused: false
    });
  };
  
  // Render the board with current piece
  const renderBoard = () => {
    const displayBoard = gameState.board.map(row => [...row]);
    
    if (gameState.currentPiece && !gameState.gameOver) {
      const shape = getPieceShape(gameState.currentPiece.type, gameState.currentPiece.rotation);
      const color = PIECES[gameState.currentPiece.type].color;
      
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const boardY = gameState.currentPiece.y + y;
            const boardX = gameState.currentPiece.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = color;
            }
          }
        }
      }
    }
    
    return displayBoard.map(row => 
      row.map(cell => cell || '⬛').join('')
    ).join('\n');
  };
  
  return (
    <>
      <b>🎮 Tetris</b>
      <br />
      <br />
      <code>{renderBoard()}</code>
      <br />
      <br />
      <b>Score:</b> {gameState.score} | <b>Lines:</b> {gameState.lines} | <b>Level:</b> {gameState.level}
      <br />
      <b>Next:</b> {PIECES[gameState.nextPiece].color}
      <br />
      <br />
      {gameState.gameOver ? (
        <>
          <b>🎮 GAME OVER! 🎮</b>
          <br />
          <br />
          <row>
            <button onClick={resetGame}>🔄 New Game</button>
          </row>
        </>
      ) : (
        <>
          <row>
            <button onClick={() => movePiece(-1, 0)}>⬅️</button>
            <button onClick={() => movePiece(1, 0)}>➡️</button>
            <button onClick={rotatePieceAction}>🔄</button>
            <button onClick={dropPiece}>⬇️</button>
          </row>
          <row>
            <button onClick={togglePause}>
              {gameState.paused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
            <button onClick={resetGame}>🔄 New Game</button>
          </row>
        </>
      )}
    </>
  );
};

// Main bot setup
async function main() {
  const config = {
    apiId: parseInt(process.env.API_ID || '0'),
    apiHash: process.env.API_HASH || '',
    botToken: process.env.BOT_TOKEN || '',
    storage: process.env.STORAGE_PATH || '.mtcute'
  };
  
  if (!config.apiId || !config.apiHash || !config.botToken) {
    console.error('Please set API_ID, API_HASH, and BOT_TOKEN environment variables');
    process.exit(1);
  }
  
  const adapter = new MtcuteAdapter(config);
  
  // Set up command handlers
  adapter.onCommand('start', () => <TetrisGame />);
  adapter.onCommand('tetris', () => <TetrisGame />);
  
  // Start the bot
  await adapter.start(config.botToken);
  
  console.log('Tetris bot is running! Send /tetris to play.');
}

// Run the bot
main().catch(console.error);