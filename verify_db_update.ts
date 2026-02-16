import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

async function testUpdate() {
    console.log('🕵️ Testando permissão de escrita no banco...');

    // 1. Pegar um produto qualquer
    const { data: products } = await supabase
        .from('products')
        .select('id, name, image')
        .limit(1);

    if (!products || products.length === 0) {
        console.error('❌ Não consegui ler produtos (Leitura bloqueada ou banco vazio?)');
        return;
    }

    const product = products[0];
    console.log(`📦 Produto alvo: ${product.name} (ID: ${product.id})`);
    console.log(`🖼️ Imagem atual: ${product.image}`);

    // 2. Tentar atualizar
    const testImage = 'https://via.placeholder.com/150?text=TestUpdate';

    const { data, error } = await supabase
        .from('products')
        .update({ image: testImage })
        .eq('id', product.id)
        .select(); // IMPORTANTE: .select() para retornar o dado atualizado

    if (error) {
        console.error('❌ ERRO AO ATUALIZAR:', error);
        console.error('💡 Dica: Verifique as Políticas RLS (Row Level Security) no Supabase.');
    } else {
        console.log('✅ Atualização retornou sucesso.');
        console.log('📝 Dados retornados:', data);

        if (!data || data.length === 0) {
            console.warn('⚠️ O update não retornou dados. Isso geralmente significa que a RLS bloqueou a escrita silenciosamente ou o ID não foi achado.');
        }
    }
}

testUpdate();
