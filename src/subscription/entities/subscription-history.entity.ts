import {
    BaseEntity,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne, OneToOne, JoinColumn
} from 'typeorm'
import { SubscriptionPlan } from './subscription-plan.entity'
import { User } from '../../auth/entities/user.entity'
import { PaymentTransaction } from '../../payment/entities/transaction.entity'

@Entity()
export class SubscriptionHistory extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(type => SubscriptionPlan)
    subscription_plan: SubscriptionPlan

    @Column()
    start_time: string

    @Column()
    end_time: string

    @Column({ nullable: true })
    coupon_id: string

    @ManyToOne(
        type => User,
        user => user.plans
    )
    user: User

    @OneToOne(type => PaymentTransaction)
    @JoinColumn()
    payment: PaymentTransaction
}
