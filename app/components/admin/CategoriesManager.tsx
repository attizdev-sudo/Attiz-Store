'use client';

import React, { useState } from 'react';
import {
  Plus,
  GripVertical,
  CheckCircle,
  Edit3,
  Trash2,
  Layers,
  Search,
  X,
  Check,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import type { Category } from '@/lib/types';

interface CategoriesManagerProps {
  setErrorMsg: (msg: string) => void;
  setSuccessMsg: (msg: string) => void;
}

export default function CategoriesManager({
  setErrorMsg,
  setSuccessMsg,
}: CategoriesManagerProps) {
  const {
    categories,
    products,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useStore();

  const [selectedParentId, setSelectedParentId] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [bulkSubcategoryInput, setBulkSubcategoryInput] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // Inline edit state
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    parent_id?: string | null;
    sort_order: number;
  } | null>(null);

  // Drag and drop tracking
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);

  // Loading states
  const [isCreatingParent, setIsCreatingParent] = useState(false);
  const [isCreatingSubs, setIsCreatingSubs] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  // Sequence Mode states
  const [isSequenceMode, setIsSequenceMode] = useState(false);
  const [localCategories, setLocalCategories] = useState<Category[]>([]);

  // Submission actions
  const handleAddParentCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!newCategoryName.trim()) {
      setErrorMsg('Category name cannot be empty.');
      return;
    }
    try {
      setIsCreatingParent(true);
      const { error } = await addCategory({
        name: newCategoryName.trim(),
        parent_id: null,
        sort_order: 0,
      } as Partial<Category>);
      if (error) throw error;
      setSuccessMsg(`Parent department "${newCategoryName.trim()}" created!`);
      setNewCategoryName('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add parent category. Names must be unique.');
    } finally {
      setIsCreatingParent(false);
    }
  };

  const handleAddSubcategories = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!selectedParentId) {
      setErrorMsg('Please select a parent department first.');
      return;
    }
    if (!bulkSubcategoryInput.trim()) {
      setErrorMsg('Subcategory input cannot be empty.');
      return;
    }

    const names = bulkSubcategoryInput
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);

    if (names.length === 0) {
      setErrorMsg('No valid subcategory names entered.');
      return;
    }

    try {
      setIsCreatingSubs(true);
      const payload = names.map((name) => ({
        name,
        parent_id: selectedParentId,
      }));

      const { error } = await addCategory(payload);
      if (error) throw error;

      setSuccessMsg(`Added ${names.length} subcategories!`);
      setBulkSubcategoryInput('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add subcategories. Names must be unique under this parent.');
    } finally {
      setIsCreatingSubs(false);
    }
  };

  const handleEditCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!editingCategory?.name.trim()) {
      setErrorMsg('Category name cannot be empty.');
      return;
    }
    try {
      setIsUpdating(editingCategory.id);
      const { error } = await updateCategory(editingCategory.id, {
        name: editingCategory.name.trim(),
        parent_id: editingCategory.parent_id || null,
        sort_order: editingCategory.sort_order,
      });
      if (error) throw error;
      setSuccessMsg('Category updated successfully!');
      setEditingCategory(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update category.');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setIsDeleting(id);
      const { error } = await deleteCategory(id);
      if (error) throw error;
      setSuccessMsg(`Category "${name}" deleted.`);
      if (selectedParentId === id) {
        setSelectedParentId('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete category.');
    } finally {
      setIsDeleting(null);
    }
  };

  // Sequence Mode Handlers
  const handleStartSequenceMode = () => {
    setLocalCategories(categories);
    setIsSequenceMode(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleCancelSequence = () => {
    setIsSequenceMode(false);
    setLocalCategories([]);
  };

  const handleSaveSequence = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setIsReordering(true);

      // Identify categories that actually had their sort_order changed
      const changedCategories = localCategories.filter((localCat) => {
        const originalCat = categories.find((c) => c.id === localCat.id);
        return originalCat && originalCat.sort_order !== localCat.sort_order;
      });

      if (changedCategories.length > 0) {
        // Execute API updates in parallel
        await Promise.all(
          changedCategories.map((cat) =>
            updateCategory(cat.id, {
              name: cat.name,
              parent_id: cat.parent_id || null,
              sort_order: cat.sort_order,
            })
          )
        );
        setSuccessMsg(`Successfully saved sequence order for ${changedCategories.length} category/categories!`);
      } else {
        setSuccessMsg('No sequence changes detected.');
      }
      setIsSequenceMode(false);
      setLocalCategories([]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to save sequence changes.');
    } finally {
      setIsReordering(false);
    }
  };

  // Drag and Drop parent
  const handleParentDragStart = (e: React.DragEvent, id: string) => {
    if (!isSequenceMode) return;
    e.dataTransfer.setData('text/plain', id);
    setDraggedCategoryId(id);
  };

  const handleParentDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleParentDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!isSequenceMode) return;
    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) return;

    const parents = [...localCategories]
      .filter((c) => !c.parent_id)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    const sourceIndex = parents.findIndex((c) => c.id === sourceId);
    const targetIndex = parents.findIndex((c) => c.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const updatedParents = [...parents];
    const [draggedItem] = updatedParents.splice(sourceIndex, 1);
    updatedParents.splice(targetIndex, 0, draggedItem);

    // Re-assign sort_orders
    const updatedWithOrder = updatedParents.map((cat, idx) => ({
      ...cat,
      sort_order: idx,
    }));

    setLocalCategories((prev) =>
      prev.map((c) => {
        const match = updatedWithOrder.find((up) => up.id === c.id);
        return match ? match : c;
      })
    );
    setDraggedCategoryId(null);
  };

  // Drag and Drop child
  const handleChildDragStart = (e: React.DragEvent, id: string) => {
    if (!isSequenceMode) return;
    e.dataTransfer.setData('text/plain', id);
    setDraggedCategoryId(id);
  };

  const handleChildDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleChildDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!isSequenceMode) return;
    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) return;

    const children = [...localCategories]
      .filter((c) => c.parent_id === selectedParentId)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    const sourceIndex = children.findIndex((c) => c.id === sourceId);
    const targetIndex = children.findIndex((c) => c.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const updatedChildren = [...children];
    const [draggedItem] = updatedChildren.splice(sourceIndex, 1);
    updatedChildren.splice(targetIndex, 0, draggedItem);

    // Re-assign sort_orders
    const updatedWithOrder = updatedChildren.map((cat, idx) => ({
      ...cat,
      sort_order: idx,
    }));

    setLocalCategories((prev) =>
      prev.map((c) => {
        const match = updatedWithOrder.find((up) => up.id === c.id);
        return match ? match : c;
      })
    );
    setDraggedCategoryId(null);
  };

  const inputCls =
    'px-3 py-2 text-xs border border-brand-cream-dark rounded bg-white outline-none focus:border-brand-brown font-sans w-full transition-all disabled:opacity-50';
  const labelCls =
    'text-[9px] font-bold text-brand-dark/50 uppercase tracking-wider block mb-1';

  const displayCategories = isSequenceMode ? localCategories : categories;

  const displayParents = [...displayCategories]
    .filter((c) => !c.parent_id)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const displayChildren = [...displayCategories]
    .filter((c) => c.parent_id === selectedParentId)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-cream-dark/60 pb-5">
        <div>
          <h3 className="font-serif text-lg text-brand-dark uppercase">
            Categories & Collections
          </h3>
          <p className="text-[10px] text-brand-dark/50 uppercase tracking-widest mt-0.5">
            Construct and align your primary catalog hierarchy and departments
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {isSequenceMode ? (
            <>
              <button
                onClick={handleSaveSequence}
                disabled={isReordering}
                className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-green-700 hover:bg-green-800 disabled:bg-green-700/50 text-white rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isReordering ? (
                  <>
                    <div className="w-3 h-3 rounded-full border border-white border-t-transparent animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Sequence</span>
                )}
              </button>
              <button
                onClick={handleCancelSequence}
                disabled={isReordering}
                className="px-4 py-2 border border-brand-cream-dark hover:bg-brand-cream/10 text-brand-dark rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleStartSequenceMode}
              className="flex items-center justify-center space-x-1.5 px-4 py-2 border border-brand-brown text-brand-brown hover:bg-brand-cream/10 rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer shadow-xs"
            >
              <span>Manage Sequence</span>
            </button>
          )}
        </div>
      </div>

      {isSequenceMode && (
        <div className="p-3 bg-brand-cream/20 border border-brand-cream-dark text-brand-brown rounded-xl text-xs font-semibold text-center tracking-wide animate-fade-in">
          You are in <strong>Sequence Mode</strong>. Drag and drop departments and subcategories to rearrange them, then click <strong>Save Sequence</strong> above.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Manage Parent Departments */}
        <div className="space-y-6">
          {/* Create Parent Department Form */}
          <div className="bg-white border border-brand-cream-dark rounded-xl p-6 shadow-xs space-y-4">
            <div>
              <h4 className="font-serif text-xs font-bold text-brand-dark uppercase tracking-widest">
                Create Parent Department
              </h4>
              <p className="text-[8px] text-brand-dark/45 uppercase tracking-widest mt-0.5">
                Top-level categories like MEN, WOMEN, KIDS
              </p>
            </div>

            <form onSubmit={handleAddParentCategory} className="space-y-3">
              <div className="flex flex-col">
                <label className={labelCls}>Department Name</label>
                <input
                  required
                  disabled={isCreatingParent}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. MEN"
                  className={inputCls}
                />
              </div>
              <button
                type="submit"
                disabled={isCreatingParent}
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-brand-brown hover:bg-brand-brown-dark text-white rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isCreatingParent ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border border-white border-t-transparent animate-spin" />
                    <span>CREATING...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Department</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* List of Parent Departments */}
          <div className="bg-white border border-brand-cream-dark rounded-xl p-6 shadow-xs space-y-4">
            <div>
              <h4 className="font-serif text-xs font-bold text-brand-dark uppercase tracking-widest">
                Parent Departments
              </h4>
              <p className="text-[8px] text-brand-dark/45 uppercase tracking-widest mt-0.5">
                Select a department below to manage its subcategories
              </p>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {displayParents.map((parent) => {
                const childCount = displayCategories.filter(
                  (c) => c.parent_id === parent.id
                ).length;
                const isSelected = selectedParentId === parent.id;
                const isBeingDeleted = isDeleting === parent.id;

                return (
                  <div
                    key={parent.id}
                    draggable={isSequenceMode && (!editingCategory || editingCategory.id !== parent.id)}
                    onDragStart={(e) => handleParentDragStart(e, parent.id)}
                    onDragOver={handleParentDragOver}
                    onDrop={(e) => handleParentDrop(e, parent.id)}
                    className={`p-3 border rounded-lg flex items-center justify-between gap-3 transition-all ${
                      isSelected
                        ? 'border-brand-brown bg-brand-cream/15 shadow-2xs'
                        : 'border-brand-cream-dark/60 bg-white hover:bg-brand-cream/5'
                    } ${
                      draggedCategoryId === parent.id
                        ? 'opacity-40 border-dashed border-brand-brown'
                        : ''
                    } ${isSequenceMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {isSequenceMode && (!editingCategory || editingCategory.id !== parent.id) && (
                        <GripVertical className="w-3.5 h-3.5 text-brand-brown shrink-0 select-none cursor-grab animate-pulse" />
                      )}
                        <div className="flex flex-col flex-1 min-w-0">
                          {editingCategory?.id === parent.id ? (
                            <form
                              onSubmit={handleEditCategorySubmit}
                              className="flex gap-1.5 items-center w-full"
                            >
                              <input
                                value={editingCategory.name}
                                onChange={(e) =>
                                  setEditingCategory({
                                    ...editingCategory,
                                    name: e.target.value,
                                  })
                                }
                                className={inputCls + ' h-7 text-[11px] flex-1'}
                                autoFocus
                              />
                              <input
                                type="number"
                                value={editingCategory.sort_order}
                                onChange={(e) =>
                                  setEditingCategory({
                                    ...editingCategory,
                                    sort_order:
                                      parseInt(e.target.value, 10) || 0,
                                  })
                                }
                                className={
                                  inputCls + ' h-7 text-[11px] w-14 shrink-0'
                                }
                                placeholder="Sort"
                              />
                              <button
                                type="submit"
                                disabled={isUpdating === parent.id}
                                className="p-1 px-2 bg-brand-brown text-white rounded text-[9px] cursor-pointer shrink-0 h-7 flex items-center justify-center disabled:opacity-50"
                              >
                                {isUpdating === parent.id ? (
                                  <div className="w-3 h-3 rounded-full border border-white border-t-transparent animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCategory(null)}
                                className="p-1 px-2 border border-brand-cream-dark text-brand-dark/50 rounded text-[9px] cursor-pointer shrink-0 h-7 flex items-center justify-center"
                              >
                                X
                              </button>
                            </form>
                          ) : (
                            <>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="bg-brand-cream-dark/30 text-brand-brown text-[8px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase">
                                  Ord: {parent.sort_order ?? 0}
                                </span>
                                <span className="font-serif text-xs font-bold text-brand-dark uppercase tracking-wider truncate">
                                  {parent.name}
                                </span>
                              </div>
                              <span className="text-[8px] text-brand-dark/40 font-bold uppercase tracking-widest mt-0.5">
                                {childCount} subcategories linked
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {!isSequenceMode && (!editingCategory || editingCategory.id !== parent.id) && (
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <button
                            onClick={() => setSelectedParentId(parent.id)}
                            title="Manage Subcategories"
                            className={`px-2 py-1 text-[8px] font-bold uppercase tracking-widest rounded transition-colors cursor-pointer border ${
                              isSelected
                                ? 'bg-brand-brown text-white border-brand-brown'
                                : 'bg-white text-brand-brown border-brand-cream-dark/85 hover:bg-brand-cream/10'
                            }`}
                          >
                            {isSelected ? 'Managing' : 'Select'}
                          </button>
                          <button
                            onClick={() =>
                              setEditingCategory({
                                id: parent.id,
                                name: parent.name,
                                parent_id: null,
                                sort_order: parent.sort_order ?? 0,
                              })
                            }
                            className="p-1 border border-brand-cream-dark/60 text-brand-dark/40 hover:text-brand-brown rounded hover:bg-brand-cream/10 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteCategory(parent.id, parent.name)
                            }
                            disabled={isBeingDeleted}
                            className="p-1 border border-brand-cream-dark/60 text-brand-dark/40 hover:text-red-500 rounded hover:bg-brand-cream/10 cursor-pointer disabled:opacity-50 min-w-[22px] min-h-[22px] flex items-center justify-center"
                          >
                            {isBeingDeleted ? (
                              <div className="w-3 h-3 rounded-full border border-red-500 border-t-transparent animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              {categories.filter((c) => !c.parent_id).length === 0 && (
                <div className="text-center py-6 text-brand-dark/30 text-[10px] font-bold uppercase tracking-widest">
                  No departments yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Manage Subcategories builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subcategory manager panel */}
          <div className="bg-white border border-brand-cream-dark rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-cream-dark pb-4.5">
              <div>
                <h4 className="font-serif text-sm text-brand-dark uppercase tracking-wider">
                  {selectedParentId
                    ? `Subcategories of "${
                        categories.find((c) => c.id === selectedParentId)?.name
                      }"`
                    : 'Subcategories Manager'}
                </h4>
                <p className="text-[9px] text-brand-dark/45 uppercase tracking-widest mt-0.5">
                  {selectedParentId
                    ? 'Add multiple subcategories below to this department'
                    : 'Select a parent department on the left to start adding subcategories'}
                </p>
              </div>
            </div>

            {selectedParentId ? (
              <div className="space-y-6">
                {/* Bulk Add Form */}
                <form
                  onSubmit={handleAddSubcategories}
                  className="bg-brand-cream/5 border border-brand-cream-dark/50 rounded-xl p-4.5 space-y-4"
                >
                  <div className="flex flex-col">
                    <label className={labelCls}>
                      Add Subcategories (Multiple, Comma-Separated)
                    </label>
                    <textarea
                      required
                      disabled={isCreatingSubs}
                      rows={3}
                      value={bulkSubcategoryInput}
                      onChange={(e) => setBulkSubcategoryInput(e.target.value)}
                      placeholder="e.g. Round Neck Tees, Polo Tees, Joggers, Sweatshirts, Hoodies"
                      className={inputCls + ' font-sans resize-none h-20'}
                    />
                    <span className="text-[8px] text-brand-dark/40 font-semibold tracking-wider uppercase mt-1.5 leading-normal">
                      Enter subcategory names separated by commas. We will add
                      them in bulk under this department.
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={isCreatingSubs}
                    className="flex items-center justify-center space-x-1.5 px-6 py-2.5 bg-brand-brown hover:bg-brand-brown-dark text-white rounded text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer shadow-xs w-full sm:w-auto ml-auto disabled:opacity-50"
                  >
                    {isCreatingSubs ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border border-white border-t-transparent animate-spin" />
                        <span>ADDING...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Subcategories</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Subcategories list */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-serif text-xs text-brand-dark uppercase tracking-wider">
                      Active Subcategories
                    </h5>
                    <span className="text-[9px] font-bold text-brand-dark/40 uppercase bg-brand-cream px-2 py-0.5 rounded">
                      {displayChildren.length} items
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                    {displayChildren.map((child) => {
                      const linkedProductCount = products.filter(
                        (p) => p.category_ids?.includes(child.id) || p.category_id === child.id
                      ).length;
                      const isBeingDeleted = isDeleting === child.id;

                      return (
                        <div
                          key={child.id}
                          draggable={isSequenceMode && (!editingCategory || editingCategory.id !== child.id)}
                          onDragStart={(e) => handleChildDragStart(e, child.id)}
                          onDragOver={handleChildDragOver}
                          onDrop={(e) => handleChildDrop(e, child.id)}
                          className={`p-3 bg-white border border-brand-cream-dark/70 rounded-lg flex items-center justify-between gap-3 shadow-3xs transition-shadow hover:shadow-2xs ${
                            draggedCategoryId === child.id
                              ? 'opacity-40 border-dashed border-brand-brown'
                              : ''
                          } ${isSequenceMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {isSequenceMode && (!editingCategory || editingCategory.id !== child.id) && (
                              <GripVertical className="w-3.5 h-3.5 text-brand-brown shrink-0 select-none cursor-grab animate-pulse" />
                            )}
                              <div className="flex flex-col flex-1 min-w-0">
                                {editingCategory?.id === child.id ? (
                                  <form
                                    onSubmit={handleEditCategorySubmit}
                                    className="flex gap-1.5 items-center w-full"
                                  >
                                    <input
                                      value={editingCategory.name}
                                      onChange={(e) =>
                                        setEditingCategory({
                                          ...editingCategory,
                                          name: e.target.value,
                                        })
                                      }
                                      className={
                                        inputCls + ' h-7 text-[11px] flex-1'
                                      }
                                      autoFocus
                                    />
                                    <input
                                      type="number"
                                      value={editingCategory.sort_order}
                                      onChange={(e) =>
                                        setEditingCategory({
                                          ...editingCategory,
                                          sort_order:
                                            parseInt(e.target.value, 10) || 0,
                                        })
                                      }
                                      className={
                                        inputCls +
                                        ' h-7 text-[11px] w-14 shrink-0'
                                      }
                                      placeholder="Sort"
                                    />
                                    <button
                                      type="submit"
                                      disabled={isUpdating === child.id}
                                      className="p-1 px-2 bg-brand-brown text-white rounded text-[9px] cursor-pointer shrink-0 h-7 flex items-center justify-center disabled:opacity-50"
                                    >
                                      {isUpdating === child.id ? (
                                        <div className="w-3.5 h-3.5 rounded-full border border-white border-t-transparent animate-spin" />
                                      ) : (
                                        <CheckCircle className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingCategory(null)}
                                      className="p-1 px-2 border border-brand-cream-dark text-brand-dark/50 rounded text-[9px] cursor-pointer shrink-0 h-7 flex items-center justify-center"
                                    >
                                      X
                                    </button>
                                  </form>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="bg-brand-cream-dark/20 text-brand-dark/60 text-[8px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase">
                                        Ord: {child.sort_order ?? 0}
                                      </span>
                                      <span className="font-sans text-xs font-semibold text-brand-dark truncate">
                                        {child.name}
                                      </span>
                                    </div>
                                    <span className="text-[8px] text-brand-dark/40 font-bold uppercase tracking-widest mt-0.5">
                                      {linkedProductCount} garments linked
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {!isSequenceMode && (!editingCategory || editingCategory.id !== child.id) && (
                              <div className="flex items-center space-x-1 shrink-0">
                                <button
                                  onClick={() =>
                                    setEditingCategory({
                                      id: child.id,
                                      name: child.name,
                                      parent_id: child.parent_id,
                                      sort_order: child.sort_order ?? 0,
                                    })
                                  }
                                  className="p-1 text-brand-dark/35 hover:text-brand-brown transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteCategory(child.id, child.name)
                                  }
                                  disabled={isBeingDeleted}
                                  className="p-1 text-brand-dark/35 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50 min-w-[22px] min-h-[22px] flex items-center justify-center"
                                >
                                  {isBeingDeleted ? (
                                    <div className="w-3 h-3 rounded-full border border-red-500 border-t-transparent animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    {categories.filter((c) => c.parent_id === selectedParentId)
                      .length === 0 && (
                      <div className="col-span-full py-10 bg-brand-cream/5 border border-dashed border-brand-cream-dark rounded-xl text-center text-brand-dark/30 text-[10px] font-bold uppercase tracking-widest">
                        No subcategories added yet. Use the form above to add
                        your first subcategories.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-brand-dark/35 bg-brand-cream/5 border border-dashed border-brand-cream-dark rounded-xl space-y-3">
                <Layers className="w-8 h-8 text-brand-dark/25 mx-auto" />
                <div className="max-w-[280px] mx-auto space-y-1">
                  <p className="font-serif text-xs font-bold text-brand-dark uppercase tracking-wider">
                    No Department Selected
                  </p>
                  <p className="text-[9px] text-brand-dark/45 uppercase tracking-widest leading-relaxed">
                    Select a parent department on the left column to view, add,
                    or manage subcategories.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Global Category Finder */}
          <div className="bg-white border border-brand-cream-dark rounded-xl p-6 shadow-xs space-y-4">
            <div>
              <h4 className="font-serif text-xs font-bold text-brand-dark uppercase tracking-widest">
                Global Category Finder
              </h4>
              <p className="text-[8px] text-brand-dark/45 uppercase tracking-widest mt-0.5">
                Quickly find any category or subcategory
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-brand-dark/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Type name to search..."
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                className={inputCls + ' pl-9 text-[11px]'}
              />
              {categorySearchQuery && (
                <button
                  onClick={() => setCategorySearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-dark/30 hover:text-brand-dark cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {categorySearchQuery.trim() !== '' && (
              <div className="border border-brand-cream-dark rounded-lg divide-y divide-brand-cream-dark/50 max-h-[200px] overflow-y-auto pr-1">
                {categories
                  .filter((c) =>
                    c.name
                      .toLowerCase()
                      .includes(categorySearchQuery.toLowerCase())
                  )
                  .map((cat) => {
                    const parentName = cat.parent_id
                      ? categories.find((c) => c.id === cat.parent_id)?.name
                      : null;
                    return (
                      <div
                        key={cat.id}
                        className="p-2.5 flex items-center justify-between text-xs hover:bg-brand-cream/5"
                      >
                        <span className="font-medium text-brand-dark">
                          {parentName ? `${parentName} > ${cat.name}` : cat.name}
                          <span className="text-[8px] font-bold text-brand-dark/40 uppercase bg-brand-cream px-1.5 py-0.5 rounded ml-2">
                            {cat.parent_id ? 'Subcategory' : 'Department'}
                          </span>
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => {
                              if (cat.parent_id) {
                                setSelectedParentId(cat.parent_id);
                              } else {
                                setSelectedParentId(cat.id);
                              }
                              setCategorySearchQuery('');
                            }}
                            className="text-[8px] font-bold uppercase tracking-widest text-brand-brown hover:underline cursor-pointer"
                          >
                            Go to parent
                          </button>
                        </div>
                      </div>
                    );
                  })}
                {categories.filter((c) =>
                  c.name
                    .toLowerCase()
                    .includes(categorySearchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="p-4 text-center text-brand-dark/35 text-[9px] font-bold uppercase tracking-widest">
                    No matching categories found.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
