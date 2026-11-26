import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StoreApiService } from '../services/store-api.service';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.css',
})
export class SiteHeaderComponent {
  readonly store = inject(StoreApiService);
  private readonly router = inject(Router);
  readonly accountSyncError = signal('');
  private readonly syncAccount = effect(() => {
    if (this.store.user()) {
      void Promise.all([this.store.loadCart(), this.store.loadWishlist()]).catch((error: unknown) => {
        this.accountSyncError.set(error instanceof Error ? error.message : 'Could not sync your account data.');
      });
    } else {
      this.accountSyncError.set('');
    }
  });
  searchTerm = '';

  search(): void {
    const query = this.searchTerm.trim();
    void this.router.navigate(['/products'], { queryParams: query ? { keyword: query } : {} });
  }

  signOut(): void {
    this.store.signOut();
    void this.router.navigate(['/']);
  }
}