import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { WishlistComponent } from './wishlist.component';
import { WishlistService, WISHLIST_STORAGE_KEY } from '../../core/services/wishlist.service';
import { CartService, CART_STORAGE_KEY } from '../../core/services/cart.service';
import { StorageService } from '../../core/services/storage.service';
import { Product } from '../../core/models/product.model';

describe('WishlistComponent', () => {
  let component: WishlistComponent;
  let fixture: ComponentFixture<WishlistComponent>;
  let wishlistService: WishlistService;
  let cartService: CartService;
  let storageService: StorageService;

  const mockProductA: Product = {
    id: 'prod-wish-1',
    name: 'Wireless Earbuds Pro',
    slug: 'wireless-earbuds-pro',
    description: 'High fidelity audio',
    price: 199,
    rating: 4.8,
    reviewCount: 40,
    stock: 10,
    inStock: true,
    featuredImage: 'https://example.com/earbuds.jpg',
    images: ['https://example.com/earbuds.jpg'],
    categoryId: 'cat-headphones',
    categoryName: 'Headphones',
    brand: 'SoundPro',
    featured: true,
    isFeatured: true,
    bestSeller: false,
    isBestSeller: false,
    createdAt: '2026-01-01',
    specifications: {},
  };

  const mockProductB: Product = {
    id: 'prod-wish-2',
    name: 'Curved Gaming Monitor',
    slug: 'curved-gaming-monitor',
    description: '144Hz 4K monitor',
    price: 549,
    rating: 4.9,
    reviewCount: 25,
    stock: 4,
    inStock: true,
    featuredImage: 'https://example.com/monitor.jpg',
    images: ['https://example.com/monitor.jpg'],
    categoryId: 'cat-monitors',
    categoryName: 'Monitors',
    brand: 'DisplayTech',
    featured: false,
    isFeatured: false,
    bestSeller: true,
    isBestSeller: true,
    createdAt: '2026-01-01',
    specifications: {},
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishlistComponent],
      providers: [
        provideRouter([]),
        WishlistService,
        CartService,
        StorageService,
      ],
    }).compileComponents();

    storageService = TestBed.inject(StorageService);
    storageService.removeItem(WISHLIST_STORAGE_KEY);
    storageService.removeItem(CART_STORAGE_KEY);

    cartService = TestBed.inject(CartService);
    cartService.clearCart();

    wishlistService = TestBed.inject(WishlistService);
    wishlistService.clearWishlist();

    fixture = TestBed.createComponent(WishlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    wishlistService.clearWishlist();
    cartService.clearCart();
    storageService.removeItem(WISHLIST_STORAGE_KEY);
    storageService.removeItem(CART_STORAGE_KEY);
  });

  it('should create the wishlist component', () => {
    expect(component).toBeTruthy();
  });

  it('should display empty wishlist state when no items are present', () => {
    expect(component.isEmpty()).toBe(true);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Your Wishlist is Empty');
  });

  it('should render items when products are added to wishlist', () => {
    wishlistService.addToWishlist(mockProductA);
    fixture.detectChanges();

    expect(component.isEmpty()).toBe(false);
    expect(component.count()).toBe(1);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Wireless Earbuds Pro');
  });

  it('should add a single product to cart from wishlist', () => {
    wishlistService.addToWishlist(mockProductA);
    fixture.detectChanges();

    component.addToCart(mockProductA);
    fixture.detectChanges();

    expect(cartService.isInCart(mockProductA.id)).toBe(true);
    expect(cartService.totalItems()).toBe(1);
    expect(component.isInCart(mockProductA.id)).toBe(true);
  });

  it('should move a product to cart and remove from wishlist', () => {
    wishlistService.addToWishlist(mockProductA);
    fixture.detectChanges();

    component.moveToCart(mockProductA);
    fixture.detectChanges();

    expect(cartService.isInCart(mockProductA.id)).toBe(true);
    expect(wishlistService.isInWishlist(mockProductA.id)).toBe(false);
    expect(component.isEmpty()).toBe(true);
  });

  it('should add all products to cart when addAllToCart is called', () => {
    wishlistService.addToWishlist(mockProductA);
    wishlistService.addToWishlist(mockProductB);
    fixture.detectChanges();

    expect(component.count()).toBe(2);

    component.addAllToCart();
    fixture.detectChanges();

    expect(cartService.totalItems()).toBe(2);
    expect(cartService.isInCart(mockProductA.id)).toBe(true);
    expect(cartService.isInCart(mockProductB.id)).toBe(true);
  });

  it('should remove a single product from wishlist', () => {
    wishlistService.addToWishlist(mockProductA);
    wishlistService.addToWishlist(mockProductB);
    fixture.detectChanges();

    component.removeItem(mockProductA.id);
    fixture.detectChanges();

    expect(component.count()).toBe(1);
    expect(wishlistService.isInWishlist(mockProductA.id)).toBe(false);
    expect(wishlistService.isInWishlist(mockProductB.id)).toBe(true);
  });

  it('should clear all items when clearWishlist is called', () => {
    wishlistService.addToWishlist(mockProductA);
    wishlistService.addToWishlist(mockProductB);
    fixture.detectChanges();

    component.clearWishlist();
    fixture.detectChanges();

    expect(component.isEmpty()).toBe(true);
    expect(component.count()).toBe(0);
  });
});
