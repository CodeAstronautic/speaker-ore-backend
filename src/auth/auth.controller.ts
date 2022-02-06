import { Controller, Post, Body, Get } from '@nestjs/common'

import { AuthService } from './auth.service'
import { AuthCredentialsDTO } from './dto/auth-cred.dto'
import { User } from './entities/user.entity'

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    @Post('/login')
    async register(
        @Body() authCodeCreds: AuthCredentialsDTO
    ): Promise<{ token: string; isSubscribed: boolean; role: string }> {
        return this.authService.register(authCodeCreds)
    }

    @Get('/all')
    async allUsers(): Promise<User[]> {
        return await this.authService.getAll();
    }
}
