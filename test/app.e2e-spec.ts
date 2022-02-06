import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AuthService } from '../src/auth/auth.service'

describe('AppController (e2e)', () => {
    let app: INestApplication
    const authService = { getAll: () => [] }

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AuthService]
        })
        .overrideProvider(AuthService)
        .useValue(authService)
        .compile();

        app = moduleRef.createNestApplication();
        await app.init();
    })

    it('/GET get all users', () => {
        return request(app.getHttpServer())
            .get('api/auth/all')
            .expect(200)
    })

    afterAll(async () => await app.close())
})
