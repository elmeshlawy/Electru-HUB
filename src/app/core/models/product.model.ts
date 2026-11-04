export interface ProductSpecification {
  [key: string]: string | number | boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  inStock: boolean;
  sku: string;
  brand: string;
  categoryId: string;
  categoryName?: string;
  images: string[];
  featuredImage: string;
  specs: ProductSpecification;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  tags?: string[];
  warranty?: string;
  createdAt: string;
}

export interface ProductFilterCriteria {
  categoryId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'name';
  inStockOnly?: boolean;
}
