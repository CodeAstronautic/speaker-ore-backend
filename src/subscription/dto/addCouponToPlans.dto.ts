import { IsArray, IsNumber } from 'class-validator'

export class AddCouponToPlanDTO {
    @IsNumber()
    id: number

    @IsArray()
    plans: number[]
}
