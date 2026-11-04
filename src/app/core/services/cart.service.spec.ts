import { TestBed } from '@angular/core/testing';
import { CartService, FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE, CART_STORAGE_KEY } from './cart.service';
import { StorageService } from './storage.service';
import { Product } from '../models/product.model';

describe('CartService', () => {
  let service: CartService;
  let storageService: StorageService;

  const mockProductA: Product = {
    id: 'prod-test-a',
    name: 'Flagship Laptop Pro',
    slug: 'flagship-laptop-pro',
    description: 'High-end laptop',
    price: 100,
    originalPrice: 120,
    discountPercentage: 16,
    rating: 4.8,
    reviewCount: 42,
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

  const mockProductB: Product = {
    id: 'prod-test-b',
    name: 'Wireless Headphones',
    slug: 'wireless-headphones',
    description: 'Noise cancelling headphones',
    price: 60,
    rating: 4.5,
    reviewCount: 20,
    stock: 10,
    inStock: true,
    featuredImage: 'https://example.com/headphones.jpg',
    images: ['https://example.com/headphones.jpg'],
    categoryId: 'cat-headphones',
    categoryName: 'Headphones',
    brand: 'AudioBrand',
    featured: false,
    isFeatured: false,
    bestSeller: true,
    isBestSeller: true,
    createdAt: '2026-01-01',
    specifications: {},
  };

  const mockOutOfStockProduct: Product = {
    id: 'prod-out-of-stock',
    name: 'Rare Vintage Device',
    slug: 'rare-vintage-device',
    description: 'Out of stock item',
    price: 200,
    rating: 4.0,
    reviewCount: 5,
    stock: 0,
    inStock: false,
    featuredImage: 'https://example.com/vintage.jpg',
    images: [],
    categoryId: 'cat-accessories',
    categoryName: 'Accessories',
    brand: 'VintageBrand',
    featured: false,
    isFeatured: false,
    bestSeller: false,
    isBestSeller: false,
    createdAt: '2026-01-01',
    specifications: {},
  };

  beforeEach(() => {
    // Clear storage before each test
    TestBed.configureTestingModule({
      providers: [CartService, StorageService],
    });

    storageService = TestBed.inject(StorageService);
    storageService.removeItem(CART_STORAGE_KEY);

    service = TestBed.inject(CartService);
    service.clearCart();
  });

  afterEach(() => {
    service.clearCart();
    storageService.removeItem(CART_STORAGE_KEY);
  });

  it('should initialize with an empty cart and correct computed defaults', () => {
    expect(service.items().length).toBe(0);
    expect(service.cartItems().length).toBe(0);
    expect(service.totalItems()).toBe(0);
    expect(service.subtotal()).toBe(0);
    expect(service.shipping()).toBe(0);
    expect(service.totalPrice()).toBe(0);
    expect(service.isEmpty()).toBe(true);
  });

  it('should add products to cart and calculate correct items and subtotal', () => {
    const success = service.addToCart(mockProductA, 2);
    expect(success).toBe(true);
    expect(service.cartItems().length).toBe(1);
    expect(service.totalItems()).toBe(2);
    expect(service.subtotal()).toBe(200);
    expect(service.isInCart(mockProductA.id)).toBe(true);
    expect(service.getItemQuantity(mockProductA.id)).toBe(2);
  });

  it('should increment quantity when adding an existing product without creating duplicates', () => {
    service.addToCart(mockProductA, 1);
    expect(service.cartItems().length).toBe(1);
    expect(service.totalItems()).toBe(1);

    // Add same product again
    const success = service.addToCart(mockProductA, 2);
    expect(success).toBe(true);
    expect(service.cartItems().length).toBe(1); // No duplicate
    expect(service.totalItems()).toBe(3);
    expect(service.subtotal()).toBe(300);
  });

  it('should prevent adding out of stock products', () => {
    const success = service.addToCart(mockOutOfStockProduct, 1);
    expect(success).toBe(false);
    expect(service.cartItems().length).toBe(0);
    expect(service.totalItems()).toBe(0);
  });

  it('should prevent adding invalid quantities (<= 0 or NaN)', () => {
    const resZero = service.addToCart(mockProductA, 0);
    const resNeg = service.addToCart(mockProductA, -3);
    expect(resZero).toBe(false);
    expect(resNeg).toBe(false);
    expect(service.cartItems().length).toBe(0);
  });

  it('should not allow quantity to exceed available stock', () => {
    // mockProductA stock is 5
    service.addToCart(mockProductA, 4);
    expect(service.getItemQuantity(mockProductA.id)).toBe(4);

    // Trying to add 2 more should fail or clamp to 5
    const secondAdd = service.addToCart(mockProductA, 2);
    expect(service.getItemQuantity(mockProductA.id)).toBe(5);

    // Trying to add when already at 5 should return false
    const thirdAdd = service.addToCart(mockProductA, 1);
    expect(thirdAdd).toBe(false);
    expect(service.getItemQuantity(mockProductA.id)).toBe(5);
  });

  it('should increase and decrease quantity properly', () => {
    service.addToCart(mockProductA, 2);
    const cartItemId = service.cartItems()[0].id;

    // Increase
    const incRes = service.increaseQuantity(cartItemId);
    expect(incRes).toBe(true);
    expect(service.getItemQuantity(mockProductA.id)).toBe(3);

    // Decrease
    const decRes = service.decreaseQuantity(cartItemId);
    expect(decRes).toBe(true);
    expect(service.getItemQuantity(mockProductA.id)).toBe(2);
  });

  it('should respect minimum quantity of 1 when decreasing without removeOnZero', () => {
    service.addToCart(mockProductA, 1);
    const cartItemId = service.cartItems()[0].id;

    const decRes = service.decreaseQuantity(cartItemId, false);
    expect(decRes).toBe(false);
    expect(service.getItemQuantity(mockProductA.id)).toBe(1);
    expect(service.cartItems().length).toBe(1);
  });

  it('should remove item when decreasing with removeOnZero = true and quantity is 1', () => {
    service.addToCart(mockProductA, 1);
    const cartItemId = service.cartItems()[0].id;

    const decRes = service.decreaseQuantity(cartItemId, true);
    expect(decRes).toBe(true);
    expect(service.cartItems().length).toBe(0);
    expect(service.isEmpty()).toBe(true);
  });

  it('should remove products by cartItemId or productId', () => {
    service.addToCart(mockProductA, 1);
    service.addToCart(mockProductB, 2);
    expect(service.cartItems().length).toBe(2);

    service.removeFromCart(mockProductA.id);
    expect(service.cartItems().length).toBe(1);
    expect(service.isInCart(mockProductA.id)).toBe(false);
    expect(service.isInCart(mockProductB.id)).toBe(true);
  });

  it('should clear cart completely', () => {
    service.addToCart(mockProductA, 1);
    service.addToCart(mockProductB, 1);
    expect(service.cartItems().length).toBe(2);

    service.clearCart();
    expect(service.cartItems().length).toBe(0);
    expect(service.totalItems()).toBe(0);
    expect(service.subtotal()).toBe(0);
    expect(service.isEmpty()).toBe(true);
  });

  it('should calculate standard shipping when subtotal < threshold, and free shipping when subtotal >= threshold', () => {
    // 1 item of $100 -> subtotal = 100 < 150 threshold
    service.addToCart(mockProductA, 1);
    expect(service.subtotal()).toBe(100);
    expect(service.shipping()).toBe(STANDARD_SHIPPING_FEE);

    // Total = subtotal (100) + shipping (15) + tax (8) = 123
    expect(service.tax()).toBe(8);
    expect(service.totalPrice()).toBe(123);

    // Add another item of $60 -> subtotal = 160 >= 150 threshold
    service.addToCart(mockProductB, 1);
    expect(service.subtotal()).toBe(160);
    expect(service.shipping()).toBe(0); // Free shipping unlocked
    // Total = subtotal (160) + shipping (0) + tax (12.80) = 172.8
    expect(service.totalPrice()).toBe(172.8);
  });

  it('should persist items to LocalStorage and load saved items on start', () => {
    service.addToCart(mockProductA, 2);

    // Verify storage has saved the item
    const saved = storageService.getItem<any[]>(CART_STORAGE_KEY);
    expect(saved).toBeTruthy();
    expect(saved?.length).toBe(1);
    expect(saved?.[0].productId).toBe(mockProductA.id);
    expect(saved?.[0].quantity).toBe(2);

    // Test loadFromStorage
    service.loadFromStorage();
    expect(service.totalItems()).toBe(2);
  });
});
