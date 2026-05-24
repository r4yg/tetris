function GameOver({ score, lines, level, onStart }) {
  return (
    <div style={overlayStyle}>
      <div style={{
        fontSize: 14,
        letterSpacing: 8,
        color: '#8b949e',
        marginBottom: 8,
        animation: 'cellAppear 0.5s ease-out',
      }}>
        GAME OVER
      </div>
      <h2 style={titleStyle}>FINAL SCORE</h2>
      <p style={{
        fontSize: 48,
        fontWeight: 900,
        background: 'linear-gradient(135deg, #ffd700, #ff9f43)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: 'scorePop 1s ease-out',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {score.toLocaleString()}
      </p>
      <div style={statsStyle}>
        <Stat item="Lines" value={lines} />
        <Stat item="Level" value={level} />
      </div>
      <button style={btnStyle} onClick={onStart}>
        PLAY AGAIN
      </button>
    </div>
  );
}

function Stat({ item, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 10, color: '#666', letterSpacing: 3 }}>{item.toUpperCase()}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#ccc', fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
    </div>
  );
}

const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'rgba(13,17,23,0.96)',
  zIndex: 30,
  gap: 12,
  borderRadius: 16,
  padding: 24,
  animation: 'cellAppear 0.6s ease-out',
};

const titleStyle = {
  fontSize: 28,
  fontWeight: 900,
  letterSpacing: 6,
  background: 'linear-gradient(135deg, #ff6b6b, #bf00ff)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: 4,
};

const statsStyle = {
  display: 'flex',
  gap: 32,
  padding: '16px 0',
  borderBottom: '1px solid var(--border)',
  width: '60%',
};

const btnStyle = {
  marginTop: 20,
  padding: '16px 64px',
  fontSize: 18,
  fontWeight: 700,
  border: '2px solid rgba(255,107,107,0.6)',
  borderRadius: 12,
  cursor: 'pointer',
  background: 'linear-gradient(135deg, #ff6b6b, #c23152)',
  color: '#fff',
  letterSpacing: 4,
  boxShadow: '0 0 40px rgba(255,107,107,0.3)',
  fontFamily: "'Orbitron', sans-serif",
  transition: 'all 0.2s',
};

export default GameOver;
