import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
// import fetch from 'node-fetch'; // Usar fetch nativo do Node 18+

dotenv.config({ path: '.env.local' });

console.log('🚀 Script iniciado...'); // Log imediato para debug

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

async function fetchGoogleImagesScrape(query: string): Promise<string | null> {
    try {
        console.log(`🔎 Scraping Google: "${query}"...`);

        // Usar interface móvel antiga do Google (mais fácil de parsear)
        const url = `https://www.google.com/m/search?q=${encodeURIComponent(query)}&tbm=isch`;

        const res = await fetch(url, {
            headers: {
                // User-Agent genérico de celular
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.181 Mobile Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });

        if (!res.ok) {
            console.warn(`⚠️ Google recusou conexão: ${res.status}`);
            return null;
        }

        const html = await res.text();

        // Regex para encontrar imagens na versão mobile
        // O padrão geralmente é <img src="http..." ...> dentro de tabelas ou divs
        // Vamos procurar links diretos de imagem jpg/png ou o src da thumb

        // Tenta encontrar a primeira imagem de resultado (que não seja ícone do Google)
        // Na interface mobile, as imagens de resultado costumam ter class="yWs4tf" ou estar em tags a > img

        // Regex simplificada        // Regex simplificada para pegar srcs de imagens que começam com http
        // const imgRegex = /<img[^>]+src="(https:\/\/[^"]+)"[^>]*>/g; 

        // Tenta pegar imagens dentro de divisões de resultados clássicos (table, div class yWs4tf)
        // O Google mobile costuma retornar <img src="..."> bem direto

        const imgRegex = /<img[^>]+src="(https?:\/\/[^"]+)"/g;

        let match;
        while ((match = imgRegex.exec(html)) !== null) {
            const src = match[1];

            // FILTRO DE QUALIDADE (Blacklist)
            if (
                src.includes('gstatic.com') || // Thumbnails do Google (ok)
                src.includes('favicon') ||
                src.includes('fbcdn') ||       // Facebook
                src.includes('facebook') ||
                src.includes('instagram') ||
                src.includes('whatsapp') ||
                src.includes('assets') ||      // Assets genéricos
                src.includes('icon') ||
                src.includes('logo') ||
                src.includes('aaa') // Exemplo
            ) {
                // Se for gstatic, é aceitável SE não houver opção melhor, mas o loop continua
                if (src.includes('gstatic.com')) {
                    // return src; // HABILITAR SE QUISER ACEITAR O PRIMEIRO GSTATIC
                }
                continue;
            }

            // Se passou no filtro e não é gstatic (ou seja, é imagem externa), prioriza
            return src;
        }

        // SE não achou imagem externa, tenta de novo aceitando gstatic (thumbnail do google)
        // Reset regex lastIndex? Não precisa pois vamos fazer novo loop ou nova regex
        // Vamos fazer um "fallback" simples: rodar o regex de novo e pegar o primeiro gstatic aceitável

        const fallbackRegex = /<img[^>]+src="(https?:\/\/[^"]+)"/g;
        while ((match = fallbackRegex.exec(html)) !== null) {
            const src = match[1];
            if (src.includes('gstatic.com') && !src.includes('favicon') && !src.includes('icon')) {
                return src;
            }
        }

        console.warn(`⚠️ HTML length: ${html.length} (Pode ser captcha ou estrutura diferente)`);
        // console.log(html.substring(0, 500)); // Descomentar se precisar ver o HTML

        return null;

    } catch (e) {
        console.error('❌ Erro no scrape:', e);
        return null;
    }
}

async function run() {
    console.log('🚀 Iniciando atualização VIA SCRAPING (V2 - Sem Facebook)...');
    console.log('🛑 Parando scripts anteriores...');

    const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .order('name');
    // .limit(5); // LIMITADO A 5 PARA TESTE

    if (!products) {
        console.error('❌ Nenhum produto encontrado ou erro no Supabase.');
        return;
    }

    let updated = 0;

    for (const product of products) {
        // Busca com exclusão de sites sociais
        const query = `${product.name} material construção -site:facebook.com -site:instagram.com -site:pinterest.com`;
        const url = await fetchGoogleImagesScrape(query);

        if (url) {
            const { error } = await supabase
                .from('products')
                .update({ image: url })
                .eq('id', product.id);

            if (!error) {
                console.log(`✅ ${product.name} => ${url.substring(0, 30)}...`);
                updated++;
            }
        } else {
            console.warn(`⚠️ Não achou: ${product.name}`);
        }

        // Delay amigável para não ser bloqueado (Google é chato)
        await new Promise(r => setTimeout(r, 3000));
    }

    console.log(`\n🏁 Concluído! Atualizados: ${updated}`);
}

run();
