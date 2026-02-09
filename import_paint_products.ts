
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CSV_PATH = 'produtos.csv';

const KEYWORDS = [
    'TINTA', 'PINTURA', 'ESMALTE', 'VERNIZ', 'SELADOR', 'MASSA', 'CORRIDA', 'ACRILICA',
    'LATEX', 'PISO', 'DEMARCACAO', 'SPRAY', 'AEROSSOL',
    'AGUARRAS', 'THINNER', 'DILUENTE', 'SOLVENTE', 'REMOVEDOR',
    'VEDACIT', 'NEUTROL', 'VEDAPREN', 'IMPERMEABILIZANTE', 'MANTA', 'LIQUIDA', 'ASFA',
    'BETUME', 'ECOL', 'BIANCO', 'IGOL', 'DRYKO', 'SIKA',
    'ROLO', 'PINCEL', 'BROXA', 'LIXA', 'BANDEJA', 'BATEDOR', 'ESPATULA'
];

// Helper to determine category
function getCategory(name) {
    const upper = name.toUpperCase();
    if (upper.includes('TINTA') || upper.includes('ESMALTE') || upper.includes('LATEX') || upper.includes('VERNIZ') || upper.includes('SPRAY')) return 'Tintas e Acabamentos';
    if (upper.includes('IMPERME') || upper.includes('VEDA') || upper.includes('IGOL') || upper.includes('DRYKO') || upper.includes('MANTA')) return 'Impermeabilizantes';
    if (upper.includes('DILUENTE') || upper.includes('AGUARRAS') || upper.includes('SOLVENTE') || upper.includes('REMOVEDOR')) return 'Solventes e Limpeza';
    if (upper.includes('ROLO') || upper.includes('PINCEL') || upper.includes('BROXA') || upper.includes('LIXA') || upper.includes('BANDEJA') || upper.includes('ESPATULA')) return 'Acessórios de Pintura';
    return 'Pintura - Geral';
}

function parsePrice(priceStr) {
    if (!priceStr) return 0;
    // Format: "1.234,56" -> 1234.56
    return parseFloat(priceStr.replace(/\./g, '').replace(',', '.'));
}

async function run() {
    console.log("Starting import...");

    try {
        const fileContent = fs.readFileSync(CSV_PATH, 'latin1'); // Use latin1 for legacy CSVs
        const lines = fileContent.split('\n');

        // Get Categories ID map
        // We will ensure our categories exist. For simplicity, we just list them here.
        // In a real scenario we'd upsert categories first.
        // Let's assume a generic category ID for now or fetch one.
        const { data: categories } = await supabase.from('categories').select('id, name');
        let categoryMap = {};
        if (categories) {
            categories.forEach(c => categoryMap[c.name] = c.id);
        }

        // Ensure our target categories exist or use a default one temporarily
        // For this script, we will try to find a 'Pintura' category or create one if missing
        let paintCategoryId = categoryMap['Pintura'];

        if (!paintCategoryId) {
            console.log("Category 'Pintura' not found. Inserting...");
            const { data: newCat } = await supabase.from('categories').insert({ name: 'Pintura', slug: 'pintura', image_url: 'https://via.placeholder.com/150' }).select().single();
            if (newCat) paintCategoryId = newCat.id;
        }

        let count = 0;

        for (const line of lines) {
            if (!line.trim()) continue;

            // Very basic CSV parsing logic assuming quoted fields might exist but simplified for this specific file structure
            // The structure seems to be: CODE - DESCRIPTION, "NCM? INFO UN STOCK", "PRICE"
            // Example: 56039 - BRANCO N9,5 DEMARCACAO 18LT,"32082019 001730 VELOZ 1 UN 0,00","779,55"

            const firstComma = line.indexOf(',');
            if (firstComma === -1) continue;

            const rawPart1 = line.substring(0, firstComma); // "56039 - BRANCO N9,5 DEMARCACAO 18LT"
            // Extract ID and Name
            const separator = ' - ';
            const sepIndex = rawPart1.indexOf(separator);

            if (sepIndex === -1) continue;

            const externalId = rawPart1.substring(0, sepIndex).trim();
            const description = rawPart1.substring(sepIndex + separator.length).trim();

            // Filter by Keywords
            const upperDesc = description.toUpperCase();
            const keywordMatch = KEYWORDS.some(k => upperDesc.includes(k));

            if (!keywordMatch) continue;

            // Parse Price: it's usually the last quoted string
            const lastQuote = line.lastIndexOf('"');
            const secondLastQuote = line.lastIndexOf('"', lastQuote - 1);
            let price = 0;
            if (lastQuote > secondLastQuote && secondLastQuote !== -1) {
                price = parsePrice(line.substring(secondLastQuote + 1, lastQuote));
            }

            // Prepare object
            const slug = description.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const specificCategory = getCategory(description);

            // We will put everything in the main 'Pintura' category for now, 
            // to avoid creating 5 new categories programmatically without user approval.
            // But we store the specific type in description or similar if needed.

            const product = {
                name: description,
                description: `${specificCategory} - Código: ${externalId}`,
                price: price,
                category_id: paintCategoryId,
                // active: true,
                image: "https://via.placeholder.com/300?text=Pintura", // Framework placeholder
                sales_count_text: "Novo",
                stock_text: "Em estoque"
            };

            // Insert
            // Check if exists by name to avoid duplicates? Or just insert.
            // This is a "run once" script so we assume cleanup if needed.
            // Using upsert on name might be risky if duplicated names exist.

            const { error } = await supabase.from('products').insert(product);

            if (error) {
                console.error(`Failed to insert ${description}:`, error.message);
            } else {
                console.log(`Imported: ${description}`);
                count++;
            }
        }

        console.log(`\nImport finished. Imported ${count} products.`);

    } catch (err) {
        console.error("Script error:", err);
    }
}

run();
