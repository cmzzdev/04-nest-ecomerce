import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService')

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ){}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExecptions(error)
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0} = paginationDto;
    return this.productRepository.find({
      take: limit,
      skip: offset
      // TODO: relations
    });
  }

  async findOne(term: string) {
    //findOne by UUID or TITLE or SLUG
    let product: Product;

    if(isUUID(term)){

      product = await this.productRepository.findOneBy({id: term});

    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();

      product = await queryBuilder
        .where(`LOWER(title) = LOWER(:title) OR LOWER(slug) = LOWER(:slug)`, { 
          title: term,
          slug: term,
        }).getOne();

    }

    if(!product) 
      throw new NotFoundException(`Product with id or slug: ${term} not found`)

    return product
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    });

    if(!product)
      throw new NotFoundException(`Product with id: ${id} not found`);

    try {
      await this.productRepository.save(product);
    } catch (error) {
      this.handleDBExecptions(error)
    }
    
    return product;
  }

  async remove(id: string) {
    const product = await this.findOne(id)
    await this.productRepository.remove(product)
  }

  private handleDBExecptions(error: any){
    if (error.code === '23505')
        throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected Error, check server logs');
  }
}
