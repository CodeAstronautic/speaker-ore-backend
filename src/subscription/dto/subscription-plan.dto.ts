import { IsInt, Min, IsArray, IsString, IsBoolean } from 'class-validator'

export class SubscriptionPlanDTO {
    @IsInt()
    @Min(0)
    duration: number

    @IsInt()
    @Min(0)
    price: number

    @IsArray()
    features: string[]

    @IsString()
    name: string

    @IsBoolean()
    disable: boolean
}
