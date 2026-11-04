import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { CartItem, CartSummary } from '../models/cart.model';
import { StorageService } from './storage.service';

export const CART_STORAGE_KEY = 'electrohub_cart_items';
export const FREE_SHIPPING_THRESHOLD = 150;
export const STANDARD_SHIPPING_FEE = 15;
export const ESTIMATED_TAX_RATE = 0.08; // 8%

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly storage = inject(StorageService);

  // Core state signal
  private readonly _items = signal<CartItem[]>([]);

  // Public readonly signals (supports both cartItems and items naming)
  readonly cartItems = this._items.asReadonly();
  readonly items = this.cartItems;

  // Computed state
  readonly totalItems = computed(() =>
    this._items().reduce((acc, item) => acc + item.quantity, 0)
  );

  readonly subtotal = computed(() => {
    const rawSubtotal = this._items().reduce((acc, item) => acc + item.totalPrice, 0);
    return Math.round(rawSubtotal * 100) / 100;
  });

  readonly shipping = computed(() => {
    const sub = this.subtotal();
    if (sub === 0) return 0;
    return sub >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  });

  readonly tax = computed(() =>
    Math.round(this.subtotal() * ESTIMATED_TAX_RATE * 100) / 100
  );

  readonly totalPrice = computed(() =>
    Math.round((this.subtotal() + this.shipping() + this.tax()) * 100) / 100
  );

  readonly total = this.totalPrice;

  readonly summary = computed<CartSummary>(() => ({
    subtotal: this.subtotal(),
    shipping: this.shipping(),
    tax: this.tax(),
    discount: 0,
    total: this.totalPrice(),
    totalItems: this.totalItems(),
  }));

  readonly isEmpty = computed(() => this._items().length === 0);
  readonly freeShippingThreshold = FREE_SHIPPING_THRESHOLD;
  readonly standardShippingFee = STANDARD_SHIPPING_FEE;

  constructor() {
    this.loadFromStorage();

    // Auto-sync cart changes to LocalStorage via Angular effect
    effect(() => {
      const items = this._items();
      this.storage.setItem(CART_STORAGE_KEY, items);
    });

    // Listen for storage changes across browser tabs/windows
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('storage', (event: StorageEvent) => {
        if (event.key === CART_STORAGE_KEY) {
          this.loadFromStorage();
        }
      });
    }
  }

  /**
   * Loads cart items from LocalStorage and validates items
   */
  loadFromStorage(): void {
    const saved = this.storage.getItem<CartItem[]>(CART_STORAGE_KEY);
    if (saved && Array.isArray(saved)) {
      // Validate saved items and recompute line totals for precision
      const validated = saved
        .filter((item) => item && item.product && typeof item.quantity === 'number' && item.quantity > 0)
        .map((item) => {
          const maxStock = item.product.stock ?? 99;
          const safeQty = Math.min(maxStock, Math.max(1, Math.floor(item.quantity)));
          const unitPrice = item.unitPrice ?? item.product.price;
          return {
            ...item,
            quantity: safeQty,
            unitPrice,
            totalPrice: Math.round(unitPrice * safeQty * 100) / 100,
          };
        });
      this._items.set(validated);
    }
  }

  /**
   * Synchronously saves current cart items to storage
   */
  private saveToStorage(): void {
    this.storage.setItem(CART_STORAGE_KEY, this._items());
  }

  /**
   * Adds a product to cart or increments quantity if item exists.
   * Prevents invalid quantities and enforces stock limits.
   * Returns true if successfully added, false if invalid or out of stock.
   */
  addToCart(product: Product, quantity = 1, selectedSpecs?: Record<string, string>): boolean {
    if (!product || !product.id) return false;

    // Check product stock status
    const stockAvailable = product.stock ?? 0;
    if (stockAvailable <= 0 || product.inStock === false) {
      return false;
    }

    // Validate requested quantity
    const parsedQty = Math.floor(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      return false;
    }

    let success = true;

    this._items.update((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (item) => item.productId === product.id
      );

      if (existingIndex > -1) {
        const existing = currentItems[existingIndex];
        // Enforce stock ceiling
        if (existing.quantity >= stockAvailable) {
          success = false;
          return currentItems;
        }

        const newQuantity = Math.min(stockAvailable, existing.quantity + parsedQty);
        const updatedItem: CartItem = {
          ...existing,
          quantity: newQuantity,
          totalPrice: Math.round(existing.unitPrice * newQuantity * 100) / 100,
        };

        const copy = [...currentItems];
        copy[existingIndex] = updatedItem;
        return copy;
      }

      // Add new item with quantity clamped to available stock
      const clampedQuantity = Math.min(stockAvailable, parsedQty);
      const unitPrice = product.price;
      const newItem: CartItem = {
        id: `cart-${product.id}-${Date.now()}`,
        productId: product.id,
        product,
        quantity: clampedQuantity,
        selectedSpecs,
        unitPrice,
        totalPrice: Math.round(unitPrice * clampedQuantity * 100) / 100,
        addedAt: new Date().toISOString(),
      };

      return [...currentItems, newItem];
    });

    if (success) {
      this.saveToStorage();
    }
    return success;
  }

  /**
   * Updates quantity for an existing cart item.
   * Clamps between 1 and available stock, or removes if quantity <= 0.
   */
  updateQuantity(cartItemId: string, quantity: number): boolean {
    if (isNaN(quantity) || quantity === null || quantity === undefined) {
      return false;
    }

    const safeIntQty = Math.floor(quantity);

    if (safeIntQty <= 0) {
      this.removeFromCart(cartItemId);
      return true;
    }

    let updated = false;

    this._items.update((currentItems) =>
      currentItems.map((item) => {
        if (item.id === cartItemId || item.productId === cartItemId) {
          const maxStock = item.product.stock ?? 99;
          const finalQty = Math.min(maxStock, safeIntQty);
          updated = true;
          return {
            ...item,
            quantity: finalQty,
            totalPrice: Math.round(item.unitPrice * finalQty * 100) / 100,
          };
        }
        return item;
      })
    );

    if (updated) {
      this.saveToStorage();
    }
    return updated;
  }

  /**
   * Increases quantity of an item by 1, respecting stock boundary.
   */
  increaseQuantity(cartItemId: string): boolean {
    const item = this.getCartItem(cartItemId);
    if (!item) return false;

    const maxStock = item.product.stock ?? 99;
    if (item.quantity >= maxStock) {
      return false;
    }

    return this.updateQuantity(item.id, item.quantity + 1);
  }

  /**
   * Decreases quantity of an item by 1.
   * If removeOnZero is false, clamps to minimum 1.
   * If removeOnZero is true and quantity is 1, removes the item.
   */
  decreaseQuantity(cartItemId: string, removeOnZero = false): boolean {
    const item = this.getCartItem(cartItemId);
    if (!item) return false;

    if (item.quantity > 1) {
      return this.updateQuantity(item.id, item.quantity - 1);
    }

    if (removeOnZero) {
      this.removeFromCart(item.id);
      return true;
    }

    return false;
  }

  /**
   * Removes an item from the cart by cartItemId or productId.
   */
  removeFromCart(cartItemIdOrProductId: string): void {
    this._items.update((items) =>
      items.filter((item) => item.id !== cartItemIdOrProductId && item.productId !== cartItemIdOrProductId)
    );
    this.saveToStorage();
  }

  /**
   * Checks whether a product is currently in the cart
   */
  isInCart(productId: string): boolean {
    return this._items().some((item) => item.productId === productId);
  }

  /**
   * Gets the current quantity of a product in the cart
   */
  getItemQuantity(productId: string): number {
    const item = this._items().find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  }

  /**
   * Finds a cart item by cart item ID or product ID
   */
  getCartItem(cartItemIdOrProductId: string): CartItem | undefined {
    return this._items().find(
      (item) => item.id === cartItemIdOrProductId || item.productId === cartItemIdOrProductId
    );
  }

  /**
   * Clears all items in the cart
   */
  clearCart(): void {
    this._items.set([]);
    this.saveToStorage();
  }
}
