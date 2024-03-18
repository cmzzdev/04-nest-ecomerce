import { ApiProperty } from "@nestjs/swagger";
import { 
    IsEmail, 
    IsString, 
    Matches, 
    MaxLength, 
    MinLength 
} from "class-validator";

export class CreateUserDto {
    @ApiProperty({
        description: 'User email',
        nullable: false,
    }) // Swagger decorator
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User password, The password must have a Uppercase, lowercase letter and a number',
        nullable: false,
        minLength: 6,
        maxLength: 50,
    }) // Swagger decorator
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password: string;
    
    @ApiProperty({
        description: 'Name and surname',
        nullable: false,
        minLength: 1,
    }) // Swagger decorator
    @IsString()
    @MinLength(1)
    fullName: string;
}
