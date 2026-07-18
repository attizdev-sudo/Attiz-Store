'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Upload, Trash2, Link as LinkIcon, FolderOpen, Grid } from 'lucide-react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { uploadImage, deleteImages } from '@/lib/db';
import type { LookbookStyle } from '@/lib/types';

const BLANK_LOOKBOOK_STYLE = {
  name: '',
  subtitle: '',
  tag: '',
  category: '',
  image_url: '',
  color: '#E63B2E',
  sort_order: 0,
};

const COLOR_OPTIONS = [
  { name: 'ATTIZ Red', hex: '#E63B2E' },
  { name: 'ATTIZ Yellow', hex: '#FFCB05' },
  { name: 'ATTIZ Black', hex: '#111111' },
  { name: 'ATTIZ White', hex: '#FFFFFF' },
];

interface LookbookStylesManagerProps {
  setErrorMsg: (msg: string) => void;
  setSuccessMsg: (msg: string) => void;
}

export default function LookbookStylesManager({
  setErrorMsg,
  setSuccessMsg,
}: LookbookStylesManagerProps) {
  const { lookbookStyles, addLookbookStyle, deleteLookbookStyle, categories } = useStore();

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newStyle, setNewStyle] = useState({ ...BLANK_LOOKBOOK_STYLE });

  // Redirection helpers
  const [redirectType, setRedirectType] = useState<'category' | 'custom'>('category');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // Loading states
  const [imageUploading, setImageUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sessionUploadedUrls, setSessionUploadedUrls] = useState<string[]>([]);

  // Cleanup newly uploaded images that weren't saved when the form is closed/cancelled
  useEffect(() => {
    if (!isAddFormOpen) {
      if (sessionUploadedUrls.length > 0) {
        const urlsToDelete = [...sessionUploadedUrls];
        setSessionUploadedUrls([]);
        
        const performCleanup = async () => {
          try {
            await deleteImages('banner-images', urlsToDelete);
          } catch (err) {
            console.error('Error cleaning up unsaved lookbook images:', err);
          }
        };
        performCleanup();
      }
    }
  }, [isAddFormOpen, sessionUploadedUrls]);

  // Sync category selection with redirect URL
  useEffect(() => {
    if (redirectType === 'category') {
      const categoryObj = categories.find(c => c.id === selectedCategoryId);
      if (categoryObj) {
        setNewStyle((prev) => ({ ...prev, category: categoryObj.name }));
      } else {
        setNewStyle((prev) => ({ ...prev, category: '' }));
      }
    }
  }, [redirectType, selectedCategoryId, categories]);

  // Generate category options
  const categoryOptions = categories.map((cat) => {
    const parent = cat.parent_id ? categories.find((c) => c.id === cat.parent_id) : null;
    return {
      id: cat.id,
      name: parent ? `${parent.name.toUpperCase()} > ${cat.name.toUpperCase()}` : cat.name.toUpperCase(),
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImageUploading(true);
      setErrorMsg('');
      const url = await uploadImage('banner-images', file);
      setNewStyle((prev) => ({ ...prev, image_url: url }));
      setSessionUploadedUrls((prev) => [...prev, url]);
      setSuccessMsg('Lookbook image uploaded!');
    } catch {
      setErrorMsg('Failed to upload image.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newStyle.image_url) {
      setErrorMsg('Please upload a lookbook card image.');
      return;
    }
    if (!newStyle.name.trim()) {
      setErrorMsg('Please enter a display name (e.g. ATTIZ POLOS).');
      return;
    }
    if (!newStyle.subtitle.trim()) {
      setErrorMsg('Please enter a subtitle.');
      return;
    }
    if (!newStyle.tag.trim()) {
      setErrorMsg('Please enter a fit tag.');
      return;
    }
    if (!newStyle.category.trim()) {
      setErrorMsg('Please choose or enter a category link target.');
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await addLookbookStyle({
        name: newStyle.name.trim(),
        subtitle: newStyle.subtitle.trim(),
        tag: newStyle.tag.trim(),
        category: newStyle.category.trim(),
        image_url: newStyle.image_url,
        color: newStyle.color,
        sort_order: Number(newStyle.sort_order) || 0,
      } as Partial<LookbookStyle>);

      if (error) throw error;
      setSuccessMsg('Lookbook style card added successfully!');
      setNewStyle({ ...BLANK_LOOKBOOK_STYLE });
      setSelectedCategoryId('');
      setRedirectType('category');
      setSessionUploadedUrls([]);
      setIsAddFormOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add lookbook style.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lookbook style?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setDeletingId(id);
      const { error } = await deleteLookbookStyle(id);
      if (error) throw error;
      setSuccessMsg('Lookbook style deleted successfully.');
    } catch {
      setErrorMsg('Failed to delete lookbook style.');
    } finally {
      setDeletingId(null);
    }
  };

  const sortedStyles = [...lookbookStyles].sort((a, b) => {
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
            Pick Your Style (Lookbook)
          </h3>
          <p className="text-[10px] text-brand-dark/50 uppercase tracking-widest mt-0.5">
            Configure dynamic style and fit panels for the home page accordion
          </p>
        </div>
        <button
          disabled={isSubmitting}
          onClick={() => setIsAddFormOpen(!isAddFormOpen)}
          className="flex items-center space-x-1.5 px-6 py-2.5 bg-brand-brown hover:bg-brand-brown-dark text-white rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Lookbook Style</span>
        </button>
      </div>

      {isAddFormOpen && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-white border border-brand-cream-dark rounded-xl p-6 shadow-sm space-y-5 animate-fade-in"
        >
          <h4 className="font-serif text-sm text-brand-dark uppercase tracking-wider pb-2 border-b border-brand-cream-dark">
            Add Lookbook Style Card
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Image & Layout */}
            <div className="flex flex-col space-y-4">
              <div>
                <label className={labelCls}>Lookbook Card Image</label>
                <p className="text-[8px] text-brand-dark/40 font-bold uppercase tracking-wider leading-relaxed mb-1">
                  Recommended aspect ratio: 3:4 (e.g. 600x800px)
                </p>
                <label className="flex items-center space-x-2 cursor-pointer border border-dashed border-brand-cream-dark rounded-xl px-4 py-4 hover:bg-brand-cream/20 transition-colors w-full justify-center text-center">
                  <Upload className="w-4 h-4 text-brand-brown" />
                  <span className="text-[10px] font-bold text-brand-dark/60 tracking-widest uppercase">
                    {imageUploading ? 'Uploading...' : 'Upload Image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={imageUploading || isSubmitting}
                  />
                </label>
              </div>

              {newStyle.image_url && (
                <div className="relative w-full max-w-[180px] aspect-[3/4] border border-brand-cream-dark rounded overflow-hidden shadow-3xs bg-[#F7F3EE] mx-auto">
                  <Image
                    src={newStyle.image_url}
                    alt="preview"
                    fill
                    className="object-cover object-center"
                    sizes="180px"
                  />
                </div>
              )}

              <div>
                <label className={labelCls}>Sort Order</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newStyle.sort_order}
                  onChange={(e) => setNewStyle((prev) => ({ ...prev, sort_order: Number(e.target.value) || 0 }))}
                  className={inputCls}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Right: Content details */}
            <div className="flex flex-col space-y-4 justify-start">
              <div>
                <label className={labelCls}>Display Title</label>
                <input
                  type="text"
                  placeholder="e.g. ATTIZ POLOS"
                  value={newStyle.name}
                  onChange={(e) => setNewStyle((prev) => ({ ...prev, name: e.target.value }))}
                  className={inputCls}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className={labelCls}>Subtitle Description</label>
                <input
                  type="text"
                  placeholder="e.g. Classic Sartorial Knit"
                  value={newStyle.subtitle}
                  onChange={(e) => setNewStyle((prev) => ({ ...prev, subtitle: e.target.value }))}
                  className={inputCls}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className={labelCls}>Fit Tag Badge</label>
                <input
                  type="text"
                  placeholder="e.g. Structured Fit"
                  value={newStyle.tag}
                  onChange={(e) => setNewStyle((prev) => ({ ...prev, tag: e.target.value }))}
                  className={inputCls}
                  disabled={isSubmitting}
                />
              </div>

              {/* Accent Color Selection */}
              <div>
                <label className={labelCls}>Active Color Strip</label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setNewStyle((prev) => ({ ...prev, color: c.hex }))}
                      className={`px-3 py-1.5 border text-[9px] font-bold rounded flex items-center space-x-1.5 transition-all cursor-pointer ${
                        newStyle.color === c.hex
                          ? 'border-brand-brown bg-brand-brown text-white'
                          : 'border-brand-cream-dark bg-white text-brand-dark'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/15 inline-block"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category redirect selection */}
              <div>
                <label className={labelCls}>Redirection Type</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRedirectType('category');
                      setSelectedCategoryId('');
                      setNewStyle((prev) => ({ ...prev, category: '' }));
                    }}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 border rounded text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                      redirectType === 'category'
                        ? 'border-brand-brown bg-brand-brown text-white'
                        : 'border-brand-cream-dark bg-white text-brand-dark'
                    }`}
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Category Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRedirectType('custom');
                      setNewStyle((prev) => ({ ...prev, category: '' }));
                    }}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 border rounded text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                      redirectType === 'custom'
                        ? 'border-brand-brown bg-brand-brown text-white'
                        : 'border-brand-cream-dark bg-white text-brand-dark'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Custom Text Link</span>
                  </button>
                </div>
              </div>

              {redirectType === 'category' ? (
                <div className="flex flex-col space-y-1">
                  <label className={labelCls}>Category Select</label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className={inputCls}
                    disabled={isSubmitting}
                  >
                    <option value="">-- Select Target Category --</option>
                    {categoryOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex flex-col space-y-1">
                  <label className={labelCls}>Custom Category Value</label>
                  <input
                    type="text"
                    placeholder="e.g. Polos or Sweatshirts"
                    value={newStyle.category}
                    onChange={(e) => setNewStyle((prev) => ({ ...prev, category: e.target.value }))}
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
                setNewStyle({ ...BLANK_LOOKBOOK_STYLE });
              }}
              className="px-6 py-2.5 border border-brand-cream-dark hover:bg-brand-cream/10 rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || imageUploading}
              className="px-6 py-2.5 bg-brand-brown hover:bg-brand-brown-dark text-white rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer disabled:opacity-50 shadow-3xs"
            >
              {isSubmitting ? 'Saving...' : 'Save Lookbook Style'}
            </button>
          </div>
        </form>
      )}

      {/* List / Grid view */}
      <div className="bg-white border border-brand-cream-dark rounded-xl p-6 shadow-sm">
        <h4 className="font-serif text-sm text-brand-dark uppercase tracking-wider pb-3 border-b border-brand-cream-dark mb-5 flex items-center space-x-2">
          <Grid className="w-4 h-4 text-brand-brown" />
          <span>Active Lookbook Styles ({lookbookStyles.length})</span>
        </h4>

        {lookbookStyles.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-xs text-brand-dark/45 font-bold uppercase tracking-widest leading-relaxed">
              No custom styles added yet. Homepage slider is using static defaults.
            </p>
          </div>
        )}

        {lookbookStyles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedStyles.map((style) => (
              <div
                key={style.id}
                className="border border-brand-cream-dark rounded-xl overflow-hidden bg-brand-cream/5 flex flex-col justify-between hover:shadow-2xs transition-all relative group"
              >
                <div>
                  <div className="relative aspect-[3/4] bg-brand-cream/10 border-b border-brand-cream-dark overflow-hidden">
                    <Image
                      src={style.image_url}
                      alt={style.name}
                      fill
                      className="object-cover object-center group-hover:scale-102 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                    <div className="absolute top-2 left-2 bg-[#FFCB05] text-black text-[7px] font-bold px-2 py-0.5 uppercase tracking-wider border border-black shadow-3xs">
                      {style.tag}
                    </div>
                    <div className="absolute top-2 right-2 bg-brand-brown text-white text-[8px] font-mono px-2 py-0.5 rounded shadow-3xs font-bold">
                      Order: {style.sort_order}
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <h5 className="font-serif text-xs text-brand-dark uppercase font-extrabold tracking-wide">
                      {style.name}
                    </h5>
                    <p className="text-[8px] font-bold tracking-wider uppercase text-brand-dark/40 leading-none">
                      {style.subtitle}
                    </p>
                    <div className="flex items-center space-x-1 pt-1.5">
                      <span className="text-[7px] uppercase font-bold tracking-widest text-brand-dark/50">Accent Line:</span>
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/15 inline-block shrink-0"
                        style={{ backgroundColor: style.color }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 flex justify-between items-center gap-2 border-t border-brand-cream-dark/40 mt-3 pt-3">
                  <span className="text-[8px] font-mono text-brand-brown font-semibold truncate max-w-[120px]" title={style.category}>
                    Link: {style.category}
                  </span>
                  
                  <button
                    disabled={deletingId === style.id}
                    onClick={() => handleDelete(style.id)}
                    className="p-2 border border-red-150 hover:bg-red-50 hover:text-red-600 rounded text-red-400 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                    title="Delete style"
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
