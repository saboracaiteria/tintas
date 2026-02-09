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
        <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden group">
            {/* Background Image with Zoom Effect */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-linear group-hover:scale-110"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            />

            {/* Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 md:bg-gradient-to-r md:from-black/80 md:via-black/40 md:to-transparent" />

            {/* Content Container */}
            <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center items-start text-white">

                {/* Badge / Tag */}
                <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-semibold uppercase tracking-wider animate-fade-in-up">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    {settings.storeStatus === 'open' ? 'Loja Aberta' : 'Entregas Rápidas'}
                </div>

                {/* Main Title with specific styling for 'Casa das Cores' brand feel */}
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 max-w-2xl text-shadow-lg animate-fade-in-up delay-100">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                        {settings.storeName || "Casa das Cores"}
                    </span>
                    <span className="block text-white">
                        Pintando o seu mundo.
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-gray-200 text-lg md:text-xl mb-8 max-w-xl leading-relaxed animate-fade-in-up delay-200">
                    Encontre as melhores tintas e acabamentos para transformar sua casa. Qualidade, preço justo e entrega rápida.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
                    <button
                        onClick={onCtaClick}
                        className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-full shadow-lg hover:shadow-orange-500/30 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                    >
                        Ver Ofertas
                        <ArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>

                    <button
                        className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold rounded-full hover:bg-white/20 transition-all duration-300"
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
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce hidden md:block">
                <ChevronDown size={32} />
            </div>

            {/* CSS Animations (Inline for simplicity, or could come from global CSS) */}
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
