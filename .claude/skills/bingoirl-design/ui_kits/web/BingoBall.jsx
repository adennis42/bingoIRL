/* global React */
// Stylized 3D bingo ball — matches src/components/bingo/BingoBall.tsx visually.
// White oval with column letter on top + mono number below. Radial-gradient
// ball body, specular shine at top-left. Spin animation keyed off `number`.
const COL_COLORS = {
  B: '#4db8ff', I: '#e84040', N: '#ffffff', G: '#50e878', O: '#f5c542',
};

function BingoBall({ number, size = 180 }) {
  const col = number ? number[0] : 'B';
  const numValue = number ? parseInt(number.slice(1), 10) : 0;
  const color = COL_COLORS[col] || '#f5c542';
  const ovalW = size * 0.54;
  const ovalH = size * 0.60;
  const letterSize = size * 0.14;
  const numSize = numValue >= 10 ? size * 0.28 : size * 0.32;
  const shineW = size * 0.28;
  const shineH = size * 0.16;

  return (
    <div style={{ perspective: size * 4 }}>
      <div
        key={number}
        style={{
          animation: 'bingoBallSpin 520ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: size,
            height: size,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            background: `radial-gradient(ellipse at 38% 32%, ${color}ff 0%, ${color}cc 45%, ${color}88 75%, ${color}55 100%)`,
            boxShadow: [
              `0 ${size * 0.06}px ${size * 0.18}px ${color}70`,
              `0 ${size * 0.03}px ${size * 0.06}px rgba(0,0,0,0.5)`,
              `inset 0 ${size * 0.025}px ${size * 0.07}px rgba(255,255,255,0.25)`,
              `inset 0 -${size * 0.03}px ${size * 0.08}px rgba(0,0,0,0.35)`,
            ].join(','),
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: ovalW,
              height: ovalH,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.96)',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: "'Arial Black', Impact, sans-serif",
                fontWeight: 900,
                fontSize: letterSize,
                color,
                letterSpacing: '0.02em',
                lineHeight: 1,
              }}
            >
              {col}
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 900,
                fontSize: numSize,
                color: '#111',
                marginTop: size * 0.01,
                lineHeight: 1,
              }}
            >
              {numValue}
            </span>
          </div>
          <div
            style={{
              position: 'absolute',
              top: size * 0.10,
              left: size * 0.16,
              width: shineW,
              height: shineH,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, transparent 80%)',
              filter: 'blur(2px)',
              transform: 'rotate(-20deg)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
window.BingoBall = BingoBall;
window.BINGO_COL_COLORS = COL_COLORS;
