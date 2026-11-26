import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  readonly submitted = signal(false);
  name = '';
  email = '';
  subject = '';
  message = '';

  sendMessage(): void {
    const subject = encodeURIComponent(this.subject || 'FreshCart customer support');
    const body = encodeURIComponent(`From: ${this.name}\nEmail: ${this.email}\n\n${this.message}`);
    window.location.href = `mailto:support@freshcart.com?subject=${subject}&body=${body}`;
    this.submitted.set(true);
  }
}
