'use client';

import React, { useState } from 'react';
import {
  Search,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Edit3,
  Trash2,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import type { Product } from '@/lib/types';

interface ProductsTableProps {
  onStartEdit: (prod: Product) => void;
  setErrorMsg: (msg: string) => void;
  setSuccessMsg: (msg: string) => void;
}

export default function ProductsTable({
  onStartEdit,
  setErrorMsg,
  setSuccessMsg,
}: ProductsTableProps) {
  const { products, categories, dbLoading, deleteProduct } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'title' | 'price' | 'stock'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Track product id being deleted for inline loading spinner
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toggleSort = (field: 'title' | 'price' | 'stock') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setDeletingId(id);
      const { error } = await deleteProduct(id);
      if (error) throw error;
      setSuccessMsg('Product deleted successfully.');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter & Sort products list
  const filteredAndSortedProducts = products
    .filter((prod) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      const cat = categories.find((c) => c.id === prod.category_id);
      const catName = cat ? cat.name.toLowerCase() : '';
      const parentCatName = cat?.parent_id
        ? categories.find((c) => c.id === cat.parent_id)?.name.toLowerCase() || ''
        : '';
      return (
        prod.title.toLowerCase().includes(q) ||
        catName.includes(q) ||
        parentCatName.includes(q)
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
        valA = parseInt(String(a.stock), 10) || 0;
        valB = parseInt(String(b.stock), 10) || 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const inputCls =
    'px-3 py-2 text-xs border border-brand-cream-dark rounded bg-white outline-none focus:border-brand-brown font-sans w-full transition-all';

  return (
    <div className="bg-white border border-brand-cream-dark rounded-xl shadow-xs overflow-hidden">
      {/* Search & Sort Panel */}
      <div className="p-5 border-b border-brand-cream-dark flex flex-col sm:flex-row items-center justify-between gap-4 bg-brand-cream/5">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-brand-dark/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={inputCls + ' pl-10'}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-dark/30 hover:text-brand-dark cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-[10px] font-bold text-brand-dark/45 uppercase tracking-wider">
            Sort by:
          </span>
          {(['title', 'price', 'stock'] as const).map((field) => (
            <button
              key={field}
              onClick={() => toggleSort(field)}
              className={`px-3 py-1.5 border rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                sortField === field
                  ? 'bg-brand-brown border-brand-brown text-white shadow-xs'
                  : 'bg-white border-brand-cream-dark text-brand-dark/65 hover:border-brand-brown/50'
              }`}
            >
              <span className="flex items-center gap-1">
                {field}
                {sortField === field &&
                  (sortOrder === 'asc' ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  ))}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-brand-cream/15 border-b border-brand-cream-dark text-[9px] font-bold text-brand-dark/50 uppercase tracking-widest">
              <th className="px-5 py-4 text-left w-20">Garment</th>
              <th
                className="px-5 py-4 text-left cursor-pointer hover:bg-brand-cream/40 transition-colors"
                onClick={() => toggleSort('title')}
              >
                <div className="flex items-center space-x-1">
                  <span>Product Title</span>
                  {sortField === 'title' &&
                    (sortOrder === 'asc' ? (
                      <ChevronUp className="w-3.5 h-3.5 text-brand-brown" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-brand-brown" />
                    ))}
                </div>
              </th>
              <th className="px-5 py-4 text-left">Category</th>
              <th
                className="px-5 py-4 text-left cursor-pointer hover:bg-brand-cream/40 transition-colors"
                onClick={() => toggleSort('price')}
              >
                <div className="flex items-center space-x-1">
                  <span>Price</span>
                  {sortField === 'price' &&
                    (sortOrder === 'asc' ? (
                      <ChevronUp className="w-3.5 h-3.5 text-brand-brown" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-brand-brown" />
                    ))}
                </div>
              </th>
              <th
                className="px-5 py-4 text-left cursor-pointer hover:bg-brand-cream/40 transition-colors"
                onClick={() => toggleSort('stock')}
              >
                <div className="flex items-center space-x-1">
                  <span>Stock</span>
                  {sortField === 'stock' &&
                    (sortOrder === 'asc' ? (
                      <ChevronUp className="w-3.5 h-3.5 text-brand-brown" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-brand-brown" />
                    ))}
                </div>
              </th>
              <th className="px-5 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-cream-dark">
            {dbLoading ? (
              // Premium Skeleton Loader Rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-5 py-4.5">
                    <div className="w-11 h-14 bg-brand-cream rounded-md" />
                  </td>
                  <td className="px-5 py-4.5">
                    <div className="h-4 bg-brand-cream rounded w-48 mb-2" />
                    <div className="h-3 bg-brand-cream rounded w-24" />
                  </td>
                  <td className="px-5 py-4.5">
                    <div className="h-5 bg-brand-cream rounded w-20" />
                  </td>
                  <td className="px-5 py-4.5">
                    <div className="h-4 bg-brand-cream rounded w-16" />
                  </td>
                  <td className="px-5 py-4.5">
                    <div className="h-5 bg-brand-cream rounded w-16" />
                  </td>
                  <td className="px-5 py-4.5">
                    <div className="flex justify-center space-x-3">
                      <div className="w-8 h-8 bg-brand-cream rounded-lg" />
                      <div className="w-8 h-8 bg-brand-cream rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))
            ) : filteredAndSortedProducts.length > 0 ? (
              filteredAndSortedProducts.map((prod) => {
                const stockCount = parseInt(String(prod.stock), 10) || 0;
                const isOutOfStock = stockCount === 0;
                const isLowStock = stockCount > 0 && stockCount < 10;
                const isBeingDeleted = deletingId === prod.id;

                return (
                  <tr
                    key={prod.id}
                    className="hover:bg-brand-cream/5 transition-colors"
                  >
                    <td className="px-5 py-4.5">
                      <div className="relative w-11 h-14 bg-brand-cream rounded-md border border-brand-cream-dark overflow-hidden">
                        {prod.image ? (
                          <Image
                            src={prod.image}
                            alt={prod.title}
                            fill
                            className="object-cover"
                            sizes="44px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-brand-cream text-brand-dark/20">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4.5 font-semibold text-brand-dark max-w-[240px] truncate">
                      {prod.title}
                    </td>
                    <td className="px-5 py-4.5 text-brand-dark/50 font-medium tracking-wide">
                      <span className="bg-brand-cream/55 border border-brand-cream-dark/60 text-brand-dark/75 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        {categories.find((c) => c.id === prod.category_id)?.name ||
                          'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-5 py-4.5">
                      {prod.discount && prod.discount > 0 ? (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-green-700 font-extrabold text-[10px] flex items-center">
                              ↓{prod.discount}%
                            </span>
                            <span className="text-[10px] text-brand-dark/45 line-through">
                              ₹{parseFloat(String(prod.price)).toFixed(0)}
                            </span>
                          </div>
                          <span className="font-bold text-brand-dark text-xs">
                            ₹
                            {Math.round(
                              parseFloat(String(prod.price)) *
                                (1 - prod.discount / 100)
                            ).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-brand-brown">
                          ₹{parseFloat(String(prod.price)).toFixed(0)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                          isOutOfStock
                            ? 'bg-red-50 border-red-200 text-red-600'
                            : isLowStock
                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : 'bg-green-50 border-green-200 text-green-700'
                        }`}
                      >
                        {isOutOfStock
                          ? 'Out of stock'
                          : isLowStock
                          ? `${stockCount} Low`
                          : `${stockCount} In Stock`}
                      </span>
                    </td>
                    <td className="px-5 py-4.5 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => onStartEdit(prod)}
                          title="Edit Product"
                          disabled={isBeingDeleted}
                          className="p-2 border border-brand-cream-dark hover:border-brand-brown/40 text-brand-dark/65 hover:text-brand-brown rounded-lg transition-colors cursor-pointer bg-white disabled:opacity-50"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          title="Delete Product"
                          disabled={isBeingDeleted}
                          className="p-2 border border-brand-cream-dark hover:border-red-300 text-brand-dark/65 hover:text-red-600 rounded-lg transition-colors cursor-pointer bg-white disabled:opacity-50 flex items-center justify-center min-w-[34px] min-h-[34px]"
                        >
                          {isBeingDeleted ? (
                            <div className="w-3.5 h-3.5 rounded-full border border-red-600 border-t-transparent animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-16 text-brand-dark/35 text-xs font-bold tracking-widest uppercase"
                >
                  {searchQuery
                    ? 'No items match your search query.'
                    : 'No products yet. Add your first product above.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
