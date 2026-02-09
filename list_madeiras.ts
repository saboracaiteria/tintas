
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function run() {
    const categoryId = 'd049f0fc-f111-4774-bed6-24816be53704'; // From list_categories output (hopefully)

    // Or search for category first
    const { data: cat } = await supabase.from('categories').select('id, title').ilike('title', '%madeira%').single();

    if (cat) {
        console.log(`Found Category: ${cat.title} (${cat.id})`);
        const { data: products } = await supabase.from('products').select('id, name').eq('category_id', cat.id);
        console.log(`Found ${products?.length} products:`);
        products?.forEach(p => console.log(`- ${p.name}`));
    } else {
        console.log('Category not found');
    }
}

run();
