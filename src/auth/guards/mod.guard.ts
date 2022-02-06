import { AuthGuard } from '@nestjs/passport'
import { UnauthorizedException } from '@nestjs/common'
import { Role } from '../enums/roles.enums'

export class ModGuard extends AuthGuard('jwt') {
    handleRequest(err, user, info: Error) {
        if (!user || user.role !== Role.MODERATOR) {
            throw new UnauthorizedException('You are not moderator')
        }
        return user
    }
}
