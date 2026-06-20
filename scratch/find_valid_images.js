import fs from 'fs';
import https from 'https';

const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));

// Filter products that have image from rapidlabs, and check which ones work
const candidates = db.products.filter(p => p.image && p.image.includes('rapidlabs.co.uk') && p.image.startsWith('http'));

console.log(`Checking ${candidates.length} candidates from db.json...`);

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
  });
}

async function run() {
  const categories = {
    vials: [],
    caps: [],
    equipment: []
  };

  for (const p of candidates) {
    const name = p.name.toLowerCase();
    let type = null;
    if (name.includes('bottle') || name.includes('vial') || name.includes('jar')) {
      type = 'vials';
    } else if (name.includes('cap') || name.includes('closure') || name.includes('pipette') || name.includes('dropper')) {
      type = 'caps';
    } else if (name.includes('reader') || name.includes('analyzer') || name.includes('meter') || name.includes('device') || name.includes('test')) {
      type = 'equipment';
    }

    if (type) {
      const works = await checkUrl(p.image);
      if (works) {
        categories[type].push({ name: p.name, image: p.image });
        console.log(`Found working [${type}]: ${p.name} -> ${p.image}`);
      }
    }
  }

  console.log('Results:');
  console.log('Vials:', categories.vials.slice(0, 5));
  console.log('Caps:', categories.caps.slice(0, 5));
  console.log('Equipment:', categories.equipment.slice(0, 5));
}

run();
