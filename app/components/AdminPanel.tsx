'use client';

import React, { useEffect, useState } from 'react';
import { Package, Tags, ClipboardList, Image as ImageIcon, Plus, Layers, Grid } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import type { Product } from '@/lib/types';

// Admin sub-components
import AdminNavbar from './admin/AdminNavbar';
import AdminLogin from './admin/AdminLogin';
import ProductForm from './admin/ProductForm';
import ProductsTable from './admin/ProductsTable';
import CategoriesManager from './admin/CategoriesManager';
import OrdersManager from './admin/OrdersManager';
import BannersManager from './admin/BannersManager';
import EditorialBannersManager from './admin/EditorialBannersManager';
import LookbookStylesManager from './admin/LookbookStylesManager';

export default function AdminPanel() {
  const { user } = useAuth();
  const { refreshData } = useStore();

  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders' | 'banners' | 'editorial_banners' | 'lookbook_styles'>('products');
  const [mounted, setMounted] = useState(false);

  // Form open/close and editing state
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Global notifications
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') refreshData();
  }, [user]);

  // Handle auto-clear alerts
  useEffect(() => {
    if (errorMsg || successMsg) {
      const timer = setTimeout(() => {
        setErrorMsg('');
        setSuccessMsg('');
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg, successMsg]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-brand-cream/10 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-brown border-t-transparent animate-spin" />
      </div>
    );
  }

  // Admin Login Guard
  if (!user || user.role !== 'admin') {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-brand-cream/10 pb-16">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Global Notifications */}
        {errorMsg && (
          <div className="mb-6 p-3.5 bg-red-50 text-red-600 border border-red-200 rounded text-xs font-semibold tracking-wider text-center animate-fade-in">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-3.5 bg-green-50 text-brand-brown border border-brand-cream-dark rounded text-xs font-semibold tracking-wider text-center animate-fade-in">
            {successMsg}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center space-x-4 border-b border-brand-cream-dark mb-8 overflow-x-auto">
          {([
            { key: 'products', label: 'Products Inventory', icon: <Package className="w-4 h-4" /> },
            { key: 'categories', label: 'Categories Management', icon: <Tags className="w-4 h-4" /> },
            { key: 'orders', label: 'Customer Orders', icon: <ClipboardList className="w-4 h-4" /> },
            { key: 'banners', label: 'Hero Banners', icon: <ImageIcon className="w-4 h-4" /> },
            { key: 'editorial_banners', label: 'Editorial Banners', icon: <Layers className="w-4 h-4" /> },
            { key: 'lookbook_styles', label: 'Lookbook Styles', icon: <Grid className="w-4 h-4" /> },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex items-center space-x-2 pb-4 text-xs font-bold tracking-widest uppercase border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-brand-brown text-brand-brown'
                  : 'border-transparent text-brand-dark/45 hover:text-brand-brown'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="font-serif text-lg text-brand-dark uppercase">Products</h3>
                <p className="text-[10px] text-brand-dark/50 uppercase tracking-widest">
                  Create and modify shop garments
                </p>
              </div>
              {!isProductFormOpen && !editingProduct && (
                <button
                  onClick={() => {
                    setIsProductFormOpen(true);
                    setEditingProduct(null);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="flex items-center space-x-1.5 px-6 py-2.5 bg-brand-brown hover:bg-brand-brown-dark text-white rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              )}
            </div>

            <ProductForm
              isOpen={isProductFormOpen || !!editingProduct}
              editingProduct={editingProduct}
              onClose={() => {
                setIsProductFormOpen(false);
                setEditingProduct(null);
              }}
              setErrorMsg={setErrorMsg}
              setSuccessMsg={setSuccessMsg}
            />

            {!isProductFormOpen && !editingProduct && (
              <ProductsTable
                onStartEdit={(prod: Product) => {
                  setEditingProduct(prod);
                  setIsProductFormOpen(false);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                setErrorMsg={setErrorMsg}
                setSuccessMsg={setSuccessMsg}
              />
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <CategoriesManager setErrorMsg={setErrorMsg} setSuccessMsg={setSuccessMsg} />
        )}

        {activeTab === 'orders' && (
          <OrdersManager setErrorMsg={setErrorMsg} setSuccessMsg={setSuccessMsg} />
        )}

        {activeTab === 'banners' && (
          <BannersManager setErrorMsg={setErrorMsg} setSuccessMsg={setSuccessMsg} />
        )}

        {activeTab === 'editorial_banners' && (
          <EditorialBannersManager setErrorMsg={setErrorMsg} setSuccessMsg={setSuccessMsg} />
        )}

        {activeTab === 'lookbook_styles' && (
          <LookbookStylesManager setErrorMsg={setErrorMsg} setSuccessMsg={setSuccessMsg} />
        )}
      </div>
    </div>
  );
}
