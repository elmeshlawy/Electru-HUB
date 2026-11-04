import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { StorageService } from '../../../core/services/storage.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        AuthService,
        StorageService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: { returnUrl: '/checkout' },
            },
          },
        },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    authService.logout();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    authService.logout();
  });

  it('should create the login component', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    expect(component.loginForm.valid).toBe(false);
  });

  it('should validate email format and required password', () => {
    const emailControl = component.loginForm.get('email');
    const passwordControl = component.loginForm.get('password');

    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@example.com');
    expect(emailControl?.hasError('email')).toBe(false);

    passwordControl?.setValue('123'); // < 6 chars
    expect(passwordControl?.hasError('minlength')).toBe(true);

    passwordControl?.setValue('123456');
    expect(passwordControl?.hasError('minlength')).toBe(false);
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword()).toBe(false);
    component.togglePasswordVisibility();
    expect(component.showPassword()).toBe(true);
    component.togglePasswordVisibility();
    expect(component.showPassword()).toBe(false);
  });

  it('should fill demo credentials when fillDemoCredentials is clicked', () => {
    component.fillDemoCredentials();
    expect(component.loginForm.value.email).toBe('alex.vance@electrohub.io');
    expect(component.loginForm.value.password).toBe('TechSecure2026!');
    expect(component.loginForm.valid).toBe(true);
  });

  it('should log in and navigate to returnUrl on valid credentials', () => {
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');
    component.fillDemoCredentials();
    component.onSubmit();

    expect(authService.isAuthenticated()).toBe(true);
    expect(navigateSpy).toHaveBeenCalledWith('/checkout');
  });

  it('should display error message on invalid login credentials', () => {
    component.loginForm.setValue({
      email: 'nonexistent@unknown.com',
      password: 'WrongPassword123!',
    });

    component.onSubmit();
    expect(authService.isAuthenticated()).toBe(false);
    expect(component.errorMessage()).toBeTruthy();
  });

  it('should sign in directly with one-click demo account helper', () => {
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');
    component.loginWithDemoAccount();

    expect(authService.isAuthenticated()).toBe(true);
    expect(navigateSpy).toHaveBeenCalledWith('/checkout');
  });
});
