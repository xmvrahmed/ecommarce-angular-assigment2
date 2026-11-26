import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreApiService } from '../services/store-api.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css', './cart-reference-overrides.css'],
})
export class CartComponent implements OnInit {
  readonly store = inject(StoreApiService);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly promoOpen = signal(false);

  ngOnInit(): void {
    if (this.store.user()) {
      this.loading.set(true);
      void this.store.loadCart().catch((error: unknown) => this.error.set(this.messageFor(error)))
        .finally(() => this.loading.set(false));
    }
  }

  async update(productId: string, count: number): Promise<void> {
    this.error.set('');
    try { await this.store.updateCart(productId, count); }
    catch (error) { this.error.set(this.messageFor(error)); }
  }

  async remove(productId: string): Promise<void> {
    this.error.set('');
    try { await this.store.removeFromCart(productId); }
    catch (error) { this.error.set(this.messageFor(error)); }
  }

  private messageFor(error: unknown): string {
    if (error instanceof Error) return error.message;
    return 'We could not complete your request. Please try again.';
  }
}