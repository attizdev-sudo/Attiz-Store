'use client';

import React, { useState } from 'react';
import { Plus, Upload, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { uploadImage } from '@/lib/db';
import type { Banner } from '@/lib/types';

const BLANK_BANNER = {
  title: '',
  discount: '',
  tagline: '',
  bgSplitLeft: '#991b1b',
  bgSplitRight: '#0a0a0a',
  image: '',
};

interface BannersManagerProps {
  setErrorMsg: (msg: string) => void;
  setSuccessMsg: (msg: string) => void;
}

export default function BannersManager({
  setErrorMsg,
  setSuccessMsg,
}: BannersManagerProps) {
  const { banners, addBanner, deleteBanner } = useStore();

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newBanner, setNewBanner] = useState({ ...BLANK_BANNER });

  // Loading states
  const [bannerImageUploading, setBannerImageUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleBannerImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setBannerImageUploading(true);
      setErrorMsg('');
      const url = await uploadImage('product-images', file);
      setNewBanner((prev) => ({ ...prev, image: url }));
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
    if (!newBanner.image) {
      setErrorMsg('Please upload a banner image.');
      return;
    }
    try {
      setIsSubmitting(true);
      const { error } = await addBanner({
        title: newBanner.title || 'PROMOTIONAL OFFER',
        discount: newBanner.discount || 'SPECIAL DEAL',
        tagline: newBanner.tagline || '',
        bgSplitLeft: newBanner.bgSplitLeft || '#991b1b',
        bgSplitRight: newBanner.bgSplitRight || '#0a0a0a',
        image: newBanner.image,
      } as Partial<Banner>);
      if (error) throw error;
      setSuccessMsg('Banner slide added successfully!');
      setNewBanner({ ...BLANK_BANNER });
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
          className="bg-white border border-brand-cream-dark rounded-xl p-6 shadow-sm space-y-4"
        >
          <h4 className="font-serif text-sm text-brand-dark uppercase tracking-wider pb-2 border-b border-brand-cream-dark">
            Add Banner Slide
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label className={labelCls}>Title</label>
              <input
                disabled={isSubmitting}
                value={newBanner.title}
                onChange={(e) =>
                  setNewBanner((b) => ({ ...b, title: e.target.value }))
                }
                className={inputCls}
                placeholder="e.g. SUMMER SALE"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className={labelCls}>Discount Text</label>
              <input
                disabled={isSubmitting}
                value={newBanner.discount}
                onChange={(e) =>
                  setNewBanner((b) => ({ ...b, discount: e.target.value }))
                }
                className={inputCls}
                placeholder="e.g. FLAT 30% OFF"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className={labelCls}>Tagline</label>
              <input
                disabled={isSubmitting}
                value={newBanner.tagline}
                onChange={(e) =>
                  setNewBanner((b) => ({ ...b, tagline: e.target.value }))
                }
                className={inputCls}
                placeholder="e.g. Limited Time Offer"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className={labelCls}>Left BG Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  disabled={isSubmitting}
                  value={newBanner.bgSplitLeft}
                  onChange={(e) =>
                    setNewBanner((b) => ({ ...b, bgSplitLeft: e.target.value }))
                  }
                  className="w-10 h-9 border border-brand-cream-dark rounded cursor-pointer disabled:opacity-50"
                />
                <input
                  disabled={isSubmitting}
                  value={newBanner.bgSplitLeft}
                  onChange={(e) =>
                    setNewBanner((b) => ({ ...b, bgSplitLeft: e.target.value }))
                  }
                  className={inputCls + ' flex-1'}
                  placeholder="#991b1b"
                />
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <label className={labelCls}>Right BG Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  disabled={isSubmitting}
                  value={newBanner.bgSplitRight}
                  onChange={(e) =>
                    setNewBanner((b) => ({
                      ...b,
                      bgSplitRight: e.target.value,
                    }))
                  }
                  className="w-10 h-9 border border-brand-cream-dark rounded cursor-pointer disabled:opacity-50"
                />
                <input
                  disabled={isSubmitting}
                  value={newBanner.bgSplitRight}
                  onChange={(e) =>
                    setNewBanner((b) => ({
                      ...b,
                      bgSplitRight: e.target.value,
                    }))
                  }
                  className={inputCls + ' flex-1'}
                  placeholder="#0a0a0a"
                />
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
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerImageUpload}
                className="hidden"
                disabled={bannerImageUploading || isSubmitting}
              />
            </label>
            {newBanner.image && (
              <div className="relative w-32 h-20 border border-brand-cream-dark rounded overflow-hidden">
                <Image
                  src={newBanner.image}
                  alt="banner preview"
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((banner) => {
          const isBeingDeleted = deletingId === banner.id;

          return (
            <div
              key={banner.id}
              className="relative bg-white border border-brand-cream-dark rounded-xl overflow-hidden shadow-sm group"
            >
              <div
                className="relative h-32"
                style={{ backgroundColor: banner.bgSplitLeft }}
              >
                {banner.image && (
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className="object-cover opacity-80"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                )}
              </div>
              <div className="p-4">
                <p className="font-sans text-xs font-bold text-brand-dark truncate">
                  {banner.title}
                </p>
                <p className="font-sans text-[10px] text-brand-brown font-bold">
                  {banner.discount}
                </p>
                <p className="font-sans text-[9px] text-brand-dark/50 mt-0.5 truncate">
                  {banner.tagline}
                </p>
              </div>
              <button
                disabled={isBeingDeleted}
                onClick={() => handleDeleteBanner(banner.id)}
                className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isBeingDeleted ? (
                  <div className="w-3.5 h-3.5 rounded-full border border-red-500 border-t-transparent animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          );
        })}
        {banners.length === 0 && (
          <div className="col-span-full text-center py-10 text-brand-dark/40 text-xs font-bold tracking-widest uppercase">
            No banners yet. Add your first banner above.
          </div>
        )}
      </div>
    </div>
  );
}
