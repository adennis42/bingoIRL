/* global React */
// Wordmark: 5 colored B-I-N-G-O tiles with an attached "IRL" lockup.
// `size` controls tile dimension; everything scales.
function BingoLogo({ size = 54, compact = false }) {
  const tiles = [
    { l: 'B', bg: 'linear-gradient(to bottom, #7dd4ff 0%, #4db8ff 45%, #1a80cc 100%)', ins: '#004d99', fg: '#111' },
    { l: 'I', bg: 'linear-gradient(to bottom, #ff7070 0%, #e84040 45%, #991a1a 100%)', ins: '#660000', fg: '#fff' },
    { l: 'N', bg: 'linear-gradient(to bottom, #ffffff 0%, #f2f2f2 45%, #c4c4c4 100%)', ins: '#999999', fg: '#111' },
    { l: 'G', bg: 'linear-gradient(to bottom, #80ffaa 0%, #50e878 45%, #1a9933 100%)', ins: '#005c1a', fg: '#111' },
    { l: 'O', bg: 'linear-gradient(to bottom, #ffe066 0%, #f5c542 45%, #c49200 100%)', ins: '#8a6600', fg: '#111' },
  ];
  const gap = Math.max(2, Math.round(size * 0.08));
  const fontSize = Math.round(size * 0.55);
  const borderW = size <= 36 ? 2 : 3;
  const shadow = size <= 36 ? '2px 2px 0 #111' : '4px 4px 0 #111';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'flex-end', gap }}>
      {tiles.map((t) => (
        <div
          key={t.l}
          style={{
            width: size,
            height: size,
            background: t.bg,
            color: t.fg,
            border: `${borderW}px solid #111`,
            boxShadow: `${shadow}, inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -3px 0 ${t.ins}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Arial Black', Impact, sans-serif",
            fontWeight: 900,
            fontSize,
            letterSpacing: '-1px',
            lineHeight: 1,
          }}
        >
          {t.l}
        </div>
      ))}
      {!compact && (
        <div style={{ paddingBottom: Math.round(size * 0.08), paddingLeft: 4 }}>
          <span
            style={{
              fontFamily: "'Arial Black', Impact, sans-serif",
              fontSize: Math.max(11, Math.round(size * 0.25)),
              fontWeight: 900,
              letterSpacing: 3,
              color: '#fff',
              WebkitTextStroke: '1.5px #111',
              paintOrder: 'stroke fill',
              textShadow: '2px 2px 0 #111',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            IRL
          </span>
        </div>
      )}
    </div>
  );
}
window.BingoLogo = BingoLogo;
