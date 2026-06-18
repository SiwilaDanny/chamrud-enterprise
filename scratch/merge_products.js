import fs from 'fs';

const dbPath = 'db.json';
const parsedPath = 'scratch/parsed_products.json';

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const parsedProducts = JSON.parse(fs.readFileSync(parsedPath, 'utf8'));

// Helper to determine the image URL for a product name
function getImageForName(name, existingImage) {
  if (existingImage && !existingImage.includes('reagent.png')) {
    return existingImage;
  }
  
  const upper = name.toUpperCase();
  if (upper.includes('MALARIA')) return '/uploads/malaria.png';
  if (upper.includes('HEPATITIS')) return '/uploads/hepatitis.png';
  if (upper.includes('PREGNANT') || upper.includes('HCG')) return '/uploads/pregnancy.png';
  if (upper.includes('SYPHILIS')) return '/uploads/syphilis.png';
  if (upper.includes('COVID')) return '/uploads/covid.png';
  if (upper.includes('TYPHOID') || upper.includes('WIDAL') || upper.includes('TYDAL')) return '/uploads/typhoid.png';
  if (upper.includes('PIPETTE') || upper.includes('TIP')) return '/uploads/pipette.png';
  if (upper.includes('TUBE')) return '/uploads/tubes.png';
  if (upper.includes('PETRI')) return '/uploads/petri_package.png';
  if (upper.includes('GLOVES')) return '/uploads/gloves_box.png';
  if (upper.includes('AGAR') || upper.includes('MULLER') || upper.includes('SIM') || upper.includes('TCB') || upper.includes('CLED')) return '/uploads/agar_package.png';
  if (upper.includes('ABX')) return '/uploads/abx_package.png';
  
  return '/uploads/reagent.png';
}

// Map parsed products to retain existing DB features if possible
const merged = parsedProducts.map(pp => {
  // Try to find a match in the existing DB
  const match = db.products.find(p => p.name.toUpperCase() === pp.name.toUpperCase() && p.unit === pp.unit);
  
  const sku = match ? match.sku : pp.sku;
  const image = getImageForName(pp.name, match ? match.image : null);
  const badge = match ? match.badge : 'In Stock';
  
  // Make image path relative to root if it starts with localhost, so it's clean and portable
  let cleanImage = image;
  if (cleanImage.includes('localhost:3001')) {
    cleanImage = cleanImage.replace('http://localhost:3001', '');
  }
  
  return {
    id: match ? match.id : pp.id,
    name: pp.name,
    sku: sku,
    price: pp.price,
    unit: pp.unit,
    category: pp.category,
    badge: badge,
    image: cleanImage
  };
});

// Write back to db.json
db.products = merged;
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log(`Merged and wrote ${db.products.length} products to db.json`);
