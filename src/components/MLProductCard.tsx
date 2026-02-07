import React from 'react';
import { Truck } from 'lucide-react';

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

    // Calculate distinct price parts for styling (Reais and Centavos)
    const priceParts = currentPrice?.toFixed(2).split('.');
    const reais = priceParts?.[0];
    const centavos = priceParts?.[1];

    // Simulate installment calculation (10x or 12x)
    const installmentValue = (currentPrice! / 10).toFixed(2).replace('.', ',');

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden flex flex-col h-full border border-gray-100"
        >
            {/* Image Container */}
            <div className="relative pt-[100%] border-b border-gray-100">
                <img
                    src={product.image || 'https://via.placeholder.com/300?text=Sem+Imagem'}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-contain p-4"
                />
                {hasPromo && (
                    <div className="absolute top-2 right-2 bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded">
                        Destaque
                    </div>
                )}
            </div>

            {/* Info Container */}
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-sm text-gray-600 font-normal line-clamp-2 mb-2 leading-snug">
                    {product.name}
                </h3>

                {/* Price Section */}
                <div className="mt-auto">
                    {hasPromo && (
                        <span className="text-xs text-gray-400 line-through block mb-0.5">
                            {formatCurrency(product.price)}
                        </span>
                    )}

                    <div className="flex items-start text-[#333]">
                        <span className="text-xs mt-1 mr-0.5">R$</span>
                        <span className="text-2xl font-medium leading-none">{reais}</span>
                        <span className="text-xs mt-1 ml-0.5">{centavos}</span>

                        {hasPromo && (
                            <span className="ml-2 text-sm text-green-600 font-medium self-center">
                                {Math.round(((product.price - product.promoPrice!) / product.price) * 100)}% OFF
                            </span>
                        )}
                    </div>

                    <div className="text-xs text-green-600 font-medium mt-1">
                        em 10x R$ {installmentValue} sem juros
                    </div>

                    {/* Shipping Info (Simulated) */}
                    <div className="mt-2 flex items-center gap-1">
                        <span className="text-green-600 font-bold text-xs italic">Chegará grátis</span>
                        <span className="text-gray-400 text-xs">amanhã</span>
                        <div className="ml-auto">
                            <span className="italic font-black text-green-600 text-[10px] border border-green-600 rounded px-1">
                                FULL
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
