import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CartComponent } from './cart.component';
import { CartService, CART_STORAGE_KEY } from '../../core/services/cart.service';
import { WishlistService, WISHLIST_STORAGE_KEY } from '../../core/services/wishlist.service';
import { StorageService } from '../../core/services/storage.service';
import { Product } from '../../core/models/product.model';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let cartService: CartService;
  let wishlistService: WishlistService;
  let storageService: StorageService;

  const mockProduct: Product = {
    id: 'prod-cart-test-1',
    name: 'Pro Laptop 16',
    slug: 'pro-laptop-16',
    description: 'Ultra fast laptop',
    price: 1500,
    rating: 4.9,
    reviewCount: 18,
    stock: 5,
    inStock: true,
    featuredImage: 'https://example.com/laptop.jpg',
    images: ['https://example.com/laptop.jpg'],
    categoryId: 'cat-laptops',
    categoryName: 'Laptops',
    brand: 'TechBrand',
    featured: true,
    isFeatured: true,
    bestSeller: false,
    isBestSeller: false,
    createdAt: '2026-01-01',
    specifications: {},
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [
        provideRouter([]),
        CartService,
        WishlistService,
        StorageService,
      ],
    }).compileComponents();

    storageService = TestBed.inject(StorageService);
    storageService.removeItem(CART_STORAGE_KEY);
    storageService.removeItem(WISHLIST_STORAGE_KEY);

    cartService = TestBed.inject(CartService);
    cartService.clearCart();

    wishlistService = TestBed.inject(WishlistService);
    wishlistService.clearWishlist();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    cartService.clearCart();
    wishlistService.clearWishlist();
    storageService.removeItem(CART_STORAGE_KEY);
    storageService.removeItem(WISHLIST_STORAGE_KEY);
  });

  it('should create the cart component', () => {
    expect(component).toBeTruthy();
  });

  it('should show empty cart state when cart has no items', () => {
    expect(component.isEmpty()).toBe(true);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Your Shopping Cart is Empty');
  });

  it('should display cart items and order summary when cart has items', () => {
    cartService.addToCart(mockProduct, 1);
    fixture.detectChanges();

    expect(component.isEmpty()).toBe(false);
    expect(component.totalItems()).toBe(1);
    expect(component.subtotal()).toBe(1500);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Pro Laptop 16');
    expect(compiled.textContent).toContain('Order Summary');
  });

  it('should increment and decrement item quantity', () => {
    cartService.addToCart(mockProduct, 1);
    fixture.detectChanges();

    const itemId = component.items()[0].id;
    component.increment(itemId);
    fixture.detectChanges();
    expect(component.totalItems()).toBe(2);

    component.decrement(itemId);
    fixture.detectChanges();
    expect(component.totalItems()).toBe(1);
  });

  it('should clamp quantity to max available stock on manual input change', () => {
    cartService.addToCart(mockProduct, 1);
    fixture.detectChanges();

    const itemId = component.items()[0].id;
    // mockProduct has stock of 5, simulate input of 20
    const mockInput = { target: { value: '20' } } as unknown as Event;
    component.onQuantityInputChange(itemId, mockInput, mockProduct.stock);
    fixture.detectChanges();

    expect(cartService.getItemQuantity(mockProduct.id)).toBe(5);
  });

  it('should remove item from cart when removeItem is called', () => {
    cartService.addToCart(mockProduct, 2);
    fixture.detectChanges();

    const itemId = component.items()[0].id;
    component.removeItem(itemId);
    fixture.detectChanges();

    expect(component.isEmpty()).toBe(true);
    expect(cartService.isInCart(mockProduct.id)).toBe(false);
  });

  it('should move item from cart to wishlist', () => {
    cartService.addToCart(mockProduct, 1);
    fixture.detectChanges();

    const itemId = component.items()[0].id;
    component.moveToWishlist(mockProduct, itemId);
    fixture.detectChanges();

    expect(component.isEmpty()).toBe(true);
    expect(wishlistService.isInWishlist(mockProduct.id)).toBe(true);
  });

  it('should clear all items when clearCart is called', () => {
    cartService.addToCart(mockProduct, 2);
    fixture.detectChanges();

    component.clearCart();
    fixture.detectChanges();

    expect(component.isEmpty()).toBe(true);
    expect(component.totalItems()).toBe(0);
  });
});
