import fs from 'fs';

const PAGE_FILES = Array.from({ length: 20 }, (_, index) => `/tmp/rapid-all-products-p${index + 1}.json`);

for (const file of PAGE_FILES) {
  if (!fs.existsSync(file)) continue;
  const products = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const p of products) {
    if (p.name.toUpperCase().includes('EDTA') || p.name.toUpperCase().includes('VACUUM') || p.name.toUpperCase().includes('BLOOD COLLECTION')) {
      console.log(`Found product in ${file}:`);
      console.log(JSON.stringify({ name: p.name, images: p.images }, null, 2));
    }
  }
}
