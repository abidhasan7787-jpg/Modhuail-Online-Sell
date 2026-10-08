export type UserRole = 'super_admin' | 'admin' | 'manager' | 'editor' | 'order_manager' | 'customer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  default_address?: Address;
}

export interface Address {
  id: string;
  user_id?: string;
  full_name: string;
  phone: string;
  email?: string;
  division: string;
  district: string;
  upazila: string;
  street_address: string;
  postal_code?: string;
  is_default?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url: string;
  parent_id?: string | null;
  display_order: number;
  is_published: boolean;
  featured?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  is_published: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string; // e.g. "XS", "S", "M", "L", "XL", "XXL"
  color: string; // e.g. "Pink", "Sky Blue", "Black", "White"
  color_code?: string; // hex
  sku: string;
  price: number;
  sale_price?: number | null;
  stock: number;
  image_url?: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category_id: string;
  category_name?: string;
  subcategory_id?: string;
  brand_id?: string;
  brand_name?: string;
  short_description: string;
  full_description: string;
  regular_price: number;
  sale_price?: number | null;
  discount_percentage?: number;
  cost_price?: number;
  stock: number; // total aggregate stock
  low_stock_threshold: number;
  images: string[];
  primary_image: string;
  video_url?: string;
  gender?: 'Women' | 'Men' | 'Unisex' | 'Kids';
  fabric?: string;
  material?: string;
  weight?: string;
  tags: string[];
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_trending: boolean;
  is_on_sale: boolean;
  is_published: boolean;
  rating: number;
  review_count: number;
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string; // unique item id (product_id + variant_id)
  product_id: string;
  variant_id?: string;
  name: string;
  sku: string;
  image: string;
  size?: string;
  color?: string;
  price: number;
  regular_price: number;
  quantity: number;
  stock_available: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  variant_id?: string;
  sku: string;
  size?: string;
  color?: string;
  price: number;
  regular_price: number;
  quantity: number;
  subtotal: number;
  image: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  comment?: string;
  created_at: string;
  created_by?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: Address;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  coupon_code?: string;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_transaction_id?: string;
  order_status: OrderStatus;
  status_history: OrderStatusHistory[];
  order_notes?: string;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  start_date: string;
  end_date: string;
  usage_limit: number;
  used_count: number;
  per_user_limit: number;
  is_active: boolean;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  button_text?: string;
  button_url?: string;
  image_url: string;
  mobile_image_url?: string;
  type: 'hero' | 'promo' | 'category' | 'popup';
  display_order: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface HomepageSection {
  id: string;
  section_key: string;
  title: string;
  subtitle?: string;
  display_order: number;
  is_visible: boolean;
  settings?: Record<string, any>;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  review_text: string;
  images?: string[];
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  admin_reply?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: string;
  tags: string[];
  author: string;
  is_published: boolean;
  published_at: string;
  created_at: string;
}

export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  last_updated: string;
}

export interface StoreSettings {
  store_name: string;
  tagline: string;
  logo_url: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  currency_symbol: string;
  tax_rate: number;
  inside_dhaka_shipping: number;
  outside_dhaka_shipping: number;
  free_shipping_threshold: number;
  demo_payment_enabled: boolean;
  maintenance_mode: boolean;
}

export interface AdminActivityLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_type: string;
  target_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id?: string;
  for_admin: boolean;
  title: string;
  message: string;
  type: 'order' | 'stock' | 'review' | 'promo' | 'system';
  is_read: boolean;
  link?: string;
  created_at: string;
}
