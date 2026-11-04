import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyFormatPipe, EmptyStateComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  readonly cartService = inject(CartService);

  readonly items = this.cartService.items;
  readonly summary = this.cartService.summary;
  readonly isEmpty = this.cartService.isEmpty;

  // Free shipping progress calculation ($150 target)
  readonly freeShippingRemaining = computed(() => {
    const sub = this.cartService.subtotal();
    return Math.max(0, 150 - sub);
  });

  readonly freeShippingPercentage = computed(() => {
    const sub = this.cartService.subtotal();
    return Math.min(100, Math.round((sub / 150) * 100));
  });

  updateQuantity(itemId: string, currentQty: number, delta: number): void {
    const newQty = currentQty + delta;
    this.cartService.updateQuantity(itemId, newQty);
  }

  removeItem(itemId: string): void {
    this.cartService.removeFromCart(itemId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }
}
