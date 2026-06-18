import fs from 'fs';
import path from 'path';

const content = fs.readFileSync('price_list_layout.txt', 'utf8');
const lines = content.split('\n');

const products = [];
let currentCategory = 'Diagnostics'; // Default category

const IGNORED_KEYWORDS = [
  'CHAMRUD ENTERPRISE',
  'EMAIL:',
  'CONTACTS:',
  'LOCATION:',
  'DESCRIPTION',
  'NOTE:',
  'BUT THEY ARE AVAILABLE',
  'YOU BETTER',
  'PREPARED BY:',
  'DIRECTOR',
  'DEPENDS ON THE MACHINE'
];

let pendingDescription = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  
  // Check if we should ignore
  if (IGNORED_KEYWORDS.some(kw => line.toUpperCase().includes(kw))) {
    continue;
  }
  
  // Extract columns based on character index offsets
  // DESCRIPTION: 0 to 37
  // PACKAGE SIZE: 37 to 55
  // UNIT PRICE: 55 to end
  let desc = line.substring(0, 37).replace(/\f/g, '').trim();
  let pkg = line.substring(37, 56).trim();
  let priceStr = line.substring(56).trim();
  
  // Check if this line is actually a category header
  if (desc && !pkg && !priceStr) {
    const upper = desc.toUpperCase();
    if (upper === 'RAPID TETS') {
      currentCategory = 'Diagnostics';
      continue;
    } else if (upper === 'FBC REAGEATS') {
      currentCategory = 'Reagents';
      continue;
    } else if (upper === 'OTHER LAB CONSUMMABLES') {
      currentCategory = 'Lab Consumables';
      continue;
    } else if (upper === 'MICROBIOLOGY REAGETS') {
      currentCategory = 'Microbiology Reagents';
      continue;
    } else if (upper === 'CHEMISTRY REAGENTS') {
      currentCategory = 'Chemistry Reagents';
      continue;
    }
    
    // If it's a multi-line product description, buffer it
    if (pendingDescription) {
      pendingDescription += ' ' + desc;
    } else {
      pendingDescription = desc;
    }
    continue;
  }
  
  // If we have package size and price
  if (pkg || priceStr) {
    let finalDesc = desc;
    if (pendingDescription) {
      finalDesc = pendingDescription + (desc ? ' ' + desc : '');
      pendingDescription = '';
    }
    
    // Check if it's a valid product line
    if (finalDesc) {
      // Clean up finalDesc (e.g. remove trailing parenthesis/commas if they got cut off)
      products.push({
        id: 'p_' + Math.random().toString(36).substr(2, 9),
        name: finalDesc.toUpperCase(),
        sku: 'SKU: ' + finalDesc.substring(0, 4).replace(/[^A-Za-z0-9]/g, '').toUpperCase() + '-' + Math.round(Math.random() * 1000),
        price: 'K ' + priceStr,
        unit: pkg.toLowerCase().startsWith('per') ? pkg : 'per ' + pkg,
        category: currentCategory,
        badge: 'In Stock',
        image: '/uploads/reagent.png' // default fallback
      });
    }
  }
}

console.log(`Parsed ${products.length} products:`);
console.log(JSON.stringify(products.slice(0, 15), null, 2));

// Save parsed products to scratch
fs.writeFileSync('scratch/parsed_products.json', JSON.stringify(products, null, 2));
