import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService')

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly producImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ){}

  async create(createProductDto: CreateProductDto) {
    try {

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.producImageRepository.create({url: image}))
      });
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExecptions(error)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0} = paginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      }
    });
    return products.map(product => ({
      ...product,
      images: product.images.map(img => img.url)
    }))
  }

  async findOne(term: string) {
    //findOne by UUID or TITLE or SLUG
    let product: Product;

    if(isUUID(term)){
      product = await this.productRepository.findOneBy({id: term});
    } else {
      const query = this.productRepository.createQueryBuilder('productTable');
      product = await query
        .where(`LOWER(title) = LOWER(:title) OR LOWER(slug) = LOWER(:slug)`, { 
          title: term,
          slug: term,
        })
        .leftJoinAndSelect('productTable.images', 'productImages')
        .getOne();
    }

    if(!product) 
      throw new NotFoundException(`Product with id or slug: ${term} not found`)

    return product
  }

  async findOnePlain(term: string){
    const { images = [], ...rest} = await this.findOne(term) 
    return {
      ...rest,
      images: images.map(img => img.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({ id, ...toUpdate });

    if(!product)
      throw new NotFoundException(`Product with id: ${id} not found`);

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      
      if(images){
        // delete all previous images 
        await queryRunner.manager.delete(ProductImage, { product: { id }})
        // set new images into the product
        product.images = images.map(image => this.producImageRepository.create({url: image}))
      } 

      await queryRunner.manager.save(product)

      await queryRunner.commitTransaction()
      await queryRunner.release()
      return this.findOnePlain(id);

    } catch (error) {
      await queryRunner.rollbackTransaction()
      await queryRunner.release()
      this.handleDBExecptions(error)
    }
    
    
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

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query
        .delete()
        .where({})
        .execute();
    } catch (error) {
      this.handleDBExecptions(error);
    }
  }
}
