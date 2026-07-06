/**
 * Convert public/aec_logo_v1.png → public/aec_logo_v1.webp
 * Run with: node scripts/convert-images.cjs
 */
const sharp = require('sharp');
const path = require('path');

const src  = path.join(__dirname, '../public/aec_logo_v1.png');
const out  = path.join(__dirname, '../public/aec_logo_v1.webp');

sharp(src)
  .webp({ quality: 85 })
  .toFile(out)
  .then(info => console.log(`✓ Converted to WebP: ${JSON.stringify(info)}`))
  .catch(err => console.error('✗ Conversion failed:', err));
