import React from 'react';
import { Plus, ShoppingCart } from 'lucide-react';

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

    return (
        <div
            onClick={onClick}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full border border-gray-100 hover:border-orange-200 transform hover:-translate-y-1 relative"
        >
            {/* Image Container */}
            <div className="relative pt-[100%] overflow-hidden bg-gray-50">
                <img
                    src={product.image || 'https://via.placeholder.com/300?text=Sem+Imagem'}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                />

                {/* Badges */}
                {hasPromo && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-md z-10">
                        OFERTA
                    </div>
                )}

                {/* Quick Action Overlay (Desktop) */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block z-10">
                    <button className="w-full bg-orange-500 text-white py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-orange-600 flex items-center justify-center gap-2">
                        <ShoppingCart size={16} /> Adicionar
                    </button>
                </div>
            </div>

            {/* Info Container */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="mb-2">
                    <h3 className="text-gray-800 font-medium text-sm leading-snug line-clamp-2 min-h-[2.5em] group-hover:text-orange-600 transition-colors">
                        {product.name}
                    </h3>
                </div>

                {/* Price Section */}
                <div className="mt-auto pt-2 border-t border-gray-50">
                    {hasPromo && (
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-400 line-through">
                                {formatCurrency(product.price)}
                            </span>
                            <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 rounded">
                                -{Math.round(((product.price - product.promoPrice!) / product.price) * 100)}%
                            </span>
                        </div>
                    )}

                    <div className="flex items-baseline justify-between">
                        <span className="text-xl font-bold text-gray-900">
                            {formatCurrency(currentPrice!)}
                        </span>

                        {/* Mobile Add Button */}
                        <div className="md:hidden w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                            <Plus size={18} />
                        </div>
                    </div>

                    <p className="text-[10px] text-gray-400 mt-1">
                        10x de {formatCurrency(currentPrice! / 10)}
                    </p>
                </div>
            </div>
        </div>
    );
};

