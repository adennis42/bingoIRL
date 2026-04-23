/* global React */
const CHIP_STYLES = {
  setup:  { bg: 'linear-gradient(to bottom, #ffe066 0%, #f5c542 45%, #c49200 100%)', color: '#111' },
  active: { bg: 'linear-gradient(to bottom, #80ffaa 0%, #50e878 45%, #1a9933 100%)', color: '#111' },
  paused: { bg: 'linear-gradient(to bottom, #ff9060 0%, #ff6b35 45%, #b33400 100%)', color: '#111' },
  ended:  { bg: '#333', color: '#fff' },
  error:  { bg: 'linear-gradient(to bottom, #ff7070 0%, #e84040 45%, #991a1a 100%)', color: '#fff' },
};
const LABELS = { setup: 'SETUP', active: 'LIVE', paused: 'PAUSED', ended: 'ENDED', error: 'ERROR' };

function StatusChip({ status, label, small }) {
  const s = CHIP_STYLES[status] || CHIP_STYLES.setup;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: small ? '2px 8px' : '4px 10px',
        background: s.bg,
        color: s.color,
        border: '2px solid #111',
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 900,
        fontSize: small ? 10 : 11,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        boxShadow: '2px 2px 0 #111, inset 0 1px 0 rgba(255,255,255,0.3)',
      }}
    >
      {label || LABELS[status]}
    </span>
  );
}
window.StatusChip = StatusChip;
