import { Module, HttpModule, forwardRef } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UserRepository } from './repositories/user.repository'
import { JwtStrategy } from './jwt/jwt.strategy'
import { EventsModule } from '../events/events.module'

@Module({
    imports: [
        PassportModule.register({
            defaultStrategy: 'jwt',
        }),
        JwtModule.register({
            secret: 'MY_VERY_ULTRA_TOP_SECRET',
            /*
       ! Add expiresIn property for JWT Token. ( keep infinite time for dev purposes ) 
      */
        }),
        HttpModule,
        TypeOrmModule.forFeature([UserRepository]),
        forwardRef(() => EventsModule),
        EventsModule
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [
        JwtStrategy,
        HttpModule,
        TypeOrmModule,
        PassportModule,
        AuthModule,
    ],
})
export class AuthModule {}
