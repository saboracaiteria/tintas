
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function run() {
    console.log('STARTING REMOVAL of non-paint products (EXCLUDING TINTA)...');

    // 1. Fetch candidates
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name')
        .or('name.ilike.%piso%,name.ilike.%cerâmica%,name.ilike.%ceramica%,name.ilike.%porcelanato%,name.ilike.%revestimento%');

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    // 2. Filter out "tinta" locally
    const toRemove = products.filter(p => {
        const name = p.name.toLowerCase();
        if (name.includes('tinta') || name.includes('pintura')) return false;
        return true;
    });

    if (toRemove.length === 0) {
        console.log('No products to remove.');
        return;
    }

    console.log(`Found ${toRemove.length} products to remove.`);

    // 3. Delete
    const idsToRemove = toRemove.map(p => p.id);
    const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .in('id', idsToRemove);

    if (deleteError) {
        console.error('Error deleting products:', deleteError);
    } else {
        console.log(`Successfully removed ${toRemove.length} products.`);
    }
}

run();
