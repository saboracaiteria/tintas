import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Carrega variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

// ==============================================================================
// TENTAR COM AMBAS AS CHAVES (A nova e a antiga)
const GOOGLE_API_KEYS = [
    process.env.GOOGLE_API_KEY || ''
];
const GOOGLE_CX = process.env.GOOGLE_CX || '11af7512aa0ca48cc';
const GOOGLE_API_URL = 'https://www.googleapis.com/customsearch/v1';

// ==============================================================================

async function fetchGoogleImage(productName: string): Promise<string | null> {
    // Tenta cada chave disponível
    for (const apiKey of GOOGLE_API_KEYS) {
        try {
            // Limpa o nome para melhor busca (remove caracteres estranhos)
            const query = `${productName}`;
            console.log(`🔎 Buscando no Google (Chave: ${apiKey.substring(0, 10)}...): "${query}"...`);

            const url = `${GOOGLE_API_URL}?key=${apiKey}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}&searchType=image&num=1&safe=active`;

            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                // console.error(`❌ Erro Google API (${response.status}): ${response.statusText}`);

                // Se for erro de permissão (403), tenta a próxima chave
                if (response.status === 403) {
                    console.warn(`⚠️ Chave bloqueada ou sem permissão. Tentando próxima...`);
                    continue;
                }

                // Se der erro 429 (Quota), parar o script
                if (response.status === 429) {
                    throw new Error('Quota excedida');
                }
                return null;
            }

            const data: any = await response.json();

            if (data.items && data.items.length > 0) {
                const imageUrl = data.items[0].link;
                return imageUrl;
            } else {
                console.warn(`⚠️ Nenhuma imagem encontrada para "${productName}"`);
                return null;
            }

        } catch (error) {
            console.error(`❌ Erro na requisição:`, error);
            if ((error as Error).message === 'Quota excedida') throw error;
        }
    }

    console.error('❌ Todas as chaves falharam.');
    return null; // Falhou com todas as chaves
}

async function updateImagesFromApi() {
    console.log('🚀 Iniciando atualização de imagens via Google Images...');

    // 1. Buscar produtos do banco 
    // Vamos limitar a 5 produtos inicialmente para testar a chave e não gastar quota à toa
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, image')
        // .is('image', null) // Pode descomentar para focar nos sem imagem
        .order('name')
        .limit(5);

    if (error || !products) {
        console.error('❌ Erro ao buscar produtos:', error);
        return;
    }

    console.log(`📦 Processando ${products.length} produtos (Teste Inicial)...`);

    let updated = 0;
    let failed = 0;

    // 2. Iterar e buscar imagens
    for (const product of products) {
        try {
            const newImageUrl = await fetchGoogleImage(product.name);

            if (newImageUrl) {
                // Atualizar no banco
                const { error: updateErr } = await supabase
                    .from('products')
                    .update({ image: newImageUrl })
                    .eq('id', product.id);

                if (updateErr) {
                    console.error(`❌ Falha ao salvar ${product.name}:`, updateErr);
                    failed++;
                } else {
                    console.log(`✅ Imagem salva: ${newImageUrl}`);
                    updated++;
                }
            } else {
                failed++;
            }
        } catch (e: any) {
            if (e.message === 'Quota excedida') {
                console.error('⛔ Quota diária da API do Google excedida! Parando script.');
                break;
            }
        }

        // Delay de segurança
        await new Promise(r => setTimeout(r, 1500));
    }

    console.log(`\n🏁 Processo finalizado!`);
    console.log(`✅ Atualizados: ${updated}`);
    console.log(`❌ Falhas/Não encontrados: ${failed}`);
}

updateImagesFromApi();
