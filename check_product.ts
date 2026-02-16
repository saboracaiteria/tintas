import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkProduct() {
    console.log('🕵️ Verificando produto "ADITIVO SIKA 1LT"...');

    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, image')
        .ilike('name', '%ADITIVO SIKA 1LT%') // Busca aproximada
        .limit(1);

    if (error) {
        console.error('❌ Erro na busca:', error);
        return;
    }

    if (!products || products.length === 0) {
        console.error('❌ Produto não encontrado no banco.');
        return;
    }

    const product = products[0];
    console.log(`📦 ID: ${product.id}`);
    console.log(`🏷️ Nome: ${product.name}`);
    console.log(`🖼️ IMAGEM NO BANCO: ${product.image}`); // Aqui está a verdade
}

checkProduct();
