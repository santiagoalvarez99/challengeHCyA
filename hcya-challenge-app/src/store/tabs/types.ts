import type { Product } from "../../services/productService";

export interface TabItem<T = unknown> {
  id: string; // identificador único de la tab
  title: string;
  component: React.ReactNode;
  state?: T;
}
export interface ProductTabState {
  filters: {
    brandId?: number;
    superCategoryId?: number;
    categoryId?: number;
    subcategoryId?: number;
    search?: string;
  };
  pagination: {
    page: number;
    pageSize: number;
  };
  editedRows?: Record<number, Partial<Product>>;
}
