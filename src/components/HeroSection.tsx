import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, ChevronDown } from 'lucide-react';

interface HeroSectionProps {
    onCtaClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onCtaClick }) => {
    const { settings } = useApp();

    // Fallback image if no banner is set
    const backgroundImage = settings.bannerUrl || "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=1920";

    return (
        <div className="relative w-full h-[400px] md:h-[480px] overflow-hidden group">
            {/* Background Image with Zoom Effect */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-linear group-hover:scale-110"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            />

            {/* Gradient Overlay - Azul Navy Inova (Reduced Opacity for Clarity) */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(to top, rgba(26, 35, 81, 0.4) 0%, rgba(26, 35, 81, 0.1) 40%, rgba(26, 35, 81, 0.0) 100%)',
                }}
            />

            {/* Content Container */}
            <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center items-start text-white">

                {/* Badge / Tag */}
                <div className="mb-3 md:mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/20 text-[10px] md:text-xs font-semibold uppercase tracking-wider animate-fade-in-up">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    {settings.storeStatus === 'open' ? 'Loja Aberta' : 'Entregas Rápidas'}
                </div>

                {/* Main Title - Inova Tintas Style */}
                <h1 className="leading-tight mb-3 md:mb-4 max-w-2xl animate-fade-in-up delay-100">
                    <span
                        className="block text-4xl md:text-7xl"
                        style={{
                            fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
                            color: '#f26522',
                            letterSpacing: '3px',
                            textShadow: '0 4px 16px rgba(242, 101, 34, 0.4), 0 2px 4px rgba(0,0,0,0.3)',
                        }}
                    >
                        {settings.storeName || "Paulista Materiais"}
                    </span>
                    <span
                        className="block text-xl md:text-4xl font-extrabold text-white mt-1"
                        style={{
                            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        }}
                    >
                        Pintando o seu mundo.
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-gray-200 text-sm md:text-xl mb-6 md:mb-8 max-w-xl leading-relaxed animate-fade-in-up delay-200">
                    Encontre as melhores tintas e acabamentos para transformar sua casa. Qualidade, preço justo e entrega rápida.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 animate-fade-in-up delay-300 w-full sm:w-auto">
                    <button
                        onClick={onCtaClick}
                        className="px-6 py-3 md:px-8 md:py-4 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group/btn text-sm md:text-base"
                        style={{
                            background: 'linear-gradient(135deg, #f26522, #ff8844)',
                            boxShadow: '0 8px 24px rgba(242, 101, 34, 0.4)',
                        }}
                    >
                        Ver Ofertas
                        <ArrowRight className="group-hover/btn:translate-x-1 transition-transform w-4 h-4 md:w-5 md:h-5" />
                    </button>

                    <button
                        className="px-6 py-3 md:px-8 md:py-4 bg-black/40 border border-white/30 text-white font-bold rounded-full hover:bg-black/50 transition-all duration-300 text-sm md:text-base hidden sm:block"
                        onClick={() => {
                            const contactSection = document.getElementById('contact-footer');
                            contactSection?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        Falar Conosco
                    </button>
                    {/* Mobile Only Secondary Button */}
                    <button
                        className="px-6 py-3 bg-black/40 border border-white/30 text-white font-bold rounded-full hover:bg-black/50 transition-all duration-300 text-sm sm:hidden"
                        onClick={() => {
                            const contactSection = document.getElementById('contact-footer');
                            contactSection?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        Falar Conosco
                    </button>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 animate-bounce hidden md:block">
                <ChevronDown size={28} />
            </div>

            {/* CSS Animations */}
            <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>
        </div>
    );
};
