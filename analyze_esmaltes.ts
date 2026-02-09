
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function run() {
    console.log('Analyzing ESMALTE and SIZES...');

    // 1. Search for Esmaltes
    const { data: esmaltes, error } = await supabase
        .from('products')
        .select('id, name, price')
        .ilike('name', '%esmalte%');

    if (error) console.error('Error fetching esmaltes:', error);
    else {
        console.log(`\n--- Found ${esmaltes.length} ESMALTE products ---`);
        esmaltes.forEach(p => console.log(`[${p.id}] ${p.name} - R$ ${p.price}`));
    }

    // 2. Search for Tinta patterns (Vivacor, Piso) to see sizes
    const { data: tintas, error: errorTintas } = await supabase
        .from('products')
        .select('id, name, price')
        .or('name.ilike.%vivacor%,name.ilike.%piso%');

    if (errorTintas) console.error('Error fetching tintas:', errorTintas);
    else {
        console.log(`\n--- Found ${tintas.length} TINTA products (Sample) ---`);
        // Group by size roughly
        const sizes: Record<string, number> = {};
        tintas.forEach(p => {
            const match = p.name.match(/(\d+(\.\d+)?\s?(L|LT|ML|KG))/i);
            const size = match ? match[0].toUpperCase() : 'UNKNOWN';
            sizes[size] = (sizes[size] || 0) + 1;
        });
        console.log('Detected Sizes:', sizes);

        // List a few examples of each size
        console.log('Examples:');
        tintas.slice(0, 15).forEach(p => console.log(`[${p.id}] ${p.name} - R$ ${p.price}`));
    }
}

run();
