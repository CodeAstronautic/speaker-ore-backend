import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    Unique,
    OneToMany,
    ManyToMany,
    JoinTable,
} from 'typeorm'
import { Role } from '../enums/roles.enums'
import { AuthProvider } from '../enums/auth-provider.enum'
import { PaymentTransaction } from '../../payment/entities/transaction.entity'
import { SubscriptionHistory } from '../../subscription/entities/subscription-history.entity'
import { Episode } from '../../events/entity/episode.entity'
@Entity()
@Unique(['email'])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    email: string

    @Column({ enum: Role })
    role: string

    @Column({ default: false })
    disable: boolean

    @Column({ nullable: true })
    phone: string

    @Column({ enum: AuthProvider })
    provider: string

    @Column()
    created_at: Date

    // Events created by the user
    @OneToMany(
        type => Episode,
        episode => episode.user
    )
    events: Episode[]

    @Column({ default: false })
    subscribed: boolean

    // Events bookmarked by the user
    @ManyToMany(
        type => Episode,
        episode => episode.users,
        { cascade: true }
    )
    @JoinTable()
    bookmarks: Episode[]

    // History of plans used by the user
    @OneToMany(
        type => SubscriptionHistory,
        subscription => subscription.user
    )
    plans: SubscriptionHistory[]

    // payment transactions history
    @OneToMany(
        type => PaymentTransaction,
        paymentTransaction => paymentTransaction.user
    )
    transactions: PaymentTransaction[]
}
