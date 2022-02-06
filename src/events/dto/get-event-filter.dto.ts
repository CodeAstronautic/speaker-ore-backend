import { MaxLength, IsOptional, IsNumberString, IsEnum, IsString, MinLength, IsDateString } from 'class-validator'
import { EventStatus } from '../enums/event-status.enum'

export class EventFilterDto {
    @IsOptional()
    @MaxLength(40)
    search?: string

    @IsOptional()
    @IsEnum(EventStatus)
    status?: EventStatus

    @IsOptional()
    @IsNumberString()
    page?: number

    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(40)
    state?: string

    @IsOptional()
    @IsDateString()
    start_date?: string

    @IsOptional()
    @IsDateString()
    end_date?: string

    // * TODO
    // * Search filters (date, tags)
}
