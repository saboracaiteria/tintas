import { Category, Product, ProductGroup, Coupon } from './types';

// ========================================
// CASA DAS CORES - LOJA DE TINTAS
// ========================================

// Generic placeholder images from Unsplash (reliable & free)
const IMAGES = {
    paint_white: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop',
    paint_bucket: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=400&fit=crop',
    paint_roller: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    paint_brushes: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=400&fit=crop',
    paint_cans: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=400&h=400&fit=crop',
    wall_paint: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=400&fit=crop',
    wood_stain: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=400&fit=crop',
    tools: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=400&fit=crop',
    spray: 'https://images.unsplash.com/photo-1563906267088-b029e7101114?w=400&h=400&fit=crop',
    waterproof: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=400&fit=crop',
};

export const categories: Category[] = [
    { id: '1', title: 'Paredes e Tetos', displayOrder: 1, active: true, icon: '🏠' },
    { id: '2', title: 'Madeiras e Metais', displayOrder: 2, active: true, icon: '🚪' },
    { id: '3', title: 'Preparação e Tratamento', displayOrder: 3, active: true, icon: '🧱' },
    { id: '4', title: 'Impermeabilizantes', displayOrder: 4, active: true, icon: '☔' },
    { id: '5', title: 'Acessórios e Ferramentas', displayOrder: 5, active: true, icon: '🖌️' }
];

// ========== GRUPOS DE TAMANHOS ==========
export const groups: ProductGroup[] = [
    {
        id: 'tamanho_tinta_acrilica',
        title: 'Escolha o Tamanho',
        min: 1,
        max: 1,
        active: true,
        options: [
            { id: 'tam_900ml', name: '900ml (Pequeno)', price: 0, active: true },
            { id: 'tam_3600ml', name: '3.6L (Galão)', price: 0, active: true },
            { id: 'tam_18l', name: '18L (Lata)', price: 0, active: true },
        ]
    },
    {
        id: 'tamanho_esmalte',
        title: 'Escolha o Tamanho',
        min: 1,
        max: 1,
        active: true,
        options: [
            { id: 'esm_900ml', name: '900ml', price: 0, active: true },
            { id: 'esm_3600ml', name: '3.6L', price: 0, active: true },
        ]
    },
    {
        id: 'tamanho_verniz',
        title: 'Escolha o Tamanho',
        min: 1,
        max: 1,
        active: true,
        options: [
            { id: 'ver_900ml', name: '900ml', price: 0, active: true },
            { id: 'ver_3600ml', name: '3.6L', price: 0, active: true },
        ]
    },
    {
        id: 'tamanho_massa',
        title: 'Escolha o Tamanho',
        min: 1,
        max: 1,
        active: true,
        options: [
            { id: 'mas_5kg', name: '5kg (Balde)', price: 0, active: true },
            { id: 'mas_25kg', name: '25kg (Saco)', price: 0, active: true },
        ]
    },
    {
        id: 'tamanho_impermeabilizante',
        title: 'Escolha o Tamanho',
        min: 1,
        max: 1,
        active: true,
        options: [
            { id: 'imp_3600ml', name: '3.6L', price: 0, active: true },
            { id: 'imp_18kg', name: '18kg (Balde)', price: 0, active: true },
        ]
    },
    {
        id: 'cor_tinta',
        title: 'Escolha a Cor',
        min: 1,
        max: 1,
        active: true,
        options: [
            { id: 'cor_branco', name: 'Branco Neve', price: 0, active: true },
            { id: 'cor_gelo', name: 'Gelo', price: 0, active: true },
            { id: 'cor_palha', name: 'Palha', price: 0, active: true },
            { id: 'cor_cinza', name: 'Cinza Claro', price: 0, active: true },
            { id: 'cor_areia', name: 'Areia', price: 0, active: true },
        ]
    }
];

export const products: Product[] = [
    // ========== PAREDES E TETOS (ID: 1) ==========
    {
        id: '101',
        name: 'Tinta Acrílica Premium Fosco',
        description: 'Máxima cobertura e lavabilidade. Ideal para áreas internas e externas. Acabamento fosco que disfarça imperfeições.',
        price: 89.90,
        categoryId: '1',
        image: IMAGES.paint_white,
        displayOrder: 1,
        active: true,
        groupIds: ['tamanho_tinta_acrilica', 'cor_tinta']
    },
    {
        id: '102',
        name: 'Tinta Acrílica Standard',
        description: 'Ótimo rendimento e baixo odor. A escolha certa para quem quer economia sem abrir mão da qualidade.',
        price: 59.90,
        categoryId: '1',
        image: IMAGES.paint_bucket,
        displayOrder: 2,
        active: true,
        groupIds: ['tamanho_tinta_acrilica', 'cor_tinta']
    },
    {
        id: '103',
        name: 'Tinta Lavável Acetinada',
        description: 'Toque de seda e brilho suave. Super resistente à limpeza e esfregação.',
        price: 119.90,
        categoryId: '1',
        image: IMAGES.wall_paint,
        displayOrder: 3,
        active: true,
        groupIds: ['tamanho_tinta_acrilica', 'cor_tinta']
    },
    {
        id: '104',
        name: 'Tinta Piso Alta Resistência',
        description: 'Para calçadas, garagens, quadras e escadas. Resiste ao tráfego de pessoas e carros.',
        price: 79.90,
        categoryId: '1',
        image: IMAGES.paint_cans,
        displayOrder: 4,
        active: true,
        groupIds: ['tamanho_tinta_acrilica']
    },
    {
        id: '105',
        name: 'Tinta Gesso & Drywall',
        description: 'Direto no gesso! Não descasca e fixa o pó. Dispensa fundo preparador.',
        price: 69.90,
        categoryId: '1',
        image: IMAGES.paint_white,
        displayOrder: 5,
        active: true,
        groupIds: ['tamanho_tinta_acrilica']
    },

    // ========== MADEIRAS E METAIS (ID: 2) ==========
    {
        id: '201',
        name: 'Esmalte Base Água Acetinado',
        description: 'Secagem rápida (30min), sem cheiro e não amarela com o tempo. Ecológico e premium.',
        price: 49.90,
        categoryId: '2',
        image: IMAGES.paint_bucket,
        displayOrder: 1,
        active: true,
        groupIds: ['tamanho_esmalte', 'cor_tinta']
    },
    {
        id: '202',
        name: 'Esmalte Sintético Brilhante',
        description: 'Tradicional base solvente. Altíssimo brilho e proteção contra ferrugem para portões.',
        price: 39.90,
        categoryId: '2',
        image: IMAGES.paint_cans,
        displayOrder: 2,
        active: true,
        groupIds: ['tamanho_esmalte']
    },
    {
        id: '203',
        name: 'Verniz Marítimo Premium',
        description: 'Cria uma película protetora elástica que acompanha os movimentos da madeira. Filtro Solar.',
        price: 45.90,
        categoryId: '2',
        image: IMAGES.wood_stain,
        displayOrder: 3,
        active: true,
        groupIds: ['tamanho_verniz']
    },
    {
        id: '204',
        name: 'Stain Impregnante para Madeira',
        description: 'Penetra na madeira, hidrorrepelente e fungicida. Não forma filme, realça os veios.',
        price: 55.90,
        categoryId: '2',
        image: IMAGES.wood_stain,
        displayOrder: 4,
        active: true,
        groupIds: ['tamanho_verniz']
    },
    {
        id: '205',
        name: 'Tinta Spray Multiuso 400ml',
        description: 'Para artes, reparos e metais. Secagem instantânea. Várias cores disponíveis.',
        price: 19.90,
        categoryId: '2',
        image: IMAGES.spray,
        displayOrder: 5,
        active: true
    },

    // ========== PREPARAÇÃO E TRATAMENTO (ID: 3) ==========
    {
        id: '301',
        name: 'Massa Corrida PVA - Interna',
        description: 'Fácil de lixar e aplicar. Deixa a parede lisinha para receber a tinta.',
        price: 29.90,
        categoryId: '3',
        image: IMAGES.paint_bucket,
        displayOrder: 1,
        active: true,
        groupIds: ['tamanho_massa']
    },
    {
        id: '302',
        name: 'Massa Acrílica Resistente',
        description: 'Alta aderência e resistência à água. Indispensável para fachadas, banheiros e cozinhas.',
        price: 49.90,
        categoryId: '3',
        image: IMAGES.paint_bucket,
        displayOrder: 2,
        active: true,
        groupIds: ['tamanho_massa']
    },
    {
        id: '303',
        name: 'Selador Acrílico Concentrado',
        description: 'Uniformiza a absorção de paredes novas, gerando grande economia de tinta no acabamento.',
        price: 39.90,
        categoryId: '3',
        image: IMAGES.paint_cans,
        displayOrder: 3,
        active: true,
        groupIds: ['tamanho_tinta_acrilica']
    },
    {
        id: '304',
        name: 'Fundo Preparador Base Água',
        description: 'Fixa partículas soltas em paredes descascadas, gesso ou cal. Resolve problemas de aderência.',
        price: 35.90,
        categoryId: '3',
        image: IMAGES.paint_bucket,
        displayOrder: 4,
        active: true,
        groupIds: ['tamanho_esmalte']
    },

    // ========== IMPERMEABILIZANTES (ID: 4) ==========
    {
        id: '401',
        name: 'Manta Líquida Preta',
        description: 'Impermeabilizante flexível para lajes, telhados e calhas. Aplique a frio.',
        price: 89.90,
        categoryId: '4',
        image: IMAGES.waterproof,
        displayOrder: 1,
        active: true,
        groupIds: ['tamanho_impermeabilizante']
    },
    {
        id: '402',
        name: 'Impermeabilizante para Parede',
        description: 'Sela, pinta e impermeabiliza em uma aplicação. Protege contra batida de chuva e maresia.',
        price: 129.90,
        categoryId: '4',
        image: IMAGES.paint_white,
        displayOrder: 2,
        active: true,
        groupIds: ['tamanho_impermeabilizante']
    },
    {
        id: '403',
        name: 'Aditivo Impermeabilizante 3.6L',
        description: 'Misture no cimento/argamassa para evitar umidade ascendente em rodapés e baldrames.',
        price: 49.90,
        categoryId: '4',
        image: IMAGES.waterproof,
        displayOrder: 3,
        active: true
    },

    // ========== ACESSÓRIOS E FERRAMENTAS (ID: 5) ==========
    {
        id: '501',
        name: 'Kit Pintura Completo 7 Peças',
        description: 'Bandeja Grande, Rolo Lã 23cm, Garfo, Pincel, Lixa, Espátula e Misturador.',
        price: 79.90,
        categoryId: '5',
        image: IMAGES.tools,
        displayOrder: 1,
        active: true
    },
    {
        id: '502',
        name: 'Rolo de Lã Anti-Respingo 23cm',
        description: 'O melhor para paredes lisas. Não respinga e deixa acabamento fino.',
        price: 35.90,
        categoryId: '5',
        image: IMAGES.paint_roller,
        displayOrder: 2,
        active: true
    },
    {
        id: '503',
        name: 'Fita Crepe Premium Azul 48mm x 50m',
        description: 'Uso imobiliário e automotivo. Não deixa cola e resiste ao sol por até 14 dias.',
        price: 24.90,
        categoryId: '5',
        image: IMAGES.tools,
        displayOrder: 3,
        active: true
    },
    {
        id: '504',
        name: 'Lona Plástica Preta Reforçada 4x4m',
        description: 'Proteção pesada para móveis e pisos. Essencial para não sujar sua casa.',
        price: 18.00,
        categoryId: '5',
        image: IMAGES.tools,
        displayOrder: 4,
        active: true
    },
    {
        id: '505',
        name: 'Thinner 900ml',
        description: 'Solvente para diluição de esmaltes sintéticos e limpeza de ferramentas.',
        price: 16.50,
        categoryId: '5',
        image: IMAGES.paint_bucket,
        displayOrder: 5,
        active: true
    },
    {
        id: '506',
        name: 'Pincel Chato 3 Polegadas',
        description: 'Ideal para acabamentos em madeiras, portas e janelas. Cerdas macias.',
        price: 12.90,
        categoryId: '5',
        image: IMAGES.paint_brushes,
        displayOrder: 6,
        active: true
    }
];

// Cupons de desconto
export const coupons: Coupon[] = [
    { id: '1', code: 'PRIMEIRACOMPRA', type: 'percent', value: 10, active: true, usageCount: 0 },
    { id: '2', code: 'PRESENTE25', type: 'fixed', value: 25.00, active: true, usageCount: 0 }
];

// Configurações da loja
export const mockSettings = {
    storeName: 'Casa das Cores',
    logoUrl: 'https://ui-avatars.com/api/?name=Casa+Cores&background=ff6b00&color=fff&size=256&font-size=0.33',
    logoShape: 'circle',
    bannerUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1200&h=400&fit=crop',
    whatsappNumber: '5594999999999',
    storeStatus: 'open',
    deliveryFee: 15.00,
    deliveryOnly: false,
    openingHours: [],
    closedMessage: '🔴 Loja Fechada - Retornamos às 08:00',
    openMessage: '🟢 Loja Aberta - Entregamos em toda cidade',
    deliveryTime: '1h à 2h',
    pickupTime: 'Pronto em 30min',
    deliveryCloseTime: '18:00',
    businessAddress: 'Av. das Indústrias, 500 - Distrito Industrial',
    copyrightText: '© 2025 Casa das Cores Tintas Ltda',
    themeColors: {
        headerBg: '#ff6b00',
        headerText: '#ffffff',
        buttonPrimary: '#0056b3',
        background: '#f4f6f8'
    }
};

// ========== BACKWARD COMPATIBILITY EXPORTS ==========
export const mockCategories = categories;
export const mockProducts = products;
export const mockGroups = groups;
export const mockCoupons = coupons;
