import {
    BaseEntity,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from 'typeorm'
import { IsInt, Min, IsBoolean } from 'class-validator'
import { SubscriptionCoupon } from './subscriptionCoupon.entity'

@Entity()
export class SubscriptionPlan extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    /*
     ? Should Plan have a visible coupon discount, which can be displayed in the website
    */

    @Column()
    name: string

    /**
     * in months
     */
    @IsInt()
    @Column()
    duration: number

    @IsInt()
    @Min(0)
    @Column()
    price: number

    @IsBoolean()
    @Column({ default: false })
    disable: boolean

    @Column('text', { array: true })
    features: string[]

    @OneToMany(
        () => SubscriptionCoupon,
        subscriptionCoupon => subscriptionCoupon.plan
    )
    coupons: SubscriptionCoupon[]
}
