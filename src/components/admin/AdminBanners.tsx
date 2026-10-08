import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Banner } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../common/Modal';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';

export const AdminBanners: React.FC = () => {
  const { showToast } = useStore();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [buttonText, setButtonText] = useState('Shop Collection');
  const [buttonUrl, setButtonUrl] = useState('/shop');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const load = () => setBanners(db.getBanners());
    load();
    const unsub = db.subscribe(load);
    return unsub;
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    db.createBanner({
      title: title.trim(),
      subtitle: subtitle.trim(),
      button_text: buttonText.trim(),
      button_url: buttonUrl.trim(),
      image_url: imageUrl.trim(),
      type: 'hero',
      display_order: banners.length + 1,
      is_active: true,
    });

    showToast(`Banner "${title}" published`, 'success');
    setIsModalOpen(false);
  };

  const handleToggle = (b: Banner) => {
    db.updateBanner(b.id, { is_active: !b.is_active });
    showToast(`Banner is now ${!b.is_active ? 'Active' : 'Disabled'}`, 'info');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this banner slide?')) {
      db.deleteBanner(id);
      showToast('Banner removed', 'info');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-serif">Hero Slider & Banners</h2>
          <p className="text-xs text-slate-500">Manage promotional slides displayed on the homepage.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-sky-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Slide
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
            <div className="aspect-16/9 overflow-hidden bg-slate-900 relative">
              <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                <div className="text-white">
                  <h3 className="text-base font-bold">{b.title}</h3>
                  <p className="text-xs text-slate-200 line-clamp-1">{b.subtitle}</p>
                </div>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between text-xs border-t border-slate-100">
              <button
                onClick={() => handleToggle(b)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  b.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {b.is_active ? 'Active' : 'Disabled'}
              </button>

              <button
                onClick={() => handleDelete(b.id)}
                className="p-1.5 text-slate-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Hero Banner Slide">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Headline</label>
            <input
              type="text"
              placeholder="e.g. Royal Eid & Festive Atelier"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Subtitle</label>
            <input
              type="text"
              placeholder="e.g. Handcrafted silks and embroidery"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Button Text</label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Route</label>
              <input
                type="text"
                value={buttonUrl}
                onChange={(e) => setButtonUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

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
              Save Slide
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
