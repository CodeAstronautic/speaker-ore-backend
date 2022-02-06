import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { SubscriptionModule } from '../subscription/subscription.module'
import { PaymentController } from './payment.controller'
import { PaymentService } from './payment.service'

@Module({
    imports: [AuthModule, SubscriptionModule],
    controllers: [PaymentController],
    providers: [PaymentService],
})
export class PaymentModule {}
