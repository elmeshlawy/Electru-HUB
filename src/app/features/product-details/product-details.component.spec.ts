import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { ProductDetailsComponent } from './product-details.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';

describe('ProductDetailsComponent', () => {
  let component: ProductDetailsComponent;
  let fixture: ComponentFixture<ProductDetailsComponent>;
  let cartService: CartService;
  let wishlistService: WishlistService;

  const mockActivatedRoute = {
    paramMap: of(convertToParamMap({ id: 'prod-macbook-pro-16' })),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetailsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        ProductService,
        CartService,
        WishlistService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailsComponent);
    component = fixture.componentInstance;
    cartService = TestBed.inject(CartService);
    wishlistService = TestBed.inject(WishlistService);
    fixture.detectChanges();
  });

  it('should create product details component and load product', () => {
    expect(component).toBeTruthy();
    expect(component.product()).toBeDefined();
    expect(component.product()?.id).toBe('prod-macbook-pro-16');
  });

  it('should load image gallery, specifications, and related products', () => {
    expect(component.productImages().length).toBeGreaterThan(1);
    expect(component.specEntries().length).toBeGreaterThan(0);
    expect(component.relatedProducts().length).toBeGreaterThan(0);
  });

  it('should change selected thumbnail image', () => {
    expect(component.selectedImageIndex()).toBe(0);
    component.selectImage(1);
    expect(component.selectedImageIndex()).toBe(1);
  });

  it('should handle quantity increment and decrement safely', () => {
    expect(component.quantity()).toBe(1);
    component.incrementQuantity();
    expect(component.quantity()).toBe(2);
    component.decrementQuantity();
    expect(component.quantity()).toBe(1);
    component.decrementQuantity();
    expect(component.quantity()).toBe(1); // Cannot go below 1
  });

  it('should add product to cart with chosen quantity', () => {
    const initialCount = cartService.totalItems();
    component.quantity.set(2);
    component.onAddToCart();
    expect(cartService.totalItems()).toBe(initialCount + 2);
    expect(component.addedToast()).toBe(true);
  });

  it('should submit customer review and append to reviews list', () => {
    const initialReviewCount = component.reviews().length;
    component.newReviewerName.set('Jordan Lee');
    component.newReviewRating.set(5);
    component.newReviewTitle.set('Best laptop on the market');
    component.newReviewComment.set('Blown away by the screen quality and silent thermal design.');

    const fakeEvent = new Event('submit');
    component.onSubmitReview(fakeEvent);

    expect(component.reviewSubmitted()).toBe(true);
    expect(component.reviews().length).toBe(initialReviewCount + 1);
  });

  it('should display proper not-found state when product ID is invalid', () => {
    component.productId.set('invalid-nonexistent-id-999');
    fixture.detectChanges();

    expect(component.product()).toBeUndefined();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Product Not Found');
  });
});
