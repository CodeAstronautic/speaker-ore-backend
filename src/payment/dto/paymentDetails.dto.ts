import {
    IsString,
    IsCurrency,
    IsAlpha,
    IsOptional,
    IsNumberString,
} from 'class-validator'

export class PaymentDetails {
    @IsString()
    razorpay_payment_id: string

    @IsString()
    razorpay_order_id: string

    @IsString()
    razorpay_signature: string

    @IsCurrency()
    amount: string

    @IsAlpha()
    currency: string

    @IsNumberString()
    couponId: string
}
