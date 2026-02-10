
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function unifyDestack() {
    console.log('--- Unifying DESTACK ---');

    // 1. Fetch ALL matching products (active or inactive)
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .ilike('name', '%TINTA DESTACK%'); // Changed to %LIKE% to be safer

    if (!products || products.length === 0) {
        console.log('No Destack products found.');
        return;
    }

    // Filter out the Master Product if it already exists from previous runs
    const candidates = products.filter(p => !p.name.includes('(Premium)'));
    console.log(`Found ${candidates.length} Destack candidates.`);

    if (candidates.length === 0) return;

    const sizesMap: Record<string, number> = {};
    const colors = new Set<string>();
    let basePrice = Infinity;
    let representativeProduct = candidates[0];

    candidates.forEach(p => {
        let size = '3.6L'; // Default match
        if (p.name.includes('15LT') || p.name.includes('15L')) size = '15L';
        else if (p.name.includes('3,6LT') || p.name.includes('3.6L') || p.name.includes('3,6L')) size = '3.6L';
        else if (p.name.includes('18L') || p.name.includes('18LT')) size = '18L';

        if (!sizesMap[size] || p.price < sizesMap[size]) {
            sizesMap[size] = p.price;
        }

        if (p.price < basePrice) {
            basePrice = p.price;
            representativeProduct = p;
        }

        // Color Extraction
        let colorName = p.name
            .replace(/TINTA/yi, '')
            .replace(/DESTACK/yi, '')
            .replace(/15LT/yi, '')
            .replace(/15L/yi, '')
            .replace(/3,6LT/yi, '')
            .replace(/3.6L/yi, '')
            .replace(/3,6L/yi, '')
            .replace(/-/g, '')
            .replace(/[0-9]+/g, '') // Remove numbers like codes
            .trim();

        colorName = colorName.charAt(0).toUpperCase() + colorName.slice(1).toLowerCase();
        if (colorName.length > 2) colors.add(colorName);
    });

    console.log('Sizes found:', sizesMap);
    console.log('Colors found:', Array.from(colors));

    // Cleanup previous Master if exists (optional, or just create new)
    // Let's create new and we can manually delete old ones if needed, or better, reuse logic.
    // For now, let's just create.

    const masterData = {
        name: 'Tinta Destack (Premium)',
        description: 'Tinta Destack de alta cobertura e rendimento. Escolha a cor e o tamanho ideal para sua pintura.',
        price: basePrice,
        category_id: representativeProduct.category_id,
        image: representativeProduct.image,
        active: true,
        stock_text: 'Em estoque',
        sales_count_text: '+500 vendidos'
    };

    const { data: master, error } = await supabase.from('products').insert([masterData]).select().single();
    if (error) {
        console.error('Error creating Destack Master:', error);
        return;
    }
    console.log(`Created Master: ${master.name} (${master.id})`);

    // Create Size Group
    const { data: sizeGroup } = await supabase.from('product_groups').insert({
        title: 'Tamanho',
        min: 1,
        max: 1,
        active: true
    }).select().single();

    if (sizeGroup) {
        await supabase.from('product_group_relations').insert({ product_id: master.id, group_id: sizeGroup.id });

        for (const [size, price] of Object.entries(sizesMap)) {
            const priceDelta = Math.max(0, parseFloat((price - basePrice).toFixed(2)));
            await supabase.from('product_options').insert({
                group_id: sizeGroup.id,
                name: size,
                price: priceDelta,
                active: true,
                description: size === '3.6L' ? 'Galão 3.6L' : 'Lata 15L'
            });
        }
    }

    // Create Color Group
    const { data: colorGroup } = await supabase.from('product_groups').insert({
        title: 'Cor',
        min: 1,
        max: 1,
        active: true
    }).select().single();

    if (colorGroup) {
        await supabase.from('product_group_relations').insert({ product_id: master.id, group_id: colorGroup.id });

        for (const color of colors) {
            await supabase.from('product_options').insert({
                group_id: colorGroup.id,
                name: color,
                price: 0,
                active: true
            });
        }
    }

    // Deactivate Old Products
    const idsToDeactivate = candidates.map(p => p.id);
    await supabase.from('products').update({ active: false }).in('id', idsToDeactivate);
    console.log(`Deactivated ${idsToDeactivate.length} Destack products.`);
}

async function unifySpray() {
    console.log('\n--- Unifying SPRAY ---');

    // 1. Fetch ALL matching products (active or inactive)
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .ilike('name', '%TINTA SPRAY%');

    if (!products || products.length === 0) {
        console.log('No Spray products found.');
        return;
    }

    // Filter out the Master Product by name
    const candidates = products.filter(p => !p.name.includes('Multiuso'));
    console.log(`Found ${candidates.length} Spray candidates.`);

    if (candidates.length === 0) return;

    const options = new Set<string>();
    let basePrice = Infinity;
    let representativeProduct = candidates[0];

    candidates.forEach(p => {
        if (p.price < basePrice) {
            basePrice = p.price;
            representativeProduct = p;
        }

        let name = p.name
            .replace(/TINTA/yi, '')
            .replace(/SPRAY/yi, '')
            .replace(/350ML/yi, '')
            .replace(/400ML/yi, '')
            .replace(/-/g, '')
            .replace(/[0-9]+/g, '')
            .trim();

        name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

        // Ensure finish is formatted nicely
        if (name.toUpperCase().includes('BRILHANTE')) name = name.replace(/brilhante/yi, 'Brilhante');
        if (name.toUpperCase().includes('FOSCO')) name = name.replace(/fosco/yi, 'Fosco');
        if (name.toUpperCase().includes('METALICO')) name = name.replace(/metalico/yi, 'Metálico');
        if (name.toUpperCase().includes('GERAL')) name = name.replace(/geral/yi, '').trim();

        // Clean leading/trailing spaces again
        name = name.trim();

        if (name.length > 2) options.add(name);
    });

    console.log('Options found:', Array.from(options));

    // Master Product
    const masterData = {
        name: 'Tinta Spray Multiuso',
        description: 'Tinta Spray de secagem rápida e fácil aplicação. Ideal para reformas e artesanato.',
        price: basePrice,
        category_id: representativeProduct.category_id,
        image: representativeProduct.image,
        active: true,
        stock_text: 'Em estoque',
        sales_count_text: '+1000 vendidos'
    };

    const { data: master, error } = await supabase.from('products').insert([masterData]).select().single();
    if (error) {
        console.error('Error creating Spray Master:', error);
        return;
    }
    console.log(`Created Master: ${master.name} (${master.id})`);

    // Create Group
    const { data: group } = await supabase.from('product_groups').insert({
        title: 'Cor / Acabamento',
        min: 1,
        max: 1,
        active: true
    }).select().single();

    if (group) {
        await supabase.from('product_group_relations').insert({ product_id: master.id, group_id: group.id });

        for (const opt of options) {
            await supabase.from('product_options').insert({
                group_id: group.id,
                name: opt,
                price: 0,
                active: true
            });
        }
    }

    // Deactivate Old Products
    const idsToDeactivate = candidates.map(p => p.id);
    await supabase.from('products').update({ active: false }).in('id', idsToDeactivate);
    console.log(`Deactivated ${idsToDeactivate.length} Spray products.`);
}

async function run() {
    await unifyDestack();
    await unifySpray();
    console.log('Done!');
}

run();
