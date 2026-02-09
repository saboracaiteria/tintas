
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function run() {
    console.log('Analyzing Tinta Spray...');

    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .ilike('name', '%spray%')
        .order('name');

    if (!products) return;

    console.log(`Found ${products.length} Spray products.`);

    // Check naming patterns
    // "TINTA SPRAY TEKBOND BRILHANTE BRANCO"
    // "TINTA SPRAY TEKBOND ALTA TEMP PRETO FOSCO"
    // "TINTA SPRAY USO GERAL BRILHANTE ..."

    const brands: Record<string, number> = {};
    const types: Record<string, number> = {};

    products.forEach(p => {
        const lower = p.name.toLowerCase();
        if (lower.includes('tekbond')) brands['Tekbond'] = (brands['Tekbond'] || 0) + 1;
        else if (lower.includes('chemic')) brands['Chemic'] = (brands['Chemic'] || 0) + 1;
        else brands['Generic'] = (brands['Generic'] || 0) + 1;

        if (lower.includes('alta temp')) types['Alta Temperatura'] = (types['Alta Temperatura'] || 0) + 1;
        else if (lower.includes('uso geral')) types['Uso Geral'] = (types['Uso Geral'] || 0) + 1;
        else if (lower.includes('metali')) types['Metálico'] = (types['Metálico'] || 0) + 1;
    });

    console.log('Brands:', brands);
    console.log('Types:', types);

    console.log('Samples:');
    products.slice(0, 10).forEach(p => console.log(`- ${p.name} ($${p.price})`));
}

run();
