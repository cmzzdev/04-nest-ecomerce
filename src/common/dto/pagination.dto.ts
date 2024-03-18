import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
    @ApiProperty({
        default: 10,
        description: 'How many rows do you need'
    }) // Swagger decorator
    @IsOptional()
    @IsPositive()
    @Type(() => Number) // same that enableImplicitConversions: true
    // Trans
    limit?: number;

    @ApiProperty({
        default: 0,
        description: 'How many rows do you want to skip'
    }) // Swagger decorator
    @IsOptional()
    @Min(0)
    @Type(() => Number) // same that enableImplicitConversions: true
    offset?: number;
}