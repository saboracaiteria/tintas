import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import {
    categories as mockCategories,
    products as mockProducts,
    groups as mockGroups,
    coupons as mockCoupons,
    mockSettings
} from './mockData';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Credenciais do Supabase não encontradas no .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Maps to store Old ID -> New UUID mapping
const categoryMap = new Map();
const groupMap = new Map();
const productMap = new Map();

async function populateDB() {
    console.log('🚀 Iniciando população do banco de dados (Paulista Materiais)...');

    try {
        // 1. SETTINGS
        console.log('⚙️ Atualizando configurações...');
        const { error: settingsError } = await supabase.from('settings').upsert({
            id: 1,
            store_name: mockSettings.storeName,
            logo_url: mockSettings.logoUrl,
            banner_url: mockSettings.bannerUrl,
            whatsapp_number: mockSettings.whatsappNumber,
            store_status: mockSettings.storeStatus,
            delivery_fee: mockSettings.deliveryFee,
            delivery_only: mockSettings.deliveryOnly,
            opening_hours: mockSettings.openingHours
        });
        if (settingsError) throw new Error(`Erro settings: ${settingsError.message}`);
        console.log('✅ Configurações atualizadas.');

        // 2. CATEGORIES
        console.log('📂 Inserindo categorias...');
        const dbCategories = mockCategories.map(cat => {
            const newId = uuidv4();
            categoryMap.set(cat.id, newId);
            return {
                id: newId,
                title: cat.title,
                icon: cat.icon,
                display_order: cat.displayOrder
            };
        });
        const { error: catError } = await supabase.from('categories').upsert(dbCategories);
        if (catError) throw new Error(`Erro categories: ${catError.message}`);
        console.log(`✅ ${dbCategories.length} categorias inseridas.`);

        // 3. PRODUCT GROUPS & OPTIONS
        console.log('🧩 Inserindo grupos e opções...');
        const dbGroups = [];
        const dbOptions = [];

        for (const group of mockGroups) {
            const newGroupId = uuidv4();
            groupMap.set(group.id, newGroupId);

            dbGroups.push({
                id: newGroupId,
                title: group.title,
                min: group.min,
                max: group.max
            });

            if (group.options) {
                group.options.forEach(opt => {
                    dbOptions.push({
                        id: uuidv4(),
                        group_id: newGroupId,
                        name: opt.name,
                        price: opt.price,
                        description: ''
                    });
                });
            }
        }

        const { error: grpError } = await supabase.from('product_groups').upsert(dbGroups);
        if (grpError) throw new Error(`Erro groups: ${grpError.message}`);

        const { error: optError } = await supabase.from('product_options').upsert(dbOptions);
        if (optError) throw new Error(`Erro options: ${optError.message}`);

        console.log(`✅ ${dbGroups.length} grupos e ${dbOptions.length} opções inseridos.`);

        // 4. PRODUCTS
        console.log('🎨 Inserindo produtos...');
        const dbProducts = mockProducts.map(prod => {
            const newProdId = uuidv4();
            productMap.set(prod.id, newProdId);
            const catId = categoryMap.get(prod.categoryId);

            if (!catId) console.warn(`⚠️ Categoria não encontrada para produto ${prod.name}`);

            return {
                id: newProdId,
                name: prod.name,
                description: prod.description,
                price: prod.price,
                image: prod.image,
                category_id: catId
            };
        });

        const { error: prodError } = await supabase.from('products').upsert(dbProducts);
        if (prodError) throw new Error(`Erro products: ${prodError.message}`);
        console.log(`✅ ${dbProducts.length} produtos inseridos.`);

        // 5. RELATIONS (Product <-> Group)
        console.log('🔗 Criando relacionamentos...');
        const dbRelations = [];

        mockProducts.forEach(prod => {
            if (prod.groupIds && prod.groupIds.length > 0) {
                const newProdId = productMap.get(prod.id);

                prod.groupIds.forEach(groupId => {
                    const newGroupId = groupMap.get(groupId);
                    if (newProdId && newGroupId) {
                        dbRelations.push({
                            product_id: newProdId,
                            group_id: newGroupId
                        });
                    }
                });
            }
        });

        if (dbRelations.length > 0) {
            const { error: relError } = await supabase.from('product_group_relations').upsert(dbRelations);
            if (relError) throw new Error(`Erro relations: ${relError.message}`);
        }
        console.log(`✅ ${dbRelations.length} relacionamentos criados.`);

        // 6. COUPONS
        console.log('🎟️ Inserindo cupons...');
        const dbCoupons = mockCoupons.map(c => ({
            id: uuidv4(),
            code: c.code,
            type: c.type,
            value: c.value,
            active: c.active
        }));

        const { error: coupError } = await supabase.from('coupons').upsert(dbCoupons);
        if (coupError) throw new Error(`Erro coupons: ${coupError.message}`);
        console.log(`✅ ${dbCoupons.length} cupons inseridos.`);

        console.log('\n🎉 SUCESSO! Banco de dados populado com dados da Paulista Materiais.');

    } catch (err) {
        console.error('\n❌ ERRO FATAL:', err.message);
    }
}

populateDB();
