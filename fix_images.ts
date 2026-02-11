import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function fixImages() {
    console.log('🛠️ Iniciando correção de imagens quebradas...');

    // Buscar todos os produtos
    const { data: products, error } = await supabase.from('products').select('*');
    if (error) {
        console.error('Erro ao buscar produtos:', error);
        return;
    }

    let updatedCount = 0;

    for (const p of products) {
        // Lógica de cor baseada no nome
        let bgColor = 'ff6b00'; // Default Laranja
        let textColor = 'ffffff';
        const nameLower = p.name.toLowerCase();

        if (nameLower.includes('verniz')) bgColor = '5D4037'; // Marrom
        else if (nameLower.includes('massa')) bgColor = '757575'; // Cinza
        else if (nameLower.includes('branco') || nameLower.includes('neve')) {
            bgColor = 'f5f5f5';
            textColor = '333333';
        }
        else if (nameLower.includes('impermeab') || nameLower.includes('manta')) bgColor = '0288D1'; // Azul
        else if (nameLower.includes('rolo') || nameLower.includes('pincel') || nameLower.includes('lixa')) bgColor = '455A64'; // Cinza Escuro

        // Gerar nova URL
        const newImage = `https://placehold.co/400x400/${bgColor}/${textColor}/png?text=${encodeURIComponent(p.name.substring(0, 25))}`;

        // Atualizar
        const { error: updateError } = await supabase
            .from('products')
            .update({ image: newImage })
            .eq('id', p.id);

        if (!updateError) {
            updatedCount++;
            process.stdout.write('.');
        }
    }

    console.log(`\n\n✅ ${updatedCount} produtos atualizados com novas imagens de placeholder.`);
}

fixImages();
