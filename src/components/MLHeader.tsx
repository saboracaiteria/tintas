import React, { useState } from 'react';
import { Menu, Search, ShoppingCart, MapPin, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const MLHeader = () => {
    const { setSidebarOpen, cart, settings, searchTerm, setSearchTerm } = useApp();
    const navigate = useNavigate();
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <header
            style={{
                background: 'linear-gradient(135deg, #1a2351 0%, #263074 100%)',
            }}
            className="pb-2 shadow-lg"
        >
            <div className="max-w-7xl mx-auto px-3 pt-2">
                {/* Top Row: Logo, Search, Menu */}
                <div className="flex items-center gap-3 mb-2">
                    {/* Logo / Store Name */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        {settings.logoUrl && (
                            <img src={settings.logoUrl} alt="Logo" className="h-9 w-auto object-contain" />
                        )}
                        <span
                            className={`text-xl leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px] sm:max-w-none ${settings.logoUrl ? 'hidden sm:block' : ''}`}
                            style={{
                                fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
                                fontWeight: 700,
                                color: '#f26522',
                                letterSpacing: '1.5px',
                                textTransform: 'uppercase',
                                textShadow: '0 2px 8px rgba(242, 101, 34, 0.3)',
                            }}
                        >
                            {settings.storeName || "Paulista Materiais"}
                        </span>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 relative">
                        <div className="flex bg-white rounded-md overflow-hidden h-9 items-center shadow-sm">
                            <div className="pl-3 text-gray-400">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar produtos, marcas e muito mais..."
                                className="w-full px-2 py-1 outline-none text-sm text-[#333] placeholder-gray-400 font-normal"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button onClick={() => setSidebarOpen(true)} className="text-white/90 hover:text-white transition-colors">
                        <Menu size={24} />
                    </button>

                    {/* Shopping Cart */}
                    <div className="relative cursor-pointer" onClick={() => navigate('/cart')}>
                        <ShoppingCart size={24} className="text-white/90 hover:text-white transition-colors" />
                        {cartCount > 0 && (
                            <span
                                className="absolute -top-1 -right-1 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#1a2351]"
                                style={{ background: '#f26522' }}
                            >
                                {cartCount}
                            </span>
                        )}
                    </div>
                </div>

                {/* Bottom Row: Location */}
                <div className="flex items-center gap-1 px-1 pb-1">
                    <MapPin size={14} className="text-white/50" />
                    <div className="text-xs text-white/70 leading-tight">
                        <span className="block text-white/40 text-[10px]">Enviar para</span>
                        <span className="font-medium text-white/80">Capital - 70000-000</span>
                    </div>
                    <ChevronDown size={12} className="text-white/40 ml-auto" />
                </div>
            </div>

            {/* Bottom accent line - laranja */}
            <div
                className="h-[3px] w-full"
                style={{
                    background: 'linear-gradient(90deg, #f26522, #ff8844, #f26522)',
                }}
            />
        </header>
    );
};
