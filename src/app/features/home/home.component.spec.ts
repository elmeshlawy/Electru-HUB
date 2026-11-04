import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([]), ProductService, CartService],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the home component', () => {
    expect(component).toBeTruthy();
  });

  it('should render all 6 categories from ProductService', () => {
    expect(component.categories().length).toBe(6);
  });

  it('should submit newsletter and update state', () => {
    component.newsletterEmail.set('user@example.com');
    const fakeEvent = new Event('submit');
    component.onNewsletterSubmit(fakeEvent);
    expect(component.newsletterSubmitted()).toBe(true);
  });
});
