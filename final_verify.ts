
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function run() {
    console.log('FINAL VERIFICATION...');

    // Check Master Products
    const names = ['Tinta Acrílica Vivacor', 'Tinta Acrílica Evolution', 'Tinta Piso'];

    for (const name of names) {
        const { data: products } = await supabase.from('products').select('*').eq('name', name);

        if (products && products.length > 0) {
            const p = products[0];
            console.log(`\n✅ FOUND: ${p.name} (ID: ${p.id}) - Price: ${p.price}`);

            // Check Options
            const { data: rels } = await supabase
                .from('product_group_relations')
                .select('group_id, product_groups(title, options:product_options(name, price))')
                .eq('product_id', p.id);

            if (rels && rels.length > 0) {
                rels.forEach((r: any) => {
                    console.log(`   Group: ${r.product_groups.title}`);
                    console.log(`     Options: ${r.product_groups.options.length} found.`);
                    // Show 3 examples
                    r.product_groups.options.slice(0, 3).forEach((o: any) =>
                        console.log(`       - ${o.name} (+${o.price})`)
                    );
                });
            } else {
                console.log('   ❌ NO OPTIONS FOUND!');
            }
        } else {
            console.log(`\n❌ NOT FOUND: ${name}`);
        }
    }
}

run();
