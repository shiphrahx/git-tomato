import React from 'react';

/**
 * Maps remaining time percentage (0–1) to a tomato state (1–5).
 * 100–80% → state 1 (happiest), 20–0% → state 5 (most tired).
 */
export function getTomatoState(progress) {
  if (progress > 0.8) return 1;
  if (progress > 0.6) return 2;
  if (progress > 0.4) return 3;
  if (progress > 0.2) return 4;
  return 5;
}

// ─── Pixel palette ────────────────────────────────────────────────────────────
const C = {
  R1: '#d62c20', // dark red shadow
  R2: '#e83c2a', // mid red
  R3: '#f55a3c', // bright red highlight
  R4: '#ff7055', // light red / rim
  G1: '#1a6e1a', // dark green stem
  G2: '#2d9e2d', // mid green
  G3: '#42c442', // bright green leaf
  SK: '#ffd6b0', // skin / whites of eyes
  BK: '#1a0a00', // near-black outline / pupils
  WH: '#ffffff', // pure white eye-white
  YW: '#ffe066', // sparkle yellow (state 1)
  TR: '#80c8e8', // tear blue (states 4-5)
  __: null,      // transparent
};

// Each state is a 16×16 pixel grid (row-major, top to bottom).
// null = transparent pixel.
const STATES = {
  1: [
  // Row 0-1: sparkles
  [C.__,C.YW,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.YW,C.__],
  [C.__,C.__,C.YW,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.YW,C.__,C.__],
  // Row 2-3: stem
  [C.__,C.__,C.__,C.__,C.__,C.__,C.G1,C.G2,C.G2,C.G1,C.__,C.__,C.__,C.__,C.__,C.__],
  [C.__,C.__,C.__,C.__,C.__,C.G1,C.G2,C.G3,C.G3,C.G2,C.G1,C.__,C.__,C.__,C.__,C.__],
  // Row 4-5: leaves + top body
  [C.__,C.__,C.G1,C.G2,C.__,C.G2,C.G3,C.G2,C.G2,C.G3,C.G2,C.__,C.G2,C.G1,C.__,C.__],
  [C.__,C.G1,C.G2,C.G3,C.G2,C.R1,C.R2,C.R3,C.R3,C.R2,C.R1,C.G2,C.G3,C.G2,C.G1,C.__],
  // Row 6: upper body
  [C.__,C.R1,C.R2,C.R3,C.R4,C.R3,C.R3,C.R4,C.R4,C.R3,C.R3,C.R4,C.R3,C.R2,C.R1,C.__],
  // Row 7: eyes — state 1: open wide + sparkle
  [C.R1,C.R2,C.SK,C.WH,C.WH,C.SK,C.R3,C.R3,C.R3,C.R3,C.SK,C.WH,C.WH,C.SK,C.R2,C.R1],
  // Row 8: pupils
  [C.R1,C.R2,C.SK,C.BK,C.BK,C.SK,C.R3,C.R3,C.R3,C.R3,C.SK,C.BK,C.BK,C.SK,C.R2,C.R1],
  // Row 9: eye bottom / cheek
  [C.R1,C.R2,C.SK,C.WH,C.SK,C.R2,C.R3,C.R3,C.R3,C.R3,C.R2,C.SK,C.WH,C.SK,C.R2,C.R1],
  // Row 10: smile — big open
  [C.R1,C.R2,C.R3,C.BK,C.BK,C.BK,C.BK,C.BK,C.BK,C.BK,C.BK,C.BK,C.R3,C.R2,C.R1,C.__],
  // Row 11: teeth
  [C.R1,C.R2,C.WH,C.WH,C.WH,C.WH,C.WH,C.BK,C.WH,C.WH,C.WH,C.WH,C.WH,C.R2,C.R1,C.__],
  // Row 12: lower body
  [C.__,C.R1,C.R2,C.R3,C.R3,C.R2,C.R2,C.R2,C.R2,C.R2,C.R2,C.R3,C.R3,C.R2,C.R1,C.__],
  // Row 13: bottom curve
  [C.__,C.__,C.R1,C.R2,C.R2,C.R3,C.R2,C.R2,C.R2,C.R2,C.R3,C.R2,C.R2,C.R1,C.__,C.__],
  // Row 14-15: base
  [C.__,C.__,C.__,C.R1,C.R2,C.R2,C.R2,C.R2,C.R2,C.R2,C.R2,C.R2,C.R1,C.__,C.__,C.__],
  [C.__,C.__,C.__,C.__,C.R1,C.R1,C.R1,C.R1,C.R1,C.R1,C.R1,C.R1,C.__,C.__,C.__,C.__],
  ],

  2: [
  [C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__],
  [C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__],
  [C.__,C.__,C.__,C.__,C.__,C.__,C.G1,C.G2,C.G2,C.G1,C.__,C.__,C.__,C.__,C.__,C.__],
  [C.__,C.__,C.__,C.__,C.__,C.G1,C.G2,C.G3,C.G3,C.G2,C.G1,C.__,C.__,C.__,C.__,C.__],
  [C.__,C.__,C.G1,C.G2,C.__,C.G2,C.G3,C.G2,C.G2,C.G3,C.G2,C.__,C.G2,C.G1,C.__,C.__],
  [C.__,C.G1,C.G2,C.G3,C.G2,C.R1,C.R2,C.R3,C.R3,C.R2,C.R1,C.G2,C.G3,C.G2,C.G1,C.__],
  [C.__,C.R1,C.R2,C.R3,C.R4,C.R3,C.R3,C.R4,C.R4,C.R3,C.R3,C.R4,C.R3,C.R2,C.R1,C.__],
  // Eyes: normal open
  [C.R1,C.R2,C.SK,C.WH,C.WH,C.SK,C.R3,C.R3,C.R3,C.R3,C.SK,C.WH,C.WH,C.SK,C.R2,C.R1],
  [C.R1,C.R2,C.SK,C.BK,C.BK,C.SK,C.R3,C.R3,C.R3,C.R3,C.SK,C.BK,C.BK,C.SK,C.R2,C.R1],
  [C.R1,C.R2,C.SK,C.SK,C.SK,C.R2,C.R3,C.R3,C.R3,C.R3,C.R2,C.SK,C.SK,C.SK,C.R2,C.R1],
  // Smile: medium
  [C.R1,C.R2,C.R3,C.R3,C.BK,C.BK,C.BK,C.BK,C.BK,C.BK,C.BK,C.R3,C.R3,C.R2,C.R1,C.__],
  [C.R1,C.R2,C.R3,C.R3,C.WH,C.WH,C.WH,C.WH,C.WH,C.WH,C.R3,C.R3,C.R3,C.R2,C.R1,C.__],
  [C.__,C.R1,C.R2,C.R3,C.R3,C.R2,C.R2,C.R2,C.R2,C.R2,C.R2,C.R3,C.R3,C.R2,C.R1,C.__],
  [C.__,C.__,C.R1,C.R2,C.R2,C.R3,C.R2,C.R2,C.R2,C.R2,C.R3,C.R2,C.R2,C.R1,C.__,C.__],
  [C.__,C.__,C.__,C.R1,C.R2,C.R2,C.R2,C.R2,C.R2,C.R2,C.R2,C.R2,C.R1,C.__,C.__,C.__],
  [C.__,C.__,C.__,C.__,C.R1,C.R1,C.R1,C.R1,C.R1,C.R1,C.R1,C.R1,C.__,C.__,C.__,C.__],
  ],

  3: [
  [C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__],
  [C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__],
  [C.__,C.__,C.__,C.__,C.__,C.__,C.G1,C.G2,C.G2,C.G1,C.__,C.__,C.__,C.__,C.__,C.__],
  [C.__,C.__,C.__,C.__,C.__,C.G1,C.G2,C.G3,C.G3,C.G2,C.G1,C.__,C.__,C.__,C.__,C.__],
  [C.__,C.__,C.G1,C.G2,C.__,C.G2,C.G3,C.G2,C.G2,C.G3,C.G2,C.__,C.G2,C.G1,C.__,C.__],
  [C.__,C.G1,C.G2,C.G3,C.G2,C.R1,C.R2,C.R3,C.R3,C.R2,C.R1,C.G2,C.G3,C.G2,C.G1,C.__],
  [C.__,C.R1,C.R2,C.R3,C.R4,C.R3,C.R3,C.R4,C.R4,C.R3,C.R3,C.R4,C.R3,C.R2,C.R1,C.__],
  // Eyes: half closed (tired)
  [C.R1,C.R2,C.SK,C.SK,C.SK,C.SK,C.R3,C.R3,C.R3,C.R3,C.SK,C.SK,C.SK,C.SK,C.R2,C.R1],
  [C.R1,C.R2,C.BK,C.BK,C.BK,C.SK,C.R3,C.R3,C.R3,C.R3,C.SK,C.BK,C.BK,C.BK,C.R2,C.R1],
  [C.R1,C.R2,C.SK,C.SK,C.SK,C.R2,C.R3,C.R3,C.R3,C.R3,C.R2,C.SK,C.SK,C.SK,C.R2,C.R1],
  // Mouth: flat / slight frown
  [C.R1,C.R2,C.R3,C.R3,C.R3,C.BK,C.BK,C.BK,C.BK,C.BK,C.R3,C.R3,C.R3,C.R2,C.R1,C.__],
  [C.R1,C.R2,C.R3,C.R3,C.R3,C.R3,C.R3,C.R3,C.R3,C.R3,C.R3,C.R3,C.R3,C.R2,C.R1,C.__],
  [C.__,C.R1,C.R2,C.R3,C.R3,C.R2,C.R2,C.R2,C.R2,C.R2,C.R2,C.R3,C.R3,C.R2,C.R1,C.__],
  [C.__,C.__,C.R1,C.R2,C.R2,C.R3,C.R2,C.R2,C.R2,C.R2,C.R3,C.R2,C.R2,C.R1,C.__,C.__],
  [C.__,C.__,C.__,C.R1,C.R2,C.R2,C.R2,C.R2,C.R2,C.R2,C.R2,C.R2,C.R1,C.__,C.__,C.__],
  [C.__,C.__,C.__,C.__,C.R1,C.R1,C.R1,C.R1,C.R1,C.R1,C.R1,C.R1,C.__,C.__,C.__,C.__],
  ],

  4: [
  [C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__],
  [C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__],
  [C.__,C.__,C.__,C.__,C.__,C.__,C.G1,C.G2,C.G2,C.G1,C.__,C.__,C.__,C.__,C.__,C.__],
  [C.__,C.__,C.__,C.__,C.__,C.G1,C.G2,C.G3,C.G3,C.G2,C.G1,C.__,C.__,C.__,C.__,C.__],
  [C.__,C.__,C.G1,C.G2,C.__,C.G2,C.G3,C.G2,C.G2,C.G3,C.G2,C.__,C.G2,C.G1,C.__,C.__],
  [C.__,C.G1,C.G2,C.G3,C.G2,C.R1,C.R2,C.R3,C.R3,C.R2,C.R1,C.G2,C.G3,C.G2,C.G1,C.__],
  [C.__,C.R1,C.R2,C.R3,C.R4,C.R3,C.R3,C.R4,C.R4,C.R3,C.R3,C.R4,C.R3,C.R2,C.R1,C.__],
  // Eyes: sad / droopy with tears forming
  [C.R1,C.TR,C.SK,C.SK,C.SK,C.SK,C.R3,C.R3,C.R3,C.R3,C.SK,C.SK,C.SK,C.SK,C.TR,C.R1],
  [C.R1,C.R2,C.BK,C.BK,C.SK,C.SK,C.R3,C.R3,C.R3,C.R3,C.SK,C.SK,C.BK,C.BK,C.R2,C.R1],
  [C.TR,C.R2,C.SK,C.BK,C.SK,C.R2,C.R3,C.R3,C.R3,C.R3,C.R2,C.SK,C.BK,C.SK,C.R2,C.TR],
  // Frown
  [C.R1,C.R2,C.R3,C.BK,C.BK,C.R3,C.R3,C.R3,C.R3,C.R3,C.R3,C.BK,C.BK,C.R2,C.R1,C.__],
  [C.R1,C.R2,C.R3,C.R3,C.BK,C.BK,C.BK,C.BK,C.BK,C.BK,C.BK,C.R3,C.R3,C.R2,C.R1,C.__],
  [C.__,C.R1,C.R2,C.R3,C.R3,C.R2,C.R2,C.R2,C.R2,C.R2,C.R2,C.R3,C.R3,C.R2,C.R1,C.__],
  [C.__,C.__,C.R1,C.R2,C.R2,C.R3,C.R2,C.R2,C.R2,C.R2,C.R3,C.R2,C.R2,C.R1,C.__,C.__],
  [C.__,C.__,C.__,C.R1,C.R2,C.R2,C.R2,C.R2,C.R2,C.R2,C.R2,C.R2,C.R1,C.__,C.__,C.__],
  [C.__,C.__,C.__,C.__,C.R1,C.R1,C.R1,C.R1,C.R1,C.R1,C.R1,C.R1,C.__,C.__,C.__,C.__],
  ],

  5: [
  // Tear drops above
  [C.__,C.__,C.TR,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.TR,C.__,C.__],
  [C.__,C.__,C.TR,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.__,C.TR,C.__,C.__],
  [C.__,C.__,C.__,C.__,C.__,C.__,C.G1,C.G2,C.G2,C.G1,C.__,C.__,C.__,C.__,C.__,C.__],
  [C.__,C.__,C.__,C.__,C.__,C.G1,C.G2,C.G3,C.G3,C.G2,C.G1,C.__,C.__,C.__,C.__,C.__],
  [C.__,C.__,C.G1,C.G2,C.__,C.G2,C.G3,C.G2,C.G2,C.G3,C.G2,C.__,C.G2,C.G1,C.__,C.__],
  [C.__,C.G1,C.G2,C.G3,C.G2,C.R1,C.R2,C.R3,C.R3,C.R2,C.R1,C.G2,C.G3,C.G2,C.G1,C.__],
  [C.__,C.R1,C.R2,C.R3,C.R4,C.R3,C.R3,C.R4,C.R4,C.R3,C.R3,C.R4,C.R3,C.R2,C.R1,C.__],
  // Eyes: crying / squinting
  [C.TR,C.TR,C.BK,C.BK,C.BK,C.SK,C.R3,C.R3,C.R3,C.R3,C.SK,C.BK,C.BK,C.BK,C.TR,C.TR],
  [C.TR,C.R2,C.SK,C.SK,C.SK,C.SK,C.R3,C.R3,C.R3,C.R3,C.SK,C.SK,C.SK,C.SK,C.R2,C.TR],
  [C.TR,C.TR,C.TR,C.SK,C.SK,C.R2,C.R3,C.R3,C.R3,C.R3,C.R2,C.SK,C.SK,C.TR,C.TR,C.TR],
  // Big frown / open crying mouth
  [C.R1,C.R2,C.BK,C.BK,C.R3,C.R3,C.R3,C.R3,C.R3,C.R3,C.R3,C.R3,C.BK,C.BK,C.R1,C.__],
  [C.R1,C.R2,C.R3,C.BK,C.BK,C.BK,C.BK,C.BK,C.BK,C.BK,C.BK,C.BK,C.R3,C.R2,C.R1,C.__],
  [C.__,C.R1,C.R2,C.WH,C.WH,C.WH,C.WH,C.BK,C.BK,C.WH,C.WH,C.WH,C.R2,C.R2,C.R1,C.__],
  [C.__,C.__,C.R1,C.R2,C.R2,C.R3,C.R2,C.R2,C.R2,C.R2,C.R3,C.R2,C.R2,C.R1,C.__,C.__],
  [C.__,C.__,C.__,C.R1,C.R2,C.R2,C.R2,C.R2,C.R2,C.R2,C.R2,C.R2,C.R1,C.__,C.__,C.__],
  [C.__,C.__,C.__,C.__,C.R1,C.R1,C.R1,C.R1,C.R1,C.R1,C.R1,C.R1,C.__,C.__,C.__,C.__],
  ],
};

const PX = 8; // pixel size in display pixels
const GRID = 16;
const SPRITE_SIZE = PX * GRID; // 128px

export function TomatoSprite({ state = 1 }) {
  const grid = STATES[state] ?? STATES[1];

  return (
    <svg
      width={SPRITE_SIZE}
      height={SPRITE_SIZE}
      viewBox={`0 0 ${SPRITE_SIZE} ${SPRITE_SIZE}`}
      style={{ imageRendering: 'pixelated', display: 'block', shapeRendering: 'crispEdges' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {grid.flatMap((row, ry) =>
        row.map((color, rx) =>
          color ? (
            <rect
              key={`${ry}-${rx}`}
              x={rx * PX}
              y={ry * PX}
              width={PX}
              height={PX}
              fill={color}
            />
          ) : null
        )
      )}
    </svg>
  );
}
