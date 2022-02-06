import { IsNumberString, IsCurrency } from 'class-validator'

export class PaymentStartInfo {
    @IsCurrency()
    currency: string

    @IsNumberString()
    amount: string
}
