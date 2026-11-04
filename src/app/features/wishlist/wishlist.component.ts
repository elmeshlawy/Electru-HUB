import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyFormatPipe, EmptyStateComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent {
  readonly wishlistService = inject(WishlistService);
  readonly cartService = inject(CartService);

  readonly items = this.wishlistService.wishlistItems;
  readonly count = this.wishlistService.wishlistCount;
  readonly isEmpty = this.wishlistService.isEmpty;

  // Flash notification state
  feedbackMessage = signal<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Set of recently added product IDs for visual feedback
  recentlyAdded = signal<Set<string>>(new Set());

  // Add a single product to cart
  addToCart(product: Product): void {
    if (!product || product.stock <= 0 || product.inStock === false) {
      this.showFeedback(`"${product.name}" is currently out of stock.`, 'warning');
      return;
    }

    const success = this.cartService.addToCart(product, 1);
    if (success) {
      this.recentlyAdded.update((set) => {
        const next = new Set(set);
        next.add(product.id);
        return next;
      });
      setTimeout(() => {
        this.recentlyAdded.update((set) => {
          const next = new Set(set);
          next.delete(product.id);
          return next;
        });
      }, 2000);

      this.showFeedback(`"${product.name}" added to your cart!`, 'success');
    } else {
      this.showFeedback(`Could not add "${product.name}" to cart (max stock reached).`, 'warning');
    }
  }

  // Move product to cart (adds to cart and removes from wishlist)
  moveToCart(product: Product): void {
    if (!product || product.stock <= 0 || product.inStock === false) {
      this.showFeedback(`"${product.name}" is currently out of stock.`, 'warning');
      return;
    }

    const added = this.wishlistService.moveToCart(product, 1, true);
    if (added) {
      this.showFeedback(`"${product.name}" moved to your cart!`, 'success');
    } else {
      this.showFeedback(`Could not move "${product.name}" to cart.`, 'warning');
    }
  }

  // Add all in-stock products to cart
  addAllToCart(): void {
    const addedCount = this.wishlistService.addAllToCart(false);
    if (addedCount > 0) {
      this.showFeedback(`Successfully added ${addedCount} product(s) to your cart!`, 'success');
    } else {
      this.showFeedback('No available products could be added to cart.', 'info');
    }
  }

  // Remove a product from wishlist
  removeItem(productId: string, productName?: string): void {
    this.wishlistService.removeFromWishlist(productId);
    const nameStr = productName ? `"${productName}"` : 'Product';
    this.showFeedback(`${nameStr} removed from your wishlist.`, 'info');
  }

  // Clear entire wishlist
  clearWishlist(): void {
    this.wishlistService.clearWishlist();
    this.showFeedback('Your wishlist has been cleared.', 'info');
  }

  // Check if product is in cart
  isInCart(productId: string): boolean {
    return this.cartService.isInCart(productId);
  }

  // Check if recently added to cart
  isJustAdded(productId: string): boolean {
    return this.recentlyAdded().has(productId);
  }

  private showFeedback(text: string, type: 'success' | 'info' | 'warning'): void {
    this.feedbackMessage.set({ text, type });
    setTimeout(() => {
      this.feedbackMessage.set(null);
    }, 3500);
  }
}
