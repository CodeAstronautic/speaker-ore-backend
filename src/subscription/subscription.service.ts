import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common'
import { SubscriptionPlanRepository } from './repositories/subscription-plan.repository'
import { SubscriptionPlan } from './entities/subscription-plan.entity'
import { SubscriptionPlanDTO } from './dto/subscription-plan.dto'
import { UpdateResult, In } from 'typeorm'
import { Coupon } from './entities/coupon.entity'
import { CouponRepository } from './repositories/coupon.repository'
import { AddCouponDTO } from './dto/coupon.dto'
import { SubscriptionCouponRepository } from './repositories/subscriptionCoupon.repository'
import { SubscriptionHistoryDTO } from './dto/subscription-history.dto'
import { SubscriptionHistoryRepository } from './repositories/subscription-history.repository'
import { couponWithPlans } from './interfaces/couponWithPlans'
import { PaymentTransaction } from '../payment/entities/transaction.entity'
import { User } from '../auth/entities/user.entity'

@Injectable()
export class SubscriptionService {
    constructor(
        private subscriptionRepository: SubscriptionPlanRepository,
        private couponRepository: CouponRepository,
        private subscriptionCouponRepository: SubscriptionCouponRepository,
        private subscriptionHistoryRepository: SubscriptionHistoryRepository
    ) {}

    getSubscriptions = async (): Promise<SubscriptionPlan[]> =>
        await this.subscriptionRepository.find({})

    getSubscription = async (id: number): Promise<SubscriptionPlan> =>
        await this.subscriptionRepository.findOne({ id })

    postSubscriptionPlan = (
        subscriptionPlanDto: Omit<SubscriptionPlanDTO, 'disable'>
    ): Promise<SubscriptionPlan> => {
        return this.subscriptionRepository.insertPlan({
            ...subscriptionPlanDto,
            disable: false,
        })
    }

    updateSubscriptionPlan = (
        subscriptionPlanDto: Omit<SubscriptionPlanDTO, 'disable'>,
        id: number
    ): Promise<UpdateResult> => {
        return this.subscriptionRepository.update(
            { id },
            { ...subscriptionPlanDto }
        )
    }

    toggleDisability = async (id: number): Promise<SubscriptionPlan> => {
        return this.subscriptionRepository.toggleDisability(id)
    }

    setCouponToPlans = async (
        plans: number[],
        coupon: Coupon
    ): Promise<void> => {
        try {
            if (!coupon) throw new NotFoundException('Coupon not found')
            const plansList = await this.subscriptionRepository.find({
                where: { id: In(plans) },
            })
            await this.subscriptionCouponRepository.insertCouponInManyPlans(
                coupon,
                plansList
            )
        } catch (e) {
            console.log(e)
            throw new InternalServerErrorException(e)
        }
    }

    getCouponOnly = async (id: number): Promise<Coupon> => {
        return await this.couponRepository.findOne({ id })
    }

    getCoupons = async (): Promise<any> => {
        const coupons = await this.couponRepository.find({})
        const couponPromise = coupons.map(
            async (coupon) => await this.getCouponWithPlans(coupon)
        )
        return Promise.all(couponPromise)
    }

    getCouponWithPlans = async (coupon: Coupon): Promise<couponWithPlans> => {
        const subPlans = await this.subscriptionCouponRepository.subscriptionCouponWithPlans(
            coupon
        )
        const plans = subPlans.map((subplan) => subplan.plan.id)
        return { ...coupon, plans }
    }

    getCoupon = async (id: number): Promise<couponWithPlans> => {
        const coupon = await this.couponRepository.findOne({ id })
        if (!coupon) throw new NotFoundException('Coupon not found')
        return await this.getCouponWithPlans(coupon)
    }

    updateCoupon = async (
        coupon: AddCouponDTO,
        id: number
    ): Promise<AddCouponDTO> => this.couponRepository.updateCoupon(coupon, id)

    deductCouponCount = async (coupon: Coupon) => {
        // * This is called after the payment is completed, so make sure to verify the coupon before the payment
        if (coupon.count) {
            coupon.count -= 1
        }
        try {
            await coupon.save()
        } catch (e) {
            throw new InternalServerErrorException('Coupon can not be deducted')
        }
    }

    checkValidity = (coupon: Coupon) => {
        return this.couponRepository.checkValidity(coupon)
    }

    postCoupon = async (coupon: AddCouponDTO): Promise<Coupon> =>
        this.couponRepository.addCoupon(coupon)

    toggleCouponVisibility = async (id: number): Promise<AddCouponDTO> =>
        this.couponRepository.toggleDisability(id)

    addPlan = async (
        subscriptionHistoryDto: SubscriptionHistoryDTO,
        user: User,
        payment: PaymentTransaction
    ) => {
        const sub_plan = await this.getSubscription(
            subscriptionHistoryDto.subscription_plan_id
        )
        if (!sub_plan)
            throw new NotFoundException(
                'Subcription Service with given id not found'
            )
        this.subscriptionHistoryRepository.addPlan(
            sub_plan,
            subscriptionHistoryDto,
            user,
            payment
        )
    }

    getUpdatedPrice = async (
        plan: number,
        coupon_code: string
    ): Promise<{ price: number }> => {
        try {
            const subscriptionPlan = await this.subscriptionRepository.findOne({
                relations: ['coupons', 'coupons.coupon'],
                where: { id: plan },
            })

            if (!subscriptionPlan)
                throw new NotFoundException('Subscription Plan not found')

            const selectedCoupon = subscriptionPlan.coupons.find(
                (coupon) => coupon.coupon.code === coupon_code
            )

            if (!coupon_code || !selectedCoupon || !selectedCoupon.coupon)
                throw new NotFoundException('Coupon not found')

            const { coupon } = selectedCoupon

            this.checkValidity(coupon)

            return { price: this.updatedPrice(coupon, subscriptionPlan) }
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    updatedPrice(coupon: Coupon, subscriptionPlan: SubscriptionPlan) {
        if (coupon.price) {
            return subscriptionPlan.price - coupon.price >= 0
                ? subscriptionPlan.price - coupon.price
                : 0
        } else if (coupon.percentage) {
            const percentage = coupon.percentage
            return Math.ceil(((1 - percentage / 100) * subscriptionPlan.price))
        }
    }
}
