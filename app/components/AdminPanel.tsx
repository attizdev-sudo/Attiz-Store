'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Database, Plus, Trash2, Edit3, CheckCircle, Package,
  ClipboardList, AlertCircle, LogOut, Tags, Upload, Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { uploadImage } from '@/lib/db';
import { CATEGORIES_MAP } from '@/lib/categories';
import type { Product, Category, Banner } from '@/lib/types';

const BLANK_PRODUCT = {
  title: '', price: '', parent_category: 'MEN', secondary_category: 'Round Neck Tees',
  subcategory: '', category: 'Round Neck Tees', image: '', images: '',
  sizes: 'S,M,L,XL,XXL', colors: 'Black,Dark Wine,Teal',
  size_chart: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
  stock: '100', description: '', specifications: '', wash_care: '',
};

const BLANK_BANNER = { title: '', discount: '', tagline: '', bgSplitLeft: '#991b1b', bgSplitRight: '#0a0a0a', image: '' };

const ORDER_STATUSES = ['Waiting for confirmation', 'Accepted', 'Dispatched', 'Shipped', 'Delivered'];

type EditableProduct = Omit<Partial<Product>, 'price' | 'stock'> & { price: string | number; stock: string | number };

export default function AdminPanel() {
  const { user, signin, logout } = useAuth();
  const {
    products, categories, orders, banners, dbLoading, refreshData,
    addProduct, editProduct, deleteProduct,
    addCategory, updateCategory, deleteCategory,
    addBanner, deleteBanner,
    updateOrderStatus,
  } = useStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders' | 'banners'>('products');

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<typeof BLANK_PRODUCT>({ ...BLANK_PRODUCT });
  const [editingProduct, setEditingProduct] = useState<EditableProduct | null>(null);

  const [isCustomParent, setIsCustomParent] = useState(false);
  const [customParent, setCustomParent] = useState('');
  const [isCustomSecondary, setIsCustomSecondary] = useState(false);
  const [customSecondary, setCustomSecondary] = useState('');

  const [isEditCustomParent, setEditIsCustomParent] = useState(false);
  const [editCustomParent, setEditCustomParent] = useState('');
  const [isEditCustomSecondary, setEditIsCustomSecondary] = useState(false);
  const [editCustomSecondary, setEditCustomSecondary] = useState('');

  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);

  const [isAddBannerFormOpen, setIsAddBannerFormOpen] = useState(false);
  const [newBanner, setNewBanner] = useState({ ...BLANK_BANNER });
  const [bannerImageUploading, setBannerImageUploading] = useState(false);

  const [sizeChartUploading, setSizeChartUploading] = useState(false);
  const [editSizeChartUploading, setEditSizeChartUploading] = useState(false);
  const [additionalImagesUploading, setAdditionalImagesUploading] = useState(false);
  const [editAdditionalImagesUploading, setEditAdditionalImagesUploading] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const parentsList = Object.keys(CATEGORIES_MAP);
  const secondariesList = CATEGORIES_MAP[newProduct.parent_category] || [];
  const editSecondariesList = editingProduct ? (CATEGORIES_MAP[String(editingProduct.parent_category)] || []) : [];

  const newProductAllImages = [newProduct.image, ...newProduct.images.split(',').filter(Boolean)].filter(Boolean);
  const editProductAllImages = editingProduct ? [editingProduct.image, ...(String(editingProduct.images || '')).split(',').filter(Boolean)].filter(Boolean) : [];

  useEffect(() => {
    if (user?.role === 'admin') refreshData();
  }, [user]);

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    const res = await signin(phone, password);
    setAuthLoading(false);
    if (!res.success) { setAuthError(res.message || 'Login failed.'); }
    else if (res.user?.role !== 'admin') { setAuthError('Access denied. Not an administrator.'); logout(); }
  };

  const handleProductImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      setAdditionalImagesUploading(true); setErrorMsg('');
      const urls = await Promise.all(files.map((f) => uploadImage('product-images', f)));
      setNewProduct((prev) => {
        const all = [prev.image, ...prev.images.split(',').filter(Boolean)].filter(Boolean);
        const updated = [...all, ...urls];
        return { ...prev, image: updated[0] || '', images: updated.slice(1).join(',') };
      });
      setSuccessMsg(`Uploaded ${files.length} image(s)!`);
    } catch { setErrorMsg('Failed to upload images.'); }
    finally { setAdditionalImagesUploading(false); e.target.value = ''; }
  };

  const handleEditProductImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      setEditAdditionalImagesUploading(true); setErrorMsg('');
      const urls = await Promise.all(files.map((f) => uploadImage('product-images', f)));
      setEditingProduct((prev) => {
        if (!prev) return prev;
        const all = [prev.image, ...String(prev.images || '').split(',').filter(Boolean)].filter(Boolean);
        const updated = [...all, ...urls];
        return { ...prev, image: updated[0] || '', images: updated.slice(1).join(',') };
      });
      setSuccessMsg(`Uploaded ${files.length} image(s)!`);
    } catch { setErrorMsg('Failed to upload images.'); }
    finally { setEditAdditionalImagesUploading(false); e.target.value = ''; }
  };

  const handleSizeChartUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      setSizeChartUploading(true); setErrorMsg('');
      const url = await uploadImage('size-charts', file);
      setNewProduct((prev) => ({ ...prev, size_chart: url }));
      setSuccessMsg('Size chart uploaded!');
    } catch { setErrorMsg('Failed to upload size chart.'); }
    finally { setSizeChartUploading(false); }
  };

  const handleEditSizeChartUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      setEditSizeChartUploading(true); setErrorMsg('');
      const url = await uploadImage('size-charts', file);
      setEditingProduct((prev) => prev ? { ...prev, size_chart: url } : prev);
      setSuccessMsg('Size chart updated!');
    } catch { setErrorMsg('Failed to upload size chart.'); }
    finally { setEditSizeChartUploading(false); }
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      setBannerImageUploading(true); setErrorMsg('');
      const url = await uploadImage('product-images', file);
      setNewBanner((prev) => ({ ...prev, image: url }));
      setSuccessMsg('Banner image uploaded!');
    } catch { setErrorMsg('Failed to upload banner image.'); }
    finally { setBannerImageUploading(false); }
  };

  const handleParentCategoryChange = (val: string) => {
    const defaultSecondary = CATEGORIES_MAP[val]?.[0] || '';
    setNewProduct((prev) => ({ ...prev, parent_category: val, secondary_category: defaultSecondary, category: defaultSecondary }));
  };

  const handleEditParentCategoryChange = (val: string) => {
    const defaultSecondary = CATEGORIES_MAP[val]?.[0] || '';
    setEditingProduct((prev) => prev ? { ...prev, parent_category: val, secondary_category: defaultSecondary, category: defaultSecondary } : prev);
  };

  const handleStartEditProduct = (prod: Product) => {
    const normParent = (prod.parent_category || 'MEN').trim().toUpperCase();
    let normSecondary = (prod.secondary_category || prod.category || '').trim();
    const canonicalSecondaries = CATEGORIES_MAP[normParent] || [];
    const matched = canonicalSecondaries.find((s) => s.toLowerCase() === normSecondary.toLowerCase());
    if (matched) normSecondary = matched;
    setEditingProduct({ ...prod, images: prod.images || '', parent_category: normParent, secondary_category: normSecondary || canonicalSecondaries[0] || '', subcategory: '' });
    setEditIsCustomParent(false); setEditIsCustomSecondary(false);
    setEditCustomParent(''); setEditCustomSecondary('');
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
    const priceNum = parseFloat(String(newProduct.price));
    const stockNum = parseInt(String(newProduct.stock), 10);
    if (isNaN(priceNum)) { setErrorMsg('Price must be a valid number.'); return; }
    if (isNaN(stockNum) || stockNum < 0) { setErrorMsg('Stock must be a non-negative integer.'); return; }
    const parentVal = isCustomParent ? customParent.trim() : newProduct.parent_category;
    const secondaryVal = isCustomSecondary ? customSecondary.trim() : newProduct.secondary_category;
    if (!parentVal || !secondaryVal) { setErrorMsg('Please specify parent and secondary categories.'); return; }
    try {
      const { error } = await addProduct({
        title: newProduct.title, price: priceNum,
        category: secondaryVal, parent_category: parentVal, secondary_category: secondaryVal, subcategory: '',
        image: newProduct.image || 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600',
        images: newProduct.images || '', sizes: newProduct.sizes, colors: newProduct.colors,
        size_chart: newProduct.size_chart, stock: stockNum,
        description: newProduct.description, specifications: newProduct.specifications, wash_care: newProduct.wash_care,
      } as Partial<Product>);
      if (error) throw error;
      setSuccessMsg('Product added successfully!');
      setNewProduct({ ...BLANK_PRODUCT });
      setCustomParent(''); setCustomSecondary('');
      setIsCustomParent(false); setIsCustomSecondary(false);
      setIsAddFormOpen(false);
    } catch { setErrorMsg('Failed to add product.'); }
  };

  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
    if (!editingProduct) return;
    const priceNum = parseFloat(String(editingProduct.price));
    const stockNum = parseInt(String(editingProduct.stock), 10);
    if (isNaN(priceNum)) { setErrorMsg('Price must be a valid number.'); return; }
    if (isNaN(stockNum) || stockNum < 0) { setErrorMsg('Stock must be a non-negative integer.'); return; }
    const parentVal = isEditCustomParent ? editCustomParent.trim() : String(editingProduct.parent_category || '');
    const secondaryVal = isEditCustomSecondary ? editCustomSecondary.trim() : String(editingProduct.secondary_category || '');
    if (!parentVal || !secondaryVal) { setErrorMsg('Please specify parent and secondary categories.'); return; }
    try {
      const { error } = await editProduct(editingProduct.id as string, {
        title: editingProduct.title, price: priceNum,
        category: secondaryVal, parent_category: parentVal, secondary_category: secondaryVal, subcategory: '',
        image: editingProduct.image, images: String(editingProduct.images || ''),
        sizes: editingProduct.sizes, colors: editingProduct.colors, size_chart: editingProduct.size_chart,
        stock: stockNum, description: editingProduct.description,
        specifications: editingProduct.specifications, wash_care: editingProduct.wash_care,
      } as Partial<Product>);
      if (error) throw error;
      setSuccessMsg('Product updated!');
      setEditingProduct(null);
    } catch { setErrorMsg('Failed to update product.'); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    setErrorMsg(''); setSuccessMsg('');
    try {
      const { error } = await deleteProduct(id);
      if (error) throw error;
      setSuccessMsg('Product deleted.');
    } catch { setErrorMsg('Failed to delete product.'); }
  };

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
    if (!newCategoryName.trim()) { setErrorMsg('Category name cannot be empty.'); return; }
    try {
      const { error } = await addCategory({ name: newCategoryName.trim() } as Partial<Category>);
      if (error) throw error;
      setSuccessMsg(`Category "${newCategoryName.trim()}" added!`);
      setNewCategoryName('');
    } catch { setErrorMsg('Failed to add category. Names must be unique.'); }
  };

  const handleEditCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
    if (!editingCategory?.name.trim()) { setErrorMsg('Category name cannot be empty.'); return; }
    try {
      const { error } = await updateCategory(editingCategory.id, editingCategory.name.trim());
      if (error) throw error;
      setSuccessMsg('Category updated!');
      setEditingCategory(null);
    } catch { setErrorMsg('Failed to update category.'); }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      const { error } = await deleteCategory(id);
      if (error) throw error;
      setSuccessMsg(`Category "${name}" deleted.`);
    } catch { setErrorMsg('Failed to delete category.'); }
  };

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    setErrorMsg(''); setSuccessMsg('');
    try {
      const { error } = await updateOrderStatus(orderId, nextStatus);
      if (error) throw error;
      setSuccessMsg(`Order status updated to "${nextStatus}"!`);
    } catch { setErrorMsg('Failed to update order status.'); }
  };

  const handleAddBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
    if (!newBanner.image) { setErrorMsg('Please upload or enter a banner image.'); return; }
    try {
      const { error } = await addBanner({
        title: newBanner.title || 'PROMOTIONAL OFFER',
        discount: newBanner.discount || 'SPECIAL DEAL',
        tagline: newBanner.tagline || '',
        bgSplitLeft: newBanner.bgSplitLeft || '#991b1b',
        bgSplitRight: newBanner.bgSplitRight || '#0a0a0a',
        image: newBanner.image,
      } as Partial<Banner>);
      if (error) throw error;
      setSuccessMsg('Banner slide added!');
      setNewBanner({ ...BLANK_BANNER });
      setIsAddBannerFormOpen(false);
    } catch { setErrorMsg('Failed to add banner.'); }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Delete this banner slide?')) return;
    try {
      const { error } = await deleteBanner(id);
      if (error) throw error;
      setSuccessMsg('Banner deleted.');
    } catch { setErrorMsg('Failed to delete banner.'); }
  };

  const inputCls = 'px-3 py-2 text-xs border border-brand-cream-dark rounded bg-white outline-none focus:border-brand-brown font-sans';
  const labelCls = 'text-[9px] font-bold text-brand-dark/50 uppercase tracking-wider';

  // Admin Login Guard (backup — middleware handles server-side protection)
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-brand-cream/15 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md bg-white border border-brand-cream-dark rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <Database className="w-10 h-10 text-brand-brown mx-auto mb-2" />
            <h1 className="font-serif text-xl font-bold tracking-widest text-brand-dark uppercase">Admin Portal</h1>
            <p className="font-sans text-[10px] text-brand-dark/45 font-bold tracking-widest uppercase mt-1">Enter your administrator credentials.</p>
          </div>
          {authError && <div className="p-3 bg-red-50 text-red-600 rounded text-xs font-semibold tracking-wider text-center mb-5">{authError}</div>}
          <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className={labelCls}>Admin Phone or Email</label>
              <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls + ' w-full'} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Admin Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls + ' w-full'} />
            </div>
            <button type="submit" disabled={authLoading} className="w-full mt-6 py-3.5 rounded bg-brand-brown hover:bg-brand-brown-dark disabled:bg-brand-brown/40 text-white text-[11px] font-bold tracking-[0.2em] uppercase transition-colors cursor-pointer">
              {authLoading ? 'VERIFYING...' : 'ENTER ADMIN CONSOLE'}
            </button>
          </form>
          <div className="mt-6 text-center border-t border-brand-cream-dark/60 pt-4">
            <button onClick={() => router.push('/')} className="text-[10px] font-bold tracking-widest text-brand-dark/50 hover:text-brand-brown uppercase transition-colors">Back to Store</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream/10 pb-16">

      {/* Admin Navbar */}
      <nav className="bg-white border-b border-brand-cream-dark sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/')}>
            <Image src="/ATTIZ.png" alt="ATTIZ Admin" width={80} height={32} style={{ width: 'auto', height: '2rem' }} className="object-contain" />
            <span className="bg-brand-dark text-white text-[8px] font-bold tracking-widest px-2.5 py-1 rounded uppercase">Admin Console</span>
          </div>
          <div className="flex items-center space-x-6">
            <span className="font-sans text-[10px] font-bold tracking-widest text-brand-dark/60 uppercase">Hello, {user.first_name}</span>
            <button onClick={() => { logout(); router.push('/'); }} className="flex items-center space-x-1.5 text-red-600 hover:text-red-800 text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer">
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">

        {errorMsg && <div className="mb-6 p-3.5 bg-red-50 text-red-600 border border-red-200 rounded text-xs font-semibold tracking-wider text-center">{errorMsg}</div>}
        {successMsg && <div className="mb-6 p-3.5 bg-green-50 text-brand-brown border border-brand-cream-dark rounded text-xs font-semibold tracking-wider text-center">{successMsg}</div>}

        {/* Tab Bar */}
        <div className="flex items-center space-x-4 border-b border-brand-cream-dark mb-8 overflow-x-auto">
          {([
            { key: 'products', label: 'Products Inventory', icon: <Package className="w-4 h-4" /> },
            { key: 'categories', label: 'Categories Management', icon: <Tags className="w-4 h-4" /> },
            { key: 'orders', label: 'Customer Orders', icon: <ClipboardList className="w-4 h-4" /> },
            { key: 'banners', label: 'Hero Banners', icon: <ImageIcon className="w-4 h-4" /> },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 pb-4 text-xs font-bold tracking-widest uppercase border-b-2 transition-colors cursor-pointer whitespace-nowrap ${activeTab === tab.key ? 'border-brand-brown text-brand-brown' : 'border-transparent text-brand-dark/45 hover:text-brand-brown'}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="font-serif text-lg text-brand-dark uppercase">Products</h3>
                <p className="text-[10px] text-brand-dark/50 uppercase tracking-widest">Create and modify shop garments</p>
              </div>
              <button onClick={() => setIsAddFormOpen(!isAddFormOpen)} className="flex items-center space-x-1.5 px-6 py-2.5 bg-brand-brown hover:bg-brand-brown-dark text-white rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer">
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {isAddFormOpen && (
              <form onSubmit={handleAddProductSubmit} className="bg-white border border-brand-cream-dark rounded-xl p-6 shadow-sm space-y-4">
                <h4 className="font-serif text-sm text-brand-dark uppercase tracking-wider pb-2 border-b border-brand-cream-dark">Add New Premium Garment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className={labelCls}>Product Title</label>
                    <input required value={newProduct.title} onChange={(e) => setNewProduct((p) => ({ ...p, title: e.target.value }))} className={inputCls} placeholder="e.g. Premium Cotton Polo" />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className={labelCls}>Price (₹)</label>
                    <input required type="number" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))} className={inputCls} placeholder="e.g. 799" />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className={labelCls}>Stock Quantity</label>
                    <input required type="number" value={newProduct.stock} onChange={(e) => setNewProduct((p) => ({ ...p, stock: e.target.value }))} className={inputCls} placeholder="e.g. 100" />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className={labelCls}>Sizes (comma-separated)</label>
                    <input value={newProduct.sizes} onChange={(e) => setNewProduct((p) => ({ ...p, sizes: e.target.value }))} className={inputCls} placeholder="S,M,L,XL,XXL" />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className={labelCls}>Colors (comma-separated)</label>
                    <input value={newProduct.colors} onChange={(e) => setNewProduct((p) => ({ ...p, colors: e.target.value }))} className={inputCls} placeholder="Black,White,Navy" />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className={labelCls}>Parent Category</label>
                    {!isCustomParent ? (
                      <div className="flex gap-2">
                        <select value={newProduct.parent_category} onChange={(e) => handleParentCategoryChange(e.target.value)} className={inputCls + ' flex-1'}>
                          {parentsList.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <button type="button" onClick={() => setIsCustomParent(true)} className="text-[9px] text-brand-brown font-bold tracking-wider uppercase border border-brand-cream-dark px-2 rounded hover:bg-brand-cream cursor-pointer">Custom</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input value={customParent} onChange={(e) => setCustomParent(e.target.value)} className={inputCls + ' flex-1'} placeholder="Custom parent category" />
                        <button type="button" onClick={() => setIsCustomParent(false)} className="text-[9px] text-brand-brown font-bold tracking-wider uppercase border border-brand-cream-dark px-2 rounded hover:bg-brand-cream cursor-pointer">Preset</button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className={labelCls}>Secondary Category</label>
                    {!isCustomSecondary ? (
                      <div className="flex gap-2">
                        <select value={newProduct.secondary_category} onChange={(e) => setNewProduct((p) => ({ ...p, secondary_category: e.target.value, category: e.target.value }))} className={inputCls + ' flex-1'}>
                          {secondariesList.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button type="button" onClick={() => setIsCustomSecondary(true)} className="text-[9px] text-brand-brown font-bold tracking-wider uppercase border border-brand-cream-dark px-2 rounded hover:bg-brand-cream cursor-pointer">Custom</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input value={customSecondary} onChange={(e) => setCustomSecondary(e.target.value)} className={inputCls + ' flex-1'} placeholder="Custom secondary category" />
                        <button type="button" onClick={() => setIsCustomSecondary(false)} className="text-[9px] text-brand-brown font-bold tracking-wider uppercase border border-brand-cream-dark px-2 rounded hover:bg-brand-cream cursor-pointer">Preset</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className={labelCls}>Product Images</label>
                  <label className="flex items-center space-x-2 cursor-pointer border border-dashed border-brand-cream-dark rounded px-4 py-3 hover:bg-brand-cream/20 transition-colors w-max">
                    <Upload className="w-4 h-4 text-brand-brown" />
                    <span className="text-[10px] font-bold text-brand-dark/60 tracking-widest uppercase">
                      {additionalImagesUploading ? 'Uploading...' : 'Upload Images'}
                    </span>
                    <input type="file" multiple accept="image/*" onChange={handleProductImagesUpload} className="hidden" disabled={additionalImagesUploading} />
                  </label>
                  {newProductAllImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {newProductAllImages.map((url, i) => (
                        <div key={i} className="relative w-16 h-20 border border-brand-cream-dark rounded overflow-hidden bg-brand-cream">
                          <Image src={url} alt={`img${i}`} fill className="object-cover" sizes="64px" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <label className={labelCls}>Size Chart Image</label>
                  <label className="flex items-center space-x-2 cursor-pointer border border-dashed border-brand-cream-dark rounded px-4 py-3 hover:bg-brand-cream/20 transition-colors w-max">
                    <Upload className="w-4 h-4 text-brand-brown" />
                    <span className="text-[10px] font-bold text-brand-dark/60 tracking-widest uppercase">
                      {sizeChartUploading ? 'Uploading...' : 'Upload Size Chart'}
                    </span>
                    <input type="file" accept="image/*" onChange={handleSizeChartUpload} className="hidden" disabled={sizeChartUploading} />
                  </label>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className={labelCls}>Description</label>
                  <textarea value={newProduct.description} onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))} className={inputCls + ' h-20 resize-none'} placeholder="Product description..." />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className={labelCls}>Specifications</label>
                  <textarea value={newProduct.specifications} onChange={(e) => setNewProduct((p) => ({ ...p, specifications: e.target.value }))} className={inputCls + ' h-16 resize-none'} placeholder="Material, weight, etc." />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className={labelCls}>Wash Care</label>
                  <textarea value={newProduct.wash_care} onChange={(e) => setNewProduct((p) => ({ ...p, wash_care: e.target.value }))} className={inputCls + ' h-16 resize-none'} placeholder="Washing instructions..." />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="px-6 py-2.5 bg-brand-brown hover:bg-brand-brown-dark text-white rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer">Add Product</button>
                  <button type="button" onClick={() => setIsAddFormOpen(false)} className="px-6 py-2.5 border border-brand-cream-dark text-brand-dark hover:bg-brand-cream rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer">Cancel</button>
                </div>
              </form>
            )}

            {editingProduct && (
              <form onSubmit={handleEditProductSubmit} className="bg-white border border-brand-cream-dark rounded-xl p-6 shadow-sm space-y-4">
                <h4 className="font-serif text-sm text-brand-dark uppercase tracking-wider pb-2 border-b border-brand-cream-dark">Edit Product</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className={labelCls}>Product Title</label>
                    <input required value={String(editingProduct.title || '')} onChange={(e) => setEditingProduct((p) => p ? { ...p, title: e.target.value } : p)} className={inputCls} />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className={labelCls}>Price (₹)</label>
                    <input required type="number" step="0.01" value={editingProduct.price} onChange={(e) => setEditingProduct((p) => p ? { ...p, price: e.target.value } : p)} className={inputCls} />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className={labelCls}>Stock</label>
                    <input required type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct((p) => p ? { ...p, stock: e.target.value } : p)} className={inputCls} />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className={labelCls}>Sizes</label>
                    <input value={String(editingProduct.sizes || '')} onChange={(e) => setEditingProduct((p) => p ? { ...p, sizes: e.target.value } : p)} className={inputCls} />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className={labelCls}>Colors</label>
                    <input value={String(editingProduct.colors || '')} onChange={(e) => setEditingProduct((p) => p ? { ...p, colors: e.target.value } : p)} className={inputCls} />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className={labelCls}>Parent Category</label>
                    {!isEditCustomParent ? (
                      <div className="flex gap-2">
                        <select value={String(editingProduct.parent_category || 'MEN')} onChange={(e) => handleEditParentCategoryChange(e.target.value)} className={inputCls + ' flex-1'}>
                          {parentsList.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <button type="button" onClick={() => setEditIsCustomParent(true)} className="text-[9px] text-brand-brown font-bold tracking-wider uppercase border border-brand-cream-dark px-2 rounded hover:bg-brand-cream cursor-pointer">Custom</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input value={editCustomParent} onChange={(e) => setEditCustomParent(e.target.value)} className={inputCls + ' flex-1'} placeholder="Custom parent category" />
                        <button type="button" onClick={() => setEditIsCustomParent(false)} className="text-[9px] text-brand-brown font-bold tracking-wider uppercase border border-brand-cream-dark px-2 rounded hover:bg-brand-cream cursor-pointer">Preset</button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className={labelCls}>Secondary Category</label>
                    {!isEditCustomSecondary ? (
                      <div className="flex gap-2">
                        <select value={String(editingProduct.secondary_category || '')} onChange={(e) => setEditingProduct((p) => p ? { ...p, secondary_category: e.target.value, category: e.target.value } : p)} className={inputCls + ' flex-1'}>
                          {editSecondariesList.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button type="button" onClick={() => setEditIsCustomSecondary(true)} className="text-[9px] text-brand-brown font-bold tracking-wider uppercase border border-brand-cream-dark px-2 rounded hover:bg-brand-cream cursor-pointer">Custom</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input value={editCustomSecondary} onChange={(e) => setEditCustomSecondary(e.target.value)} className={inputCls + ' flex-1'} placeholder="Custom secondary category" />
                        <button type="button" onClick={() => setEditIsCustomSecondary(false)} className="text-[9px] text-brand-brown font-bold tracking-wider uppercase border border-brand-cream-dark px-2 rounded hover:bg-brand-cream cursor-pointer">Preset</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className={labelCls}>Product Images</label>
                  <label className="flex items-center space-x-2 cursor-pointer border border-dashed border-brand-cream-dark rounded px-4 py-3 hover:bg-brand-cream/20 transition-colors w-max">
                    <Upload className="w-4 h-4 text-brand-brown" />
                    <span className="text-[10px] font-bold text-brand-dark/60 tracking-widest uppercase">
                      {editAdditionalImagesUploading ? 'Uploading...' : 'Upload / Replace Images'}
                    </span>
                    <input type="file" multiple accept="image/*" onChange={handleEditProductImagesUpload} className="hidden" disabled={editAdditionalImagesUploading} />
                  </label>
                  {editProductAllImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {editProductAllImages.map((url, i) => (
                        <div key={i} className="relative w-16 h-20 border border-brand-cream-dark rounded overflow-hidden bg-brand-cream">
                          <Image src={url as string} alt={`edit-img${i}`} fill className="object-cover" sizes="64px" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <label className={labelCls}>Size Chart</label>
                  <label className="flex items-center space-x-2 cursor-pointer border border-dashed border-brand-cream-dark rounded px-4 py-3 hover:bg-brand-cream/20 transition-colors w-max">
                    <Upload className="w-4 h-4 text-brand-brown" />
                    <span className="text-[10px] font-bold text-brand-dark/60 tracking-widest uppercase">
                      {editSizeChartUploading ? 'Uploading...' : 'Replace Size Chart'}
                    </span>
                    <input type="file" accept="image/*" onChange={handleEditSizeChartUpload} className="hidden" disabled={editSizeChartUploading} />
                  </label>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className={labelCls}>Description</label>
                  <textarea value={String(editingProduct.description || '')} onChange={(e) => setEditingProduct((p) => p ? { ...p, description: e.target.value } : p)} className={inputCls + ' h-20 resize-none'} />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className={labelCls}>Specifications</label>
                  <textarea value={String(editingProduct.specifications || '')} onChange={(e) => setEditingProduct((p) => p ? { ...p, specifications: e.target.value } : p)} className={inputCls + ' h-16 resize-none'} />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className={labelCls}>Wash Care</label>
                  <textarea value={String(editingProduct.wash_care || '')} onChange={(e) => setEditingProduct((p) => p ? { ...p, wash_care: e.target.value } : p)} className={inputCls + ' h-16 resize-none'} />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="px-6 py-2.5 bg-brand-brown hover:bg-brand-brown-dark text-white rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer">Save Changes</button>
                  <button type="button" onClick={() => setEditingProduct(null)} className="px-6 py-2.5 border border-brand-cream-dark text-brand-dark hover:bg-brand-cream rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer">Cancel</button>
                </div>
              </form>
            )}

            {dbLoading ? (
              <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-brand-brown border-t-transparent animate-spin" /></div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-brand-cream-dark">
                <table className="w-full text-xs">
                  <thead className="bg-brand-cream/30 text-brand-dark/60 uppercase tracking-widest font-bold text-[9px]">
                    <tr>
                      <th className="px-4 py-3 text-left">Image</th>
                      <th className="px-4 py-3 text-left">Title</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Price</th>
                      <th className="px-4 py-3 text-left">Stock</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-cream-dark">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-brand-cream/10 transition-colors">
                        <td className="px-4 py-3">
                          <div className="relative w-10 h-12 bg-brand-cream rounded border border-brand-cream-dark overflow-hidden">
                            {prod.image && <Image src={prod.image} alt={prod.title} fill className="object-cover" sizes="40px" />}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-brand-dark max-w-[200px] truncate">{prod.title}</td>
                        <td className="px-4 py-3 text-brand-dark/60">{prod.category}</td>
                        <td className="px-4 py-3 font-bold text-brand-brown">₹{parseFloat(String(prod.price)).toFixed(0)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${prod.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                            {prod.stock > 0 ? prod.stock : 'Out'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <button onClick={() => handleStartEditProduct(prod)} className="p-1.5 text-brand-dark/50 hover:text-brand-brown transition-colors cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteProduct(prod.id)} className="p-1.5 text-brand-dark/50 hover:text-red-500 transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {products.length === 0 && (
                  <div className="text-center py-10 text-brand-dark/40 text-xs font-bold tracking-widest uppercase">No products yet. Add your first product above.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <h3 className="font-serif text-lg text-brand-dark uppercase">Categories</h3>
            <form onSubmit={handleAddCategorySubmit} className="flex gap-3">
              <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="New category name" className={inputCls + ' flex-1'} />
              <button type="submit" className="px-6 py-2.5 bg-brand-brown hover:bg-brand-brown-dark text-white rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer">Add</button>
            </form>
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between bg-white border border-brand-cream-dark rounded-lg px-4 py-3">
                  {editingCategory?.id === cat.id ? (
                    <form onSubmit={handleEditCategorySubmit} className="flex gap-2 flex-1 mr-4">
                      <input value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} className={inputCls + ' flex-1'} autoFocus />
                      <button type="submit" className="px-4 py-1.5 bg-brand-brown text-white rounded text-[9px] font-bold tracking-widest uppercase cursor-pointer"><CheckCircle className="w-3.5 h-3.5" /></button>
                    </form>
                  ) : (
                    <span className="font-sans text-xs font-semibold text-brand-dark">{cat.name}</span>
                  )}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button onClick={() => setEditingCategory(editingCategory?.id === cat.id ? null : { id: cat.id, name: cat.name })} className="p-1.5 text-brand-dark/50 hover:text-brand-brown transition-colors cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="p-1.5 text-brand-dark/50 hover:text-red-500 transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && <div className="text-center py-10 text-brand-dark/40 text-xs font-bold tracking-widest uppercase">No categories yet.</div>}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h3 className="font-serif text-lg text-brand-dark uppercase">Customer Orders</h3>
            {dbLoading ? (
              <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-brand-brown border-t-transparent animate-spin" /></div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10 text-brand-dark/40 text-xs font-bold tracking-widest uppercase">No orders yet.</div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white border border-brand-cream-dark rounded-xl overflow-hidden">
                    <div className="px-5 py-3 bg-brand-cream/15 border-b border-brand-cream-dark flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-brand-dark">#{order.id.slice(0, 8)}</span>
                        <span className="text-brand-dark/45 text-[9px] ml-3 font-semibold">{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs font-bold text-brand-dark">{order.customer_name} · {order.customer_phone}</div>
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="text-[10px] font-bold tracking-wider border border-brand-cream-dark rounded px-2 py-1 bg-white outline-none focus:border-brand-brown cursor-pointer"
                        >
                          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="px-5 py-3 flex flex-wrap justify-between items-start gap-4">
                      <div className="space-y-1">
                        {order.items?.map((item, i) => (
                          <div key={i} className="text-[10px] text-brand-dark/70 font-semibold">{item.title} × {item.quantity}</div>
                        ))}
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-brand-dark/45 font-bold tracking-wider uppercase">Total</div>
                        <div className="font-bold text-brand-brown text-sm">₹{order.total_price.toFixed(0)}</div>
                        <div className="text-[9px] text-brand-dark/50 mt-1 max-w-xs">{order.shipping_address}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BANNERS TAB */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg text-brand-dark uppercase">Hero Banners</h3>
              <button onClick={() => setIsAddBannerFormOpen(!isAddBannerFormOpen)} className="flex items-center space-x-1.5 px-6 py-2.5 bg-brand-brown hover:bg-brand-brown-dark text-white rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer">
                <Plus className="w-4 h-4" />
                <span>Add Banner</span>
              </button>
            </div>

            {isAddBannerFormOpen && (
              <form onSubmit={handleAddBannerSubmit} className="bg-white border border-brand-cream-dark rounded-xl p-6 shadow-sm space-y-4">
                <h4 className="font-serif text-sm text-brand-dark uppercase tracking-wider pb-2 border-b border-brand-cream-dark">Add Banner Slide</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className={labelCls}>Title</label>
                    <input value={newBanner.title} onChange={(e) => setNewBanner((b) => ({ ...b, title: e.target.value }))} className={inputCls} placeholder="e.g. SUMMER SALE" />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className={labelCls}>Discount Text</label>
                    <input value={newBanner.discount} onChange={(e) => setNewBanner((b) => ({ ...b, discount: e.target.value }))} className={inputCls} placeholder="e.g. FLAT 30% OFF" />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className={labelCls}>Tagline</label>
                    <input value={newBanner.tagline} onChange={(e) => setNewBanner((b) => ({ ...b, tagline: e.target.value }))} className={inputCls} placeholder="e.g. Limited Time Offer" />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className={labelCls}>Left BG Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={newBanner.bgSplitLeft} onChange={(e) => setNewBanner((b) => ({ ...b, bgSplitLeft: e.target.value }))} className="w-10 h-9 border border-brand-cream-dark rounded cursor-pointer" />
                      <input value={newBanner.bgSplitLeft} onChange={(e) => setNewBanner((b) => ({ ...b, bgSplitLeft: e.target.value }))} className={inputCls + ' flex-1'} placeholder="#991b1b" />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className={labelCls}>Right BG Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={newBanner.bgSplitRight} onChange={(e) => setNewBanner((b) => ({ ...b, bgSplitRight: e.target.value }))} className="w-10 h-9 border border-brand-cream-dark rounded cursor-pointer" />
                      <input value={newBanner.bgSplitRight} onChange={(e) => setNewBanner((b) => ({ ...b, bgSplitRight: e.target.value }))} className={inputCls + ' flex-1'} placeholder="#0a0a0a" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className={labelCls}>Banner Image</label>
                  <label className="flex items-center space-x-2 cursor-pointer border border-dashed border-brand-cream-dark rounded px-4 py-3 hover:bg-brand-cream/20 transition-colors w-max">
                    <Upload className="w-4 h-4 text-brand-brown" />
                    <span className="text-[10px] font-bold text-brand-dark/60 tracking-widest uppercase">
                      {bannerImageUploading ? 'Uploading...' : 'Upload Banner Image'}
                    </span>
                    <input type="file" accept="image/*" onChange={handleBannerImageUpload} className="hidden" disabled={bannerImageUploading} />
                  </label>
                  {newBanner.image && (
                    <div className="relative w-32 h-20 border border-brand-cream-dark rounded overflow-hidden">
                      <Image src={newBanner.image} alt="banner preview" fill className="object-cover" sizes="128px" />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="px-6 py-2.5 bg-brand-brown hover:bg-brand-brown-dark text-white rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer">Add Banner</button>
                  <button type="button" onClick={() => setIsAddBannerFormOpen(false)} className="px-6 py-2.5 border border-brand-cream-dark text-brand-dark hover:bg-brand-cream rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer">Cancel</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map((banner) => (
                <div key={banner.id} className="relative bg-white border border-brand-cream-dark rounded-xl overflow-hidden shadow-sm group">
                  <div className="relative h-32" style={{ backgroundColor: banner.bgSplitLeft }}>
                    {banner.image && <Image src={banner.image} alt={banner.title} fill className="object-cover opacity-80" sizes="(max-width: 640px) 100vw, 33vw" />}
                  </div>
                  <div className="p-4">
                    <p className="font-sans text-xs font-bold text-brand-dark truncate">{banner.title}</p>
                    <p className="font-sans text-[10px] text-brand-brown font-bold">{banner.discount}</p>
                    <p className="font-sans text-[9px] text-brand-dark/50 mt-0.5 truncate">{banner.tagline}</p>
                  </div>
                  <button onClick={() => handleDeleteBanner(banner.id)} className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors cursor-pointer shadow-sm">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {banners.length === 0 && (
                <div className="col-span-full text-center py-10 text-brand-dark/40 text-xs font-bold tracking-widest uppercase">No banners yet. Add your first banner above.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
