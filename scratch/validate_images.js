import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';

const dbPath = 'db.json';
const uploadsDir = 'uploads';

if (!fs.existsSync(dbPath)) {
  console.error(`Database file ${dbPath} not found.`);
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const products = db.products || [];

console.log(`Starting validation of ${products.length} product images...\n`);

const brokenLocal = [];
const brokenRemote = [];
const checkedUrls = new Map();

// Helper to check remote URL status code via HEAD request
function checkUrl(url) {
  if (checkedUrls.has(url)) return checkedUrls.get(url);

  const promise = new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      const ok = res.statusCode >= 200 && res.statusCode < 400;
      resolve(ok);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });

  checkedUrls.set(url, promise);
  return promise;
}

// Concurrency limit runner
async function runWithConcurrency(tasks, concurrencyLimit) {
  const results = [];
  const executing = new Set();

  for (const task of tasks) {
    const p = Promise.resolve().then(() => task());
    results.push(p);
    executing.add(p);

    const clean = () => executing.delete(p);
    p.then(clean, clean);

    if (executing.size >= concurrencyLimit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

async function validate() {
  const tasks = [];

  for (const product of products) {
    const img = product.image;
    if (!img) {
      console.warn(`Product "${product.name}" (ID: ${product.id}) has no image field.`);
      continue;
    }

    if (img.startsWith('http://') || img.startsWith('https://')) {
      tasks.push(async () => {
        const ok = await checkUrl(img);
        if (!ok) {
          brokenRemote.push({ product: product.name, url: img });
          console.log(`❌ Remote Broken: "${product.name}" -> ${img}`);
        }
      });
    } else if (img.startsWith('/uploads/')) {
      tasks.push(async () => {
        const fileName = img.replace('/uploads/', '');
        const filePath = path.join(uploadsDir, fileName);
        if (!fs.existsSync(filePath)) {
          brokenLocal.push({ product: product.name, path: filePath });
          console.log(`❌ Local Missing: "${product.name}" -> ${filePath}`);
        }
      });
    } else {
      console.warn(`Product "${product.name}" has an unrecognized image format: ${img}`);
    }
  }

  // Run validation tasks with a concurrency of 30
  await runWithConcurrency(tasks, 30);

  console.log('\n--- Validation Summary ---');
  console.log(`Total Products: ${products.length}`);
  console.log(`Broken Remote Images: ${brokenRemote.length}`);
  console.log(`Missing Local Images: ${brokenLocal.length}`);

  if (brokenRemote.length > 0 || brokenLocal.length > 0) {
    console.log('\n❌ Validation Failed: Broken or missing assets were found.');
    process.exit(1);
  } else {
    console.log('\n✅ Validation Succeeded: All image assets are fully operational.');
    process.exit(0);
  }
}

validate().catch(err => {
  console.error('Validation error:', err);
  process.exit(1);
});
