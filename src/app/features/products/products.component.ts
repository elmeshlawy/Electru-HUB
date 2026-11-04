import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ProductFilterCriteria } from '../../core/models/product.model';

export interface ActiveFilterChip {
  id: string;
  type: 'search' | 'category' | 'brand' | 'price' | 'rating' | 'stock';
  label: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ProductCardComponent,
    EmptyStateComponent,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly productService = inject(ProductService);

  // Filters state (Signals)
  searchQuery = signal<string>('');
  selectedCategory = signal<string>('');
  selectedBrand = signal<string>('');
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  minRating = signal<number | null>(null);
  inStockOnly = signal<boolean>(false);
  sortBy = signal<'price-asc' | 'price-desc' | 'rating' | 'newest' | 'name'>('newest');

  // Pagination state (Signals)
  currentPage = signal<number>(1);
  readonly pageSize = signal<number>(9);

  // Available metadata
  readonly categories = this.productService.categories;
  readonly priceRange = computed(() => this.productService.getPriceRange());
  readonly availableBrands = computed(() =>
    this.productService.getAvailableBrands(this.selectedCategory() || undefined)
  );

  // Full filtered collection (prior to pagination)
  readonly allFilteredProducts = computed(() => {
    const criteria: ProductFilterCriteria = {
      categoryId: this.selectedCategory() || undefined,
      brand: this.selectedBrand() || undefined,
      minPrice: this.minPrice() !== null ? this.minPrice()! : undefined,
      maxPrice: this.maxPrice() !== null ? this.maxPrice()! : undefined,
      minRating: this.minRating() !== null ? this.minRating()! : undefined,
      searchQuery: this.searchQuery() || undefined,
      sortBy: this.sortBy(),
      inStockOnly: this.inStockOnly(),
    };
    return this.productService.filterProducts(criteria);
  });

  // Total results count
  readonly totalProductsCount = computed(() => this.allFilteredProducts().length);

  // Total pages
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalProductsCount() / this.pageSize()))
  );

  // Paginated product slice
  readonly paginatedProducts = computed(() => {
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize();
    return this.allFilteredProducts().slice(start, start + this.pageSize());
  });

  // Active filter indicators / chips
  readonly activeFilters = computed<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = [];

    if (this.searchQuery().trim()) {
      chips.push({
        id: 'search',
        type: 'search',
        label: `Search: "${this.searchQuery().trim()}"`,
      });
    }

    if (this.selectedCategory()) {
      const cat = this.categories().find((c) => c.id === this.selectedCategory());
      chips.push({
        id: 'category',
        type: 'category',
        label: `Category: ${cat ? cat.name : this.selectedCategory()}`,
      });
    }

    if (this.selectedBrand()) {
      chips.push({
        id: 'brand',
        type: 'brand',
        label: `Brand: ${this.selectedBrand()}`,
      });
    }

    if (this.minPrice() !== null || this.maxPrice() !== null) {
      const min = this.minPrice() !== null ? `$${this.minPrice()}` : '$0';
      const max = this.maxPrice() !== null ? `$${this.maxPrice()}` : 'Max';
      chips.push({
        id: 'price',
        type: 'price',
        label: `Price: ${min} - ${max}`,
      });
    }

    if (this.minRating() !== null && this.minRating()! > 0) {
      chips.push({
        id: 'rating',
        type: 'rating',
        label: `Rating: ${this.minRating()}+ Stars`,
      });
    }

    if (this.inStockOnly()) {
      chips.push({
        id: 'stock',
        type: 'stock',
        label: 'In Stock Only',
      });
    }

    return chips;
  });

  readonly hasActiveFilters = computed(() => this.activeFilters().length > 0);

  constructor() {
    // Sync with router query parameters
    this.route.queryParams.subscribe((params) => {
      if (params['category']) {
        this.selectedCategory.set(params['category']);
      }
      if (params['brand']) {
        this.selectedBrand.set(params['brand']);
      }
      if (params['q']) {
        this.searchQuery.set(params['q']);
      }
      if (params['sortBy']) {
        this.sortBy.set(params['sortBy']);
      }
      if (params['minPrice']) {
        this.minPrice.set(parseFloat(params['minPrice']));
      }
      if (params['maxPrice']) {
        this.maxPrice.set(parseFloat(params['maxPrice']));
      }
      if (params['minRating']) {
        this.minRating.set(parseFloat(params['minRating']));
      }
      if (params['page']) {
        this.currentPage.set(Math.max(1, parseInt(params['page'], 10)));
      }
    });
  }

  onCategorySelect(catId: string): void {
    const next = this.selectedCategory() === catId ? '' : catId;
    this.selectedCategory.set(next);
    this.currentPage.set(1);
    this.updateUrlParams();
  }

  onBrandSelect(brand: string): void {
    const next = this.selectedBrand() === brand ? '' : brand;
    this.selectedBrand.set(next);
    this.currentPage.set(1);
    this.updateUrlParams();
  }

  onSearchChange(): void {
    this.currentPage.set(1);
    this.updateUrlParams();
  }

  onPriceFilterApply(): void {
    this.currentPage.set(1);
    this.updateUrlParams();
  }

  onRatingSelect(rating: number): void {
    const next = this.minRating() === rating ? null : rating;
    this.minRating.set(next);
    this.currentPage.set(1);
    this.updateUrlParams();
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.sortBy.set(select.value as any);
    this.currentPage.set(1);
    this.updateUrlParams();
  }

  onStockToggle(): void {
    this.inStockOnly.update((v) => !v);
    this.currentPage.set(1);
  }

  removeFilter(chip: ActiveFilterChip): void {
    switch (chip.type) {
      case 'search':
        this.searchQuery.set('');
        break;
      case 'category':
        this.selectedCategory.set('');
        break;
      case 'brand':
        this.selectedBrand.set('');
        break;
      case 'price':
        this.minPrice.set(null);
        this.maxPrice.set(null);
        break;
      case 'rating':
        this.minRating.set(null);
        break;
      case 'stock':
        this.inStockOnly.set(false);
        break;
    }
    this.currentPage.set(1);
    this.updateUrlParams();
  }

  clearAllFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('');
    this.selectedBrand.set('');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.minRating.set(null);
    this.inStockOnly.set(false);
    this.sortBy.set('newest');
    this.currentPage.set(1);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.updateUrlParams();
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  private updateUrlParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: this.selectedCategory() || null,
        brand: this.selectedBrand() || null,
        q: this.searchQuery() || null,
        minPrice: this.minPrice() !== null ? this.minPrice() : null,
        maxPrice: this.maxPrice() !== null ? this.maxPrice() : null,
        minRating: this.minRating() !== null ? this.minRating() : null,
        sortBy: this.sortBy() !== 'newest' ? this.sortBy() : null,
        page: this.currentPage() > 1 ? this.currentPage() : null,
      },
    });
  }
}
