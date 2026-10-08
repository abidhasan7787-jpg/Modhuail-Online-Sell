import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Category } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../common/Modal';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const { showToast } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    const load = () => setCategories(db.getCategories());
    load();
    const unsub = db.subscribe(load);
    return unsub;
  }, []);

  const openNewModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80');
    setIsPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImageUrl(cat.image_url);
    setIsPublished(cat.is_published);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description.trim(),
      image_url: imageUrl.trim(),
      display_order: categories.length + 1,
      is_published: isPublished,
    };

    if (editingCategory) {
      db.updateCategory(editingCategory.id, payload);
      showToast(`Updated category "${name}"`, 'success');
    } else {
      db.createCategory(payload);
      showToast(`Created category "${name}"`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, catName: string) => {
    if (confirm(`Delete category "${catName}"?`)) {
      db.deleteCategory(id);
      showToast(`Category "${catName}" deleted`, 'info');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-serif">Category Catalog</h2>
          <p className="text-xs text-slate-500">Manage apparel classifications and banners.</p>
        </div>
        <button
          onClick={openNewModal}
          className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-sky-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
            <div className="aspect-16/10 overflow-hidden bg-slate-100">
              <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{cat.description}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  cat.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {cat.is_published ? 'Published' : 'Hidden'}
                </span>

                <div className="flex items-center gap-1">
                  <button onClick={() => openEditModal(cat)} className="p-1.5 text-slate-500 hover:text-pink-600">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 text-slate-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCategory ? 'Edit Category' : 'New Category'}>
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="rounded accent-pink-600"
            />
            Published & Visible
          </label>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2 border border-slate-200 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-pink-600 text-white rounded-xl font-bold shadow-md"
            >
              Save Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
