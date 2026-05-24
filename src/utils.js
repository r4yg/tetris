const ROWS = 20;
const COLS = 10;

export const createBoard = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const SHAPES = {
  I: [[0, 0], [1, 0], [2, 0], [3, 0]],
  O: [[0, 0], [1, 0], [0, 1], [1, 1]],
  T: [[0, 0], [1, 0], [2, 0], [1, 1]],
  S: [[1, 0], [2, 0], [0, 1], [1, 1]],
  Z: [[0, 0], [1, 0], [1, 1], [2, 1]],
  L: [[0, 0], [1, 0], [2, 0], [0, 1]],
  J: [[0, 0], [1, 0], [2, 0], [2, 1]],
};

const COLORS = {
  I: { base: '#00ffff', light: '#7fffff', dark: '#00b8b8', glow: 'rgba(0,255,255,0.5)' },
  O: { base: '#ffff00', light: '#ffff7f', dark: '#b8b800', glow: 'rgba(255,255,0,0.5)' },
  T: { base: '#bf00ff', light: '#df7fff', dark: '#8f00b8', glow: 'rgba(191,0,255,0.5)' },
  S: { base: '#00ff6b', light: '#7fffbb', dark: '#00b84d', glow: 'rgba(0,255,107,0.5)' },
  Z: { base: '#ff4444', light: '#ff8f8f', dark: '#b82020', glow: 'rgba(255,68,68,0.5)' },
  L: { base: '#ff9500', light: '#ffc260', dark: '#b86900', glow: 'rgba(255,149,0,0.5)' },
  J: { base: '#4488ff', light: '#8fb4ff', dark: '#2d60b8', glow: 'rgba(68,136,255,0.5)' },
};

export const PIECE_COLORS = COLORS;

export const createPieces = () => {
  return Object.entries(SHAPES).map(([type, cells]) => ({
    type,
    cells,
    color: COLORS[type],
    x: 3,
    y: -1,
  }));
};

export const getRandomPiece = () => {
  const types = Object.keys(SHAPES);
  const type = types[Math.floor(Math.random() * types.length)];
  return {
    type,
    cells: SHAPES[type].map(([x, y]) => [x, y]),
    color: COLORS[type],
    x: 3,
    y: -1,
  };
};

export const getRandomPieceFromBag = (bagRef) => {
  if (bagRef.current.length === 0) {
    const types = Object.keys(SHAPES);
    bagRef.current = shuffle([...types]).map((type) => ({
      type,
      cells: SHAPES[type].map(([x, y]) => [x, y]),
      color: COLORS[type],
      x: 3,
      y: -1,
    }));
  }
  return bagRef.current.pop();
};

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const rotate = (piece) => {
  const rotatedCells = piece.cells.map(([x, y]) => [-y, x]);
  const minX = Math.min(...rotatedCells.map(([x]) => x));
  const minY = Math.min(...rotatedCells.map(([, y]) => y));
  const normalized = rotatedCells.map(([x, y]) => [x - minX, y - minY]);
  return { ...piece, cells: normalized };
};

export const isValid = (piece, board) => {
  return piece.cells.every(([cx, cy]) => {
    const x = piece.x + cx;
    const y = piece.y + cy;
    if (x < 0 || x >= COLS || y >= ROWS) return false;
    if (y < 0) return true;
    return board[y][x] === null;
  });
};

export const placePiece = (piece, board) => {
  const newBoard = board.map((row) => [...row]);
  piece.cells.forEach(([cx, cy]) => {
    const x = piece.x + cx;
    const y = piece.y + cy;
    if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
      newBoard[y][x] = piece.type;
    }
  });
  return newBoard;
};

export const clearLines = (board) => {
  const linesToClear = [];
  board.forEach((row, i) => {
    if (row.every((cell) => cell !== null)) {
      linesToClear.push(i);
    }
  });
  const newBoard = board.filter((_, i) => !linesToClear.includes(i));
  while (newBoard.length < ROWS) {
    newBoard.unshift(Array(COLS).fill(null));
  }
  return { board: newBoard, linesCleared: linesToClear.length, clearedRows: linesToClear };
};

export const getGhostPosition = (piece, board) => {
  let ghost = { ...piece };
  while (isValid({ ...ghost, y: ghost.y + 1 }, board)) {
    ghost.y++;
  }
  return ghost;
};
