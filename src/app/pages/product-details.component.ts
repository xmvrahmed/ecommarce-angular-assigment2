import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product } from '../models';
import { StoreApiService } from '../services/store-api.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(StoreApiService);
  readonly product = signal<Product | null>(null);
  readonly selectedImage = signal('');
  readonly loading = signal(true);
  readonly error = signal('');
  readonly message = signal('');
  readonly count = signal(1);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) void this.load(id);
    });
  }

  async load(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const response = await this.store.getProduct(id);
      this.product.set(response.data);
      this.selectedImage.set(response.data.imageCover);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'This product could not be loaded.');
    } finally {
      this.loading.set(false);
    }
  }

  async addToCart(): Promise<void> {
    const product = this.product();
    if (!product) return;
    this.message.set('');
    try {
      for (let i = 0; i < this.count(); i += 1) await this.store.addToCart(product);
      this.message.set('Added to your cart.');
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Could not add this product.');
    }
  }

  async toggleWishlist(): Promise<void> {
    const product = this.product();
    if (!product) return;
    this.message.set('');
    try {
      await this.store.toggleWishlist(product);
      this.message.set('Your wishlist has been updated.');
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Could not update your wishlist.');
    }
  }

  isFavorite(product: Product): boolean {
    return this.store.wishlist().some((favorite) => favorite._id === product._id);
  }

  decreaseCount(): void {
    this.count.update((value) => Math.max(1, value - 1));
  }

  increaseCount(): void {
    this.count.update((value) => value + 1);
  }
}