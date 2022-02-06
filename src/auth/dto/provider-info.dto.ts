import {
    IsString,
    IsEmail,
    IsNotEmpty,
    IsPhoneNumber,
    IsOptional,
} from 'class-validator'
import { Role } from '../enums/roles.enums'
import { AuthProvider } from '../enums/auth-provider.enum'

// Information about the user sent by the provider

export class ProviderInfoDTO {
    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsNotEmpty()
    @IsString()
    name: string

    @IsString()
    @IsNotEmpty()
    role: Role

    @IsString()
    @IsNotEmpty()
    provider: AuthProvider

    @IsPhoneNumber('IN')
    @IsOptional()
    phone: string
}
