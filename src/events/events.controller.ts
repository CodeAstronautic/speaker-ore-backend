import {
    Controller,
    Get,
    UseGuards,
    Post,
    Body,
    Put,
    Query,
    Param,
    Delete,
    ParseIntPipe,
    UseInterceptors,
    UploadedFiles,
    ValidationPipe,
    NotFoundException,
    UploadedFile,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { AuthGuard } from '@nestjs/passport'
import { AddEventDto } from './dto/create-event.dto'
import { EventsService } from './events.service'
import { EventFilterDto } from './dto/get-event-filter.dto'
import { Episode } from './entity/episode.entity'
import { UpdateEventModDto } from './dto/update-event-mod.dto'
import { Category } from './entity/category.entity'
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto'
import { UploadService } from './upload.service'
import { EventStatus } from './enums/event-status.enum'
import { GetUser } from '../auth/decorators/get-user.decorator'
import { User } from '../auth/entities/user.entity'
import { SubscribeGuard } from '../auth/guards/subscribed.guard'
import { ModGuard } from '../auth/guards/mod.guard'
import { Role } from '../auth/enums/roles.enums'
import { ExcelService } from './excel.service'
import { diskStorage } from 'multer'

@Controller('events')
export class EventsController {
    constructor(
        private readonly eventService: EventsService,
        private readonly uploadService: UploadService
    ) { }

    /**
     * * File upload API's
     */

    @Post('upload/:id')
    @UseGuards(new SubscribeGuard())
    @UseInterceptors(FilesInterceptor('images'))
    async uploadFile(
        @UploadedFiles() files: any[],
        @Param('id', ParseIntPipe) id: number
    ): Promise<boolean> {
        files.forEach(
            (file) =>
            (file.originalname =
                `${id}-${new Date().toISOString()}` + file.originalname)
        )
        const filePaths = files.map(
            (file) =>
                `https://${process.env.AWS_S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/folder/${file.originalname}`
        )

        this.eventService.addImages(filePaths, id)
        try {
            await this.uploadService.upload(files)
            return true
        } catch (e) {
            return false
        }
    }

    @UseInterceptors(FileInterceptor('sheet', {
        storage: diskStorage({
            destination: './dist/uploads',
        }),
        fileFilter: (req, file, callback) => {
            if (!file.originalname.match(/\.(xlsx|xlx)$/)) {
                return callback(new Error('Only sheet files are allowed!'), false);
            }
            callback(null, true);
        }
    }))
    @Post('upload/')
    @UseGuards(new ModGuard())
    async uploadEventSheet(
        @UploadedFile() file: Express.Multer.File,
        @GetUser() user: User
    ) {
        const excel = new ExcelService(file);
        try {
            const events = excel.parseFile();
            return this.eventService.addMultipleEvents(events, user);
        } catch (e) {
            throw e
        } finally {
            excel.removeFile();
        }
    }

    /*
     * MODERATOR API's
     */

    @Put('/moderator')
    @UseGuards(new ModGuard())
    async setEvent(
        @Body() update_event_mod: UpdateEventModDto
    ): Promise<boolean> {
        return this.eventService.updateEventStatus(update_event_mod)
    }

    @Get('/mod/all')
    @UseGuards(new ModGuard())
    async getAllEventsMod(
        @Query() eventFilterDto: EventFilterDto
    ): Promise<Episode[]> {
        return this.eventService.getAllEventsMod(eventFilterDto)
    }

    /*
     * Categories API's
     */

    @Get('/category')
    @UseGuards()
    async getCategories(): Promise<Category[]> {
        return this.eventService.getCategories()
    }

    @Post('/category')
    @UseGuards(new SubscribeGuard())
    async addCategory(
        @Body() categoryDto: CreateCategoryDto
    ): Promise<Category> {
        return this.eventService.addCategory(categoryDto)
    }

    @Put('/category')
    @UseGuards(new ModGuard())
    async updateCategory(
        @Body() categoryDto: UpdateCategoryDto
    ): Promise<Category> {
        return this.eventService.updateCategory(categoryDto)
    }

    // @Put('/category/approve/:id')
    // @UseGuards(new ModGuard())
    // async approveCategory(
    //     @Param('id', ParseIntPipe) id: number
    // ): Promise<boolean> {
    //     return this.eventService.approveCategory(id)
    // }

    // @Put('/category/decline/:id')
    // @UseGuards(new ModGuard())
    // async declineCategory(
    //     @Param('id', ParseIntPipe) id: number
    // ): Promise<Category> {
    //     return this.eventService.declineCategory(id)
    // }

    /*
     * Bookmarks API's
     */

    @Get('/bookmark')
    @UseGuards(new SubscribeGuard())
    async getBookmarkedEvent(@GetUser() user: User): Promise<Episode[]> {
        return this.eventService.getBookmarkedEvents(user)
    }

    @Get('/search')
    @UseGuards(new SubscribeGuard())
    async getSearchEvents(@Query('search') search: string): Promise<Episode[]> {
        return this.eventService.searchResults(search)
    }

    @Post('/bookmark/:id')
    @UseGuards(new SubscribeGuard())
    async addBookmarkedEvent(
        @GetUser() user: User,
        @Param('id', ParseIntPipe) id: number
    ): Promise<void> {
        return this.eventService.addBookmarkedEvent(id, user)
    }

    @Delete('/bookmark/:id')
    @UseGuards(new SubscribeGuard())
    async removeBookmarkedEvent(
        @GetUser() user: User,
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.eventService.removeBookmarkedEvent(id, user)
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    async getMyEvents(
        @GetUser() user: User,
        @Query() eventFilterDto: EventFilterDto
    ): Promise<Episode[]> {
        return this.eventService.getEvents({ ...eventFilterDto }, user)
    }

    @Post()
    @UseGuards(new SubscribeGuard())
    async addEvent(
        @Body() event_info: AddEventDto,
        @GetUser() user: User
    ): Promise<Episode> {
        return this.eventService.addEvent(event_info, user)
    }

    // Using only for testing purposes

    @Post('/many')
    @UseGuards(new ModGuard())
    async addMultipleEvent(
        @Body('events', ValidationPipe) event_info: AddEventDto[],
        @GetUser() user: User
    ): Promise<Episode[]> {
        try {
            return this.eventService.addMultipleEvents(event_info, user);
        } catch (e) {
            console.log(e)
        }
    }

    @Put('/:id')
    @UseGuards(AuthGuard())
    async updateEvent(
        @Body() event_info: AddEventDto,
        @Param('id', ParseIntPipe) id: number
    ): Promise<void> {
        return this.eventService.updateEvent(event_info, id)
    }

    @Get('/all')
    @UseGuards(new SubscribeGuard())
    async getAllEvents(
        @Query(ValidationPipe) eventFilterDto: EventFilterDto,
        @GetUser() user: User
    ) {
        if (user.role === Role.USER) {
            return this.eventService.getAllEvents(
                { ...eventFilterDto, status: EventStatus.APPROVED },
                user
            )
        } else {
            return this.eventService.getAllEvents({ ...eventFilterDto }, user)
        }
    }

    @Get('/:id')
    @UseGuards(new SubscribeGuard())
    async getSpecificEvent(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User
    ) {
        const event = await this.eventService.getEventWithBookmarks(id, user)
        if (event) {
            if (user.role === Role.USER) {
                if (event.status !== EventStatus.APPROVED) {
                    throw new NotFoundException('Event not found')
                }
            }
            return event;
        } else {
            throw new NotFoundException('Event not found')
        }
    }
}
