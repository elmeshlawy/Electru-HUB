import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  readonly productService = inject(ProductService);
  readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  // Read signals from ProductService
  readonly categories = this.productService.categories;
  readonly featuredProducts = this.productService.featuredProducts;
  readonly bestSellers = this.productService.bestSellers;
  readonly onSaleProducts = this.productService.onSaleProducts;

  // Newsletter state
  newsletterEmail = signal<string>('');
  newsletterSubmitted = signal<boolean>(false);
  newsletterError = signal<string | null>(null);

  // Quick feedback toast
  feedbackToast = signal<string | null>(null);

  onNewsletterSubmit(event: Event): void {
    event.preventDefault();
    const email = this.newsletterEmail().trim();
    if (!email || !email.includes('@')) {
      this.newsletterError.set('Please provide a valid email address.');
      return;
    }

    this.newsletterError.set(null);
    this.newsletterSubmitted.set(true);
    this.newsletterEmail.set('');
  }

  onProductAdded(product: Product): void {
    this.showToast(`"${product.name}" added to shopping cart!`);
  }

  onWishlistToggled(product: Product): void {
    this.showToast(`Wishlist updated for "${product.name}"`);
  }

  private showToast(message: string): void {
    this.feedbackToast.set(message);
    setTimeout(() => {
      this.feedbackToast.set(null);
    }, 3200);
  }

  scrollToSection(elementId: string): void {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  navigateToCategory(catId: string): void {
    this.router.navigate(['/products'], { queryParams: { category: catId } });
  }
}
