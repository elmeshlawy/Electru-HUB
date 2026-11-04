import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { StorageService } from './storage.service';

const WISHLIST_STORAGE_KEY = 'electrohub_wishlist_products';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private readonly storage = inject(StorageService);

  private readonly _items = signal<Product[]>([]);

  // Public readonly access
  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().length);
  readonly isEmpty = computed(() => this._items().length === 0);

  constructor() {
    this.loadFromStorage();

    // Auto-sync wishlist changes to LocalStorage
    effect(() => {
      this.storage.setItem(WISHLIST_STORAGE_KEY, this._items());
    });
  }

  private loadFromStorage(): void {
    const saved = this.storage.getItem<Product[]>(WISHLIST_STORAGE_KEY);
    if (saved && Array.isArray(saved)) {
      this._items.set(saved);
    }
  }

  /**
   * Toggles product in wishlist (adds if not present, removes if present)
   */
  toggleWishlist(product: Product): boolean {
    const exists = this.isInWishlist(product.id);
    if (exists) {
      this.removeFromWishlist(product.id);
      return false;
    } else {
      this.addToWishlist(product);
      return true;
    }
  }

  /**
   * Adds product to wishlist if not already present
   */
  addToWishlist(product: Product): void {
    if (this.isInWishlist(product.id)) return;
    this._items.update((current) => [...current, product]);
  }

  /**
   * Removes product from wishlist by ID
   */
  removeFromWishlist(productId: string): void {
    this._items.update((current) => current.filter((p) => p.id !== productId));
  }

  /**
   * Checks if a product exists in wishlist
   */
  isInWishlist(productId: string): boolean {
    return this._items().some((p) => p.id === productId);
  }

  /**
   * Clears the entire wishlist
   */
  clearWishlist(): void {
    this._items.set([]);
  }
}
