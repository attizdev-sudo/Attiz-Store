'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Database, Plus, Trash2, Edit3, CheckCircle, Package,
  ClipboardList, AlertCircle, LogOut, Tags, Upload, Image as ImageIcon,
  ArrowLeft, ArrowRight, Search, Star, X, ChevronUp, ChevronDown, Check, Eye
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

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<typeof BLANK_PRODUCT>({ ...BLANK_PRODUCT });
  const [editingProduct, setEditingProduct] = useState<EditableProduct | null>(null);

  // Stepper states
  const [addStep, setAddStep] = useState(1);
  const [editStep, setEditStep] = useState(1);

  // Custom Sizes & Colors Inputs
  const [customSize, setCustomSize] = useState('');
  const [editCustomSize, setEditCustomSize] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [editColorInput, setEditColorInput] = useState('');

  // Search & Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'title' | 'price' | 'stock'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

  const sizesList = newProduct.sizes.split(',').map(s => s.trim()).filter(Boolean);
  const editSizesList = editingProduct ? String(editingProduct.sizes || '').split(',').map(s => s.trim()).filter(Boolean) : [];

  const colorsList = newProduct.colors.split(',').map(c => c.trim()).filter(Boolean);
  const editColorsList = editingProduct ? String(editingProduct.colors || '').split(',').map(c => c.trim()).filter(Boolean) : [];

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
    
    const parentsList = Object.keys(CATEGORIES_MAP);
    const isParentPreset = parentsList.includes(normParent);
    
    const secondariesList = CATEGORIES_MAP[normParent] || [];
    const isSecondaryPreset = isParentPreset && secondariesList.includes(normSecondary);

    setEditingProduct({ 
      ...prod, 
      images: prod.images || '', 
      parent_category: normParent, 
      secondary_category: normSecondary, 
      subcategory: '' 
    });

    if (isParentPreset) {
      setEditIsCustomParent(false);
      setEditCustomParent('');
    } else {
      setEditIsCustomParent(true);
      setEditCustomParent(prod.parent_category || '');
    }

    if (isSecondaryPreset) {
      setEditIsCustomSecondary(false);
      setEditCustomSecondary('');
    } else {
      setEditIsCustomSecondary(true);
      setEditCustomSecondary(normSecondary);
    }

    setEditStep(1);
    setEditCustomSize('');
    setEditColorInput('');
  };

  // Helper validation for steps
  const isStepValid = (step: number, isEdit: boolean) => {
    if (isEdit) {
      if (!editingProduct) return false;
      const parentVal = isEditCustomParent ? editCustomParent.trim() : String(editingProduct.parent_category || '');
      const secondaryVal = isEditCustomSecondary ? editCustomSecondary.trim() : String(editingProduct.secondary_category || '');
      if (step === 1) {
        return String(editingProduct.title || '').trim().length > 0 && parentVal.length > 0 && secondaryVal.length > 0;
      }
      if (step === 2) {
        const priceNum = parseFloat(String(editingProduct.price));
        const stockNum = parseInt(String(editingProduct.stock), 10);
        return !isNaN(priceNum) && priceNum > 0 && !isNaN(stockNum) && stockNum >= 0 && (editingProduct.sizes || '').trim().length > 0;
      }
      if (step === 3) {
        return !!editingProduct.image;
      }
      return true;
    } else {
      const parentVal = isCustomParent ? customParent.trim() : newProduct.parent_category;
      const secondaryVal = isCustomSecondary ? customSecondary.trim() : newProduct.secondary_category;
      if (step === 1) {
        return newProduct.title.trim().length > 0 && parentVal.length > 0 && secondaryVal.length > 0;
      }
      if (step === 2) {
        const priceNum = parseFloat(String(newProduct.price));
        const stockNum = parseInt(String(newProduct.stock), 10);
        return !isNaN(priceNum) && priceNum > 0 && !isNaN(stockNum) && stockNum >= 0 && newProduct.sizes.trim().length > 0;
      }
      if (step === 3) {
        return !!newProduct.image;
      }
      return true;
    }
  };

  // Size toggle logic
  const toggleSize = (size: string, isEdit: boolean) => {
    if (isEdit) {
      setEditingProduct((prev) => {
        if (!prev) return prev;
        const currentList = String(prev.sizes || '').split(',').map(s => s.trim()).filter(Boolean);
        const nextList = currentList.includes(size) ? currentList.filter(s => s !== size) : [...currentList, size];
        return { ...prev, sizes: nextList.join(',') };
      });
    } else {
      setNewProduct((prev) => {
        const currentList = prev.sizes.split(',').map(s => s.trim()).filter(Boolean);
        const nextList = currentList.includes(size) ? currentList.filter(s => s !== size) : [...currentList, size];
        return { ...prev, sizes: nextList.join(',') };
      });
    }
  };

  // Add custom size logic
  const addCustomSizeTag = (e: React.FormEvent, isEdit: boolean) => {
    e.preventDefault();
    if (isEdit) {
      const val = editCustomSize.trim();
      if (!val || !editingProduct) return;
      const currentList = String(editingProduct.sizes || '').split(',').map(s => s.trim()).filter(Boolean);
      if (!currentList.includes(val)) {
        setEditingProduct({ ...editingProduct, sizes: [...currentList, val].join(',') });
      }
      setEditCustomSize('');
    } else {
      const val = customSize.trim();
      if (!val) return;
      const currentList = newProduct.sizes.split(',').map(s => s.trim()).filter(Boolean);
      if (!currentList.includes(val)) {
        setNewProduct({ ...newProduct, sizes: [...currentList, val].join(',') });
      }
      setCustomSize('');
    }
  };

  // Color tag logic
  const addColorTag = (e: React.KeyboardEvent<HTMLInputElement>, isEdit: boolean) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isEdit) {
        const val = editColorInput.trim();
        if (!val || !editingProduct) return;
        const currentList = String(editingProduct.colors || '').split(',').map(c => c.trim()).filter(Boolean);
        if (!currentList.includes(val)) {
          setEditingProduct({ ...editingProduct, colors: [...currentList, val].join(',') });
        }
        setEditColorInput('');
      } else {
        const val = colorInput.trim();
        if (!val) return;
        const currentList = newProduct.colors.split(',').map(c => c.trim()).filter(Boolean);
        if (!currentList.includes(val)) {
          setNewProduct({ ...newProduct, colors: [...currentList, val].join(',') });
        }
        setColorInput('');
      }
    }
  };

  const removeColorTag = (color: string, isEdit: boolean) => {
    if (isEdit) {
      if (!editingProduct) return;
      const currentList = String(editingProduct.colors || '').split(',').map(c => c.trim()).filter(Boolean);
      setEditingProduct({ ...editingProduct, colors: currentList.filter(c => c !== color).join(',') });
    } else {
      const currentList = newProduct.colors.split(',').map(c => c.trim()).filter(Boolean);
      setNewProduct({ ...newProduct, colors: currentList.filter(c => c !== color).join(',') });
    }
  };

  // Media Management helpers
  const makeImagePrimary = (index: number, isEdit: boolean) => {
    if (isEdit) {
      setEditingProduct((prev) => {
        if (!prev) return prev;
        const all = [prev.image, ...String(prev.images || '').split(',').filter(Boolean)].filter(Boolean);
        if (index >= all.length) return prev;
        const selected = all[index];
        const remaining = all.filter((_, i) => i !== index);
        return { ...prev, image: selected as string, images: remaining.join(',') };
      });
    } else {
      setNewProduct((prev) => {
        const all = [prev.image, ...prev.images.split(',').filter(Boolean)].filter(Boolean);
        if (index >= all.length) return prev;
        const selected = all[index];
        const remaining = all.filter((_, i) => i !== index);
        return { ...prev, image: selected, images: remaining.join(',') };
      });
    }
  };

  const deleteProductImage = (index: number, isEdit: boolean) => {
    if (isEdit) {
      setEditingProduct((prev) => {
        if (!prev) return prev;
        const all = [prev.image, ...String(prev.images || '').split(',').filter(Boolean)].filter(Boolean);
        const remaining = all.filter((_, i) => i !== index);
        return { ...prev, image: remaining[0] || '', images: remaining.slice(1).join(',') };
      });
    } else {
      setNewProduct((prev) => {
        const all = [prev.image, ...prev.images.split(',').filter(Boolean)].filter(Boolean);
        const remaining = all.filter((_, i) => i !== index);
        return { ...prev, image: remaining[0] || '', images: remaining.slice(1).join(',') };
      });
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addStep < 4) return;
    setErrorMsg(''); setSuccessMsg('');
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
      setAddStep(1);
    } catch { setErrorMsg('Failed to add product.'); }
  };

  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editStep < 4) return;
    setErrorMsg(''); setSuccessMsg('');
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

  const toggleSort = (field: 'title' | 'price' | 'stock') => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter & Sort products list
  const filteredAndSortedProducts = products
    .filter((prod) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        prod.title.toLowerCase().includes(q) ||
        prod.category.toLowerCase().includes(q) ||
        (prod.parent_category || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      if (sortField === 'title') {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      } else if (sortField === 'price') {
        valA = parseFloat(String(a.price)) || 0;
        valB = parseFloat(String(b.price)) || 0;
      } else if (sortField === 'stock') {
        valA = parseInt(String(a.stock)) || 0;
        valB = parseInt(String(b.stock)) || 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const inputCls = 'px-3 py-2 text-xs border border-brand-cream-dark rounded bg-white outline-none focus:border-brand-brown font-sans w-full transition-all';
  const labelCls = 'text-[9px] font-bold text-brand-dark/50 uppercase tracking-wider block mb-1';

  if (!mounted) {
    return (
      <div className="min-h-screen bg-brand-cream/10 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-brown border-t-transparent animate-spin" />
      </div>
    );
  }

  // Admin Login Guard
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
              <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Admin Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
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

  // Horizontal Stepper Bar Component
  const RenderStepperBar = ({ currentStep, setStep, isEdit }: { currentStep: number, setStep: React.Dispatch<React.SetStateAction<number>>, isEdit: boolean }) => {
    const steps = [
      { num: 1, label: 'Identity' },
      { num: 2, label: 'Attributes' },
      { num: 3, label: 'Media Gallery' },
      { num: 4, label: 'Details' }
    ];

    return (
      <div className="flex items-center justify-between border-b border-brand-cream-dark/60 pb-5 mb-6">
        {steps.map((st, index) => {
          const isCompleted = isStepValid(st.num, isEdit);
          const isActive = currentStep === st.num;

          return (
            <React.Fragment key={st.num}>
              <button
                type="button"
                onClick={() => {
                  // Let user navigate backwards, or forward if previous step is valid
                  if (st.num < currentStep || Array.from({ length: st.num - 1 }, (_, i) => i + 1).every(s => isStepValid(s, isEdit))) {
                    setStep(st.num);
                  }
                }}
                className="flex items-center space-x-2.5 focus:outline-none group cursor-pointer"
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-all border ${
                  isActive
                    ? 'bg-brand-brown border-brand-brown text-white ring-4 ring-brand-brown/10'
                    : isCompleted
                      ? 'bg-green-50 border-green-300 text-green-700'
                      : 'bg-white border-brand-cream-dark text-brand-dark/40 group-hover:border-brand-brown/50 group-hover:text-brand-brown'
                }`}>
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : st.num}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${
                  isActive ? 'text-brand-brown' : 'text-brand-dark/45 group-hover:text-brand-brown'
                }`}>
                  {st.label}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div className={`h-px flex-1 mx-3 ${
                  isStepValid(st.num, isEdit) ? 'bg-green-300' : 'bg-brand-cream-dark/50'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // Preview component
  const RenderProductLivePreview = ({ target }: { target: typeof BLANK_PRODUCT | EditableProduct }) => {
    const parentVal = isAddFormOpen 
      ? (isCustomParent ? customParent : newProduct.parent_category)
      : (isEditCustomParent ? editCustomParent : String(editingProduct?.parent_category || ''));
    
    const secondaryVal = isAddFormOpen 
      ? (isCustomSecondary ? customSecondary : newProduct.secondary_category)
      : (isEditCustomSecondary ? editCustomSecondary : String(editingProduct?.secondary_category || ''));

    const displayImage = target.image || 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600';
    const displayTitle = target.title || 'Premium Cotton Tee';
    const displayPrice = target.price ? parseFloat(String(target.price)).toFixed(0) : '0';
    const displayCategory = secondaryVal || 'Round Neck Tees';

    const pSizes = (target.sizes || '').split(',').map(s => s.trim()).filter(Boolean);
    const pColors = (target.colors || '').split(',').map(c => c.trim()).filter(Boolean);

    return (
      <div className="bg-white border border-brand-cream-dark rounded-xl overflow-hidden shadow-xs sticky top-24 transition-all duration-300 hover:shadow-md hidden lg:block h-fit">
        <div className="p-4 bg-brand-cream/15 border-b border-brand-cream-dark flex items-center justify-between">
          <h5 className="font-sans text-[10px] font-bold tracking-widest text-brand-dark/50 uppercase flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>Storefront Preview</span>
          </h5>
          <span className="text-[8px] font-bold bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded uppercase tracking-wider">Live</span>
        </div>
        <div className="p-8 flex items-center justify-center bg-brand-cream/5 border-b border-brand-cream-dark/50">
          <div className="w-full max-w-[200px] bg-white border border-brand-cream-dark rounded-lg overflow-hidden relative transition-all duration-300 hover:shadow-md group">
            <div className="relative aspect-3/4 bg-brand-cream overflow-hidden">
              <img src={displayImage} alt="Cover Preview" className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center shadow-xs text-brand-dark hover:text-brand-brown cursor-pointer transition-colors">
                <span className="text-[10px]">♡</span>
              </div>
            </div>
            <div className="pt-3 pb-4 px-3 flex flex-col justify-between bg-white border-t border-brand-cream-dark/40">
              <div>
                <h6 className="font-sans text-[10px] font-bold tracking-wider text-brand-dark line-clamp-1 group-hover:text-brand-brown transition-colors">
                  {displayTitle}
                </h6>
                <span className="text-[8px] text-brand-dark/40 font-bold tracking-widest uppercase block mt-0.5">
                  Category: {displayCategory}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-sans text-[11px] font-bold text-brand-brown">Rs. {displayPrice}</span>
                <span className="bg-brand-brown text-white text-[7px] font-bold tracking-wider px-2 py-0.5 rounded cursor-pointer hover:bg-brand-brown-dark transition-colors">ADD</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-4 bg-brand-cream/5">
          <div>
            <span className="text-[8px] font-bold text-brand-dark/50 uppercase tracking-widest block mb-1">Available Sizes</span>
            <div className="flex flex-wrap gap-1">
              {pSizes.length > 0 ? (
                pSizes.map((s, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-white border border-brand-cream-dark rounded text-[8px] font-bold text-brand-dark">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-[9px] text-brand-dark/30 italic uppercase">No sizes selected</span>
              )}
            </div>
          </div>
          <div>
            <span className="text-[8px] font-bold text-brand-dark/50 uppercase tracking-widest block mb-1">Colors</span>
            <div className="flex flex-wrap gap-1">
              {pColors.length > 0 ? (
                pColors.map((c, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-white border border-brand-cream-dark rounded text-[8px] font-semibold text-brand-dark/80">
                    {c}
                  </span>
                ))
              ) : (
                <span className="text-[9px] text-brand-dark/30 italic uppercase">No colors added</span>
              )}
            </div>
          </div>
          {target.description && (
            <div className="pt-2 border-t border-brand-cream-dark/50">
              <span className="text-[8px] font-bold text-brand-dark/50 uppercase tracking-widest block mb-1">Description</span>
              <p className="text-[9px] text-brand-dark/70 line-clamp-2 leading-relaxed">{target.description}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-cream/10 pb-16">

      {/* Admin Navbar */}
      <nav className="bg-white border-b border-brand-cream-dark sticky top-0 z-30 shadow-xs">
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
              <button
                onClick={() => {
                  setIsAddFormOpen(!isAddFormOpen);
                  setEditingProduct(null);
                  setAddStep(1);
                  setNewProduct({ ...BLANK_PRODUCT });
                }}
                className="flex items-center space-x-1.5 px-6 py-2.5 bg-brand-brown hover:bg-brand-brown-dark text-white rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {/* ADD PRODUCT FORM (Redesigned with Stepper and Live Preview) */}
            {isAddFormOpen && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <form onSubmit={handleAddProductSubmit} className="lg:col-span-2 bg-white border border-brand-cream-dark rounded-xl p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-brand-cream-dark pb-3">
                    <h4 className="font-serif text-sm text-brand-dark uppercase tracking-wider">Add New Premium Garment</h4>
                    <span className="text-[9px] font-bold text-brand-dark/40 uppercase bg-brand-cream px-2.5 py-1 rounded">Step {addStep} of 4</span>
                  </div>

                  <RenderStepperBar currentStep={addStep} setStep={setAddStep} isEdit={false} />

                  {/* Step 1: Identity & Categories */}
                  {addStep === 1 && (
                    <div className="space-y-5">
                      <div className="flex flex-col">
                        <label className={labelCls}>Product Title</label>
                        <input required value={newProduct.title} onChange={(e) => setNewProduct((p) => ({ ...p, title: e.target.value }))} className={inputCls} placeholder="e.g. Premium Cotton Polo" />
                        <span className="text-[8px] text-brand-dark/40 font-semibold tracking-wider uppercase mt-1">Recommended 35-50 characters for clean layouts. Current: {newProduct.title.length}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="flex flex-col">
                          <label className={labelCls}>Parent Category</label>
                          {!isCustomParent ? (
                            <div className="flex gap-2">
                              <select value={newProduct.parent_category} onChange={(e) => handleParentCategoryChange(e.target.value)} className={inputCls + ' flex-1'}>
                                {parentsList.map((p) => <option key={p} value={p}>{p}</option>)}
                              </select>
                              <button type="button" onClick={() => setIsCustomParent(true)} className="text-[9px] text-brand-brown font-bold tracking-wider uppercase border border-brand-cream-dark px-3 rounded hover:bg-brand-cream cursor-pointer transition-colors">Custom</button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <input value={customParent} onChange={(e) => setCustomParent(e.target.value)} className={inputCls + ' flex-1'} placeholder="Custom parent category" />
                              <button type="button" onClick={() => setIsCustomParent(false)} className="text-[9px] text-brand-brown font-bold tracking-wider uppercase border border-brand-cream-dark px-3 rounded hover:bg-brand-cream cursor-pointer transition-colors">Preset</button>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <label className={labelCls}>Secondary Category</label>
                          {!isCustomSecondary ? (
                            <div className="flex gap-2">
                              <select value={newProduct.secondary_category} onChange={(e) => setNewProduct((p) => ({ ...p, secondary_category: e.target.value, category: e.target.value }))} className={inputCls + ' flex-1'}>
                                {secondariesList.map((s) => <option key={s} value={s}>{s}</option>)}
                              </select>
                              <button type="button" onClick={() => setIsCustomSecondary(true)} className="text-[9px] text-brand-brown font-bold tracking-wider uppercase border border-brand-cream-dark px-3 rounded hover:bg-brand-cream cursor-pointer transition-colors">Custom</button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <input value={customSecondary} onChange={(e) => setCustomSecondary(e.target.value)} className={inputCls + ' flex-1'} placeholder="Custom secondary category" />
                              <button type="button" onClick={() => setIsCustomSecondary(false)} className="text-[9px] text-brand-brown font-bold tracking-wider uppercase border border-brand-cream-dark px-3 rounded hover:bg-brand-cream cursor-pointer transition-colors">Preset</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Price & Inventory */}
                  {addStep === 2 && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="flex flex-col">
                          <label className={labelCls}>Price (₹)</label>
                          <input required type="number" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))} className={inputCls} placeholder="e.g. 799" />
                        </div>
                        <div className="flex flex-col">
                          <label className={labelCls}>Stock Quantity</label>
                          <input required type="number" value={newProduct.stock} onChange={(e) => setNewProduct((p) => ({ ...p, stock: e.target.value }))} className={inputCls} placeholder="e.g. 100" />
                        </div>
                      </div>

                      {/* Sizes Selection */}
                      <div className="flex flex-col">
                        <label className={labelCls}>Sizes Selection</label>
                        <div className="flex flex-wrap gap-1.5 mb-2.5 border border-brand-cream-dark bg-brand-cream/5 p-3.5 rounded-lg min-h-[50px]">
                          {sizesList.map((sz, idx) => (
                            <span key={idx} className="flex items-center space-x-1 px-2.5 py-1 bg-white border border-brand-cream-dark text-brand-dark font-bold text-[9px] rounded-md shadow-xs">
                              <span>{sz}</span>
                              <button type="button" onClick={() => toggleSize(sz, false)} className="text-red-500 hover:text-red-700 font-bold focus:outline-none transition-colors"><X className="w-3 h-3" /></button>
                            </span>
                          ))}
                          {sizesList.length === 0 && <span className="text-[10px] text-brand-dark/30 font-semibold uppercase italic tracking-wider self-center mx-auto">No sizes selected. Choose below.</span>}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {STANDARD_SIZES.map((sz) => {
                            const isSelected = sizesList.includes(sz);
                            return (
                              <button
                                type="button"
                                key={sz}
                                onClick={() => toggleSize(sz, false)}
                                className={`px-3 py-1.5 border rounded text-[10px] font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-brand-brown border-brand-brown text-white shadow-xs'
                                    : 'bg-white border-brand-cream-dark text-brand-dark/65 hover:border-brand-brown/50'
                                }`}
                              >
                                {sz}
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom size input */}
                        <div className="flex gap-2 max-w-xs">
                          <input
                            type="text"
                            value={customSize}
                            onChange={(e) => setCustomSize(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addCustomSizeTag(e, false);
                              }
                            }}
                            placeholder="Add other size (e.g. 4XL)"
                            className={inputCls + ' max-w-[200px]'}
                          />
                          <button
                            type="button"
                            onClick={(e) => addCustomSizeTag(e, false)}
                            className="text-[9px] text-brand-brown font-bold tracking-wider uppercase border border-brand-cream-dark px-3 rounded hover:bg-brand-cream cursor-pointer transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Colors Tag Inputs */}
                      <div className="flex flex-col">
                        <label className={labelCls}>Colors tags (type name & press enter)</label>
                        <div className="flex flex-wrap gap-1.5 mb-2.5 border border-brand-cream-dark bg-brand-cream/5 p-3.5 rounded-lg min-h-[60px]">
                          {colorsList.map((col, idx) => (
                            <span key={idx} className="flex items-center space-x-1 px-2.5 py-1.5 bg-white border border-brand-cream-dark text-brand-dark/85 font-semibold text-[9px] rounded-md shadow-xs">
                              <span>{col}</span>
                              <button type="button" onClick={() => removeColorTag(col, false)} className="text-red-500 hover:text-red-700 font-bold focus:outline-none transition-colors"><X className="w-3 h-3" /></button>
                            </span>
                          ))}
                          {colorsList.length === 0 && <span className="text-[10px] text-brand-dark/30 font-semibold uppercase italic tracking-wider self-center mx-auto">No colors configured. Add one below.</span>}
                        </div>
                        <input
                          type="text"
                          value={colorInput}
                          onChange={(e) => setColorInput(e.target.value)}
                          onKeyDown={(e) => addColorTag(e, false)}
                          placeholder="e.g. Navy Blue, then hit Enter"
                          className={inputCls}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Media Upload */}
                  {addStep === 3 && (
                    <div className="space-y-6">
                      <div className="flex flex-col space-y-2">
                        <label className={labelCls}>Product Images</label>
                        <label className="flex items-center space-x-2.5 cursor-pointer border border-dashed border-brand-cream-dark/60 rounded-xl px-5 py-4 bg-brand-cream/10 hover:bg-brand-cream/20 transition-all w-fit">
                          <Upload className="w-4 h-4 text-brand-brown" />
                          <span className="text-[10px] font-bold text-brand-dark/60 tracking-widest uppercase">
                            {additionalImagesUploading ? 'Uploading...' : 'Upload Product Photos'}
                          </span>
                          <input type="file" multiple accept="image/*" onChange={handleProductImagesUpload} className="hidden" disabled={additionalImagesUploading} />
                        </label>
                        <span className="text-[8px] text-brand-dark/40 font-semibold tracking-wider uppercase">Upload high-res JPG/PNG files. First photo defaults as cover image.</span>

                        {newProductAllImages.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
                            {newProductAllImages.map((url, i) => {
                              const isCover = i === 0;
                              return (
                                <div key={i} className={`relative aspect-3/4 rounded-lg overflow-hidden bg-brand-cream group border ${
                                  isCover ? 'border-brand-brown ring-2 ring-brand-brown/10' : 'border-brand-cream-dark'
                                }`}>
                                  <Image src={url} alt={`product-img-${i}`} fill className="object-cover" sizes="120px" />
                                  
                                  {/* Badge cover */}
                                  {isCover && (
                                    <span className="absolute top-1.5 left-1.5 bg-brand-brown text-white text-[7px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 uppercase tracking-wider">
                                      <Star className="w-2 h-2 fill-white" /> Cover
                                    </span>
                                  )}

                                  {/* Action overlays on hover */}
                                  <div className="absolute inset-0 bg-brand-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                                    {!isCover && (
                                      <button
                                        type="button"
                                        onClick={() => makeImagePrimary(i, false)}
                                        title="Make Cover"
                                        className="w-7 h-7 rounded-full bg-white text-brand-brown flex items-center justify-center hover:bg-brand-cream transition-colors cursor-pointer"
                                      >
                                        <Star className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => deleteProductImage(i, false)}
                                      title="Delete"
                                      className="w-7 h-7 rounded-full bg-white text-red-600 flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Size Chart Image */}
                      <div className="flex flex-col space-y-3 pt-3 border-t border-brand-cream-dark/50">
                        <label className={labelCls}>Size Chart Image</label>
                        <div className="flex flex-wrap items-start gap-4">
                          <label className="flex items-center space-x-2.5 cursor-pointer border border-dashed border-brand-cream-dark/60 rounded-xl px-5 py-4 bg-brand-cream/10 hover:bg-brand-cream/20 transition-all w-fit">
                            <Upload className="w-4 h-4 text-brand-brown" />
                            <span className="text-[10px] font-bold text-brand-dark/60 tracking-widest uppercase">
                              {sizeChartUploading ? 'Uploading...' : 'Replace Size Chart'}
                            </span>
                            <input type="file" accept="image/*" onChange={handleSizeChartUpload} className="hidden" disabled={sizeChartUploading} />
                          </label>

                          {newProduct.size_chart && (
                            <div className="relative w-28 h-20 border border-brand-cream-dark rounded-lg overflow-hidden group bg-brand-cream">
                              <Image src={newProduct.size_chart} alt="Size Chart Preview" fill className="object-cover" sizes="112px" />
                              <div className="absolute inset-0 bg-brand-dark/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => setNewProduct(prev => ({ ...prev, size_chart: '' }))}
                                  className="p-1 rounded bg-white text-red-600 hover:bg-red-50 cursor-pointer"
                                  title="Remove Size Chart"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Details & Care */}
                  {addStep === 4 && (
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <label className={labelCls}>Description</label>
                        <textarea value={newProduct.description} onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))} className={inputCls + ' h-24 resize-none'} placeholder="Write a premium description detailing the cut, drape, and utility of the garment..." />
                        <span className="text-[8px] text-brand-dark/40 font-semibold tracking-wider uppercase mt-1.5 self-end">Characters: {newProduct.description.length}</span>
                      </div>
                      <div className="flex flex-col">
                        <label className={labelCls}>Specifications</label>
                        <textarea value={newProduct.specifications} onChange={(e) => setNewProduct((p) => ({ ...p, specifications: e.target.value }))} className={inputCls + ' h-20 resize-none'} placeholder="e.g. 100% Organic Pima Cotton, 240 GSM, Double-needle stitched..." />
                      </div>
                      <div className="flex flex-col">
                        <label className={labelCls}>Wash Care</label>
                        <textarea value={newProduct.wash_care} onChange={(e) => setNewProduct((p) => ({ ...p, wash_care: e.target.value }))} className={inputCls + ' h-20 resize-none'} placeholder="e.g. Machine wash cold inside out, dry flat in shade, iron low..." />
                      </div>
                    </div>
                  )}

                  {/* Actions buttons */}
                  <div className="flex items-center justify-between border-t border-brand-cream-dark pt-5">
                    <div>
                      {addStep > 1 && (
                        <button
                          type="button"
                          onClick={() => setAddStep(prev => prev - 1)}
                          className="flex items-center space-x-1.5 px-5 py-2 border border-brand-cream-dark text-brand-dark hover:bg-brand-cream rounded text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back</span>
                        </button>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddFormOpen(false);
                          setAddStep(1);
                        }}
                        className="px-5 py-2 border border-transparent text-brand-dark/50 hover:text-brand-brown rounded text-[10px] font-bold tracking-widest uppercase cursor-pointer"
                      >
                        Cancel
                      </button>

                      {addStep < 4 ? (
                        <button
                          type="button"
                          onClick={() => setAddStep(prev => prev + 1)}
                          disabled={!isStepValid(addStep, false)}
                          className="flex items-center space-x-1.5 px-6 py-2.5 bg-brand-brown hover:bg-brand-brown-dark disabled:bg-brand-brown/40 text-white rounded text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer"
                        >
                          <span>Next Step</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={!isStepValid(1, false) || !isStepValid(2, false) || !isStepValid(3, false)}
                          className="px-6 py-2.5 bg-brand-brown hover:bg-brand-brown-dark disabled:bg-brand-brown/40 text-white rounded text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer shadow-xs"
                        >
                          Publish Product
                        </button>
                      )}
                    </div>
                  </div>
                </form>

                {/* Live Card Preview Column */}
                <RenderProductLivePreview target={newProduct} />
              </div>
            )}

            {/* EDIT PRODUCT FORM (Redesigned with Stepper and Live Preview) */}
            {editingProduct && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <form onSubmit={handleEditProductSubmit} className="lg:col-span-2 bg-white border border-brand-cream-dark rounded-xl p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-brand-cream-dark pb-3">
                    <h4 className="font-serif text-sm text-brand-dark uppercase tracking-wider">Edit Product: <span className="font-sans text-[11px] font-bold tracking-wider text-brand-brown uppercase">{editingProduct.title}</span></h4>
                    <span className="text-[9px] font-bold text-brand-dark/40 uppercase bg-brand-cream px-2.5 py-1 rounded">Step {editStep} of 4</span>
                  </div>

                  <RenderStepperBar currentStep={editStep} setStep={setEditStep} isEdit={true} />

                  {/* Step 1: Identity & Categories */}
                  {editStep === 1 && (
                    <div className="space-y-5">
                      <div className="flex flex-col">
                        <label className={labelCls}>Product Title</label>
                        <input required value={String(editingProduct.title || '')} onChange={(e) => setEditingProduct((p) => p ? { ...p, title: e.target.value } : p)} className={inputCls} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="flex flex-col">
                          <label className={labelCls}>Parent Category</label>
                          {!isEditCustomParent ? (
                            <div className="flex gap-2">
                              <select value={String(editingProduct.parent_category || 'MEN')} onChange={(e) => handleEditParentCategoryChange(e.target.value)} className={inputCls + ' flex-1'}>
                                {parentsList.map((p) => <option key={p} value={p}>{p}</option>)}
                              </select>
                              <button type="button" onClick={() => setEditIsCustomParent(true)} className="text-[9px] text-brand-brown font-bold tracking-wider uppercase border border-brand-cream-dark px-3 rounded hover:bg-brand-cream cursor-pointer transition-colors">Custom</button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <input value={editCustomParent} onChange={(e) => setEditCustomParent(e.target.value)} className={inputCls + ' flex-1'} placeholder="Custom parent category" />
                              <button type="button" onClick={() => setEditIsCustomParent(false)} className="text-[9px] text-brand-brown font-bold tracking-wider uppercase border border-brand-cream-dark px-3 rounded hover:bg-brand-cream cursor-pointer transition-colors">Preset</button>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <label className={labelCls}>Secondary Category</label>
                          {!isEditCustomSecondary ? (
                            <div className="flex gap-2">
                              <select value={String(editingProduct.secondary_category || '')} onChange={(e) => setEditingProduct((p) => p ? { ...p, secondary_category: e.target.value, category: e.target.value } : p)} className={inputCls + ' flex-1'}>
                                {editSecondariesList.map((s) => <option key={s} value={s}>{s}</option>)}
                              </select>
                              <button type="button" onClick={() => setEditIsCustomSecondary(true)} className="text-[9px] text-brand-brown font-bold tracking-wider uppercase border border-brand-cream-dark px-3 rounded hover:bg-brand-cream cursor-pointer transition-colors">Custom</button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <input value={editCustomSecondary} onChange={(e) => setEditCustomSecondary(e.target.value)} className={inputCls + ' flex-1'} placeholder="Custom secondary category" />
                              <button type="button" onClick={() => setEditIsCustomSecondary(false)} className="text-[9px] text-brand-brown font-bold tracking-wider uppercase border border-brand-cream-dark px-3 rounded hover:bg-brand-cream cursor-pointer transition-colors">Preset</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Price & Inventory */}
                  {editStep === 2 && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="flex flex-col">
                          <label className={labelCls}>Price (₹)</label>
                          <input required type="number" step="0.01" value={editingProduct.price} onChange={(e) => setEditingProduct((p) => p ? { ...p, price: e.target.value } : p)} className={inputCls} />
                        </div>
                        <div className="flex flex-col">
                          <label className={labelCls}>Stock</label>
                          <input required type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct((p) => p ? { ...p, stock: e.target.value } : p)} className={inputCls} />
                        </div>
                      </div>

                      {/* Sizes Selection */}
                      <div className="flex flex-col">
                        <label className={labelCls}>Sizes Selection</label>
                        <div className="flex flex-wrap gap-1.5 mb-2.5 border border-brand-cream-dark bg-brand-cream/5 p-3.5 rounded-lg min-h-[50px]">
                          {editSizesList.map((sz, idx) => (
                            <span key={idx} className="flex items-center space-x-1 px-2.5 py-1 bg-white border border-brand-cream-dark text-brand-dark font-bold text-[9px] rounded-md shadow-xs">
                              <span>{sz}</span>
                              <button type="button" onClick={() => toggleSize(sz, true)} className="text-red-500 hover:text-red-700 font-bold focus:outline-none transition-colors"><X className="w-3 h-3" /></button>
                            </span>
                          ))}
                          {editSizesList.length === 0 && <span className="text-[10px] text-brand-dark/30 font-semibold uppercase italic tracking-wider self-center mx-auto">No sizes selected. Choose below.</span>}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {STANDARD_SIZES.map((sz) => {
                            const isSelected = editSizesList.includes(sz);
                            return (
                              <button
                                type="button"
                                key={sz}
                                onClick={() => toggleSize(sz, true)}
                                className={`px-3 py-1.5 border rounded text-[10px] font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-brand-brown border-brand-brown text-white shadow-xs'
                                    : 'bg-white border-brand-cream-dark text-brand-dark/65 hover:border-brand-brown/50'
                                }`}
                              >
                                {sz}
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom size input */}
                        <div className="flex gap-2 max-w-xs">
                          <input
                            type="text"
                            value={editCustomSize}
                            onChange={(e) => setEditCustomSize(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addCustomSizeTag(e, true);
                              }
                            }}
                            placeholder="Add other size (e.g. 4XL)"
                            className={inputCls + ' max-w-[200px]'}
                          />
                          <button
                            type="button"
                            onClick={(e) => addCustomSizeTag(e, true)}
                            className="text-[9px] text-brand-brown font-bold tracking-wider uppercase border border-brand-cream-dark px-3 rounded hover:bg-brand-cream cursor-pointer transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Colors Tag Inputs */}
                      <div className="flex flex-col">
                        <label className={labelCls}>Colors tags (type name & press enter)</label>
                        <div className="flex flex-wrap gap-1.5 mb-2.5 border border-brand-cream-dark bg-brand-cream/5 p-3.5 rounded-lg min-h-[60px]">
                          {editColorsList.map((col, idx) => (
                            <span key={idx} className="flex items-center space-x-1 px-2.5 py-1.5 bg-white border border-brand-cream-dark text-brand-dark/85 font-semibold text-[9px] rounded-md shadow-xs">
                              <span>{col}</span>
                              <button type="button" onClick={() => removeColorTag(col, true)} className="text-red-500 hover:text-red-700 font-bold focus:outline-none transition-colors"><X className="w-3 h-3" /></button>
                            </span>
                          ))}
                          {editColorsList.length === 0 && <span className="text-[10px] text-brand-dark/30 font-semibold uppercase italic tracking-wider self-center mx-auto">No colors configured. Add one below.</span>}
                        </div>
                        <input
                          type="text"
                          value={editColorInput}
                          onChange={(e) => setEditColorInput(e.target.value)}
                          onKeyDown={(e) => addColorTag(e, true)}
                          placeholder="e.g. Navy Blue, then hit Enter"
                          className={inputCls}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Media Upload */}
                  {editStep === 3 && (
                    <div className="space-y-6">
                      <div className="flex flex-col space-y-2">
                        <label className={labelCls}>Product Images</label>
                        <label className="flex items-center space-x-2.5 cursor-pointer border border-dashed border-brand-cream-dark/60 rounded-xl px-5 py-4 bg-brand-cream/10 hover:bg-brand-cream/20 transition-all w-fit">
                          <Upload className="w-4 h-4 text-brand-brown" />
                          <span className="text-[10px] font-bold text-brand-dark/60 tracking-widest uppercase">
                            {editAdditionalImagesUploading ? 'Uploading...' : 'Upload / Replace Images'}
                          </span>
                          <input type="file" multiple accept="image/*" onChange={handleEditProductImagesUpload} className="hidden" disabled={editAdditionalImagesUploading} />
                        </label>

                        {editProductAllImages.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
                            {editProductAllImages.map((url, i) => {
                              const isCover = i === 0;
                              return (
                                <div key={i} className={`relative aspect-3/4 rounded-lg overflow-hidden bg-brand-cream group border ${
                                  isCover ? 'border-brand-brown ring-2 ring-brand-brown/10' : 'border-brand-cream-dark'
                                }`}>
                                  <Image src={url as string} alt={`edit-img-${i}`} fill className="object-cover" sizes="120px" />
                                  
                                  {/* Cover Badge */}
                                  {isCover && (
                                    <span className="absolute top-1.5 left-1.5 bg-brand-brown text-white text-[7px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 uppercase tracking-wider">
                                      <Star className="w-2 h-2 fill-white" /> Cover
                                    </span>
                                  )}

                                  {/* Action overlays on hover */}
                                  <div className="absolute inset-0 bg-brand-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                                    {!isCover && (
                                      <button
                                        type="button"
                                        onClick={() => makeImagePrimary(i, true)}
                                        title="Make Cover"
                                        className="w-7 h-7 rounded-full bg-white text-brand-brown flex items-center justify-center hover:bg-brand-cream transition-colors cursor-pointer"
                                      >
                                        <Star className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => deleteProductImage(i, true)}
                                      title="Delete"
                                      className="w-7 h-7 rounded-full bg-white text-red-600 flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Size Chart Image */}
                      <div className="flex flex-col space-y-3 pt-3 border-t border-brand-cream-dark/50">
                        <label className={labelCls}>Size Chart Image</label>
                        <div className="flex flex-wrap items-start gap-4">
                          <label className="flex items-center space-x-2.5 cursor-pointer border border-dashed border-brand-cream-dark/60 rounded-xl px-5 py-4 bg-brand-cream/10 hover:bg-brand-cream/20 transition-all w-fit">
                            <Upload className="w-4 h-4 text-brand-brown" />
                            <span className="text-[10px] font-bold text-brand-dark/60 tracking-widest uppercase">
                              {editSizeChartUploading ? 'Uploading...' : 'Replace Size Chart'}
                            </span>
                            <input type="file" accept="image/*" onChange={handleEditSizeChartUpload} className="hidden" disabled={editSizeChartUploading} />
                          </label>

                          {editingProduct.size_chart && (
                            <div className="relative w-28 h-20 border border-brand-cream-dark rounded-lg overflow-hidden group bg-brand-cream">
                              <Image src={editingProduct.size_chart} alt="Size Chart Preview" fill className="object-cover" sizes="112px" />
                              <div className="absolute inset-0 bg-brand-dark/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => setEditingProduct(prev => prev ? { ...prev, size_chart: '' } : prev)}
                                  className="p-1 rounded bg-white text-red-600 hover:bg-red-50 cursor-pointer"
                                  title="Remove Size Chart"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Details & Care */}
                  {editStep === 4 && (
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <label className={labelCls}>Description</label>
                        <textarea value={String(editingProduct.description || '')} onChange={(e) => setEditingProduct((p) => p ? { ...p, description: e.target.value } : p)} className={inputCls + ' h-24 resize-none'} />
                      </div>
                      <div className="flex flex-col">
                        <label className={labelCls}>Specifications</label>
                        <textarea value={String(editingProduct.specifications || '')} onChange={(e) => setEditingProduct((p) => p ? { ...p, specifications: e.target.value } : p)} className={inputCls + ' h-20 resize-none'} />
                      </div>
                      <div className="flex flex-col">
                        <label className={labelCls}>Wash Care</label>
                        <textarea value={String(editingProduct.wash_care || '')} onChange={(e) => setEditingProduct((p) => p ? { ...p, wash_care: e.target.value } : p)} className={inputCls + ' h-20 resize-none'} />
                      </div>
                    </div>
                  )}

                  {/* Actions buttons */}
                  <div className="flex items-center justify-between border-t border-brand-cream-dark pt-5">
                    <div>
                      {editStep > 1 && (
                        <button
                          type="button"
                          onClick={() => setEditStep(prev => prev - 1)}
                          className="flex items-center space-x-1.5 px-5 py-2 border border-brand-cream-dark text-brand-dark hover:bg-brand-cream rounded text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back</span>
                        </button>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="px-5 py-2 border border-transparent text-brand-dark/50 hover:text-brand-brown rounded text-[10px] font-bold tracking-widest uppercase cursor-pointer"
                      >
                        Cancel
                      </button>

                      {editStep < 4 ? (
                        <button
                          type="button"
                          onClick={() => setEditStep(prev => prev + 1)}
                          disabled={!isStepValid(editStep, true)}
                          className="flex items-center space-x-1.5 px-6 py-2.5 bg-brand-brown hover:bg-brand-brown-dark disabled:bg-brand-brown/40 text-white rounded text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer"
                        >
                          <span>Next Step</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={!isStepValid(1, true) || !isStepValid(2, true) || !isStepValid(3, true)}
                          className="px-6 py-2.5 bg-brand-brown hover:bg-brand-brown-dark disabled:bg-brand-brown/40 text-white rounded text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer shadow-xs"
                        >
                          Save Changes
                        </button>
                      )}
                    </div>
                  </div>
                </form>

                {/* Live Card Preview Column */}
                <RenderProductLivePreview target={editingProduct} />
              </div>
            )}

            {/* PRODUCT SEARCH & INVENTORY GRID TABLE */}
            {!isAddFormOpen && !editingProduct && (
              <div className="space-y-4">
                {/* Search and statistics bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-brand-cream-dark p-4 rounded-xl shadow-xs">
                  <div className="relative flex-1 min-w-[280px]">
                    <Search className="w-4 h-4 text-brand-dark/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search inventory by title or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={inputCls + ' pl-10 h-10 border-brand-cream-dark/80 bg-brand-cream/5 focus:bg-white'}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-dark/30 hover:text-brand-dark cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                  <div className="flex items-center space-x-5 text-[10px] font-bold tracking-widest uppercase text-brand-dark/50 font-sans">
                    <span>Total Types: <strong className="text-brand-brown">{products.length}</strong></span>
                    <span className="hidden sm:inline border-l border-brand-cream-dark h-4" />
                    <span>Selected: <strong className="text-brand-brown">{filteredAndSortedProducts.length}</strong></span>
                  </div>
                </div>

                {dbLoading ? (
                  <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-brand-brown border-t-transparent animate-spin" /></div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-brand-cream-dark bg-white shadow-xs">
                    <table className="w-full text-xs">
                      <thead className="bg-brand-cream/25 text-brand-dark/65 uppercase tracking-widest font-bold text-[9px] border-b border-brand-cream-dark">
                        <tr>
                          <th className="px-5 py-4 text-left font-bold">Image</th>
                          <th className="px-5 py-4 text-left font-bold cursor-pointer hover:bg-brand-cream/40 transition-colors" onClick={() => toggleSort('title')}>
                            <div className="flex items-center space-x-1">
                              <span>Title</span>
                              {sortField === 'title' && (sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-brand-brown" /> : <ChevronDown className="w-3.5 h-3.5 text-brand-brown" />)}
                            </div>
                          </th>
                          <th className="px-5 py-4 text-left font-bold">Category</th>
                          <th className="px-5 py-4 text-left font-bold cursor-pointer hover:bg-brand-cream/40 transition-colors" onClick={() => toggleSort('price')}>
                            <div className="flex items-center space-x-1">
                              <span>Price</span>
                              {sortField === 'price' && (sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-brand-brown" /> : <ChevronDown className="w-3.5 h-3.5 text-brand-brown" />)}
                            </div>
                          </th>
                          <th className="px-5 py-4 text-left font-bold cursor-pointer hover:bg-brand-cream/40 transition-colors" onClick={() => toggleSort('stock')}>
                            <div className="flex items-center space-x-1">
                              <span>Stock</span>
                              {sortField === 'stock' && (sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-brand-brown" /> : <ChevronDown className="w-3.5 h-3.5 text-brand-brown" />)}
                            </div>
                          </th>
                          <th className="px-5 py-4 text-center font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-cream-dark">
                        {filteredAndSortedProducts.map((prod) => {
                          const stockCount = parseInt(String(prod.stock)) || 0;
                          const isOutOfStock = stockCount === 0;
                          const isLowStock = stockCount > 0 && stockCount < 10;

                          return (
                            <tr key={prod.id} className="hover:bg-brand-cream/5 transition-colors">
                              <td className="px-5 py-4.5">
                                <div className="relative w-11 h-14 bg-brand-cream rounded-md border border-brand-cream-dark overflow-hidden">
                                  {prod.image ? (
                                    <Image src={prod.image} alt={prod.title} fill className="object-cover" sizes="44px" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-brand-cream text-brand-dark/20"><ImageIcon className="w-4 h-4" /></div>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-4.5 font-semibold text-brand-dark max-w-[240px] truncate">{prod.title}</td>
                              <td className="px-5 py-4.5 text-brand-dark/50 font-medium tracking-wide">
                                <span className="bg-brand-cream/55 border border-brand-cream-dark/60 text-brand-dark/75 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{prod.category}</span>
                              </td>
                              <td className="px-5 py-4.5 font-bold text-brand-brown">₹{parseFloat(String(prod.price)).toFixed(0)}</td>
                              <td className="px-5 py-4.5">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                  isOutOfStock
                                    ? 'bg-red-50 border-red-200 text-red-600'
                                    : isLowStock
                                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                                      : 'bg-green-50 border-green-200 text-green-700'
                                }`}>
                                  {isOutOfStock ? 'Out of stock' : isLowStock ? `${stockCount} Low` : `${stockCount} In Stock`}
                                </span>
                              </td>
                              <td className="px-5 py-4.5 text-center">
                                <div className="flex items-center justify-center space-x-3">
                                  <button
                                    onClick={() => handleStartEditProduct(prod)}
                                    title="Edit Product"
                                    className="p-2 border border-brand-cream-dark hover:border-brand-brown/40 text-brand-dark/65 hover:text-brand-brown rounded-lg transition-colors cursor-pointer bg-white"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(prod.id)}
                                    title="Delete Product"
                                    className="p-2 border border-brand-cream-dark hover:border-red-300 text-brand-dark/65 hover:text-red-600 rounded-lg transition-colors cursor-pointer bg-white"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {filteredAndSortedProducts.length === 0 && (
                      <div className="text-center py-16 text-brand-dark/35 text-xs font-bold tracking-widest uppercase">
                        {searchQuery ? 'No items match your search query.' : 'No products yet. Add your first product above.'}
                      </div>
                    )}
                  </div>
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
                  <div className="flex items-center space-x-2 shrink-0">
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
