import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private readonly router = inject(Router);
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);
  readonly authService = inject(AuthService);
  readonly productService = inject(ProductService);

  readonly categories = this.productService.categories;

  searchQuery = signal<string>('');
  isMobileMenuOpen = signal<boolean>(false);
  isCategoriesDropdownOpen = signal<boolean>(false);
  isMobileCategoriesOpen = signal<boolean>(false);
  isUserMenuOpen = signal<boolean>(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
    this.isMobileCategoriesOpen.set(false);
  }

  toggleCategoriesDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isUserMenuOpen.set(false);
    this.isCategoriesDropdownOpen.update((open) => !open);
  }

  closeCategoriesDropdown(): void {
    this.isCategoriesDropdownOpen.set(false);
  }

  toggleUserMenu(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isCategoriesDropdownOpen.set(false);
    this.isUserMenuOpen.update((open) => !open);
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  toggleMobileCategories(): void {
    this.isMobileCategoriesOpen.update((open) => !open);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.isCategoriesDropdownOpen.set(false);
    this.isUserMenuOpen.set(false);
  }

  onSearch(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    const query = this.searchQuery().trim();
    if (query) {
      this.router.navigate(['/products'], { queryParams: { q: query } });
      this.closeMobileMenu();
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
