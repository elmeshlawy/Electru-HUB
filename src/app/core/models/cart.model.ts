import { Product } from './product.model';

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedSpecs?: Record<string, string>;
  unitPrice: number;
  totalPrice: number;
  addedAt: string;
}

export interface CartSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  totalItems: number;
}
