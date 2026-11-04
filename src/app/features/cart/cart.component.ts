import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { Product } from '../../core/models/product.model';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { handleImageFallback } from '../../shared/constants/image.constants';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyFormatPipe, EmptyStateComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);

  readonly items = this.cartService.cartItems;
  readonly totalItems = this.cartService.totalItems;
  readonly subtotal = this.cartService.subtotal;
  readonly shipping = this.cartService.shipping;
  readonly tax = this.cartService.tax;
  readonly totalPrice = this.cartService.totalPrice;
  readonly summary = this.cartService.summary;
  readonly isEmpty = this.cartService.isEmpty;

  // Flash notification message
  feedbackMessage = signal<{ text: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Free shipping progress calculation ($150 target)
  readonly freeShippingThreshold = 150;

  readonly freeShippingRemaining = computed(() => {
    const sub = this.subtotal();
    return Math.max(0, this.freeShippingThreshold - sub);
  });

  readonly freeShippingPercentage = computed(() => {
    const sub = this.subtotal();
    return Math.min(100, Math.round((sub / this.freeShippingThreshold) * 100));
  });

  // Increment item quantity
  increment(itemId: string): void {
    const success = this.cartService.increaseQuantity(itemId);
    if (!success) {
      this.showFeedback('Maximum available stock reached for this item.', 'warning');
    }
  }

  // Decrement item quantity
  decrement(itemId: string): void {
    this.cartService.decreaseQuantity(itemId, false);
  }

  // Handle direct manual numeric input
  onQuantityInputChange(itemId: string, event: Event, maxStock: number): void {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);

    if (isNaN(value) || value <= 0) {
      input.value = '1';
      this.cartService.updateQuantity(itemId, 1);
      this.showFeedback('Quantity must be at least 1.', 'warning');
      return;
    }

    if (value > maxStock) {
      input.value = maxStock.toString();
      this.cartService.updateQuantity(itemId, maxStock);
      this.showFeedback(`Only ${maxStock} units currently available in stock.`, 'warning');
      return;
    }

    this.cartService.updateQuantity(itemId, value);
  }

  // Remove a single item
  removeItem(itemId: string): void {
    this.cartService.removeFromCart(itemId);
    this.showFeedback('Item removed from cart.', 'info');
  }

  // Move an item from cart to wishlist
  moveToWishlist(product: Product, itemId: string): void {
    this.wishlistService.addToWishlist(product);
    this.cartService.removeFromCart(itemId);
    this.showFeedback(`"${product.name}" moved to your Wishlist.`, 'success');
  }

  // Clear all items in cart
  clearCart(): void {
    this.cartService.clearCart();
    this.showFeedback('All items cleared from your shopping cart.', 'info');
  }

  onImageError(event: Event): void {
    handleImageFallback(event);
  }

  private showFeedback(text: string, type: 'success' | 'warning' | 'info'): void {
    this.feedbackMessage.set({ text, type });
    setTimeout(() => {
      this.feedbackMessage.set(null);
    }, 3500);
  }
}
