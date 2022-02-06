import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { OAuth2Client } from 'google-auth-library'
import { UserRepository } from './repositories/user.repository'
import { JwtPayload } from './jwt/jwt-payload.interface'
import { AuthCredentialsDTO } from './dto/auth-cred.dto'
import { ProviderInfoDTO } from './dto/provider-info.dto'
import { Role } from './enums/roles.enums'
import { User } from './entities/user.entity'

@Injectable()
export class AuthService {
    constructor(
        private userRepository: UserRepository,
        private jwtService: JwtService
    ) {}

    register = async (
        authCodeCreds: AuthCredentialsDTO
    ): Promise<{ token: string; isSubscribed: boolean; role: string }> => {
        const { idToken } = authCodeCreds
        if (!this.verify(idToken)) {
            throw new UnauthorizedException('Authentication Failed')
        }
        const { name, email, phone, provider } = authCodeCreds
        const role = Role.USER
        const userObj: ProviderInfoDTO = {
            email,
            name,
            phone,
            provider,
            role,
        }
        try {
            let user = await this.userRepository.findOne({ email })
            if (!user) {
                user = await this.userRepository.register(userObj)
            }
            // Create a jwt token from the given info
            const payload: JwtPayload = {
                provider,
                id: user.id,
            }
            const token = this.jwtService.sign(payload)
            return {
                token,
                isSubscribed: user.subscribed,
                role: user.role,
            }
        } catch (e) {
            throw new ConflictException(e)
        }
    }

    async findUser(id: string): Promise<User> {
        return this.userRepository.findOne(id)
    }

    async verify(token: string): Promise<any> {
        try {
            await new OAuth2Client(
                process.env.GOOGLE_OAUTH_CLIENT_ID
            ).verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
            })
            return true
        } catch (e) {
            return false
        }
    }


    async getAll(): Promise<User[]> {
        return this.userRepository.find({});
    }
}
