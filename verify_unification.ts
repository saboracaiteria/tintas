
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function run() {
    console.log('Verifying VIVACOR products...');

    // 1. Check Master Product
    const { data: master, error } = await supabase
        .from('products')
        .select('*')
        .eq('name', 'Tinta Acrílica Vivacor');

    if (master && master.length > 0) {
        console.log(`\nMASTER PRODUCT FOUND (${master.length}):`);
        master.forEach(p => {
            console.log(`[${p.id}] ${p.name} (Active: ${p.active})`);
        });

        // Check relationships
        const { data: rels } = await supabase
            .from('product_group_relations')
            .select('group_id, product_groups(title, options:product_options(name, price))')
            .eq('product_id', master[0].id);

        console.log('\nGroups & Options:');
        rels?.forEach((r: any) => {
            console.log(`- Group: ${r.product_groups.title}`);
            r.product_groups.options?.forEach((o: any) => {
                console.log(`  - ${o.name} (+R$ ${o.price})`);
            });
        });

    } else {
        console.log('\nMASTER PRODUCT NOT FOUND!');
    }

    // 2. Check Old Products
    const { data: old } = await supabase
        .from('products')
        .select('id, name, active')
        .ilike('name', '%vivacor%')
        .neq('name', 'Tinta Acrílica Vivacor'); // Exclude master

    console.log(`\nOLD PRODUCTS (${old?.length}):`);
    old?.slice(0, 10).forEach(p => {
        console.log(`[${p.id}] ${p.name} (Active: ${p.active})`);
    });
}

run();
