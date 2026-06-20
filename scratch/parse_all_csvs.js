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
const files = [
  'rapidlabs-co-uk-2026-06-20.csv',
  'rapidlabs-co-uk-2026-06-20-2.csv',
  'rapidlabs-co-uk-2026-06-20 (1).csv',
  'rapidlabs-co-uk-2026-06-20 (2).csv',
  'rapidlabs-co-uk-2026-06-20 (3).csv',
  'rapidlabs-co-uk-2026-06-20 (4).csv',
  'rapidlabs-co-uk-2026-06-20 (5).csv',
  'rapidlabs-co-uk-2026-06-20 (6).csv'
];

const mappings = new Map();

for (const file of files) {
  const fullPath = path.join(csvDir, file);
  if (!fs.existsSync(fullPath)) continue;
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = parseCSVLine(line);
    if (parts.length >= 4) {
      const title = parts[2].replace(/^"|"$/g, '').trim();
      const image = parts[3].replace(/^"|"$/g, '').trim();
      if (title && image) {
        mappings.set(title.toUpperCase(), { title, image });
      }
    }
  }
}

console.log(`Found ${mappings.size} unique title mappings in CSV files:`);
for (const [key, val] of mappings.entries()) {
  console.log(`- "${val.title}" -> "${val.image}"`);
}
