export interface SessionUser {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  role: 'admin' | 'customer';
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  selectedSize?: string;
  stock?: number;
  [key: string]: unknown;
}

export interface ProductVariantImage {
  id: string;
  variant_id: string;
  image_url: string;
  sort_order?: number;
  created_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  color: string;
  size: string;
  stock: number;
  price: number;
  discount?: number;
  sku?: string | null;
  created_at?: string;
  product_variant_images?: ProductVariantImage[];
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  specifications?: string;
  wash_care?: string;
  category_id?: string | null;
  category_ids?: string[];
  created_at?: string;
  product_variants?: ProductVariant[];
  // Legacy / convenience fields (can be computed at runtime):
  price?: number;
  discount?: number;
  image?: string;
  images?: string;
  sizes?: string;
  colors?: string;
  stock?: number;
  size_chart?: string;
}

export interface Category {
  id: string;
  name: string;
  parent_id?: string | null;
  sort_order?: number;
  created_at?: string;
}

export interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  items: CartItem[];
  total_price: number;
  status: string;
  created_at: string;
}

export interface Banner {
  id: string;
  image_url: string;
  redirect_url: string;
  created_at?: string;
}

export interface ShippingDetails {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
}
