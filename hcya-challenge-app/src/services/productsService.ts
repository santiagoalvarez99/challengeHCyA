import axios, { type AxiosInstance } from "axios";

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  categoryName: string;
  description: string;
  sku: string;
  brandId: number;
  brandName: string;
  subcategoryId: number;
  subcategoryName: string;
  supercategoryId: string;
}

export class ProductService {
  private api: AxiosInstance;

  constructor(baseURL: string) {
    this.api = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async getAll(): Promise<Product[]> {
    const res = await this.api.get("/products");
    return res.data;
  }

  async getById(id: string): Promise<Product> {
    const res = await this.api.get(`/products/${id}`);
    return res.data;
  }

  async create(product: Omit<Product, "id">): Promise<Product> {
    const res = await this.api.post("/products", product);
    return res.data;
  }

  async update(id: string, product: Partial<Product>): Promise<Product> {
    const res = await this.api.put(`/products/${id}`, product);
    return res.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/products/${id}`);
  }
}
