
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function run() {
    console.log('Unifying Phase 4 Products (Spray)...');

    const def = {
        masterName: 'Tinta Spray Multiuso',
        keywords: ['tinta', 'spray'],
        exclude: ['lub', 'graxa', 'removedor', 'adaptador', 'limpa', 'silicone', 'desengripante'],
        defaultSize: 'Standard' // Usually 350ml-400ml, maybe just ignore size for sprays as they are mostly standard cans?
    };

    console.log(`\nProcessing Group: ${def.masterName}...`);

    // 1. Fetch Candidates
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .ilike('name', '%spray%');

    if (!products || products.length === 0) {
        console.log('  No products found.');
        return;
    }

    // Filter valid candidates
    const candidates = products.filter((p: any) => {
        const lowerName = p.name.toLowerCase();
        // Must have "tinta" AND "spray" usually, or at least NOT be excluded
        if (!lowerName.includes('tinta') && !lowerName.includes('geral') && !lowerName.includes('arte')) {
            // Heuristic: If it doesn't say "tinta", check if it's a known non-paint spray
            // But our exclude list handles that.
            // Let's rely on exclude list + "spray".
        }

        if (def.exclude.some(e => lowerName.includes(e))) return false;

        return true;
    });

    console.log(`  Found ${candidates.length} candidates.`);
    if (candidates.length === 0) return;

    // 2. Identify Options
    const colorOptions: Set<string> = new Set();
    const typeOptions: Set<string> = new Set(); // Alta Temp vs Geral?
    let basePrice = 999999;

    candidates.forEach((p: any) => {
        if (p.price < basePrice) basePrice = p.price;

        let name = p.name;

        // Extract Type (Optional)
        if (name.toLowerCase().includes('alta temperatura') || name.toLowerCase().includes('alta temp')) {
            // maybe separate group? For now, add as option or just mix in colors?
            // Let's treat it as a "Color/Type" option e.g. "Preto Alta Temp"
        }

        // Clean name for color
        const removeWords = ['Tinta', 'Spray', 'Chemicolor', 'Tekbond', 'Uso Geral', 'Geral', 'Brilhante', 'Fosco', 'Metálico', 'Metalico', 'Arte', 'Urbana', 'Super', 'Color', 'Express', '350ml', '400ml', '250g', '-', '  '];
        removeWords.forEach(w => {
            name = name.replace(new RegExp(w.replace('.', '\\.'), 'gi'), '');
        });
        name = name.trim().replace(/^\W+|\W+$/g, '');

        // Add Finish to color if found in original name
        let finish = '';
        if (p.name.toLowerCase().includes('fosco')) finish = ' Fosco';
        else if (p.name.toLowerCase().includes('brilhante')) finish = ' Brilhante';
        else if (p.name.toLowerCase().includes('metalico') || p.name.toLowerCase().includes('metálico')) finish = ' Metálico';

        // Add Type
        if (p.name.toLowerCase().includes('alta temp')) finish += ' (Alta Temp)';

        let finalOption = name + finish;
        if (finalOption.length < 2) finalOption = "Padrão"; // Fallback

        colorOptions.add(finalOption);
    });

    console.log(`  Base Price: ${basePrice}`);
    console.log(`  Options: ${colorOptions.size} found.`);

    // 3. Create Master Product
    const representant = candidates[0];

    const { data: master, error: masterError } = await supabase
        .from('products')
        .insert([{
            name: def.masterName,
            description: `Tinta Spray Multiuso para diversos materiais. Secagem rápida e ótimo acabamento.`,
            price: basePrice,
            image: representant.image,
            category_id: representant.category_id,
            active: true,
            stock_text: 'Estoque disponível',
            sales_count_text: '+100 vendidos'
        }])
        .select()
        .single();

    if (masterError || !master) {
        console.error('  Error creating master:', masterError);
        return;
    }

    // 4. Create Groups
    // Group: Cor / Acabamento
    const { data: colorGroup } = await supabase.from('product_groups').insert({
        title: 'Cor / Acabamento',
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

    console.log('Phase 4 Complete.');
}

run();
