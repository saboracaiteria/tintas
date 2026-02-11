import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

// =======================================================
// Mapeamento de palavras-chave -> URLs de imagens reais
// Usando imagens do Unsplash (acesso gratuito via source)
// =======================================================
const IMAGE_MAP: Record<string, string> = {
    // TINTAS - latas de tinta coloridas
    'tinta_branco': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=800&fit=crop&q=80',
    'tinta_colorida': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=800&fit=crop&q=80',
    'tinta_generica': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=800&fit=crop&q=80',

    // ESMALTE - tinta esmalte
    'esmalte': 'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?w=800&h=800&fit=crop&q=80',

    // SPRAY
    'spray': 'https://images.unsplash.com/photo-1635048424329-a9bfb146d7aa?w=800&h=800&fit=crop&q=80',

    // VERNIZ - lata verniz madeira
    'verniz': 'https://images.unsplash.com/photo-1594844532765-2e735422ac44?w=800&h=800&fit=crop&q=80',

    // ROLO de pintura
    'rolo': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=800&fit=crop&q=80',

    // PINCEL / TRINCHA  
    'pincel': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=800&fit=crop&q=80',

    // LIXA
    'lixa': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=800&fit=crop&q=80',

    // MASSA CORRIDA / MASSA PVA
    'massa': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=800&fit=crop&q=80',

    // ARGAMASSA / REJUNTE
    'argamassa': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=800&fit=crop&q=80',

    // IMPERMEABILIZANTE / VEDACIT / VEDAPREN
    'impermeabilizante': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop&q=80',

    // MANTA ASFÁLTICA
    'manta': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop&q=80',

    // SELADOR / FUNDO PREPARADOR
    'selador': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=800&fit=crop&q=80',

    // SOLVENTE / THINNER / AGUARRAS
    'solvente': 'https://images.unsplash.com/photo-1532187863486-abf4dbce1253?w=800&h=800&fit=crop&q=80',

    // FITA / ADESIVO
    'fita': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=800&fit=crop&q=80',

    // TEXTURA
    'textura': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=800&fit=crop&q=80',

    // TELHA / COBERTURA
    'telha': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop&q=80',

    // FERRAMENTAS / ACESSÓRIOS
    'ferramenta': 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&h=800&fit=crop&q=80',

    // VARAL
    'varal': 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&h=800&fit=crop&q=80',

    // LONA
    'lona': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop&q=80',

    // PRODUTO GENÉRICO
    'default': 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&h=800&fit=crop&q=80',
};

// Determina a melhor imagem baseada no nome do produto
function getImageForProduct(name: string): string {
    const n = name.toLowerCase();

    // --- SPRAY ---
    if (n.includes('spray')) return IMAGE_MAP['spray'];

    // --- VERNIZ ---
    if (n.includes('verniz')) return IMAGE_MAP['verniz'];

    // --- ESMALTE ---
    if (n.includes('esmalte')) return IMAGE_MAP['esmalte'];

    // --- MASSA ---
    if (n.includes('massa corrida') || n.includes('massa pva') || n.includes('massa acrilica'))
        return IMAGE_MAP['massa'];

    // --- SELADOR / FUNDO ---
    if (n.includes('selador') || n.includes('fundo preparador'))
        return IMAGE_MAP['selador'];

    // --- SOLVENTE / THINNER / AGUARRAS ---
    if (n.includes('solvente') || n.includes('thinner') || n.includes('aguarras') || n.includes('aguarraz'))
        return IMAGE_MAP['solvente'];

    // --- IMPERMEABILIZANTE ---
    if (n.includes('vedacit') || n.includes('vedapren') || n.includes('impermeabilizante') || n.includes('tecplus'))
        return IMAGE_MAP['impermeabilizante'];

    // --- MANTA ---
    if (n.includes('manta')) return IMAGE_MAP['manta'];

    // --- ARGAMASSA / REJUNTE ---
    if (n.includes('argamassa') || n.includes('rejunte'))
        return IMAGE_MAP['argamassa'];

    // --- TEXTURA ---
    if (n.includes('textura') || n.includes('grafiato'))
        return IMAGE_MAP['textura'];

    // --- LIXA ---
    if (n.includes('lixa')) return IMAGE_MAP['lixa'];

    // --- ROLO ---
    if (n.includes('rolo')) return IMAGE_MAP['rolo'];

    // --- PINCEL / TRINCHA ---
    if (n.includes('pincel') || n.includes('trincha'))
        return IMAGE_MAP['pincel'];

    // --- FITA ---
    if (n.includes('fita')) return IMAGE_MAP['fita'];

    // --- VARAL ---
    if (n.includes('varal')) return IMAGE_MAP['varal'];

    // --- LONA ---
    if (n.includes('lona')) return IMAGE_MAP['lona'];

    // --- TELHA ---
    if (n.includes('telha')) return IMAGE_MAP['telha'];

    // --- TINTAS (mais genérico, deixar por último) ---
    if (n.includes('branco') || n.includes('gelo') || n.includes('neve'))
        return IMAGE_MAP['tinta_branco'];
    if (n.includes('tinta') || n.includes('vivacor') || n.includes('veloz') ||
        n.includes('elite') || n.includes('leinertex') || n.includes('renove') ||
        n.includes('semi brilho') || n.includes('acrilica') || n.includes('latex'))
        return IMAGE_MAP['tinta_colorida'];

    // --- FERRAMENTAS genéricas ---
    if (n.includes('espatula') || n.includes('desempenadeira') || n.includes('bandeja'))
        return IMAGE_MAP['ferramenta'];

    // --- DEFAULT ---
    return IMAGE_MAP['default'];
}

async function updateImages() {
    console.log('🎨 Buscando todos os produtos...');

    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, active')
        .order('name');

    if (error || !products) {
        console.error('Erro:', error);
        return;
    }

    console.log(`📦 Total: ${products.length} produtos\n`);

    let updated = 0;
    let failed = 0;
    const batchSize = 20;

    for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);

        await Promise.all(batch.map(async (product) => {
            const imageUrl = getImageForProduct(product.name);

            const { error: updateErr } = await supabase
                .from('products')
                .update({ image: imageUrl })
                .eq('id', product.id);

            if (updateErr) {
                console.error(`❌ ${product.name}: ${updateErr.message}`);
                failed++;
            } else {
                updated++;
            }
        }));

        console.log(`🔄 Processado ${Math.min(i + batchSize, products.length)}/${products.length}...`);
    }

    console.log(`\n✅ Atualização concluída!`);
    console.log(`   ✅ Atualizados: ${updated}`);
    console.log(`   ❌ Falhas: ${failed}`);
}

updateImages();
