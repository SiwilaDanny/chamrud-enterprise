import fs from 'fs';

const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
const matches = db.products.filter(p => p.image === '/uploads/empty_tubes.png');

console.log(`Found ${matches.length} products mapped to empty_tubes.png:`);
matches.forEach(p => {
  console.log(`- ${p.name} (${p.category})`);
});
