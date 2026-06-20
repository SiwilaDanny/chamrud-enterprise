import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to download files using system curl which has proven compatibility
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    try {
      const cmd = `curl -L -o "${dest}" "${url}"`;
      execSync(cmd, { stdio: 'ignore' });
      resolve(dest);
    } catch (err) {
      reject(err);
    }
  });
}

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

async function run() {
  const csvDir = '/home/siwila/Downloads';
  const csvFiles = fs.readdirSync(csvDir).filter(file => file.startsWith('rapidlabs-co-uk-') && file.endsWith('.csv'));

  // Parse all CSV files and build a mapping of lowercase/trimmed title -> image URL
  const csvMappings = new Map();
  
  for (const file of csvFiles) {
    const fullPath = path.join(csvDir, file);
    if (!fs.existsSync(fullPath)) {
      console.log(`Skipping missing CSV file: ${file}`);
      continue;
    }
    
    console.log(`Reading CSV: ${file}`);
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = parseCSVLine(line);
      if (parts.length >= 4) {
        const title = parts[2].replace(/^"|"$/g, '').trim();
        const image = parts[3].replace(/^"|"$/g, '').trim();
        if (title && image && image.startsWith('http')) {
          const key = title.toLowerCase().replace(/\s+/g, ' ');
          csvMappings.set(key, image);
        }
      }
    }
  }

  console.log(`\nAggregated ${csvMappings.size} unique product mappings from CSVs.`);

  // Load current db.json
  const dbPath = 'db.json';
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  let updatedCount = 0;

  for (const product of db.products) {
    const dbNameClean = product.name.toLowerCase().replace(/\s+/g, ' ');
    
    // Check if we have a mapping in our CSV
    let mappedUrl = csvMappings.get(dbNameClean);
    
    // If not direct match, try a fallback match (e.g. without (Pack of X) or (Box of Y) if needed, or by checking if one includes the other)
    if (!mappedUrl) {
      for (const [csvTitleClean, url] of csvMappings.entries()) {
        if (dbNameClean === csvTitleClean || 
            dbNameClean.replace(/\(.*?\)/g, '').trim() === csvTitleClean.replace(/\(.*?\)/g, '').trim()) {
          mappedUrl = url;
          break;
        }
      }
    }
    
    if (mappedUrl) {
      // Extract original file name from URL
      const urlObj = new URL(mappedUrl);
      const pathname = urlObj.pathname;
      const baseName = path.basename(pathname);
      const ext = path.extname(baseName) || '.png';
      
      // Sanitized local file name
      // e.g. "rapidlabs_P1070465.jpg" or "rapidlabs_10ml-white-bamboo-300x300.png"
      const localFilename = `rapidlabs_${baseName}`;
      const localPath = path.join('uploads', localFilename);
      
      console.log(`Matching: "${product.name}" -> URL: ${mappedUrl}`);
      
      try {
        if (!fs.existsSync(localPath)) {
          console.log(`Downloading: ${mappedUrl} -> ${localPath}`);
          await downloadFile(mappedUrl, localPath);
          await sleep(500);
        } else {
          console.log(`Already downloaded: ${localPath}`);
        }
        
        const relativeUrlPath = `/uploads/${localFilename}`;
        if (product.image !== relativeUrlPath) {
          product.image = relativeUrlPath;
          updatedCount++;
        }
      } catch (err) {
        console.error(`Failed to download ${mappedUrl} for "${product.name}":`, err.message);
      }
    }
  }

  if (updatedCount > 0) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
    console.log(`\nSuccessfully updated ${updatedCount} product images in db.json!`);
  } else {
    console.log('\nNo product images needed updating in db.json.');
  }
}

run();
