import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
} from 'typeorm'
import { SubscriptionPlan } from './subscription-plan.entity'
import { Coupon } from './coupon.entity'

@Entity()
export class SubscriptionCoupon extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(
        () => Coupon,
        coupon => coupon.plans
    )
    coupon: Coupon

    @ManyToOne(
        () => SubscriptionPlan,
        subscriptionPlan => subscriptionPlan.coupons
    )
    plan: SubscriptionPlan

    // The default coupon plan for given subscription plan
    @Column({ default: false })
    default: boolean
}
