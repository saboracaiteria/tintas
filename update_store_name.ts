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

async function updateStoreName() {
    console.log('🚀 Atualizando nome da loja no banco de dados...');

    try {
        const { error } = await supabase
            .from('settings')
            .update({ 
                store_name: 'Paulista Materiais',
                logo_url: 'https://ui-avatars.com/api/?name=Paulista+Materiais&background=ff6b00&color=fff&size=256&font-size=0.33'
            })
            .eq('id', 1);

        if (error) {
            throw new Error(`Erro ao atualizar settings: ${error.message}`);
        }

        console.log('✅ Nome da loja atualizado para "Paulista Materiais" com sucesso!');
    } catch (err) {
        console.error('\n❌ ERRO:', err.message);
    }
}

updateStoreName();
