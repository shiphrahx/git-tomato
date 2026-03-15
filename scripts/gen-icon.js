/**
 * Generates assets/trayTemplate.png — a 16x16 RGBA PNG with a red tomato circle.
 * Run once: node scripts/gen-icon.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const W = 16, H = 16;
const pixels = Buffer.alloc(W * H * 4, 0); // RGBA

// Filled red circle
const cx = 7.5, cy = 7.5, r = 6;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const dx = x - cx, dy = y - cy;
    if (dx * dx + dy * dy <= r * r) {
      const i = (y * W + x) * 4;
      pixels[i]     = 255; // R
      pixels[i + 1] = 77;  // G
      pixels[i + 2] = 77;  // B
      pixels[i + 3] = 255; // A
    }
  }
}

// Build PNG scanlines (filter byte 0 per row)
const rows = Buffer.alloc(H * (1 + W * 4));
for (let y = 0; y < H; y++) {
  rows[y * (1 + W * 4)] = 0;
  pixels.copy(rows, y * (1 + W * 4) + 1, y * W * 4, (y + 1) * W * 4);
}

const compressed = zlib.deflateSync(rows, { level: 9 });

// CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[i] = c;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const buf = Buffer.alloc(12 + data.length);
  buf.writeUInt32BE(data.length, 0);
  buf.write(type, 4, 'ascii');
  data.copy(buf, 8);
  const crcBuf = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  buf.writeUInt32BE(crc32(crcBuf), 8 + data.length);
  return buf;
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; ihdr[9] = 6; // bit depth 8, color type RGBA

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
  pngChunk('IHDR', ihdr),
  pngChunk('IDAT', compressed),
  pngChunk('IEND', Buffer.alloc(0)),
]);

const outDir = path.join(__dirname, '../assets');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'trayTemplate.png');
fs.writeFileSync(outPath, png);
console.log(`Written ${png.length} bytes → ${outPath}`);
