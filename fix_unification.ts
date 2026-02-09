
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function run() {
    console.log('STARTING FIX & RE-UNIFICATION...');

    // 1. CLEANUP: Delete previously created Master Products (Vivacor, Piso, Evolution)
    const masterNames = ['Tinta Acrílica Vivacor', 'Tinta Piso', 'Tinta Acrílica Evolution'];

    // Find them first to delete their options/groups
    const { data: badMasters } = await supabase.from('products').select('id, name').in('name', masterNames);

    if (badMasters && badMasters.length > 0) {
        console.log(`Deleting ${badMasters.length} bad master products...`);
        const badIds = badMasters.map(p => p.id);

        // Delete relations
        await supabase.from('product_group_relations').delete().in('product_id', badIds);
        // We should also delete the Groups/Options created, but without tracking IDs it's hard. 
        // We can leave them orphaned or try to find them by name ("Cor", "Tamanho" are generic).
        // For now, focusing on Products.

        await supabase.from('products').delete().in('id', badIds);
        console.log('Deleted bad masters.');
    }

    // 2. RE-RUN LINES logic with improvements
    const LINES = [
        {
            key: 'vivacor',
            name: 'Tinta Acrílica Vivacor',
            match: ['vivacor', 'vivaco'],
            exclude: ['selador', 'massa', 'fundo'], // Exclude non-paint
            category: 'tinta',
            base_image_term: 'vivacor'
        },
        {
            key: 'evolution',
            name: 'Tinta Acrílica Evolution',
            match: ['evolution', 'evolulions'],
            exclude: [],
            category: 'tinta',
            base_image_term: 'evolution'
        },
        {
            key: 'piso',
            name: 'Tinta Piso',
            match: ['tinta piso', 'piso 18l', 'piso 3.6l'],
            exclude: ['selador', 'resina'],
            category: 'tinta',
            base_image_term: 'piso'
        }
    ];

    // Get Category ID
    const { data: categories } = await supabase.from('categories').select('id, title');
    const tintasCat = categories?.find(c => c.title.toLowerCase().includes('tinta'))?.id || categories?.[0]?.id;

    for (const line of LINES) {
        console.log(`\nProcessing Line: ${line.name}...`);

        const orQuery = line.match.map(m => `name.ilike.%${m}%`).join(',');
        const { data: products } = await supabase.from('products').select('*').or(orQuery);

        if (!products || products.length === 0) continue;

        // Filter exclusions
        const productsToProcess = products.filter(p => {
            const name = p.name.toLowerCase();
            if (p.name === line.name) return false; // Skip master if exists (we deleted it, but safety)
            if (line.exclude.some(ex => name.includes(ex))) return false;
            return true;
        });

        console.log(`Found ${productsToProcess.length} valid products (filtered).`);
        if (productsToProcess.length === 0) continue;

        // Extract Sizes and Colors
        const sizesMap: Record<string, number> = {};
        const colors = new Set<string>();
        const sizeRegex = /(\d{1,3}([.,]\d{1,2})?)\s?(L|LT|ML|KG|GALAO|QUARTO)/i;

        productsToProcess.forEach(p => {
            // Size
            const match = p.name.match(sizeRegex);
            let size = '3.6L'; // Default fallack?
            if (match) {
                let val = match[1].replace(',', '.');
                let unit = match[3].toUpperCase();
                if (unit === 'L' || unit === 'LT') unit = 'L';
                if (unit === 'GALAO') { val = '3.6'; unit = 'L'; }
                if (unit === 'QUARTO') { val = '0.9'; unit = 'L'; } // 900ml
                if (unit === 'ML' && parseFloat(val) >= 1000) { val = (parseFloat(val) / 1000).toString(); unit = 'L'; }

                size = `${val}${unit}`;
            }

            if (!sizesMap[size] || p.price < sizesMap[size]) {
                sizesMap[size] = p.price;
            }

            // Color - Remove brand line names and sizes
            let cleanName = p.name;
            line.match.forEach(m => { cleanName = cleanName.replace(new RegExp(m, 'gi'), ''); });
            line.exclude.forEach(ex => { cleanName = cleanName.replace(new RegExp(ex, 'gi'), ''); });
            cleanName = cleanName.replace(sizeRegex, '')
                .replace(/tinta/gi, '')
                .replace(/acrilica/gi, '')
                .replace(/fosco/gi, '')
                .replace(/premium/gi, '')
                .replace(/balde/gi, '')
                .replace(/galao/gi, '')
                .replace(/[^a-zA-Z\s]/g, '') // Remove symbols
                .trim();

            // Capitalize
            cleanName = cleanName.toLowerCase().replace(/(^\w|\s\w)/g, m => m.toUpperCase()).trim();

            if (cleanName.length > 2) colors.add(cleanName);
        });

        const sortedSizes = Object.keys(sizesMap).sort((a, b) => sizesMap[a] - sizesMap[b]);
        const baseSize = sortedSizes[0];
        const basePrice = sizesMap[baseSize];

        console.log(`Sizes: ${JSON.stringify(sizesMap)}`);
        console.log(`Base: ${baseSize} R$${basePrice}`);
        console.log(`Colors: ${Array.from(colors).join(', ')}`);

        // Create Master
        const { data: masterProd, error: mErr } = await supabase.from('products').insert([{
            name: line.name,
            description: line.description,
            price: basePrice,
            category_id: tintasCat,
            image: productsToProcess[0]?.image || '',
            // active: true // Removed to avoid schema error, defaults to true? Or we update later.
        }]).select().single();

        if (mErr) {
            console.error('Error creating master:', mErr);
            continue;
        }

        // Create Groups
        // 1. Size
        if (sortedSizes.length > 0) { // Always create even if 1 size, to show IT IS that size? Or skip if 1? User wants to choose size.
            const sizeTitle = sortedSizes.length > 1 ? 'Tamanho' : 'Tamanho (Único)';
            const { data: sGroup } = await supabase.from('product_groups').insert([{ title: sizeTitle, min: 1, max: 1 }]).select().single();
            if (sGroup) {
                const sOpts = sortedSizes.map(s => ({
                    group_id: sGroup.id,
                    name: s,
                    price: parseFloat((sizesMap[s] - basePrice).toFixed(2)),
                    description: s === baseSize ? 'Padrão' : ''
                }));
                await supabase.from('product_options').insert(sOpts);
                await supabase.from('product_group_relations').insert([{ product_id: masterProd.id, group_id: sGroup.id }]);
            }
        }

        // 2. Color
        if (colors.size > 0) {
            const { data: cGroup } = await supabase.from('product_groups').insert([{ title: 'Cor', min: 1, max: 1 }]).select().single();
            if (cGroup) {
                const cOpts = Array.from(colors).map(c => ({
                    group_id: cGroup.id,
                    name: c,
                    price: 0
                }));
                await supabase.from('product_options').insert(cOpts);
                await supabase.from('product_group_relations').insert([{ product_id: masterProd.id, group_id: cGroup.id }]);
            }
        }

        // DEACTIVATE OLD
        const idsToDeactivate = productsToProcess.map(p => p.id);
        const { error: upErr } = await supabase.from('products').update({ active: false }).in('id', idsToDeactivate);
        if (upErr) {
            console.error('FAILED TO DEACTIVATE OLD PRODUCTS:', upErr);
            // Fallback: Delete? No, keep history.
            // Check if active column exists? existing products have it.
        } else {
            console.log(`Deactivated ${idsToDeactivate.length} old products.`);
        }
    }

    console.log('FIX COMPLETE');
}

run();
