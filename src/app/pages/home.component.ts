import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Category, Product } from '../models';
import { StoreApiService } from '../services/store-api.service';
import { ProductCardComponent } from '../components/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterLink, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrls: [
    './home.component.css',
    './home-reference-overrides.css',
    './home-reference-deals.css',
    './home-reference-newsletter.css',
    './home-reference-app.css',
  ],
})
export class HomeComponent implements OnInit {
  readonly store = inject(StoreApiService);
  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly error = signal('');
  readonly slides = [
    { title: 'Fresh Products Delivered\nto your Door', text: 'Get 20% off your first order', primary: 'Shop Now', secondary: 'View Deals' },
    { title: 'Premium Quality Guaranteed', text: 'Fresh from farm to your table', primary: 'Shop Now', secondary: 'Learn More' },
    { title: 'Fast & Free Delivery', text: 'Same day delivery available', primary: 'Order Now', secondary: 'Delivery Info' },
  ];
  readonly slideIndex = signal(0);
  readonly subscribed = signal(false);
  newsletterEmail = '';

  get marketplaceCategoryId(): string {
    return this.categories().find((category) => category.name === 'SuperMarket')?._id ?? '';
  }

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    try {
      const [products, categories] = await Promise.all([
        this.store.getProducts({ limit: 40 }),
        this.store.getCategories(),
      ]);
      this.products.set(products.data);
      this.categories.set(categories.data);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'We could not load the latest store items.');
    }
  }

  moveSlide(direction: number): void {
    this.slideIndex.update((index) => (index + direction + this.slides.length) % this.slides.length);
  }

  subscribe(): void {
    if (!this.newsletterEmail.trim()) return;
    this.subscribed.set(true);
    this.newsletterEmail = '';
  }
}