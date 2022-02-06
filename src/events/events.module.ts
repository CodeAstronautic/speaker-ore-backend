import { Module, forwardRef } from '@nestjs/common'
import { EventsController } from './events.controller'
import { EventsService } from './events.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EpisodeRepository } from './repositories/episode.repository'
import { CategoryRepository } from './repositories/category.repository'
import { UploadService } from './upload.service'
import { AuthModule } from '../auth/auth.module'
import { ExcelService } from './excel.service'

@Module({
    imports: [
        forwardRef(() => AuthModule),
        TypeOrmModule.forFeature([EpisodeRepository, CategoryRepository]),
    ],
    controllers: [EventsController],
    providers: [EventsService, UploadService, ExcelService],
    exports: [TypeOrmModule],
})
export class EventsModule { }
