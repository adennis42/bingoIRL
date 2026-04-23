/* global React */
const { forwardRef } = React;

// Matches src/components/ui/button.tsx — variants: yellow (default), blue (secondary),
// green (success), red (destructive), orange (gold/accent), ghost, link.
// Press state = translate(2px, 2px) + shadow collapse from 4×4 to 1×1.
const VARIANTS = {
  yellow:  { bg: 'linear-gradient(to bottom, #ffe066 0%, #f5c542 45%, #c49200 100%)', color: '#111', sheenTop: 'rgba(255,255,255,0.5)',  sheenBot: '-2px 0 rgba(0,0,0,0.25)' },
  blue:    { bg: 'linear-gradient(to bottom, #7dd4ff 0%, #4db8ff 45%, #1a80cc 100%)', color: '#111', sheenTop: 'rgba(255,255,255,0.5)',  sheenBot: '-2px 0 rgba(0,0,0,0.25)' },
  green:   { bg: 'linear-gradient(to bottom, #80ffaa 0%, #50e878 45%, #1a9933 100%)', color: '#111', sheenTop: 'rgba(255,255,255,0.5)',  sheenBot: '-2px 0 rgba(0,0,0,0.25)' },
  red:     { bg: 'linear-gradient(to bottom, #ff7070 0%, #e84040 45%, #991a1a 100%)', color: '#fff', sheenTop: 'rgba(255,255,255,0.35)', sheenBot: '-2px 0 rgba(0,0,0,0.25)' },
  orange:  { bg: 'linear-gradient(to bottom, #ff9060 0%, #ff6b35 45%, #b33400 100%)', color: '#111', sheenTop: 'rgba(255,255,255,0.4)',  sheenBot: '-2px 0 rgba(0,0,0,0.25)' },
};

const SIZES = {
  sm:  { h: 36, px: 16, fs: 12 },
  md:  { h: 44, px: 24, fs: 14 },
  lg:  { h: 56, px: 32, fs: 16 },
  xl:  { h: 64, px: 40, fs: 18 },
};

function CelButton({ variant = 'yellow', size = 'md', children, onClick, disabled, style, fullWidth, type, icon }) {
  const v = VARIANTS[variant];
  const s = SIZES[size] || SIZES.md;

  if (variant === 'ghost' || variant === 'link') {
    return (
      <button
        type={type || 'button'}
        onClick={onClick}
        disabled={disabled}
        style={{
          background: 'transparent',
          color: variant === 'link' ? '#f5c542' : '#ccc',
          border: 0,
          font: 'inherit',
          fontFamily: "'Arial Black', Impact, sans-serif",
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontSize: s.fs,
          padding: `8px ${s.px / 2}px`,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.4 : 1,
          textDecoration: variant === 'link' ? 'none' : undefined,
          width: fullWidth ? '100%' : undefined,
          ...style,
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type={type || 'button'}
      onClick={onClick}
      disabled={disabled}
      className="cel-btn-el"
      style={{
        background: v.bg,
        color: v.color,
        border: '3px solid #111',
        height: s.h,
        padding: `0 ${s.px}px`,
        fontFamily: "'Arial Black', Impact, sans-serif",
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontSize: s.fs,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: fullWidth ? '100%' : undefined,
        boxShadow: `4px 4px 0 #111, inset 0 1px 0 ${v.sheenTop}, inset 0 ${v.sheenBot}`,
        transition: 'transform 80ms ease, box-shadow 80ms ease',
        ...style,
      }}
    >
      {icon ? <span style={{ fontSize: s.fs + 4 }}>{icon}</span> : null}
      {children}
    </button>
  );
}

window.CelButton = CelButton;
