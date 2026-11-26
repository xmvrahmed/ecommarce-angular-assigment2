import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StoreApiService } from '../services/store-api.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  readonly store = inject(StoreApiService);
  private readonly router = inject(Router);
  readonly busy = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');
  paymentMethod: 'cash' | 'online' = 'cash';
  name = '';
  phone = '';
  city = '';
  details = '';

  ngOnInit(): void {
    if (!this.store.cart().length) {
      void this.router.navigate(['/cart']);
      return;
    }
    if (this.store.user()) {
      this.loading.set(true);
      void this.store.loadCart()
        .catch((error: unknown) => this.error.set(this.messageFor(error)))
        .finally(() => this.loading.set(false));
    }
  }

  async checkout(): Promise<void> {
    this.error.set('');
    this.busy.set(true);
    try {
      const redirectUrl = await this.store.placeOrder(this.paymentMethod, {
        details: this.details,
        phone: this.phone,
        city: this.city,
      });
      if (redirectUrl) {
        window.location.assign(redirectUrl);
        return;
      }
      await this.router.navigate(['/orders']);
    } catch (error) {
      this.error.set(this.messageFor(error));
    } finally {
      this.busy.set(false);
    }
  }

  private messageFor(error: unknown): string {
    return error instanceof Error ? error.message : 'We could not complete your request. Please try again.';
  }
}
