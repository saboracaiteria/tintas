import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

async function listProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('id, name, image, category_id, active')
        .order('name');

    if (error) {
        console.error('Erro:', error);
        return;
    }

    console.log(`Total: ${data.length} produtos\n`);
    data.forEach(p => {
        const hasImage = p.image && !p.image.includes('placehold') && !p.image.includes('placeholder');
        console.log(`[${hasImage ? '✅' : '❌'}] ${p.name} | cat:${p.category_id} | active:${p.active}`);
        if (p.image) console.log(`    img: ${p.image.substring(0, 80)}`);
    });
}

listProducts();
