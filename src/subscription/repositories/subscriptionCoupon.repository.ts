import { Repository, EntityRepository } from 'typeorm'
import { InternalServerErrorException } from '@nestjs/common'

import { SubscriptionCoupon } from '../entities/subscriptionCoupon.entity'
import { Coupon } from '../entities/coupon.entity'
import { SubscriptionPlan } from '../entities/subscription-plan.entity'

@EntityRepository(SubscriptionCoupon)
export class SubscriptionCouponRepository extends Repository<
    SubscriptionCoupon
> {
    insertCouponInManyPlans = async (
        coupon: Coupon,
        plans: SubscriptionPlan[]
    ): Promise<void> => {
        const couponPlans = plans.map(plan => ({
            plan,
            coupon,
            default: false,
        }))

        const query = this.createQueryBuilder()

        try {
            await query
                .insert()
                .into(SubscriptionCoupon)
                .values(couponPlans)
                .execute()
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }

    subscriptionCouponWithPlans = async(coupon: Coupon) => this.find({
        relations: ['plan'],
        where: { coupon },
    })
}
