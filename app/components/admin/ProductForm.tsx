'use client';

import React, { useEffect, useState } from 'react';
import {
  Upload, Star, Trash2, ArrowLeft, ArrowRight, X, Check, Eye
} from 'lucide-react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { uploadImage } from '@/lib/db';
import type { Product } from '@/lib/types';
import ProductPreviewCard from './ProductPreviewCard';

const BLANK_PRODUCT = {
  title: '',
  price: '',
  discount: '0',
  image: '',
  images: '',
  sizes: 'S,M,L,XL,XXL',
  colors: 'Black,Dark Wine,Teal',
  size_chart: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
  stock: '100',
  description: '',
  specifications: '',
  wash_care: '',
};

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

type EditableProduct = Omit<Partial<Product>, 'price' | 'stock' | 'discount'> & {
  price: string | number;
  stock: string | number;
  discount?: string | number;
};

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: EditableProduct | null;
  setErrorMsg: (msg: string) => void;
  setSuccessMsg: (msg: string) => void;
}

export default function ProductForm({
  isOpen,
  onClose,
  editingProduct,
  setErrorMsg,
  setSuccessMsg,
}: ProductFormProps) {
  const { categories, addProduct, editProduct } = useStore();

  const [step, setStep] = useState(1);
  const [product, setProduct] = useState<EditableProduct>({ ...BLANK_PRODUCT });
  const [parentId, setParentId] = useState('');
  const [subId, setSubId] = useState('');

  // Local UI Inputs
  const [customSize, setCustomSize] = useState('');
  const [colorInput, setColorInput] = useState('');

  // Uploading and submission loading states
  const [additionalImagesUploading, setAdditionalImagesUploading] = useState(false);
  const [sizeChartUploading, setSizeChartUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if editing changes
  useEffect(() => {
    if (editingProduct) {
      setProduct({
        ...editingProduct,
        discount: editingProduct.discount ?? 0,
        images: editingProduct.images || '',
      });

      const cat = categories.find((c) => c.id === editingProduct.category_id);
      if (cat) {
        if (cat.parent_id) {
          setParentId(cat.parent_id);
          setSubId(cat.id);
        } else {
          setParentId(cat.id);
          setSubId('');
        }
      } else {
        setParentId('');
        setSubId('');
      }
    } else {
      setProduct({ ...BLANK_PRODUCT });
      setParentId('');
      setSubId('');
    }
    setStep(1);
    setCustomSize('');
    setColorInput('');
  }, [editingProduct, categories, isOpen]);

  if (!isOpen) return null;

  const productAllImages = [
    product.image,
    ...String(product.images || '')
      .split(',')
      .filter(Boolean),
  ].filter(Boolean) as string[];

  const sizesList = String(product.sizes || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const colorsList = String(product.colors || '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);

  // Helper validation for steps
  const isStepValid = (stepNumber: number) => {
    if (stepNumber === 1) {
      return (
        String(product.title || '').trim().length > 0 &&
        (parentId.length > 0 || subId.length > 0)
      );
    }
    if (stepNumber === 2) {
      const priceNum = parseFloat(String(product.price));
      const discountNum = parseFloat(String(product.discount || '0'));
      const stockNum = parseInt(String(product.stock), 10);
      return (
        !isNaN(priceNum) &&
        priceNum > 0 &&
        !isNaN(discountNum) &&
        discountNum >= 0 &&
        discountNum <= 100 &&
        !isNaN(stockNum) &&
        stockNum >= 0 &&
        String(product.sizes || '').trim().length > 0
      );
    }
    if (stepNumber === 3) {
      return (
        !!product.image && !additionalImagesUploading && !sizeChartUploading
      );
    }
    if (stepNumber === 4) {
      return (
        String(product.description || '').trim().length > 0 &&
        String(product.specifications || '').trim().length > 0 &&
        String(product.wash_care || '').trim().length > 0
      );
    }
    return true;
  };

  // Upload Handlers
  const handleProductImagesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      setAdditionalImagesUploading(true);
      setErrorMsg('');
      const urls = await Promise.all(
        files.map((f) => uploadImage('product-images', f))
      );
      setProduct((prev) => {
        const all = [
          prev.image,
          ...String(prev.images || '')
            .split(',')
            .filter(Boolean),
        ].filter(Boolean);
        const updated = [...all, ...urls];
        return {
          ...prev,
          image: updated[0] || '',
          images: updated.slice(1).join(','),
        };
      });
      setSuccessMsg(`Uploaded ${files.length} image(s)!`);
    } catch {
      setErrorMsg('Failed to upload images.');
    } finally {
      setAdditionalImagesUploading(false);
      e.target.value = '';
    }
  };

  const handleSizeChartUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSizeChartUploading(true);
      setErrorMsg('');
      const url = await uploadImage('size-charts', file);
      setProduct((prev) => ({ ...prev, size_chart: url }));
      setSuccessMsg('Size chart uploaded!');
    } catch {
      setErrorMsg('Failed to upload size chart.');
    } finally {
      setSizeChartUploading(false);
    }
  };

  // Sizes & Colors Modifiers
  const toggleSize = (sz: string) => {
    setProduct((prev) => {
      const currentList = String(prev.sizes || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const nextList = currentList.includes(sz)
        ? currentList.filter((s) => s !== sz)
        : [...currentList, sz];
      return { ...prev, sizes: nextList.join(',') };
    });
  };

  const addCustomSizeTag = (e: React.FormEvent) => {
    e.preventDefault();
    const val = customSize.trim();
    if (!val) return;
    const currentList = String(product.sizes || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!currentList.includes(val)) {
      setProduct({ ...product, sizes: [...currentList, val].join(',') });
    }
    setCustomSize('');
  };

  const addColorTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = colorInput.trim();
      if (!val) return;
      const currentList = String(product.colors || '')
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
      if (!currentList.includes(val)) {
        setProduct({ ...product, colors: [...currentList, val].join(',') });
      }
      setColorInput('');
    }
  };

  const removeColorTag = (col: string) => {
    const currentList = String(product.colors || '')
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    setProduct({
      ...product,
      colors: currentList.filter((c) => c !== col).join(','),
    });
  };

  const makeImagePrimary = (index: number) => {
    const all = [
      product.image,
      ...String(product.images || '')
        .split(',')
        .filter(Boolean),
    ].filter(Boolean);
    if (index >= all.length) return;
    const selected = all[index];
    const remaining = all.filter((_, i) => i !== index);
    setProduct((prev) => ({
      ...prev,
      image: selected as string,
      images: remaining.join(','),
    }));
  };

  const deleteProductImage = (index: number) => {
    const all = [
      product.image,
      ...String(product.images || '')
        .split(',')
        .filter(Boolean),
    ].filter(Boolean);
    const remaining = all.filter((_, i) => i !== index);
    setProduct((prev) => ({
      ...prev,
      image: remaining[0] || '',
      images: remaining.slice(1).join(','),
    }));
  };

  // Submit Handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (step < 4) return;
    setErrorMsg('');
    setSuccessMsg('');
    const priceNum = parseFloat(String(product.price));
    const discountNum = parseFloat(String(product.discount || '0'));
    const stockNum = parseInt(String(product.stock), 10);
    if (isNaN(priceNum)) {
      setErrorMsg('Price must be a valid number.');
      return;
    }
    if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
      setErrorMsg('Discount must be between 0% and 100%.');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      setErrorMsg('Stock must be a non-negative integer.');
      return;
    }
    const categoryId = subId || parentId || null;
    if (!categoryId) {
      setErrorMsg('Please specify a category.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: product.title,
        price: priceNum,
        discount: discountNum,
        category_id: categoryId,
        image:
          product.image ||
          'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600',
        images: String(product.images || ''),
        sizes: product.sizes,
        colors: product.colors,
        size_chart: product.size_chart,
        stock: stockNum,
        description: product.description,
        specifications: product.specifications,
        wash_care: product.wash_care,
      };

      if (editingProduct && editingProduct.id) {
        const { error } = await editProduct(editingProduct.id, payload as Partial<Product>);
        if (error) throw error;
        setSuccessMsg('Product updated successfully!');
      } else {
        const { error } = await addProduct(payload as Partial<Product>);
        if (error) throw error;
        setSuccessMsg('Product added successfully!');
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls =
    'px-3 py-2 text-xs border border-brand-cream-dark rounded bg-white outline-none focus:border-brand-brown font-sans w-full transition-all disabled:opacity-50';
  const labelCls =
    'text-[9px] font-bold text-brand-dark/50 uppercase tracking-wider block mb-1';

  // Stepper Bar Component
  const RenderStepperBar = () => {
    const steps = [
      { num: 1, label: 'Identity' },
      { num: 2, label: 'Attributes' },
      { num: 3, label: 'Media Gallery' },
      { num: 4, label: 'Details' },
    ];

    return (
      <div className="flex items-center justify-between border-b border-brand-cream-dark/60 pb-5 mb-6">
        {steps.map((st, index) => {
          const isCompleted = isStepValid(st.num);
          const isActive = step === st.num;

          return (
            <React.Fragment key={st.num}>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  if (
                    st.num < step ||
                    Array.from({ length: st.num - 1 }, (_, i) => i + 1).every(
                      (s) => isStepValid(s)
                    )
                  ) {
                    setStep(st.num);
                  }
                }}
                className="flex items-center space-x-2.5 focus:outline-none group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-all border ${
                    isActive
                      ? 'bg-brand-brown border-brand-brown text-white ring-4 ring-brand-brown/10'
                      : isCompleted
                      ? 'bg-green-50 border-green-300 text-green-700'
                      : 'bg-white border-brand-cream-dark text-brand-dark/40 group-hover:border-brand-brown/50 group-hover:text-brand-brown'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : st.num}
                </span>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'text-brand-brown'
                      : 'text-brand-dark/45 group-hover:text-brand-brown'
                  }`}
                >
                  {st.label}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={`h-px flex-1 mx-3 ${
                    isStepValid(st.num) ? 'bg-green-300' : 'bg-brand-cream-dark/50'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step === 4) handleSubmit();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
            e.preventDefault();
          }
        }}
        className="lg:col-span-2 bg-white border border-brand-cream-dark rounded-xl p-6 shadow-sm space-y-6"
      >
        <div className="flex items-center justify-between border-b border-brand-cream-dark pb-3">
          <h4 className="font-serif text-sm text-brand-dark uppercase tracking-wider">
            {editingProduct
              ? `Edit Product: ${editingProduct.title}`
              : 'Add New Premium Garment'}
          </h4>
          <span className="text-[9px] font-bold text-brand-dark/40 uppercase bg-brand-cream px-2.5 py-1 rounded">
            Step {step} of 4
          </span>
        </div>

        <RenderStepperBar />

        {/* Step 1: Identity & Categories */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="flex flex-col">
              <label className={labelCls}>Product Title</label>
              <input
                required
                disabled={isSubmitting}
                value={product.title || ''}
                onChange={(e) =>
                  setProduct((p) => ({ ...p, title: e.target.value }))
                }
                className={inputCls}
                placeholder="e.g. Premium Cotton Polo"
              />
              <span className="text-[8px] text-brand-dark/40 font-semibold tracking-wider uppercase mt-1">
                Recommended 35-50 characters for clean layouts. Current:{' '}
                {(product.title || '').length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col">
                <label className={labelCls}>Parent Category</label>
                <select
                  disabled={isSubmitting}
                  value={parentId}
                  onChange={(e) => {
                    setParentId(e.target.value);
                    setSubId('');
                  }}
                  className={inputCls}
                >
                  <option value="">-- Select Parent Category --</option>
                  {categories
                    .filter((c) => !c.parent_id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className={labelCls}>Subcategory (Optional)</label>
                <select
                  disabled={isSubmitting || !parentId}
                  value={subId}
                  onChange={(e) => setSubId(e.target.value)}
                  className={inputCls}
                >
                  <option value="">-- None (Keep directly under parent) --</option>
                  {categories
                    .filter((c) => c.parent_id === parentId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Price & Inventory */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="flex flex-col">
                <label className={labelCls}>Price (₹)</label>
                <input
                  required
                  disabled={isSubmitting}
                  type="number"
                  step="0.01"
                  value={product.price || ''}
                  onChange={(e) =>
                    setProduct((p) => ({ ...p, price: e.target.value }))
                  }
                  className={inputCls}
                  placeholder="e.g. 799"
                />
              </div>
              <div className="flex flex-col">
                <label className={labelCls}>Discount (%)</label>
                <input
                  disabled={isSubmitting}
                  type="number"
                  min="0"
                  max="100"
                  value={product.discount ?? ''}
                  onChange={(e) =>
                    setProduct((p) => ({ ...p, discount: e.target.value }))
                  }
                  className={inputCls}
                  placeholder="e.g. 10"
                />
              </div>
              <div className="flex flex-col">
                <label className={labelCls}>Stock Quantity</label>
                <input
                  required
                  disabled={isSubmitting}
                  type="number"
                  value={product.stock || ''}
                  onChange={(e) =>
                    setProduct((p) => ({ ...p, stock: e.target.value }))
                  }
                  className={inputCls}
                  placeholder="e.g. 100"
                />
              </div>
            </div>

            {/* Sizes Selection */}
            <div className="flex flex-col">
              <label className={labelCls}>Sizes Selection</label>
              <div className="flex flex-wrap gap-1.5 mb-2.5 border border-brand-cream-dark bg-brand-cream/5 p-3.5 rounded-lg min-h-[50px]">
                {sizesList.map((sz, idx) => (
                  <span
                    key={idx}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-white border border-brand-cream-dark text-brand-dark font-bold text-[9px] rounded-md shadow-xs"
                  >
                    <span>{sz}</span>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => toggleSize(sz)}
                      className="text-red-500 hover:text-red-700 font-bold focus:outline-none transition-colors disabled:opacity-50"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {sizesList.length === 0 && (
                  <span className="text-[10px] text-brand-dark/30 font-semibold uppercase italic tracking-wider self-center mx-auto">
                    No sizes selected. Choose below.
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {STANDARD_SIZES.map((sz) => {
                  const isSelected = sizesList.includes(sz);
                  return (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      key={sz}
                      onClick={() => toggleSize(sz)}
                      className={`px-3 py-1.5 border rounded text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50 ${
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
                  disabled={isSubmitting}
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomSizeTag(e);
                    }
                  }}
                  placeholder="Add other size (e.g. 4XL)"
                  className={inputCls + ' max-w-[200px]'}
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={(e) => addCustomSizeTag(e)}
                  className="text-[9px] text-brand-brown font-bold tracking-wider uppercase border border-brand-cream-dark px-3 rounded hover:bg-brand-cream cursor-pointer transition-colors disabled:opacity-50"
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
                  <span
                    key={idx}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-white border border-brand-cream-dark text-brand-dark/85 font-semibold text-[9px] rounded-md shadow-xs"
                  >
                    <span>{col}</span>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => removeColorTag(col)}
                      className="text-red-500 hover:text-red-700 font-bold focus:outline-none transition-colors disabled:opacity-50"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {colorsList.length === 0 && (
                  <span className="text-[10px] text-brand-dark/30 font-semibold uppercase italic tracking-wider self-center mx-auto">
                    No colors configured. Add one below.
                  </span>
                )}
              </div>
              <input
                type="text"
                disabled={isSubmitting}
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyDown={addColorTag}
                placeholder="e.g. Navy Blue, then hit Enter"
                className={inputCls}
              />
            </div>
          </div>
        )}

        {/* Step 3: Media Upload */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex flex-col space-y-2">
              <label className={labelCls}>Product Images</label>
              <label className="flex items-center space-x-2.5 cursor-pointer border border-dashed border-brand-cream-dark/60 rounded-xl px-5 py-4 bg-brand-cream/10 hover:bg-brand-cream/20 transition-all w-fit disabled:opacity-50">
                <Upload className="w-4 h-4 text-brand-brown" />
                <span className="text-[10px] font-bold text-brand-dark/60 tracking-widest uppercase">
                  {additionalImagesUploading
                    ? 'Uploading...'
                    : 'Upload Product Photos'}
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleProductImagesUpload}
                  className="hidden"
                  disabled={additionalImagesUploading || isSubmitting}
                />
              </label>
              <span className="text-[8px] text-brand-dark/40 font-semibold tracking-wider uppercase">
                Upload high-res JPG/PNG files. First photo defaults as cover image.
              </span>

              {productAllImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
                  {productAllImages.map((url, i) => {
                    const isCover = i === 0;
                    return (
                      <div
                        key={i}
                        className={`relative aspect-3/4 rounded-lg overflow-hidden bg-brand-cream group border ${
                          isCover
                            ? 'border-brand-brown ring-2 ring-brand-brown/10'
                            : 'border-brand-cream-dark'
                        }`}
                      >
                        <Image
                          src={url}
                          alt={`product-img-${i}`}
                          fill
                          className="object-cover"
                          sizes="120px"
                        />

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
                              disabled={isSubmitting}
                              onClick={() => makeImagePrimary(i)}
                              title="Make Cover"
                              className="w-7 h-7 rounded-full bg-white text-brand-brown flex items-center justify-center hover:bg-brand-cream transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => deleteProductImage(i)}
                            title="Delete"
                            className="w-7 h-7 rounded-full bg-white text-red-600 flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
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
                    {sizeChartUploading
                      ? 'Uploading...'
                      : 'Replace Size Chart'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSizeChartUpload}
                    className="hidden"
                    disabled={sizeChartUploading || isSubmitting}
                  />
                </label>

                {product.size_chart && (
                  <div className="relative w-28 h-20 border border-brand-cream-dark rounded-lg overflow-hidden group bg-brand-cream">
                    <Image
                      src={product.size_chart}
                      alt="Size Chart Preview"
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                    <div className="absolute inset-0 bg-brand-dark/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() =>
                          setProduct((prev) => ({ ...prev, size_chart: '' }))
                        }
                        className="p-1 rounded bg-white text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-50"
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
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex flex-col">
              <label className={labelCls}>Description</label>
              <textarea
                disabled={isSubmitting}
                value={product.description || ''}
                onChange={(e) =>
                  setProduct((p) => ({ ...p, description: e.target.value }))
                }
                className={inputCls + ' h-24 resize-none'}
                placeholder="Write a premium description detailing the cut, drape, and utility of the garment..."
              />
              <span className="text-[8px] text-brand-dark/40 font-semibold tracking-wider uppercase mt-1.5 self-end">
                Characters: {(product.description || '').length}
              </span>
            </div>
            <div className="flex flex-col">
              <label className={labelCls}>Specifications</label>
              <textarea
                disabled={isSubmitting}
                value={product.specifications || ''}
                onChange={(e) =>
                  setProduct((p) => ({ ...p, specifications: e.target.value }))
                }
                className={inputCls + ' h-20 resize-none'}
                placeholder="e.g. 100% Organic Pima Cotton, 240 GSM, Double-needle stitched..."
              />
            </div>
            <div className="flex flex-col">
              <label className={labelCls}>Wash Care</label>
              <textarea
                disabled={isSubmitting}
                value={product.wash_care || ''}
                onChange={(e) =>
                  setProduct((p) => ({ ...p, wash_care: e.target.value }))
                }
                className={inputCls + ' h-20 resize-none'}
                placeholder="e.g. Machine wash cold inside out, dry flat in shade, iron low..."
              />
            </div>
          </div>
        )}

        {/* Actions buttons */}
        <div className="flex items-center justify-between border-t border-brand-cream-dark pt-5">
          <div>
            {step > 1 && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setStep((prev) => prev - 1)}
                className="flex items-center space-x-1.5 px-5 py-2 border border-brand-cream-dark text-brand-dark hover:bg-brand-cream rounded text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-5 py-2 border border-transparent text-brand-dark/50 hover:text-brand-brown rounded text-[10px] font-bold tracking-widest uppercase cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            {step < 4 ? (
              <button
                key="next-btn"
                type="button"
                onClick={() => setStep((prev) => prev + 1)}
                disabled={!isStepValid(step) || isSubmitting}
                className="flex items-center space-x-1.5 px-6 py-2.5 bg-brand-brown hover:bg-brand-brown-dark disabled:bg-brand-brown/40 text-white rounded text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                key="publish-btn"
                type="button"
                onClick={() => handleSubmit()}
                disabled={
                  !isStepValid(1) ||
                  !isStepValid(2) ||
                  !isStepValid(3) ||
                  !isStepValid(4) ||
                  additionalImagesUploading ||
                  sizeChartUploading ||
                  isSubmitting
                }
                className="px-6 py-2.5 bg-brand-brown hover:bg-brand-brown-dark disabled:bg-brand-brown/40 text-white rounded text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border border-white border-t-transparent animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : editingProduct ? (
                  'Update Product'
                ) : (
                  'Publish Product'
                )}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Live Card Preview Column */}
      <ProductPreviewCard
        target={product as any}
        activeCategoryId={subId || parentId}
        categories={categories}
      />
    </div>
  );
}
