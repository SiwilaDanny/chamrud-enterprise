import https from 'https';
import fs from 'fs';
import path from 'path';

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    };
    https.get(url, options, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(dest);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  const images = [
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Microscope_slide_and_cover_slip.JPG',
      dest: 'uploads/coverslips.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Microscope_slides.jpg',
      dest: 'uploads/glass_slides.jpg'
    }
  ];

  for (const img of images) {
    try {
      console.log(`Downloading ${img.url}...`);
      await downloadFile(img.url, img.dest);
      console.log(`Successfully downloaded to ${img.dest}`);
    } catch (err) {
      console.error(`Error downloading ${img.url}:`, err.message);
    }
  }
}

run();
