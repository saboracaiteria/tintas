
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function run() {
    console.log('Checking for remaining active Tinta products...');

    const { data: products } = await supabase
        .from('products')
        .select('name, price')
        .eq('active', true)
        .ilike('name', '%Tinta%')
        .order('name');

    if (!products) return;

    console.log(`Found ${products.length} active products with "Tinta".`);

    // Group by similar names to spot missed groups
    const potentialGroups: Record<string, number> = {};

    products.forEach(p => {
        // Simple tokenizer: first 2 words
        const words = p.name.split(' ').slice(0, 2).join(' ').toLowerCase();
        potentialGroups[words] = (potentialGroups[words] || 0) + 1;
    });

    Object.entries(potentialGroups)
        .filter(([_, count]) => count > 3) // If more than 3 similar items, might be a group
        .forEach(([name, count]) => {
            console.log(`Potential Group: "${name}" - Count: ${count}`);
        });

    console.log('\nSample of remaining products:');
    products.slice(0, 10).forEach(p => console.log(`- ${p.name}`));
}

run();
