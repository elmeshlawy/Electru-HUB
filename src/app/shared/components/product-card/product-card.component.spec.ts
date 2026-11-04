import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductCardComponent } from './product-card.component';
import { Product } from '../../../core/models/product.model';

const mockProduct: Product = {
  id: 'test-1',
  name: 'Test Device Pro',
  slug: 'test-device-pro',
  description: 'A test device description',
  shortDescription: 'Short test specs',
  price: 99.99,
  originalPrice: 129.99,
  discountPercentage: 23,
  rating: 4.8,
  reviewCount: 42,
  stock: 10,
  inStock: true,
  sku: 'TEST-001',
  brand: 'TestBrand',
  categoryId: 'cat-laptops',
  categoryName: 'Laptops',
  featuredImage: 'https://example.com/test.jpg',
  images: ['https://example.com/test.jpg'],
  specs: {},
  specifications: {},
  featured: true,
  bestSeller: true,
  createdAt: '2026-01-01',
};

describe('ProductCardComponent', () => {
  let component: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', mockProduct);
    fixture.detectChanges();
  });

  it('should create product card', () => {
    expect(component).toBeTruthy();
  });

  it('should display product name and price', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Test Device Pro');
    expect(el.textContent).toContain('$99.99');
  });

  it('should handle image error with fallback', () => {
    const img = document.createElement('img');
    img.src = 'https://broken-image.com/fake.jpg';
    component.onImageError({ target: img } as any);
    expect(img.src).toContain('svg');
  });
});
