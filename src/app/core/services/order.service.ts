import { Injectable, effect, inject, signal } from '@angular/core';
import { Order, OrderItem, OrderStatus, PaymentMethod } from '../models/order.model';
import { Address } from '../models/address.model';
import { CartSummary } from '../models/cart.model';
import { StorageService } from './storage.service';

export const ORDERS_STORAGE_KEY = 'electrohub_orders_history';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly storage = inject(StorageService);

  private readonly _orders = signal<Order[]>([]);

  // Readonly access for components
  readonly orders = this._orders.asReadonly();

  constructor() {
    this.loadFromStorage();

    // Auto-sync order history to LocalStorage
    effect(() => {
      this.storage.setItem(ORDERS_STORAGE_KEY, this._orders());
    });

    // Cross-tab synchronization
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('storage', (event: StorageEvent) => {
        if (event.key === ORDERS_STORAGE_KEY) {
          this.loadFromStorage();
        }
      });
    }
  }

  loadFromStorage(): void {
    const saved = this.storage.getItem<Order[]>(ORDERS_STORAGE_KEY);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      this._orders.set(saved);
    } else {
      // Seed an initial demo order
      const initialOrders: Order[] = [
        {
          id: 'ord-9021',
          orderNumber: 'EH-2026-9021',
          userId: 'user-demo-001',
          customerEmail: 'alex.vance@electrohub.io',
          customerName: 'Alex Vance',
          items: [
            {
              productId: 'prod-macbook-pro-16',
              productName: 'Apple MacBook Pro 16" M3 Max',
              productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
              unitPrice: 3499.0,
              quantity: 1,
              lineTotal: 3499.0,
            },
            {
              productId: 'prod-sony-wh1000xm5',
              productName: 'Sony WH-1000XM5 Wireless ANC',
              productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
              unitPrice: 348.0,
              quantity: 1,
              lineTotal: 348.0,
            },
          ],
          shippingAddress: {
            id: 'addr-1',
            fullName: 'Alex Vance',
            streetAddress: '742 Evergreen Terrace',
            apartmentOrSuite: 'Suite 4B',
            city: 'San Francisco',
            stateOrProvince: 'CA',
            postalCode: '94107',
            country: 'United States',
            phoneNumber: '+1 (555) 019-2834',
          },
          billingAddress: {
            id: 'addr-1',
            fullName: 'Alex Vance',
            streetAddress: '742 Evergreen Terrace',
            apartmentOrSuite: 'Suite 4B',
            city: 'San Francisco',
            stateOrProvince: 'CA',
            postalCode: '94107',
            country: 'United States',
            phoneNumber: '+1 (555) 019-2834',
          },
          paymentMethod: 'credit_card',
          paymentStatus: 'paid',
          status: 'shipped',
          shippingMethod: 'Express Delivery (1-2 Days)',
          subtotal: 3847.0,
          shippingCost: 0,
          tax: 307.76,
          discount: 0,
          total: 4154.76,
          trackingNumber: 'TRK-9821034-US',
          estimatedDelivery: '2026-11-08T18:00:00Z',
          createdAt: '2026-11-01T14:32:00Z',
          updatedAt: '2026-11-02T09:15:00Z',
        },
      ];
      this._orders.set(initialOrders);
      this.saveToStorage();
    }
  }

  private saveToStorage(): void {
    this.storage.setItem(ORDERS_STORAGE_KEY, this._orders());
  }

  /**
   * Places a new order from checkout details and persists to LocalStorage
   */
  placeOrder(
    userId: string,
    customerName: string,
    customerEmail: string,
    items: OrderItem[],
    shippingAddress: Address,
    billingAddress: Address,
    paymentMethod: PaymentMethod,
    summary: CartSummary,
    shippingMethod = 'Standard Express Delivery'
  ): Order {
    const timestamp = Date.now();
    const orderNumber = `EH-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord-${timestamp}`,
      orderNumber,
      userId,
      customerName,
      customerEmail,
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid',
      status: 'processing',
      shippingMethod,
      subtotal: summary.subtotal,
      shippingCost: summary.shipping,
      tax: summary.tax,
      discount: summary.discount,
      total: summary.total,
      trackingNumber: `TRK-${Math.floor(1000000 + Math.random() * 9000000)}`,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this._orders.update((prev) => [newOrder, ...prev]);
    this.saveToStorage();
    return newOrder;
  }

  /**
   * Retrieve single order by ID
   */
  getOrderById(id: string): Order | undefined {
    return this._orders().find((o) => o.id === id);
  }

  /**
   * Retrieve single order by Order Number
   */
  getOrderByNumber(orderNumber: string): Order | undefined {
    return this._orders().find((o) => o.orderNumber === orderNumber);
  }

  /**
   * Cancel an order if it is in pending or processing state
   */
  cancelOrder(orderId: string): boolean {
    const order = this.getOrderById(orderId);
    if (!order || (order.status !== 'pending' && order.status !== 'processing')) {
      return false;
    }

    this._orders.update((orders) =>
      orders.map((o) =>
        o.id === orderId
          ? { ...o, status: 'cancelled' as OrderStatus, updatedAt: new Date().toISOString() }
          : o
      )
    );
    this.saveToStorage();
    return true;
  }
}
