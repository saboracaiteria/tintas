import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Edit, Trash2, Upload, Loader2, Save, X, GripVertical, ToggleLeft, ToggleRight, Layout, Search } from 'lucide-react';
import { supabase } from './supabaseClient';
import { ConfirmModal } from './ConfirmModal';

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    image: string;
    categoryId: string;
    groupIds?: string[];
    displayOrder?: number;
    active?: boolean;
}

interface Category {
    id: string;
    title: string;
    icon?: string;
}

interface ProductGroup {
    id: string;
    title: string;
    icon?: string;
}

interface ProductsPageProps {
    products: Product[];
    categories: Category[];
    groups: ProductGroup[];
    addProduct: (product: Product) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (id: string) => void;
    reorderProducts: (categoryId: string, products: Product[]) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
    products,
    categories,
    groups,
    addProduct,
    updateProduct,
    deleteProduct,
    reorderProducts
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [inlineEditId, setInlineEditId] = useState<string | null>(null);
    const [inlineEditData, setInlineEditData] = useState<Partial<Product>>({});
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string, name: string } | null>(null);
    const [draggedProduct, setDraggedProduct] = useState<Product | null>(null);
    const [dragOverProduct, setDragOverProduct] = useState<string | null>(null);
    const [activeConfirmation, setActiveConfirmation] = useState<{ product: Product, newActive: boolean } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setSelectedGroups(product.groupIds || []);
        } else {
            setEditingProduct({ categoryId: categories[0]?.id || '' });
            setSelectedGroups([]);
        }
        setIsModalOpen(true);
    };

    const uploadImageToSupabase = async (file: File): Promise<string | null> => {
        try {
            setIsUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            console.log('Iniciando upload para:', filePath);

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Erro detalhado do Supabase:', uploadError);
                throw uploadError;
            }

            console.log('Upload concluído:', uploadData);

            const { data } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            console.log('URL Pública gerada:', data.publicUrl);
            return data.publicUrl;
        } catch (error: any) {
            console.error('Erro ao fazer upload da imagem:', error);
            alert(`Erro ao fazer upload: ${error.message || 'Erro desconhecido'}`);
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const publicUrl = await uploadImageToSupabase(e.target.files[0]);
            if (publicUrl) {
                setEditingProduct({ ...editingProduct, image: publicUrl });
            }
        }
    };

    const handleSave = () => {
        if (!editingProduct.name || !editingProduct.price || !editingProduct.categoryId) {
            return alert('Preencha nome, preço e categoria');
        }

        const productData = {
            ...editingProduct,
            groupIds: selectedGroups.length > 0 ? selectedGroups : undefined
        } as Product;

        if (editingProduct.id) {
            updateProduct(productData);
        } else {
            addProduct({ ...productData, id: crypto.randomUUID() });
        }
        setIsModalOpen(false);
        setEditingProduct({});
        setSelectedGroups([]);
    };

    const toggleGroup = (groupId: string) => {
        if (selectedGroups.includes(groupId)) {
            setSelectedGroups(selectedGroups.filter(g => g !== groupId));
        } else {
            setSelectedGroups([...selectedGroups, groupId]);
        }
    };

    const handleInlineEdit = (product: Product) => {
        setInlineEditId(product.id);
        setInlineEditData({ ...product });
    };

    const handleInlineSave = () => {
        if (!inlineEditData.name || !inlineEditData.price) {
            alert('Preencha nome e preço');
            return;
        }
        updateProduct(inlineEditData as Product);
        setInlineEditId(null);
        setInlineEditData({});
    };

    const handleInlineCancel = () => {
        setInlineEditId(null);
        setInlineEditData({});
    };

    const handleToggleActiveClick = (product: Product) => {
        const isActive = product.active ?? true;
        // Se estiver ativo, vai desativar -> PEDIR CONFIRMAÇÃO
        if (isActive) {
            setActiveConfirmation({ product, newActive: false });
        } else {
            // Se estiver inativo, vai ativar -> DIRETO
            performToggleActive(product, true);
        }
    };

    const performToggleActive = async (product: Product, newActive: boolean) => {
        // Optimistic update via updateProduct
        updateProduct({ ...product, active: newActive });
        // Persist to Supabase
        await supabase.from('products').update({ active: newActive }).eq('id', product.id);
        setActiveConfirmation(null);
    };

    // --- Drag and Drop Handlers ---
    const handleDragStart = (e: React.DragEvent, product: Product) => {
        setDraggedProduct(product);
        e.dataTransfer.effectAllowed = 'move';
        // Add drag styling
        const target = e.target as HTMLElement;
        setTimeout(() => {
            target.style.opacity = '0.5';
        }, 0);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        const target = e.target as HTMLElement;
        target.style.opacity = '1';
        setDraggedProduct(null);
        setDragOverProduct(null);
    };

    const handleDragOver = (e: React.DragEvent, productId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedProduct && draggedProduct.id !== productId) {
            setDragOverProduct(productId);
        }
    };

    const handleDragLeave = () => {
        setDragOverProduct(null);
    };

    const handleDrop = (e: React.DragEvent, targetProduct: Product) => {
        e.preventDefault();

        if (!draggedProduct || draggedProduct.id === targetProduct.id) {
            setDragOverProduct(null);
            return;
        }

        // Only allow reordering within same category
        if (draggedProduct.categoryId !== targetProduct.categoryId) {
            alert('Só é possível reordenar produtos dentro da mesma categoria');
            setDragOverProduct(null);
            return;
        }

        // Get products in this category and reorder
        const categoryProducts = products
            .filter(p => p.categoryId === draggedProduct.categoryId)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

        const draggedIndex = categoryProducts.findIndex(p => p.id === draggedProduct.id);
        const targetIndex = categoryProducts.findIndex(p => p.id === targetProduct.id);

        // Remove dragged product and insert at new position
        const reorderedProducts = [...categoryProducts];
        const [removed] = reorderedProducts.splice(draggedIndex, 1);
        reorderedProducts.splice(targetIndex, 0, removed);

        // Update display order for all products in category
        const updatedProducts = reorderedProducts.map((p, idx) => ({
            ...p,
            displayOrder: idx
        }));

        reorderProducts(draggedProduct.categoryId, updatedProducts);
        setDragOverProduct(null);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 pb-20">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/panel')}><ChevronLeft /></button>
                    <h1 className="text-xl font-bold">Produtos</h1>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                    <Plus size={20} /> Novo
                </button>
            </div>

            {/* Search Field */}
            <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar produto por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm transition-all"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {categories.map(category => {
                const categoryProducts = products
                    .filter(p => p.categoryId === category.id)
                    .filter(p => searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

                if (searchTerm && categoryProducts.length === 0) return null;

                return (
                    <div key={category.id} className="mb-6">
                        <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                            {category.icon} {category.title}
                            <span className="text-sm font-normal text-gray-400">({categoryProducts.length})</span>
                        </h2>

                        {categoryProducts.length === 0 && !searchTerm && (
                            <div className="text-gray-400 text-sm italic p-4 text-center border-2 border-dashed border-gray-200 rounded-lg">
                                Nenhum produto nesta categoria. Clique em "+ Novo" para adicionar.
                            </div>
                        )}

                        {/* Grid Layout */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {categoryProducts.map(product => (
                                <div
                                    key={product.id}
                                    className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200 flex flex-col ${dragOverProduct === product.id
                                            ? 'ring-2 ring-purple-500 ring-dashed bg-purple-50'
                                            : ''
                                        } ${draggedProduct?.id === product.id ? 'opacity-50' : ''} ${(product.active ?? true) ? '' : 'opacity-60 grayscale'
                                        }`}
                                    draggable={inlineEditId !== product.id}
                                    onDragStart={(e) => handleDragStart(e, product)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => handleDragOver(e, product.id)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, product)}
                                >
                                    {inlineEditId === product.id ? (
                                        /* Inline Edit Mode */
                                        <div className="p-3 flex flex-col gap-2">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-28 rounded-lg object-cover"
                                            />
                                            <input
                                                className="w-full border p-2 rounded text-sm font-bold"
                                                placeholder="Nome"
                                                value={inlineEditData.name || ''}
                                                onChange={e => setInlineEditData({ ...inlineEditData, name: e.target.value })}
                                                autoFocus
                                            />
                                            <input
                                                className="w-full border p-2 rounded text-xs"
                                                placeholder="Descrição"
                                                value={inlineEditData.description || ''}
                                                onChange={e => setInlineEditData({ ...inlineEditData, description: e.target.value })}
                                            />
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full border p-2 rounded text-sm font-bold text-green-600"
                                                placeholder="Preço"
                                                value={inlineEditData.price || ''}
                                                onChange={e => setInlineEditData({ ...inlineEditData, price: parseFloat(e.target.value) })}
                                            />
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={handleInlineSave}
                                                    className="flex-1 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs font-bold flex items-center justify-center gap-1"
                                                >
                                                    <Save size={14} /> Salvar
                                                </button>
                                                <button
                                                    onClick={handleInlineCancel}
                                                    className="flex-1 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-xs font-bold flex items-center justify-center gap-1"
                                                >
                                                    <X size={14} /> Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Normal Card View */
                                        <>
                                            {/* Product Image */}
                                            <div className="relative h-32 w-full overflow-hidden bg-gray-50">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                    data-img-type="product"
                                                    data-img-id={product.id}
                                                />
                                                {/* Drag indicator */}
                                                <div
                                                    className="absolute top-1 left-1 bg-white/80 rounded p-0.5 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                                                    title="Arraste para reordenar"
                                                >
                                                    <GripVertical size={14} />
                                                </div>
                                                {/* Active toggle badge */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleActiveClick(product); }}
                                                    className={`absolute top-1 right-1 rounded-full p-1 transition-colors ${(product.active ?? true)
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-gray-400 text-white'
                                                        }`}
                                                    title={(product.active ?? true) ? 'Desativar' : 'Ativar'}
                                                >
                                                    {(product.active ?? true) ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                                </button>
                                            </div>

                                            {/* Product Info */}
                                            <div className="p-2.5 flex-1 flex flex-col">
                                                <p className="font-bold text-sm text-gray-800 leading-tight line-clamp-2 mb-1">{product.name}</p>
                                                {product.description && (
                                                    <p className="text-[11px] text-gray-400 line-clamp-1 mb-1">{product.description}</p>
                                                )}
                                                <p className="text-green-600 font-extrabold text-sm mt-auto">R$ {product.price.toFixed(2)}</p>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex border-t border-gray-100">
                                                <button
                                                    onClick={() => handleInlineEdit(product)}
                                                    className="flex-1 py-2 text-green-600 hover:bg-green-50 flex items-center justify-center gap-1 text-xs font-medium transition-colors"
                                                    title="Editar Rápido"
                                                >
                                                    <Save size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal(product)}
                                                    className="flex-1 py-2 text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-1 text-xs font-medium transition-colors border-x border-gray-100"
                                                    title="Editar Completo"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirmation({ id: product.id, name: product.name })}
                                                    className="flex-1 py-2 text-red-600 hover:bg-red-50 flex items-center justify-center gap-1 text-xs font-medium transition-colors"
                                                    title="Deletar"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4 my-8">
                        <h3 className="font-bold text-lg">{editingProduct.id ? 'Editar' : 'Novo'} Produto</h3>

                        {/* Image Upload */}
                        <div>
                            {editingProduct.image && (
                                <div className="relative mb-2">
                                    <img src={editingProduct.image} className="w-full h-40 object-cover rounded" alt="Preview" />
                                    <button
                                        onClick={() => {
                                            if (confirm('Remover esta imagem?')) {
                                                setEditingProduct({ ...editingProduct, image: '' });
                                            }
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
                                        type="button"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                            <label className={`w-full cursor-pointer bg-gray-50 hover:bg-gray-100 p-3 rounded border border-dashed flex items-center justify-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {isUploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                                <span className="text-sm">
                                    {isUploading ? 'Enviando...' : (editingProduct.image ? 'Alterar Imagem' : 'Adicionar Imagem')}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                />
                            </label>
                        </div>

                        <input
                            className="w-full border p-3 rounded"
                            placeholder="Nome do Produto"
                            value={editingProduct.name || ''}
                            onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        />

                        <textarea
                            className="w-full border p-3 rounded"
                            placeholder="Descrição (opcional)"
                            rows={2}
                            value={editingProduct.description || ''}
                            onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        />

                        <input
                            type="number"
                            step="0.01"
                            className="w-full border p-3 rounded"
                            placeholder="Preço (R$)"
                            value={editingProduct.price || ''}
                            onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                        />

                        <select
                            className="w-full border p-3 rounded"
                            value={editingProduct.categoryId || ''}
                            onChange={e => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                        >
                            <option value="">Selecione a Categoria ({categories.length} disponíveis)</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.icon} {cat.title}</option>
                            ))}
                        </select>

                        {/* Groups/Addons Selection */}
                        {groups.length > 0 && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Adicionais (opcional)</label>
                                <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                                    {groups.map(group => (
                                        <label key={group.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                            <input
                                                type="checkbox"
                                                checked={selectedGroups.includes(group.id)}
                                                onChange={() => toggleGroup(group.id)}
                                            />
                                            <span className="text-sm">{group.title}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Product Interface Details */}
                        <div className="border border-gray-200 rounded p-3 bg-gray-50">
                            <h4 className="font-bold text-sm text-gray-700 mb-2 flex items-center gap-2">
                                <Layout size={16} /> Detalhes da Interface (Opcional)
                            </h4>
                            <div className="space-y-2">
                                <input
                                    className="w-full border p-2 rounded text-sm"
                                    placeholder="Texto de Vendas (Ex: Novo | +100 vendidos)"
                                    value={editingProduct.salesCountText || ''}
                                    onChange={e => setEditingProduct({ ...editingProduct, salesCountText: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        className="w-full border p-2 rounded text-sm"
                                        placeholder="Texto Frete"
                                        value={editingProduct.shippingText || ''}
                                        onChange={e => setEditingProduct({ ...editingProduct, shippingText: e.target.value })}
                                    />
                                    <input
                                        className="w-full border p-2 rounded text-sm"
                                        placeholder="Timer Envio"
                                        value={editingProduct.shippingTimerText || ''}
                                        onChange={e => setEditingProduct({ ...editingProduct, shippingTimerText: e.target.value })}
                                    />
                                </div>
                                <input
                                    className="w-full border p-2 rounded text-sm"
                                    placeholder="Texto Estoque (Ex: Estoque disponível)"
                                    value={editingProduct.stockText || ''}
                                    onChange={e => setEditingProduct({ ...editingProduct, stockText: e.target.value })}
                                />
                                <div className="space-y-1">
                                    <input
                                        className="w-full border p-2 rounded text-sm"
                                        placeholder="Selo 1 (Ex: Devolução grátis...)"
                                        value={editingProduct.trustBadge1 || ''}
                                        onChange={e => setEditingProduct({ ...editingProduct, trustBadge1: e.target.value })}
                                    />
                                    <input
                                        className="w-full border p-2 rounded text-sm"
                                        placeholder="Selo 2 (Ex: Compra Garantida...)"
                                        value={editingProduct.trustBadge2 || ''}
                                        onChange={e => setEditingProduct({ ...editingProduct, trustBadge2: e.target.value })}
                                    />
                                    <input
                                        className="w-full border p-2 rounded text-sm"
                                        placeholder="Selo 3 (Ex: Mercado Pontos...)"
                                        value={editingProduct.trustBadge3 || ''}
                                        onChange={e => setEditingProduct({ ...editingProduct, trustBadge3: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isUploading}
                            className={`w-full bg-purple-600 text-white py-3 rounded-lg font-bold ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isUploading ? 'Aguarde...' : 'Salvar Produto'}
                        </button>
                        <button
                            onClick={() => { setIsModalOpen(false); setEditingProduct({}); setSelectedGroups([]); }}
                            className="w-full text-gray-500 py-2"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )
            }

            <ConfirmModal
                isOpen={!!deleteConfirmation}
                title="Excluir Produto"
                message={`Tem certeza que deseja excluir "${deleteConfirmation?.name}"?`}
                onConfirm={() => {
                    if (deleteConfirmation) {
                        deleteProduct(deleteConfirmation.id);
                        setDeleteConfirmation(null);
                    }
                }}
                onCancel={() => setDeleteConfirmation(null)}
                isDestructive
                confirmText="Excluir"
            />

            <ConfirmModal
                isOpen={!!activeConfirmation}
                title="Desativar Produto"
                message={`Tem certeza que deseja desativar "${activeConfirmation?.product.name}"?`}
                onConfirm={() => {
                    if (activeConfirmation) {
                        performToggleActive(activeConfirmation.product, activeConfirmation.newActive);
                    }
                }}
                onCancel={() => setActiveConfirmation(null)}
                isDestructive={true}
                confirmText="Desativar"
            />
        </div >
    );
};
