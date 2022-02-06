import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable,
    ManyToOne,
} from 'typeorm'
import { User } from '../../auth/entities/user.entity'
import { EventStatus } from '../enums/event-status.enum'
import { Category } from './category.entity'

@Entity({ name: 'episode' })
export class Episode extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    street: string

    @Column()
    city: string

    @Column()
    state: string

    @Column()
    country: string

    @Column()
    postalCode: string

    @Column({ nullable: true })
    website: string

    @Column()
    email: string

    @Column({ nullable: true })
    phone: string

    @Column()
    about: string

    @Column({ nullable: true })
    description: string

    @Column({ default: EventStatus.PENDING })
    status: string

    @Column({ default: false })
    is_visible: boolean

    @Column()
    submitted_on: Date

    @Column({ nullable: true })
    latitude: string

    @Column({ nullable: true })
    longitude: string

    @Column()
    start_time: Date

    @Column()
    end_time: Date

    @ManyToMany(
        type => Category,
        category => category.events
    )
    @JoinTable()
    categories: Category[]

    @ManyToOne(
        type => User,
        user => user.events
    )
    user: User

    @ManyToMany(
        type => User,
        user => user.bookmarks
    )
    users: User[]

    @Column("text", { array: true, nullable: true })
    images: string[] = []

    // @Column("tsvector", { select: false, nullable: true })
    // search_vector: any;
}
