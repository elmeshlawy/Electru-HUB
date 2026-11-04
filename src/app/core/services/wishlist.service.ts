import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { StorageService } from './storage.service';
import { CartService } from './cart.service';

export const WISHLIST_STORAGE_KEY = 'electrohub_wishlist_products';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private readonly storage = inject(StorageService);
  private readonly cartService = inject(CartService);

  private readonly _items = signal<Product[]>([]);

  // Public readonly signals (supports both wishlistItems and items naming)
  readonly wishlistItems = this._items.asReadonly();
  readonly items = this.wishlistItems;

  readonly wishlistCount = computed(() => this._items().length);
  readonly count = this.wishlistCount;
  readonly isEmpty = computed(() => this._items().length === 0);

  constructor() {
    this.loadFromStorage();

    // Auto-sync wishlist changes to LocalStorage via Angular effect
    effect(() => {
      this.storage.setItem(WISHLIST_STORAGE_KEY, this._items());
    });

    // Listen for storage changes across browser tabs/windows
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('storage', (event: StorageEvent) => {
        if (event.key === WISHLIST_STORAGE_KEY) {
          this.loadFromStorage();
        }
      });
    }
  }

  /**
   * Loads wishlist items from LocalStorage and ensures no duplicates exist
   */
  loadFromStorage(): void {
    const saved = this.storage.getItem<Product[]>(WISHLIST_STORAGE_KEY);
    if (saved && Array.isArray(saved)) {
      // Remove any duplicate IDs that might have been saved
      const seen = new Set<string>();
      const deduped: Product[] = [];
      for (const prod of saved) {
        if (prod && prod.id && !seen.has(prod.id)) {
          seen.add(prod.id);
          deduped.push(prod);
        }
      }
      this._items.set(deduped);
    }
  }

  /**
   * Synchronously saves current wishlist items to storage
   */
  private saveToStorage(): void {
    this.storage.setItem(WISHLIST_STORAGE_KEY, this._items());
  }

  /**
   * Toggles product in wishlist (adds if not present, removes if present)
   */
  toggleWishlist(product: Product): boolean {
    if (!product || !product.id) return false;

    const exists = this.isInWishlist(product.id);
    if (exists) {
      this.removeFromWishlist(product.id);
      return false;
    } else {
      return this.addToWishlist(product);
    }
  }

  /**
   * Adds product to wishlist if not already present.
   * Strictly prevents duplicate entries.
   * Returns true if added, false if already present or invalid.
   */
  addToWishlist(product: Product): boolean {
    if (!product || !product.id) return false;

    if (this.isInWishlist(product.id)) {
      return false; // Prevent duplicates
    }

    this._items.update((current) => [...current.filter((p) => p.id !== product.id), product]);
    this.saveToStorage();
    return true;
  }

  /**
   * Removes product from wishlist by ID
   */
  removeFromWishlist(productId: string): void {
    this._items.update((current) => current.filter((p) => p.id !== productId));
    this.saveToStorage();
  }

  /**
   * Checks if a product exists in wishlist
   */
  isInWishlist(productId: string): boolean {
    return this._items().some((p) => p.id === productId);
  }

  /**
   * Adds a wishlist product to the shopping cart.
   * Optionally removes the product from the wishlist upon addition.
   */
  moveToCart(product: Product, quantity = 1, removeAfterAdd = false): boolean {
    if (!product || !product.id) return false;

    const success = this.cartService.addToCart(product, quantity);
    if (success && removeAfterAdd) {
      this.removeFromWishlist(product.id);
    }
    return success;
  }

  /**
   * Adds all currently available (in-stock) wishlist products to the shopping cart.
   * Optionally removes the added products from the wishlist.
   * Returns count of products successfully added.
   */
  addAllToCart(removeAfterAdd = false): number {
    const products = this._items();
    let addedCount = 0;
    const addedProductIds: string[] = [];

    for (const prod of products) {
      if (prod.stock > 0 && prod.inStock !== false) {
        const ok = this.cartService.addToCart(prod, 1);
        if (ok) {
          addedCount++;
          addedProductIds.push(prod.id);
        }
      }
    }

    if (removeAfterAdd && addedProductIds.length > 0) {
      this._items.update((current) => current.filter((p) => !addedProductIds.includes(p.id)));
      this.saveToStorage();
    }

    return addedCount;
  }

  /**
   * Clears the entire wishlist
   */
  clearWishlist(): void {
    this._items.set([]);
    this.saveToStorage();
  }
}
