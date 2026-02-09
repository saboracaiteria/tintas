
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function run() {
    const { data: products } = await supabase.from('products').select('id, name');
    if (products) {
        const lines = products.map(p => `${p.name} [${p.id}]`).join('\n');
        fs.writeFileSync('all_products.txt', lines);
        console.log(`Saved ${products.length} products to all_products.txt`);
    }
}

run();
