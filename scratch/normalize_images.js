import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let updatedCount = 0;

db.products = db.products.map(product => {
  const name = product.name.toUpperCase();
  const category = product.category;
  let newImage = product.image;

  // Let's check keywords to assign the most accurate image
  if (name.includes('MALARIA')) {
    newImage = '/uploads/malaria.png';
  } else if (name.includes('PREGNAN') || name.includes('HCG')) {
    newImage = '/uploads/pregnancy.png';
  } else if (name.includes('SYPHILIS') || name.includes('VDRL')) {
    newImage = '/uploads/syphilis.png';
  } else if (name.includes('TYPHOID')) {
    newImage = '/uploads/typhoid.png';
  } else if (name.includes('HEPATITIS') || name.includes('HBSAG') || name.includes('HBV')) {
    newImage = '/uploads/hepatitis.png';
  } else if (name.includes('COVID') || name.includes('CORONA') || name.includes('SARS')) {
    newImage = '/uploads/covid.png';
  } else if (name.includes('PIPETTE') || name.includes('TIPS') || name.includes('TIP') || name.includes('MICROP')) {
    newImage = '/uploads/pipette.png';
  } else if (name.includes('PETRI') || name.includes('PLATE') || name.includes('DISH')) {
    newImage = '/uploads/petri.png';
  } else if (name.includes('TUBE') || name.includes('VIAL') || name.includes('EPPENDORF') || name.includes('CRYO')) {
    newImage = '/uploads/tubes.png';
  } else if (name.includes('GLOVE') || name.includes('GLOVES')) {
    newImage = '/uploads/gloves_box.png';
  } else if (name.includes('AGAR') || name.includes('BROTH') || name.includes('MEDIA') || name.includes('PEPTONE') || name.includes('MUELLER') || name.includes('INFUSION') || name.includes('POWDER')) {
    newImage = '/uploads/agar_package.png';
  } else if (name.includes('DISC') || name.includes('DISCS') || name.includes('SENSITIVITY') || name.includes('ANTIBIO')) {
    newImage = '/uploads/abx_package.png';
  } else if (category === 'Lab Consumables' || category === 'Consumables') {
    newImage = '/uploads/empty_tubes.png';
  } else if (category === 'Reagents' || category === 'Microbiology Reagents') {
    newImage = '/uploads/reagent.png';
  }

  // Only count as updated if the image changed
  if (product.image !== newImage) {
    product.image = newImage;
    updatedCount++;
  }

  return product;
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log(`Successfully updated ${updatedCount} product images in db.json!`);
