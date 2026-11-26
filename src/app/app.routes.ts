import { Routes } from '@angular/router';
import { AuthPageComponent } from './pages/auth-page.component';
import { CartComponent } from './pages/cart.component';
import { CatalogComponent } from './pages/catalog.component';
import { CheckoutComponent } from './pages/checkout.component';
import { ContactComponent } from './pages/contact.component';
import { HomeComponent } from './pages/home.component';
import { OrdersComponent } from './pages/orders.component';
import { ProductDetailsComponent } from './pages/product-details.component';
import { WishlistComponent } from './pages/wishlist.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'FreshCart — Fresh products delivered' },
  { path: 'products/:id', component: ProductDetailsComponent, title: 'Product details — FreshCart' },
  { path: 'products', component: CatalogComponent, data: { kind: 'products' }, title: 'All products — FreshCart' },
  { path: 'categories/:id', component: CatalogComponent, data: { kind: 'category' }, title: 'Category — FreshCart' },
  { path: 'categories', component: CatalogComponent, data: { kind: 'categories' }, title: 'Categories — FreshCart' },
  { path: 'subcategories/:id', component: CatalogComponent, data: { kind: 'subcategory' }, title: 'Subcategory — FreshCart' },
  { path: 'brands/:id', component: CatalogComponent, data: { kind: 'brand' }, title: 'Brand — FreshCart' },
  { path: 'brands', component: CatalogComponent, data: { kind: 'brands' }, title: 'Brands — FreshCart' },
  { path: 'cart', component: CartComponent, title: 'Shopping cart — FreshCart' },
  { path: 'checkout', component: CheckoutComponent, title: 'Checkout — FreshCart' },
  { path: 'contact', component: ContactComponent, title: 'Contact Us — FreshCart' },
  { path: 'wishlist', component: WishlistComponent, title: 'Wishlist — FreshCart' },
  { path: 'orders', component: OrdersComponent, title: 'Your orders — FreshCart' },
  { path: 'login', component: AuthPageComponent, data: { mode: 'login' }, title: 'Sign in — FreshCart' },
  { path: 'register', component: AuthPageComponent, data: { mode: 'register' }, title: 'Create account — FreshCart' },
  { path: 'forgot-password', component: AuthPageComponent, data: { mode: 'forgot' }, title: 'Forgot password — FreshCart' },
  { path: 'verify-reset-code', component: AuthPageComponent, data: { mode: 'verify' }, title: 'Verify reset code — FreshCart' },
  { path: 'reset-password', component: AuthPageComponent, data: { mode: 'reset' }, title: 'Reset password — FreshCart' },
  { path: 'change-password', component: AuthPageComponent, data: { mode: 'change' }, title: 'Change password — FreshCart' },
  { path: '**', redirectTo: '' },
];
