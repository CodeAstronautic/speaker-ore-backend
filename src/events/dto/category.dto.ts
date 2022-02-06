import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsString()
    name: string

    @IsOptional()
    @IsString()
    logo?: string
}

export class UpdateCategoryDto extends CreateCategoryDto {
    @IsNotEmpty()
    id: number
}
