import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { Upload, X, Loader2, Lock } from 'lucide-react';
import { useApp } from './src/context/AppContext';

export const ImageContextMenu = () => {
    const { updateSettings, updateProduct, categories } = useApp();
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [targetData, setTargetData] = useState<{ type: string; id: string } | null>(null);
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const imgTarget = target.closest('img') || target.closest('[data-img-type]'); // Support wrapper divs too if needed

            if (imgTarget) {
                const type = imgTarget.getAttribute('data-img-type');
                const id = imgTarget.getAttribute('data-img-id');

                if (type) {
                    e.preventDefault();
                    setTargetData({ type, id: id || '' });

                    // Adjust position to not go off-screen
                    let x = e.clientX;
                    let y = e.clientY;
                    if (x + 300 > window.innerWidth) x = window.innerWidth - 320;
                    if (y + 300 > window.innerHeight) y = window.innerHeight - 320;

                    setPosition({ x, y });
                    setIsVisible(true);
                    setIsAuthenticated(false); // Reset auth on new open
                    setPassword('');
                }
            }
        };

        const handleClick = (e: MouseEvent) => {
            // Close if clicking outside the menu
            const target = e.target as HTMLElement;
            if (isVisible && !target.closest('#image-context-menu')) {
                setIsVisible(false);
            }
        };

        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('click', handleClick);
        };
    }, [isVisible]);

    const handleLogin = () => {
        if (password === '1245' || password === '777') {
            setIsAuthenticated(true);
        } else {
            alert('Senha incorreta!');
        }
    };

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0 || !targetData) return;

        const file = files[0];
        setIsUploading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${targetData.type}_${targetData.id}_${Date.now()}.${fileExt}`;
            const bucket = 'product-images'; // We use the same bucket for simplicity or settings-images

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            const publicUrl = data.publicUrl;

            // Update Database/State based on type
            if (targetData.type === 'logo') {
                updateSettings({ logoUrl: publicUrl });
            } else if (targetData.type === 'banner') {
                updateSettings({ bannerUrl: publicUrl });
            } else if (targetData.type === 'product' && targetData.id) {
                // We need to fetch the product first to update it? 
                // updateProduct requires the full product? 
                // Usually updateProduct(product)
                // Let's assume updateProduct takes a partial or we define a specific update function.
                // Looking at App.tsx, updateProduct takes (updatedProduct: Product).
                // We might need to fetch it first or rely on the fact that we might not have the full object here.
                // PROPOSAL: Modify updateProduct in App.tsx to accept Partial<Product> OR handle it here.
                // For now, let's try to update via supabase directly if updateProduct is not flexible, 
                // OR assume we can use updateProduct if we can find the product in "categories" or "products" list.
                // BUT "useApp" might not give us all products flat list.
                // Let's rely on supabase update for robustness if local state is hard to reach specific item.

                await supabase.from('products').update({ image: publicUrl }).eq('id', targetData.id);
                // Force reload or re-fetch? updateProduct in App.tsx refreshes data usually.
                window.location.reload(); // Simplest way to ensure sync for now as we are bypassing React state for deep items
            }

            setIsVisible(false);
        } catch (error) {
            console.error('Error uploading:', error);
            alert('Erro ao atualizar imagem.');
        } finally {
            setIsUploading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div
            id="image-context-menu"
            className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden w-[300px] animate-in fade-in zoom-in duration-200"
            style={{ top: position.y, left: position.x }}
        >
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 flex justify-between items-center text-white">
                <h3 className="font-bold text-sm flex items-center gap-2">
                    <Upload size={16} /> Alterar Imagem
                </h3>
                <button onClick={() => setIsVisible(false)} className="hover:bg-white/20 rounded p-1">
                    <X size={14} />
                </button>
            </div>

            <div className="p-4">
                {!isAuthenticated ? (
                    <div className="space-y-3">
                        <p className="text-xs text-gray-500 text-center">Área restrita. Digite a senha administrativa.</p>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                placeholder="Senha (ex: 1245)"
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={handleLogin}
                            className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors"
                        >
                            Verificar
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div
                            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'}`}
                            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={e => {
                                e.preventDefault();
                                setDragActive(false);
                                handleUpload(e.dataTransfer.files);
                            }}
                        >
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-2 text-purple-600">
                                    <Loader2 className="animate-spin" size={24} />
                                    <span className="text-xs font-medium">Enviando...</span>
                                </div>
                            ) : (
                                <>
                                    <p className="text-xs text-gray-500 mb-2">Arraste a imagem ou</p>
                                    <label className="cursor-pointer bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 inline-block shadow-sm">
                                        Escolher Arquivo
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={e => handleUpload(e.target.files)}
                                        />
                                    </label>
                                </>
                            )}
                        </div>
                        {targetData?.type === 'product' && (
                            <p className="text-[10px] text-gray-400 text-center">A página será recarregada após o envio.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
