import {
    IsString,
    Min,
    Max,
    MinLength,
    MaxLength,
    IsDateString,
    IsOptional,
    IsPositive,
    IsInt,
    IsNumber,
} from 'class-validator'

export class AddCouponDTO {
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    code: string

    @IsDateString()
    @IsOptional()
    end_date: string

    @IsPositive()
    @IsInt()
    @IsOptional()
    count: number

    @IsNumber()
    @IsOptional()
    @IsPositive()
    price: number

    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(100)
    percentage: number

    @IsString()
    @MaxLength(30)
    @IsOptional()
    name: string


    @IsString()
    @IsOptional()
    description: string
}
