
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

const LINES = [
    {
        key: 'vivacor',
        name: 'Tinta Acrílica Vivacor',
        match: ['vivacor', 'vivaco'],
        category: 'tinta', // Will need to find/create category ID
        description: 'Tinta Acrílica de alta qualidade. Escolha a cor e o tamanho.'
    },
    {
        key: 'evolution',
        name: 'Tinta Acrílica Evolution',
        match: ['evolution', 'evolulions'],
        category: 'tinta',
        description: 'Tinta Acrílica Evolution. Cobertura premium.'
    },
    {
        key: 'piso',
        name: 'Tinta Piso',
        match: ['tinta piso', 'piso 18l', 'piso 3.6l'], // Be careful not to match "piso" generic (removed previously)
        category: 'tinta',
        description: 'Tinta especial para pisos e cimentados.'
    },
    {
        key: 'veloz',
        name: 'Esmalte Sintético Veloz',
        match: ['veloz'],
        category: 'esmalte',
        description: 'Esmalte Sintético Veloz Leinertex. Secagem rápida.'
    },
    {
        key: 'elite',
        name: 'Esmalte Sintético Elite',
        match: ['elite'],
        category: 'esmalte',
        description: 'Esmalte Sintético Elite. Alto brilho e durabilidade.'
    }
];

async function run() {
    console.log('STARTING UNIFICATION...');

    // 0. Get Categories (to assign Master Products correctly)
    const { data: categories } = await supabase.from('categories').select('id, title');
    const tintasCat = categories?.find(c => c.title.toLowerCase().includes('tinta'))?.id || categories?.[0]?.id;
    const esmaltesCat = categories?.find(c => c.title.toLowerCase().includes('esmalte') || c.title.toLowerCase().includes('madeira'))?.id || tintasCat;

    console.log(`Categories: Tintas=${tintasCat}, Esmaltes=${esmaltesCat}`);

    for (const line of LINES) {
        console.log(`\nProcessing Line: ${line.name}...`);

        // 1. Find Products
        // Create OR string for matches
        const orQuery = line.match.map(m => `name.ilike.%${m}%`).join(',');
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .or(orQuery);

        if (error || !products || products.length === 0) {
            console.log(`No products found for ${line.name}. Skipping.`);
            continue;
        }

        // Filter out "Tinta Piso" from "Piso" if needed to be strict, but we already cleaned non-paints.
        // Also ensure we don't pick up the Master Product if we re-run!
        const productsToProcess = products.filter(p => !p.name.startsWith(line.name)); // Simple check to avoid processing master

        if (productsToProcess.length === 0) {
            console.log(`Only master product found for ${line.name}. Skipping.`);
            continue;
        }

        // 2. Extract Sizes and Colors
        const sizesMap: Record<string, number> = {}; // Size -> Price (collect all to find mode/min)
        const colors = new Set<string>();

        // Regex for sizes: 18L, 3.6L, 900ml, 1/4
        const sizeRegex = /(\d+(\.\d+)?\s?(L|LT|ML|KG|GALAO|QUARTO))/i;

        // Clean names to extract colors
        // Assume format: "Tinta Piso 18L Azul" or "Tinta Piso Azul 18L"
        productsToProcess.forEach(p => {
            // Size
            const match = p.name.match(sizeRegex);
            let size = 'Padrão';
            if (match) {
                size = match[0].toUpperCase().replace(/\s/g, '');
                if (size.includes('GALAO')) size = '3.6L';
                if (size.includes('QUARTO')) size = '900ML';
            }

            // Keep track of price for this size
            // If multiple prices for same size (different colors?), take lowest or mode? Let's take lowest for now as base.
            if (!sizesMap[size] || p.price < sizesMap[size]) {
                sizesMap[size] = p.price;
            }

            // Color
            // Remove "Tinta", "Piso", "18L", brand names, etc.
            let cleanName = p.name;
            line.match.forEach(m => {
                cleanName = cleanName.replace(new RegExp(m, 'gi'), '');
            });
            cleanName = cleanName.replace(sizeRegex, '')
                .replace(/tinta/gi, '')
                .replace(/esmalte/gi, '')
                .replace(/sintetico/gi, '')
                .replace(/acrilica/gi, '')
                .replace(/brilho/gi, '')
                .replace(/-/g, '')
                .trim();

            // Capitalize per word
            cleanName = cleanName.toLowerCase().replace(/(^\w|\s\w)/g, m => m.toUpperCase());

            if (cleanName.length > 2) {
                colors.add(cleanName);
            }
        });

        // 3. Determine Base Price and Size Options
        const sortedSizes = Object.keys(sizesMap).sort((a, b) => sizesMap[a] - sizesMap[b]); // Sort by price asc
        const baseSize = sortedSizes[0] || 'Unico';
        const basePrice = sizesMap[baseSize] || 0;

        console.log(`Base Size: ${baseSize} (R$ ${basePrice})`);
        console.log('Sizes found:', sizesMap);
        console.log('Colors found:', Array.from(colors));

        // 4. Create Master Product
        const catId = (line.category === 'tinta') ? tintasCat : esmaltesCat;

        // Define Master Product
        const masterProductData = {
            name: line.name,
            description: line.description,
            price: basePrice,
            category_id: catId,
            image: productsToProcess[0]?.image || '' // Use image from first product found
        };

        // Insert Master Product
        const { data: masterProd, error: masterErr } = await supabase
            .from('products')
            .insert([masterProductData])
            .select()
            .single();

        if (masterErr) {
            console.error('Error creating Master Product:', masterErr);
            continue;
        }
        console.log(`Created Master Product: ${masterProd.name} (${masterProd.id})`);

        // 5. Create "Tamanho" Group (if more than 1 size or if want to be explicit)
        // If only 1 size, maybe skip? But User wants "escolher tamanho". So check.
        const sizeOptions = Object.entries(sizesMap).map(([size, price]) => ({
            name: size,
            price: parseFloat((price - basePrice).toFixed(2)), // Delta
            description: (size === baseSize) ? 'Tamanho Base' : `Adicional pelo tamanho`
        }));

        // Always create size group if sizes exist
        if (sizeOptions.length > 0) {
            const { data: sizeGroup, error: grpErr } = await supabase
                .from('product_groups')
                .insert([{
                    title: 'Tamanho',
                    min: 1,
                    max: 1 // Select exactly 1
                }])
                .select()
                .single();

            if (!grpErr && sizeGroup) {
                // Insert Options
                const opts = sizeOptions.map(o => ({
                    group_id: sizeGroup.id,
                    name: o.name,
                    price: o.price,
                    description: o.description
                }));
                await supabase.from('product_options').insert(opts);

                // Link to Product
                await supabase.from('product_group_relations').insert([{
                    product_id: masterProd.id,
                    group_id: sizeGroup.id
                }]);
                console.log('Created Size Group & Options');
            }
        }

        // 6. Create "Cor" Group
        if (colors.size > 0) {
            const { data: colorGroup, error: colErr } = await supabase
                .from('product_groups')
                .insert([{
                    title: 'Cor',
                    min: 1,
                    max: 1 // Select exactly 1
                }])
                .select()
                .single();

            if (!colErr && colorGroup) {
                // Insert Options (Price 0)
                const opts = Array.from(colors).map(c => ({
                    group_id: colorGroup.id,
                    name: c,
                    price: 0,
                    description: 'Sem custo adicional'
                }));
                await supabase.from('product_options').insert(opts);

                // Link to Product
                await supabase.from('product_group_relations').insert([{
                    product_id: masterProd.id,
                    group_id: colorGroup.id
                }]);
                console.log('Created Color Group & Options');
            }
        }

        // 7. Deactivate Old Products
        const idsToDeactivate = productsToProcess.map(p => p.id);
        if (idsToDeactivate.length > 0) {
            await supabase
                .from('products')
                .update({ active: false })
                .in('id', idsToDeactivate);
            console.log(`Deactivated ${idsToDeactivate.length} old products.`);
        }
    }
    console.log('UNIFICATION COMPLETE.');
}

run();
