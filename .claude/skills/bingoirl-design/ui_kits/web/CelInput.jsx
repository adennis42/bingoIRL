/* global React */
function CelInput({ value, onChange, placeholder, type = 'text', autoFocus, maxLength, style, onKeyDown, ariaLabel }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      maxLength={maxLength}
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%',
        height: 48,
        padding: '0 16px',
        background: '#1e1e1e',
        border: `3px solid ${focused ? '#f5c542' : '#111'}`,
        color: '#fff',
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 700,
        fontSize: 14,
        boxShadow: '3px 3px 0 #111',
        outline: 'none',
        transition: 'border-color 150ms ease',
        ...style,
      }}
    />
  );
}
window.CelInput = CelInput;
