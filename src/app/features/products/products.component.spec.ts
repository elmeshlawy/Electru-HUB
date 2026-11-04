import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductsComponent } from './products.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';

describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;
  let productService: ProductService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsComponent],
      providers: [provideRouter([]), ProductService, CartService, WishlistService],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService);
    fixture.detectChanges();
  });

  it('should create the products catalog component', () => {
    expect(component).toBeTruthy();
  });

  it('should load initial products list with at least 30 products total', () => {
    expect(productService.products().length).toBeGreaterThanOrEqual(30);
    expect(component.totalProductsCount()).toBeGreaterThanOrEqual(30);
  });

  it('should search products by product name and brand', () => {
    component.searchQuery.set('MacBook');
    const filtered = component.allFilteredProducts();
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((p) => p.name.includes('MacBook') || p.brand.includes('MacBook'))).toBe(true);

    component.searchQuery.set('Sony');
    const sonyProducts = component.allFilteredProducts();
    expect(sonyProducts.length).toBeGreaterThan(0);
    expect(
      sonyProducts.every(
        (p) =>
          p.brand.toLowerCase().includes('sony') ||
          p.name.toLowerCase().includes('sony') ||
          p.description.toLowerCase().includes('sony')
      )
    ).toBe(true);
  });

  it('should filter products by category', () => {
    component.onCategorySelect('cat-monitors');
    expect(component.selectedCategory()).toBe('cat-monitors');
    const filtered = component.allFilteredProducts();
    expect(filtered.length).toBe(6);
    expect(filtered.every((p) => p.categoryId === 'cat-monitors')).toBe(true);
  });

  it('should filter products by brand', () => {
    component.onBrandSelect('Apple');
    expect(component.selectedBrand()).toBe('Apple');
    const filtered = component.allFilteredProducts();
    expect(filtered.every((p) => p.brand === 'Apple')).toBe(true);
  });

  it('should filter products by price range', () => {
    component.minPrice.set(500);
    component.maxPrice.set(1500);
    const filtered = component.allFilteredProducts();
    expect(filtered.every((p) => p.price >= 500 && p.price <= 1500)).toBe(true);
  });

  it('should filter products by rating', () => {
    component.onRatingSelect(4.8);
    expect(component.minRating()).toBe(4.8);
    const filtered = component.allFilteredProducts();
    expect(filtered.every((p) => p.rating >= 4.8)).toBe(true);
  });

  it('should sort products by price low to high and high to low', () => {
    component.sortBy.set('price-asc');
    let filtered = component.allFilteredProducts();
    for (let i = 0; i < filtered.length - 1; i++) {
      expect(filtered[i].price).toBeLessThanOrEqual(filtered[i + 1].price);
    }

    component.sortBy.set('price-desc');
    filtered = component.allFilteredProducts();
    for (let i = 0; i < filtered.length - 1; i++) {
      expect(filtered[i].price).toBeGreaterThanOrEqual(filtered[i + 1].price);
    }
  });

  it('should handle pagination correctly', () => {
    component.pageSize.set(9);
    expect(component.currentPage()).toBe(1);
    expect(component.paginatedProducts().length).toBeLessThanOrEqual(9);

    component.nextPage();
    expect(component.currentPage()).toBe(2);

    component.prevPage();
    expect(component.currentPage()).toBe(1);
  });

  it('should compute active filter chips and clear all filters', () => {
    component.selectedCategory.set('cat-laptops');
    component.selectedBrand.set('Dell');
    component.searchQuery.set('OLED');

    expect(component.hasActiveFilters()).toBe(true);
    expect(component.activeFilters().length).toBe(3);

    component.clearAllFilters();
    expect(component.hasActiveFilters()).toBe(false);
    expect(component.selectedCategory()).toBe('');
    expect(component.selectedBrand()).toBe('');
    expect(component.searchQuery()).toBe('');
  });
});
