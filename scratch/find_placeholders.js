/**
 * Find products in Supabase that still have placeholder/generic images
 * i.e. NOT using a rapidlabs_ prefixed image
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`^${name}=(.+)$`, 'm'));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY') || getEnvVar('VITE_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  let allProducts = [];
  let from = 0;
  const step = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, image, source')
      .range(from, from + step - 1);

    if (error) { console.error('Error:', error.message); break; }
    if (!data || data.length === 0) break;
    allProducts = allProducts.concat(data);
    if (data.length < step) break;
    from += step;
  }

  console.log(`\nTotal products: ${allProducts.length}`);

  // Products without rapidlabs images
  const noRapidlabs = allProducts.filter(p => {
    if (!p.image) return true;
    const filename = p.image.split('/').pop() || '';
    return !filename.startsWith('rapidlabs_') && !filename.match(/^\d{13}-\d+\./);
  });

  // RapidLabs source products without rapidlabs images
  const rapidlabsNoImg = allProducts.filter(p => {
    if (!p.source || !p.source.toLowerCase().includes('rapid')) return false;
    const filename = (p.image || '').split('/').pop() || '';
    return !filename.startsWith('rapidlabs_');
  });

  console.log(`\nProducts with non-rapidlabs images: ${noRapidlabs.length}`);
  console.log(`RapidLabs source products missing rapidlabs images: ${rapidlabsNoImg.length}`);

  if (rapidlabsNoImg.length > 0) {
    console.log('\n--- RapidLabs products still missing correct images ---');
    rapidlabsNoImg.forEach(p => {
      const img = (p.image || '').split('/').pop();
      console.log(`  [${p.id}] ${p.name} => ${img || 'NO IMAGE'}`);
    });
  }
}

main().catch(console.error);
