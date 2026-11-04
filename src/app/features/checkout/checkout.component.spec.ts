import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CheckoutComponent } from './checkout.component';
import { CartService, CART_STORAGE_KEY } from '../../core/services/cart.service';
import { OrderService, ORDERS_STORAGE_KEY } from '../../core/services/order.service';
import { AuthService, USER_SESSION_KEY } from '../../core/services/auth.service';
import { StorageService } from '../../core/services/storage.service';
import { Product } from '../../core/models/product.model';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let cartService: CartService;
  let orderService: OrderService;
  let authService: AuthService;
  let storageService: StorageService;

  const mockProduct: Product = {
    id: 'prod-check-1',
    name: 'Dell XPS 15 Flagship',
    slug: 'dell-xps-15',
    description: 'High performance laptop',
    price: 2000,
    rating: 4.8,
    reviewCount: 30,
    stock: 5,
    inStock: true,
    featuredImage: 'https://example.com/dell.jpg',
    images: ['https://example.com/dell.jpg'],
    categoryId: 'cat-laptops',
    categoryName: 'Laptops',
    brand: 'Dell',
    featured: true,
    isFeatured: true,
    bestSeller: false,
    isBestSeller: false,
    createdAt: '2026-01-01',
    specifications: {},
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        provideRouter([]),
        CartService,
        OrderService,
        AuthService,
        StorageService,
      ],
    }).compileComponents();

    storageService = TestBed.inject(StorageService);
    storageService.removeItem(CART_STORAGE_KEY);
    storageService.removeItem(ORDERS_STORAGE_KEY);
    storageService.removeItem(USER_SESSION_KEY);

    authService = TestBed.inject(AuthService);
    authService.loginAsDemoUser();

    cartService = TestBed.inject(CartService);
    cartService.clearCart();

    orderService = TestBed.inject(OrderService);

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    cartService.clearCart();
    authService.logout();
    storageService.removeItem(CART_STORAGE_KEY);
    storageService.removeItem(ORDERS_STORAGE_KEY);
    storageService.removeItem(USER_SESSION_KEY);
  });

  it('should create the checkout component', () => {
    expect(component).toBeTruthy();
  });

  it('should prepopulate fields from logged-in user profile', () => {
    expect(component.checkoutForm.value.firstName).toBe('Alex');
    expect(component.checkoutForm.value.lastName).toBe('Vance');
    expect(component.checkoutForm.value.email).toBe('alex.vance@electrohub.io');
    expect(component.checkoutForm.value.city).toBe('San Francisco');
  });

  it('should validate customer and address fields', () => {
    const form = component.checkoutForm;
    form.patchValue({
      firstName: '',
      email: 'not-an-email',
      phone: 'abc', // Invalid characters
      streetAddress: '12', // Too short
      city: '',
    });

    expect(form.get('firstName')?.hasError('required')).toBe(true);
    expect(form.get('email')?.hasError('email')).toBe(true);
    expect(form.get('phone')?.hasError('pattern')).toBe(true);
    expect(form.get('streetAddress')?.hasError('minlength')).toBe(true);
    expect(form.get('city')?.hasError('required')).toBe(true);
  });

  it('should dynamically update shipping cost and total when changing shipping method', () => {
    cartService.addToCart(mockProduct, 1);
    fixture.detectChanges();

    expect(component.cartSubtotal()).toBe(2000);
    // Standard shipping is free ($0) because 2000 >= 150
    expect(component.currentShippingCost()).toBe(0);

    // Switch to express air ($25)
    component.onShippingMethodChange('express');
    fixture.detectChanges();
    expect(component.currentShippingCost()).toBe(25);
    expect(component.currentTotal()).toBe(2000 + 25 + 160); // 160 is 8% tax

    // Switch to priority overnight ($35)
    component.onShippingMethodChange('priority');
    fixture.detectChanges();
    expect(component.currentShippingCost()).toBe(35);
    expect(component.currentTotal()).toBe(2000 + 35 + 160);
  });

  it('should prevent submission when cart is empty', () => {
    expect(component.items().length).toBe(0);

    component.onSubmit();
    expect(component.confirmedOrder()).toBeNull();
  });

  it('should place order, clear cart, and render confirmation upon successful submission', () => {
    cartService.addToCart(mockProduct, 1);
    fixture.detectChanges();
    expect(cartService.totalItems()).toBe(1);

    component.onSubmit();
    fixture.detectChanges();

    // Verify order was confirmed
    const order = component.confirmedOrder();
    expect(order).toBeDefined();
    expect(order?.orderNumber).toContain('EH-2026-');
    expect(order?.customerName).toBe('Alex Vance');
    expect(order?.items.length).toBe(1);

    // Verify cart was cleared
    expect(cartService.isEmpty()).toBe(true);
    expect(cartService.totalItems()).toBe(0);

    // Verify confirmation view rendered
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Order Placed Successfully');
    expect(compiled.textContent).toContain('Dell XPS 15 Flagship');
    expect(compiled.textContent).toContain('Continue Shopping');
  });
});
