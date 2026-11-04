import { Injectable, effect, inject, signal } from '@angular/core';
import { Order, OrderItem, OrderStatus, PaymentMethod } from '../models/order.model';
import { Address } from '../models/address.model';
import { CartSummary } from '../models/cart.model';
import { StorageService } from './storage.service';

const ORDERS_STORAGE_KEY = 'electrohub_orders_history';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly storage = inject(StorageService);

  private readonly _orders = signal<Order[]>([]);

  // Readonly access
  readonly orders = this._orders.asReadonly();

  constructor() {
    this.loadFromStorage();

    effect(() => {
      this.storage.setItem(ORDERS_STORAGE_KEY, this._orders());
    });
  }

  private loadFromStorage(): void {
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
              unitPrice: 3499.00,
              quantity: 1,
              lineTotal: 3499.00,
            },
            {
              productId: 'prod-sony-wh1000xm5',
              productName: 'Sony WH-1000XM5 Wireless ANC',
              productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
              unitPrice: 348.00,
              quantity: 1,
              lineTotal: 348.00,
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
          subtotal: 2849.98,
          shippingCost: 0,
          tax: 227.99,
          discount: 0,
          total: 3077.97,
          trackingNumber: 'TRK-9821034-US',
          estimatedDelivery: '2026-11-08T18:00:00Z',
          createdAt: '2026-11-01T14:32:00Z',
          updatedAt: '2026-11-02T09:15:00Z',
        },
      ];
      this._orders.set(initialOrders);
    }
  }

  /**
   * Places a new order from checkout details
   */
  placeOrder(
    userId: string,
    customerName: string,
    customerEmail: string,
    items: OrderItem[],
    shippingAddress: Address,
    billingAddress: Address,
    paymentMethod: PaymentMethod,
    summary: CartSummary
  ): Order {
    const timestamp = Date.now();
    const orderNumber = `EH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

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
      paymentStatus: 'paid',
      status: 'processing',
      subtotal: summary.subtotal,
      shippingCost: summary.shipping,
      tax: summary.tax,
      discount: summary.discount,
      total: summary.total,
      trackingNumber: `TRK-${Math.floor(1000000 + Math.random() * 9000000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this._orders.update((prev) => [newOrder, ...prev]);
    return newOrder;
  }

  /**
   * Retrieve single order by ID
   */
  getOrderById(id: string): Order | undefined {
    return this._orders().find((o) => o.id === id);
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
    return true;
  }
}
