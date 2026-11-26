import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse, Brand, CartData, CartLine, Category, Product, StoreOrder, Subcategory, User } from '../models';

const API = 'https://ecommerce.routemisr.com/api/v1';
const CART_KEY = 'freshcart-cart';
const WISHLIST_KEY = 'freshcart-wishlist';
const USER_KEY = 'freshcart-user';
const ORDERS_KEY = 'freshcart-orders';

@Injectable({ providedIn: 'root' })
export class StoreApiService {
  private readonly http = inject(HttpClient);
  readonly user = signal<User | null>(this.readStorage<User>(USER_KEY));
  readonly cart = signal<CartLine[]>(this.readStorage<CartLine[]>(CART_KEY) ?? []);
  readonly wishlist = signal<Product[]>(this.readStorage<Product[]>(WISHLIST_KEY) ?? []);
  readonly orders = signal<StoreOrder[]>(this.readStorage<StoreOrder[]>(ORDERS_KEY) ?? []);
  readonly cartCount = computed(() => this.cart().reduce((sum, line) => sum + line.count, 0));
  readonly cartTotal = computed(() => this.cart().reduce<number | null>((sum, line) => {
    const price = this.linePrice(line);
    return sum === null || price === null ? null : sum + line.count * price;
  }, 0));
  readonly cartHasInvalidPrice = computed(() => this.cart().some((line) => this.linePrice(line) === null));

  private readStorage<T>(key: string): T | null {
    try {
      const value = localStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      console.error(`Could not read ${key} from local storage`, error);
      return null;
    }
  }

  private save<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Could not save ${key} to local storage`, error);
      throw new Error('Your browser could not save this change. Check available storage and try again.');
    }
  }

  private options(): { headers: Record<string, string> } {
    const token = this.user()?.token;
    return token ? { headers: { token } } : { headers: {} };
  }

  private async get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value !== undefined && value !== '') httpParams = httpParams.set(key, String(value));
    }
    return firstValueFrom(this.http.get<T>(`${API}${path}`, { ...this.options(), params: httpParams }));
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    return firstValueFrom(this.http.post<T>(`${API}${path}`, body, this.options()));
  }

  private async put<T>(path: string, body: unknown): Promise<T> {
    return firstValueFrom(this.http.put<T>(`${API}${path}`, body, this.options()));
  }

  private async patch<T>(path: string, body: unknown): Promise<T> {
    return firstValueFrom(this.http.patch<T>(`${API}${path}`, body, this.options()));
  }

  private async delete<T>(path: string): Promise<T> {
    return firstValueFrom(this.http.delete<T>(`${API}${path}`, this.options()));
  }

  async getProducts(filters: Record<string, string | number | undefined> = {}): Promise<ApiResponse<Product[]>> {
    return this.get<ApiResponse<Product[]>>('/products', { limit: 40, ...filters });
  }

  linePrice(line: CartLine): number | null {
    for (const value of [line.price, line.product.priceAfterDiscount, line.product.price]) {
      if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
    }
    return null;
  }

  lineTotal(line: CartLine): number | null {
    const price = this.linePrice(line);
    return price === null ? null : price * line.count;
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.get<ApiResponse<Product>>(`/products/${encodeURIComponent(id)}`);
  }

  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.get<ApiResponse<Category[]>>('/categories');
  }

  async getCategory(id: string): Promise<ApiResponse<Category>> {
    return this.get<ApiResponse<Category>>(`/categories/${encodeURIComponent(id)}`);
  }

  async getSubcategories(categoryId: string): Promise<ApiResponse<Subcategory[]>> {
    return this.get<ApiResponse<Subcategory[]>>('/subcategories', { category: categoryId, limit: 40 });
  }

  async getSubcategory(id: string): Promise<ApiResponse<Subcategory>> {
    return this.get<ApiResponse<Subcategory>>(`/subcategories/${encodeURIComponent(id)}`);
  }

  async getBrands(): Promise<ApiResponse<Brand[]>> {
    return this.get<ApiResponse<Brand[]>>('/brands');
  }

  async getBrand(id: string): Promise<ApiResponse<Brand>> {
    return this.get<ApiResponse<Brand>>(`/brands/${encodeURIComponent(id)}`);
  }

  async signIn(email: string, password: string): Promise<void> {
    const response = await this.post<{ user: Omit<User, 'token'>; token: string }>('/auth/signin', { email, password });
    const user = { ...response.user, token: response.token } as User;
    this.user.set(user);
    this.save(USER_KEY, user);
  }

  async signUp(name: string, email: string, password: string, rePassword: string, phone?: string): Promise<void> {
    const response = await this.post<{ user: Omit<User, 'token'>; token: string }>('/auth/signup', {
      name, email, password, rePassword, phone,
    });
    const user = { ...response.user, token: response.token } as User;
    this.user.set(user);
    this.save(USER_KEY, user);
  }

  async forgotPassword(email: string): Promise<void> {
    await this.post('/auth/forgotPasswords', { email });
  }

  async verifyResetCode(resetCode: string): Promise<void> {
    await this.post('/auth/verifyResetCode', { resetCode });
  }

  async resetPassword(email: string, newPassword: string): Promise<void> {
    const response = await this.put<{ token: string; user: Omit<User, 'token'> }>('/auth/resetPassword', {
      email, newPassword,
    });
    const user = { ...response.user, token: response.token } as User;
    this.user.set(user);
    this.save(USER_KEY, user);
  }

  async changePassword(currentPassword: string, password: string, rePassword: string): Promise<void> {
    const response = await this.patch<{ token: string }>('/users/changeMyPassword', {
      currentPassword, password, rePassword,
    });
    const current = this.user();
    if (current) {
      const updated = { ...current, token: response.token };
      this.user.set(updated);
      this.save(USER_KEY, updated);
    }
  }

  signOut(): void {
    this.user.set(null);
    localStorage.removeItem(USER_KEY);
  }

  async loadCart(): Promise<CartLine[]> {
    if (!this.user()) return this.cart();
    const response = await this.get<ApiResponse<CartData>>('/cart');
    const lines = response.data.products?.map((line) => ({ product: line.product, count: line.count, price: line.price })) ?? [];
    this.cart.set(lines);
    this.save(CART_KEY, lines);
    return lines;
  }

  async addToCart(product: Product): Promise<void> {
    const previous = this.cart();
    const lines = previous.map((line) => ({ ...line }));
    const existing = lines.find((line) => line.product._id === product._id);
    if (existing) existing.count += 1;
    else lines.push({ product, count: 1, price: product.priceAfterDiscount ?? product.price });
    this.setCart(lines);
    if (this.user()) {
      try {
        const response = await this.post<ApiResponse<CartData>>('/cart', { productId: product._id });
        this.syncCart(response.data);
      } catch (error) {
        this.setCart(previous);
        throw error;
      }
    }
  }

  async updateCart(productId: string, count: number): Promise<void> {
    if (count < 1) return this.removeFromCart(productId);
    const previous = this.cart();
    this.setCart(previous.map((line) => line.product._id === productId ? { ...line, count } : line));
    if (this.user()) {
      try {
        const response = await this.put<ApiResponse<CartData>>(`/cart/${encodeURIComponent(productId)}`, { count });
        this.syncCart(response.data);
      } catch (error) {
        this.setCart(previous);
        throw error;
      }
    }
  }

  async removeFromCart(productId: string): Promise<void> {
    const previous = this.cart();
    this.setCart(previous.filter((line) => line.product._id !== productId));
    if (this.user()) {
      try {
        const response = await this.delete<ApiResponse<CartData>>(`/cart/${encodeURIComponent(productId)}`);
        this.syncCart(response.data);
      } catch (error) {
        this.setCart(previous);
        throw error;
      }
    }
  }

  async loadWishlist(): Promise<Product[]> {
    if (!this.user()) return this.wishlist();
    const response = await this.get<ApiResponse<Product[]>>('/wishlist');
    this.wishlist.set(response.data);
    this.save(WISHLIST_KEY, response.data);
    return response.data;
  }

  async toggleWishlist(product: Product): Promise<void> {
    const previous = this.wishlist();
    const exists = previous.some((item) => item._id === product._id);
    const items = exists
      ? previous.filter((item) => item._id !== product._id)
      : [...previous, product];
    this.wishlist.set(items);
    this.save(WISHLIST_KEY, items);
    if (this.user()) {
      try {
        const response = exists
          ? await this.delete<ApiResponse<Product[]>>(`/wishlist/${encodeURIComponent(product._id)}`)
          : await this.post<ApiResponse<Product[]>>('/wishlist', { productId: product._id });
        this.wishlist.set(response.data);
        this.save(WISHLIST_KEY, response.data);
      } catch (error) {
        this.wishlist.set(previous);
        this.save(WISHLIST_KEY, previous);
        throw error;
      }
    }
  }

  async removeFromWishlist(productId: string): Promise<void> {
    const product = this.wishlist().find((item) => item._id === productId);
    if (this.user()) {
      const response = await this.delete<ApiResponse<Product[]>>(`/wishlist/${encodeURIComponent(productId)}`);
      this.wishlist.set(response.data);
      this.save(WISHLIST_KEY, response.data);
      return;
    }
    if (product) await this.toggleWishlist(product);
  }

  async loadOrders(): Promise<StoreOrder[]> {
    if (!this.user()) return this.orders();
    const id = this.userIdFromToken();
    if (!id) throw new Error('Could not read your account ID. Sign in again to view your orders.');
    const response = await this.get<ApiResponse<StoreOrder[]>>(`/orders/user/${encodeURIComponent(id)}`);
    this.orders.set(response.data);
    return response.data;
  }

  async placeOrder(paymentMethod: 'cash' | 'online', shippingAddress: Record<string, string>): Promise<string | null> {
    const lines = this.cart();
    if (!lines.length) throw new Error('Your cart is empty.');
    const total = this.cartTotal();
    if (total === null) throw new Error('We could not verify the price of every item. Refresh your cart and try again.');
    if (!this.user()) {
      if (paymentMethod === 'online') throw new Error('Sign in before placing an online payment order.');
      const order: StoreOrder = {
        _id: `FC-${Date.now()}`, createdAt: new Date().toISOString(), paymentMethodType: 'cash',
        totalOrderPrice: total, cartItems: lines,
      };
      const orders = [order, ...this.orders()];
      this.orders.set(orders);
      this.save(ORDERS_KEY, orders);
      this.setCart([]);
      return null;
    }
    const cartResponse = await this.get<ApiResponse<CartData>>('/cart');
    const cartId = cartResponse.data._id;
    if (!cartId) throw new Error('The server did not return a cart ID. Please refresh your cart and try again.');
    if (paymentMethod === 'cash') {
      await this.post(`/orders/${encodeURIComponent(cartId)}`, { shippingAddress });
      this.setCart([]);
      return null;
    }
    const url = `${window.location.origin}/orders`;
    const response = await this.post<{ session: { url: string } }>(
      `/orders/checkout-session/${encodeURIComponent(cartId)}?url=${encodeURIComponent(url)}`,
      { shippingAddress },
    );
    if (!response.session?.url) throw new Error('The payment provider did not return a checkout link.');
    return response.session.url;
  }

  private syncCart(cart: CartData): void {
    this.setCart(cart.products?.map((line) => ({ product: line.product, count: line.count, price: line.price })) ?? []);
  }

  private setCart(lines: CartLine[]): void {
    this.cart.set(lines);
    this.save(CART_KEY, lines);
  }

  private userIdFromToken(): string | null {
    const token = this.user()?.token;
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as { id?: string; _id?: string };
      return payload.id ?? payload._id ?? null;
    } catch (error) {
      console.error('Could not decode the account ID from the session token', error);
      return null;
    }
  }
}