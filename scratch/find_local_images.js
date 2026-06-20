import fs from 'fs';
import path from 'path';

function getFiles(dir) {
  const subdirs = fs.readdirSync(dir);
  const files = subdirs.map(subdir => {
    const res = path.resolve(dir, subdir);
    return fs.statSync(res).isDirectory() ? getFiles(res) : res;
  });
  return files.reduce((a, f) => a.concat(f), []);
}

const allFiles = getFiles('.');
const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'];
const images = allFiles.filter(f => 
  imageExtensions.includes(path.extname(f).toLowerCase()) &&
  !f.includes('node_modules') &&
  !f.includes('.git') &&
  !f.includes('.gemini')
);

console.log(`Found ${images.length} images:`);
console.log(images.map(f => path.relative(process.cwd(), f)));
