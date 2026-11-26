import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StoreApiService } from '../services/store-api.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class OrdersComponent implements OnInit {
  readonly store = inject(StoreApiService);
  readonly loading = signal(false);
  readonly error = signal('');

  ngOnInit(): void {
    this.loading.set(true);
    void this.store.loadOrders()
      .catch((error: unknown) => this.error.set(error instanceof Error ? error.message : 'Could not load your orders.'))
      .finally(() => this.loading.set(false));
  }
}