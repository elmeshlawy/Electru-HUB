import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  readonly orderService = inject(OrderService);
  readonly wishlistService = inject(WishlistService);
  private readonly router = inject(Router);

  readonly user = this.authService.currentUser;
  readonly orders = this.orderService.orders;

  isEditing = signal<boolean>(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  profileForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
  });

  startEditing(): void {
    const current = this.user();
    if (!current) return;

    this.profileForm.patchValue({
      firstName: current.firstName,
      lastName: current.lastName,
      email: current.email,
      phone: current.phone || '',
    });
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
    this.errorMessage.set(null);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const { firstName, lastName, email, phone } = this.profileForm.value;
    const result = this.authService.updateProfile({
      firstName,
      lastName,
      email,
      phone,
    });

    if (result.success) {
      this.isEditing.set(false);
      this.successMessage.set('Profile information updated successfully.');
      setTimeout(() => this.successMessage.set(null), 3500);
    } else {
      this.errorMessage.set(result.message || 'Could not update profile.');
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
