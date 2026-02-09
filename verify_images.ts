
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) { console.error('Missing Supabase credentials'); process.exit(1); }
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    const { data, error } = await supabase.from('products').select('name, image').limit(10);
    if (error) console.error(error);
    else console.table(data);
}

verify();
