import { Module, HttpModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { typeOrmConfig } from './config/typeorm.config'
import { EventsModule } from './events/events.module'
import { SubscriptionModule } from './subscription/subscription.module'
import { PaymentModule } from './payment/payment.module'
import { ScheduleModule } from '@nestjs/schedule'
import { MailingModule } from './mailing/mailing.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        ScheduleModule.forRoot(),
        HttpModule,
        TypeOrmModule.forRoot(typeOrmConfig()),
        EventsModule,
        SubscriptionModule,
        PaymentModule,
        MailingModule,
    ],
})
export class AppModule {}
