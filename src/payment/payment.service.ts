import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common'
import * as rzp from 'razorpay'
import * as crypto from 'crypto'
import { ValidationError } from 'class-validator'
import { PaymentStartInfo } from './dto/paymentStartInfo.dto'
import { PaymentDetails } from './dto/paymentDetails.dto'
import { PaymentTransaction } from './entities/transaction.entity'
import { SubscriptionService } from 'src/subscription/subscription.service'
import { Coupon } from '../subscription/entities/coupon.entity'
import { SubscriptionHistoryDTO } from '../subscription/dto/subscription-history.dto'
import { User } from '../auth/entities/user.entity'


@Injectable()
export class PaymentService {
    private instance = null

    constructor(private subscriptionService: SubscriptionService) {
        this.instance = new rzp({
            key_id: 'jhjkh',
            key_secret: 'knhkh',
        })
    }

    startPayment = async (paymentStartInfo: PaymentStartInfo) => {
        const { currency, amount } = paymentStartInfo
        try {
            const order = await this.instance.orders.create({
                currency,
                amount,
            })
            return { order_id: order.id }
        } catch (e) {
            console.log(e)
        }
    }

    addPaymentDetails = async (payDetails: PaymentDetails) => {
        const {
            razorpay_payment_id,
            razorpay_signature,
            razorpay_order_id,
            amount,
            currency,
            couponId,
        } = payDetails

        let coupon: Coupon = null
        if (couponId) {
            coupon = await this.subscriptionService.getCouponOnly(
                parseInt(couponId)
            )
        }
        try {
            this.subscriptionService.checkValidity(coupon)

            const transaction = new PaymentTransaction()
            transaction.amount = parseFloat(amount)
            transaction.currency = currency
            transaction.razorpay_order_id = razorpay_order_id
            transaction.razorpay_signature = razorpay_signature
            transaction.razorpay_payment_id = razorpay_payment_id

            await transaction.save()
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    verifyPayment = async (
        razorpay_order_id: string,
        subscription_info: SubscriptionHistoryDTO,
        user: User
    ) => {
        const payment = await PaymentTransaction.findOne({ razorpay_order_id })
        if (!payment)
            throw new NotFoundException('Payment with given id not found')
        if (payment.verified) {
            throw new Error('Payment already verified')
        }

        const { razorpay_payment_id, razorpay_signature } = payment

        const cryptoHash = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET_ID)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex')

        if (cryptoHash === razorpay_signature) {
            try {
                payment.verified = true
                await payment.save()

                const { coupon_id } = subscription_info

                // Add The new user plan to subscription history
                await this.subscriptionService.addPlan(
                    subscription_info,
                    user,
                    payment
                )

                user.subscribed = true
                await user.save()

                if (coupon_id) {
                    const coupon = await this.subscriptionService.getCouponOnly(
                        Number(coupon_id)
                    )
                    await this.subscriptionService.deductCouponCount(coupon)
                }
            } catch (e) {
                throw new InternalServerErrorException(e)
            }
        } else {
            throw new ValidationError()
        }
    }
}
