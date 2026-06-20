import fs from 'fs';

const dbPath = 'db.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let count = 0;
db.products.forEach(p => {
  if (p.image && p.image.includes('http://localhost:3001/uploads/')) {
    p.image = p.image.replace('http://localhost:3001/uploads/', '/uploads/');
    count++;
  }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log(`Updated ${count} product image URLs in db.json to be relative paths.`);
