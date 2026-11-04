import { Injectable, computed, inject, signal } from '@angular/core';
import { User } from '../models/user.model';
import { Address } from '../models/address.model';
import { StorageService } from './storage.service';

export const USER_SESSION_KEY = 'electrohub_auth_user';
export const USERS_STORAGE_KEY = 'electrohub_mock_users';

interface StoredUserRecord {
  user: User;
  passwordHash: string;
}

/**
 * Deterministic pseudo-hash with salt for frontend mock authentication.
 * Never stores plain-text passwords in LocalStorage.
 */
function mockHashPassword(password: string): string {
  const salt = 'eh_secure_salt_v2026_';
  let hash = 0;
  const input = salt + password;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'eh_hash_' + Math.abs(hash).toString(16);
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storage = inject(StorageService);

  private readonly _currentUser = signal<User | null>(null);

  // Readonly signals for reactive state management
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly authStatus = computed<'authenticated' | 'unauthenticated'>(() =>
    this._currentUser() ? 'authenticated' : 'unauthenticated'
  );
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');

  constructor() {
    this.seedDefaultUsers();
    this.restoreSession();

    // Listen for cross-tab session synchronization
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('storage', (event: StorageEvent) => {
        if (event.key === USER_SESSION_KEY) {
          this.restoreSession();
        }
      });
    }
  }

  /**
   * Seeds demo accounts into the mock user registry if not already present
   */
  private seedDefaultUsers(): void {
    const existing = this.storage.getItem<StoredUserRecord[]>(USERS_STORAGE_KEY);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      const demoUser: User = {
        id: 'user-demo-001',
        email: 'alex.vance@electrohub.io',
        firstName: 'Alex',
        lastName: 'Vance',
        role: 'customer',
        phone: '+1 (555) 019-2834',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        addresses: [
          {
            id: 'addr-1',
            fullName: 'Alex Vance',
            streetAddress: '742 Evergreen Terrace',
            apartmentOrSuite: 'Suite 4B',
            city: 'San Francisco',
            stateOrProvince: 'CA',
            postalCode: '94107',
            country: 'United States',
            phoneNumber: '+1 (555) 019-2834',
            isDefaultShipping: true,
            isDefaultBilling: true,
          },
        ],
        createdAt: '2026-01-01T00:00:00Z',
      };

      const records: StoredUserRecord[] = [
        {
          user: demoUser,
          passwordHash: mockHashPassword('TechSecure2026!'),
        },
      ];
      this.storage.setItem(USERS_STORAGE_KEY, records);
    }
  }

  /**
   * Restores active user session from LocalStorage
   */
  restoreSession(): void {
    const savedUser = this.storage.getItem<User>(USER_SESSION_KEY);
    if (savedUser && savedUser.id && savedUser.email) {
      this._currentUser.set(savedUser);
    } else {
      this._currentUser.set(null);
    }
  }

  /**
   * Retrieves current authenticated user
   */
  getCurrentUser(): User | null {
    return this._currentUser();
  }

  /**
   * Mock login with email and password
   */
  login(email: string, password = ''): { success: boolean; message?: string } {
    if (!email || !email.trim()) {
      return { success: false, message: 'Email address is required.' };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const records = this.storage.getItem<StoredUserRecord[]>(USERS_STORAGE_KEY) || [];
    const match = records.find((r) => r.user.email.toLowerCase() === normalizedEmail);

    if (!match) {
      return {
        success: false,
        message: 'No account found with this email address. Please register.',
      };
    }

    if (password) {
      const inputHash = mockHashPassword(password);
      if (inputHash !== match.passwordHash) {
        return {
          success: false,
          message: 'Invalid password. Please check your credentials.',
        };
      }
    }

    // Set active session (never storing the password on the user session object)
    this._currentUser.set(match.user);
    this.storage.setItem(USER_SESSION_KEY, match.user);
    return { success: true };
  }

  /**
   * Convenience helper to sign in as the seeded demo user immediately
   */
  loginAsDemoUser(): { success: boolean } {
    return this.login('alex.vance@electrohub.io', 'TechSecure2026!');
  }

  /**
   * Mock user registration with password hashing
   */
  register(data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
  }): { success: boolean; message?: string } {
    const { fullName, email, password, phone } = data;

    if (!fullName || !fullName.trim()) {
      return { success: false, message: 'Full name is required.' };
    }
    if (!email || !email.trim()) {
      return { success: false, message: 'Email is required.' };
    }
    if (!password || password.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long.' };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const records = this.storage.getItem<StoredUserRecord[]>(USERS_STORAGE_KEY) || [];
    const exists = records.some((r) => r.user.email.toLowerCase() === normalizedEmail);

    if (exists) {
      return {
        success: false,
        message: 'An account with this email address already exists. Please sign in.',
      };
    }

    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Member';
    const lastName = nameParts.slice(1).join(' ') || '';

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: normalizedEmail,
      firstName,
      lastName,
      role: 'customer',
      phone: phone?.trim(),
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0284c7&color=fff`,
      addresses: [],
      createdAt: new Date().toISOString(),
    };

    const newRecord: StoredUserRecord = {
      user: newUser,
      passwordHash: mockHashPassword(password),
    };

    // Save into registered users registry
    records.push(newRecord);
    this.storage.setItem(USERS_STORAGE_KEY, records);

    // Auto sign in upon successful registration
    this._currentUser.set(newUser);
    this.storage.setItem(USER_SESSION_KEY, newUser);

    return { success: true };
  }

  /**
   * Log out and clear active session
   */
  logout(): void {
    this._currentUser.set(null);
    this.storage.removeItem(USER_SESSION_KEY);
  }

  /**
   * Update current user profile
   */
  updateProfile(updates: Partial<User>): { success: boolean; message?: string } {
    const current = this._currentUser();
    if (!current) {
      return { success: false, message: 'User is not authenticated.' };
    }

    const updatedUser: User = {
      ...current,
      ...updates,
      id: current.id, // Immutable ID
    };

    this._currentUser.set(updatedUser);
    this.storage.setItem(USER_SESSION_KEY, updatedUser);

    // Update in user registry as well
    const records = this.storage.getItem<StoredUserRecord[]>(USERS_STORAGE_KEY) || [];
    const index = records.findIndex((r) => r.user.id === current.id);
    if (index > -1) {
      records[index] = {
        ...records[index],
        user: updatedUser,
      };
      this.storage.setItem(USERS_STORAGE_KEY, records);
    }

    return { success: true };
  }

  /**
   * Add a new shipping/billing address
   */
  addAddress(address: Omit<Address, 'id'>): void {
    const current = this._currentUser();
    if (!current) return;

    const newAddress: Address = {
      ...address,
      id: `addr-${Date.now()}`,
    };

    const updatedAddresses = [...current.addresses, newAddress];
    this.updateProfile({ addresses: updatedAddresses });
  }

  /**
   * Remove an address by ID
   */
  removeAddress(addressId: string): void {
    const current = this._currentUser();
    if (!current) return;

    const updatedAddresses = current.addresses.filter((a) => a.id !== addressId);
    this.updateProfile({ addresses: updatedAddresses });
  }
}
