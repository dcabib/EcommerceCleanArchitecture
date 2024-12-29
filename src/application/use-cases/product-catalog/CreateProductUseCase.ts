import { Product } from '../../../domain/product-catalog/entities/Product';
import { IProductRepository } from '../../../domain/product-catalog/repositories/IProductRepository';

export interface CreateProductDTO {
  name: string;
  description: string;
  categoryId: string;
  currentPrice: number;
  discountIds?: string[];
}

export interface CreateProductResponseDTO {
  productId: string;
  name: string;
  description: string;
  categoryId: string;
  currentPrice: number;
  discountIds: string[];
  reviews: Review[];
  averageRating: number;
}

import { Review } from '../../../domain/product-catalog/entities/Product';

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly idGenerator: { generate(): string }
  ) {}

  async execute(dto: CreateProductDTO): Promise<CreateProductResponseDTO> {
    // Validate price
    if (dto.currentPrice < 0) {
      throw new Error('Product price cannot be negative');
    }

    // Generate unique ID
    const productId = this.idGenerator.generate();

    // Create product entity
    const product = Product.create(
      productId,
      dto.name,
      dto.description,
      dto.categoryId,
      dto.currentPrice,
      dto.discountIds
    );

    // Save to repository
    const savedProduct = await this.productRepository.save(product);

    // Return DTO
    return {
      productId: savedProduct.productId,
      name: savedProduct.name,
      description: savedProduct.description,
      categoryId: savedProduct.categoryId,
      currentPrice: savedProduct.currentPrice,
      discountIds: savedProduct.discountIds,
      reviews: savedProduct.reviews,
      averageRating: savedProduct.averageRating
    };
  }
}
