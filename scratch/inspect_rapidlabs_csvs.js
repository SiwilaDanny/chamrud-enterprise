import fs from 'fs';
import path from 'path';

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

for (const file of files) {
  const fullPath = path.join(csvDir, file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    console.log(`\n=== FILE: ${file} (lines: ${lines.length}) ===`);
    console.log(`Header: ${lines[0]}`);
    console.log(`Row 1:  ${lines[1]}`);
    console.log(`Row 2:  ${lines[2]}`);
  } else {
    console.log(`File not found: ${file}`);
  }
}
