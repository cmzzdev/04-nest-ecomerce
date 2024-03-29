import { 
    Column, 
    Entity, 
    ManyToOne, 
    PrimaryGeneratedColumn 
} from "typeorm";
import { Product } from ".";

@Entity({name: 'product_images'})
export class ProductImage {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column('text')
    url: string;

    // product, relation db table
    @ManyToOne(
        () => Product,
        (product) => product.images,
        { onDelete: 'CASCADE' }
    )
    product: Product
}