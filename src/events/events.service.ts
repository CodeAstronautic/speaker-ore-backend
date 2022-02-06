import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    NotAcceptableException,
    Logger,
} from '@nestjs/common'
import { AddEventDto } from './dto/create-event.dto'
import { EpisodeRepository } from './repositories/episode.repository'
import { CategoryRepository } from './repositories/category.repository'
import { EventFilterDto } from './dto/get-event-filter.dto'
import { Episode } from './entity/episode.entity'
import { UpdateEventModDto } from './dto/update-event-mod.dto'
import { Category } from './entity/category.entity'
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto'
import { EventStatus } from './enums/event-status.enum'
import { User } from '../auth/entities/user.entity'
import { UserRepository } from '../auth/repositories/user.repository'

@Injectable()
export class EventsService {
    private logger = new Logger('EventsService')
    constructor(
        private readonly episodeRepository: EpisodeRepository,
        private readonly categoryRepository: CategoryRepository,
        private readonly userRepository: UserRepository,
    ) { }

    getEvents = async (
        eventFilterDto: EventFilterDto,
        user: User
    ): Promise<Episode[]> => {
        return this.episodeRepository.getEpisodes(eventFilterDto, user)
    }

    getEvent = async (id: number) => await this.episodeRepository.findOne({ id });

    getEventWithBookmarks = async (id: number, user: User) => {
        const event = await this.getEvent(id);
        if (!event) throw new NotFoundException("Event not found");
        const userWithBookmark = await this.userRepository.getUserWithBookmarks(user);
        return { ...event, isLiked: !!userWithBookmark.bookmarks.find(bookmark => bookmark.id === event.id) };
    }

    getAllEventsMod = async (eventFilterDto: EventFilterDto) => this.episodeRepository.getAllEvents(eventFilterDto);

    addEvent = async (
        eventCreds: AddEventDto,
        user: User
    ): Promise<Episode> => {
        const { categories } = eventCreds;
        const getCategories = await this.categoryRepository.getAllCategories(categories);
        return this.episodeRepository.insertEpisode(eventCreds, user, getCategories)
    }

    addMultipleEvents = async (eventCreds: AddEventDto[], user: User) => {
        const uniqueCategories = eventCreds.reduce((acc, event) => {
            return [...acc, ...event.categories.filter(category => !acc.includes(category))]
        }, [] as string[]);

        const uniqueCategoriesEntity = await this.categoryRepository.getAllCategories(uniqueCategories);

        const addEvent = (event: AddEventDto) => {
            const requiredCategories: Category[] = [];

            for (let i = 0; i < event.categories.length; i++) {
                const currCategory = event.categories[i];
                for (let j = 0; j < uniqueCategoriesEntity.length; j++) {
                    const currCategoryEntity = uniqueCategoriesEntity[j];
                    if (currCategoryEntity.name === currCategory) {
                        requiredCategories.push(currCategoryEntity);
                    }
                }
            }

            return this.episodeRepository.insertEpisode(event, user, requiredCategories)
        }

        return Promise.all(eventCreds.map(event => addEvent(event)))
    }

    updateEvent = async (
        eventCreds: AddEventDto,
        id: number
    ): Promise<void> => {
        const { categories } = eventCreds;
        const getCategories = await this.categoryRepository.getAllCategories(categories);
        return this.episodeRepository.updateEpisode(eventCreds, id, getCategories)
    }

    updateEventStatus = async (
        event_info: UpdateEventModDto
    ): Promise<boolean> => {
        try {
            const { id, status } = event_info
            const result = await this.episodeRepository.update({ id }, { status })
            this.logger.log(`updateEventStatus: updated the status of event with info ${JSON.stringify(event_info)}`);
            return result.affected > 0
        } catch (err) {
            this.logger.error(`updateEventStatus: Error updating the status of event with info ${JSON.stringify(event_info)}`, err.stack);
        }
    }

    getAllEvents = async (eventFilter: EventFilterDto, user: User) => {
        const events = await this.episodeRepository.getAllEvents(eventFilter);
        const userWithBookmark = await this.userRepository.getUserWithBookmarks(user);
        return events.map(event => ({ ...event, isLiked: !!userWithBookmark.bookmarks.find(bookmark => bookmark.id === event.id) }));
    }

    getCategories = async (): Promise<Category[]> => {
        return await this.categoryRepository.getCategories()
    }

    addCategory = async (categoryDto: CreateCategoryDto): Promise<Category> => {
        return await this.categoryRepository.insertCategory(categoryDto)
    }

    updateCategory = async (categoryDto: UpdateCategoryDto): Promise<Category> => {
        return await this.categoryRepository.updateCategory(categoryDto)
    }

    // approveCategory = async (id: number): Promise<boolean> => {
    //     try {
    //         const result = await this.categoryRepository.update(
    //             { id },
    //         )
    //         const resultAffected = result.affected > 0
    //         this.logger.log(`approveCategory: approved the category of id ${id} - row affected ${resultAffected}`);
    //         return resultAffected
    //     } catch(err) {
    //         this.logger.error(`approveCategory: error approving the category ${id}`, err.stack);
    //         throw new InternalServerErrorException()
    //     }
    // }

    // declineCategory = async (id: number): Promise<Category> => {
    //     try {
    //         const category = await this.categoryRepository.findOne({ id })
    //         if (!category) {
    //             throw new NotFoundException()
    //         }
    //         if (!category.approved) {
    //             this.logger.log(`declineCategory: category of id ${id} was never approved - removing from db`);
    //             return await category.remove()
    //         } else {
    //             this.logger.log(`declineCategory: category of id ${id} was approved - changing the status to false`);
    //             category.status = false
    //             return await category.save()
    //         }
    //     } catch (e) {
    //         this.logger.error(`declineCategory: unable to decline the category of ${id}`, e.stack);
    //         throw new InternalServerErrorException()
    //     }
    // }

    deleteCategory = async (categoryDto: UpdateCategoryDto) => {
        const { id } = categoryDto
        return await this.categoryRepository.delete({ id })
    }

    getBookmarkedEvents = async (user: User): Promise<Episode[]> => {
        const { id } = user
        try {
            const res = await this.userRepository.findOne(id, {
                relations: ['bookmarks'],
            })
            this.logger.log(`getBookmarkedEvents: user ${user.name}`);
            return res.bookmarks
        } catch (e) {
            this.logger.error(`getBookmarkedEvents: user ${user.name} was unable to get bookmarked events`)
            throw new InternalServerErrorException(e)
        }
    }

    addBookmarkedEvent = async (
        event_id: number,
        user: User
    ): Promise<void> => {
        const { id } = user
        try {
            const myUser = await this.userRepository.findOne(id, {
                relations: ['bookmarks'],
            })
            const episode = await this.episodeRepository.findOne({
                id: event_id,
            })

            // Checking if event exists and is approved
            if (!episode || (episode.status !== EventStatus.APPROVED)) throw new NotFoundException("Event not found");

            if (myUser.bookmarks.find(bookmark => bookmark.id === event_id)) {
                this.logger.log(`addBookmarkedEvent: Event ${episode.name} was already bookmarked by ${myUser.name}`);
                throw new NotAcceptableException(
                    'This event is already bookmarked'
                )
            }
            myUser.bookmarks.push(episode)
            await myUser.save()
        } catch (e) {
            if (e instanceof NotAcceptableException) {
                throw new NotAcceptableException('This event is already bookmarked')
            }
            this.logger.error(`addBookmarkedEvent: User ${user.name} could not bookmark event with id ${event_id}`, e.stack);
            throw new InternalServerErrorException(e)
        }
    }

    removeBookmarkedEvent = async (
        event_id: number,
        user: User
    ): Promise<any> => {
        const { id } = user
        try {
            const myUser = await this.userRepository.findOne(id, {
                relations: ['bookmarks'],
            })

            const episode = await Episode.findOne({ id: event_id })

            if (!episode) {
                throw new NotFoundException("Bookmarked event not found")
            }

            myUser.bookmarks = myUser.bookmarks.filter(
                bookmark => bookmark.id !== episode.id
            )

            this.logger.log(`removeBookmarkedEvent: Event ${episode.name} was removed from bookmarked events by ${myUser.name}`);
            await myUser.save()
            return true
        } catch (e) {
            this.logger.error(`removeBookmarkedEvent: Removing bookmarked event by user ${user.name}`);
            throw new InternalServerErrorException(e)
        }
    }

    searchResults = async (search: string): Promise<Episode[]> => {
        return await this.episodeRepository.getSearchScore(search)
    }

    addImages = async (images: string[], id: number) => {
        const event = await this.getEvent(id);
        if (!event) throw new NotFoundException("Event not found")
        try {
            event.images = images;
            await event.save();
            return true
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
    }
}
