import React, { useState } from 'react';
import { X, Heart, Share2, Award, ShieldCheck, Truck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../../supabaseClient';

// Helper to format currency
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

import { Product } from '../../types';

interface MLProductDetailsProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: Product, quantity: number, variation?: any) => void;
}

export const MLProductDetails: React.FC<MLProductDetailsProps> = ({ product, isOpen, onClose, onAddToCart }) => {
    if (!isOpen) return null;


    const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});
    const [productGroups, setProductGroups] = useState<any[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const { settings } = useApp();

    // Fetch options when product opens
    React.useEffect(() => {
        if (isOpen && product) {
            fetchOptions();
            setSelectedOptions({});
        }
    }, [isOpen, product]);

    const fetchOptions = async () => {
        setLoadingOptions(true);
        try {
            const { data, error } = await supabase
                .from('product_group_relations')
                .select(`
                    group_id,
                    product_groups (
                        id,
                        title,
                        min,
                        max,
                        options: product_options (
                            id,
                            name,
                            price,
                            description
                        )
                    )
                `)
                .eq('product_id', product.id);

            if (error) throw error;

            if (data) {
                // Format and sort groups
                const groups = data.map((item: any) => item.product_groups);
                // Pre-select defaults?
                const initialSelections: Record<string, any> = {};

                groups.forEach((g: any) => {
                    // Sort options by price?
                    g.options.sort((a: any, b: any) => (a.price || 0) - (b.price || 0));

                    // Auto-select first if required (min >= 1)
                    if (g.min >= 1 && g.options.length > 0) {
                        initialSelections[g.id] = g.options[0];
                    }
                });

                setProductGroups(groups);
                setSelectedOptions(initialSelections);
            }
        } catch (err) {
            console.error('Error fetching options:', err);
        } finally {
            setLoadingOptions(false);
        }
    };

    const handleOptionSelect = (group: any, option: any) => {
        setSelectedOptions(prev => ({
            ...prev,
            [group.id]: option
        }));
    };

    const calculateTotal = () => {
        let total = product.price;
        // Add options prices
        Object.values(selectedOptions).forEach((opt: any) => {
            if (opt?.price) total += Number(opt.price);
        });

        // Handle promo logic if base price changes? 
        // For simplicity, let's assume promo only applies to base, but options are extra.
        // Or if promo exists, we use promo as base.
        const base = (product.promoPrice && product.promoPrice < product.price) ? product.promoPrice : product.price;

        let final = base;
        Object.values(selectedOptions).forEach((opt: any) => {
            if (opt?.price) final += Number(opt.price);
        });

        return final;
    };

    const currentPrice = calculateTotal();
    const hasPromo = product.promoPrice && product.promoPrice < product.price;
    const installmentValue = (currentPrice / 10).toFixed(2).replace('.', ',');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 animate-fade-in">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Modal Content */}
            <div className="relative bg-[#ebebeb] md:bg-white w-full h-full md:h-[90vh] md:max-w-6xl md:rounded-lg shadow-xl overflow-hidden flex flex-col">

                {/* Header (Mobile only basically, or close button) */}
                <div className="bg-[#fff159] md:bg-white p-2 flex justify-between items-center px-4 border-b border-gray-100">
                    <span className="text-sm font-medium md:hidden">Produto</span>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full ml-auto">
                        <X size={24} className="text-gray-600" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col md:flex-row bg-white h-full">

                        {/* Left Column: Images */}
                        <div className="w-full md:w-2/3 p-4 md:p-8 border-r border-gray-100 flex flex-col">
                            <div className="bg-white rounded-lg flex items-center justify-center h-[300px] md:h-[500px] relative">
                                <img
                                    src={product.image || 'https://via.placeholder.com/500'}
                                    alt={product.name}
                                    className="max-h-full max-w-full object-contain"
                                />

                                {/* Action Bubbles */}
                                <div className="absolute top-4 right-4 flex flex-col gap-3">
                                    <button className="bg-white p-2 rounded-full shadow-md text-blue-500 hover:text-blue-600">
                                        <Heart size={20} />
                                    </button>
                                    <button className="bg-white p-2 rounded-full shadow-md text-gray-500 hover:text-gray-700">
                                        <Share2 size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 border-t border-gray-100 pt-8">
                                <h3 className="text-xl font-normal text-[#333] mb-4">Descrição</h3>
                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                    {product.description || 'Produto de alta qualidade, original e com garantia. Ideal para o seu dia a dia. Fabricado com os melhores materiais do mercado.'}
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Info & Buy */}
                        <div className="w-full md:w-1/3 p-4 md:p-6 bg-white overflow-y-auto">
                            <div className="border border-gray-200 rounded-lg p-5 shadow-sm">
                                <span className="text-xs text-gray-400 mb-1 block">{product.salesCountText || settings.productDetailSettings?.salesCountText || 'Novo | +100 vendidos'}</span>
                                <h1 className="text-xl md:text-2xl font-semibold text-[#333] mb-4 leading-snug">
                                    {product.name}
                                </h1>

                                {/* Stars Review (Static) */}
                                <div className="flex items-center gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="fill-blue-500 text-blue-500" />)}
                                    <span className="text-xs text-gray-400 ml-2">(42 avaliações)</span>
                                </div>

                                {/* Price */}
                                <div className="mb-4">
                                    {hasPromo && <span className="text-gray-400 line-through text-sm">{formatCurrency(product.price)}</span>}
                                    <div className="flex items-center gap-2">
                                        <span className="text-3xl font-light text-[#333]">{formatCurrency(currentPrice)}</span>
                                        {hasPromo && <span className="text-green-500 font-medium text-lg">{Math.round(((product.price - product.promoPrice!) / product.price) * 100)}% OFF</span>}
                                    </div>
                                    <div className="text-green-600 text-sm md:text-base font-medium">
                                        em 10x {formatCurrency(currentPrice / 10)} sem juros
                                    </div>
                                    <a href="#" className="text-blue-500 text-xs font-semibold mt-1 block">Ver os meios de pagamento</a>
                                </div>

                                {/* Delivery */}
                                <div className="flex gap-3 mb-6">
                                    <Truck className="text-green-600 mt-1" size={20} />
                                    <div>
                                        <p className="text-green-600 font-medium text-sm">{product.shippingText || settings.productDetailSettings?.shippingText || 'Chegará grátis amanhã'}</p>
                                        <p className="text-gray-400 text-xs">{product.shippingTimerText || settings.productDetailSettings?.shippingTimerText || 'Comprando dentro das próximas 2 h 30 min'}</p>
                                        <a href="#" className="text-blue-500 text-xs font-semibold">para a entrega ou retirar</a>
                                    </div>
                                </div>

                                {/* Product Options (Dynamic) */}
                                {productGroups.map(group => (
                                    <div key={group.id} className="mb-6">
                                        <label className="text-sm font-bold text-[#333] block mb-2">
                                            {group.title}: <span className="font-normal">{selectedOptions[group.id]?.name || 'Selecione'}</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {group.options.map((option: any) => {
                                                const isSelected = selectedOptions[group.id]?.id === option.id;
                                                return (
                                                    <button
                                                        key={option.id}
                                                        onClick={() => handleOptionSelect(group, option)}
                                                        className={`
                                                            px-3 py-2 rounded border text-sm transition-all
                                                            ${isSelected
                                                                ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                                                : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                                            }
                                                        `}
                                                    >
                                                        {option.name}
                                                        {option.price > 0 && ` (+${formatCurrency(option.price)})`}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}


                                {/* Stock */}
                                <div className="mb-6 font-medium text-sm text-[#333]">
                                    {product.stockText || settings.productDetailSettings?.stockText || 'Estoque disponível'}
                                </div>

                                {/* Buttons */}
                                <div className="flex flex-col gap-3">
                                    <button className="w-full bg-[#3483fa] hover:bg-[#2968c8] text-white font-semibold py-3.5 rounded-md transition-colors text-base shadow-sm">
                                        Comprar agora
                                    </button>
                                    <button
                                        onClick={() => {
                                            const optionsList = Object.values(selectedOptions);
                                            // Check required
                                            const missing = productGroups.filter(g => g.min > 0 && !selectedOptions[g.id]);
                                            if (missing.length > 0) {
                                                alert(`Por favor, selecione: ${missing.map(g => g.title).join(', ')}`);
                                                return;
                                            }

                                            onAddToCart(product, quantity, optionsList); // We might need to adjust onAddToCart signature or pass variation differently
                                            onClose();
                                        }}
                                        className="w-full bg-[#3483fa]/15 text-[#3483fa] hover:bg-[#3483fa]/20 font-semibold py-3.5 rounded-md transition-colors text-base"
                                    >
                                        Adicionar ao carrinho
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper for stars
const Star = ({ size = 14, className = "" }: { size?: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);
