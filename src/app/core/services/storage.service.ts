import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly fallbackMemory = new Map<string, string>();

  /**
   * Retrieves an item from storage and deserializes JSON
   */
  getItem<T>(key: string): T | null {
    try {
      let raw: string | null = null;
      if (this.isBrowser && typeof window !== 'undefined' && window.localStorage) {
        raw = window.localStorage.getItem(key);
      } else {
        raw = this.fallbackMemory.get(key) ?? null;
      }

      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[StorageService] Failed to parse key "${key}" from storage`, err);
      return null;
    }
  }

  /**
   * Serializes an item to JSON and saves it into storage
   */
  setItem<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      if (this.isBrowser && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, serialized);
      } else {
        this.fallbackMemory.set(key, serialized);
      }
    } catch (err) {
      console.warn(`[StorageService] Failed to set key "${key}" into storage`, err);
    }
  }

  /**
   * Removes an item from storage
   */
  removeItem(key: string): void {
    try {
      if (this.isBrowser && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      } else {
        this.fallbackMemory.delete(key);
      }
    } catch (err) {
      console.warn(`[StorageService] Failed to remove key "${key}" from storage`, err);
    }
  }

  /**
   * Clears all storage keys managed by the application
   */
  clear(): void {
    try {
      if (this.isBrowser && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
      this.fallbackMemory.clear();
    } catch (err) {
      console.warn('[StorageService] Failed to clear storage', err);
    }
  }
}
