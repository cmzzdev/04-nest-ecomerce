import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
    @IsOptional()
    @IsPositive()
    @Type(() => Number) // same that enableImplicitConversions: true
    // Trans
    limit?: number;

    @IsOptional()
    @Min(0)
    @Type(() => Number) // same that enableImplicitConversions: true
    offset?: number;
}