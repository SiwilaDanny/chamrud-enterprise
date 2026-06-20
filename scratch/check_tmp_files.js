import fs from 'fs';
import path from 'path';

const files = fs.readdirSync('/tmp');
const filtered = files.filter(f => f.includes('rapid'));
console.log(`Found ${filtered.length} files in /tmp matching 'rapid':`);
console.log(filtered);
