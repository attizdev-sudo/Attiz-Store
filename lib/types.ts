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

export interface Product {
  id: string;
  title: string;
  price: number;
  discount?: number;
  category_id?: string | null;
  image: string;
  images: string;
  sizes: string;
  colors: string;
  size_chart?: string;
  stock: number;
  description?: string;
  specifications?: string;
  wash_care?: string;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  parent_id?: string | null;
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
  title: string;
  discount: string;
  tagline: string;
  bgSplitLeft: string;
  bgSplitRight: string;
  image: string;
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
