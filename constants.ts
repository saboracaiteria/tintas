import { Category, Product, ProductGroup, Coupon, OrderRecord, DeliveryMethod } from './types';

// ========================================
// CASA DAS CORES - CONSTANTES
// ========================================

export const WHATSAPP_NUMBER = "5594999999999";
export const LOGO_URL = "https://ui-avatars.com/api/?name=Casa+Cores&background=ff6b00&color=fff&size=256&font-size=0.33";

// Categories, Products, Groups are now loaded from mockData.ts
// These are kept empty for backward compatibility with any imports
export const CATEGORIES: Category[] = [];

export const GROUPS: ProductGroup[] = [];

export const PRODUCTS: Product[] = [];

export const PAYMENT_METHODS = [
  'Pix',
  'Cartão de Débito',
  'Cartão de Crédito à Vista',
  'Crédito Parcelado 4x',
  'Dinheiro',
];

export const INITIAL_COUPONS: Coupon[] = [];

export const MOCK_ORDERS: OrderRecord[] = [];
