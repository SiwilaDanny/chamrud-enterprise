import https from 'https';

const urls = [
  "https://www.rapidlabs.co.uk/wp-content/uploads/Rapid-Test-Device-box-42-300x300.jpg",
  "https://www.rapidlabs.co.uk/wp-content/uploads/30ml-blue-bottle-with-gold-atomiser-300x300.jpg",
  "https://www.rapidlabs.co.uk/wp-content/uploads/5ml-BL-TE-cap-and-DI-300x300.jpg",
  "https://www.rapidlabs.co.uk/wp-content/uploads/Contec-Fluorescence-Immunoassay-Analyzer-FIA-1200-300x300.png"
];

for (const url of urls) {
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    console.log(`${url} -> Status: ${res.statusCode}`);
  }).on('error', (e) => {
    console.log(`${url} -> Error: ${e.message}`);
  });
}
