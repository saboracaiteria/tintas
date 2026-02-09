
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function run() {
    console.log('Searching for potential non-paint products (EXCLUDING TINTA)...');

    // 1. Fetch candidates
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, description, category_id')
        .or('name.ilike.%piso%,name.ilike.%cerâmica%,name.ilike.%ceramica%,name.ilike.%porcelanato%,name.ilike.%revestimento%');

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    // 2. Filter out "tinta" locally (safer)
    const toRemove = products.filter(p => {
        const name = p.name.toLowerCase();
        // Keep if it contains "tinta" or "pintura"
        if (name.includes('tinta') || name.includes('pintura')) return false;
        return true;
    });

    console.log(`Found ${toRemove.length} products to remove (out of ${products.length} candidates):`);
    toRemove.forEach(p => {
        console.log(`- [${p.id}] ${p.name}`);
    });
}

run();
