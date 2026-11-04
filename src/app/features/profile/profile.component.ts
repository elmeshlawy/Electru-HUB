import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  readonly authService = inject(AuthService);
  readonly orderService = inject(OrderService);
  readonly wishlistService = inject(WishlistService);
  private readonly router = inject(Router);

  readonly user = this.authService.currentUser;
  readonly orders = this.orderService.orders;

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
