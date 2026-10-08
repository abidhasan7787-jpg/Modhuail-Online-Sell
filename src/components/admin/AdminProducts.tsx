import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Product, ProductVariant, Category } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../common/Modal';
import { 
  Plus, Edit, Trash2, Copy, Eye, EyeOff, Search, 
  Sparkles, Check, AlertCircle, Image, Layers 
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const { formatPrice, showToast } = useStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  // Product Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [regularPrice, setRegularPrice] = useState<number>(3000);
  const [salePrice, setSalePrice] = useState<number | ''>(2500);
  const [stock, setStock] = useState<number>(20);
  const [primaryImage, setPrimaryImage] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isPublished, setIsPublished] = useState(true);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Load from DB & subscribe to real-time sync
  useEffect(() => {
    const load = () => {
      setProducts(db.getProducts());
      setCategories(db.getCategories());
    };
    load();
    const unsub = db.subscribe(load);
    return unsub;
  }, []);

  const openNewProductModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`MJ-${Date.now().toString().slice(-5)}`);
    setCategoryId(categories[0]?.id || 'cat-women');
    setShortDesc('');
    setFullDesc('');
    setRegularPrice(3000);
    setSalePrice(2600);
    setStock(15);
    setPrimaryImage('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80');
    setIsFeatured(false);
    setIsNewArrival(true);
    setIsPublished(true);
    setVariants([
      { id: `var-${Date.now()}-1`, product_id: '', size: 'S', color: 'Pastel Pink', color_code: '#f472b6', sku: `MJ-VAR-S`, price: 2600, stock: 5, is_active: true },
      { id: `var-${Date.now()}-2`, product_id: '', size: 'M', color: 'Pastel Pink', color_code: '#f472b6', sku: `MJ-VAR-M`, price: 2600, stock: 5, is_active: true },
      { id: `var-${Date.now()}-3`, product_id: '', size: 'L', color: 'Sky Blue', color_code: '#38bdf8', sku: `MJ-VAR-L`, price: 2600, stock: 5, is_active: true },
    ]);
    setIsEditorOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setCategoryId(p.category_id);
    setShortDesc(p.short_description);
    setFullDesc(p.full_description);
    setRegularPrice(p.regular_price);
    setSalePrice(p.sale_price ?? '');
    setStock(p.stock);
    setPrimaryImage(p.primary_image);
    setIsFeatured(p.is_featured);
    setIsNewArrival(p.is_new_arrival);
    setIsPublished(p.is_published);
    setVariants(p.variants || []);
    setIsEditorOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) {
      showToast('Please enter a valid product name and SKU.', 'error');
      return;
    }

    const catObj = categories.find((c) => c.id === categoryId);
    const resolvedSale = salePrice === '' ? null : Number(salePrice);
    const discountPct = resolvedSale && regularPrice > resolvedSale
      ? Math.round(((regularPrice - resolvedSale) / regularPrice) * 100)
      : undefined;

    const payload = {
      name: name.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      sku: sku.trim(),
      category_id: categoryId,
      category_name: catObj?.name || 'Collection',
      short_description: shortDesc.trim() || 'Handcrafted MJ garment.',
      full_description: fullDesc.trim() || shortDesc.trim(),
      regular_price: Number(regularPrice),
      sale_price: resolvedSale,
      discount_percentage: discountPct,
      stock: Number(stock),
      low_stock_threshold: 4,
      images: [primaryImage.trim()],
      primary_image: primaryImage.trim(),
      tags: ['Fashion', 'MJ', catObj?.name || 'Exclusive'],
      is_featured: isFeatured,
      is_new_arrival: isNewArrival,
      is_best_seller: false,
      is_trending: false,
      is_on_sale: Boolean(resolvedSale && resolvedSale < regularPrice),
      is_published: isPublished,
      rating: editingProduct?.rating || 5.0,
      review_count: editingProduct?.review_count || 0,
      variants,
    };

    if (editingProduct) {
      db.updateProduct(editingProduct.id, payload);
      showToast(`Updated "${name}"`, 'success');
    } else {
      db.createProduct(payload);
      showToast(`Created new product "${name}"`, 'success');
    }

    setIsEditorOpen(false);
  };

  const handleDelete = (id: string, prodName: string) => {
    if (confirm(`Are you sure you want to delete "${prodName}"?`)) {
      db.deleteProduct(id);
      showToast(`Deleted "${prodName}"`, 'info');
    }
  };

  const handleDuplicate = (id: string) => {
    const copy = db.duplicateProduct(id);
    showToast(`Duplicated into "${copy.name}"`, 'success');
  };

  const handleTogglePublish = (p: Product) => {
    db.updateProduct(p.id, { is_published: !p.is_published });
    showToast(`"${p.name}" is now ${!p.is_published ? 'Published' : 'Hidden'}`, 'info');
  };

  // Filter products
  const filtered = products.filter((p) => {
    if (selectedCat !== 'all' && p.category_id !== selectedCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs pl-8 focus:outline-none focus:border-pink-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={openNewProductModal}
          className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-sky-600 hover:opacity-95 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="p-4">Design / SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.primary_image}
                        alt={prod.name}
                        className="w-10 h-14 object-cover rounded-lg bg-slate-100 border border-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate max-w-xs">{prod.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">SKU: {prod.sku}</p>
                        <div className="flex gap-1 mt-1">
                          {prod.is_featured && <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 rounded font-bold">Featured</span>}
                          {prod.is_new_arrival && <span className="text-[9px] bg-sky-50 text-sky-700 px-1.5 rounded font-bold">New</span>}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-slate-600 font-medium">
                    {prod.category_name}
                  </td>

                  <td className="p-4">
                    <div className="font-bold text-slate-900">
                      {formatPrice(prod.sale_price || prod.regular_price)}
                    </div>
                    {prod.sale_price && (
                      <span className="text-[10px] text-slate-400 line-through">
                        {formatPrice(prod.regular_price)}
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    <span className={`font-bold ${prod.stock <= 4 ? 'text-red-600' : 'text-slate-800'}`}>
                      {prod.stock} units
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {prod.variants.length} variations
                    </p>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => handleTogglePublish(prod)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        prod.is_published
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {prod.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {prod.is_published ? 'Published' : 'Hidden'}
                    </button>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-1.5 text-slate-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(prod.id)}
                        className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        title="Duplicate product"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id, prod.name)}
                        className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Create / Edit Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingProduct ? `Edit Product: ${editingProduct.name}` : 'Create New MJ Product'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Product Title</label>
              <input
                type="text"
                placeholder="e.g. MJ Royal Silk Embroidered Dress"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">SKU</label>
              <input
                type="text"
                placeholder="e.g. MJ-W-DR-08"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Image URL</label>
              <input
                type="url"
                value={primaryImage}
                onChange={(e) => setPrimaryImage(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Regular Price (৳)</label>
              <input
                type="number"
                value={regularPrice}
                onChange={(e) => setRegularPrice(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Sale Price (৳)</label>
              <input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Leave blank if no discount"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Short Description</label>
            <textarea
              rows={2}
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          {/* Variations Section */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <label className="font-bold text-slate-800">Variations (Sizes / Colors)</label>
              <button
                type="button"
                onClick={() => {
                  setVariants([
                    ...variants,
                    {
                      id: `var-${Date.now()}`,
                      product_id: editingProduct?.id || '',
                      size: 'M',
                      color: 'Pink',
                      sku: `${sku}-V${variants.length + 1}`,
                      price: regularPrice,
                      stock: 5,
                      is_active: true,
                    }
                  ]);
                }}
                className="text-[11px] text-pink-600 font-bold hover:underline"
              >
                + Add Variant
              </button>
            </div>

            <div className="space-y-2">
              {variants.map((v, i) => (
                <div key={v.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl">
                  <input
                    type="text"
                    value={v.size}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[i].size = e.target.value;
                      setVariants(updated);
                    }}
                    placeholder="Size"
                    className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center"
                  />
                  <input
                    type="text"
                    value={v.color}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[i].color = e.target.value;
                      setVariants(updated);
                    }}
                    placeholder="Color"
                    className="w-28 px-2 py-1 bg-white border border-slate-200 rounded-lg"
                  />
                  <input
                    type="number"
                    value={v.stock}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[i].stock = Number(e.target.value);
                      setVariants(updated);
                    }}
                    placeholder="Stock"
                    className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded accent-pink-600"
              />
              Published in Store
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded accent-pink-600"
              />
              Featured Collection
            </label>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setIsEditorOpen(false)}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-gradient-to-r from-pink-600 to-sky-600 text-white rounded-xl font-bold shadow-md"
            >
              Save to Database
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
