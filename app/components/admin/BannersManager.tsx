'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Upload, Trash2, Link as LinkIcon, FolderOpen, Pencil } from 'lucide-react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { uploadImage, deleteImages } from '@/lib/db';
import type { Banner } from '@/lib/types';

const BLANK_BANNER = {
  image_url: '',
  redirect_url: '',
  tagline: '',
  title: '',
  discount: '',
  bg_split_left: 'left',
  bg_split_right: '',
};

interface BannersManagerProps {
  setErrorMsg: (msg: string) => void;
  setSuccessMsg: (msg: string) => void;
}

export default function BannersManager({
  setErrorMsg,
  setSuccessMsg,
}: BannersManagerProps) {
  const { banners, addBanner, updateBanner, deleteBanner, categories } = useStore();

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
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
      setEditingBanner(null);
      setNewBanner({ ...BLANK_BANNER });
      setSelectedCategoryId('');
      setRedirectType('category');
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

  // Handle clicking edit on an existing banner card
  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setNewBanner({
      image_url: banner.image_url || '',
      redirect_url: banner.redirect_url || '',
      tagline: banner.tagline || '',
      title: banner.title || '',
      discount: banner.discount || '',
      bg_split_left: banner.bg_split_left || 'left',
      bg_split_right: banner.bg_split_right || '',
    });

    if (banner.redirect_url?.startsWith('/?category=')) {
      const catId = banner.redirect_url.split('=')[1];
      setRedirectType('category');
      setSelectedCategoryId(catId);
    } else {
      setRedirectType('custom');
      setSelectedCategoryId('');
    }

    setIsAddFormOpen(true);
  };

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
      const payload = {
        image_url: newBanner.image_url,
        redirect_url: newBanner.redirect_url,
        tagline: newBanner.tagline.trim() || null,
        title: newBanner.title.trim() || null,
        discount: newBanner.discount.trim() || null,
        bg_split_left: newBanner.bg_split_left || 'left',
        bg_split_right: newBanner.bg_split_right.trim() || null,
      } as Partial<Banner>;

      if (editingBanner) {
        const { error } = await updateBanner(editingBanner.id, payload);
        if (error) throw error;
        setSuccessMsg('Hero banner updated successfully!');
      } else {
        const { error } = await addBanner(payload);
        if (error) throw error;
        setSuccessMsg('Hero banner added successfully!');
      }

      setNewBanner({ ...BLANK_BANNER });
      setEditingBanner(null);
      setSelectedCategoryId('');
      setRedirectType('category');
      setSessionUploadedUrls([]);
      setIsAddFormOpen(false);
    } catch {
      setErrorMsg('Failed to save banner slide.');
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
    'text-[9px] font-bold text-brand-dark/60 uppercase tracking-wider block mb-1';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-serif text-lg text-brand-dark uppercase">
            Hero Banners (21:9)
          </h3>
          <p className="text-[10px] text-brand-dark/50 uppercase tracking-widest mt-0.5">
            Configure 21:9 hero sliders with custom headlines, taglines, and buttons
          </p>
        </div>
        <button
          disabled={isSubmitting}
          onClick={() => {
            setEditingBanner(null);
            setNewBanner({ ...BLANK_BANNER });
            setIsAddFormOpen(!isAddFormOpen);
          }}
          className="flex items-center space-x-1.5 px-6 py-2.5 bg-brand-brown hover:bg-brand-brown-dark text-white rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Hero Banner</span>
        </button>
      </div>

      {isAddFormOpen && (
        <form
          onSubmit={handleAddBannerSubmit}
          className="bg-white border border-brand-cream-dark rounded-xl p-6 shadow-sm space-y-6 animate-fade-in"
        >
          <h4 className="font-serif text-sm text-brand-dark uppercase tracking-wider pb-2 border-b border-brand-cream-dark">
            {editingBanner ? 'Edit Hero Banner Slide' : 'Add New 21:9 Hero Slide'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image section */}
            <div className="flex flex-col space-y-4">
              <div>
                <label className={labelCls}>Banner Image (21:9 Aspect Ratio)</label>
                <p className="text-[8px] text-brand-dark/40 font-bold uppercase tracking-wider leading-relaxed">
                  Recommended size: 2100x900px or 1920x820px
                </p>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer border border-dashed border-brand-cream-dark rounded-xl px-4 py-4 hover:bg-brand-cream/20 transition-colors w-full justify-center text-center">
                <Upload className="w-4 h-4 text-brand-brown" />
                <span className="text-[10px] font-bold text-brand-dark/60 tracking-widest uppercase">
                  {bannerImageUploading ? 'Uploading...' : newBanner.image_url ? 'Replace Image' : 'Upload 21:9 Image'}
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
                <div className="relative w-full aspect-[21/9] border border-brand-cream-dark rounded-xl overflow-hidden shadow-3xs bg-black">
                  <Image
                    src={newBanner.image_url}
                    alt="banner preview"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}

              {/* Text Position Alignment */}
              <div>
                <label className={labelCls}>Text & Buttons Alignment</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setNewBanner((b) => ({ ...b, bg_split_left: 'left' }))}
                    className={`px-3 py-2 border rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      newBanner.bg_split_left !== 'right'
                        ? 'border-brand-brown bg-brand-brown text-white shadow-3xs'
                        : 'border-brand-cream-dark bg-white text-brand-dark'
                    }`}
                  >
                    Align Left
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewBanner((b) => ({ ...b, bg_split_left: 'right' }))}
                    className={`px-3 py-2 border rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      newBanner.bg_split_left === 'right'
                        ? 'border-brand-brown bg-brand-brown text-white shadow-3xs'
                        : 'border-brand-cream-dark bg-white text-brand-dark'
                    }`}
                  >
                    Align Right
                  </button>
                </div>
              </div>
            </div>

            {/* Content & Redirection section */}
            <div className="flex flex-col space-y-4">
              {/* Tagline / Small Custom Title */}
              <div>
                <label className={labelCls}>Small Custom Tagline (e.g. COUPLE COLLECTION)</label>
                <input
                  disabled={isSubmitting}
                  value={newBanner.tagline}
                  onChange={(e) => setNewBanner((b) => ({ ...b, tagline: e.target.value }))}
                  className={inputCls}
                  placeholder="e.g. COUPLE COLLECTION or LIMITED DROP"
                />
              </div>

              {/* Main Headline Title */}
              <div>
                <label className={labelCls}>Main Headline Title (e.g. MATCH YOUR VIBE.)</label>
                <input
                  disabled={isSubmitting}
                  value={newBanner.title}
                  onChange={(e) => setNewBanner((b) => ({ ...b, title: e.target.value }))}
                  className={inputCls}
                  placeholder="e.g. MATCH YOUR VIBE."
                />
              </div>

              {/* Title Description */}
              <div>
                <label className={labelCls}>Title Description</label>
                <textarea
                  disabled={isSubmitting}
                  value={newBanner.discount}
                  onChange={(e) => setNewBanner((b) => ({ ...b, discount: e.target.value }))}
                  rows={2}
                  className={inputCls}
                  placeholder="e.g. Premium oversized tees and crop tops designed for couples who wear confidence together."
                />
              </div>

              {/* Secondary Button Text */}
              <div>
                <label className={labelCls}>Secondary Button Label (Optional, e.g. EXPLORE THE COLLECTION)</label>
                <input
                  disabled={isSubmitting}
                  value={newBanner.bg_split_right}
                  onChange={(e) => setNewBanner((b) => ({ ...b, bg_split_right: e.target.value }))}
                  className={inputCls}
                  placeholder="e.g. EXPLORE THE COLLECTION"
                />
              </div>

              {/* Redirection */}
              <div>
                <label className={labelCls}>Redirection Target</label>
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
                  <select
                    disabled={isSubmitting}
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">-- Choose Category --</option>
                    {categoryOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex flex-col space-y-1">
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
                  <span>SAVING...</span>
                </>
              ) : editingBanner ? (
                'Update Hero Banner'
              ) : (
                'Save Hero Banner'
              )}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setIsAddFormOpen(false);
                setEditingBanner(null);
              }}
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
          const isRight = banner.bg_split_left === 'right';

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
                <div className="relative aspect-[21/9] bg-black border-b border-brand-cream-dark/50 overflow-hidden">
                  {banner.image_url && (
                    <Image
                      src={banner.image_url}
                      alt={banner.title || 'Hero Banner'}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  )}
                  {/* Position Badge Overlay */}
                  <span className="absolute top-2 right-2 z-10 text-[8px] font-bold uppercase tracking-wider bg-black/80 text-[#FFCB05] px-2 py-0.5 border border-[#FFCB05]/40 rounded">
                    {isRight ? 'ALIGN RIGHT' : 'ALIGN LEFT'}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  {banner.tagline && (
                    <span className="text-[9px] font-bold text-[#E63B2E] uppercase tracking-wider block">
                      {banner.tagline}
                    </span>
                  )}
                  {banner.title && (
                    <h4 className="font-serif text-sm font-bold text-brand-dark uppercase truncate">
                      {banner.title}
                    </h4>
                  )}
                  {banner.discount && (
                    <p className="text-[10px] text-brand-dark/70 line-clamp-2">
                      {banner.discount}
                    </p>
                  )}
                  <div className="pt-1">
                    <p className="font-sans text-[8px] font-bold text-brand-dark/40 uppercase tracking-widest">
                      Redirection Target
                    </p>
                    <p className="font-sans text-xs text-brand-brown font-bold truncate uppercase tracking-wider">
                      {getRedirectLabel(banner.redirect_url)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 pt-0 flex gap-2">
                <button
                  onClick={() => handleEditBanner(banner)}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 border border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-white rounded text-[9px] font-bold tracking-widest uppercase transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  disabled={isBeingDeleted}
                  onClick={() => handleDeleteBanner(banner.id)}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 border border-red-200 text-red-600 hover:bg-red-50 rounded text-[9px] font-bold tracking-widest uppercase transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isBeingDeleted ? (
                    <div className="w-3 h-3 rounded-full border border-red-600 border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
        {banners.length === 0 && (
          <div className="col-span-full text-center py-12 text-brand-dark/40 text-[9.5px] font-bold tracking-widest uppercase border border-dashed border-brand-cream-dark rounded-xl bg-brand-cream/5">
            No 21:9 hero banners configured. Add your first hero banner above.
          </div>
        )}
      </div>
    </div>
  );
}


