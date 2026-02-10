
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function cleanup() {
    const names = ['Tinta Destack (Premium)', 'Tinta Spray Multiuso'];

    for (const name of names) {
        const { data: products } = await supabase
            .from('products')
            .select('id, name, created_at')
            .eq('name', name)
            .order('created_at', { ascending: false });

        if (!products || products.length <= 1) {
            console.log(`No duplicates for ${name}`);
            continue;
        }

        const [keep, ...remove] = products; // Keep the newest (first because desc order)
        console.log(`Keeping ${keep.id} (${keep.created_at})`);
        
        const idsToRemove = remove.map(p => p.id);
        if (idsToRemove.length > 0) {
            console.log(`Removing duplicates: ${idsToRemove.join(', ')}`);
            await supabase.from('products').delete().in('id', idsToRemove);
            console.log('Removed.');
            
            // Also need to remove their relations?
            // Usually cascade delete handles this if set up correctly. 
            // If not, we might leave orphaned options.
            // But let's assume cascade or ignore for now as they are just dummy products.
        }
    }
}

cleanup();
