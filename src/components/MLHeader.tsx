import React, { useState } from 'react';
import { Menu, Search, ShoppingCart, MapPin, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const MLHeader = () => {
    const { setSidebarOpen, cart, settings } = useApp();
    const navigate = useNavigate();
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <header className="bg-[#fff159] pb-2">
            <div className="max-w-7xl mx-auto px-3 pt-2">
                {/* Top Row: Logo, Search, Menu */}
                <div className="flex items-center gap-3 mb-2">
                    {/* Logo (Simulated or Real) */}
                    <div className="flex-shrink-0" onClick={() => navigate('/')}>
                        {settings.logoUrl ? (
                            <img src={settings.logoUrl} alt="Logo" className="h-8 w-auto object-contain cursor-pointer" />
                        ) : (
                            <span className="font-bold text-[#2d3277] text-xl cursor-pointer">CdC</span>
                        )}
                    </div>

                    {/* Search Bar - Flex Grow */}
                    <div className="flex-1 relative">
                        <div className="flex shadow-sm bg-white rounded-[4px] overflow-hidden h-9 items-center">
                            <div className="pl-3 text-gray-300">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar produtos, marcas e muito mais..."
                                className="w-full px-2 py-1 outline-none text-sm text-[#333] placeholder-gray-300 font-normal"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button onClick={() => setSidebarOpen(true)} className="text-[#333]">
                        <Menu size={24} />
                    </button>

                    {/* Shopping Cart */}
                    <div className="relative cursor-pointer" onClick={() => navigate('/cart')}>
                        <ShoppingCart size={24} className="text-[#333]" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#fff159]">
                                {cartCount}
                            </span>
                        )}
                    </div>
                </div>

                {/* Bottom Row: Location (Simulated) */}
                <div className="flex items-center gap-1 px-1">
                    <MapPin size={14} className="text-[#333] opacity-60" />
                    <div className="text-xs text-[#333] opacity-80 leading-tight">
                        <span className="block opacity-60 text-[10px]">Enviar para</span>
                        <span className="font-medium">Capital - 70000-000</span>
                    </div>
                    <ChevronDown size={12} className="text-gray-400 ml-auto" />
                </div>
            </div>

            {/* Decorative gradient line at bottom (optional shadow hint) */}
            <div className="h-[1px] bg-black/5 shadow-sm"></div>
        </header>
    );
};
