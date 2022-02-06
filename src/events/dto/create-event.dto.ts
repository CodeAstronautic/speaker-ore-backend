import {
    IsString,
    IsEmail,
    IsNotEmpty,
    MinLength,
    MaxLength,
    IsOptional,
    IsDateString,
    IsPhoneNumber,
    IsArray,
    IsLatitude,
    IsLongitude,
} from 'class-validator'

// Information about the user sent by the provider

export class AddEventDto {
    @IsString()
    @MinLength(4)
    @MaxLength(40)
    @IsNotEmpty()
    name: string

    @IsNotEmpty()
    @MaxLength(100)
    street: string

    @IsNotEmpty()
    @MaxLength(40)
    state: string

    @IsNotEmpty()
    @MaxLength(40)
    postalCode: string

    @IsNotEmpty()
    @MaxLength(40)
    city: string

    @IsNotEmpty()
    @MaxLength(40)
    country: string

    @IsNotEmpty()
    @IsDateString()
    start_time: Date

    @IsNotEmpty()
    @IsDateString()
    end_time: Date

    @MaxLength(40)
    @IsOptional()
    website: string

    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsOptional()
    @IsPhoneNumber('IN')
    phone: string

    @IsNotEmpty()
    @MaxLength(200)
    about: string

    @IsOptional()
    @MaxLength(1000)
    description: string

    @IsOptional()
    @IsArray()
    categories: string[]

    @IsOptional()
    @IsLatitude()
    latitude: string

    @IsOptional()
    @IsLongitude()
    longitude: string
}
