import { Repository, EntityRepository, SelectQueryBuilder, FindConditions, Between, MoreThan, LessThan } from 'typeorm'
import { InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { Episode } from '../entity/episode.entity'
import { AddEventDto } from '../dto/create-event.dto'
import { EventFilterDto } from '../dto/get-event-filter.dto'
import { Category } from '../entity/category.entity'
import { User } from '../../auth/entities/user.entity'

const RESULT_PER_PAGE = 20

@EntityRepository(Episode)
export class EpisodeRepository extends Repository<Episode> {
    getEpisodes = async (
        eventFilter: EventFilterDto,
        user: User
    ): Promise<Episode[]> => {
        const { search = '', page } = eventFilter
        let query = this.createQueryBuilder('episode')
            .where('episode.user.id = :user_id', { user_id: user.id })
            .andWhere('episode.name like :searchWord', { searchWord: '%' + search + '%' })
            .orderBy('episode.start_time', 'ASC')

        query = this.getFilterQueryBuilder(eventFilter, query);

        const pageIndex = page || 0

        query
            .offset(RESULT_PER_PAGE * pageIndex)
            .limit(RESULT_PER_PAGE)

        try {
            const episodes = await query.getMany()
            return episodes
        } catch (err) {
            throw new InternalServerErrorException()
        }
    }

    insertEpisode = async (episode_creds: AddEventDto, user: User, categoriesObj: Category[]) => {
        const episode = new Episode()

        const { categories, ...rest } = episode_creds

        for (let key in rest) {
            if (episode_creds[key]) {
                episode[key] = episode_creds[key]
            }
        }
        episode.submitted_on = new Date()
        episode.user = user
        episode.categories = categoriesObj;

        try {
            await episode.save()
            return episode
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    updateEpisode = async (episode_creds: AddEventDto, id: number, categoriesObj: Category[]) => {
        const { categories, ...rest } = episode_creds

        try {
            const episode: Episode = await this.findOne({ id })
            if (!episode) {
                throw new NotFoundException('Event could not be found!')
            }
            for (let key in rest) {
                if (rest[key]) {
                    episode[key] = rest[key]
                }
            }
            episode.categories = categoriesObj;
            await episode.save()
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    getAllEvents = async (eventFilter: EventFilterDto): Promise<Episode[]> => {
        const { page, status, end_date, start_date, state } = eventFilter
        const pageIndex = page || 0

        const whereOptions: FindConditions<Episode> = {};

        if (status) {
            whereOptions.status = status;
        }

        if (start_date) {
            whereOptions.start_time = MoreThan(start_date)
        }

        if (end_date) {
            whereOptions.end_time = LessThan(end_date);
        }

        if (state) {
            whereOptions.state = state;
        }

        try {
            return this.find({
                relations: ['categories'],
                where: whereOptions,
                order: {
                    start_time: 'DESC'
                },
                skip: pageIndex * RESULT_PER_PAGE,
                take: RESULT_PER_PAGE,
            })
            } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    getSearchScore = async (search: string): Promise<Episode[]> => {
        const query = this.createQueryBuilder('episode')
        const result = query
            .select()
            .where('episode.name ILIKE :searchTerm', {
                searchTerm: `%$${search}%`,
            })
            .orWhere('episode.street ILIKE :searchTerm', {
                searchTerm: `%$${search}%`,
            })
        return await result.getMany()
    }

    getFilterQueryBuilder = <T>(eventFilterDto: EventFilterDto, query: SelectQueryBuilder<T>) => {
        const { status, state, start_date, end_date } = eventFilterDto;

        if (status) {
            query = query
                .where("episode.status = :statusValue", { statusValue: status })
        }

        if (state) {
            query = query
                .andWhere("episode.state = :state", { state })
        }

        if (start_date) {
            query = query.andWhere('episode.start_time > :start_at', { start_at: start_date })
        }

        if (end_date) {
            query = query.andWhere('episode.end_time < :end_at', { end_at: end_date })
        }

        return query;
    }
}
