import { Test } from '@nestjs/testing'
import { SubscriptionService } from './subscription.service'
import { SubscriptionPlanRepository } from './repositories/subscription-plan.repository'
import { CouponRepository } from './repositories/coupon.repository'

const mockSubscriptionPlanRepository = () => ({
    find: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    toggleDisability: jest.fn(),
})

const mockCouponRepository = () => ({
    find: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    toggleDisability: jest.fn(),
})

describe('Subscription Service', () => {
    let subscriptionPlanRepository
    let couponRepository

    let subscriptionService

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                SubscriptionService,
                {
                    provide: SubscriptionPlanRepository,
                    useValue: mockSubscriptionPlanRepository(),
                },
                { provide: CouponRepository, useValue: mockCouponRepository() },
            ],
        }).compile()
        subscriptionPlanRepository = module.get<SubscriptionPlanRepository>(
            SubscriptionPlanRepository
        )
        couponRepository = module.get<CouponRepository>(CouponRepository)
        subscriptionService = module.get<SubscriptionService>(
            SubscriptionService
        )
    })

    describe('Subscription Plan', () => {
        it('Get all the subscription plans', async () => {
            subscriptionPlanRepository.find.mockResolvedValue('something')
            expect(subscriptionPlanRepository.find).not.toHaveBeenCalled()
            const result = await subscriptionService.getSubscriptions()
            expect(subscriptionPlanRepository.find).toHaveBeenCalled()
            expect(result).toEqual('something')
        })
    })
})
