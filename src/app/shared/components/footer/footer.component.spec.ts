import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FooterComponent } from './footer.component';
import { ProductService } from '../../../core/services/product.service';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [provideRouter([]), ProductService],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the footer component', () => {
    expect(component).toBeTruthy();
  });

  it('should display brand name, current year, and categories', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('ElectroHub');
    expect(compiled.textContent).toContain(component.currentYear.toString());
    expect(compiled.textContent).toContain('Categories');
  });

  it('should handle newsletter subscription on submit', () => {
    component.newsletterEmail = 'alex@example.com';
    const mockEvent = { preventDefault: vi.fn() } as unknown as Event;

    component.onSubscribeNewsletter(mockEvent);
    expect(component.newsletterSubscribed).toBe(true);
    expect(component.newsletterEmail).toBe('');
  });
});
