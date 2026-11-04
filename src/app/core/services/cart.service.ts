import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { CartItem, CartSummary } from '../models/cart.model';
import { StorageService } from './storage.service';

const CART_STORAGE_KEY = 'electrohub_cart_items';
const FREE_SHIPPING_THRESHOLD = 150;
const STANDARD_SHIPPING_FEE = 15;
const ESTIMATED_TAX_RATE = 0.08; // 8%

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly storage = inject(StorageService);

  // Core state signal
  private readonly _items = signal<CartItem[]>([]);

  // Public readonly access
  readonly items = this._items.asReadonly();

  // Computed state
  readonly totalItems = computed(() =>
    this._items().reduce((acc, item) => acc + item.quantity, 0)
  );

  readonly subtotal = computed(() =>
    this._items().reduce((acc, item) => acc + item.totalPrice, 0)
  );

  readonly shipping = computed(() => {
    const sub = this.subtotal();
    if (sub === 0) return 0;
    return sub >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  });

  readonly tax = computed(() =>
    Math.round(this.subtotal() * ESTIMATED_TAX_RATE * 100) / 100
  );

  readonly total = computed(() =>
    Math.round((this.subtotal() + this.shipping() + this.tax()) * 100) / 100
  );

  readonly summary = computed<CartSummary>(() => ({
    subtotal: this.subtotal(),
    shipping: this.shipping(),
    tax: this.tax(),
    discount: 0,
    total: this.total(),
    totalItems: this.totalItems(),
  }));

  readonly isEmpty = computed(() => this._items().length === 0);

  constructor() {
    this.loadFromStorage();

    // Auto-sync cart changes to LocalStorage via Angular effect
    effect(() => {
      const items = this._items();
      this.storage.setItem(CART_STORAGE_KEY, items);
    });
  }

  private loadFromStorage(): void {
    const saved = this.storage.getItem<CartItem[]>(CART_STORAGE_KEY);
    if (saved && Array.isArray(saved)) {
      this._items.set(saved);
    }
  }

  /**
   * Adds a product to cart or increments quantity if matching item exists
   */
  addToCart(product: Product, quantity = 1, selectedSpecs?: Record<string, string>): void {
    if (quantity <= 0) return;

    this._items.update((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (item) => item.productId === product.id
      );

      if (existingIndex > -1) {
        const existing = currentItems[existingIndex];
        const newQuantity = existing.quantity + quantity;
        const updatedItem: CartItem = {
          ...existing,
          quantity: newQuantity,
          totalPrice: Math.round(existing.unitPrice * newQuantity * 100) / 100,
        };

        const copy = [...currentItems];
        copy[existingIndex] = updatedItem;
        return copy;
      }

      const newItem: CartItem = {
        id: `cart-${product.id}-${Date.now()}`,
        productId: product.id,
        product,
        quantity,
        selectedSpecs,
        unitPrice: product.price,
        totalPrice: Math.round(product.price * quantity * 100) / 100,
        addedAt: new Date().toISOString(),
      };

      return [...currentItems, newItem];
    });
  }

  /**
   * Updates quantity for an existing cart item
   */
  updateQuantity(cartItemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(cartItemId);
      return;
    }

    this._items.update((currentItems) =>
      currentItems.map((item) => {
        if (item.id === cartItemId) {
          return {
            ...item,
            quantity,
            totalPrice: Math.round(item.unitPrice * quantity * 100) / 100,
          };
        }
        return item;
      })
    );
  }

  /**
   * Removes an item from the cart
   */
  removeFromCart(cartItemId: string): void {
    this._items.update((items) => items.filter((item) => item.id !== cartItemId));
  }

  /**
   * Checks whether a product is currently in the cart
   */
  isInCart(productId: string): boolean {
    return this._items().some((item) => item.productId === productId);
  }

  /**
   * Clears all items in the cart
   */
  clearCart(): void {
    this._items.set([]);
  }
}
