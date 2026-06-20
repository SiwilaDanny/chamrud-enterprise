import fs from 'fs';

const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
const keywords = ['SPIRIT', 'METHANOL', 'ETHANOL', 'ALCOHOL', 'ACID', 'WATER', 'ETHER', 'FORMALIN', 'ACETONE'];

const matches = db.products.filter(p => {
  const upperName = p.name.toUpperCase();
  return keywords.some(kw => upperName.includes(kw));
});

console.log(`Found ${matches.length} matching chemical products:`);
matches.forEach(p => {
  console.log(`- ${p.name} (${p.category}) -> currently: ${p.image}`);
});
