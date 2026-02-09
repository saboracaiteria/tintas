
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function run() {
    console.log('Analyzing paint products...');

    const terms = ['vivac', 'evolution', 'piso', 'veloz', 'elite'];
    // "vivaco" might be "vivacor"? "evolulions" -> "evolution"

    for (const term of terms) {
        const { data, error } = await supabase
            .from('products')
            .select('id, name, price, category_id')
            .ilike('name', `%${term}%`);

        if (error) {
            console.error(`Error searching for ${term}:`, error);
            continue;
        }

        console.log(`\n--- Found ${data.length} products for "${term}" ---`);
        if (data.length > 0) {
            // Show first 10
            data.slice(0, 10).forEach(p => console.log(`[${p.id}] ${p.name} - R$ ${p.price}`));
            if (data.length > 10) console.log(`... and ${data.length - 10} more.`);
        }
    }
}

run();
