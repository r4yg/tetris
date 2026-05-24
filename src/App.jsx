import { useState, useEffect, useCallback, useRef } from 'react';
import Board from './components/Board';
import SidePanel from './components/SidePanel';
import GameOver from './components/GameOver';
import {
  createBoard,
  PIECE_COLORS,
  getRandomPieceFromBag,
  rotate,
  isValid,
  placePiece,
  clearLines,
  getGhostPosition,
} from './utils';
import {
  soundMove,
  soundRotate,
  soundDrop,
  soundHardDrop,
  soundLineClear,
  soundGameOver as playGameOver,
  soundLevelUp,
  soundCombo,
  resumeAudio,
} from './audioUtils';

const BASE_SPEED = 800;
const MIN_SPEED = 80;

function App() {
  const [board, setBoard] = useState(createBoard());
  const [current, setCurrent] = useState(null);
  const [nextPieces, setNextPieces] = useState([]);
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [flashRows, setFlashRows] = useState(new Set());
  const [isFlashing, setIsFlashing] = useState(false);
  const [boardShake, setBoardShake] = useState(false);
  const [dropFlash, setDropFlash] = useState(false);
  const [lockedCells, setLockedCells] = useState([]);
  const [scorePop, setScorePop] = useState(false);
  const [combo, setCombo] = useState(0);
  const [displayCombo, setDisplayCombo] = useState(null);
  const timeoutRef = useRef(null);
  const bagRef = useRef([]);

  const speed = Math.max(MIN_SPEED, BASE_SPEED - (level - 1) * 50);

  const startGame = useCallback(() => {
    resumeAudio();
    setBoard(createBoard());
    bagRef.current = [];
    const p1 = getRandomPieceFromBag(bagRef);
    const p2 = getRandomPieceFromBag(bagRef);
    const p3 = getRandomPieceFromBag(bagRef);
    setCurrent(p1);
    setNextPieces([p2, p3]);
    setScore(0);
    setDisplayScore(0);
    setLines(0);
    setLevel(1);
    setCombo(0);
    setDisplayCombo(null);
    setFlashRows(new Set());
    setLockedCells([]);
    setGameOver(false);
    setIsPaused(false);
    setIsStarted(true);
    setIsFlashing(false);
  }, []);

  const triggerShake = useCallback(() => {
    setBoardShake(true);
    setTimeout(() => setBoardShake(false), 300);
  }, []);

  const triggerDropFlash = useCallback(() => {
    setDropFlash(true);
    setTimeout(() => setDropFlash(false), 400);
  }, []);

  const triggerScorePop = useCallback(() => {
    setScorePop(true);
  }, []);

  useEffect(() => {
    const target = Math.min(score, displayScore + Math.abs(score - displayScore) * 0.15 + 10);
    if (displayScore < score) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayScore(Math.floor(target));
      const t = setTimeout(() => {}, 20);
      return () => clearTimeout(t);
    }
    if (displayScore > score) setDisplayScore(score);
  }, [score, displayScore]);

  const mergePiece = useCallback(
    (piece) => {
      const newBoard = placePiece(piece, board);
      setBoard(newBoard);

      const positions = piece.cells
        .map(([cx, cy]) => ({ x: piece.x + cx, y: piece.y + cy }))
        .filter((p) => p.y >= 0);
      setLockedCells(positions);
      setTimeout(() => setLockedCells([]), 300);

      return newBoard;
    },
    [board]
  );

  const mergeWithSound = useCallback(
    (piece) => {
      soundDrop();
      return mergePiece(piece);
    },
    [mergePiece]
  );

  const handleClearLines = useCallback(
    (boardState) => {
      const result = clearLines(boardState);
      if (result.linesCleared > 0) {
        setIsFlashing(true);
        setFlashRows(new Set(result.clearedRows));
        const newCombo = combo + 1;
        setCombo(newCombo);
        setDisplayCombo({ count: newCombo, lines: result.linesCleared });
        setTimeout(() => setDisplayCombo(null), 1500);

        triggerShake();
        soundLineClear(result.linesCleared);

        setTimeout(() => {
          setBoard(result.board);
          setIsFlashing(false);
          setFlashRows(new Set());
        }, 350);

        if (newCombo > 1) {
          soundCombo(newCombo);
        }
        const linePoints = [0, 100, 300, 500, 800];
        const basePts = linePoints[result.linesCleared] * level;
        const comboBonus = newCombo > 1 ? newCombo * 50 * level : 0;
        setScore((s) => s + basePts + comboBonus);
        setLines((l) => {
          const newTotal = l + result.linesCleared;
          const newLevel = Math.floor(newTotal / 10) + 1;
          if (newLevel > level) {
            soundLevelUp();
          }
          setLevel(newLevel);
          return newTotal;
        });
        triggerScorePop();
        return true;
      }
      return false;
    },
    [level, combo, triggerShake, triggerScorePop]
  );

  const spawnNext = useCallback(() => {
    setNextPieces((prev) => {
      if (prev.length === 0) return prev;
      const piece = prev[0];
      const remaining = prev.slice(1);
      const newPiece = getRandomPieceFromBag(bagRef);
      const updated = [...remaining, newPiece];
      if (!isValid(piece, board)) {
        playGameOver();
        setGameOver(true);
        setCurrent(piece);
      } else {
        setCurrent(piece);
      }
      return updated;
    });
  }, [board]);

  const tick = useCallback(() => {
    if (gameOver || isPaused || !isStarted || isFlashing) return;
    if (!current) return;
    const moved = { ...current, y: current.y + 1 };
    if (isValid(moved, board)) {
      setCurrent(moved);
      } else {
        handleClearLines(mergeWithSound(current));
        spawnNext();
      }
    }, [
    current,
    board,
    gameOver,
    isPaused,
    isStarted,
    isFlashing,
    mergeWithSound,
    handleClearLines,
    spawnNext,
  ]);

  useEffect(() => {
    if (gameOver || isPaused || !isStarted || isFlashing) return;
    timeoutRef.current = setTimeout(tick, speed);
    return () => clearTimeout(timeoutRef.current);
  }, [tick, gameOver, isPaused, isStarted, isFlashing, speed]);

  const move = useCallback(
    (dx, dy) => {
      if (!current || gameOver || isPaused || isFlashing) return;
      const moved = { ...current, x: current.x + dx, y: current.y + dy };
      if (isValid(moved, board)) {
        setCurrent(moved);
        soundMove();
        return true;
      }
      return false;
    },
    [current, board, gameOver, isPaused, isFlashing]
  );

  const hardDrop = useCallback(() => {
    if (!current || gameOver || isPaused || isFlashing) return;
    let dropped = { ...current };
    let dropDistance = 0;
    while (isValid({ ...dropped, y: dropped.y + 1 }, board)) {
      dropped.y++;
      dropDistance++;
    }
    setScore((s) => s + dropDistance * 2);
    soundHardDrop();
    triggerDropFlash();
    triggerShake();
    handleClearLines(mergePiece(dropped));
    spawnNext();
  }, [
    current,
    board,
    gameOver,
    isPaused,
    isFlashing,
    mergePiece,
    handleClearLines,
    spawnNext,
    triggerDropFlash,
    triggerShake,
  ]);

  const doRotate = useCallback(() => {
    if (!current || gameOver || isPaused || isFlashing) return;
    const rotated = rotate(current);
    if (isValid(rotated, board)) {
      setCurrent(rotated);
      soundRotate();
      return;
    }
    const kickCols = [-1, 1, -2, 2];
    const kickRows = [-1, 1];
    for (const kx of kickCols) {
      for (const ky of kickRows) {
        const kicked = { ...rotated, x: rotated.x + kx, y: rotated.y + ky };
        if (isValid(kicked, board)) {
          setCurrent(kicked);
          soundRotate();
          return;
        }
      }
    }
  }, [current, board, gameOver, isPaused, isFlashing]);

  const togglePause = useCallback(() => {
    if (!isStarted || gameOver) return;
    setIsPaused((p) => !p);
  }, [isStarted, gameOver]);

  useEffect(() => {
    const onKey = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'p' || e.key === 'P') {
        togglePause();
        return;
      }
      if (!isStarted || gameOver || isPaused || isFlashing) return;
      switch (e.key) {
        case 'ArrowLeft':
          move(-1, 0);
          break;
        case 'ArrowRight':
          move(1, 0);
          break;
        case 'ArrowDown':
          if (move(0, 1)) setScore((s) => s + 1);
          break;
        case 'ArrowUp':
          doRotate();
          break;
        case ' ':
          hardDrop();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move, doRotate, hardDrop, togglePause, isStarted, gameOver, isPaused, isFlashing]);

  const ghost = current ? getGhostPosition(current, board) : null;

  const isLockedCell = useCallback(
    (x, y) => lockedCells.some((p) => p.x === x && p.y === y),
    [lockedCells]
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>T E T R I S</h1>
      <div style={styles.gameArea}>
        <SidePanel
          nextPieces={nextPieces}
          score={displayScore}
          lines={lines}
          level={level}
          combo={combo}
          scorePop={scorePop}
          PIECE_COLORS={PIECE_COLORS}
          onStart={startGame}
          isStarted={isStarted}
        />
        <Board
          board={board}
          current={current}
          ghost={ghost}
          flashRows={flashRows}
          dropFlash={dropFlash}
          boardShake={boardShake}
          isLockedCell={isLockedCell}
          PIECE_COLORS={PIECE_COLORS}
        />
      </div>
      {isStarted && displayCombo && (
        <div style={styles.comboDisplay}>
          <span style={styles.comboText}>
            {displayCombo.count > 1 ? `${displayCombo.count}x COMBO!` : `${displayCombo.lines} LINE${displayCombo.lines > 1 ? 'S' : ''} CLEARED`}
          </span>
        </div>
      )}
      {gameOver && <GameOver score={displayScore} lines={lines} level={level} onStart={startGame} />}
      {isPaused && !gameOver && (
        <div style={styles.overlay}>
          <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: 8, color: '#ffd700' }}>
            PAUSED
          </h2>
          <button style={styles.overlayBtn} onClick={togglePause}>
            Resume
          </button>
        </div>
      )}
      {!isStarted && (
        <div style={styles.overlay}>
          <div style={{ fontSize: 14, letterSpacing: 6, color: '#8b949e', marginBottom: 8 }}>
            WELCOME TO
          </div>
          <h2 style={{ fontSize: 56, fontWeight: 900, letterSpacing: 12, background: 'linear-gradient(135deg, #ff6b6b, #ffd700, #00ff6b, #00ffff, #4488ff, #bf00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 24 }}>
            TETRIS
          </h2>
          <p style={{ color: '#8b949e', marginBottom: 8, fontSize: 13 }}>Arrow keys to move &middot; Space to hard drop</p>
          <button style={styles.overlayBtn} onClick={startGame}>
            START GAME
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    position: 'relative',
  },
  title: {
    fontSize: 42,
    fontWeight: 900,
    letterSpacing: 20,
    background: 'linear-gradient(90deg, #00ffff, #bf00ff, #ff4444, #ffff00, #00ff6b, #4488ff)',
    backgroundSize: '200% 200%',
    animation: 'titleGlow 3s ease-in-out infinite, bgShift 6s ease infinite',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  gameArea: {
    display: 'flex',
    gap: 24,
    alignItems: 'flex-start',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(13,17,23,0.95)',
    zIndex: 20,
    gap: 12,
    borderRadius: 16,
  },
  overlayBtn: {
    marginTop: 16,
    padding: '14px 56px',
    fontSize: 18,
    fontWeight: 700,
    border: '2px solid rgba(255,107,107,0.5)',
    borderRadius: 10,
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #ff6b6b, #c23152)',
    color: '#fff',
    letterSpacing: 3,
    boxShadow: '0 0 30px rgba(255,107,107,0.3)',
    transition: 'all 0.2s',
    fontFamily: "'Orbitron', sans-serif",
  },
  comboDisplay: {
    position: 'absolute',
    bottom: -50,
    left: '50%',
    transform: 'translateX(-50%)',
    animation: 'floatUp 1.5s ease-out forwards',
    pointerEvents: 'none',
    zIndex: 15,
  },
  comboText: {
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: 4,
    color: '#ffd700',
    textShadow: '0 0 20px rgba(255,215,0,0.5)',
    fontFamily: "'Orbitron', sans-serif",
  },
};

export default App;
