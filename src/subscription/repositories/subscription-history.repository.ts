import { Repository, EntityRepository } from 'typeorm'
import { SubscriptionPlan } from '../entities/subscription-plan.entity'
import { InternalServerErrorException } from '@nestjs/common'
import { SubscriptionHistory } from '../entities/subscription-history.entity'
import { SubscriptionHistoryDTO } from '../dto/subscription-history.dto'
import { DateTime } from 'luxon'
import { User } from '../../auth/entities/user.entity'
import { PaymentTransaction } from '../../payment/entities/transaction.entity'

@EntityRepository(SubscriptionPlan)
export class SubscriptionHistoryRepository extends Repository<
    SubscriptionHistory
> {
    addPlan = async (
        subscription_plan: SubscriptionPlan,
        subscription_history_dto: SubscriptionHistoryDTO,
        user: User,
        payment: PaymentTransaction
    ): Promise<SubscriptionHistory> => {
        const { duration } = subscription_plan
        const { coupon_id } = subscription_history_dto

        const curr_time = DateTime.local()

        const plan = this.create()
        plan.start_time = curr_time.toISO()
        plan.end_time = curr_time.plus({ months: duration }).toISO()
        plan.subscription_plan = subscription_plan
        plan.coupon_id = coupon_id
        plan.user = user
        plan.payment = payment

        try {
            return await plan.save()
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }
}
