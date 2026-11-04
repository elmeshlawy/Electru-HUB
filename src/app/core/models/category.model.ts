export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  image?: string;
  productCount?: number;
  featured?: boolean;
  parentId?: string | null;
}
