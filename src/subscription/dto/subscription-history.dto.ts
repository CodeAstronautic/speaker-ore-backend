import { IsInt, IsOptional } from 'class-validator'

export class SubscriptionHistoryDTO {
    @IsInt()
    subscription_plan_id: number

    @IsOptional()
    coupon_id: string
}
