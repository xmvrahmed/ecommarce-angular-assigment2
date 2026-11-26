import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../models';
import { StoreApiService } from '../services/store-api.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent implements OnInit {
  readonly store = inject(StoreApiService);
  readonly error = signal('');

  ngOnInit(): void {
    if (this.store.user()) void this.store.loadWishlist().catch((error: unknown) => this.error.set(this.messageFor(error)));
  }

  async remove(product: Product): Promise<void> {
    this.error.set('');
    try { await this.store.removeFromWishlist(product._id); }
    catch (error) { this.error.set(this.messageFor(error)); }
  }

  async addToCart(product: Product): Promise<void> {
    this.error.set('');
    try { await this.store.addToCart(product); }
    catch (error) { this.error.set(this.messageFor(error)); }
  }

  private messageFor(error: unknown): string {
    return error instanceof Error ? error.message : 'We could not update your wishlist.';
  }
}