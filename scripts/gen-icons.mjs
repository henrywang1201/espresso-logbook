// Rasterize the dial-logo SVGs into the PNG icons the PWA manifest + iOS need.
// Run with: npm run icons
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const jobs = [
  { src: 'favicon.svg',        out: 'icon-192.png',          size: 192 },
  { src: 'favicon.svg',        out: 'icon-512.png',          size: 512 },
  // iOS masks corners itself, so use the full-bleed art (no transparent corners).
  { src: 'icon-maskable.svg',  out: 'apple-touch-icon.png',  size: 180, flatten: '#5a331a' },
  { src: 'icon-maskable.svg',  out: 'icon-maskable-512.png', size: 512 },
];

for (const j of jobs) {
  const svg = await readFile(join(pub, j.src));
  let img = sharp(svg, { density: 384 }).resize(j.size, j.size);
  if (j.flatten) img = img.flatten({ background: j.flatten }); // iOS icons want no alpha
  await img.png().toFile(join(pub, j.out));
  console.log('✓', j.out, `(${j.size}×${j.size})`);
}
console.log('icons done');
