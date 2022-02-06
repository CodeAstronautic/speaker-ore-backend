import { Module } from '@nestjs/common'
import { MailingController } from './mailing.controller'
import { MailingService } from './mailing.service'
import { AuthModule } from 'src/auth/auth.module'
import { SubscriptionModule } from 'src/subscription/subscription.module'

@Module({
    imports: [AuthModule, SubscriptionModule],
    controllers: [MailingController],
    providers: [MailingService],
})
export class MailingModule {}
