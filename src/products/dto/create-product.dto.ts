import { ApiProperty } from "@nestjs/swagger";
import { 
    IsArray, 
    IsIn, 
    IsInt, 
    IsNumber, 
    IsOptional, 
    IsPositive, 
    IsString, 
    MinLength 
} from "class-validator";

export class CreateProductDto {

    @ApiProperty({
        description: 'Product title (unique)',
        nullable: false,
        minLength: 1
    }) // Swagger decorator
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty() // Swagger decorator
    @IsString({each:true})
    @IsArray()
    sizes: string[];

    @ApiProperty() // Swagger decorator
    @IsIn(['men', 'woman', 'kid', 'unisex'])
    gender: string;

    @ApiProperty() // Swagger decorator
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty() // Swagger decorator
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @ApiProperty() // Swagger decorator
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty() // Swagger decorator
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @ApiProperty() // Swagger decorator
    @IsString({each:true})
    @IsArray()
    @IsOptional()
    tags?: string[]

    @ApiProperty() // Swagger decorator
    @IsString({each:true})
    @IsArray()
    @IsOptional()
    images?: string[]
}
