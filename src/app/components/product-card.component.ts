import { Component, Input, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../models';
import { StoreApiService } from '../services/store-api.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="product-card">
      <a class="product-image" [routerLink]="['/products', product._id]">
        <img [src]="product.imageCover" [alt]="product.title" [attr.loading]="imageLoading">
        @if (product.priceAfterDiscount && product.priceAfterDiscount < product.price) {
          <span class="discount-badge">SALE</span>
        }
      </a>
      <div class="product-actions">
        <button type="button" class="product-action favorite-button" [class.selected]="isFavorite()" [disabled]="pending()" (click)="toggleFavorite($event)" [attr.aria-label]="isFavorite() ? 'Remove from wishlist' : 'Add to wishlist'" [attr.aria-pressed]="isFavorite()" title="Add to wishlist">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>
        </button>
        <button type="button" class="product-action compare-button" [class.selected]="compared()" (click)="toggleCompare($event)" [attr.aria-label]="compared() ? 'Remove from comparison' : 'Compare product'" title="Compare product">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 9a7 7 0 0 1 11.6-2L20 9M4 15l2.9 2a7 7 0 0 0 11.6-2"/></svg>
        </button>
        <button type="button" class="product-action quick-view-button" (click)="openQuickView($event)" aria-label="Quick view" title="Quick view">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
      <div class="product-info">
        <a class="product-category" [routerLink]="['/categories', product.category?._id]">{{ product.category?.name || 'FreshCart picks' }}</a>
        <a class="product-title" [routerLink]="['/products', product._id]">{{ product.title }}</a>
        <div class="rating"><span>★★★★★</span><small>{{ product.ratingsAverage || 4.5 }} ({{ product.ratingsQuantity || 0 }})</small></div>
        <div class="product-bottom">
          <div class="product-price">
            @if (product.priceAfterDiscount && product.priceAfterDiscount < product.price) {
              <strong>{{ product.priceAfterDiscount }} EGP</strong><del>{{ product.price }} EGP</del>
            } @else { <strong>{{ product.price }} EGP</strong> }
          </div>
          <button type="button" class="add-button" [disabled]="pending()" (click)="addToCart($event)" aria-label="Add to cart">+</button>
        </div>
        @if (message()) { <small class="card-message" [class.success]="feedback() === 'success'" role="status">{{ message() }}</small> }
      </div>
    </article>
    @if (quickView()) {
      <div class="quick-view-backdrop" (click)="closeQuickView()">
        <section class="quick-view-dialog" role="dialog" aria-modal="true" [attr.aria-label]="'Quick view: ' + product.title" (click)="$event.stopPropagation()" (keydown.escape)="closeQuickView()">
          <button type="button" class="quick-view-close" (click)="closeQuickView()" aria-label="Close quick view">×</button>
          <img class="quick-view-image" [src]="product.imageCover" [alt]="product.title">
          <div class="quick-view-copy"><a class="product-category" [routerLink]="['/categories', product.category?._id]" (click)="closeQuickView()">{{ product.category?.name || 'FreshCart picks' }}</a><h2>{{ product.title }}</h2><div class="quick-view-rating">★★★★★ <small>{{ product.ratingsAverage || 4.5 }} ({{ product.ratingsQuantity || 0 }})</small></div><strong class="quick-view-price">{{ product.priceAfterDiscount || product.price }} EGP</strong><p>{{ product.description || 'A quality pick, selected for you.' }}</p><div class="quick-view-buttons"><button type="button" class="button button-green" (click)="addToCart($event)">Add to Cart</button><button type="button" class="quick-view-details" [routerLink]="['/products', product._id]" (click)="closeQuickView()">View Details</button></div>@if (message()) { <small class="card-message" [class.success]="feedback() === 'success'" role="status">{{ message() }}</small> }</div>
        </section>
      </div>
    }
  `,
  styles: [`
    :host{display:block;min-width:0}.product-card{position:relative;background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;transition:box-shadow .2s,transform .2s;height:100%}.product-card:hover{box-shadow:0 12px 30px #1f2c3712;transform:translateY(-3px)}.product-image{height:238px;display:grid;place-items:center;background:#fff;padding:14px;text-decoration:none}.product-image img{width:100%;height:100%;object-fit:contain}.product-actions{position:absolute;top:12px;right:12px;z-index:2;display:flex;flex-direction:column;gap:8px}.product-action{border:0;background:#fff;border-radius:50%;width:34px;height:34px;box-shadow:0 2px 8px #00000012;color:#58616b;display:grid;place-items:center;cursor:pointer;transition:color .15s,transform .15s}.product-action:hover{transform:scale(1.05);color:#16a34a}.product-action svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.favorite-button.selected{color:#ef476f}.product-action:disabled,.add-button:disabled{opacity:.65;cursor:wait}.discount-badge{position:absolute;top:12px;left:12px;background:#ef4355;color:#fff;border-radius:4px;padding:4px 7px;font-size:10px;font-weight:700}.product-info{padding:10px 15px 15px}.product-category{display:block;color:#727d89;text-decoration:none;font-size:12px;margin-bottom:4px}.product-title{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:#293541;text-decoration:none;font-size:14px;font-weight:600;line-height:1.35;min-height:38px}.rating{display:flex;align-items:center;gap:7px;margin:6px 0}.rating span{color:#f3be13;letter-spacing:-2px;font-size:16px}.rating small{font-size:11px;color:#77818c}.product-bottom{display:flex;justify-content:space-between;align-items:center;margin-top:8px}.product-price{display:flex;flex-direction:column;gap:2px}.product-price strong{font:700 18px 'Exo',sans-serif;color:#27323d}.product-price del{font-size:11px;color:#9aa2aa}.add-button{width:40px;height:40px;border:0;border-radius:50%;background:#16a34a;color:#fff;font-size:27px;font-weight:400;line-height:1;cursor:pointer}.add-button:hover{background:#15803d}.card-message{display:block;color:#a42c2c;font-size:11px;margin-top:6px}.card-message.success{color:#128143;font-weight:600}.quick-view-backdrop{position:fixed;inset:0;z-index:1000;background:#11182799;display:grid;place-items:center;padding:20px}.quick-view-dialog{position:relative;width:min(760px,100%);background:#fff;border-radius:14px;padding:28px;display:grid;grid-template-columns:1fr 1fr;gap:28px;box-shadow:0 20px 70px #0003}.quick-view-close{position:absolute;right:12px;top:8px;border:0;background:transparent;color:#6b7280;font-size:28px;cursor:pointer}.quick-view-image{width:100%;height:320px;object-fit:contain}.quick-view-copy{align-self:center}.quick-view-copy h2{font:700 23px 'Exo',sans-serif;margin:8px 0 10px}.quick-view-rating{color:#f3be13;font-size:16px}.quick-view-rating small{color:#77818c;font-size:11px}.quick-view-price{display:block;margin:16px 0;font:700 22px 'Exo',sans-serif}.quick-view-copy>p{font-size:13px;color:#74808b;line-height:1.6}.quick-view-buttons{display:flex;gap:9px}.quick-view-buttons .button{border-radius:7px;padding:10px 16px}.quick-view-details{border:1px solid #dfe4e7;background:#fff;border-radius:7px;padding:0 13px;color:#4b5563;text-decoration:none;font-size:12px}.quick-view-dialog .card-message{margin-top:11px}@media(max-width:600px){.product-image{height:180px;padding:10px}.product-info{padding:8px 10px 12px}.product-title{font-size:12px}.product-price strong{font-size:15px}.add-button{width:34px;height:34px}.product-action{width:30px;height:30px}.quick-view-dialog{grid-template-columns:1fr;gap:12px;padding:20px}.quick-view-image{height:200px}.quick-view-copy h2{font-size:19px}}
  `],
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() imageLoading: 'eager' | 'lazy' = 'lazy';
  readonly store = inject(StoreApiService);
  readonly message = signal('');
  readonly feedback = signal<'success' | 'error' | ''>('');
  readonly pending = signal(false);
  readonly compared = signal(false);
  readonly quickView = signal(false);

  isFavorite(): boolean {
    return this.store.wishlist().some((item) => item._id === this.product._id);
  }

  async toggleFavorite(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.message.set('');
    this.pending.set(true);
    try {
      const wasFavorite = this.isFavorite();
      await this.store.toggleWishlist(this.product);
      this.feedback.set('success');
      this.message.set(wasFavorite ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (error) {
      this.feedback.set('error');
      this.message.set(error instanceof Error ? error.message : 'Could not update your wishlist.');
    } finally {
      this.pending.set(false);
    }
  }

  async addToCart(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.message.set('');
    this.pending.set(true);
    try {
      await this.store.addToCart(this.product);
      this.feedback.set('success');
      this.message.set('Added to cart');
    } catch (error) {
      this.feedback.set('error');
      this.message.set(error instanceof Error ? error.message : 'Could not add this product.');
    } finally {
      this.pending.set(false);
    }
  }

  toggleCompare(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.compared.update((value) => !value);
    this.feedback.set('success');
    this.message.set(this.compared() ? 'Added to comparison' : 'Removed from comparison');
  }

  openQuickView(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.message.set('');
    this.quickView.set(true);
  }

  closeQuickView(): void {
    this.quickView.set(false);
  }
}