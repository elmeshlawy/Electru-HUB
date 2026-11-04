import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';
import { StorageService } from '../../../core/services/storage.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([]), AuthService, StorageService],
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    authService.logout();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    authService.logout();
  });

  it('should create the register component', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    expect(component.registerForm.valid).toBe(false);
  });

  it('should validate full name, email, and password minimum length', () => {
    const nameCtrl = component.registerForm.get('fullName');
    const emailCtrl = component.registerForm.get('email');
    const pwCtrl = component.registerForm.get('password');

    nameCtrl?.setValue('Al');
    expect(nameCtrl?.hasError('minlength')).toBe(true);

    nameCtrl?.setValue('Alex Vance');
    expect(nameCtrl?.hasError('minlength')).toBe(false);

    emailCtrl?.setValue('not-an-email');
    expect(emailCtrl?.hasError('email')).toBe(true);

    emailCtrl?.setValue('user@example.com');
    expect(emailCtrl?.hasError('email')).toBe(false);

    pwCtrl?.setValue('short');
    expect(pwCtrl?.hasError('minlength')).toBe(true);

    pwCtrl?.setValue('LongEnough2026!');
    expect(pwCtrl?.hasError('minlength')).toBe(false);
  });

  it('should enforce password matching validation', () => {
    component.registerForm.patchValue({
      password: 'SecurePassword123!',
      confirmPassword: 'DifferentPassword456!',
    });

    expect(component.registerForm.hasError('passwordMismatch')).toBe(true);

    component.registerForm.patchValue({
      confirmPassword: 'SecurePassword123!',
    });

    expect(component.registerForm.hasError('passwordMismatch')).toBe(false);
  });

  it('should require terms acceptance', () => {
    const termsCtrl = component.registerForm.get('acceptTerms');
    expect(termsCtrl?.valid).toBe(false);

    termsCtrl?.setValue(true);
    expect(termsCtrl?.valid).toBe(true);
  });

  it('should toggle password and confirm password visibility', () => {
    expect(component.showPassword()).toBe(false);
    component.togglePasswordVisibility();
    expect(component.showPassword()).toBe(true);

    expect(component.showConfirmPassword()).toBe(false);
    component.toggleConfirmPasswordVisibility();
    expect(component.showConfirmPassword()).toBe(true);
  });

  it('should submit registration and navigate to profile upon valid input', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.registerForm.setValue({
      fullName: 'Gordon Freeman',
      email: 'gordon.freeman@blackmesa.gov',
      password: 'CrowbarPassword2026!',
      confirmPassword: 'CrowbarPassword2026!',
      acceptTerms: true,
    });

    expect(component.registerForm.valid).toBe(true);
    component.onSubmit();

    expect(authService.isAuthenticated()).toBe(true);
    expect(authService.currentUser()?.firstName).toBe('Gordon');
    expect(navigateSpy).toHaveBeenCalledWith(['/profile']);
  });

  it('should display error message when trying to register already existing email', () => {
    component.registerForm.setValue({
      fullName: 'Alex Vance Duplicate',
      email: 'alex.vance@electrohub.io', // Pre-seeded
      password: 'ValidPassword123!',
      confirmPassword: 'ValidPassword123!',
      acceptTerms: true,
    });

    component.onSubmit();
    expect(component.errorMessage()).toContain('already exists');
  });
});
