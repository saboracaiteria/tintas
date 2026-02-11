import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Credenciais do Supabase não encontradas no .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyImages() {
    console.log('🔍 Iniciando verificação de imagens...');

    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, image');

    if (error) {
        console.error('❌ Erro ao buscar produtos:', error.message);
        return;
    }

    console.log(`📦 Total de produtos encontrados: ${products.length}`);

    let okCount = 0;
    let errorCount = 0;

    for (const product of products) {
        if (!product.image) {
            console.warn(`⚠️ [SEM IMAGEM] ${product.name} (ID: ${product.id})`);
            continue;
        }

        try {
            const response = await fetch(product.image, { method: 'HEAD' });
            if (response.ok) {
                // console.log(`✅ [OK] ${product.name}`);
                okCount++;
            } else {
                console.error(`❌ [ERRO ${response.status}] ${product.name} - URL: ${product.image}`);
                errorCount++;
            }
        } catch (err) {
            console.error(`❌ [FALHA] ${product.name} - Erro de rede: ${err.message} - URL: ${product.image}`);
            errorCount++;
        }
    }

    console.log('\n📊 RELATÓRIO FINAL:');
    console.log(`✅ Imagens válidas: ${okCount}`);
    console.log(`❌ Imagens quebradas: ${errorCount}`);
}

verifyImages();
