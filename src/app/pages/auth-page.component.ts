import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StoreApiService } from '../services/store-api.service';

type AuthMode = 'login' | 'register' | 'forgot' | 'verify' | 'reset' | 'change';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.css', './auth-social.css'],
})
export class AuthPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(StoreApiService);
  readonly mode = signal<AuthMode>('login');
  readonly busy = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly providerNotice = signal('');
  name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  resetCode = '';
  currentPassword = '';

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.mode.set((data['mode'] as AuthMode | undefined) ?? 'login');
      if (this.mode() === 'change' && !this.store.user()) {
        void this.router.navigate(['/login'], { queryParams: { next: '/change-password' } });
      }
    });
    this.email = sessionStorage.getItem('freshcart-reset-email') ?? '';
  }

  title(): string {
    return ({ login: 'Welcome back', register: 'Create your account', forgot: 'Forgot your password?',
      verify: 'Check your email', reset: 'Set a new password', change: 'Change password' })[this.mode()];
  }

  subtitle(): string {
    return ({ login: 'Sign in to continue shopping with FreshCart.', register: 'Join FreshCart for a fresher way to shop.',
      forgot: 'Enter the email address linked to your account.', verify: 'Enter the reset code sent to your email.',
      reset: 'Choose a new password for your account.', change: 'Choose a strong password you have not used before.' })[this.mode()];
  }

  showProviderNotice(provider: string): void {
    this.providerNotice.set(`${provider} sign-in isn't configured for this store. Please continue with email.`);
  }

  async submit(): Promise<void> {
    this.error.set('');
    this.success.set('');
    this.providerNotice.set('');
    this.busy.set(true);
    try {
      switch (this.mode()) {
        case 'login':
          await this.store.signIn(this.email, this.password);
          await this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('next') || '/');
          break;
        case 'register':
          await this.store.signUp(this.name, this.email, this.password, this.confirmPassword, this.phone);
          await this.router.navigate(['/']);
          break;
        case 'forgot':
          await this.store.forgotPassword(this.email);
          sessionStorage.setItem('freshcart-reset-email', this.email);
          this.success.set('A reset code has been sent if this email is registered.');
          await this.router.navigate(['/verify-reset-code']);
          break;
        case 'verify':
          await this.store.verifyResetCode(this.resetCode);
          await this.router.navigate(['/reset-password']);
          break;
        case 'reset':
          await this.store.resetPassword(this.email, this.password);
          sessionStorage.removeItem('freshcart-reset-email');
          await this.router.navigate(['/']);
          break;
        case 'change':
          await this.store.changePassword(this.currentPassword, this.password, this.confirmPassword);
          this.success.set('Your password has been updated.');
          this.currentPassword = '';
          this.password = '';
          this.confirmPassword = '';
          break;
      }
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'We could not complete that request. Please try again.');
    } finally {
      this.busy.set(false);
    }
  }
}