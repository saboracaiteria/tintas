import React from 'react';
import { Plus, ShoppingCart, Star, Truck } from 'lucide-react';

// Format currency
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

interface Product {
    id: string;
    name: string;
    price: number;
    promoPrice?: number;
    image?: string;
    description?: string;
}

interface MLProductCardProps {
    product: Product;
    onClick: () => void;
}

export const MLProductCard: React.FC<MLProductCardProps> = ({ product, onClick }) => {
    const hasPromo = product.promoPrice && product.promoPrice < product.price;
    const currentPrice = hasPromo ? product.promoPrice : product.price;
    const discount = hasPromo ? Math.round(((product.price - product.promoPrice!) / product.price) * 100) : 0;

    return (
        <div
            onClick={onClick}
            className="group relative bg-white rounded-2xl overflow-hidden flex flex-col h-full cursor-pointer"
            style={{
                boxShadow: '0 4px 24px -4px rgba(0,0,0,0.08), 0 2px 8px -2px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.04)',
                transition: 'all 0.45s cubic-bezier(0.25, 0.8, 0.25, 1)',
            }}
            onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.transform = 'translateY(-6px) scale(1.02)';
                el.style.boxShadow = '0 20px 48px -12px rgba(0,0,0,0.18), 0 8px 20px -6px rgba(0,0,0,0.12)';
                el.style.borderColor = 'rgba(242, 101, 34, 0.25)';
            }}
            onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = 'translateY(0) scale(1)';
                el.style.boxShadow = '0 4px 24px -4px rgba(0,0,0,0.08), 0 2px 8px -2px rgba(0,0,0,0.06)';
                el.style.borderColor = 'rgba(0,0,0,0.04)';
            }}
        >
            {/* Gradient Accent Line - Top */}
            <div
                className="h-[3px] w-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: 'linear-gradient(90deg, #f26522, #e85520, #ff8844)',
                }}
            />

            {/* Image Container */}
            <div className="relative pt-[100%] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                <img
                    src={product.image || 'https://via.placeholder.com/300?text=Sem+Imagem'}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-contain p-3 transition-transform duration-700 ease-out group-hover:scale-110"
                />

                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Badges */}
                {hasPromo && (
                    <div
                        className="absolute top-3 left-3 text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded-full shadow-lg z-10"
                        style={{
                            background: 'linear-gradient(135deg, #f26522, #e85520)',
                            boxShadow: '0 4px 12px rgba(242, 101, 34, 0.4)',
                        }}
                    >
                        -{discount}% OFF
                    </div>
                )}

                {/* Quick Action Overlay (Desktop) */}
                <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-all duration-400 ease-out hidden md:block z-10">
                    <button
                        className="w-full text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                        style={{
                            background: 'linear-gradient(135deg, #f26522, #e85520)',
                            boxShadow: '0 4px 16px rgba(242, 101, 34, 0.4)',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <ShoppingCart size={16} /> Adicionar
                    </button>
                </div>
            </div>

            {/* Info Container */}
            <div className="p-3 md:p-4 flex flex-col flex-grow relative">
                {/* Product Name */}
                <div className="mb-2">
                    <h3 className="text-gray-800 font-semibold text-xs md:text-sm leading-snug line-clamp-2 min-h-[2.5em] group-hover:text-orange-600 transition-colors duration-300">
                        {product.name}
                    </h3>
                </div>

                {/* Shipping Info - Hide on very small screens if needed, or keep small */}
                <div className="flex items-center gap-1.5 mb-2">
                    <Truck size={12} className="text-green-600" />
                    <span className="text-[10px] text-green-600 font-semibold truncate">Envio disponível</span>
                </div>

                {/* Price Section */}
                <div className="mt-auto pt-2 md:pt-3 border-t border-gray-100">
                    {hasPromo && (
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] md:text-xs text-gray-400 line-through">
                                {formatCurrency(product.price)}
                            </span>
                            <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(0,166,80,0.1), rgba(0,166,80,0.05))',
                                    color: '#00a650',
                                }}
                            >
                                -{discount}%
                            </span>
                        </div>
                    )}

                    <div className="flex items-end justify-between">
                        <div>
                            <span
                                className="text-lg md:text-xl font-extrabold"
                                style={{
                                    background: 'linear-gradient(135deg, #1a2351, #263074)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                {formatCurrency(currentPrice!)}
                            </span>
                            <p className="text-[9px] md:text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                                10x {formatCurrency(currentPrice! / 10)}
                            </p>
                        </div>

                        {/* Mobile Add Button */}
                        <div
                            className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition-transform"
                            style={{
                                background: 'linear-gradient(135deg, #f26522, #e85520)',
                                boxShadow: '0 4px 12px rgba(242, 101, 34, 0.35)',
                            }}
                        >
                            <Plus size={16} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
