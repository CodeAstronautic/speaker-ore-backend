import { UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { InjectRepository } from '@nestjs/typeorm'
import { Strategy, ExtractJwt } from 'passport-jwt'

import { UserRepository } from '../repositories/user.repository'
import { JwtPayload } from './jwt-payload.interface'
import { User } from '../entities/user.entity'

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET_KEY,
        })
    }

    async validate(payload: JwtPayload, done): Promise<User> {
        const { id } = payload
        const user = await this.userRepository.findOne({ id })

        if (!user) {
            done(new UnauthorizedException('Allowed nahi re baba'), null)
        }

        return done(null, user)
    }
}
