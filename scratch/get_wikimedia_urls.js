import https from 'https';

function getCommonsImageUrl(fileName) {
  return new Promise((resolve, reject) => {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&format=json`;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    };
    https.get(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          const pages = data.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pageId === '-1') {
            resolve(null);
            return;
          }
          const url = pages[pageId].imageinfo[0].url;
          resolve(url);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const files = [
    'Microscope slides.jpg',
    'Microscope slides and coverslips.jpg',
    'Glass slide.jpg',
    'Glass slides.jpg',
    'Microscope-slide.jpg',
    'Microscope slide.jpg'
  ];

  for (const f of files) {
    try {
      const url = await getCommonsImageUrl(f);
      console.log(`File: ${f} -> URL: ${url}`);
    } catch (e) {
      console.error(`Error for ${f}:`, e.message);
    }
  }
}

run();
