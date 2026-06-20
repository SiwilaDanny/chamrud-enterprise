import fs from 'fs';

const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));

const localPlaceholderRlProducts = db.products.filter(p => p.source === 'Rapid Labs' && p.image && !p.image.startsWith('http'));

console.log(`Found ${localPlaceholderRlProducts.length} Rapid Labs products with local placeholder images.`);
if (localPlaceholderRlProducts.length > 0) {
  console.log('Sample placeholder products:');
  console.log(localPlaceholderRlProducts.slice(0, 10).map(p => ({ name: p.name, category: p.category, image: p.image })));
}
