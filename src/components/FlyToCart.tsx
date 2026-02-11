import React, { useState, useCallback, useEffect, useRef } from 'react';

interface FlyingItem {
    id: string;
    image: string;
    startX: number;
    startY: number;
}

export const useFlyToCart = () => {
    const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

    const triggerFly = useCallback((image: string, startX?: number, startY?: number) => {
        const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);

        // Default: centro da tela
        const x = startX ?? window.innerWidth / 2;
        const y = startY ?? window.innerHeight / 3;

        setFlyingItems(prev => [...prev, { id, image, startX: x, startY: y }]);

        // Remover após a animação
        setTimeout(() => {
            setFlyingItems(prev => prev.filter(item => item.id !== id));
        }, 1000);
    }, []);

    return { flyingItems, triggerFly };
};

// Componente individual para cada item voando
const FlyingItemElement: React.FC<{ item: FlyingItem }> = ({ item }) => {
    const elRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = elRef.current;
        if (!el) return;

        // Posição final: botão do carrinho flutuante (bottom-6 right-6)
        const endX = window.innerWidth - 40;
        const endY = window.innerHeight - 40;

        // Animação em 3 fases usando requestAnimationFrame
        // Fase 0: posição inicial
        el.style.left = `${item.startX}px`;
        el.style.top = `${item.startY}px`;
        el.style.transform = 'translate(-50%, -50%) scale(1)';
        el.style.opacity = '1';

        // Fase 1: subir um pouco e aumentar (200ms)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.style.transition = 'all 0.25s ease-out';
                el.style.left = `${item.startX + (endX - item.startX) * 0.15}px`;
                el.style.top = `${item.startY - 60}px`;
                el.style.transform = 'translate(-50%, -50%) scale(1.15)';

                // Fase 2: voar para o carrinho (500ms)
                setTimeout(() => {
                    el.style.transition = 'all 0.55s cubic-bezier(0.4, 0, 0.2, 1)';
                    el.style.left = `${endX}px`;
                    el.style.top = `${endY}px`;
                    el.style.transform = 'translate(-50%, -50%) scale(0.15)';
                    el.style.opacity = '0.4';
                }, 250);
            });
        });
    }, [item]);

    return (
        <div
            ref={elRef}
            style={{
                position: 'fixed',
                width: 70,
                height: 70,
                zIndex: 99999,
                pointerEvents: 'none',
                willChange: 'transform, left, top, opacity',
            }}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(242, 101, 34, 0.5), 0 4px 16px rgba(0,0,0,0.25)',
                    border: '3px solid #f26522',
                    background: '#fff',
                }}
            >
                <img
                    src={item.image}
                    alt=""
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            </div>
        </div>
    );
};

interface FlyToCartOverlayProps {
    items: FlyingItem[];
}

export const FlyToCartOverlay: React.FC<FlyToCartOverlayProps> = ({ items }) => {
    if (items.length === 0) return null;

    return (
        <>
            {items.map(item => (
                <FlyingItemElement key={item.id} item={item} />
            ))}
        </>
    );
};
