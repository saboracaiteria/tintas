
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function run() {
    console.log('Analyzing Phase 2 Candidates...');

    // Keywords from user + observed in screenshots
    // Screenshots showed: "TINTA ESMALTE 3.6", "TINTA ESMALTE 225", "TINTA DESTACK", "TINTA ELIT", "TINTA STANDARD"
    const keywords = ['esmalte', 'elit', '225', 'destack', 'standard'];

    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('active', true) // Only check active ones we haven't unified yet
        .order('name');

    if (!products) return;

    const groups: Record<string, any[]> = {};

    products.forEach(p => {
        const lowerName = p.name.toLowerCase();

        let match = '';
        if (lowerName.includes('elit')) match = 'ELIT';
        else if (lowerName.includes('destack')) match = 'DESTACK';
        else if (lowerName.includes('standard')) match = 'STANDARD';
        // '225' usually appears with 'esmalte', so check 225 first or together?
        // Screenshots show "TINTA ESMALTE 225 ..." and "TINTA ESMALTE 3.6 ..."
        else if (lowerName.includes('esmalte') && lowerName.includes('225')) match = 'ESMALTE 225ML';
        else if (lowerName.includes('esmalte') && (lowerName.includes('3.6') || lowerName.includes('3,6'))) match = 'ESMALTE 3.6L';
        else if (lowerName.includes('esmalte')) match = 'ESMALTE GENERIC'; // Fallback

        if (match) {
            if (!groups[match]) groups[match] = [];
            groups[match].push(p);
        }
    });

    console.log('\n--- POTENTIAL GROUPS ---');
    for (const [key, list] of Object.entries(groups)) {
        console.log(`\n[${key}] Count: ${list.length}`);
        // Calculate price ranges
        const prices = list.map(i => i.price);
        const minP = Math.min(...prices);
        const maxP = Math.max(...prices);
        console.log(`Price Range: ${minP} - ${maxP}`);

        // Show sample names to identify patterns
        console.log('Samples:');
        list.slice(0, 5).forEach(p => console.log(`  - ${p.name} ($${p.price})`));

        // Specific checks for "Veloz" or "Elite" if they appeared here
        if (list.some(p => p.name.toLowerCase().includes('veloz'))) console.log('  -> Contains "Veloz"');
    }
}

run();
