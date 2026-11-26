export interface Category {
  _id: string;
  name: string;
  slug?: string;
  image?: string;
}

export interface Subcategory {
  _id: string;
  name: string;
  slug?: string;
  category: string | Category;
}

export interface Brand {
  _id: string;
  name: string;
  slug?: string;
  image?: string;
}

export interface Product {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  price: number;
  priceAfterDiscount?: number;
  quantity?: number;
  sold?: number;
  imageCover: string;
  images?: string[];
  category?: Category;
  brand?: Brand;
  ratingsAverage?: number;
  ratingsQuantity?: number;
}

export interface ApiResponse<T> {
  data: T;
  results?: number;
  metadata?: { currentPage?: number; numberOfPages?: number; limit?: number };
}

export interface CartLine {
  product: Product;
  count: number;
  price?: number;
}

export interface CartData {
  _id?: string;
  products?: Array<{ product: Product; count: number; price?: number }>;
  totalCartPrice?: number;
  totalPrice?: number;
}

export interface StoreOrder {
  _id: string;
  createdAt: string;
  isDelivered?: boolean;
  isPaid?: boolean;
  paymentMethodType?: string;
  totalOrderPrice?: number;
  cartItems?: CartLine[];
}

export interface User {
  _id?: string;
  name?: string;
  email: string;
  token: string;
}
