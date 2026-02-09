
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function run() {
    console.log('Checking if active column exists...');

    // Try to select 'active'
    const { data, error } = await supabase.from('products').select('id, active').limit(1);

    if (error) {
        console.error('Error selecting active:', error);
    } else {
        console.log('Success! Column likely exists.');
        console.log(data);
    }
}

run();
