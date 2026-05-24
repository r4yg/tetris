const CELL_SIZE = 32;

function Board({ board, current, ghost, flashRows, dropFlash, boardShake, isLockedCell, PIECE_COLORS }) {
  const grid = buildGrid(board, current, ghost, flashRows, isLockedCell, PIECE_COLORS);

  return (
    <div
      style={{
        position: 'relative',
        padding: 4,
        background: 'linear-gradient(135deg, #161b22, #1c2333)',
        borderRadius: 12,
        border: '2px solid var(--border)',
        animation: boardShake ? 'shake 0.3s ease' : 'borderGlow 4s ease-in-out infinite',
      }}
    >
      {dropFlash && (
        <div style={{
          position: 'absolute',
          top: 4,
          left: 4,
          right: 4,
          bottom: 4,
          borderRadius: 10,
          animation: 'hardDropFlash 0.4s ease-out',
          pointerEvents: 'none',
          zIndex: 10,
        }} />
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(10, ${CELL_SIZE}px)`,
          gridTemplateRows: 'repeat(20, 32px)',
          background: '#0a0e14',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {grid.map((cell, i) => (
          <div key={i} style={cell} />
        ))}
      </div>
    </div>
  );
}

function buildGrid(board, current, ghost, flashRows, isLockedCell, PIECE_COLORS) {
  const cells = [];
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 10; x++) {
      let type = null;
      let isGhost = false;
      let isLocked = false;

      if (flashRows.has(y)) {
        cells.push({
          width: CELL_SIZE,
          height: CELL_SIZE,
          animation: 'lineFlash 0.35s ease-out forwards',
          boxSizing: 'border-box',
        });
        continue;
      }

      if (ghost) {
        const gc = ghost.cells.find(
          ([cx, cy]) => ghost.x + cx === x && ghost.y + cy === y
        );
        if (gc && ghost.y + gc[1] >= 0) {
          type = ghost.type;
          isGhost = true;
        }
      }

      if (current) {
        const cc = current.cells.find(
          ([cx, cy]) => current.x + cx === x && current.y + cy === y
        );
        if (cc && current.y + cc[1] >= 0) {
          type = current.type;
          isGhost = false;
        }
      }

      if (board[y] && board[y][x]) {
        type = board[y][x];
        isGhost = false;
      }

      if (isLockedCell(x, y)) {
        isLocked = true;
      }

      cells.push(makeCell(type, isGhost, isLocked, PIECE_COLORS));
    }
  }
  return cells;
}

function makeCell(type, isGhost, isLocked, PIECE_COLORS) {
  const base = {
    width: CELL_SIZE,
    height: CELL_SIZE,
    boxSizing: 'border-box',
    borderRadius: 4,
    transition: 'all 0.08s ease',
  };

  if (isGhost) {
    const color = PIECE_COLORS[type];
    return {
      ...base,
      background: `${color.base}12`,
      border: `2px dashed ${color.base}35`,
      animation: 'ghostPulse 2s ease-in-out infinite',
    };
  }

  if (type) {
    const color = PIECE_COLORS[type];
    return {
      ...base,
      background: `linear-gradient(135deg, ${color.light}, ${color.base}, ${color.dark})`,
      border: `2px solid ${color.light}90`,
      boxShadow: `inset 0 1px 2px rgba(255,255,255,0.15), 0 0 12px ${color.glow}, inset 0 -2px 4px ${color.dark}60`,
      animation: isLocked ? 'cellAppear 0.3s ease-out' : undefined,
    };
  }

  return {
    ...base,
    background: 'linear-gradient(135deg, #0d1117, #0f1923)',
    border: '1px solid #1a2030',
  };
}

export default Board;
