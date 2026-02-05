import React, { useState, useRef } from 'react';
import { Upload, Camera, Loader2, CheckCircle, AlertCircle, X, FileText, Sparkles, Key, Save } from 'lucide-react';

interface ExtractedProduct {
    name: string;
    price: number;
    quantity: number;
    code?: string;
    selected: boolean;
}

interface InvoiceImporterProps {
    onImportProducts: (products: Array<{ name: string; price: number; description?: string }>) => void;
    onClose: () => void;
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const InvoiceImporter: React.FC<InvoiceImporterProps> = ({ onImportProducts, onClose }) => {
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
    const [showApiKeyInput, setShowApiKeyInput] = useState(!localStorage.getItem('gemini_api_key'));
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [extractedProducts, setExtractedProducts] = useState<ExtractedProduct[]>([]);
    const [step, setStep] = useState<'upload' | 'preview' | 'confirm'>('upload');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const saveApiKey = () => {
        if (apiKey.trim()) {
            localStorage.setItem('gemini_api_key', apiKey.trim());
            setShowApiKeyInput(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Convert to base64
        const reader = new FileReader();
        reader.onload = (event) => {
            setImagePreview(event.target?.result as string);
            setStep('preview');
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    const analyzeWithGemini = async () => {
        if (!apiKey) {
            setShowApiKeyInput(true);
            return;
        }

        if (!imagePreview) return;

        setLoading(true);
        setError(null);

        try {
            // Extract base64 data from data URL
            const base64Data = imagePreview.split(',')[1];
            const mimeType = imagePreview.split(';')[0].split(':')[1];

            const prompt = `Analise esta imagem de nota fiscal ou cupom fiscal brasileiro.
Extraia TODOS os produtos listados com seus preços.

IMPORTANTE: Retorne APENAS um JSON válido, sem markdown, sem explicações.

Formato exato do JSON:
{
  "products": [
    {"name": "Nome do Produto", "price": 99.90, "quantity": 1, "code": "123"}
  ]
}

Se não encontrar produtos, retorne: {"products": []}`;

            const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inline_data: {
                                    mime_type: mimeType,
                                    data: base64Data
                                }
                            }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 4096,
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Erro ao chamar API do Gemini');
            }

            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textResponse) {
                throw new Error('Resposta vazia do Gemini');
            }

            // Clean the response - remove markdown code blocks if present
            let cleanJson = textResponse
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();

            // Parse JSON
            const parsed = JSON.parse(cleanJson);

            if (!parsed.products || !Array.isArray(parsed.products)) {
                throw new Error('Formato de resposta inválido');
            }

            const productsWithSelection = parsed.products.map((p: any) => ({
                name: p.name || 'Produto sem nome',
                price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0,
                quantity: p.quantity || 1,
                code: p.code || '',
                selected: true
            }));

            setExtractedProducts(productsWithSelection);
            setStep('confirm');

        } catch (err: any) {
            console.error('Erro na análise:', err);
            if (err.message.includes('API key')) {
                setError('Chave de API inválida. Verifique sua chave do Gemini.');
                setShowApiKeyInput(true);
            } else if (err instanceof SyntaxError) {
                setError('Não foi possível interpretar os produtos da imagem. Tente uma foto mais clara.');
            } else {
                setError(err.message || 'Erro ao analisar a nota fiscal');
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleProductSelection = (index: number) => {
        setExtractedProducts(prev => prev.map((p, i) =>
            i === index ? { ...p, selected: !p.selected } : p
        ));
    };

    const updateProductField = (index: number, field: keyof ExtractedProduct, value: string | number) => {
        setExtractedProducts(prev => prev.map((p, i) =>
            i === index ? { ...p, [field]: value } : p
        ));
    };

    const handleConfirmImport = () => {
        const selectedProducts = extractedProducts
            .filter(p => p.selected)
            .map(p => ({
                name: p.name,
                price: p.price,
                description: p.code ? `Código: ${p.code}` : undefined
            }));

        if (selectedProducts.length > 0) {
            onImportProducts(selectedProducts);
            onClose();
        }
    };

    const resetToUpload = () => {
        setImagePreview(null);
        setExtractedProducts([]);
        setStep('upload');
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6" />
                        <div>
                            <h2 className="font-bold text-lg">Importar com IA</h2>
                            <p className="text-orange-100 text-sm">Leia notas fiscais automaticamente</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    {/* API Key Section */}
                    {showApiKeyInput && (
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Key className="w-5 h-5 text-blue-600" />
                                <span className="font-semibold text-blue-800">Configurar API do Gemini</span>
                            </div>
                            <p className="text-sm text-blue-700 mb-3">
                                Obtenha sua chave gratuita em:{' '}
                                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer"
                                    className="underline font-medium">aistudio.google.com/apikey</a>
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Cole sua API Key aqui..."
                                    className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                    onClick={saveApiKey}
                                    disabled={!apiKey.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Salvar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Button to change API key when already saved */}
                    {!showApiKeyInput && apiKey && (
                        <div className="mb-4 flex justify-end">
                            <button
                                onClick={() => {
                                    localStorage.removeItem('gemini_api_key');
                                    setApiKey('');
                                    setShowApiKeyInput(true);
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                                <Key className="w-4 h-4" />
                                Trocar API Key
                            </button>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-red-800 font-medium">Erro na análise</p>
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Upload */}
                    {step === 'upload' && (
                        <div className="text-center py-8">
                            <div className="mb-6">
                                <FileText className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Envie uma Nota Fiscal</h3>
                                <p className="text-gray-500">Tire uma foto ou faça upload de uma imagem da nota fiscal</p>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="invoice-upload"
                            />

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <label
                                    htmlFor="invoice-upload"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl cursor-pointer hover:bg-orange-600 transition font-medium"
                                >
                                    <Upload className="w-5 h-5" />
                                    Escolher Imagem
                                </label>
                                <label
                                    htmlFor="invoice-upload"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl cursor-pointer hover:bg-gray-200 transition font-medium"
                                >
                                    <Camera className="w-5 h-5" />
                                    Tirar Foto
                                </label>
                            </div>

                            <p className="text-xs text-gray-400 mt-4">
                                Formatos aceitos: JPG, PNG, WEBP, PDF*
                            </p>
                        </div>
                    )}

                    {/* Step 2: Preview */}
                    {step === 'preview' && imagePreview && (
                        <div>
                            <div className="mb-4">
                                <img
                                    src={imagePreview}
                                    alt="Preview da nota fiscal"
                                    className="w-full max-h-64 object-contain rounded-xl border border-gray-200"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={resetToUpload}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                                >
                                    Escolher Outra
                                </button>
                                <button
                                    onClick={analyzeWithGemini}
                                    disabled={loading || !apiKey}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Analisando...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Analisar com IA
                                        </>
                                    )}
                                </button>
                            </div>

                            {!apiKey && (
                                <p className="text-center text-orange-600 text-sm mt-3">
                                    Configure sua API Key do Gemini acima para continuar
                                </p>
                            )}
                        </div>
                    )}

                    {/* Step 3: Confirm Products */}
                    {step === 'confirm' && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="font-semibold text-gray-800">
                                    {extractedProducts.length} produto(s) encontrado(s)
                                </span>
                            </div>

                            {extractedProducts.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                    <p>Nenhum produto encontrado na imagem</p>
                                    <button
                                        onClick={resetToUpload}
                                        className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        Tentar Outra Imagem
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3 max-h-64 overflow-auto">
                                        {extractedProducts.map((product, index) => (
                                            <div
                                                key={index}
                                                className={`p-3 border rounded-xl transition ${product.selected
                                                    ? 'border-green-300 bg-green-50'
                                                    : 'border-gray-200 bg-gray-50 opacity-60'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={product.selected}
                                                        onChange={() => toggleProductSelection(index)}
                                                        className="w-5 h-5 mt-1 text-green-500 rounded focus:ring-green-500"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <input
                                                            type="text"
                                                            value={product.name}
                                                            onChange={(e) => updateProductField(index, 'name', e.target.value)}
                                                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm font-medium"
                                                        />
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-xs text-gray-500">Preço:</span>
                                                            <input
                                                                type="number"
                                                                value={product.price}
                                                                onChange={(e) => updateProductField(index, 'price', parseFloat(e.target.value) || 0)}
                                                                className="w-24 px-2 py-1 border border-gray-200 rounded text-sm"
                                                                step="0.01"
                                                            />
                                                            {product.code && (
                                                                <span className="text-xs text-gray-400 ml-2">
                                                                    Cód: {product.code}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={resetToUpload}
                                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                                        >
                                            Nova Imagem
                                        </button>
                                        <button
                                            onClick={handleConfirmImport}
                                            disabled={!extractedProducts.some(p => p.selected)}
                                            className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Importar {extractedProducts.filter(p => p.selected).length} Produto(s)
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvoiceImporter;
