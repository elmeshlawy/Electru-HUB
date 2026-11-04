import { TestBed } from '@angular/core/testing';
import { WishlistService, WISHLIST_STORAGE_KEY } from './wishlist.service';
import { CartService, CART_STORAGE_KEY } from './cart.service';
import { StorageService } from './storage.service';
import { Product } from '../models/product.model';

describe('WishlistService', () => {
  let service: WishlistService;
  let cartService: CartService;
  let storageService: StorageService;

  const mockProductA: Product = {
    id: 'prod-laptop-1',
    name: 'Flagship Laptop Pro',
    slug: 'flagship-laptop-pro',
    description: 'High-end laptop',
    price: 1999,
    rating: 4.9,
    reviewCount: 30,
    stock: 8,
    inStock: true,
    featuredImage: 'https://example.com/laptop.jpg',
    images: [],
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
    id: 'prod-watch-1',
    name: 'Smart Watch Series 9',
    slug: 'smart-watch-series-9',
    description: 'Fitness smartwatch',
    price: 399,
    rating: 4.7,
    reviewCount: 15,
    stock: 12,
    inStock: true,
    featuredImage: 'https://example.com/watch.jpg',
    images: [],
    categoryId: 'cat-smartwatches',
    categoryName: 'Smart Watches',
    brand: 'WearTech',
    featured: false,
    isFeatured: false,
    bestSeller: true,
    isBestSeller: true,
    createdAt: '2026-01-01',
    specifications: {},
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WishlistService, CartService, StorageService],
    });

    storageService = TestBed.inject(StorageService);
    storageService.removeItem(WISHLIST_STORAGE_KEY);
    storageService.removeItem(CART_STORAGE_KEY);

    cartService = TestBed.inject(CartService);
    cartService.clearCart();

    service = TestBed.inject(WishlistService);
    service.clearWishlist();
  });

  afterEach(() => {
    service.clearWishlist();
    cartService.clearCart();
    storageService.removeItem(WISHLIST_STORAGE_KEY);
    storageService.removeItem(CART_STORAGE_KEY);
  });

  it('should initialize with empty wishlist', () => {
    expect(service.items().length).toBe(0);
    expect(service.wishlistItems().length).toBe(0);
    expect(service.count()).toBe(0);
    expect(service.wishlistCount()).toBe(0);
    expect(service.isEmpty()).toBe(true);
  });

  it('should add product to wishlist and update wishlist count', () => {
    const success = service.addToWishlist(mockProductA);
    expect(success).toBe(true);
    expect(service.wishlistItems().length).toBe(1);
    expect(service.wishlistCount()).toBe(1);
    expect(service.isInWishlist(mockProductA.id)).toBe(true);
    expect(service.isEmpty()).toBe(false);
  });

  it('should strictly prevent adding duplicate products to wishlist', () => {
    service.addToWishlist(mockProductA);
    expect(service.wishlistCount()).toBe(1);

    // Try adding the same product again
    const secondAdd = service.addToWishlist(mockProductA);
    expect(secondAdd).toBe(false);
    expect(service.wishlistCount()).toBe(1);
    expect(service.wishlistItems().length).toBe(1);
  });

  it('should remove product from wishlist by ID', () => {
    service.addToWishlist(mockProductA);
    service.addToWishlist(mockProductB);
    expect(service.wishlistCount()).toBe(2);

    service.removeFromWishlist(mockProductA.id);
    expect(service.wishlistCount()).toBe(1);
    expect(service.isInWishlist(mockProductA.id)).toBe(false);
    expect(service.isInWishlist(mockProductB.id)).toBe(true);
  });

  it('should toggle wishlist status correctly (adds if absent, removes if present)', () => {
    const added = service.toggleWishlist(mockProductA);
    expect(added).toBe(true);
    expect(service.isInWishlist(mockProductA.id)).toBe(true);

    const removed = service.toggleWishlist(mockProductA);
    expect(removed).toBe(false);
    expect(service.isInWishlist(mockProductA.id)).toBe(false);
  });

  it('should add a wishlist product to cart', () => {
    service.addToWishlist(mockProductA);
    const addedToCart = service.moveToCart(mockProductA, 1, false);

    expect(addedToCart).toBe(true);
    expect(cartService.isInCart(mockProductA.id)).toBe(true);
    expect(service.isInWishlist(mockProductA.id)).toBe(true); // Kept because removeAfterAdd was false
  });

  it('should move product to cart and remove from wishlist when requested', () => {
    service.addToWishlist(mockProductA);
    const moved = service.moveToCart(mockProductA, 1, true);

    expect(moved).toBe(true);
    expect(cartService.isInCart(mockProductA.id)).toBe(true);
    expect(service.isInWishlist(mockProductA.id)).toBe(false); // Removed from wishlist
  });

  it('should add all in-stock products to cart', () => {
    service.addToWishlist(mockProductA);
    service.addToWishlist(mockProductB);

    const countAdded = service.addAllToCart(false);
    expect(countAdded).toBe(2);
    expect(cartService.totalItems()).toBe(2);
    expect(cartService.isInCart(mockProductA.id)).toBe(true);
    expect(cartService.isInCart(mockProductB.id)).toBe(true);
  });

  it('should clear all products from wishlist', () => {
    service.addToWishlist(mockProductA);
    service.addToWishlist(mockProductB);
    expect(service.wishlistCount()).toBe(2);

    service.clearWishlist();
    expect(service.wishlistCount()).toBe(0);
    expect(service.isEmpty()).toBe(true);
  });

  it('should persist wishlist to LocalStorage and load saved items on start', () => {
    service.addToWishlist(mockProductA);

    const saved = storageService.getItem<Product[]>(WISHLIST_STORAGE_KEY);
    expect(saved).toBeTruthy();
    expect(saved?.length).toBe(1);
    expect(saved?.[0].id).toBe(mockProductA.id);

    service.loadFromStorage();
    expect(service.wishlistCount()).toBe(1);
  });
});
