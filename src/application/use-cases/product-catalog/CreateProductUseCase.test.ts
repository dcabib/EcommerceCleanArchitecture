import { CreateProductUseCase, CreateProductDTO } from './CreateProductUseCase';
import { IProductRepository } from '../../../domain/product-catalog/repositories/IProductRepository';
import { Product } from '../../../domain/product-catalog/entities/Product';

describe('CreateProductUseCase', () => {
  // Mock implementations
  class MockProductRepository implements IProductRepository {
    private products: Product[] = [];

    async findById(productId: string): Promise<Product | null> {
      return this.products.find(p => p.productId === productId) || null;
    }

    async save(product: Product): Promise<Product> {
      const existingIndex = this.products.findIndex(p => p.productId === product.productId);
      if (existingIndex >= 0) {
        this.products[existingIndex] = product;
      } else {
        this.products.push(product);
      }
      return product;
    }

    async delete(productId: string): Promise<boolean> {
      const initialLength = this.products.length;
      this.products = this.products.filter(p => p.productId !== productId);
      return this.products.length !== initialLength;
    }

    async findByCategory(categoryId: string, page: number, limit: number): Promise<{
      products: Product[];
      total: number;
      page: number;
      totalPages: number;
    }> {
      const filtered = this.products.filter(p => p.categoryId === categoryId);
      const start = (page - 1) * limit;
      const end = start + limit;
      return {
        products: filtered.slice(start, end),
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / limit)
      };
    }

    async findByName(searchTerm: string, page: number, limit: number): Promise<{
      products: Product[];
      total: number;
      page: number;
      totalPages: number;
    }> {
      const filtered = this.products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const start = (page - 1) * limit;
      const end = start + limit;
      return {
        products: filtered.slice(start, end),
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / limit)
      };
    }

    async findWithDiscounts(page: number, limit: number): Promise<{
      products: Product[];
      total: number;
      page: number;
      totalPages: number;
    }> {
      const filtered = this.products.filter(p => p.discountIds.length > 0);
      const start = (page - 1) * limit;
      const end = start + limit;
      return {
        products: filtered.slice(start, end),
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / limit)
      };
    }

    async findByPriceRange(minPrice: number, maxPrice: number, page: number, limit: number): Promise<{
      products: Product[];
      total: number;
      page: number;
      totalPages: number;
    }> {
      const filtered = this.products.filter(p => 
        p.currentPrice >= minPrice && p.currentPrice <= maxPrice
      );
      const start = (page - 1) * limit;
      const end = start + limit;
      return {
        products: filtered.slice(start, end),
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / limit)
      };
    }

    async findTopRated(minRating: number, page: number, limit: number): Promise<{
      products: Product[];
      total: number;
      page: number;
      totalPages: number;
    }> {
      const filtered = this.products.filter(p => p.averageRating >= minRating);
      const start = (page - 1) * limit;
      const end = start + limit;
      return {
        products: filtered.slice(start, end),
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / limit)
      };
    }

    async findAll(page: number, limit: number): Promise<{
      products: Product[];
      total: number;
      page: number;
      totalPages: number;
    }> {
      const start = (page - 1) * limit;
      const end = start + limit;
      return {
        products: this.products.slice(start, end),
        total: this.products.length,
        page,
        totalPages: Math.ceil(this.products.length / limit)
      };
    }

    async count(): Promise<number> {
      return this.products.length;
    }

    async countByCategory(categoryId: string): Promise<number> {
      return this.products.filter(p => p.categoryId === categoryId).length;
    }
  }

  const mockIdGenerator = {
    generate: () => 'generated-id'
  };

  let useCase: CreateProductUseCase;
  let productRepository: MockProductRepository;

  const validCreateProductDTO: CreateProductDTO = {
    name: 'Test Product',
    description: 'Test Description',
    categoryId: 'cat-123',
    currentPrice: 99.99,
    discountIds: ['disc-123']
  };

  beforeEach(() => {
    productRepository = new MockProductRepository();
    useCase = new CreateProductUseCase(productRepository, mockIdGenerator);
  });

  it('should create a new product successfully', async () => {
    const result = await useCase.execute(validCreateProductDTO);

    expect(result).toEqual({
      productId: 'generated-id',
      name: validCreateProductDTO.name,
      description: validCreateProductDTO.description,
      categoryId: validCreateProductDTO.categoryId,
      currentPrice: validCreateProductDTO.currentPrice,
      discountIds: validCreateProductDTO.discountIds,
      reviews: [],
      averageRating: 0
    });

    // Verify product was saved to repository
    const savedProduct = await productRepository.findById('generated-id');
    expect(savedProduct).not.toBeNull();
    expect(savedProduct?.name).toBe(validCreateProductDTO.name);
  });

  it('should throw error for negative price', async () => {
    const invalidDTO = {
      ...validCreateProductDTO,
      currentPrice: -10
    };

    await expect(useCase.execute(invalidDTO))
      .rejects
      .toThrow('Product price cannot be negative');
  });

  it('should create product with empty discounts array if not provided', async () => {
    const dtoWithoutDiscounts = {
      ...validCreateProductDTO,
      discountIds: undefined
    };

    const result = await useCase.execute(dtoWithoutDiscounts);
    expect(result.discountIds).toEqual([]);
  });

  it('should initialize product with empty reviews and zero rating', async () => {
    const result = await useCase.execute(validCreateProductDTO);
    
    expect(result.reviews).toEqual([]);
    expect(result.averageRating).toBe(0);
  });

  it('should generate unique ID using idGenerator', async () => {
    const spy = jest.spyOn(mockIdGenerator, 'generate');
    
    await useCase.execute(validCreateProductDTO);
    
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
