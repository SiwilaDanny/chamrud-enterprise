import fs from 'fs';

const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));

const usedGenImages = new Map();
db.products.forEach(p => {
  if (p.image && p.image.includes('17817')) {
    if (!usedGenImages.has(p.image)) {
      usedGenImages.set(p.image, []);
    }
    usedGenImages.get(p.image).push(p.name);
  }
});

console.log('Generated/uploaded images used by products:');
for (const [img, products] of usedGenImages.entries()) {
  console.log(`\nImage: ${img}`);
  console.log(`Used by (${products.length} products):`, products.slice(0, 5));
}
