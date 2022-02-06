import { Repository, EntityRepository } from 'typeorm'
import { InternalServerErrorException, NotAcceptableException } from '@nestjs/common'

import { SubscriptionPlan } from '../entities/subscription-plan.entity'
import { SubscriptionPlanDTO } from '../dto/subscription-plan.dto'

@EntityRepository(SubscriptionPlan)
export class SubscriptionPlanRepository extends Repository<SubscriptionPlan> {
    toggleDisability = async (id: number): Promise<SubscriptionPlan> => {
        try {
            const plan = await this.findOne({ id })
            plan.disable = !plan.disable
            return await plan.save()
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    insertPlan = async(subscriptionPlanDto: SubscriptionPlanDTO): Promise<SubscriptionPlan> => {
        try {
            const { name } = subscriptionPlanDto;
            const checkName = await this.findOne({ name })

            if (checkName) throw new NotAcceptableException("Name already exists")

            const plan = this.create();
            
            for (let key in subscriptionPlanDto) {
                plan[key] = subscriptionPlanDto[key];
            }

            await plan.save();
            return plan;
        } catch(e) {
            throw new InternalServerErrorException(e);
        }
    }
}
