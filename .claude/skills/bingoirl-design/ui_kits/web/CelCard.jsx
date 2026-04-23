/* global React */
// The canonical dark panel. `elev` controls shadow size.
function CelCard({ children, elev = 'md', dim, style, onClick }) {
  const shadow = elev === 'sm' ? '3px 3px 0 #111'
    : elev === 'lg' ? '5px 5px 0 #111'
    : elev === 'xl' ? '6px 6px 0 #111'
    : '4px 4px 0 #111';
  return (
    <div
      onClick={onClick}
      style={{
        background: dim ? '#161616' : '#1a1a1a',
        border: '3px solid #111',
        boxShadow: shadow,
        padding: 20,
        opacity: dim ? 0.75 : 1,
        cursor: onClick ? 'pointer' : undefined,
        transition: 'transform 120ms ease',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
window.CelCard = CelCard;

function Eyebrow({ children, color = '#555' }) {
  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 900,
      fontSize: 10,
      color,
      textTransform: 'uppercase',
      letterSpacing: '0.14em',
    }}>{children}</div>
  );
}
window.Eyebrow = Eyebrow;

function Hero({ children, size = 'md', style }) {
  const fs = size === 'lg' ? 40 : size === 'sm' ? 22 : 30;
  return (
    <h1 style={{
      fontFamily: "'Arial Black', Impact, sans-serif",
      fontWeight: 900,
      color: '#fff',
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
      fontSize: fs,
      textShadow: '3px 3px 0 #111',
      lineHeight: 1,
      margin: 0,
      ...style,
    }}>
      {children}
    </h1>
  );
}
window.Hero = Hero;
