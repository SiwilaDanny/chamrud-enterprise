import fs from 'fs';

const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
const matches = db.products.filter(p => 
  p.image === '/uploads/empty_tubes.png' && 
  !p.name.toUpperCase().includes('TUBE') &&
  !p.name.toUpperCase().includes('EDTA')
);

console.log(`Found ${matches.length} non-tube/non-EDTA products mapped to empty_tubes.png:`);
matches.forEach(p => {
  console.log(`- ${p.name} (${p.category})`);
});
