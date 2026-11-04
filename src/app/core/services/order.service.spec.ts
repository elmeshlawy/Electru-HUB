import { TestBed } from '@angular/core/testing';
import { OrderService, ORDERS_STORAGE_KEY } from './order.service';
import { StorageService } from './storage.service';
import { Address } from '../models/address.model';
import { OrderItem } from '../models/order.model';
import { CartSummary } from '../models/cart.model';

describe('OrderService', () => {
  let service: OrderService;
  let storageService: StorageService;

  const mockAddress: Address = {
    id: 'addr-test',
    fullName: 'Jane Doe',
    streetAddress: '123 Tech Lane',
    city: 'Seattle',
    stateOrProvince: 'WA',
    postalCode: '98101',
    country: 'United States',
    phoneNumber: '+1 (555) 123-4567',
  };

  const mockItems: OrderItem[] = [
    {
      productId: 'prod-laptop-1',
      productName: 'Flagship Laptop Pro',
      productImage: 'https://example.com/laptop.jpg',
      unitPrice: 1500,
      quantity: 1,
      lineTotal: 1500,
    },
  ];

  const mockSummary: CartSummary = {
    subtotal: 1500,
    shipping: 0,
    tax: 120,
    discount: 0,
    total: 1620,
    totalItems: 1,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrderService, StorageService],
    });

    storageService = TestBed.inject(StorageService);
    storageService.removeItem(ORDERS_STORAGE_KEY);

    service = TestBed.inject(OrderService);
  });

  afterEach(() => {
    storageService.removeItem(ORDERS_STORAGE_KEY);
  });

  it('should initialize with initial seeded demo orders', () => {
    expect(service.orders().length).toBeGreaterThan(0);
    expect(service.orders()[0].orderNumber).toContain('EH-2026-');
  });

  it('should place a new order and persist it to LocalStorage', () => {
    const initialCount = service.orders().length;
    const placed = service.placeOrder(
      'user-test-123',
      'Jane Doe',
      'jane@example.com',
      mockItems,
      mockAddress,
      mockAddress,
      'credit_card',
      mockSummary,
      'Express Air Shipping (1-2 Business Days)'
    );

    expect(placed).toBeDefined();
    expect(placed.id).toContain('ord-');
    expect(placed.orderNumber).toContain('EH-2026-');
    expect(placed.customerName).toBe('Jane Doe');
    expect(placed.total).toBe(1620);
    expect(placed.shippingMethod).toBe('Express Air Shipping (1-2 Business Days)');
    expect(placed.status).toBe('processing');
    expect(placed.paymentStatus).toBe('paid');

    expect(service.orders().length).toBe(initialCount + 1);

    // Verify storage persistence
    const saved = storageService.getItem<any[]>(ORDERS_STORAGE_KEY);
    expect(saved).toBeTruthy();
    expect(saved?.[0].id).toBe(placed.id);
  });

  it('should set paymentStatus to pending when paying with cash_on_delivery', () => {
    const placed = service.placeOrder(
      'user-test-cod',
      'John Smith',
      'john@example.com',
      mockItems,
      mockAddress,
      mockAddress,
      'cash_on_delivery',
      mockSummary
    );

    expect(placed.paymentMethod).toBe('cash_on_delivery');
    expect(placed.paymentStatus).toBe('pending');
  });

  it('should find an order by ID and order number', () => {
    const placed = service.placeOrder(
      'user-test-lookup',
      'Alice Wonderland',
      'alice@example.com',
      mockItems,
      mockAddress,
      mockAddress,
      'credit_card',
      mockSummary
    );

    const byId = service.getOrderById(placed.id);
    expect(byId).toBeDefined();
    expect(byId?.id).toBe(placed.id);

    const byNumber = service.getOrderByNumber(placed.orderNumber);
    expect(byNumber).toBeDefined();
    expect(byNumber?.orderNumber).toBe(placed.orderNumber);
  });

  it('should cancel an order if status is processing or pending', () => {
    const placed = service.placeOrder(
      'user-test-cancel',
      'Bob Builder',
      'bob@example.com',
      mockItems,
      mockAddress,
      mockAddress,
      'credit_card',
      mockSummary
    );

    expect(placed.status).toBe('processing');
    const cancelled = service.cancelOrder(placed.id);
    expect(cancelled).toBe(true);

    const updated = service.getOrderById(placed.id);
    expect(updated?.status).toBe('cancelled');
  });

  it('should not cancel an already delivered or non-existent order', () => {
    const nonExistent = service.cancelOrder('fake-id-12345');
    expect(nonExistent).toBe(false);
  });
});
