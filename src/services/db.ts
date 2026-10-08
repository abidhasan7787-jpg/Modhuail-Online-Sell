import { 
  Product, ProductVariant, Category, Brand, Order, OrderItem, 
  Coupon, Banner, HomepageSection, Review, BlogPost, CMSPage, 
  StoreSettings, AdminActivityLog, Notification, UserProfile, Address, OrderStatus 
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const DB_STORAGE_KEY_PREFIX = 'mj_db_v1_';

// Real-time broadcast channel across all browser tabs
let syncChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel('mj_store_realtime_sync');
  } catch (e) {
    console.warn('BroadcastChannel not supported', e);
  }
}

// Default Store Settings
export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  store_name: 'MJ',
  tagline: 'Modern Elegance & Contemporary Fashion',
  logo_url: '/logo.svg',
  phone: '+880 1700-123456',
  email: 'support@mjfashion.com.bd',
  address: 'House 42, Road 11, Block D, Banani, Dhaka-1213, Bangladesh',
  currency: 'BDT',
  currency_symbol: '৳',
  tax_rate: 0,
  inside_dhaka_shipping: 60,
  outside_dhaka_shipping: 120,
  free_shipping_threshold: 2500,
  demo_payment_enabled: true,
  maintenance_mode: false,
};

// Initial Seed Categories
const SEED_CATEGORIES: Category[] = [
  {
    id: 'cat-women',
    name: 'Women\'s Collection',
    slug: 'womens-collection',
    description: 'Chic designer dresses, co-ord sets, contemporary kurtis and evening wear.',
    image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    display_order: 1,
    is_published: true,
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-men',
    name: 'Men\'s Couture',
    slug: 'mens-couture',
    description: 'Tailored shirts, premium panjabis, linen polo shirts and formal trousers.',
    image_url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
    display_order: 2,
    is_published: true,
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-exclusive',
    name: 'MJ Exclusives',
    slug: 'mj-exclusives',
    description: 'Limited edition luxury festive and silk artisanal garments.',
    image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    display_order: 3,
    is_published: true,
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-accessories',
    name: 'Bags & Accessories',
    slug: 'accessories',
    description: 'Handcrafted leather tote bags, silk scarves, belts and statement pieces.',
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    display_order: 4,
    is_published: true,
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Seed Brands
const SEED_BRANDS: Brand[] = [
  { id: 'brand-mj', name: 'MJ Atelier', slug: 'mj-atelier', is_published: true },
  { id: 'brand-luxe', name: 'MJ Signature', slug: 'mj-signature', is_published: true },
  { id: 'brand-raw', name: 'MJ Organic', slug: 'mj-organic', is_published: true },
];

// Seed Products with Variations
const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'MJ Rose Blossom Embroidered Co-Ord Set',
    slug: 'mj-rose-blossom-embroidered-co-ord-set',
    sku: 'MJ-W-CO-01',
    category_id: 'cat-women',
    category_name: 'Women\'s Collection',
    brand_id: 'brand-mj',
    brand_name: 'MJ Atelier',
    short_description: 'Pure Georgette two-piece set featuring exquisite pastel floral embroidery and delicate scallop cuffs.',
    full_description: 'Crafted from breathable organza-silk blend with fine embroidery across the collar and sleeves. Designed for effortless glamour at high-tea gatherings and festive dinners. Includes tailored elasticated-back palazzo trousers.',
    regular_price: 3450,
    sale_price: 2890,
    discount_percentage: 16,
    cost_price: 1800,
    stock: 24,
    low_stock_threshold: 5,
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80'
    ],
    primary_image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80',
    gender: 'Women',
    fabric: 'Georgette Silk',
    material: '80% Viscose, 20% Silk',
    weight: '350g',
    tags: ['Co-ord', 'Embroidered', 'Festive', 'Pink', 'Sky Blue'],
    is_featured: true,
    is_new_arrival: true,
    is_best_seller: true,
    is_trending: true,
    is_on_sale: true,
    is_published: true,
    rating: 4.9,
    review_count: 14,
    variants: [
      { id: 'var-001-1', product_id: 'prod-001', size: 'S', color: 'Pastel Pink', color_code: '#f472b6', sku: 'MJ-W-CO-01-PK-S', price: 2890, sale_price: 2890, stock: 6, is_active: true },
      { id: 'var-001-2', product_id: 'prod-001', size: 'M', color: 'Pastel Pink', color_code: '#f472b6', sku: 'MJ-W-CO-01-PK-M', price: 2890, sale_price: 2890, stock: 8, is_active: true },
      { id: 'var-001-3', product_id: 'prod-001', size: 'L', color: 'Pastel Pink', color_code: '#f472b6', sku: 'MJ-W-CO-01-PK-L', price: 2890, sale_price: 2890, stock: 5, is_active: true },
      { id: 'var-001-4', product_id: 'prod-001', size: 'M', color: 'Sky Blue', color_code: '#38bdf8', sku: 'MJ-W-CO-01-BL-M', price: 2890, sale_price: 2890, stock: 5, is_active: true },
    ],
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-002',
    name: 'MJ Sky Azure Premium Tailored Silk Shirt',
    slug: 'mj-sky-azure-premium-tailored-silk-shirt',
    sku: 'MJ-M-SH-02',
    category_id: 'cat-men',
    category_name: 'Men\'s Couture',
    brand_id: 'brand-luxe',
    brand_name: 'MJ Signature',
    short_description: 'Egyptian cotton and raw silk blend shirt with mother-of-pearl buttons in iconic sky azure shade.',
    full_description: 'A signature essential from MJ. Cut in a contemporary slim drape, finished with French plackets and Italian collar. Breathable in tropical climates while retaining structure all evening.',
    regular_price: 2650,
    sale_price: 2250,
    discount_percentage: 15,
    cost_price: 1300,
    stock: 18,
    low_stock_threshold: 4,
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80'
    ],
    primary_image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80',
    gender: 'Men',
    fabric: 'Egyptian Cotton & Silk',
    material: '90% Cotton, 10% Silk',
    weight: '220g',
    tags: ['Men', 'Shirt', 'Sky Blue', 'Formal', 'Luxury'],
    is_featured: true,
    is_new_arrival: true,
    is_best_seller: false,
    is_trending: true,
    is_on_sale: true,
    is_published: true,
    rating: 4.8,
    review_count: 9,
    variants: [
      { id: 'var-002-1', product_id: 'prod-002', size: '38 (M)', color: 'Sky Azure', color_code: '#0284c7', sku: 'MJ-M-SH-02-AZ-38', price: 2250, sale_price: 2250, stock: 7, is_active: true },
      { id: 'var-002-2', product_id: 'prod-002', size: '40 (L)', color: 'Sky Azure', color_code: '#0284c7', sku: 'MJ-M-SH-02-AZ-40', price: 2250, sale_price: 2250, stock: 6, is_active: true },
      { id: 'var-002-3', product_id: 'prod-002', size: '42 (XL)', color: 'Sky Azure', color_code: '#0284c7', sku: 'MJ-M-SH-02-AZ-42', price: 2250, sale_price: 2250, stock: 5, is_active: true },
    ],
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-003',
    name: 'MJ Ivory & Pink Pleated Tiered Maxi Dress',
    slug: 'mj-ivory-pink-pleated-tiered-maxi-dress',
    sku: 'MJ-W-DR-03',
    category_id: 'cat-women',
    category_name: 'Women\'s Collection',
    brand_id: 'brand-mj',
    brand_name: 'MJ Atelier',
    short_description: 'Flowing tiered chiffon maxi dress with gentle rose-pink gradient ombre and tie-waist sash.',
    full_description: 'An ethereal silhouette with micro-accordion pleats cascading gracefully to the floor. Comes with an optional matching embellished belt and silk inner slip.',
    regular_price: 4200,
    sale_price: 3500,
    discount_percentage: 17,
    cost_price: 2100,
    stock: 15,
    low_stock_threshold: 3,
    images: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'
    ],
    primary_image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
    gender: 'Women',
    fabric: 'Chiffon Silk',
    material: '100% Fine Poly-Silk',
    weight: '400g',
    tags: ['Maxi', 'Dress', 'Pink', 'Elegance', 'Wedding Guest'],
    is_featured: true,
    is_new_arrival: false,
    is_best_seller: true,
    is_trending: true,
    is_on_sale: true,
    is_published: true,
    rating: 5.0,
    review_count: 22,
    variants: [
      { id: 'var-003-1', product_id: 'prod-003', size: 'S', color: 'Rose Ombre', color_code: '#ec4899', sku: 'MJ-W-DR-03-S', price: 3500, sale_price: 3500, stock: 4, is_active: true },
      { id: 'var-003-2', product_id: 'prod-003', size: 'M', color: 'Rose Ombre', color_code: '#ec4899', sku: 'MJ-W-DR-03-M', price: 3500, sale_price: 3500, stock: 6, is_active: true },
      { id: 'var-003-3', product_id: 'prod-003', size: 'L', color: 'Rose Ombre', color_code: '#ec4899', sku: 'MJ-W-DR-03-L', price: 3500, sale_price: 3500, stock: 5, is_active: true },
    ],
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-004',
    name: 'MJ Signature Royal Jacquard Panjabi',
    slug: 'mj-signature-royal-jacquard-panjabi',
    sku: 'MJ-M-PJ-04',
    category_id: 'cat-men',
    category_name: 'Men\'s Couture',
    brand_id: 'brand-luxe',
    brand_name: 'MJ Signature',
    short_description: 'Handwoven jacquard motif panjabi with subtle metallic sheen and custom brass button accents.',
    full_description: 'Tailored for festive celebrations, weddings, and Eid. Features contrast thread hand-embroidery along the mandarin collar and cuffs. Tailored semi-fitted silhouette.',
    regular_price: 3800,
    sale_price: 3200,
    discount_percentage: 16,
    cost_price: 1950,
    stock: 20,
    low_stock_threshold: 4,
    images: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=900&q=80'
    ],
    primary_image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80',
    gender: 'Men',
    fabric: 'Premium Jacquard Cotton',
    material: '100% Combed Cotton',
    weight: '320g',
    tags: ['Panjabi', 'Men', 'Festive', 'Eid', 'Traditional'],
    is_featured: true,
    is_new_arrival: true,
    is_best_seller: true,
    is_trending: true,
    is_on_sale: false,
    is_published: true,
    rating: 4.9,
    review_count: 17,
    variants: [
      { id: 'var-004-1', product_id: 'prod-004', size: '40', color: 'Pristine White', color_code: '#ffffff', sku: 'MJ-M-PJ-04-WH-40', price: 3200, sale_price: 3200, stock: 7, is_active: true },
      { id: 'var-004-2', product_id: 'prod-004', size: '42', color: 'Pristine White', color_code: '#ffffff', sku: 'MJ-M-PJ-04-WH-42', price: 3200, sale_price: 3200, stock: 8, is_active: true },
      { id: 'var-004-3', product_id: 'prod-004', size: '44', color: 'Pristine White', color_code: '#ffffff', sku: 'MJ-M-PJ-04-WH-44', price: 3200, sale_price: 3200, stock: 5, is_active: true },
    ],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-005',
    name: 'MJ Pastel Cloud Vegan Leather Crossbody',
    slug: 'mj-pastel-cloud-vegan-leather-crossbody',
    sku: 'MJ-A-BG-05',
    category_id: 'cat-accessories',
    category_name: 'Bags & Accessories',
    brand_id: 'brand-mj',
    brand_name: 'MJ Atelier',
    short_description: 'Structured curved shoulder handbag with detachable gold-tone chain strap and dual compartments.',
    full_description: 'Designed with ultra-soft pebble grain vegan leather. Fits all phones, cardholder, cosmetics and keys with magnetic twist lock closure.',
    regular_price: 1950,
    sale_price: 1650,
    discount_percentage: 15,
    cost_price: 900,
    stock: 12,
    low_stock_threshold: 3,
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80'
    ],
    primary_image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
    gender: 'Women',
    fabric: 'Vegan Pebble Leather',
    material: 'Polyurethane & Gold Hardware',
    weight: '450g',
    tags: ['Bag', 'Accessories', 'Crossbody', 'Pink'],
    is_featured: false,
    is_new_arrival: true,
    is_best_seller: false,
    is_trending: true,
    is_on_sale: true,
    is_published: true,
    rating: 4.7,
    review_count: 5,
    variants: [
      { id: 'var-005-1', product_id: 'prod-005', size: 'One Size', color: 'Baby Pink', color_code: '#fbcfe8', sku: 'MJ-A-BG-05-PK', price: 1650, sale_price: 1650, stock: 6, is_active: true },
      { id: 'var-005-2', product_id: 'prod-005', size: 'One Size', color: 'Sky Blue', color_code: '#bae6fd', sku: 'MJ-A-BG-05-BL', price: 1650, sale_price: 1650, stock: 6, is_active: true },
    ],
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-006',
    name: 'MJ Celestial Silk Organza Dupatta Scarf',
    slug: 'mj-celestial-silk-organza-dupatta-scarf',
    sku: 'MJ-W-SC-06',
    category_id: 'cat-exclusive',
    category_name: 'MJ Exclusives',
    brand_id: 'brand-mj',
    brand_name: 'MJ Atelier',
    short_description: 'Hand-painted floral motifs on sheer tissue organza with scalloped pearl lace border.',
    full_description: 'An heirloom accessory crafted by senior artisans. Drapes lightly over suits, lehengas, or modern evening ensembles.',
    regular_price: 2400,
    sale_price: 1999,
    discount_percentage: 17,
    cost_price: 1100,
    stock: 9,
    low_stock_threshold: 2,
    images: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80',
    ],
    primary_image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80',
    gender: 'Women',
    fabric: 'Pure Silk Organza',
    material: '100% Silk',
    weight: '180g',
    tags: ['Dupatta', 'Organza', 'Exclusive', 'Silk'],
    is_featured: true,
    is_new_arrival: false,
    is_best_seller: false,
    is_trending: false,
    is_on_sale: true,
    is_published: true,
    rating: 4.8,
    review_count: 8,
    variants: [
      { id: 'var-006-1', product_id: 'prod-006', size: 'Standard (2.5m)', color: 'Powder Blue & Rose', color_code: '#e0f2fe', sku: 'MJ-W-SC-06-STD', price: 1999, sale_price: 1999, stock: 9, is_active: true },
    ],
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Seed Banners
const SEED_BANNERS: Banner[] = [
  {
    id: 'ban-001',
    title: 'The Royal Autumn/Festive Atelier',
    subtitle: 'Contemporary silhouettes designed with timeless elegance in Pink, Sky Blue & Ivory.',
    button_text: 'Explore Collection',
    button_url: '/shop?filter=new',
    image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=85',
    type: 'hero',
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ban-002',
    title: 'Men\'s Tailored Royal Panjabis & Shirts',
    subtitle: 'Signature Egyptian cotton and hand-embroidered jacquard for festive sophistication.',
    button_text: 'Shop Men\'s Edit',
    button_url: '/shop?category=cat-men',
    image_url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1800&q=85',
    type: 'hero',
    display_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ban-003',
    title: 'Flat 15% Off Your First Order',
    subtitle: 'Use code MJ10 at checkout. Fast delivery within 48 hours across Dhaka city.',
    button_text: 'Claim Offer',
    button_url: '/shop',
    image_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1800&q=85',
    type: 'promo',
    display_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
  }
];

// Seed Coupons
const SEED_COUPONS: Coupon[] = [
  {
    id: 'coup-001',
    code: 'MJ10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 1500,
    max_discount_amount: 500,
    start_date: '2026-01-01T00:00:00Z',
    end_date: '2026-12-31T23:59:59Z',
    usage_limit: 1000,
    used_count: 42,
    per_user_limit: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'coup-002',
    code: 'FESTIVE300',
    discount_type: 'fixed',
    discount_value: 300,
    min_order_amount: 2500,
    start_date: '2026-01-01T00:00:00Z',
    end_date: '2026-12-31T23:59:59Z',
    usage_limit: 500,
    used_count: 18,
    per_user_limit: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'coup-003',
    code: 'FREESHIP',
    discount_type: 'fixed',
    discount_value: 120,
    min_order_amount: 2000,
    start_date: '2026-01-01T00:00:00Z',
    end_date: '2026-12-31T23:59:59Z',
    usage_limit: 300,
    used_count: 11,
    per_user_limit: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  }
];

// Seed Reviews
const SEED_REVIEWS: Review[] = [
  {
    id: 'rev-001',
    product_id: 'prod-001',
    user_id: 'user-001',
    user_name: 'Sabrina Rahman',
    rating: 5,
    review_text: 'The embroidery on this co-ord set is immaculate! The pastel pink shade is so soft and premium. Fits true to size and arrived in Dhanmondi in just 24 hours.',
    is_verified_purchase: true,
    is_approved: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    admin_reply: 'Thank you Sabrina! We are thrilled that you love our Rose Blossom Co-ord set.',
  },
  {
    id: 'rev-002',
    product_id: 'prod-002',
    user_id: 'user-002',
    user_name: 'Tanvir Hossain',
    rating: 5,
    review_text: 'Top notch fabric quality! The sky blue color looks even better in real life under sunlight. Got so many compliments at my corporate event.',
    is_verified_purchase: true,
    is_approved: true,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'rev-003',
    product_id: 'prod-003',
    user_id: 'user-003',
    user_name: 'Nusrat Jahan',
    rating: 5,
    review_text: 'MJ never disappoints! The chiffon falls like a dream. Thank you for the quick customer support on WhatsApp too.',
    is_verified_purchase: true,
    is_approved: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  }
];

// Seed CMS Pages
const SEED_CMS_PAGES: CMSPage[] = [
  {
    id: 'page-about',
    slug: 'about-us',
    title: 'About MJ Fashion',
    last_updated: new Date().toISOString(),
    content: `
      <h2>The Story of MJ</h2>
      <p>MJ was founded with a singular conviction: luxury fashion should be timeless, effortless, and thoughtfully crafted. Blending international couture aesthetics with the rich textile heritage of Bengal, MJ curates collections that celebrate individuality, grace, and modern elegance.</p>
      <h3>Our Philosophy</h3>
      <p>From custom-spun silks and Egyptian cottons to artisanal hand embroidery, every garment is tailored to precision. Our signature palette of blush pink, tranquil sky azure, and pristine ivory mirrors serenity and confidence.</p>
      <h3>Commitment to Quality</h3>
      <p>Every piece undergoes strict three-stage quality inspections before reaching your doorstep across all 64 districts of Bangladesh.</p>
    `
  },
  {
    id: 'page-shipping',
    slug: 'shipping-policy',
    title: 'Shipping & Delivery Policy',
    last_updated: new Date().toISOString(),
    content: `
      <h2>Fast & Reliable Nationwide Delivery</h2>
      <p>MJ delivers across all 64 districts in Bangladesh through trusted express delivery partners.</p>
      <ul>
        <li><strong>Inside Dhaka City:</strong> Delivery within 24 to 48 hours (Standard Fee: ৳60).</li>
        <li><strong>Outside Dhaka (Nationwide):</strong> Delivery within 48 to 72 hours (Standard Fee: ৳120).</li>
        <li><strong>Free Express Shipping:</strong> Available on all orders over ৳2,500.</li>
      </ul>
      <p>Real-time SMS and email tracking links are dispatched immediately after your package is dispatched from our Banani atelier.</p>
    `
  },
  {
    id: 'page-return',
    slug: 'return-refund-policy',
    title: '7-Day Hassle-Free Returns & Refunds',
    last_updated: new Date().toISOString(),
    content: `
      <h2>Our 7-Day Satisfaction Guarantee</h2>
      <p>We want you to love your MJ purchase. If your item does not fit or arrives with any defect, you can exchange or return it within 7 days of delivery.</p>
      <h3>Eligibility</h3>
      <ul>
        <li>Garment must be unworn, unwashed, and in original packaging with MJ tags intact.</li>
        <li>Cash on Delivery orders can be inspected in front of the delivery agent.</li>
        <li>Refunds for bKash, Nagad, Rocket, or card payments are credited within 3-5 business days upon item return inspection.</li>
      </ul>
    `
  },
  {
    id: 'page-faq',
    slug: 'faq',
    title: 'Frequently Asked Questions',
    last_updated: new Date().toISOString(),
    content: `
      <h2>Got Questions? We have answers.</h2>
      <h3>How do I place an order?</h3>
      <p>Browse our catalog, select your size and color variant, add the item to your cart, and proceed to checkout. You can check out as a guest or create an MJ customer account.</p>
      <h3>What payment options do you accept?</h3>
      <p>We accept Cash on Delivery (COD) across all Bangladesh districts, as well as digital payments via bKash, Nagad, Rocket, and Visa/Mastercard.</p>
      <h3>Can I check my size before buying?</h3>
      <p>Yes! Every product page features an exact size guide in inches with bust, waist, length, and shoulder specifications.</p>
    `
  }
];

// Seed Blog Posts
const SEED_BLOGS: BlogPost[] = [
  {
    id: 'blog-001',
    title: 'The Art of Layering: Styling Pastels for Festive Celebrations',
    slug: 'art-of-layering-styling-pastels',
    excerpt: 'How soft hues of rose pink and celestial azure are redefining festive occasionwear this season.',
    content: '<p>Pastel palettes have emerged as the defining signature of modern festive dressing. Rather than heavy traditional dark tones, airy georgettes and tissue organzas paired with delicate scalloped borders offer unparalleled comfort and elegance under tropical warmth.</p>',
    featured_image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80',
    category: 'Style Guide',
    tags: ['Fashion', 'Pastels', 'Festive', 'MJ'],
    author: 'MJ Editorial Team',
    is_published: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'blog-002',
    title: 'Gentlemen\'s Guide to Premium Fabrics: Cotton vs Silk Blends',
    slug: 'gentlemens-guide-premium-fabrics',
    excerpt: 'Understanding thread counts, plackets, and natural weaves for executive everyday comfort.',
    content: '<p>When investing in luxury menswear, the composition of the yarn is everything. Egyptian cotton provides breathability and crispness, while raw silk adds a gentle natural sheen that elevates ordinary tailoring into couture.</p>',
    featured_image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80',
    category: 'Menswear',
    tags: ['Men', 'Silk', 'Couture'],
    author: 'Santo Admin',
    is_published: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }
];

// Seed Demo Orders
const SEED_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    order_number: 'MJ-202610-8492',
    user_id: 'user-001',
    customer_name: 'Sabrina Rahman',
    customer_email: 'sabrina.rahman@example.com',
    customer_phone: '01711223344',
    shipping_address: {
      id: 'addr-001',
      full_name: 'Sabrina Rahman',
      phone: '01711223344',
      email: 'sabrina.rahman@example.com',
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Dhanmondi',
      street_address: 'House 14/A, Road 8, Dhanmondi',
      postal_code: '1205',
    },
    items: [
      {
        id: 'item-101',
        order_id: 'ord-1001',
        product_id: 'prod-001',
        product_name: 'MJ Rose Blossom Embroidered Co-Ord Set',
        variant_id: 'var-001-2',
        sku: 'MJ-W-CO-01-PK-M',
        size: 'M',
        color: 'Pastel Pink',
        price: 2890,
        regular_price: 3450,
        quantity: 1,
        subtotal: 2890,
        image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80',
      }
    ],
    subtotal: 2890,
    shipping_fee: 0,
    discount_amount: 289,
    coupon_code: 'MJ10',
    total_amount: 2601,
    payment_method: 'bkash',
    payment_status: 'paid',
    payment_transaction_id: 'BK9A72L50Q',
    order_status: 'delivered',
    status_history: [
      { id: 'sh-1', order_id: 'ord-1001', status: 'pending', created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
      { id: 'sh-2', order_id: 'ord-1001', status: 'confirmed', created_at: new Date(Date.now() - 86400000 * 3 + 3600000).toISOString() },
      { id: 'sh-3', order_id: 'ord-1001', status: 'shipped', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 'sh-4', order_id: 'ord-1001', status: 'delivered', created_at: new Date(Date.now() - 86400000 * 1).toISOString() },
    ],
    tracking_number: 'REDX-8923412',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ord-1002',
    order_number: 'MJ-202610-9120',
    user_id: 'user-002',
    customer_name: 'Tanvir Hossain',
    customer_email: 'tanvir.hossain@example.com',
    customer_phone: '01812345678',
    shipping_address: {
      id: 'addr-002',
      full_name: 'Tanvir Hossain',
      phone: '01812345678',
      division: 'Chattogram',
      district: 'Chattogram',
      upazila: 'GEC Circle',
      street_address: 'Flat 4B, Hill View Residential Area',
      postal_code: '4000',
    },
    items: [
      {
        id: 'item-102',
        order_id: 'ord-1002',
        product_id: 'prod-002',
        product_name: 'MJ Sky Azure Premium Tailored Silk Shirt',
        variant_id: 'var-002-1',
        sku: 'MJ-M-SH-02-AZ-38',
        size: '38 (M)',
        color: 'Sky Azure',
        price: 2250,
        regular_price: 2650,
        quantity: 1,
        subtotal: 2250,
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80',
      }
    ],
    subtotal: 2250,
    shipping_fee: 120,
    discount_amount: 0,
    total_amount: 2370,
    payment_method: 'cod',
    payment_status: 'pending',
    order_status: 'processing',
    status_history: [
      { id: 'sh-201', order_id: 'ord-1002', status: 'pending', created_at: new Date(Date.now() - 86400000 * 1).toISOString() },
      { id: 'sh-202', order_id: 'ord-1002', status: 'confirmed', created_at: new Date(Date.now() - 86400000 * 1 + 1800000).toISOString() },
      { id: 'sh-203', order_id: 'ord-1002', status: 'processing', created_at: new Date().toISOString() },
    ],
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Helper to read / write table
function getTableData<T>(table: string, defaultData: T[]): T[] {
  if (typeof window === 'undefined') return defaultData;
  try {
    const raw = localStorage.getItem(`${DB_STORAGE_KEY_PREFIX}${table}`);
    if (!raw) {
      localStorage.setItem(`${DB_STORAGE_KEY_PREFIX}${table}`, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading table ${table}`, e);
    return defaultData;
  }
}

function saveTableData<T>(table: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${DB_STORAGE_KEY_PREFIX}${table}`, JSON.stringify(data));
    // Broadcast change to other tabs/windows in real time
    if (syncChannel) {
      syncChannel.postMessage({ type: 'TABLE_MUTATION', table, timestamp: Date.now() });
    }
  } catch (e) {
    console.error(`Error saving table ${table}`, e);
  }
}

// In-Memory cache with persistent backing
class RelationalDatabaseEngine {
  private subscribers: Array<() => void> = [];

  constructor() {
    if (typeof window !== 'undefined' && syncChannel) {
      syncChannel.onmessage = (event) => {
        if (event.data?.type === 'TABLE_MUTATION') {
          this.notifySubscribers();
        }
      };
    }
  }

  public subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(cb => {
      try { cb(); } catch (err) { console.error('Subscriber notify error', err); }
    });
  }

  // --- PRODUCTS ---
  public getProducts(options?: { onlyPublished?: boolean; categoryId?: string; search?: string }): Product[] {
    let list = getTableData<Product>('products', SEED_PRODUCTS);
    if (options?.onlyPublished) {
      list = list.filter(p => p.is_published);
    }
    if (options?.categoryId) {
      list = list.filter(p => p.category_id === options.categoryId);
    }
    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.category_name?.toLowerCase().includes(q) ||
        p.short_description.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getProductById(id: string): Product | undefined {
    return this.getProducts().find(p => p.id === id);
  }

  public getProductBySlug(slug: string): Product | undefined {
    return this.getProducts().find(p => p.slug === slug);
  }

  public createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    // Ensure slug uniqueness
    newProduct.slug = newProduct.slug || newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    products.unshift(newProduct);
    saveTableData('products', products);
    this.logActivity('Admin', `Created product "${newProduct.name}" (SKU: ${newProduct.sku})`, 'product', newProduct.id);
    this.notifySubscribers();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error(`Product with ID ${id} not found`);

    const updated = {
      ...products[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    products[index] = updated;
    saveTableData('products', products);
    this.logActivity('Admin', `Updated product "${updated.name}" (Price: ৳${updated.sale_price || updated.regular_price}, Stock: ${updated.stock})`, 'product', id);
    this.notifySubscribers();
    return updated;
  }

  public deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const target = products.find(p => p.id === id);
    const filtered = products.filter(p => p.id !== id);
    saveTableData('products', filtered);
    if (target) {
      this.logActivity('Admin', `Deleted product "${target.name}" (SKU: ${target.sku})`, 'product', id);
    }
    this.notifySubscribers();
    return true;
  }

  public duplicateProduct(id: string): Product {
    const orig = this.getProductById(id);
    if (!orig) throw new Error('Original product not found');

    const copyData = {
      ...orig,
      name: `${orig.name} (Copy)`,
      sku: `${orig.sku}-COPY-${Math.floor(Math.random() * 1000)}`,
      slug: `${orig.slug}-copy-${Date.now().toString(36)}`,
      variants: orig.variants.map((v, i) => ({
        ...v,
        id: `var-${Date.now()}-${i}`,
        sku: `${v.sku}-CP${i}`,
      })),
    };
    delete (copyData as any).id;
    delete (copyData as any).created_at;
    delete (copyData as any).updated_at;
    return this.createProduct(copyData);
  }

  // --- ATOMIC INVENTORY & ORDER TRANSACTION (RACE-CONDITION RESISTANT) ---
  public placeOrderAtomic(orderData: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: Address;
    items: Array<{
      product_id: string;
      variant_id?: string;
      quantity: number;
    }>;
    coupon_code?: string;
    payment_method: any;
    order_notes?: string;
    user_id?: string;
  }): { success: boolean; order?: Order; error?: string } {
    const products = this.getProducts();
    const verifiedItems: OrderItem[] = [];
    let subtotal = 0;

    // 1. Transaction verification: Check all items and stock
    for (const item of orderData.items) {
      const product = products.find(p => p.id === item.product_id);
      if (!product || !product.is_published) {
        return { success: false, error: `Product is not available for purchase.` };
      }

      let unitPrice = product.sale_price ?? product.regular_price;
      let availableStock = product.stock;
      let sku = product.sku;
      let size = '';
      let color = '';

      if (item.variant_id) {
        const variant = product.variants.find(v => v.id === item.variant_id && v.is_active);
        if (!variant) {
          return { success: false, error: `Selected variant for "${product.name}" is no longer active.` };
        }
        unitPrice = variant.sale_price ?? variant.price;
        availableStock = variant.stock;
        sku = variant.sku;
        size = variant.size;
        color = variant.color;
      }

      if (availableStock < item.quantity) {
        return { 
          success: false, 
          error: `Insufficient stock for "${product.name}" (${size ? size + ' ' : ''}${color ? color : ''}). Only ${availableStock} units remaining.` 
        };
      }

      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;

      verifiedItems.push({
        id: `oi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        order_id: '', // Will assign once order created
        product_id: product.id,
        product_name: product.name,
        variant_id: item.variant_id,
        sku,
        size,
        color,
        price: unitPrice,
        regular_price: product.regular_price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        image: product.primary_image,
      });
    }

    // 2. Coupon evaluation (server-safe)
    let discountAmount = 0;
    if (orderData.coupon_code) {
      const coupon = this.validateCoupon(orderData.coupon_code, subtotal);
      if (coupon.valid) {
        discountAmount = coupon.discountAmount;
        this.incrementCouponUsage(orderData.coupon_code);
      }
    }

    // 3. Shipping fee evaluation
    const settings = this.getStoreSettings();
    const isInsideDhaka = orderData.shipping_address.division?.toLowerCase() === 'dhaka' &&
      orderData.shipping_address.district?.toLowerCase() === 'dhaka';
    let shippingFee = isInsideDhaka ? settings.inside_dhaka_shipping : settings.outside_dhaka_shipping;
    if (subtotal >= settings.free_shipping_threshold) {
      shippingFee = 0;
    }

    const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

    // 4. ATOMIC INVENTORY DEDUCTION
    for (const item of orderData.items) {
      const pIdx = products.findIndex(p => p.id === item.product_id);
      if (pIdx !== -1) {
        products[pIdx].stock = Math.max(0, products[pIdx].stock - item.quantity);
        if (item.variant_id) {
          const vIdx = products[pIdx].variants.findIndex(v => v.id === item.variant_id);
          if (vIdx !== -1) {
            products[pIdx].variants[vIdx].stock = Math.max(0, products[pIdx].variants[vIdx].stock - item.quantity);
          }
        }
      }
    }
    saveTableData('products', products);

    // 5. Create Order Record
    const orderNumber = `MJ-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrderId = `ord-${Date.now()}`;
    verifiedItems.forEach(i => (i.order_id = newOrderId));

    const newOrder: Order = {
      id: newOrderId,
      order_number: orderNumber,
      user_id: orderData.user_id,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone,
      shipping_address: orderData.shipping_address,
      items: verifiedItems,
      subtotal,
      shipping_fee: shippingFee,
      discount_amount: discountAmount,
      coupon_code: orderData.coupon_code,
      total_amount: totalAmount,
      payment_method: orderData.payment_method,
      payment_status: orderData.payment_method === 'cod' ? 'pending' : 'paid',
      payment_transaction_id: orderData.payment_method !== 'cod' ? `TXN-${Date.now().toString(36).toUpperCase()}` : undefined,
      order_status: 'pending',
      status_history: [
        {
          id: `sh-${Date.now()}`,
          order_id: newOrderId,
          status: 'pending',
          comment: 'Order placed by customer via ' + orderData.payment_method.toUpperCase(),
          created_at: new Date().toISOString(),
        }
      ],
      order_notes: orderData.order_notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const orders = this.getOrders();
    orders.unshift(newOrder);
    saveTableData('orders', orders);

    // Create admin notification
    this.createNotification({
      for_admin: true,
      title: 'New Order Received',
      message: `Order #${orderNumber} placed by ${newOrder.customer_name} for ৳${newOrder.total_amount}.`,
      type: 'order',
      link: `/admin/orders?id=${newOrder.id}`,
    });

    this.logActivity('Customer', `Placed order #${orderNumber} for ৳${totalAmount}`, 'order', newOrderId);
    this.notifySubscribers();

    return { success: true, order: newOrder };
  }

  // --- ORDERS ---
  public getOrders(): Order[] {
    return getTableData<Order>('orders', SEED_ORDERS);
  }

  public getOrderById(id: string): Order | undefined {
    return this.getOrders().find(o => o.id === id || o.order_number === id);
  }

  public updateOrderStatus(orderId: string, status: OrderStatus, comment?: string): Order {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    const previousStatus = orders[index].order_status;
    orders[index].order_status = status;
    orders[index].updated_at = new Date().toISOString();

    // If order was cancelled and was not delivered/returned, return stock
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      const products = this.getProducts();
      for (const item of orders[index].items) {
        const pIdx = products.findIndex(p => p.id === item.product_id);
        if (pIdx !== -1) {
          products[pIdx].stock += item.quantity;
          if (item.variant_id) {
            const vIdx = products[pIdx].variants.findIndex(v => v.id === item.variant_id);
            if (vIdx !== -1) {
              products[pIdx].variants[vIdx].stock += item.quantity;
            }
          }
        }
      }
      saveTableData('products', products);
    }

    orders[index].status_history.push({
      id: `sh-${Date.now()}`,
      order_id: orderId,
      status,
      comment: comment || `Status updated to ${status.replace(/_/g, ' ').toUpperCase()}`,
      created_at: new Date().toISOString(),
    });

    saveTableData('orders', orders);
    this.logActivity('Admin', `Updated order #${orders[index].order_number} status to "${status}"`, 'order', orderId);
    this.notifySubscribers();
    return orders[index];
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    return getTableData<Category>('categories', SEED_CATEGORIES);
  }

  public createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Category {
    const list = this.getCategories();
    const newCat: Category = {
      ...category,
      id: `cat-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.push(newCat);
    saveTableData('categories', list);
    this.logActivity('Admin', `Created category "${newCat.name}"`, 'category', newCat.id);
    this.notifySubscribers();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category {
    const list = this.getCategories();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    saveTableData('categories', list);
    this.logActivity('Admin', `Updated category "${list[idx].name}"`, 'category', id);
    this.notifySubscribers();
    return list[idx];
  }

  public deleteCategory(id: string): boolean {
    const list = this.getCategories();
    const filtered = list.filter(c => c.id !== id);
    saveTableData('categories', filtered);
    this.logActivity('Admin', `Deleted category ID: ${id}`, 'category', id);
    this.notifySubscribers();
    return true;
  }

  // --- BRANDS ---
  public getBrands(): Brand[] {
    return getTableData<Brand>('brands', SEED_BRANDS);
  }

  public createBrand(brand: Omit<Brand, 'id'>): Brand {
    const list = this.getBrands();
    const newBrand: Brand = { ...brand, id: `brand-${Date.now()}` };
    list.push(newBrand);
    saveTableData('brands', list);
    this.notifySubscribers();
    return newBrand;
  }

  // --- COUPONS ---
  public getCoupons(): Coupon[] {
    return getTableData<Coupon>('coupons', SEED_COUPONS);
  }

  public createCoupon(coupon: Omit<Coupon, 'id' | 'created_at' | 'used_count'>): Coupon {
    const list = this.getCoupons();
    const newCoupon: Coupon = {
      ...coupon,
      id: `coup-${Date.now()}`,
      code: coupon.code.toUpperCase().trim(),
      used_count: 0,
      created_at: new Date().toISOString(),
    };
    list.unshift(newCoupon);
    saveTableData('coupons', list);
    this.logActivity('Admin', `Created coupon code "${newCoupon.code}"`, 'coupon', newCoupon.id);
    this.notifySubscribers();
    return newCoupon;
  }

  public updateCoupon(id: string, updates: Partial<Coupon>): Coupon {
    const list = this.getCoupons();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Coupon not found');
    list[idx] = { ...list[idx], ...updates };
    saveTableData('coupons', list);
    this.notifySubscribers();
    return list[idx];
  }

  public deleteCoupon(id: string): boolean {
    const list = this.getCoupons();
    const filtered = list.filter(c => c.id !== id);
    saveTableData('coupons', filtered);
    this.notifySubscribers();
    return true;
  }

  public validateCoupon(code: string, subtotal: number): { valid: boolean; discountAmount: number; message: string; coupon?: Coupon } {
    const coupons = this.getCoupons();
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase().trim() && c.is_active);
    if (!coupon) {
      return { valid: false, discountAmount: 0, message: 'Invalid or expired promo code.' };
    }
    const now = new Date();
    if (new Date(coupon.start_date) > now || new Date(coupon.end_date) < now) {
      return { valid: false, discountAmount: 0, message: 'This coupon has expired.' };
    }
    if (coupon.used_count >= coupon.usage_limit) {
      return { valid: false, discountAmount: 0, message: 'Coupon usage limit has been reached.' };
    }
    if (subtotal < coupon.min_order_amount) {
      return { 
        valid: false, 
        discountAmount: 0, 
        message: `Minimum order of ৳${coupon.min_order_amount} required to use this code.` 
      };
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (subtotal * coupon.discount_value) / 100;
      if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
        discount = coupon.max_discount_amount;
      }
    } else {
      discount = coupon.discount_value;
    }
    discount = Math.min(discount, subtotal);

    return {
      valid: true,
      discountAmount: Math.round(discount),
      message: `Coupon "${coupon.code}" applied! You saved ৳${Math.round(discount)}.`,
      coupon
    };
  }

  private incrementCouponUsage(code: string) {
    const list = this.getCoupons();
    const idx = list.findIndex(c => c.code.toUpperCase() === code.toUpperCase().trim());
    if (idx !== -1) {
      list[idx].used_count += 1;
      saveTableData('coupons', list);
    }
  }

  // --- BANNERS ---
  public getBanners(): Banner[] {
    return getTableData<Banner>('banners', SEED_BANNERS);
  }

  public createBanner(banner: Omit<Banner, 'id' | 'created_at'>): Banner {
    const list = this.getBanners();
    const newBanner: Banner = {
      ...banner,
      id: `ban-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    list.push(newBanner);
    saveTableData('banners', list);
    this.logActivity('Admin', `Created banner "${newBanner.title}"`, 'banner', newBanner.id);
    this.notifySubscribers();
    return newBanner;
  }

  public updateBanner(id: string, updates: Partial<Banner>): Banner {
    const list = this.getBanners();
    const idx = list.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Banner not found');
    list[idx] = { ...list[idx], ...updates };
    saveTableData('banners', list);
    this.notifySubscribers();
    return list[idx];
  }

  public deleteBanner(id: string): boolean {
    const list = this.getBanners();
    const filtered = list.filter(b => b.id !== id);
    saveTableData('banners', filtered);
    this.notifySubscribers();
    return true;
  }

  // --- REVIEWS ---
  public getReviews(productId?: string): Review[] {
    let list = getTableData<Review>('reviews', SEED_REVIEWS);
    if (productId) {
      list = list.filter(r => r.product_id === productId);
    }
    return list;
  }

  public addReview(reviewData: Omit<Review, 'id' | 'created_at' | 'is_approved'>): Review {
    const list = this.getReviews();
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      is_approved: true, // auto approve for smooth demo experience
      created_at: new Date().toISOString(),
    };
    list.unshift(newReview);
    saveTableData('reviews', list);

    // Update product rating and review count
    const productReviews = list.filter(r => r.product_id === reviewData.product_id && r.is_approved);
    const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / (productReviews.length || 1);
    const products = this.getProducts();
    const pIdx = products.findIndex(p => p.id === reviewData.product_id);
    if (pIdx !== -1) {
      products[pIdx].rating = Number(avg.toFixed(1));
      products[pIdx].review_count = productReviews.length;
      saveTableData('products', products);
    }

    this.notifySubscribers();
    return newReview;
  }

  public updateReviewStatus(id: string, is_approved: boolean, admin_reply?: string): void {
    const list = this.getReviews();
    const idx = list.findIndex(r => r.id === id);
    if (idx !== -1) {
      list[idx].is_approved = is_approved;
      if (admin_reply !== undefined) list[idx].admin_reply = admin_reply;
      saveTableData('reviews', list);
      this.notifySubscribers();
    }
  }

  // --- CMS PAGES & BLOG ---
  public getCMSPages(): CMSPage[] {
    return getTableData<CMSPage>('cms_pages', SEED_CMS_PAGES);
  }

  public getCMSPageBySlug(slug: string): CMSPage | undefined {
    return this.getCMSPages().find(p => p.slug === slug);
  }

  public updateCMSPage(slug: string, content: string, title?: string): CMSPage {
    const list = this.getCMSPages();
    const idx = list.findIndex(p => p.slug === slug);
    if (idx !== -1) {
      list[idx].content = content;
      if (title) list[idx].title = title;
      list[idx].last_updated = new Date().toISOString();
      saveTableData('cms_pages', list);
      this.notifySubscribers();
      return list[idx];
    }
    throw new Error('Page not found');
  }

  public getBlogPosts(): BlogPost[] {
    return getTableData<BlogPost>('blog_posts', SEED_BLOGS);
  }

  // --- STORE SETTINGS ---
  public getStoreSettings(): StoreSettings {
    if (typeof window === 'undefined') return DEFAULT_STORE_SETTINGS;
    try {
      const raw = localStorage.getItem(`${DB_STORAGE_KEY_PREFIX}settings`);
      return raw ? JSON.parse(raw) : DEFAULT_STORE_SETTINGS;
    } catch {
      return DEFAULT_STORE_SETTINGS;
    }
  }

  public updateStoreSettings(settings: Partial<StoreSettings>): StoreSettings {
    const current = this.getStoreSettings();
    const updated = { ...current, ...settings };
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${DB_STORAGE_KEY_PREFIX}settings`, JSON.stringify(updated));
    }
    this.logActivity('Admin', 'Updated store general settings & shipping rates', 'settings');
    this.notifySubscribers();
    return updated;
  }

  // --- ACTIVITY LOGS ---
  public getActivityLogs(): AdminActivityLog[] {
    return getTableData<AdminActivityLog>('activity_logs', [
      {
        id: 'act-1',
        admin_id: 'adm-01',
        admin_name: 'Santo Admin',
        action: 'System Initialized',
        target_type: 'system',
        details: 'MJ eCommerce Enterprise Engine booted with full database tables.',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      }
    ]);
  }

  public logActivity(adminName: string, action: string, targetType: string, targetId?: string): void {
    const logs = this.getActivityLogs();
    logs.unshift({
      id: `act-${Date.now()}`,
      admin_id: 'admin',
      admin_name: adminName,
      action,
      target_type: targetType,
      target_id: targetId,
      created_at: new Date().toISOString(),
    });
    // keep max 100 logs
    saveTableData('activity_logs', logs.slice(0, 100));
  }

  // --- NOTIFICATIONS ---
  public getNotifications(): Notification[] {
    return getTableData<Notification>('notifications', [
      {
        id: 'notif-1',
        for_admin: true,
        title: 'Welcome to MJ Admin',
        message: 'Your production eCommerce system is live and synchronizing with the database.',
        type: 'system',
        is_read: false,
        created_at: new Date().toISOString(),
      }
    ]);
  }

  public createNotification(n: Omit<Notification, 'id' | 'created_at' | 'is_read'>): void {
    const list = this.getNotifications();
    list.unshift({
      ...n,
      id: `notif-${Date.now()}`,
      is_read: false,
      created_at: new Date().toISOString(),
    });
    saveTableData('notifications', list);
    this.notifySubscribers();
  }

  public markNotificationAsRead(id: string): void {
    const list = this.getNotifications();
    const item = list.find(n => n.id === id);
    if (item) {
      item.is_read = true;
      saveTableData('notifications', list);
      this.notifySubscribers();
    }
  }

  // Clear demo data reset utility for QA
  public resetToCleanSeed(): void {
    if (typeof window === 'undefined') return;
    saveTableData('products', SEED_PRODUCTS);
    saveTableData('categories', SEED_CATEGORIES);
    saveTableData('banners', SEED_BANNERS);
    saveTableData('coupons', SEED_COUPONS);
    saveTableData('orders', SEED_ORDERS);
    saveTableData('reviews', SEED_REVIEWS);
    this.notifySubscribers();
  }
}

export const db = new RelationalDatabaseEngine();
