
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Keywords mapping to Category Names
const DISTRIBUTION_RULES = [
    {
        targetCategory: 'Impermeabilizantes',
        keywords: ['VEDACIT', 'NEUTROL', 'VEDAPREN', 'IMPERMEABILIZANTE', 'MANTA', 'LIQUIDA', 'ASFA', 'BETUME', 'IGOL', 'DRYKO', 'SIKA', 'BATE PEDRA', 'SOS RUBBER']
    },
    {
        targetCategory: 'Acessórios e Ferramentas',
        keywords: ['ROLO', 'PINCEL', 'TRINCHA', 'LIXA', 'ESPÁTULA', 'ESPATULA', 'BANDEJA', 'BATEDOR', 'FITA', 'GRELHA', 'SUPORTE', 'EXTENSOR']
    },
    {
        targetCategory: 'Diluentes e Removedores', // Or 'Solventes e Limpeza'
        keywords: ['AGUARRAS', 'THINNER', 'DILUENTE', 'SOLVENTE', 'REMOVEDOR', 'QUEROSENE']
    },
    {
        targetCategory: 'Massas e Preparação', // Assuming this exists or falls back
        keywords: ['MASSA CORRIDA', 'MASSA ACRILICA', 'SELADOR', 'FUNDO PREPARADOR']
    },
    {
        targetCategory: 'Paredes e Tetos', // Main Paint Category
        keywords: ['TINTA', 'ESMALTE', 'LATEX', 'ACRILICO', 'ACRÍLICO', 'CORANTE', 'PISO', 'SPRAY', 'AEROSSOL', 'RESINA', 'TEXTURA', 'GRAFFIT']
    }
];

async function run() {
    console.log("Starting product distribution...");

    // 1. Fetch all Categories
    const { data: categories, error: catError } = await supabase.from('categories').select('id, title');
    if (catError) {
        console.error("Error fetching categories:", catError);
        return;
    }

    const categoryMap: Record<string, string> = {};
    console.log("Existing Categories:");
    categories.forEach(c => {
        console.log(`- ${c.title} (${c.id})`);
        categoryMap[c.title.toUpperCase()] = c.id;
    });

    // Find the generic 'Pintura' category ID
    const pinturaId = categoryMap['PINTURA'];
    if (!pinturaId) {
        console.error("Generic 'Pintura' category not found. Nothing to distribute from.");
        // Optional: Maybe products are in 'Tintas e Acabamentos' from my previous import script?
        // Let's check for that too.
    }

    // We will look for products in 'Pintura' OR any products created recently if we can filter by that,
    // but filtering by current category is safest.
    // If 'Pintura' doesn't exist, we might have named it something else in import_paint_products.ts. 
    // The previous script used: `const { data: newCat } = await supabase.from('categories').insert({ name: 'Pintura', ...`
    // Wait, the previous script used 'name' column for insert, but my app uses 'title' column?
    // Let's check the schema or the previous script output.
    // The previous script 'import_paint_products.ts' used `name: 'Pintura'`.
    // My `CategoriesPage.tsx` uses `title`.
    // This implies potential schema mismatch or 'name' and 'title' are different columns.
    // I need to check the categories again. 
    // Assuming 'title' is the display name in the App.

    // Let's fetch products from the category that has the name 'Pintura' or similar.
    // We will just fetch ALL products for now if we can't find 'Pintura', 
    // OR we will assume the import script used the ID it found/created.

    // Let's fetch ALL products and filter in memory to be safe, as there are only ~900 products total possibly?
    // Actually database might have lots. Let's try to fetch products with 'Pintura' related category.

    // Strategy: Fetch products created recently? Or just fetch everything and see their category.
    // Better: Fetch products where category_id corresponds to 'Pintura' found above.

    let targetProducts = [];

    if (pinturaId) {
        const { data: products } = await supabase.from('products').select('*').eq('category_id', pinturaId);
        targetProducts = products || [];
    } else {
        console.log("Could not find 'Pintura' ID. Fetching ALL products to check names (fallback)...");
        // This is a safety fallback if the category name is slightly different
        const { data: products } = await supabase.from('products').select('*');
        // Filter for things that look like our imports (e.g. description contains 'Pintura - Geral')
        targetProducts = (products || []).filter(p => p.description && (p.description.includes('Pintura - Geral') || p.description.includes('Tintas e Acabamentos')));
    }

    console.log(`Found ${targetProducts.length} products to potentially reorganize.`);

    let updates = 0;

    for (const product of targetProducts) {
        const upperName = product.name.toUpperCase();
        let newCategoryId = null;
        let newCategoryName = '';

        // Find best matching rule
        for (const rule of DISTRIBUTION_RULES) {
            if (rule.keywords.some(k => upperName.includes(k))) {
                // Find ID for this target category
                // We try exact match first, then partial match
                const targetKey = Object.keys(categoryMap).find(k => k === rule.targetCategory.toUpperCase() || k.includes(rule.targetCategory.toUpperCase()));

                if (targetKey) {
                    newCategoryId = categoryMap[targetKey];
                    newCategoryName = targetKey;
                    break; // Stop at first match (rules order matters)
                }
            }
        }

        if (newCategoryId && newCategoryId !== product.category_id) {
            // Update product
            const { error } = await supabase.from('products').update({ category_id: newCategoryId }).eq('id', product.id);
            if (!error) {
                console.log(`Moved '${product.name}' -> ${newCategoryName}`);
                updates++;
            } else {
                console.error(`Failed to move '${product.name}':`, error.message);
            }
        }
    }

    console.log(`\nDistribution complete. Moved ${updates} products.`);
}

run();
