
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function run() {
    console.log('Analyzing Phase 3 Candidates...');

    // Keywords: "semi brilho", "renove", "leinertex"
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('name');

    if (!products) return;

    const groups: Record<string, any[]> = {};

    products.forEach(p => {
        const lowerName = p.name.toLowerCase();

        let match = '';
        if (lowerName.includes('renove')) match = 'RENOVE';
        else if (lowerName.includes('leinertex') && lowerName.includes('semi')) match = 'LEINERTEX SEMI BRILHO';
        else if (lowerName.includes('semi brilho') || lowerName.includes('semibrilho')) match = 'SEMI BRILHO GENERIC';

        if (match) {
            if (!groups[match]) groups[match] = [];
            groups[match].push(p);
        }
    });

    console.log('\n--- POTENTIAL GROUPS ---');
    for (const [key, list] of Object.entries(groups)) {
        console.log(`\n[${key}] Count: ${list.length}`);
        const prices = list.map(i => i.price);
        const minP = Math.min(...prices);
        const maxP = Math.max(...prices);
        console.log(`Price Range: ${minP} - ${maxP}`);

        console.log('Samples:');
        list.slice(0, 5).forEach(p => console.log(`  - ${p.name} ($${p.price})`));
    }
}

run();
