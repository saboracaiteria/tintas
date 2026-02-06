
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCategories() {
    console.log('--- TEST: Fetch Categories ---');

    // Try exact query from App.tsx
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

    if (error) {
        console.error('❌ Error fetching categories:', JSON.stringify(error, null, 2));
    } else {
        console.log(`✅ Success! Found ${data?.length} categories.`);
        if (data && data.length > 0) {
            console.log('Sample category:', data[0]);
        } else {
            console.warn('⚠️ No categories found. Table might be empty.');
        }
    }
}

testCategories();
