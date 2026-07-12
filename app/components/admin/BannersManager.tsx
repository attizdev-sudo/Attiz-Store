'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Upload, Trash2, Link as LinkIcon, FolderOpen } from 'lucide-react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { uploadImage, deleteImages } from '@/lib/db';
import type { Banner } from '@/lib/types';

const BLANK_BANNER = {
  image_url: '',
  redirect_url: '',
};

interface BannersManagerProps {
  setErrorMsg: (msg: string) => void;
  setSuccessMsg: (msg: string) => void;
}

export default function BannersManager({
  setErrorMsg,
  setSuccessMsg,
}: BannersManagerProps) {
  const { banners, addBanner, deleteBanner, categories } = useStore();

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newBanner, setNewBanner] = useState({ ...BLANK_BANNER });

  // Redirection helpers
  const [redirectType, setRedirectType] = useState<'category' | 'custom'>('category');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // Loading states
  const [bannerImageUploading, setBannerImageUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sessionUploadedUrls, setSessionUploadedUrls] = useState<string[]>([]);

  // Cleanup newly uploaded banner images that weren't saved when the form is closed/cancelled
  useEffect(() => {
    if (!isAddFormOpen) {
      if (sessionUploadedUrls.length > 0) {
        const urlsToDelete = [...sessionUploadedUrls];
        setSessionUploadedUrls([]);
        
        const performCleanup = async () => {
          try {
            await deleteImages('banner-images', urlsToDelete);
          } catch (err) {
            console.error('Error cleaning up unsaved banner images:', err);
          }
        };
        performCleanup();
      }
    }
  }, [isAddFormOpen, sessionUploadedUrls]);

  // Sync category selection with redirect URL
  useEffect(() => {
    if (redirectType === 'category') {
      if (selectedCategoryId) {
        setNewBanner((prev) => ({ ...prev, redirect_url: `/?category=${selectedCategoryId}` }));
      } else {
        setNewBanner((prev) => ({ ...prev, redirect_url: '' }));
      }
    }
  }, [redirectType, selectedCategoryId]);

  // Generate category options (hierarchical sorting)
  const categoryOptions = categories.map((cat) => {
    const parent = cat.parent_id ? categories.find((c) => c.id === cat.parent_id) : null;
    return {
      id: cat.id,
      name: parent ? `${parent.name.toUpperCase()} > ${cat.name.toUpperCase()}` : cat.name.toUpperCase(),
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  const handleBannerImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setBannerImageUploading(true);
      setErrorMsg('');
      const url = await uploadImage('banner-images', file);
      setNewBanner((prev) => ({ ...prev, image_url: url }));
      setSessionUploadedUrls((prev) => [...prev, url]);
      setSuccessMsg('Banner image uploaded!');
    } catch {
      setErrorMsg('Failed to upload banner image.');
    } finally {
      setBannerImageUploading(false);
    }
  };

  const handleAddBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!newBanner.image_url) {
      setErrorMsg('Please upload a banner image.');
      return;
    }
    if (!newBanner.redirect_url) {
      setErrorMsg('Please select or enter a redirection target.');
      return;
    }
    try {
      setIsSubmitting(true);
      const { error } = await addBanner({
        image_url: newBanner.image_url,
        redirect_url: newBanner.redirect_url,
      } as Partial<Banner>);
      if (error) throw error;
      setSuccessMsg('Banner slide added successfully!');
      setNewBanner({ ...BLANK_BANNER });
      setSelectedCategoryId('');
      setRedirectType('category');
      setSessionUploadedUrls([]);
      setIsAddFormOpen(false);
    } catch {
      setErrorMsg('Failed to add banner.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Delete this banner slide?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setDeletingId(id);
      const { error } = await deleteBanner(id);
      if (error) throw error;
      setSuccessMsg('Banner deleted.');
    } catch {
      setErrorMsg('Failed to delete banner.');
    } finally {
      setDeletingId(null);
    }
  };

  const sortedBanners = [...banners].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });

  const inputCls =
    'px-3 py-2 text-xs border border-brand-cream-dark rounded bg-white outline-none focus:border-brand-brown font-sans w-full transition-all disabled:opacity-50';
  const labelCls =
    'text-[9px] font-bold text-brand-dark/50 uppercase tracking-wider block mb-1';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-serif text-lg text-brand-dark uppercase">
            Hero Banners
          </h3>
          <p className="text-[10px] text-brand-dark/50 uppercase tracking-widest mt-0.5">
            Configure promotional sliders and hero campaigns
          </p>
        </div>
        <button
          disabled={isSubmitting}
          onClick={() => setIsAddFormOpen(!isAddFormOpen)}
          className="flex items-center space-x-1.5 px-6 py-2.5 bg-brand-brown hover:bg-brand-brown-dark text-white rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Banner</span>
        </button>
      </div>

      {isAddFormOpen && (
        <form
          onSubmit={handleAddBannerSubmit}
          className="bg-white border border-brand-cream-dark rounded-xl p-6 shadow-sm space-y-5 animate-fade-in"
        >
          <h4 className="font-serif text-sm text-brand-dark uppercase tracking-wider pb-2 border-b border-brand-cream-dark">
            Add Banner Slide
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image section */}
            <div className="flex flex-col space-y-2">
              <div>
                <label className={labelCls}>Banner Image</label>
                <p className="text-[8px] text-brand-dark/40 font-bold uppercase tracking-wider leading-relaxed">
                  Recommended aspect ratio: 21:9 (e.g., 1920x820px or 2100x900px)
                </p>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer border border-dashed border-brand-cream-dark rounded-xl px-4 py-4 hover:bg-brand-cream/20 transition-colors w-full justify-center text-center">
                <Upload className="w-4 h-4 text-brand-brown" />
                <span className="text-[10px] font-bold text-brand-dark/60 tracking-widest uppercase">
                  {bannerImageUploading ? 'Uploading...' : 'Upload Banner Image'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerImageUpload}
                  className="hidden"
                  disabled={bannerImageUploading || isSubmitting}
                />
              </label>
              {newBanner.image_url && (
                <div className="relative w-full aspect-[21/9] border border-brand-cream-dark rounded overflow-hidden shadow-3xs bg-[#F7F3EE]">
                  <Image
                    src={newBanner.image_url}
                    alt="banner preview"
                    fill
                    className="object-contain object-center"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
            </div>

            {/* Redirection section */}
            <div className="flex flex-col space-y-4 justify-start">
              <div>
                <label className={labelCls}>Redirection Type</label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setRedirectType('category');
                      setNewBanner((prev) => ({ ...prev, redirect_url: selectedCategoryId ? `/?category=${selectedCategoryId}` : '' }));
                    }}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 border rounded text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                      redirectType === 'category'
                        ? 'border-brand-brown bg-brand-brown text-white shadow-3xs'
                        : 'border-brand-cream-dark bg-white text-brand-dark hover:border-brand-brown/40'
                    }`}
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Category Redirect</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRedirectType('custom');
                      setNewBanner((prev) => ({ ...prev, redirect_url: '' }));
                    }}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 border rounded text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                      redirectType === 'custom'
                        ? 'border-brand-brown bg-brand-brown text-white shadow-3xs'
                        : 'border-brand-cream-dark bg-white text-brand-dark hover:border-brand-brown/40'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Custom Link</span>
                  </button>
                </div>
              </div>

              {redirectType === 'category' ? (
                <div className="flex flex-col space-y-1">
                  <label className={labelCls}>Select Redirection Category</label>
                  <select
                    disabled={isSubmitting}
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">-- Choose Category or Subcategory --</option>
                    {categoryOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex flex-col space-y-1">
                  <label className={labelCls}>Custom Redirect URL</label>
                  <input
                    disabled={isSubmitting}
                    value={newBanner.redirect_url}
                    onChange={(e) =>
                      setNewBanner((b) => ({ ...b, redirect_url: e.target.value }))
                    }
                    className={inputCls}
                    placeholder="e.g. /about, /orders or /"
                  />
                </div>
              )}

              {newBanner.redirect_url && (
                <div className="bg-brand-cream/30 border border-brand-cream-dark/60 rounded-lg p-3 text-[10px]">
                  <span className="font-bold text-brand-dark/50 uppercase block">Generated Redirect URL</span>
                  <span className="font-mono text-brand-brown font-semibold mt-0.5 block">{newBanner.redirect_url}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-brand-cream-dark/60">
            <button
              type="submit"
              disabled={isSubmitting || bannerImageUploading}
              className="px-6 py-2.5 bg-brand-brown hover:bg-brand-brown-dark text-white rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 rounded-full border border-white border-t-transparent animate-spin" />
                  <span>ADDING...</span>
                </>
              ) : (
                'Add Banner'
              )}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsAddFormOpen(false)}
              className="px-6 py-2.5 border border-brand-cream-dark text-brand-dark hover:bg-brand-cream rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedBanners.map((banner) => {
          const isBeingDeleted = deletingId === banner.id;

          const getRedirectLabel = (url: string) => {
            if (url.startsWith('/?category=')) {
              const catId = url.split('=')[1];
              const cat = categories.find((c) => c.id === catId);
              if (cat) {
                const parent = cat.parent_id ? categories.find((c) => c.id === cat.parent_id) : null;
                return `Category: ${parent ? `${parent.name} > ` : ''}${cat.name}`;
              }
            }
            return `Link: ${url}`;
          };

          return (
            <div
              key={banner.id}
              className="relative bg-white border border-brand-cream-dark rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-shadow group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[21/9] bg-[#F7F3EE] border-b border-brand-cream-dark/50">
                  {banner.image_url && (
                    <Image
                      src={banner.image_url}
                      alt="Hero Banner"
                      fill
                      className="object-contain object-center"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  )}
                </div>
                <div className="p-4">
                  <p className="font-sans text-[8.5px] font-bold text-brand-dark/50 uppercase tracking-widest">
                    Redirection Target
                  </p>
                  <p className="font-sans text-xs text-brand-brown font-bold mt-1 truncate uppercase tracking-wider">
                    {getRedirectLabel(banner.redirect_url)}
                  </p>
                </div>
              </div>
              <div className="p-4 pt-0">
                <button
                  disabled={isBeingDeleted}
                  onClick={() => handleDeleteBanner(banner.id)}
                  className="flex items-center justify-center space-x-1.5 py-2 px-3 border border-red-200 text-red-600 hover:bg-red-50 rounded text-[9px] font-bold tracking-widest uppercase transition-colors cursor-pointer w-full disabled:opacity-50"
                >
                  {isBeingDeleted ? (
                    <div className="w-3 h-3 rounded-full border border-red-600 border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Banner</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
        {banners.length === 0 && (
          <div className="col-span-full text-center py-12 text-brand-dark/40 text-[9.5px] font-bold tracking-widest uppercase border border-dashed border-brand-cream-dark rounded-xl bg-brand-cream/5">
            No banners configured. Add your first banner above.
          </div>
        )}
      </div>
    </div>
  );
}
