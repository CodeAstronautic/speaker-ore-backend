import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SubscriptionService } from './subscription.service'
import { SubscriptionController } from './subscription.controller'
import { SubscriptionPlanRepository } from './repositories/subscription-plan.repository'
import { CouponRepository } from './repositories/coupon.repository'
import { SubscriptionHistory } from './entities/subscription-history.entity'
import { SubscriptionCouponRepository } from './repositories/subscriptionCoupon.repository'
import { AuthModule } from '../auth/auth.module'

@Module({
    imports: [
        TypeOrmModule.forFeature([
            SubscriptionPlanRepository,
            CouponRepository,
            SubscriptionHistory,
            SubscriptionCouponRepository,
        ]),
        AuthModule,
    ],
    exports: [SubscriptionService],
    providers: [SubscriptionService],
    controllers: [SubscriptionController],
})
export class SubscriptionModule {}
