import {
    Controller,
    Post,
    Body,
    ValidationPipe,
    UseGuards,
} from '@nestjs/common'
import { PaymentService } from './payment.service'
import { PaymentStartInfo } from './dto/paymentStartInfo.dto'
import { PaymentDetails } from './dto/paymentDetails.dto'
import { AuthGuard } from '@nestjs/passport'
import { SubscriptionHistoryDTO } from '../subscription/dto/subscription-history.dto'
import { User } from '../auth/entities/user.entity'
import { GetUser } from '../auth/decorators/get-user.decorator'

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Post()
    @UseGuards(AuthGuard())
    async startPayment(
        @Body(ValidationPipe) paymentStartInfo: PaymentStartInfo
    ): Promise<{ order_id: string }> {
        return this.paymentService.startPayment(paymentStartInfo)
    }

    @Post()
    @UseGuards(AuthGuard())
    async verifyPayment(
        @Body('razorpay_order_id') razorpay_order_id: string,
        @Body('subscription_info') subscription_info: SubscriptionHistoryDTO,
        @GetUser() user: User
    ): Promise<any> {
        return this.paymentService.verifyPayment(
            razorpay_order_id,
            subscription_info,
            user
        )
    }

    @Post('/addpaymentdetails')
    @UseGuards(AuthGuard())
    async addPaymentDetails(
        @Body(ValidationPipe) paymentDetails: PaymentDetails
    ): Promise<any> {
        return this.paymentService.addPaymentDetails(paymentDetails)
    }
}
