import { Review } from './review.model';

export interface ProductSpecification {
  [key: string]: string | number | boolean;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  brand: string;
  categoryId: string;
  categoryName?: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  inStock?: boolean;
  sku?: string;
  images: string[];
  featuredImage: string;
  specifications: ProductSpecification;
  specs?: ProductSpecification;
  featured: boolean;
  isFeatured?: boolean;
  bestSeller: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  tags?: string[];
  warranty?: string;
  createdAt: string;
  reviews?: Review[];
}

export interface ProductFilterCriteria {
  categoryId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  searchQuery?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'name';
  inStockOnly?: boolean;
}
