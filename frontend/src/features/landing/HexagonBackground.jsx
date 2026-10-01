import { useCallback, useEffect, useRef, useState } from 'react';

// Honeycomb that lights the cell under the cursor and fades it out over a second.
// Ported from Animate UI (https://animate-ui.com/docs/components/backgrounds/hexagon, MIT) via the
// original Resolve, which sizes the grid from this element rather than the window.
// Each cell is a black hexagon (::before) with a smaller one on top (::after), so only the gaps show
// the background; on hover ::before brightens and reads as a ring. Callers set the position.
// The classes are spelled out in full because Tailwind only picks up literal class names.
const CELL =
  "relative [clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)] before:absolute before:inset-0 before:bg-black before:transition-all before:duration-1000 before:content-[''] " +
  "after:absolute after:inset-(--hexagon-margin) after:bg-black after:[clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)] after:content-[''] hover:before:bg-white/30 hover:before:duration-0";

export default function HexagonBackground({ hexagonSize = 75, hexagonMargin = 3, className = '' }) {
  const ref = useRef(null);
  const [grid, setGrid] = useState({ rows: 0, columns: 0 });

  const height = hexagonSize * 1.1;
  const rowSpacing = hexagonSize * 0.8;
  // Rows overlap so the points interlock; the offset is tuned to hexagonSize.
  const marginTop = -36 - 0.275 * (hexagonSize - 100) + hexagonMargin;

  const measure = useCallback(() => {
    const el = ref.current;
    if (el) setGrid({ rows: Math.ceil(el.clientHeight / rowSpacing) + 1, columns: Math.ceil(el.clientWidth / hexagonSize) + 1 });
  }, [rowSpacing, hexagonSize]);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <div ref={ref} aria-hidden style={{ '--hexagon-margin': `${hexagonMargin}px` }} className={`overflow-hidden bg-white/10 ${className}`}>
      <div className="absolute left-0 top-0 size-full overflow-hidden">
        {Array.from({ length: grid.rows }, (_, row) => (
          <div
            key={row}
            className="inline-flex"
            style={{ marginTop, marginLeft: (row % 2 === 1 ? hexagonMargin / 2 : -hexagonSize / 2) - 10 }}
          >
            {Array.from({ length: grid.columns }, (_, column) => (
              <div
                key={column}
                style={{ width: hexagonSize, height, marginLeft: hexagonMargin }}
                className={CELL}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
