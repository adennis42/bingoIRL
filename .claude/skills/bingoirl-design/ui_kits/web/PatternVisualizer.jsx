/* global React */
// 5×5 pattern visualizer. Yellow cells on dark.
function PatternVisualizer({ cells = [], size = 'md' }) {
  const cellSize = size === 'sm' ? 22 : size === 'lg' ? 48 : 32;
  const gap = size === 'sm' ? 3 : 4;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(5, ${cellSize}px)`,
      gap,
    }}>
      {Array.from({ length: 25 }, (_, i) => {
        const row = Math.floor(i / 5), col = i % 5;
        const isSelected = cells.some(([r, c]) => r === row && c === col);
        const isCenter = row === 2 && col === 2;
        const on = isCenter || isSelected;
        return (
          <div key={i} style={{
            width: cellSize,
            height: cellSize,
            background: on ? '#f5c542' : '#1e1e1e',
            border: `2px solid ${on ? '#111' : '#2a2a2a'}`,
            boxShadow: on ? 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 0 #8a6600' : 'none',
          }} />
        );
      })}
    </div>
  );
}

const PATTERNS = {
  traditional_line: { name: 'Traditional Line', cells: [[2,0],[2,1],[2,2],[2,3],[2,4]] },
  four_corners: { name: 'Four Corners', cells: [[0,0],[0,4],[4,0],[4,4]] },
  blackout: { name: 'Blackout', cells: (() => { const a=[]; for(let r=0;r<5;r++) for(let c=0;c<5;c++) a.push([r,c]); return a; })() },
};

window.PatternVisualizer = PatternVisualizer;
window.PATTERNS = PATTERNS;
