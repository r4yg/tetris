function SidePanel({ nextPieces, score, lines, level, combo, scorePop, PIECE_COLORS, onStart, isStarted }) {
  return (
    <div style={panelStyle}>
      <div style={sectionStyle}>
        <h3 style={labelStyle}>HOLD</h3>
        <div style={nextLabelStyle}>NEXT</div>
        <div style={nextGridContainer}>
          {nextPieces.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              {nextPieces.map((piece, idx) => (
                <PiecePreview key={idx} piece={piece} PIECE_COLORS={PIECE_COLORS} delay={idx * 100} />
              ))}
            </div>
          )}
        </div>
      </div>

      <StatBlock label="SCORE" value={score.toLocaleString()} pop={scorePop} big />
      <StatBlock label="LINES" value={lines} pop={false} />
      <StatBlock label="LEVEL" value={level} pop={false} />

      {combo > 1 && (
        <div style={{
          textAlign: 'center',
          padding: '8px 0',
          fontSize: 16,
          fontWeight: 900,
          color: '#ffd700',
          letterSpacing: 3,
          animation: 'scorePop 0.5s ease',
          textShadow: '0 0 15px rgba(255,215,0,0.4)',
        }}>
          {combo}x COMBO
        </div>
      )}

      <div style={{ marginTop: 24, padding: '16px 0', borderTop: '1px solid var(--border)' }}>
        <ControlRow icon="← →" text="Move" />
        <ControlRow icon="↑" text="Rotate" />
        <ControlRow icon="↓" text="Soft drop" />
        <ControlRow icon="SPACE" text="Hard drop" />
        <ControlRow icon="P" text="Pause" />
      </div>

      {!isStarted && (
        <button
          style={{
            width: '100%',
            padding: '12px',
            marginTop: 12,
            border: '2px solid #ff6b6b',
            borderRadius: 8,
            background: 'transparent',
            color: '#ff6b6b',
            cursor: 'pointer',
            fontSize: 12,
            letterSpacing: 2,
            fontWeight: 700,
            fontFamily: "'Orbitron', sans-serif",
          }}
          onClick={onStart}
        >
          NEW GAME
        </button>
      )}
    </div>
  );
}

function PiecePreview({ piece, PIECE_COLORS, delay }) {
  const color = PIECE_COLORS[piece.type];
  const maxCol = Math.max(...piece.cells.map(([x]) => x)) + 1;
  const maxRow = Math.max(...piece.cells.map(([, y]) => y)) + 1;

  const grid = Array(maxRow * maxCol).fill(null);
  piece.cells.forEach(([cx, cy]) => {
    grid[cy * maxCol + cx] = true;
  });

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${maxCol}, 24px)`,
      gap: 3,
      animation: `cellAppear 0.4s ease-out ${delay}ms both`,
    }}>
      {grid.map((filled, i) => (
        <div key={i} style={{
          width: 24,
          height: 24,
          borderRadius: 4,
          background: filled
            ? `linear-gradient(135deg, ${color.light}, ${color.base})`
            : 'transparent',
          boxShadow: filled ? `inset 0 1px 2px rgba(255,255,255,0.2), 0 0 6px ${color.glow}` : 'none',
          border: filled ? `1px solid ${color.light}60` : '1px solid transparent',
          transition: 'all 0.2s',
        }} />
      ))}
    </div>
  );
}

function StatBlock({ label, value, pop, big }) {
  return (
    <div style={{ textAlign: 'center', padding: big ? '14px 0' : '10px 0', borderBottom: '1px solid rgba(48,54,61,0.5)' }}>
      <h3 style={labelStyle}>{label}</h3>
      <p style={{
        fontSize: big ? 32 : 24,
        fontWeight: 900,
        background: 'linear-gradient(135deg, #e94560, #ff9f43)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: pop ? 'scorePop 0.5s ease' : undefined,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {value}
      </p>
    </div>
  );
}

function ControlRow({ icon, text }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: '3px 0',
    }}>
      <span style={{
        fontSize: 11,
        fontWeight: 700,
        color: '#ffd700',
        width: 50,
        textAlign: 'right',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {icon}
      </span>
      <span style={{ fontSize: 11, color: '#666', fontFamily: "'Orbitron', sans-serif" }}>{text}</span>
    </div>
  );
}

const panelStyle = {
  width: 170,
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(180deg, #161b22, #0d1117)',
  padding: '20px 16px',
  borderRadius: 12,
  border: '2px solid var(--border)',
  boxShadow: '0 0 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
  fontFamily: "'Orbitron', sans-serif",
  gap: 0,
};

const sectionStyle = {
  textAlign: 'center',
  paddingBottom: 16,
  borderBottom: '1px solid rgba(48,54,61,0.5)',
  marginBottom: 4,
};

const labelStyle = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 4,
  color: '#8b949e',
  marginBottom: 8,
  fontFamily: "'Orbitron', sans-serif",
};

const nextLabelStyle = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 3,
  color: '#8b949e',
  marginBottom: 12,
};

const nextGridContainer = {
  minHeight: 80,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
};

export default SidePanel;
