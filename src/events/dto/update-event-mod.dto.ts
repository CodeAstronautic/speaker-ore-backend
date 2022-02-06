import { IsNotEmpty, IsEnum, IsNumber } from 'class-validator'
import { EventStatus } from '../enums/event-status.enum'

export class UpdateEventModDto {
    @IsNumber()
    id: number

    @IsNotEmpty()
    @IsEnum(EventStatus)
    status: EventStatus
}
