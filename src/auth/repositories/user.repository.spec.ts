import { Test } from '@nestjs/testing'
import { UserRepository } from './user.repository'
import { AuthProvider } from '../enums/auth-provider.enum'
import { Role } from '../enums/roles.enums'
import { ProviderInfoDTO } from '../dto/provider-info.dto'
import { InternalServerErrorException } from '@nestjs/common'

const userInfo: ProviderInfoDTO = {
    email: 'myemail@gmail.com',
    name: 'myname',
    sub: 'unique-identifier',
    provider: AuthProvider.GOOGLE,
    role: Role.USER,
}

describe('AUTH CONTROLLER', () => {
    let userRepository: UserRepository

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [UserRepository],
        }).compile()

        userRepository = moduleRef.get<UserRepository>(UserRepository)
    })

    describe('register', () => {
        let save

        beforeEach(() => {
            save = jest.fn()
            userRepository.create = jest.fn().mockReturnValue({ save })
        })

        it('should successfully signup the user', async () => {
            save.mockResolvedValue(userInfo)
            expect(userRepository.register(userInfo)).resolves.not.toThrow()
        })

        it('Throws internal server error', async () => {
            save.mockRejectedValue({ code: '123123' })
            expect(userRepository.register(userInfo)).rejects.toThrow(
                InternalServerErrorException
            )
        })
    })
})
