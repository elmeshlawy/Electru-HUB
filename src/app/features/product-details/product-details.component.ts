import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyFormatPipe, EmptyStateComponent],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  readonly productService = inject(ProductService);
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);

  slugOrId = signal<string>('');
  quantity = signal<number>(1);
  selectedImageIndex = signal<number>(0);
  addedToast = signal<boolean>(false);

  // Find product by slug or id
  readonly product = computed(() => {
    const key = this.slugOrId();
    if (!key) return undefined;
    return this.productService.getProductBySlug(key) || this.productService.getProductById(key);
  });

  readonly isInWishlist = computed(() => {
    const p = this.product();
    return p ? this.wishlistService.isInWishlist(p.id) : false;
  });

  readonly specEntries = computed(() => {
    const p = this.product();
    if (!p || !p.specs) return [];
    return Object.entries(p.specs);
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug') || '';
      this.slugOrId.set(slug);
      this.selectedImageIndex.set(0);
      this.quantity.set(1);
    });
  }

  incrementQuantity(): void {
    const p = this.product();
    if (!p) return;
    if (this.quantity() < p.stock) {
      this.quantity.update((q) => q + 1);
    }
  }

  decrementQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update((q) => q - 1);
    }
  }

  onAddToCart(): void {
    const p = this.product();
    if (!p) return;
    this.cartService.addToCart(p, this.quantity());
    this.addedToast.set(true);
    setTimeout(() => this.addedToast.set(false), 3000);
  }

  onToggleWishlist(): void {
    const p = this.product();
    if (!p) return;
    this.wishlistService.toggleWishlist(p);
  }
}
