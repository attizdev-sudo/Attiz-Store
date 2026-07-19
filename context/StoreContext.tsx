'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import type { Product, Category, Order, Banner, EditorialBanner, LookbookStyle } from '@/lib/types';

export type { Product, Category, Order, Banner, EditorialBanner, LookbookStyle };

interface StoreContextValue {
  products: Product[];
  categories: Category[];
  orders: Order[];
  banners: Banner[];
  editorialBanners: EditorialBanner[];
  lookbookStyles: LookbookStyle[];
  dbLoading: boolean;
  refreshData: () => Promise<void>;
  addProduct: (data: Partial<Product>) => Promise<{ data: unknown; error: unknown }>;
  editProduct: (id: string, updates: Partial<Product>) => Promise<{ data: unknown; error: unknown }>;
  deleteProduct: (id: string) => Promise<{ data: unknown; error: unknown }>;
  addCategory: (data: Partial<Category> | Partial<Category>[]) => Promise<{ data: unknown; error: unknown }>;
  updateCategory: (id: string, updates: { name: string; parent_id?: string | null; sort_order?: number }) => Promise<{ data: unknown; error: unknown }>;
  deleteCategory: (id: string) => Promise<{ data: unknown; error: unknown }>;
  addBanner: (data: Partial<Banner>) => Promise<{ data: unknown; error: unknown }>;
  deleteBanner: (id: string) => Promise<{ data: unknown; error: unknown }>;
  addEditorialBanner: (data: Partial<EditorialBanner>) => Promise<{ data: unknown; error: unknown }>;
  deleteEditorialBanner: (id: string) => Promise<{ data: unknown; error: unknown }>;
  addLookbookStyle: (data: Partial<LookbookStyle>) => Promise<{ data: unknown; error: unknown }>;
  deleteLookbookStyle: (id: string) => Promise<{ data: unknown; error: unknown }>;
  updateOrderStatus: (orderId: string, nextStatus: string) => Promise<{ data: unknown; error: unknown }>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function getSessionToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)attiz_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function apiFetch(url: string, options?: RequestInit) {
  try {
    const sessionToken = getSessionToken();
    const headers = new Headers(options?.headers);
    if (sessionToken) headers.set('x-attiz-session', sessionToken);
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json.error || 'Request failed' };
    return { data: json, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : 'Network error' };
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editorialBanners, setEditorialBanners] = useState<EditorialBanner[]>([]);
  const [lookbookStyles, setLookbookStyles] = useState<LookbookStyle[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  const refreshData = async () => {
    try {
      setDbLoading(true);
      const sessionToken = getSessionToken();
      const headers = sessionToken ? { 'x-attiz-session': sessionToken } : undefined;

      const fetchBanners = async () => {
        try {
          const res = await fetch('/api/banners', { credentials: 'include', headers });
          const data = await res.json();
          setBanners(Array.isArray(data) ? data : []);
        } catch (e) {
          console.error('Error fetching banners:', e);
        }
      };

      const fetchEditorialBanners = async () => {
        try {
          const res = await fetch('/api/editorial-banners', { credentials: 'include', headers });
          const data = await res.json();
          setEditorialBanners(Array.isArray(data) ? data : []);
        } catch (e) {
          console.error('Error fetching editorial banners:', e);
        }
      };

      const fetchLookbookStyles = async () => {
        try {
          const res = await fetch('/api/lookbook-styles', { credentials: 'include', headers });
          const data = await res.json();
          setLookbookStyles(Array.isArray(data) ? data : []);
        } catch (e) {
          console.error('Error fetching lookbook styles:', e);
        }
      };

      const fetchCategories = async () => {
        try {
          const res = await fetch('/api/categories', { credentials: 'include', headers });
          const data = await res.json();
          setCategories(Array.isArray(data) ? data : []);
        } catch (e) {
          console.error('Error fetching categories:', e);
        }
      };

      const fetchOrders = async () => {
        try {
          const res = await fetch('/api/orders', { credentials: 'include', headers });
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : []);
        } catch (e) {
          console.error('Error fetching orders:', e);
        }
      };

      const fetchProducts = async () => {
        try {
          const res = await fetch('/api/products', { credentials: 'include', headers });
          const data = await res.json();
          const enrichedProducts = Array.isArray(data)
            ? data.map((p: any) => {
                const variants = p.product_variants || [];
                const uniqueSizes = Array.from(new Set(variants.map((v: any) => v.size))).join(',');
                const uniqueColors = Array.from(new Set(variants.map((v: any) => v.color))).join(',');
                const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
                const firstVariant = variants[0];
                const price = firstVariant ? parseFloat(String(firstVariant.price)) : 0;
                const discount = firstVariant ? parseFloat(String(firstVariant.discount || 0)) : 0;
                
                const imageUrls: string[] = [];
                variants.forEach((v: any) => {
                  v.product_variant_images?.forEach((img: any) => {
                    if (img.image_url && !imageUrls.includes(img.image_url)) {
                      imageUrls.push(img.image_url);
                    }
                  });
                });
                const image = imageUrls[0] || 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600';
                const images = imageUrls.join(',');

                return {
                  ...p,
                  price,
                  discount,
                  image,
                  images,
                  sizes: uniqueSizes,
                  colors: uniqueColors,
                  stock: totalStock,
                };
              })
            : [];
          setProducts(enrichedProducts);
        } catch (e) {
          console.error('Error fetching products:', e);
        }
      };

      await Promise.all([
        fetchBanners(),
        fetchEditorialBanners(),
        fetchLookbookStyles(),
        fetchCategories(),
        fetchOrders(),
        fetchProducts(),
      ]);
    } catch (e) {
      console.error('Error fetching store data:', e);
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => { refreshData(); }, []);

  const addProduct = async (data: Partial<Product>) => {
    const result = await apiFetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!result.error) await refreshData();
    return result;
  };

  const editProduct = async (id: string, updates: Partial<Product>) => {
    const result = await apiFetch(`/api/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
    if (!result.error) await refreshData();
    return result;
  };

  const deleteProduct = async (id: string) => {
    const result = await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!result.error) await refreshData();
    return result;
  };

  const addCategory = async (data: Partial<Category> | Partial<Category>[]) => {
    const result = await apiFetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!result.error) await refreshData();
    return result;
  };

  const updateCategory = async (id: string, updates: { name: string; parent_id?: string | null; sort_order?: number }) => {
    const result = await apiFetch(`/api/categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
    if (!result.error) await refreshData();
    return result;
  };

  const deleteCategory = async (id: string) => {
    const result = await apiFetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (!result.error) await refreshData();
    return result;
  };

  const addBanner = async (data: Partial<Banner>) => {
    const result = await apiFetch('/api/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!result.error) await refreshData();
    return result;
  };

  const deleteBanner = async (id: string) => {
    const result = await apiFetch(`/api/banners/${id}`, { method: 'DELETE' });
    if (!result.error) await refreshData();
    return result;
  };

  const addEditorialBanner = async (data: Partial<EditorialBanner>) => {
    const result = await apiFetch('/api/editorial-banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!result.error) await refreshData();
    return result;
  };

  const deleteEditorialBanner = async (id: string) => {
    const result = await apiFetch(`/api/editorial-banners/${id}`, { method: 'DELETE' });
    if (!result.error) await refreshData();
    return result;
  };

  const addLookbookStyle = async (data: Partial<LookbookStyle>) => {
    const result = await apiFetch('/api/lookbook-styles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!result.error) await refreshData();
    return result;
  };

  const deleteLookbookStyle = async (id: string) => {
    const result = await apiFetch(`/api/lookbook-styles/${id}`, { method: 'DELETE' });
    if (!result.error) await refreshData();
    return result;
  };

  const updateOrderStatus = async (orderId: string, nextStatus: string) => {
    const result = await apiFetch(`/api/orders/${orderId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: nextStatus }) });
    if (!result.error) await refreshData();
    return result;
  };

  return (
    <StoreContext.Provider value={{
      products, categories, orders, banners, editorialBanners, lookbookStyles, dbLoading, refreshData,
      addProduct, editProduct, deleteProduct,
      addCategory, updateCategory, deleteCategory,
      addBanner, deleteBanner,
      addEditorialBanner, deleteEditorialBanner,
      addLookbookStyle, deleteLookbookStyle,
      updateOrderStatus,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}
