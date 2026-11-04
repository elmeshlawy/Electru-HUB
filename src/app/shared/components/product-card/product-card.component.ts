import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyFormatPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);

  // Modern Signal Inputs
  readonly product = input.required<Product>();

  // Modern Signal Outputs
  readonly addedToCart = output<Product>();
  readonly toggledWishlist = output<Product>();

  // Computed state
  readonly isInWishlist = computed(() =>
    this.wishlistService.isInWishlist(this.product().id)
  );

  readonly isInCart = computed(() =>
    this.cartService.isInCart(this.product().id)
  );

  onAddToCart(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.cartService.addToCart(this.product(), 1);
    this.addedToCart.emit(this.product());
  }

  onToggleWishlist(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.wishlistService.toggleWishlist(this.product());
    this.toggledWishlist.emit(this.product());
  }
}
