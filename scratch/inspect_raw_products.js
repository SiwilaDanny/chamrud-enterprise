import fs from 'fs';

const PAGE_FILES = Array.from({ length: 20 }, (_, index) => `/tmp/rapid-all-products-p${index + 1}.json`);

const targets = [
  'Urinalysis Liquid Controls',
  'Benzodiazepines',
  'RPR Test Cards'
];

for (const file of PAGE_FILES) {
  if (!fs.existsSync(file)) continue;
  const products = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const p of products) {
    for (const target of targets) {
      if (p.name.includes(target)) {
        console.log(`Found raw product for target '${target}' in ${file}:`);
        console.log(JSON.stringify({
          id: p.id,
          name: p.name,
          images: p.images,
          categories: p.categories
        }, null, 2));
      }
    }
  }
}
