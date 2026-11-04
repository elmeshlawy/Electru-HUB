import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OrdersComponent } from './orders.component';
import { OrderService, ORDERS_STORAGE_KEY } from '../../core/services/order.service';
import { StorageService } from '../../core/services/storage.service';

describe('OrdersComponent', () => {
  let component: OrdersComponent;
  let fixture: ComponentFixture<OrdersComponent>;
  let orderService: OrderService;
  let storageService: StorageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersComponent],
      providers: [provideRouter([]), OrderService, StorageService],
    }).compileComponents();

    storageService = TestBed.inject(StorageService);
    storageService.removeItem(ORDERS_STORAGE_KEY);

    orderService = TestBed.inject(OrderService);

    fixture = TestBed.createComponent(OrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    storageService.removeItem(ORDERS_STORAGE_KEY);
  });

  it('should create the orders component', () => {
    expect(component).toBeTruthy();
  });

  it('should display orders list with order numbers, items, and status', () => {
    expect(component.orders().length).toBeGreaterThan(0);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('EH-2026-');
    expect(compiled.textContent).toContain('Apple MacBook Pro');
  });

  it('should toggle expanded order details', () => {
    const firstOrderId = component.orders()[0].id;
    expect(component.isExpanded(firstOrderId)).toBe(false);

    component.toggleOrderDetails(firstOrderId);
    expect(component.isExpanded(firstOrderId)).toBe(true);

    component.toggleOrderDetails(firstOrderId);
    expect(component.isExpanded(firstOrderId)).toBe(false);
  });

  it('should cancel processing order and update feedback', () => {
    // Place a fresh processing order to test cancellation
    const newOrder = orderService.placeOrder(
      'user-cancel-test',
      'Test User',
      'test@example.com',
      [],
      {} as any,
      {} as any,
      'credit_card',
      { subtotal: 100, shipping: 0, tax: 8, discount: 0, total: 108, totalItems: 1 }
    );
    fixture.detectChanges();

    component.cancelOrder(newOrder.id);
    fixture.detectChanges();

    const updated = orderService.getOrderById(newOrder.id);
    expect(updated?.status).toBe('cancelled');
    expect(component.feedbackMessage()).toContain('successfully cancelled');
  });

  it('should display correct badge classes according to status', () => {
    expect(component.getStatusBadgeClass('delivered')).toContain('bg-success-subtle');
    expect(component.getStatusBadgeClass('shipped')).toContain('bg-primary-subtle');
    expect(component.getStatusBadgeClass('processing')).toContain('bg-info-subtle');
    expect(component.getStatusBadgeClass('cancelled')).toContain('bg-danger-subtle');
  });
});
