
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function check() {
    const { data: products } = await supabase
        .from('products')
        .select('id, name, created_at')
        .in('name', ['Tinta Destack (Premium)', 'Tinta Spray Multiuso'])
        .order('created_at', { ascending: false });

    console.log('Found Masters:', products);
}

check();
