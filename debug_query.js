const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log('--- TEST 1: Simple Select ---');
    const { data: d1, error: e1 } = await supabase.from('products').select('name').limit(1);
    if (e1) console.error('Test 1 Error:', e1);
    else console.log('Test 1 Success:', d1);

    console.log('\n--- TEST 2: Join Query (The failing one) ---');
    const { data: d2, error: e2 } = await supabase.from('products').select(`
        *,
        product_group_relations (group_id)
    `).limit(1);

    if (e2) {
        console.error('Test 2 Error:', JSON.stringify(e2, null, 2));
    } else {
        console.log('Test 2 Success:', d2.length, 'products');
    }
}

debug();
