import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    Unique,
    ManyToMany,
} from 'typeorm'
import { Episode } from './episode.entity'

@Entity()
@Unique(['name'])
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({ nullable: true })
    logo: string

    @ManyToMany(
        type => Episode,
        episode => episode.categories
    )
    events: Episode[]
}
