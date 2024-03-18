import { 
    BeforeInsert, 
    BeforeUpdate, 
    Column, 
    Entity, 
    ManyToOne, 
    OneToMany, 
    PrimaryGeneratedColumn 
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { ProductImage } from ".";
import { User } from "../../auth/entities/user.entity";


@Entity({name: 'products'})
export class Product {

    @ApiProperty({
        example: '145b0e59-fab5-46bf-9c0a-595ee5ade4b7',
        description: 'Product ID',
        uniqueItems: true
    }) //Swagger Decorator
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-shirt Boom',
        description: 'Product title',
        uniqueItems: true
    }) //Swagger Decorator
    @Column('text', {
        unique: true,
    })
    title: string;

    @ApiProperty({
        example: 0,
        description: 'Product price',
    }) //Swagger Decorator
    @Column('float', {
        default: 0,
    })
    price: number;

    @ApiProperty({
        example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum congue tortor nisi, id ultrices massa porttitor nec. ',
        description: 'Product description',
    }) //Swagger Decorator
    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;

    @ApiProperty({
        example: 't_shirt_boom',
        description: 'Product SLUG - for SEO',
        uniqueItems: true
    }) //Swagger Decorator
    @Column('text', {
        unique: true,
    })
    slug: string

    @ApiProperty({
        example: 10,
        description: 'Product stock',
        default: 0
    }) //Swagger Decorator
    @Column('int', {
        default: 0,
    })
    stock: number;

    @ApiProperty({
        example: ['S', 'M', 'L'],
        description: 'Product sizes',
    }) //Swagger Decorator
    @Column('text', {
        array: true,
    })
    sizes: string[]

    @ApiProperty({
        example: 'women',
        description: 'Product gender',
    }) //Swagger Decorator
    @Column('text')
    gender: string;

    @ApiProperty() //Swagger Decorator
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    @ApiProperty() //Swagger Decorator
    // images, relation db table
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[];

    // user created (owner)
    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager:true }
    )
    user: User

    @BeforeInsert()
    checkSlugInsert() {
        if(!this.slug){
            this.slug = this.title
        }
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '-')
            .replaceAll("'","")
    }

    @BeforeUpdate()
    checkSlugUpdate(){
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '-')
            .replaceAll("'","")
    }
    
}
