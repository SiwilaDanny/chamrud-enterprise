import fs from 'fs';
import path from 'path';

// Parse a simple CSV line (handling quotes)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const csvDir = '/home/siwila/Downloads';
const csvFiles = [
  'rapidlabs-co-uk-2026-06-20.csv',
  'rapidlabs-co-uk-2026-06-20-2.csv',
  'rapidlabs-co-uk-2026-06-20-3.csv',
  'rapidlabs-co-uk-2026-06-20 (1).csv',
  'rapidlabs-co-uk-2026-06-20 (2).csv',
  'rapidlabs-co-uk-2026-06-20 (3).csv',
  'rapidlabs-co-uk-2026-06-20 (4).csv',
  'rapidlabs-co-uk-2026-06-20 (5).csv',
  'rapidlabs-co-uk-2026-06-20 (6).csv'
];

const csvMappings = new Map();

for (const file of csvFiles) {
  const fullPath = path.join(csvDir, file);
  if (!fs.existsSync(fullPath)) continue;
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = parseCSVLine(line);
    if (parts.length >= 4) {
      const title = parts[2].replace(/^"|"$/g, '').trim();
      const image = parts[3].replace(/^"|"$/g, '').trim();
      if (title && image && image.startsWith('http')) {
        csvMappings.set(title.toLowerCase().replace(/\s+/g, ' '), { title, image });
      }
    }
  }
}

const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));

console.log(`Checking ${csvMappings.size} unique CSV products against db.json:`);
let matchedCount = 0;
let unmatchedCount = 0;

for (const [csvKey, csvVal] of csvMappings.entries()) {
  const csvTitle = csvVal.title;
  const csvUrl = csvVal.image;
  
  // Find in DB
  let dbMatch = db.products.find(p => p.name.toLowerCase().replace(/\s+/g, ' ') === csvKey);
  
  if (!dbMatch) {
    // Try cleaner matching
    dbMatch = db.products.find(p => {
      const dbNameClean = p.name.toLowerCase().replace(/\s+/g, ' ');
      return dbNameClean.replace(/\(.*?\)/g, '').trim() === csvKey.replace(/\(.*?\)/g, '').trim();
    });
  }
  
  if (dbMatch) {
    matchedCount++;
    console.log(`✅ MATCHED: "${csvTitle}" -> DB: "${dbMatch.name}" (image: ${dbMatch.image})`);
  } else {
    unmatchedCount++;
    console.log(`❌ UNMATCHED: "${csvTitle}"`);
    // Find closest names in DB to help debug
    const matches = db.products.filter(p => {
      const words = csvTitle.toLowerCase().split(' ');
      const matchScore = words.filter(w => p.name.toLowerCase().includes(w)).length;
      return matchScore >= words.length - 2 && words.length >= 3;
    });
    if (matches.length > 0) {
      console.log(`   Suggestions:`);
      matches.slice(0, 3).forEach(m => {
        console.log(`     - "${m.name}" (image: ${m.image})`);
      });
    }
  }
}

console.log(`\nSummary: Matched ${matchedCount}, Unmatched ${unmatchedCount}`);
