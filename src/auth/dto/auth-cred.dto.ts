import {
    IsString,
    IsEmail,
    IsOptional,
    IsEnum,
    IsPhoneNumber,
} from 'class-validator'
import { AuthProvider } from '../enums/auth-provider.enum'

export class AuthCredentialsDTO {
    @IsString()
    @IsEnum(AuthProvider)
    provider: AuthProvider

    @IsEmail()
    email: string

    @IsString()
    name: string

    @IsString()
    idToken: string

    @IsString()
    @IsOptional()
    @IsPhoneNumber('IN')
    phone: string
}
