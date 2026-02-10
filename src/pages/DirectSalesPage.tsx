import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Plus, Minus, Trash2, User, CreditCard, ChevronLeft, CheckCircle, Printer, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, CartItem, DeliveryMethod, OrderRecord, ProductGroup, ProductOption } from '../../types';

export const DirectSalesPage = () => {
    // Format currency helper
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const { products, groups, addOrder, settings } = useApp();
    const navigate = useNavigate();

    // Local PDV State
    const [searchTerm, setSearchTerm] = useState('');
    const [pdvCart, setPdvCart] = useState<CartItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // For modal options

    // Checkout State
    const [customerName, setCustomerName] = useState('Cliente Balcão');
    const [paymentMethod, setPaymentMethod] = useState('Dinheiro');
    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DeliveryMethod.PICKUP);
    const [observation, setObservation] = useState('');

    // Options Modal State
    const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
    const [currentQuantity, setCurrentQuantity] = useState(1);
    const [modalNote, setModalNote] = useState('');

    // Filter products
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products.slice(0, 20); // Show some initial products
        const lower = searchTerm.toLowerCase();
        return products.filter(p =>
            (p.active !== false) &&
            (p.name.toLowerCase().includes(lower) ||
                (p.description && p.description.toLowerCase().includes(lower)))
        ).slice(0, 20);
    }, [products, searchTerm]);

    // Calculate totals
    const total = pdvCart.reduce((acc, item) => acc + (item.totalPrice * item.quantity), 0);
    const itemsCount = pdvCart.reduce((acc, item) => acc + item.quantity, 0);

    // --- Modal Logic ---
    const openProductModal = (product: Product) => {
        if (!product.groupIds || product.groupIds.length === 0) {
            // Direct add if no options
            addToPdvCart(product, 1, {}, '');
            return;
        }
        setSelectedProduct(product);
        setSelectedOptions({});
        setCurrentQuantity(1);
        setModalNote('');
    };

    const closeProductModal = () => {
        setSelectedProduct(null);
    };

    const handleOptionChange = (groupId: string, optionId: string, delta: number, max: number) => {
        const currentQty = selectedOptions[optionId] || 0;
        const group = groups.find(g => g.id === groupId);
        if (!group) return;

        const currentGroupTotal = group.options.reduce((sum, opt) => sum + (selectedOptions[opt.id] || 0), 0);

        // Check max limit only when adding
        if (delta > 0 && currentGroupTotal >= max) return;

        const newQty = Math.max(0, currentQty + delta);
        setSelectedOptions(prev => ({ ...prev, [optionId]: newQty }));
    };

    const confirmAddToPdvCart = () => {
        if (!selectedProduct) return;

        // Validate min requirements
        const productGroups = (selectedProduct.groupIds || [])
            .map(gid => groups.find(g => g.id === gid))
            .filter(Boolean) as ProductGroup[];

        const isValid = productGroups.every(g => {
            const total = g.options.reduce((sum, opt) => sum + (selectedOptions[opt.id] || 0), 0);
            return total >= g.min;
        });

        if (!isValid) {
            alert('Por favor, selecione as opções mínimas obrigatórias.');
            return;
        }

        // Calculate unit price with options
        let unitPrice = selectedProduct.price;
        productGroups.forEach(group => {
            group.options.forEach(opt => {
                const qty = selectedOptions[opt.id] || 0;
                if (qty > 0 && opt.price) {
                    unitPrice += opt.price * qty;
                }
            });
        });

        addToPdvCart(selectedProduct, currentQuantity, selectedOptions, modalNote, unitPrice);
        closeProductModal();
    };

    const addToPdvCart = (product: Product, quantity: number, options: Record<string, number>, note: string, customUnitPrice?: number) => {
        const unitPrice = customUnitPrice !== undefined ? customUnitPrice : product.price;

        setPdvCart(prev => {
            const newItem: CartItem = {
                cartId: Date.now().toString() + Math.random().toString().slice(2, 5),
                product,
                quantity,
                selectedOptions: options,
                note,
                totalPrice: unitPrice
            };
            return [...prev, newItem];
        });
        setSearchTerm(''); // Clear search to be ready for next item
    };

    const removeFromPdvCart = (cartId: string) => {
        setPdvCart(prev => prev.filter(item => item.cartId !== cartId));
    };

    // --- Checkout Logic ---
    const handleFinalize = async () => {
        if (pdvCart.length === 0) return alert('Carrinho vazio');
        if (!customerName) return alert('Nome do cliente é obrigatório');

        const newOrder: OrderRecord = {
            id: Math.floor(Math.random() * 100000).toString(),
            date: new Date().toISOString(),
            customerName,
            whatsapp: '', // Optional for PDV
            method: deliveryMethod,
            address: 'Balcão',
            paymentMethod,
            total,
            itemsSummary: `${itemsCount} itens (PDV)`,
            status: 'completed', // PDV orders are usually instant
            fullDetails: pdvCart
        };

        if (confirm(`Confirmar venda de ${formatCurrency(total)}?`)) {
            await addOrder(newOrder);
            alert('Venda registrada com sucesso!');
            // Reset
            setPdvCart([]);
            setCustomerName('Cliente Balcão');
            setObservation('');
            setSearchTerm('');
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Left Column: Product Search & Grid */}
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => navigate('/panel')} className="p-2 bg-white rounded-lg hover:bg-gray-200">
                        <ChevronLeft />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">PDV - Venda Direta</h1>
                    <div className="w-10"></div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            autoFocus
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none text-lg"
                            placeholder="Buscar produto (Nome, código...)"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
                    {filteredProducts.map(product => (
                        <div
                            key={product.id}
                            onClick={() => openProductModal(product)}
                            className="bg-white p-4 rounded-xl shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all border border-transparent hover:border-purple-200 flex flex-col"
                        >
                            <div className="h-32 w-full mb-3 bg-gray-100 rounded-lg overflow-hidden">
                                <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm leading-tight mb-2 flex-1">{product.name}</h3>
                            <div className="flex justify-between items-center mt-2">
                                <span className="font-bold text-purple-600 text-lg">R$ {product.price.toFixed(2)}</span>
                                <button className="p-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200">
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Cart & Checkout */}
            <div className="w-[400px] bg-white border-l border-gray-200 flex flex-col h-full shadow-2xl z-10">
                <div className="p-4 bg-purple-600 text-white shadow-md">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShoppingCart /> Carrinho ({itemsCount})
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {pdvCart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                            <ShoppingCart size={64} className="mb-4" />
                            <p>Carrinho vazio</p>
                        </div>
                    ) : (
                        pdvCart.map(item => (
                            <div key={item.cartId} className="flex justify-between items-start border-b border-gray-100 pb-3">
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800 text-sm">{item.product.name}</h4>
                                    <div className="text-xs text-gray-500">
                                        {Object.entries(item.selectedOptions).map(([optId, qty]) => {
                                            if (qty === 0) return null;
                                            const group = groups.find(g => g.options.some(o => o.id === optId));
                                            const option = group?.options.find(o => o.id === optId);
                                            return option ? <span key={optId} className="mr-1">+{option.name} ({qty}), </span> : null;
                                        })}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-purple-600 font-bold text-sm">
                                            {item.quantity}x R$ {item.totalPrice.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-800">R$ {(item.totalPrice * item.quantity).toFixed(2)}</p>
                                    <button
                                        onClick={() => removeFromPdvCart(item.cartId)}
                                        className="text-red-500 hover:text-red-700 p-1 mt-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cliente</label>
                        <div className="flex items-center bg-white border rounded px-3 py-2">
                            <User size={16} className="text-gray-400 mr-2" />
                            <input
                                className="w-full text-sm outline-none"
                                value={customerName}
                                onChange={e => setCustomerName(e.target.value)}
                                placeholder="Nome do Cliente"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pagamento</label>
                        <div className="flex items-center bg-white border rounded px-3 py-2">
                            <CreditCard size={16} className="text-gray-400 mr-2" />
                            <select
                                className="w-full text-sm outline-none bg-transparent"
                                value={paymentMethod}
                                onChange={e => setPaymentMethod(e.target.value)}
                            >
                                <option value="Dinheiro">Dinheiro</option>
                                <option value="PIX">PIX</option>
                                <option value="Cartão de Crédito">Cartão de Crédito</option>
                                <option value="Cartão de Débito">Cartão de Débito</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between items-center py-2 border-t border-gray-200 mt-2">
                        <span className="text-gray-600 font-medium">Total Geral</span>
                        <span className="text-2xl font-bold text-gray-800">R$ {total.toFixed(2)}</span>
                    </div>

                    <button
                        onClick={handleFinalize}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                    >
                        <CheckCircle /> FINALIZAR VENDA
                    </button>
                </div>
            </div>

            {/* Product Options Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-lg">{selectedProduct.name}</h3>
                            <button onClick={closeProductModal}><X /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {(selectedProduct.groupIds || []).map(gid => {
                                const group = groups.find(g => g.id === gid);
                                if (!group) return null;
                                const currentTotal = group.options.reduce((sum, opt) => sum + (selectedOptions[opt.id] || 0), 0);

                                return (
                                    <div key={group.id} className="border rounded-lg p-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-bold">{group.title}</h4>
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Min: {group.min} | Max: {group.max}</span>
                                        </div>
                                        <div className="space-y-2">
                                            {group.options.map(opt => {
                                                const qty = selectedOptions[opt.id] || 0;
                                                return (
                                                    <div key={opt.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                                        <div>
                                                            <p className="font-medium text-sm">{opt.name}</p>
                                                            <p className="text-xs text-green-600 font-bold">+ R$ {opt.price?.toFixed(2)}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleOptionChange(group.id, opt.id, -1, group.max)}
                                                                disabled={qty === 0}
                                                                className="p-1 rounded bg-white shadow disabled:opacity-50"
                                                            >
                                                                <Minus size={14} />
                                                            </button>
                                                            <span className="w-4 text-center font-bold text-sm">{qty}</span>
                                                            <button
                                                                onClick={() => handleOptionChange(group.id, opt.id, 1, group.max)}
                                                                disabled={currentTotal >= group.max}
                                                                className="p-1 rounded bg-white shadow disabled:opacity-50"
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="pt-2">
                                <label className="block text-sm font-bold mb-1">Quantidade</label>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setCurrentQuantity(Math.max(1, currentQuantity - 1))} className="p-2 bg-gray-200 rounded"><Minus /></button>
                                    <span className="text-xl font-bold">{currentQuantity}</span>
                                    <button onClick={() => setCurrentQuantity(currentQuantity + 1)} className="p-2 bg-gray-200 rounded"><Plus /></button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1">Observação</label>
                                <textarea
                                    className="w-full border rounded p-2"
                                    rows={2}
                                    value={modalNote}
                                    onChange={e => setModalNote(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t bg-gray-50">
                            <button
                                onClick={confirmAddToPdvCart}
                                className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700"
                            >
                                Adicionar ao Pedido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
