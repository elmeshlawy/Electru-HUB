import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { StorageService } from '../../core/services/storage.service';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideRouter([]),
        AuthService,
        OrderService,
        WishlistService,
        StorageService,
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    authService.loginAsDemoUser();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    authService.logout();
  });

  it('should create the profile component', () => {
    expect(component).toBeTruthy();
  });

  it('should display user information when authenticated', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Alex Vance');
    expect(compiled.textContent).toContain('alex.vance@electrohub.io');
    expect(compiled.textContent).toContain('Personal Information');
  });

  it('should start editing, update form, and save changes', () => {
    component.startEditing();
    fixture.detectChanges();
    expect(component.isEditing()).toBe(true);

    component.profileForm.patchValue({
      firstName: 'Alexander',
      phone: '+1 (555) 777-9999',
    });

    component.saveProfile();
    fixture.detectChanges();

    expect(component.isEditing()).toBe(false);
    expect(authService.currentUser()?.firstName).toBe('Alexander');
    expect(authService.currentUser()?.phone).toBe('+1 (555) 777-9999');
    expect(component.successMessage()).toBeTruthy();
  });

  it('should cancel editing mode without saving uncommitted changes', () => {
    component.startEditing();
    component.profileForm.patchValue({ firstName: 'ShouldNotSave' });

    component.cancelEditing();
    expect(component.isEditing()).toBe(false);
    expect(authService.currentUser()?.firstName).toBe('Alex');
  });

  it('should log out and navigate to login page', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onLogout();

    expect(authService.isAuthenticated()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
  });
});
