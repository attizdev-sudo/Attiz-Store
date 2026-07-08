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

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: any | null;
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
  const [parentId, setParentId] = useState('');
  const [subId, setSubId] = useState('');

  // 1. Product fields
  const [productData, setProductData] = useState({
    title: '',
    description: '',
    specifications: '',
    wash_care: '',
    size_chart: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
  });

  // 2. Active sizes & colors list
  const [colors, setColors] = useState<string[]>(['Black', 'Dark Wine', 'Teal']);
  const [sizes, setSizes] = useState<string[]>(['S', 'M', 'L', 'XL', 'XXL']);

  // 3. Media Pool: Renders the central gallery pool (like Shopify)
  const [mediaPool, setMediaPool] = useState<string[]>([]);
  const [mediaPoolUploading, setMediaPoolUploading] = useState(false);
  const [sizeChartUploading, setSizeChartUploading] = useState(false);

  // 4. Color-specific assignments mapping: Record<colorName, array of mediaPool urls>
  const [colorImages, setColorImages] = useState<Record<string, string[]>>({});
  const [activeAssignColor, setActiveAssignColor] = useState<string | null>(null);

  // 5. Variant defaults for quick initialization
  const [defaultPrice, setDefaultPrice] = useState('799');
  const [defaultDiscount, setDefaultDiscount] = useState('0');
  const [defaultStock, setDefaultStock] = useState('100');

  // 6. Variant matrix: Record<`${color}-${size}`, { price, discount, stock, sku }>
  const [variantInputs, setVariantInputs] = useState<Record<string, { price: string; discount: string; stock: string; sku: string }>>({});

  // Local UI temporary inputs
  const [customSize, setCustomSize] = useState('');
  const [colorInput, setColorInput] = useState('');

  // Submission loaders and status message tracking
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  // Sync state when entering edit mode
  useEffect(() => {
    if (editingProduct) {
      setProductData({
        title: editingProduct.title || '',
        description: editingProduct.description || '',
        specifications: editingProduct.specifications || '',
        wash_care: editingProduct.wash_care || '',
        size_chart: editingProduct.size_chart || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
      });

      const variants = editingProduct.product_variants || [];
      const colorsList = Array.from(new Set(variants.map((v: any) => v.color))) as string[];
      const sizesList = Array.from(new Set(variants.map((v: any) => v.size))) as string[];

      setColors(colorsList.length > 0 ? colorsList : ['Black', 'Dark Wine', 'Teal']);
      setSizes(sizesList.length > 0 ? sizesList : ['S', 'M', 'L', 'XL', 'XXL']);

      const inputs: Record<string, any> = {};
      const imgMap: Record<string, string[]> = {};
      const poolUrls: string[] = [];

      variants.forEach((v: any) => {
        const key = `${v.color}-${v.size}`;
        inputs[key] = {
          price: String(v.price),
          discount: String(v.discount ?? 0),
          stock: String(v.stock),
          sku: v.sku || '',
        };

        if (v.product_variant_images) {
          if (!imgMap[v.color]) imgMap[v.color] = [];
          v.product_variant_images.forEach((img: any) => {
            if (!imgMap[v.color].includes(img.image_url)) {
              imgMap[v.color].push(img.image_url);
            }
            if (!poolUrls.includes(img.image_url)) {
              poolUrls.push(img.image_url);
            }
          });
        }
      });

      setVariantInputs(inputs);
      setColorImages(imgMap);
      setMediaPool(poolUrls);

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
      setProductData({
        title: '',
        description: '',
        specifications: '',
        wash_care: '',
        size_chart: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
      });
      setColors(['Black', 'Dark Wine', 'Teal']);
      setSizes(['S', 'M', 'L', 'XL', 'XXL']);
      setMediaPool([]);
      setVariantInputs({});
      setColorImages({});
      setParentId('');
      setSubId('');
    }
    setStep(1);
    setCustomSize('');
    setColorInput('');
  }, [editingProduct, categories, isOpen]);

  // Sync variations matrix when colors or sizes change
  useEffect(() => {
    setVariantInputs((prev) => {
      const next: Record<string, any> = {};
      colors.forEach((color) => {
        sizes.forEach((size) => {
          const key = `${color}-${size}`;
          if (prev[key]) {
            next[key] = prev[key];
          } else {
            next[key] = {
              price: defaultPrice,
              discount: defaultDiscount,
              stock: defaultStock,
              sku: '',
            };
          }
        });
      });
      return next;
    });
  }, [colors, sizes]);

  if (!isOpen) return null;

  // Step Validator
  const isStepValid = (stepNumber: number) => {
    if (stepNumber === 1) {
      return (
        productData.title.trim().length > 0 &&
        (parentId.length > 0 || subId.length > 0)
      );
    }
    if (stepNumber === 2) {
      // Media Pool: Must have at least 1 image uploaded in pool
      return mediaPool.length > 0 && !mediaPoolUploading && !sizeChartUploading;
    }
    if (stepNumber === 3) {
      // Attributes & Assignment: Colors and sizes are selected
      // Also softly verify that every color has at least one image assigned
      return (
        colors.length > 0 &&
        sizes.length > 0 &&
        colors.every((c) => colorImages[c] && colorImages[c].length > 0)
      );
    }
    if (stepNumber === 4) {
      return (
        productData.description.trim().length > 0 &&
        productData.specifications.trim().length > 0 &&
        productData.wash_care.trim().length > 0
      );
    }
    return true;
  };

  // Uploader to Central Media Pool
  const handleMediaPoolUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      setMediaPoolUploading(true);
      setErrorMsg('');
      const urls = await Promise.all(
        files.map((f) => uploadImage('product-images', f))
      );
      setMediaPool((prev) => [...prev, ...urls]);
      setSuccessMsg(`Successfully uploaded ${files.length} image(s) to pool!`);
    } catch {
      setErrorMsg('Failed to upload some images.');
    } finally {
      setMediaPoolUploading(false);
      e.target.value = '';
    }
  };

  const deleteFromPool = (index: number) => {
    const deletedUrl = mediaPool[index];
    setMediaPool((prev) => prev.filter((_, i) => i !== index));
    // Clean up color mappings
    setColorImages((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((color) => {
        next[color] = next[color].filter((url) => url !== deletedUrl);
      });
      return next;
    });
  };

  // Size chart single uploader
  const handleSizeChartUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSizeChartUploading(true);
      setErrorMsg('');
      const url = await uploadImage('product-images', file);
      setProductData((prev) => ({ ...prev, size_chart: url }));
      setSuccessMsg('Size chart uploaded successfully!');
    } catch {
      setErrorMsg('Failed to upload size chart.');
    } finally {
      setSizeChartUploading(false);
    }
  };

  // Variant Inputs custom values
  const handleVariantInputChange = (
    color: string,
    size: string,
    field: string,
    value: string
  ) => {
    const key = `${color}-${size}`;
    setVariantInputs((prev) => {
      const current = prev[key] || {
        price: defaultPrice,
        discount: defaultDiscount,
        stock: defaultStock,
        sku: '',
      };
      return {
        ...prev,
        [key]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  // Color selection triggers
  const addColorTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = colorInput.trim();
      if (!val) return;
      if (!colors.includes(val)) {
        setColors((prev) => [...prev, val]);
      }
      setColorInput('');
    }
  };

  const removeColorTag = (col: string) => {
    setColors((prev) => prev.filter((c) => c !== col));
    setColorImages((prev) => {
      const next = { ...prev };
      delete next[col];
      return next;
    });
  };

  // Sizes selection triggers
  const toggleSize = (sz: string) => {
    setSizes((prev) =>
      prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz]
    );
  };

  const addCustomSizeTag = (e: React.FormEvent) => {
    e.preventDefault();
    const val = customSize.trim();
    if (!val) return;
    if (!sizes.includes(val)) {
      setSizes((prev) => [...prev, val]);
    }
    setCustomSize('');
  };

  // Save/Submit triggers with Dynamic Status Progress indicators
  const handleSubmit = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    const categoryId = subId || parentId || null;
    if (!categoryId) {
      setErrorMsg('Please specify a category.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Step 1 status
      setSubmitStatus('Validating product datasets...');
      await new Promise((r) => setTimeout(r, 600));

      const productPayload = {
        title: productData.title.trim(),
        description: productData.description.trim(),
        specifications: productData.specifications.trim(),
        wash_care: productData.wash_care.trim(),
        category_id: categoryId,
      };

      const variantsPayload: any[] = [];
      colors.forEach((color) => {
        sizes.forEach((size) => {
          const key = `${color}-${size}`;
          const input = variantInputs[key] || {
            price: defaultPrice,
            discount: defaultDiscount,
            stock: defaultStock,
            sku: '',
          };
          variantsPayload.push({
            color,
            size,
            stock: parseInt(input.stock, 10) || 0,
            price: parseFloat(input.price) || 0,
            discount: parseFloat(input.discount) || 0,
            sku: input.sku || null,
            images: colorImages[color] || [],
          });
        });
      });

      const payload = {
        product: productPayload,
        variants: variantsPayload,
      };

      // Step 2 status
      setSubmitStatus(
        editingProduct ? 'Updating base product record...' : 'Creating base product entry...'
      );
      await new Promise((r) => setTimeout(r, 500));

      // Step 3 status
      setSubmitStatus('Generating variations matrix and mapping color galleries...');
      
      if (editingProduct && editingProduct.id) {
        const { error } = await editProduct(editingProduct.id, payload as any);
        if (error) throw error;
        setSubmitStatus('Finalizing database synchronization...');
        await new Promise((r) => setTimeout(r, 400));
        setSuccessMsg('Product and variants updated successfully!');
      } else {
        const { error } = await addProduct(payload as any);
        if (error) throw error;
        setSubmitStatus('Finalizing database synchronization...');
        await new Promise((r) => setTimeout(r, 400));
        setSuccessMsg('Product and variants added successfully!');
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to save product configurations.');
    } finally {
      setIsSubmitting(false);
      setSubmitStatus('');
    }
  };

  const inputCls =
    'px-3 py-2 text-xs border border-brand-cream-dark rounded bg-white outline-none focus:border-brand-brown font-sans w-full transition-all disabled:opacity-50';
  const labelCls =
    'text-[9px] font-bold text-brand-dark/50 uppercase tracking-wider block mb-1';

  // Stepper Component
  const RenderStepperBar = () => {
    const steps = [
      { num: 1, label: 'Identity' },
      { num: 2, label: 'Media Gallery' },
      { num: 3, label: 'Variants Config' },
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
                className="flex items-center space-x-2.5 focus:outline-none group cursor-pointer disabled:opacity-50"
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in relative">
      <div className="lg:col-span-2 bg-white border border-brand-cream-dark rounded-xl p-6 shadow-sm space-y-6">
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

        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="flex flex-col">
              <label className={labelCls}>Product Title</label>
              <input
                required
                disabled={isSubmitting}
                value={productData.title}
                onChange={(e) =>
                  setProductData((p) => ({ ...p, title: e.target.value }))
                }
                className={inputCls}
                placeholder="e.g. Premium Cotton Polo"
              />
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

        {/* Step 2: Media Gallery Central Pool (Shopify Style) */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex flex-col space-y-2.5">
              <label className={labelCls}>Product Images Pool</label>
              <p className="text-[8.5px] text-brand-dark/45 uppercase tracking-widest leading-normal mb-1">Upload all product images here. You will assign them to specific colors in the next step.</p>
              
              <label className="flex flex-col items-center justify-center border border-dashed border-brand-cream-dark rounded-xl px-6 py-8 bg-brand-cream/5 hover:bg-brand-cream/15 transition-all cursor-pointer text-center group">
                <Upload className="w-6 h-6 text-brand-brown mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-serif text-[10.5px] font-bold text-brand-dark tracking-wider uppercase mb-1">
                  {mediaPoolUploading ? 'Uploading to Pool...' : 'Upload General Media Pool'}
                </span>
                <span className="text-[8px] text-brand-dark/40 uppercase tracking-widest">Supports multiple files, jpeg/png formats.</span>
                <input type="file" multiple accept="image/*" disabled={mediaPoolUploading || isSubmitting} onChange={handleMediaPoolUpload} className="hidden" />
              </label>

              {/* Pool Gallery View */}
              {mediaPool.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4 border-t border-brand-cream-dark/40 pt-4">
                  {mediaPool.map((url, i) => (
                    <div key={i} className="relative aspect-3/4 bg-brand-cream border border-brand-cream-dark rounded-md overflow-hidden group shadow-3xs">
                      <Image src={url} alt={`pool-media-${i}`} fill className="object-cover" sizes="120px" />
                      <div className="absolute inset-0 bg-brand-dark/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" disabled={isSubmitting} onClick={() => deleteFromPool(i)} className="p-1 rounded bg-white text-red-600 hover:bg-red-50 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border border-brand-cream-dark/30 rounded-xl bg-brand-cream/5 text-[9.5px] font-bold text-brand-dark/35 uppercase tracking-widest">
                  No media uploaded yet.
                </div>
              )}
            </div>

            {/* Size Chart Image Section */}
            <div className="border-t border-brand-cream-dark/60 pt-5 space-y-3">
              <label className={labelCls}>Size Chart Image</label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="flex items-center space-x-2.5 border border-brand-cream-dark rounded px-4 py-2 bg-white hover:bg-brand-cream cursor-pointer text-[10px] font-bold text-brand-dark tracking-wider uppercase transition-colors shrink-0">
                  <Upload className="w-4 h-4 text-brand-brown" />
                  <span>{sizeChartUploading ? 'Uploading Size Chart...' : 'Change Size Chart'}</span>
                  <input type="file" accept="image/*" disabled={sizeChartUploading || isSubmitting} onChange={handleSizeChartUpload} className="hidden" />
                </label>
                
                {productData.size_chart && (
                  <div className="relative w-20 h-14 bg-brand-cream border border-brand-cream-dark rounded overflow-hidden">
                    <Image src={productData.size_chart} alt="size-chart" fill className="object-cover" sizes="80px" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Attributes, Default values & Shopify-style Image Assignment */}
        {step === 3 && (
          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
            {/* Sizes & Colors checklists */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col">
                <label className={labelCls}>Sizes Configured</label>
                <div className="flex flex-wrap gap-1 mb-2.5 border border-brand-cream-dark bg-brand-cream/5 p-2 rounded-lg min-h-[44px]">
                  {sizes.map((sz) => (
                    <span key={sz} className="flex items-center space-x-0.5 px-2 py-0.5 bg-white border border-brand-cream-dark text-brand-dark font-bold text-[8.5px] rounded animate-fade-in">
                      <span>{sz}</span>
                      <button type="button" disabled={isSubmitting} onClick={() => toggleSize(sz)} className="text-red-500 hover:text-red-700 font-bold focus:outline-none"><X className="w-2.5 h-2.5" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {STANDARD_SIZES.map((sz) => (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      key={sz}
                      onClick={() => toggleSize(sz)}
                      className={`px-2 py-1 border rounded text-[9px] font-bold transition-all cursor-pointer ${
                        sizes.includes(sz) ? 'bg-brand-brown border-brand-brown text-white shadow-xs' : 'bg-white border-brand-cream-dark text-brand-dark hover:border-brand-brown/40'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" disabled={isSubmitting} value={customSize} onChange={(e) => setCustomSize(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSizeTag(e); } }} placeholder="e.g. 4XL" className={inputCls + ' max-w-[130px]'} />
                  <button type="button" disabled={isSubmitting} onClick={addCustomSizeTag} className="text-[8.5px] text-brand-brown font-bold tracking-wider uppercase border border-brand-cream-dark px-3 rounded hover:bg-brand-cream cursor-pointer transition-colors">Add</button>
                </div>
              </div>

              <div className="flex flex-col">
                <label className={labelCls}>Colors tags (hit Enter to save)</label>
                <div className="flex flex-wrap gap-1 mb-2.5 border border-brand-cream-dark bg-brand-cream/5 p-2 rounded-lg min-h-[44px]">
                  {colors.map((col) => (
                    <span key={col} className="flex items-center space-x-0.5 px-2 py-0.5 bg-white border border-brand-cream-dark text-brand-dark/85 font-semibold text-[8.5px] rounded animate-fade-in">
                      <span>{col}</span>
                      <button type="button" disabled={isSubmitting} onClick={() => removeColorTag(col)} className="text-red-500 hover:text-red-700 font-bold focus:outline-none"><X className="w-2.5 h-2.5" /></button>
                    </span>
                  ))}
                </div>
                <input type="text" disabled={isSubmitting} value={colorInput} onChange={(e) => setColorInput(e.target.value)} onKeyDown={addColorTag} placeholder="e.g. Navy Blue" className={inputCls} />
              </div>
            </div>

            {/* Quick Pricing & Stock Defaults */}
            <div className="border border-brand-cream-dark bg-brand-cream/10 rounded-xl p-4 space-y-3">
              <h5 className="font-serif text-[11px] font-bold text-brand-dark uppercase tracking-wider">Configure Defaults</h5>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Default Price (₹)</label>
                  <input type="number" value={defaultPrice} onChange={(e) => setDefaultPrice(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Default Discount (%)</label>
                  <input type="number" min="0" max="100" value={defaultDiscount} onChange={(e) => setDefaultDiscount(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Default Stock</label>
                  <input type="number" value={defaultStock} onChange={(e) => setDefaultStock(e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>

            {/* Colors Config Grid - Assigning Pool Images (Shopify Style) */}
            <div className="space-y-4">
              <h5 className="font-serif text-xs font-bold text-brand-dark uppercase tracking-wider">Colors Galleries & Size Variations</h5>
              
              {colors.map((color) => {
                const imagesForColor = colorImages[color] || [];
                return (
                  <div key={color} className="border border-brand-cream-dark/60 rounded-xl p-4 bg-brand-cream/5 space-y-3">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-brand-cream-dark/30 pb-2.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-3.5 h-3.5 rounded-full border border-brand-cream-dark" style={{ backgroundColor: color.toLowerCase() }} />
                        <span className="font-serif text-[11px] font-bold text-brand-dark uppercase tracking-wider">{color} Gallery</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setActiveAssignColor(color)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-brown hover:bg-brand-brown-dark text-white rounded text-[8.5px] font-bold tracking-widest uppercase transition-colors shadow-3xs cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Assign Images ({imagesForColor.length})</span>
                      </button>
                    </div>

                    {/* Color Assigned Thumbnails */}
                    {imagesForColor.length > 0 ? (
                      <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                        {imagesForColor.map((url, i) => (
                          <div key={i} className="relative aspect-3/4 rounded border border-brand-cream-dark overflow-hidden bg-white">
                            <Image src={url} alt={`${color}-thumbnail-${i}`} fill className="object-cover" sizes="50px" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[8.5px] text-red-600 font-bold uppercase tracking-wider italic">
                        ⚠️ Please click "Assign Images" to assign pictures from the pool to this color.
                      </p>
                    )}

                    {/* Sizes Config Rows */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[10px] border-collapse">
                        <thead>
                          <tr className="border-b border-brand-cream-dark/30 text-[8px] font-bold uppercase text-brand-dark/45">
                            <th className="py-1 w-16">Size</th>
                            <th className="py-1 px-2">Price (₹)</th>
                            <th className="py-1 px-2">Discount (%)</th>
                            <th className="py-1 px-2">Stock</th>
                            <th className="py-1 px-2">SKU (Optional)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sizes.map((size) => {
                            const key = `${color}-${size}`;
                            const input = variantInputs[key] || { price: defaultPrice, discount: defaultDiscount, stock: defaultStock, sku: '' };
                            return (
                              <tr key={size} className="border-b border-brand-cream-dark/20 last:border-0">
                                <td className="py-1.5 font-bold text-brand-dark">{size}</td>
                                <td className="py-1 px-2">
                                  <input type="number" required value={input.price} onChange={(e) => handleVariantInputChange(color, size, 'price', e.target.value)} className="w-16 px-1.5 py-0.5 text-[10px] border border-brand-cream-dark rounded outline-none" />
                                </td>
                                <td className="py-1 px-2">
                                  <input type="number" min="0" max="100" value={input.discount} onChange={(e) => handleVariantInputChange(color, size, 'discount', e.target.value)} className="w-12 px-1.5 py-0.5 text-[10px] border border-brand-cream-dark rounded outline-none" />
                                </td>
                                <td className="py-1 px-2">
                                  <input type="number" required value={input.stock} onChange={(e) => handleVariantInputChange(color, size, 'stock', e.target.value)} className="w-12 px-1.5 py-0.5 text-[10px] border border-brand-cream-dark rounded outline-none" />
                                </td>
                                <td className="py-1 px-2">
                                  <input type="text" value={input.sku} onChange={(e) => handleVariantInputChange(color, size, 'sku', e.target.value)} className="w-24 px-1.5 py-0.5 text-[10px] border border-brand-cream-dark rounded outline-none" placeholder="SKU-123" />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Details */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex flex-col">
              <label className={labelCls}>Description</label>
              <textarea
                disabled={isSubmitting}
                value={productData.description}
                onChange={(e) =>
                  setProductData((p) => ({ ...p, description: e.target.value }))
                }
                className={inputCls + ' h-24 resize-none'}
                placeholder="Details of drape, cut and premium organic materials..."
              />
            </div>
            <div className="flex flex-col">
              <label className={labelCls}>Specifications</label>
              <textarea
                disabled={isSubmitting}
                value={productData.specifications}
                onChange={(e) =>
                  setProductData((p) => ({ ...p, specifications: e.target.value }))
                }
                className={inputCls + ' h-20 resize-none'}
                placeholder="e.g. 100% Pima Cotton, 220 GSM..."
              />
            </div>
            <div className="flex flex-col">
              <label className={labelCls}>Wash Care</label>
              <textarea
                disabled={isSubmitting}
                value={productData.wash_care}
                onChange={(e) =>
                  setProductData((p) => ({ ...p, wash_care: e.target.value }))
                }
                className={inputCls + ' h-20 resize-none'}
                placeholder="e.g. Cold machine wash..."
              />
            </div>
          </div>
        )}

        {/* Buttons footer */}
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
                onClick={handleSubmit}
                disabled={
                  !isStepValid(1) ||
                  !isStepValid(2) ||
                  !isStepValid(3) ||
                  !isStepValid(4) ||
                  isSubmitting
                }
                className="px-6 py-2.5 bg-brand-brown hover:bg-brand-brown-dark disabled:bg-brand-brown/40 text-white rounded text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                {editingProduct ? 'Update Product' : 'Publish Product'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Storefront card preview */}
      <ProductPreviewCard
        target={
          {
            title: productData.title,
            price: defaultPrice,
            discount: defaultDiscount,
            sizes: sizes.join(','),
            colors: colors.join(','),
            image: colorImages[colors[0]]?.[0] || mediaPool[0] || '',
            description: productData.description,
          } as any
        }
        activeCategoryId={subId || parentId}
        categories={categories}
      />

      {/* central Assign Images Modal (Shopify style) */}
      {activeAssignColor && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-brand-dark/55 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-brand-cream-dark rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-brand-cream-dark bg-brand-cream/15 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3.5 h-3.5 rounded-full border border-brand-cream-dark" style={{ backgroundColor: activeAssignColor.toLowerCase() }} />
                <span className="font-serif text-xs font-bold text-brand-dark uppercase tracking-wider">Assign Images to {activeAssignColor}</span>
              </div>
              <button type="button" onClick={() => setActiveAssignColor(null)} className="text-brand-dark hover:text-brand-brown p-1.5 rounded-full hover:bg-brand-cream/50 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <p className="text-[9.5px] text-brand-dark/45 uppercase tracking-wider font-semibold">Select the images from the media pool that correspond to the color "{activeAssignColor}". click to select/deselect.</p>
              {mediaPool.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {mediaPool.map((url, index) => {
                    const isSelected = (colorImages[activeAssignColor] || []).includes(url);
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setColorImages((prev) => {
                            const current = prev[activeAssignColor] || [];
                            const next = current.includes(url)
                              ? current.filter((u) => u !== url)
                              : [...current, url];
                            return {
                              ...prev,
                              [activeAssignColor]: next,
                            };
                          });
                        }}
                        className={`relative aspect-3/4 bg-brand-cream border rounded-md overflow-hidden transition-all group cursor-pointer ${
                          isSelected ? 'border-brand-brown border-2 scale-[0.98] shadow-sm' : 'border-brand-cream-dark hover:border-brand-brown/40'
                        }`}
                      >
                        <Image src={url} alt={`pool-img-${index}`} fill className="object-cover" sizes="120px" />
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-brand-brown text-white p-0.5 rounded-full z-10 border border-white">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-brand-brown/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-brand-dark/45 text-[10px] font-bold uppercase tracking-wider border border-dashed border-brand-cream-dark rounded-xl bg-brand-cream/5">
                  No images uploaded in the Media Gallery. Please go back to step 2.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 border-t border-brand-cream-dark bg-brand-cream/15 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveAssignColor(null)}
                className="px-6 py-2 bg-brand-brown hover:bg-brand-brown-dark text-white rounded text-[10px] font-bold tracking-widest uppercase transition-colors shadow-xs cursor-pointer font-sans"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Dynamic Save Loader Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-dark/60 backdrop-blur-md animate-fade-in select-none">
          <div className="bg-white border border-brand-cream-dark p-8 sm:p-10 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full text-center space-y-6 animate-scale-up">
            {/* Spinner container */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-brand-cream/50" />
              <div className="absolute inset-0 rounded-full border-4 border-brand-brown border-t-transparent animate-spin" />
              <Upload className="w-6 h-6 text-brand-brown animate-pulse" />
            </div>

            {/* Status updates */}
            <div className="space-y-1.5">
              <h4 className="font-serif text-xs font-bold text-brand-dark uppercase tracking-widest">Publishing Premium Garment</h4>
              <p className="font-sans text-[10px] font-bold text-brand-brown uppercase tracking-wider animate-pulse">
                {submitStatus}
              </p>
            </div>

            {/* Custom progress tracker bar */}
            <div className="w-full bg-brand-cream h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-brown transition-all duration-500 ease-out"
                style={{
                  width:
                    submitStatus.includes('Validating') ? '25%' :
                    submitStatus.includes('Updating') || submitStatus.includes('Creating') ? '50%' :
                    submitStatus.includes('variations') ? '75%' : '95%'
                }}
              />
            </div>
            
            <p className="text-[8px] text-brand-dark/45 uppercase tracking-widest leading-normal">
              Please do not close this window or refresh the page while database synchronization is in progress.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
