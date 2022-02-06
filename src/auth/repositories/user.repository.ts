import { EntityRepository, Repository } from 'typeorm'
import { User } from '../entities/user.entity'
import { InternalServerErrorException } from '@nestjs/common'
import { ProviderInfoDTO } from '../dto/provider-info.dto'

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    register = async (userInfo: ProviderInfoDTO): Promise<User> => {
        const { email, provider, name, role, phone } = userInfo

        const user = this.create()
        user.email = email
        user.provider = provider
        user.name = name
        user.role = role
        user.created_at = new Date()

        if (phone) user.phone = phone

        try {
            await user.save()
            return user
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException('Some error occured')
        }
    }


    getUserWithBookmarks = async (user: User) => {
        return this.findOne(user.id, {
            relations: ['bookmarks']
        })
    } 
}
