import fs from 'fs';
import https from 'https';

const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));

// Get all unique image URLs from rapidlabs in db.json
const urls = Array.from(new Set(
  db.products
    .map(p => p.image)
    .filter(img => img && img.includes('rapidlabs.co.uk') && img.startsWith('http'))
));

console.log(`Checking ${urls.length} unique rapidlabs image URLs...`);

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', () => {
      resolve({ url, status: 500 });
    });
  });
}

async function run() {
  const results = [];
  // Run checks in chunks of 20 to be polite and fast
  const chunkSize = 20;
  for (let i = 0; i < urls.length; i += chunkSize) {
    const chunk = urls.slice(i, i + chunkSize);
    const promises = chunk.map(url => checkUrl(url));
    const chunkRes = await Promise.all(promises);
    results.push(...chunkRes);
    console.log(`Checked ${results.length}/${urls.length}...`);
  }

  const working = results.filter(r => r.status === 200).map(r => r.url);
  console.log(`Found ${working.length} working URLs.`);

  // Write working ones to a temp file
  fs.writeFileSync('scratch/working_rapidlabs_urls.json', JSON.stringify(working, null, 2));
  console.log('Saved working URLs to scratch/working_rapidlabs_urls.json');
}

run();
