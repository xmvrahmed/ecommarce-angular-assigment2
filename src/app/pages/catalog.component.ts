import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { combineLatest } from 'rxjs';
import { Brand, Category, Product, Subcategory } from '../models';
import { StoreApiService } from '../services/store-api.service';
import { ProductCardComponent } from '../components/product-card.component';

type CatalogKind = 'products' | 'categories' | 'category' | 'subcategory' | 'brands' | 'brand';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
})
export class CatalogComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(StoreApiService);
  readonly kind = signal<CatalogKind>('products');
  readonly title = signal('All Products');
  readonly subtitle = signal('Explore our complete product collection');
  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly subcategories = signal<Subcategory[]>([]);
  readonly brands = signal<Brand[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly sort = signal('popular');
  private routeId = '';
  private queryCategory = '';
  keyword = '';

  ngOnInit(): void {
    combineLatest([this.route.data, this.route.paramMap, this.route.queryParamMap]).subscribe(([data, params, query]) => {
      this.kind.set((data['kind'] as CatalogKind | undefined) ?? 'products');
      this.routeId = params.get('id') ?? '';
      this.keyword = query.get('keyword') ?? '';
      this.queryCategory = query.get('category') ?? '';
      const querySort = query.get('sort');
      this.sort.set(querySort === '-price' ? 'price-high' : querySort ?? 'popular');
      void this.load();
    });
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    const kind = this.kind();
    try {
      if (kind === 'categories') {
        this.title.set('Shop By Category');
        this.subtitle.set('Find the right picks for every part of your day.');
        this.categories.set((await this.store.getCategories()).data);
      } else if (kind === 'brands') {
        this.title.set('Our Brands');
        this.subtitle.set('Discover trusted names and new favourites.');
        this.brands.set((await this.store.getBrands()).data);
      } else if (kind === 'category') {
        const [category, subcategories, products] = await Promise.all([
          this.store.getCategory(this.routeId),
          this.store.getSubcategories(this.routeId),
          this.store.getProducts({ category: this.routeId, limit: 40 }),
        ]);
        this.title.set(category.data.name);
        this.subtitle.set(`Explore products in ${category.data.name}.`);
        this.subcategories.set(subcategories.data);
        this.products.set(products.data);
      } else if (kind === 'subcategory') {
        const subcategory = await this.store.getSubcategory(this.routeId);
        const products = await this.store.getProducts({ subcategory: this.routeId, limit: 40 });
        this.title.set(subcategory.data.name);
        this.subtitle.set(`Explore products in ${subcategory.data.name}.`);
        this.products.set(products.data);
      } else if (kind === 'brand') {
        const [brand, products] = await Promise.all([
          this.store.getBrand(this.routeId),
          this.store.getProducts({ brand: this.routeId, limit: 40 }),
        ]);
        this.title.set(brand.data.name);
        this.subtitle.set(`Shop the latest from ${brand.data.name}.`);
        this.products.set(products.data);
      } else {
        this.title.set(this.queryCategory ? 'Filtered Products' : 'All Products');
        this.subtitle.set(this.queryCategory ? 'Explore products in this collection.' : 'Explore our complete product collection');
        const filters: Record<string, string | number | undefined> = { limit: 40 };
        if (this.keyword) filters['keyword'] = this.keyword;
        if (this.queryCategory) filters['category'] = this.queryCategory;
        if (this.sort() === 'price-low') filters['sort'] = 'price';
        if (this.sort() === 'price-high') filters['sort'] = '-price';
        if (this.sort() === 'top-rated') filters['sort'] = '-ratingsAverage';
        this.products.set((await this.store.getProducts(filters)).data);
      }
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'The store could not load this collection.');
    } finally {
      this.loading.set(false);
    }
  }

  changeSort(event: Event): void {
    this.sort.set((event.target as HTMLSelectElement).value);
    void this.load();
  }
}