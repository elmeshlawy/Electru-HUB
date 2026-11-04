import { Injectable, computed, inject, signal } from '@angular/core';
import { User } from '../models/user.model';
import { Address } from '../models/address.model';
import { StorageService } from './storage.service';

const USER_SESSION_KEY = 'electrohub_auth_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storage = inject(StorageService);

  private readonly _currentUser = signal<User | null>(null);

  // Readonly signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    const savedUser = this.storage.getItem<User>(USER_SESSION_KEY);
    if (savedUser) {
      this._currentUser.set(savedUser);
    } else {
      // Initialize with a mock guest user profile for easy demonstration
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
      this._currentUser.set(demoUser);
      this.storage.setItem(USER_SESSION_KEY, demoUser);
    }
  }

  /**
   * Mock login with email and password
   */
  login(email: string): boolean {
    const user: User = {
      id: `user-${Date.now()}`,
      email,
      firstName: email.split('@')[0],
      lastName: 'Member',
      role: 'customer',
      addresses: [],
      createdAt: new Date().toISOString(),
    };
    this._currentUser.set(user);
    this.storage.setItem(USER_SESSION_KEY, user);
    return true;
  }

  /**
   * Mock registration
   */
  register(firstName: string, lastName: string, email: string): boolean {
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      firstName,
      lastName,
      role: 'customer',
      addresses: [],
      createdAt: new Date().toISOString(),
    };
    this._currentUser.set(newUser);
    this.storage.setItem(USER_SESSION_KEY, newUser);
    return true;
  }

  /**
   * Log out and clear session
   */
  logout(): void {
    this._currentUser.set(null);
    this.storage.removeItem(USER_SESSION_KEY);
  }

  /**
   * Update current user profile
   */
  updateProfile(updates: Partial<User>): void {
    const current = this._currentUser();
    if (!current) return;

    const updated: User = { ...current, ...updates };
    this._currentUser.set(updated);
    this.storage.setItem(USER_SESSION_KEY, updated);
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
