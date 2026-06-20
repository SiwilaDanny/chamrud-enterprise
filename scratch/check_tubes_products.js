import fs from 'fs';

const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));

const targets = db.products.filter(p => 
  p.name.toUpperCase().includes('EDTA') ||
  p.name.toUpperCase().includes('TUBE') ||
  p.name.toUpperCase().includes('SLIP') ||
  p.name.toUpperCase().includes('SLIDE')
);

console.log(`Found ${targets.length} matching products:`);
console.log(targets.map(p => ({ id: p.id, name: p.name, category: p.category, image: p.image })));
