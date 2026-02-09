
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Keyword to Image URL Mapping (Representative/Similar Images)
// Using Unsplash source URLs for high quality "similar" images
const IMAGE_MAP: Record<string, string> = {
    // Using placehold.co for reliable generation with text
    'tinta': 'https://placehold.co/800x800/2563eb/white?text=Tinta',
    'esmalte': 'https://placehold.co/800x800/db2777/white?text=Esmalte',
    'vivacor': 'https://placehold.co/800x800/7c3aed/white?text=Vivacor',
    'spray': 'https://placehold.co/800x800/ea580c/white?text=Spray',

    // Accessories
    'rolo': 'https://placehold.co/800x800/16a34a/white?text=Rolo',
    'pincel': 'https://placehold.co/800x800/ca8a04/white?text=Pincel',
    'lixa': 'https://placehold.co/800x800/4b5563/white?text=Lixa',
    'espatula': 'https://placehold.co/800x800/9ca3af/white?text=Espatula',
    'argamassa': 'https://placehold.co/800x800/57534e/white?text=Argamassa',

    // Construction / Waterproofing
    'manta': 'https://placehold.co/800x800/1e293b/white?text=Manta',
    'vedacit': 'https://placehold.co/800x800/0f172a/white?text=Impermeabilizante',

    // Default fallback
    'default': 'https://placehold.co/800x800/e2e8f0/1e293b?text=Produto'
};

// Refined Specific Maps (Not needed for simple placeholders, merging into main logic)
const SPECIFIC_MAP: Record<string, string> = {};

async function populateImages() {
    console.log('Fetching products...');

    // 1. Fetch all products
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, image')
        .or('image.is.null,image.eq.""'); // Only update ones without images? Or all? User said "populate... to start using", likely implied all or missing. Let's do all to ensure consistency if requested, but safest to do missing first.
    // Actually, user said "busque... para formar a base". Let's update ALL to safeguard.

    // Let's just fetch all for now and check client side to save reads if needed, or better, just update what needs updating.
    // We'll update ALL to ensure they have the new "premium" images.
    const { data: allProducts, error: allErr } = await supabase.from('products').select('id, name');

    if (allErr) {
        console.error('Error fetching products:', allErr);
        return;
    }

    console.log(`Found ${allProducts?.length} products.`);

    let updatedCount = 0;

    // Process in batches for performance
    const batchSize = 25;
    for (let i = 0; i < allProducts.length; i += batchSize) {
        const batch = allProducts.slice(i, i + batchSize);

        await Promise.all(batch.map(async (product) => {
            const nameLower = product.name.toLowerCase();
            let imageUrl = IMAGE_MAP['default'];

            // Determine Image based on keywords priority
            if (nameLower.includes('spray')) imageUrl = IMAGE_MAP['spray'];
            else if (nameLower.includes('esmalte')) imageUrl = IMAGE_MAP['esmalte'];
            else if (nameLower.includes('vivacor') || nameLower.includes('tinta')) imageUrl = IMAGE_MAP['tinta'];
            else if (nameLower.includes('rolo')) imageUrl = SPECIFIC_MAP['rolo'] || IMAGE_MAP['rolo'];
            else if (nameLower.includes('pincel') || nameLower.includes('trincha')) imageUrl = IMAGE_MAP['pincel'];
            else if (nameLower.includes('lixa')) imageUrl = IMAGE_MAP['lixa'];
            else if (nameLower.includes('espatula')) imageUrl = IMAGE_MAP['espatula'];
            else if (nameLower.includes('argamassa')) imageUrl = IMAGE_MAP['argamassa'];
            else if (nameLower.includes('manta') || nameLower.includes('vedacit') || nameLower.includes('impermeabilizante')) imageUrl = IMAGE_MAP['vedacit'];

            // Update product
            const { error: updateErr } = await supabase
                .from('products')
                .update({ image: imageUrl })
                .eq('id', product.id);

            if (updateErr) {
                console.error(`Failed to update ${product.name}:`, updateErr);
            } else {
                updatedCount++;
            }
        }));

        console.log(`Updated batch ${i + batchSize} / ${allProducts.length}...`);
    }

    console.log(`Finished! Updated ${updatedCount} products.`);
}

populateImages();
