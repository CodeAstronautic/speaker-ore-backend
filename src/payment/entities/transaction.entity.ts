import {
    BaseEntity,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Unique,
    ManyToOne,
} from 'typeorm'
import { IsInt, Min, IsAlpha } from 'class-validator'
import { User } from '../../auth/entities/user.entity'

@Entity()
@Unique(['razorpay_order_id'])
export class PaymentTransaction extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @IsInt()
    @Min(0)
    @Column()
    amount: number

    @IsAlpha()
    @Column()
    currency: string

    @Column()
    razorpay_payment_id: string

    @Column()
    razorpay_signature: string

    @Column({ unique: true })
    razorpay_order_id: string

    @Column({ default: false })
    verified: boolean

    @ManyToOne(
        () => User,
        user => user.transactions
    )
    user: User
}
