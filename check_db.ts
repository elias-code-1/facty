import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let envContent = '';
try {
  envContent = fs.readFileSync('.env', 'utf-8');
} catch (e) {
  console.log('No .env file found');
}

const getEnv = (key: string) => {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : process.env[key];
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkContent() {
  const { data, error } = await supabase.from('landing_page_content').select('*');
  console.log(JSON.stringify(data, null, 2));
}

checkContent();
