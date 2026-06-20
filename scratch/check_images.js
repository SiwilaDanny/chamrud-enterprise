import fs from 'fs';
import https from 'https';
import http from 'http';

const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));

console.log(`Checking ${db.products.length} products...`);

const remoteProducts = db.products.filter(p => p.image && p.image.startsWith('http') && !p.image.includes('localhost'));

console.log(`Found ${remoteProducts.length} products with remote images.`);

async function checkUrl(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve(res.statusCode);
    });
    req.on('error', (err) => {
      resolve(500);
    });
    req.on('timeout', () => {
      req.destroy();
      resolve(408);
    });
    req.end();
  });
}

async function run() {
  const broken = [];
  for (let i = 0; i < remoteProducts.length; i++) {
    const p = remoteProducts[i];
    const status = await checkUrl(p.image);
    if (status !== 200) {
      console.log(`[Broken] ${p.name} (${p.sku}) -> ${p.image} (Status: ${status})`);
      broken.push({ id: p.id, name: p.name, image: p.image, status });
    } else {
      if (i % 50 === 0) {
        console.log(`Checked ${i}/${remoteProducts.length} remote images...`);
      }
    }
  }
  console.log(`Done. Found ${broken.length} broken remote images.`);
}

run();
