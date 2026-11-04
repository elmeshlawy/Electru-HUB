import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { Product } from '../../core/models/product.model';

const FALLBACK_IMAGE =
  'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20600%22%3E%3Crect%20fill%3D%22%23f1f5f9%22%20width%3D%22600%22%20height%3D%22600%22%2F%3E%3Cpath%20d%3D%22M250%20250h100v100h-100z%22%20fill%3D%22%230284c7%22%20opacity%3D%220.25%22%2F%3E%3Ctext%20fill%3D%22%230f172a%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2260%25%22%20text-anchor%3D%22middle%22%3EElectroHub%20Device%3C%2Ftext%3E%3C%2Fsvg%3E';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    CurrencyFormatPipe,
    EmptyStateComponent,
    ProductCardComponent,
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly productService = inject(ProductService);
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);

  productId = signal<string>('');
  selectedImageIndex = signal<number>(0);
  quantity = signal<number>(1);
  addedToast = signal<boolean>(false);
  activeTab = signal<'specs' | 'reviews'>('specs');

  // Customer Review Form state
  newReviewerName = signal<string>('');
  newReviewRating = signal<number>(5);
  newReviewTitle = signal<string>('');
  newReviewComment = signal<string>('');
  reviewSubmitted = signal<boolean>(false);
  reviewError = signal<string | null>(null);

  // Current product signal
  readonly product = computed<Product | undefined>(() => {
    const id = this.productId();
    if (!id) return undefined;
    return this.productService.getProductById(id) || this.productService.getProductBySlug(id);
  });

  // Images array with fallback
  readonly productImages = computed<string[]>(() => {
    const p = this.product();
    if (!p) return [];
    if (p.images && p.images.length > 0) return p.images;
    if (p.featuredImage) return [p.featuredImage];
    return [FALLBACK_IMAGE];
  });

  // Wishlist and Cart state
  readonly isInWishlist = computed(() => {
    const p = this.product();
    return p ? this.wishlistService.isInWishlist(p.id) : false;
  });

  readonly isInCart = computed(() => {
    const p = this.product();
    return p ? this.cartService.isInCart(p.id) : false;
  });

  // Technical specifications entries
  readonly specEntries = computed(() => {
    const p = this.product();
    if (!p) return [];
    const specsObj = p.specifications || p.specs;
    if (!specsObj) return [];
    return Object.entries(specsObj);
  });

  // Related products from same category
  readonly relatedProducts = computed<Product[]>(() => {
    const p = this.product();
    if (!p) return [];
    return this.productService.getRelatedProducts(p.id, 4);
  });

  // Reviews list
  readonly reviews = computed(() => {
    const p = this.product();
    if (!p || !p.reviews) return [];
    return p.reviews;
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id') || params.get('slug') || '';
      this.productId.set(id);
      this.selectedImageIndex.set(0);
      this.quantity.set(1);
      this.reviewSubmitted.set(false);
      this.reviewError.set(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
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
    if (!p || !p.stock) return;

    this.cartService.addToCart(p, this.quantity());
    this.addedToast.set(true);
    setTimeout(() => this.addedToast.set(false), 3500);
  }

  onToggleWishlist(): void {
    const p = this.product();
    if (!p) return;
    this.wishlistService.toggleWishlist(p);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && img.src !== FALLBACK_IMAGE) {
      img.src = FALLBACK_IMAGE;
    }
  }

  onSubmitReview(event: Event): void {
    event.preventDefault();
    const p = this.product();
    if (!p) return;

    const name = this.newReviewerName().trim();
    const title = this.newReviewTitle().trim();
    const comment = this.newReviewComment().trim();

    if (!name || !title || !comment) {
      this.reviewError.set('Please fill out all review fields before submitting.');
      return;
    }

    this.productService.addReview(p.id, {
      userId: `usr-guest-${Date.now()}`,
      userName: name,
      rating: this.newReviewRating(),
      title,
      comment,
      verifiedPurchase: true,
      helpfulVotes: 0,
    });

    this.reviewSubmitted.set(true);
    this.reviewError.set(null);
    this.newReviewerName.set('');
    this.newReviewTitle.set('');
    this.newReviewComment.set('');
  }
}
