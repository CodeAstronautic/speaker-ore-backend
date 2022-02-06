import { AuthGuard } from '@nestjs/passport'
import { UnauthorizedException } from '@nestjs/common'
import { Role } from '../enums/roles.enums'

export class SubscribeGuard extends AuthGuard('jwt') {
    handleRequest(err, user, info: Error) {

        if (!user || (user.role === Role.USER && !user.subscribed))
            throw new UnauthorizedException('You need to subscribe')

        return user
    }
}
