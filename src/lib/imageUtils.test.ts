/**
 * fixCloudinaryCloud rewrites only the exact old Cloudinary cloud prefix.
 * Run: npx ts-node --transpile-only -O '{"module":"commonjs","moduleResolution":"node"}' src/lib/imageUtils.test.ts
 */
import assert from 'node:assert';
import { fixCloudinaryCloud, getImageUrl, cloudinaryResized, cloudinarySrcSet } from './imageUtils';

const NEW = 'https://res.cloudinary.com/luxygalleria-staging/';
const rest = [
  'image/upload/v1788956328/luxygalleria_products/mobileImage-1788956675978.webp',
  'image/upload/w_400,c_fill,q_auto/v1/luxygalleria_products/a.webp',
  'image/upload/v1/folder/b.png?_a=BAMAK+cQ0',
];
for (const r of rest) {
  assert.strictEqual(fixCloudinaryCloud(`https://res.cloudinary.com/dlysz5wmo/${r}`), NEW + r);
  assert.strictEqual(getImageUrl(`https://res.cloudinary.com/dlysz5wmo/${r}`), NEW + r);
}
assert.strictEqual(fixCloudinaryCloud('http://res.cloudinary.com/dlysz5wmo/image/upload/v1/x.png'), 'http://res.cloudinary.com/luxygalleria-staging/image/upload/v1/x.png');
// Left alone: other clouds, look-alike names, other hosts, local paths, data URIs, already-new URLs
for (const u of [
  'https://res.cloudinary.com/other/image/upload/v1/x.png',
  'https://res.cloudinary.com/dlysz5wmox/image/upload/v1/x.png',
  'https://images.unsplash.com/photo-1?w=600',
  'https://example.com/res.cloudinary.com/dlysz5wmo/x.png',
  '/images/x.png',
  'data:image/svg+xml;utf8,<svg/>',
  `${NEW}image/upload/v1/x.png`,
]) assert.strictEqual(fixCloudinaryCloud(u), u, u);
assert.strictEqual(fixCloudinaryCloud(fixCloudinaryCloud(`https://res.cloudinary.com/dlysz5wmo/${rest[0]}`)), NEW + rest[0]);
console.log('✅ fixCloudinaryCloud: exact old-cloud prefix only; path, transformations and query kept; idempotent');

// Cloudinary sizing: transform only plain Cloudinary uploads, once
{
  const RAW = 'https://res.cloudinary.com/luxygalleria-staging/image/upload/v1793863223/luxygalleria_products/imageFile-1.png';
  assert.strictEqual(cloudinaryResized(RAW, 360), 'https://res.cloudinary.com/luxygalleria-staging/image/upload/f_auto,q_auto,c_limit,w_360/v1793863223/luxygalleria_products/imageFile-1.png');
  assert.strictEqual(cloudinaryResized(cloudinaryResized(RAW, 360), 720), cloudinaryResized(RAW, 360), 'already transformed: unchanged');
  const T = 'https://res.cloudinary.com/x/image/upload/w_100,h_100/v1/a.jpg';
  assert.strictEqual(cloudinaryResized(T, 360), T, 'existing transformation kept');
  for (const u of ['/luxy_logo.png', 'http://localhost:5000/uploads/a.png', 'https://res.cloudinary.com/x/video/upload/v1/a.mp4', 'https://evil.example/res.cloudinary.com/x/image/upload/a.png', 'data:image/png;base64,AA'])
    assert.strictEqual(cloudinaryResized(u, 360), u, u);
  assert.strictEqual(cloudinarySrcSet(RAW, [240, 480]), `${cloudinaryResized(RAW, 240)} 240w, ${cloudinaryResized(RAW, 480)} 480w`);
  assert.strictEqual(cloudinarySrcSet('/luxy_logo.png', [240]), undefined);
  assert.strictEqual(cloudinarySrcSet(T, [240]), undefined, 'pre-transformed: no srcset');
  console.log('✅ cloudinaryResized / cloudinarySrcSet: f_auto,q_auto,c_limit,w_N on plain uploads only; others untouched');
}
