import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ProductFilterCriteria } from '../../core/models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductCardComponent, EmptyStateComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly productService = inject(ProductService);

  // Filter signals
  selectedCategory = signal<string>('');
  selectedBrand = signal<string>('');
  searchQuery = signal<string>('');
  sortBy = signal<'price-asc' | 'price-desc' | 'rating' | 'newest' | 'name'>('newest');
  inStockOnly = signal<boolean>(false);

  // Available facets
  readonly categories = this.productService.categories;
  readonly brands = computed(() => {
    const set = new Set(this.productService.products().map((p) => p.brand));
    return Array.from(set);
  });

  // Filtered products computed signal
  readonly filteredProducts = computed(() => {
    const criteria: ProductFilterCriteria = {
      categoryId: this.selectedCategory() || undefined,
      brand: this.selectedBrand() || undefined,
      searchQuery: this.searchQuery() || undefined,
      sortBy: this.sortBy(),
      inStockOnly: this.inStockOnly(),
    };
    return this.productService.filterProducts(criteria);
  });

  constructor() {
    // Listen to query params (category, q, sortBy)
    this.route.queryParams.subscribe((params) => {
      if (params['category']) {
        this.selectedCategory.set(params['category']);
      }
      if (params['q']) {
        this.searchQuery.set(params['q']);
      }
      if (params['sortBy']) {
        this.sortBy.set(params['sortBy']);
      }
    });
  }

  onCategorySelect(categoryId: string): void {
    const newCat = this.selectedCategory() === categoryId ? '' : categoryId;
    this.selectedCategory.set(newCat);
    this.updateUrlParams();
  }

  onBrandSelect(brand: string): void {
    const newBrand = this.selectedBrand() === brand ? '' : brand;
    this.selectedBrand.set(newBrand);
  }

  onSortChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as any;
    this.sortBy.set(val);
    this.updateUrlParams();
  }

  clearFilters(): void {
    this.selectedCategory.set('');
    this.selectedBrand.set('');
    this.searchQuery.set('');
    this.inStockOnly.set(false);
    this.sortBy.set('newest');
    this.router.navigate(['/products']);
  }

  private updateUrlParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: this.selectedCategory() || null,
        q: this.searchQuery() || null,
        sortBy: this.sortBy() || null,
      },
      queryParamsHandling: 'merge',
    });
  }
}
