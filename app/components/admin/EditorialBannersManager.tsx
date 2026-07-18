'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Upload, Trash2, Link as LinkIcon, FolderOpen, Layers } from 'lucide-react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { uploadImage, deleteImages } from '@/lib/db';
import type { EditorialBanner } from '@/lib/types';

const BLANK_EDITORIAL_BANNER = {
  image_url: '',
  redirect_url: '',
  tag: '',
  title: '',
  subtitle: '',
  description: '',
  sort_order: 0,
};

interface EditorialBannersManagerProps {
  setErrorMsg: (msg: string) => void;
  setSuccessMsg: (msg: string) => void;
}

export default function EditorialBannersManager({
  setErrorMsg,
  setSuccessMsg,
}: EditorialBannersManagerProps) {
  const { editorialBanners, addEditorialBanner, deleteEditorialBanner, categories } = useStore();

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newBanner, setNewBanner] = useState({ ...BLANK_EDITORIAL_BANNER });

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
      setSuccessMsg('Editorial banner image uploaded!');
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
    if (!newBanner.tag.trim()) {
      setErrorMsg('Please enter a tag (e.g. Attiz Season 01).');
      return;
    }
    if (!newBanner.title.trim()) {
      setErrorMsg('Please enter a title.');
      return;
    }
    if (!newBanner.subtitle.trim()) {
      setErrorMsg('Please enter a subtitle.');
      return;
    }
    if (!newBanner.description.trim()) {
      setErrorMsg('Please enter a description.');
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await addEditorialBanner({
        image_url: newBanner.image_url,
        redirect_url: newBanner.redirect_url || '/#catalog-grid',
        tag: newBanner.tag.trim(),
        title: newBanner.title.trim(),
        subtitle: newBanner.subtitle.trim(),
        description: newBanner.description.trim(),
        sort_order: Number(newBanner.sort_order) || 0,
      } as Partial<EditorialBanner>);

      if (error) throw error;
      setSuccessMsg('Editorial banner added successfully!');
      setNewBanner({ ...BLANK_EDITORIAL_BANNER });
      setSelectedCategoryId('');
      setRedirectType('category');
      setSessionUploadedUrls([]);
      setIsAddFormOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add editorial banner.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Delete this editorial banner?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setDeletingId(id);
      const { error } = await deleteEditorialBanner(id);
      if (error) throw error;
      setSuccessMsg('Editorial banner deleted successfully.');
    } catch {
      setErrorMsg('Failed to delete editorial banner.');
    } finally {
      setDeletingId(null);
    }
  };

  const sortedBanners = [...editorialBanners].sort((a, b) => {
    return (a.sort_order || 0) - (b.sort_order || 0);
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
            Editorial Banners
          </h3>
          <p className="text-[10px] text-brand-dark/50 uppercase tracking-widest mt-0.5">
            Configure rich copywriting sliders and campaigns for the Editorial section
          </p>
        </div>
        <button
          disabled={isSubmitting}
          onClick={() => setIsAddFormOpen(!isAddFormOpen)}
          className="flex items-center space-x-1.5 px-6 py-2.5 bg-brand-brown hover:bg-brand-brown-dark text-white rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Editorial Banner</span>
        </button>
      </div>

      {isAddFormOpen && (
        <form
          onSubmit={handleAddBannerSubmit}
          className="bg-white border border-brand-cream-dark rounded-xl p-6 shadow-sm space-y-5 animate-fade-in"
        >
          <h4 className="font-serif text-sm text-brand-dark uppercase tracking-wider pb-2 border-b border-brand-cream-dark">
            Add Editorial Banner Slide
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Image & Sort */}
            <div className="flex flex-col space-y-4">
              <div>
                <label className={labelCls}>Banner Image</label>
                <p className="text-[8px] text-brand-dark/40 font-bold uppercase tracking-wider leading-relaxed mb-1">
                  Recommended aspect ratio: 3:4 (e.g. 600x800px)
                </p>
                <label className="flex items-center space-x-2 cursor-pointer border border-dashed border-brand-cream-dark rounded-xl px-4 py-4 hover:bg-brand-cream/20 transition-colors w-full justify-center text-center">
                  <Upload className="w-4 h-4 text-brand-brown" />
                  <span className="text-[10px] font-bold text-brand-dark/60 tracking-widest uppercase">
                    {bannerImageUploading ? 'Uploading...' : 'Upload Image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerImageUpload}
                    className="hidden"
                    disabled={bannerImageUploading || isSubmitting}
                  />
                </label>
              </div>

              {newBanner.image_url && (
                <div className="relative w-full max-w-[200px] aspect-[3/4] border border-brand-cream-dark rounded overflow-hidden shadow-3xs bg-[#F7F3EE] mx-auto">
                  <Image
                    src={newBanner.image_url}
                    alt="banner preview"
                    fill
                    className="object-cover object-center"
                    sizes="200px"
                  />
                </div>
              )}

              <div>
                <label className={labelCls}>Sort Order</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newBanner.sort_order}
                  onChange={(e) => setNewBanner((prev) => ({ ...prev, sort_order: Number(e.target.value) || 0 }))}
                  className={inputCls}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Right Column: Copywriting & Redirection */}
            <div className="flex flex-col space-y-4 justify-start">
              <div>
                <label className={labelCls}>Banner Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Attiz Season 01"
                  value={newBanner.tag}
                  onChange={(e) => setNewBanner((prev) => ({ ...prev, tag: e.target.value }))}
                  className={inputCls}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className={labelCls}>Headline / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Sartorial Heritage"
                  value={newBanner.title}
                  onChange={(e) => setNewBanner((prev) => ({ ...prev, title: e.target.value }))}
                  className={inputCls}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className={labelCls}>Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Modern Streetwear Redefined"
                  value={newBanner.subtitle}
                  onChange={(e) => setNewBanner((prev) => ({ ...prev, subtitle: e.target.value }))}
                  className={inputCls}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className={labelCls}>Description / Paragraph</label>
                <textarea
                  rows={3}
                  placeholder="Tell the brand story for this campaign..."
                  value={newBanner.description}
                  onChange={(e) => setNewBanner((prev) => ({ ...prev, description: e.target.value }))}
                  className={`${inputCls} resize-none`}
                  disabled={isSubmitting}
                />
              </div>

              {/* Redirection target */}
              <div>
                <label className={labelCls}>Redirection Type</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
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
                  <label className={labelCls}>Category Redirection</label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className={inputCls}
                    disabled={isSubmitting}
                  >
                    <option value="">-- Choose Redirection Category --</option>
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
                    type="text"
                    placeholder="e.g. /product/[id] or /#catalog-grid"
                    value={newBanner.redirect_url}
                    onChange={(e) => setNewBanner((prev) => ({ ...prev, redirect_url: e.target.value }))}
                    className={inputCls}
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-brand-cream-dark">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setIsAddFormOpen(false);
                setNewBanner({ ...BLANK_EDITORIAL_BANNER });
              }}
              className="px-6 py-2.5 border border-brand-cream-dark hover:bg-brand-cream/10 rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || bannerImageUploading}
              className="px-6 py-2.5 bg-brand-brown hover:bg-brand-brown-dark text-white rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer disabled:opacity-50 shadow-3xs"
            >
              {isSubmitting ? 'Saving...' : 'Save Banner'}
            </button>
          </div>
        </form>
      )}

      {/* Grid List of Banners */}
      <div className="bg-white border border-brand-cream-dark rounded-xl p-6 shadow-sm">
        <h4 className="font-serif text-sm text-brand-dark uppercase tracking-wider pb-3 border-b border-brand-cream-dark mb-5 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-brand-brown" />
          <span>Active Editorial Slides ({editorialBanners.length})</span>
        </h4>

        {editorialBanners.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-xs text-brand-dark/45 font-bold uppercase tracking-widest leading-relaxed">
              No editorial banners configured. Live slider is using the static defaults.
            </p>
          </div>
        )}

        {editorialBanners.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedBanners.map((slide) => (
              <div
                key={slide.id}
                className="border border-brand-cream-dark rounded-xl overflow-hidden bg-brand-cream/5 flex flex-col justify-between hover:shadow-2xs transition-all relative group"
              >
                <div>
                  {/* Image container */}
                  <div className="relative aspect-[4/3] bg-brand-cream/10 border-b border-brand-cream-dark overflow-hidden">
                    <Image
                      src={slide.image_url}
                      alt={slide.title}
                      fill
                      className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute top-2 left-2 bg-black text-[#FFCB05] text-[7px] font-bold px-2 py-0.5 uppercase tracking-wider -skew-x-6 border border-black">
                      <span className="inline-block skew-x-6">{slide.tag}</span>
                    </div>
                    <div className="absolute top-2 right-2 bg-brand-brown text-white text-[8px] font-mono px-2 py-0.5 rounded shadow-3xs font-bold">
                      Order: {slide.sort_order}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <h5 className="font-serif text-xs text-brand-dark uppercase leading-tight font-extrabold tracking-wide">
                      {slide.title}
                    </h5>
                    <p className="text-[8px] font-bold tracking-wider uppercase text-brand-dark/40">
                      {slide.subtitle}
                    </p>
                    <p className="text-[10px] text-brand-dark/65 font-sans leading-relaxed line-clamp-3">
                      {slide.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 flex justify-between items-center gap-2 border-t border-brand-cream-dark/40 mt-3 pt-3">
                  <span className="text-[8px] font-sans text-brand-brown font-semibold break-all truncate max-w-[150px]" title={slide.redirect_url}>
                    Redirect: {slide.redirect_url}
                  </span>
                  
                  <button
                    disabled={deletingId === slide.id}
                    onClick={() => handleDeleteBanner(slide.id)}
                    className="p-2 border border-red-150 hover:bg-red-50 hover:text-red-600 rounded text-red-400 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                    title="Delete slide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
