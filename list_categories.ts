
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function run() {
    const { data: categories, error } = await supabase.from('categories').select('*');
    if (error) console.error(error);
    else console.log(JSON.stringify(categories, null, 2));
}

run();
