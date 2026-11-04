import { TestBed } from '@angular/core/testing';
import { AuthService, USER_SESSION_KEY, USERS_STORAGE_KEY } from './auth.service';
import { StorageService } from './storage.service';

describe('AuthService', () => {
  let service: AuthService;
  let storageService: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, StorageService],
    });

    storageService = TestBed.inject(StorageService);
    storageService.removeItem(USER_SESSION_KEY);
    storageService.removeItem(USERS_STORAGE_KEY);

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    service.logout();
    storageService.removeItem(USER_SESSION_KEY);
    storageService.removeItem(USERS_STORAGE_KEY);
  });

  it('should initialize with default demo user in registry and unauthenticated session if none saved', () => {
    // Session was cleared before test
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.authStatus()).toBe('unauthenticated');
    expect(service.isAdmin()).toBe(false);
  });

  it('should log in successfully with valid demo credentials', () => {
    const result = service.login('alex.vance@electrohub.io', 'TechSecure2026!');
    expect(result.success).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.email).toBe('alex.vance@electrohub.io');
    expect(service.authStatus()).toBe('authenticated');

    // Verify session was saved
    const saved = storageService.getItem<any>(USER_SESSION_KEY);
    expect(saved).toBeTruthy();
    expect(saved.email).toBe('alex.vance@electrohub.io');
    expect((saved as any).password).toBeUndefined(); // Plain password never saved
  });

  it('should reject login with wrong password', () => {
    const result = service.login('alex.vance@electrohub.io', 'WrongPassword123!');
    expect(result.success).toBe(false);
    expect(result.message).toContain('Invalid password');
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should reject login with non-existent email', () => {
    const result = service.login('nobody@unknown.com', 'SomePassword123!');
    expect(result.success).toBe(false);
    expect(result.message).toContain('No account found');
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should log in using loginAsDemoUser helper', () => {
    const result = service.loginAsDemoUser();
    expect(result.success).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.firstName).toBe('Alex');
  });

  it('should register a new user without storing plain-text passwords', () => {
    const regResult = service.register({
      fullName: 'Sarah Connor',
      email: 'sarah.connor@cyberdyne.io',
      password: 'Terminator2026!',
      phone: '+1 (555) 987-6543',
    });

    expect(regResult.success).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.firstName).toBe('Sarah');
    expect(service.currentUser()?.lastName).toBe('Connor');
    expect(service.currentUser()?.email).toBe('sarah.connor@cyberdyne.io');

    // Verify user registry has record with hashed password, not plain text
    const records = storageService.getItem<any[]>(USERS_STORAGE_KEY) || [];
    const registered = records.find((r) => r.user.email === 'sarah.connor@cyberdyne.io');
    expect(registered).toBeTruthy();
    expect(registered.passwordHash).toBeDefined();
    expect(registered.passwordHash).not.toBe('Terminator2026!');
    expect((registered.user as any).password).toBeUndefined();
  });

  it('should prevent registering an email that already exists', () => {
    const result = service.register({
      fullName: 'Alex Vance Duplicate',
      email: 'alex.vance@electrohub.io', // Already seeded
      password: 'SomeNewPassword123!',
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('already exists');
  });

  it('should log out and clear active session', () => {
    service.loginAsDemoUser();
    expect(service.isAuthenticated()).toBe(true);

    service.logout();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(storageService.getItem(USER_SESSION_KEY)).toBeNull();
  });

  it('should update current user profile', () => {
    service.loginAsDemoUser();
    const updateRes = service.updateProfile({
      firstName: 'Alexander',
      phone: '+1 (555) 111-2222',
    });

    expect(updateRes.success).toBe(true);
    expect(service.currentUser()?.firstName).toBe('Alexander');
    expect(service.currentUser()?.phone).toBe('+1 (555) 111-2222');

    // Verify session in storage updated
    const saved = storageService.getItem<any>(USER_SESSION_KEY);
    expect(saved.firstName).toBe('Alexander');
  });

  it('should add and remove delivery addresses', () => {
    service.loginAsDemoUser();
    const initialAddressCount = service.currentUser()?.addresses.length || 0;

    service.addAddress({
      fullName: 'Alex Vance Work',
      streetAddress: '100 Silicon Way',
      city: 'San Jose',
      stateOrProvince: 'CA',
      postalCode: '95110',
      country: 'United States',
      phoneNumber: '+1 (555) 999-8888',
    });

    expect(service.currentUser()?.addresses.length).toBe(initialAddressCount + 1);
    const addedId = service.currentUser()!.addresses[service.currentUser()!.addresses.length - 1].id;

    service.removeAddress(addedId);
    expect(service.currentUser()?.addresses.length).toBe(initialAddressCount);
  });
});
