import React, { createContext, useContext } from 'react';
import {
    Product, Category, ProductGroup, CartItem, GlobalSettings, Role, Coupon, OrderRecord, OrderStatus
} from '../../types';

export interface AppContextType {
    products: Product[];
    categories: Category[];
    groups: ProductGroup[];
    cart: CartItem[];
    settings: GlobalSettings;
    coupons: Coupon[];
    orders: OrderRecord[];
    adminRole: Role;
    appliedCoupon: Coupon | null;
    applyCoupon: (code: string) => { success: boolean; message: string };
    removeCoupon: () => void;

    addToCart: (item: CartItem) => void;
    removeFromCart: (cartId: string) => void;
    updateCartQuantity: (cartId: string, quantity: number) => void;
    updateCartNote: (cartId: string, note: string) => void;
    clearCart: () => void;

    addProduct: (product: Product) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (id: string) => void;
    reorderProducts: (categoryId: string, products: Product[]) => void;

    addCategory: (category: Category) => void;
    updateCategory: (category: Category) => void;
    deleteCategory: (id: string) => void;

    addGroup: (group: ProductGroup) => void;
    updateGroup: (group: ProductGroup) => void;
    deleteGroup: (id: string) => void;

    addCoupon: (coupon: Coupon) => void;
    updateCoupon: (coupon: Coupon) => void;
    deleteCoupon: (id: string) => void;

    updateSettings: (newSettings: Partial<GlobalSettings>) => void;
    setAdminRole: (role: Role) => void;
    addOrder: (order: OrderRecord) => void;
    updateOrderStatus: (id: string, status: OrderStatus) => void;
    deleteOrder: (id: string) => void;
    copyOrderToClipboard: (order: OrderRecord) => void;

    checkStoreStatus: () => 'open' | 'closed';
    isStoreOpen: boolean;
    isSidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    loading: boolean;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
