import {
    Entity,
    Unique,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
} from 'typeorm'
import { SubscriptionCoupon } from './subscriptionCoupon.entity'

@Entity()
@Unique(['id', 'code'])
export class Coupon extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    code: string

    @Column({ nullable: true })
    end_date: string

    @Column({ nullable: true })
    count: number

    @Column({ nullable: true })
    price: number

    @Column({ nullable: true })
    percentage: number


    @Column({ nullable: true })
    name: string

    @Column({ nullable: true })
    description: string

    /*
     * Can forcibly disable the coupon
     */
    @Column({ default: false })
    disable: boolean

    @OneToMany(
        () => SubscriptionCoupon,
        subscriptionCoupon => subscriptionCoupon.coupon
    )
    plans: SubscriptionCoupon[]
}
