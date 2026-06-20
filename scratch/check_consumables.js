import fs from 'fs';

const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
const consumables = db.products.filter(p => p.category === 'Lab Consumables' || p.category === 'Consumables');

console.log(`Found ${consumables.length} products in Lab Consumables:`);
console.log(consumables.map(p => ({ name: p.name, image: p.image })));
