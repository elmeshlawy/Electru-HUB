import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  readonly productService = inject(ProductService);
  readonly categories = this.productService.categories;

  currentYear = new Date().getFullYear();
  newsletterEmail = '';
  newsletterSubscribed = false;

  onSubscribeNewsletter(event: Event): void {
    event.preventDefault();
    if (this.newsletterEmail.trim()) {
      this.newsletterSubscribed = true;
      this.newsletterEmail = '';
    }
  }
}
