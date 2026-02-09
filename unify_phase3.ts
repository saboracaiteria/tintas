
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function run() {
    console.log('Unifying Phase 3 Products (Renove & Semi Brilho)...');

    const definitions = [
        {
            masterName: 'Tinta Renove Semibrilho',
            keywords: ['renove'], // Matches "TINTA RENOVE SEMIBRILHO..."
            exclude: [],
            sizes: [
                { keyword: '18', label: '18L', weight: 18 }, // "RENOVE ... 18"
                { keyword: '3', label: '3.6L', weight: 3.6 }, // "RENOVE ... 3"
            ],
            defaultSize: '3.6L'
        },
        {
            masterName: 'Tinta Premium Semibrilho Leinertex',
            keywords: ['premium', 'semibrilho'], // Matches "TINTA PREMIUM SEMIBRILHO..."
            exclude: [],
            sizes: [
                { keyword: '18', label: '18L', weight: 18 },
                { keyword: '3', label: '3.6L', weight: 3.6 },
            ],
            defaultSize: '3.6L'
        }
    ];

    for (const def of definitions) {
        console.log(`\nProcessing Group: ${def.masterName}...`);

        // 1. Fetch Candidates
        const { data: products } = await supabase
            .from('products')
            .select('*')
            .eq('active', true)
            .ilike('name', `%${def.keywords[0]}%`);

        if (!products || products.length === 0) {
            console.log('  No products found.');
            continue;
        }

        // Filter valid candidates
        const candidates = products.filter((p: any) => {
            const lowerName = p.name.toLowerCase();
            if (!def.keywords.every(k => lowerName.includes(k))) return false;
            // Additional heuristic: Ensure it's not "Standard" if looking for Premium
            if (def.masterName.includes('Premium') && lowerName.includes('standard')) return false;
            return true;
        });

        console.log(`  Found ${candidates.length} candidates.`);
        if (candidates.length === 0) continue;

        // 2. Identify Options
        const sizeOptions: Record<string, number> = {};
        const colorOptions: Set<string> = new Set();
        let basePrice = 999999;

        candidates.forEach((p: any) => {
            if (p.price < basePrice) basePrice = p.price;

            // Determine Size
            let size = def.defaultSize;
            // Check specific keywords first
            for (const s of def.sizes) {
                // strict check for distinct numbers if possible, but keywords are substring matches
                // For "3", we need to be careful not to match "300". 
                // But names are like "TINTA RENOVE ... 3" -> trailing 3
                if (p.name.includes(` ${s.keyword} `) || p.name.endsWith(` ${s.keyword}`) || p.name.includes(s.keyword + 'L')) {
                    size = s.label;
                    break;
                }
            }

            // Fallback: Price check
            if (p.price > 200 && size === '3.6L') size = '18L'; // Heuristic

            if (!sizeOptions[size] || p.price > sizeOptions[size]) {
                sizeOptions[size] = p.price;
            }

            // Extract Color
            let color = p.name;
            const removeWords = [...def.keywords, 'Tinta', 'Leinertex', 'Litros', 'Lt', 'Renove', 'Premium', 'Semibrilho', 'Semi', 'Brilho', '18', '3', '3.6', '-', '  '];
            removeWords.forEach(w => {
                color = color.replace(new RegExp(w.replace('.', '\\.'), 'gi'), '');
            });
            color = color.trim().replace(/^\W+|\W+$/g, '');
            if (color.length > 2) colorOptions.add(color);
        });

        console.log(`  Base Price: ${basePrice}`);
        console.log(`  Sizes: ${Object.keys(sizeOptions).join(', ')}`);
        console.log(`  Colors: ${colorOptions.size} found.`);

        // 3. Create Master Product
        const representant = candidates[0];

        const { data: master, error: masterError } = await supabase
            .from('products')
            .insert([{
                name: def.masterName,
                description: `Tinta ${def.masterName} Leinertex. Acabamento perfeito e durabilidade. Disponível em várias cores.`,
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

        // 4. Create Groups

        // Group: Tamanho
        const { data: sizeGroup } = await supabase.from('product_groups').insert({
            title: 'Tamanho',
            min: 1,
            max: 1,
            active: true
        }).select().single();

        if (sizeGroup) {
            await supabase.from('product_group_relations').insert({ product_id: master.id, group_id: sizeGroup.id });

            for (const [label, maxPrice] of Object.entries(sizeOptions)) {
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
            await supabase.from('product_group_relations').insert({ product_id: master.id, group_id: colorGroup.id });
            for (const color of colorOptions) {
                const formattedColor = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
                await supabase.from('product_options').insert({
                    group_id: colorGroup.id,
                    name: formattedColor,
                    price: 0,
                    active: true
                });
            }
        }

        // 5. Deactivate
        const ids = candidates.filter((c: any) => c.id !== master.id).map((c: any) => c.id);
        if (ids.length > 0) {
            await supabase.from('products').update({ active: false }).in('id', ids);
            console.log(`  Deactivated ${ids.length} old products.`);
        }
    }
    console.log('Phase 3 Complete.');
}

run();
