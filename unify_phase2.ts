
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
// Note: Ideally use SERVICE_ROLE_KEY for admin tasks if available, but ANON works if RLS allows or is off for dev.
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function run() {
    console.log('Unifying Phase 2 Products...');

    const definitions = [
        {
            masterName: 'Tinta Acrílica Elit',
            keywords: ['elit'],
            exclude: [],
            price_matcher: (p: any) => p.name.includes('18L') || p.price > 100, // 18L is expensive
            sizes: [
                { keyword: '18L', label: '18L', weight: 18 },
                { keyword: '18 l', label: '18L', weight: 18 },
                { keyword: '3', label: '3.6L', weight: 3.6 }, // "Elit 3" seems to be 3.6L
                { keyword: '3.6', label: '3.6L', weight: 3.6 },
            ],
            defaultSize: '3.6L'
        },
        {
            masterName: 'Tinta Destack',
            keywords: ['destack'],
            exclude: [],
            sizes: [
                { keyword: '15L', label: '15L', weight: 15 },
                { keyword: '15 l', label: '15L', weight: 15 },
                { keyword: '3', label: '3.6L', weight: 3.6 },
            ],
            defaultSize: '3.6L'
        },
        {
            masterName: 'Tinta Esmalte Sintético',
            keywords: ['esmalte'],
            exclude: ['base', 'agua'], // Exclude water based if valid? keeping simple for now
            sizes: [
                { keyword: '3.6', label: '3.6L', weight: 3.6 },
                { keyword: '3,6', label: '3.6L', weight: 3.6 },
                { keyword: '225', label: '225ml', weight: 0.225 },
                { keyword: '900', label: '900ml', weight: 0.9 }, // Just in case
            ],
            defaultSize: '225ml'
        }
    ];

    for (const def of definitions) {
        console.log(`\nProcessing Group: ${def.masterName}...`);

        // 1. Fetch Candidates
        const { data: products } = await supabase
            .from('products')
            .select('*')
            .eq('active', true)
            .ilike('name', `%${def.keywords[0]}%`); // Simple fetch, filter later

        if (!products || products.length === 0) {
            console.log('  No products found.');
            continue;
        }

        // Filter valid candidates
        const candidates = products.filter((p: any) => {
            const lowerName = p.name.toLowerCase();
            // Check keywords
            if (!def.keywords.every(k => lowerName.includes(k))) return false;
            // Check excludes
            if (def.exclude.some(e => lowerName.includes(e))) return false;
            // Check matches definition
            return true;
        });

        console.log(`  Found ${candidates.length} candidates.`);
        if (candidates.length === 0) continue;

        // 2. Identify Options (Size & Color)
        const sizeOptions: Record<string, number> = {};
        const colorOptions: Set<string> = new Set();
        let basePrice = 999999;

        // First pass: Calculate Base Price & Collect Sizes
        candidates.forEach((p: any) => {
            if (p.price < basePrice) basePrice = p.price;

            // Determine Size
            let size = def.defaultSize;
            for (const s of def.sizes) {
                if (p.name.toLowerCase().includes(s.keyword.toLowerCase())) {
                    size = s.label;
                    break;
                }
            }
            // Track max price for this size to determine add-on cost
            if (!sizeOptions[size] || p.price > sizeOptions[size]) {
                sizeOptions[size] = p.price;
            }

            // Extract Color (Simple heuristic: remove brand/size keywords)
            let color = p.name;
            const removeWords = [...def.keywords, ...def.sizes.map(s => s.keyword), 'Tinta', 'Litros', 'Lt', '-', '  '];
            removeWords.forEach(w => {
                color = color.replace(new RegExp(w.replace('.', '\\.'), 'gi'), '');
            });
            color = color.trim().replace(/^\W+|\W+$/g, ''); // Trim non-word chars
            if (color.length > 2) colorOptions.add(color);
        });

        console.log(`  Base Price: ${basePrice}`);
        console.log(`  Sizes: ${Object.keys(sizeOptions).join(', ')}`);
        console.log(`  Colors: ${colorOptions.size} found.`);

        // 3. Create Master Product
        // Find a representant image
        const representant = candidates[0];

        const { data: master, error: masterError } = await supabase
            .from('products')
            .insert([{
                name: def.masterName,
                description: `Tinta ${def.masterName} com diversas cores e tamanhos.`,
                price: basePrice,
                image: representant.image,
                category_id: representant.category_id,
                active: true,
                stock_text: 'Estoque disponível',
                sales_count_text: '+50 vendidos'
            }])
            .select()
            .single();

        if (masterError || !master) {
            console.error('  Error creating master:', masterError);
            continue;
        }
        console.log(`  Created Master: ${master.id}`);

        // 4. Create Groups & Options

        // Group: Tamanho
        const { data: sizeGroup } = await supabase.from('product_groups').insert({
            title: 'Tamanho',
            min: 1,
            max: 1,
            active: true
        }).select().single();

        if (sizeGroup) {
            await supabase.from('product_group_relations').insert({
                product_id: master.id,
                group_id: sizeGroup.id
            });

            for (const [label, maxPrice] of Object.entries(sizeOptions)) {
                // Calculate price diff from base
                // If this is the "base" size (lowest price), diff might be 0. 
                // BUT, basePrice is usually the lowest of ALL. 
                // We want: Option Price = (Approx Price of this size) - Base Price
                // Actually, let's just set the delta.

                // Heuristic: The "price" of the option is the added cost.
                // If basePrice is 50 (3.6L) and 18L is 150. Option 18L = +100.
                // However, we took min price of the *batch*.
                // Let's use the average or max price found for that size as reference?
                // Using maxPrice found for that size in the loop above.

                let priceDiff = maxPrice - basePrice;
                if (priceDiff < 0) priceDiff = 0;

                await supabase.from('product_options').insert({
                    group_id: sizeGroup.id,
                    name: label,
                    price: priceDiff,
                    active: true
                });
            }
        }

        // Group: Cor
        const { data: colorGroup } = await supabase.from('product_groups').insert({
            title: 'Cor',
            min: 1,
            max: 1,
            active: true
        }).select().single();

        if (colorGroup) {
            await supabase.from('product_group_relations').insert({
                product_id: master.id,
                group_id: colorGroup.id
            });

            for (const color of colorOptions) {
                // Formatting title case
                const formattedColor = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
                await supabase.from('product_options').insert({
                    group_id: colorGroup.id,
                    name: formattedColor,
                    price: 0, // Colors usually don't add price in this model
                    active: true
                });
            }
        }

        // 5. Deactivate Old Products
        const idsToDeactivate = candidates.filter((c: any) => c.id !== master.id).map((c: any) => c.id);
        if (idsToDeactivate.length > 0) {
            await supabase.from('products').update({ active: false }).in('id', idsToDeactivate);
            console.log(`  Deactivated ${idsToDeactivate.length} old products.`);
        }
    }
}

run();
