import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, EmptyStateComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent {
  readonly wishlistService = inject(WishlistService);
  readonly cartService = inject(CartService);

  readonly items = this.wishlistService.items;
  readonly count = this.wishlistService.count;
  readonly isEmpty = this.wishlistService.isEmpty;

  addAllToCart(): void {
    const products = this.items();
    products.forEach((p) => this.cartService.addToCart(p, 1));
  }

  clearWishlist(): void {
    this.wishlistService.clearWishlist();
  }
}
