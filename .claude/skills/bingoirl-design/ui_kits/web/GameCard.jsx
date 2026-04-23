/* global React, CelCard, StatusChip */
// List row shown on the host dashboard for active / past games.
function GameCard({ code, status, currentRound, totalRounds, onClick, dim }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: dim ? '#161616' : '#1a1a1a',
        border: '3px solid #111',
        boxShadow: dim ? '3px 3px 0 #111' : '4px 4px 0 #111',
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        opacity: dim ? 0.6 : 1,
        transition: 'transform 120ms ease, opacity 120ms ease',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        if (dim) e.currentTarget.style.opacity = '1';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        if (dim) e.currentTarget.style.opacity = '0.6';
      }}
    >
      <StatusChip status={status} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          fontFamily: "'Arial Black', monospace",
          fontWeight: 900,
          fontSize: 18,
          letterSpacing: '0.2em',
          color: dim ? '#555' : '#fff',
        }}>{code}</span>
        <p style={{
          color: dim ? '#333' : '#555',
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
          fontSize: 11,
          textTransform: 'uppercase',
          margin: '2px 0 0',
        }}>Round {currentRound}/{totalRounds}</p>
      </div>
      <span style={{ color: dim ? '#333' : '#f5c542', fontFamily: "'Arial Black', sans-serif", fontSize: 22, fontWeight: 900 }}>›</span>
    </div>
  );
}
window.GameCard = GameCard;
