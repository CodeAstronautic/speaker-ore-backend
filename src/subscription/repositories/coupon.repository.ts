import {
    Repository,
    EntityRepository,
} from 'typeorm'
import { Coupon } from '../entities/coupon.entity'
import { AddCouponDTO } from '../dto/coupon.dto'
import {
    BadRequestException,
    InternalServerErrorException,
    NotAcceptableException,
    NotFoundException,
} from '@nestjs/common'
import { DateTime } from 'luxon'

@EntityRepository(Coupon)
export class CouponRepository extends Repository<Coupon> {
    checkValidity = (coupon: Coupon): boolean => {
        const { count, end_date, price, percentage } = coupon
        if (!count && !end_date)
            throw new BadRequestException(
                'one of the count or end_date must be present'
            )
        if (!price && !percentage)
            throw new BadRequestException(
                'one of the price or percentage must be present'
            )
        return this.checkExpiration(coupon)
    }

    checkExpiration = (coupon: Coupon): boolean => {
        const { count, end_date } = coupon
        if (
            (count && count <= 0) ||
            (end_date && DateTime.fromISO(end_date) < DateTime.local())
        ) {
            return false
        }
        return true
    }

    addCoupon = async (coupon: AddCouponDTO): Promise<Coupon> => {
        const { code, count, end_date, price, percentage, name, description } = coupon

        const duplicateCode = await this.findOne({ code })
        if (duplicateCode) {
            throw new NotAcceptableException('this coupon code already exists')
        }

        const newCoupon = this.create()
        newCoupon.code = code
        if (end_date) newCoupon.end_date = end_date
        if (count) newCoupon.count = count
        if (price) newCoupon.price = price
        if (percentage) newCoupon.percentage = percentage
        if (name) newCoupon.name = name
        if (description) newCoupon.description = description;

        this.checkValidity(newCoupon)

        try {
            await newCoupon.save()
            return newCoupon
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    updateCoupon = async (
        coupon: AddCouponDTO,
        id: number
    ): Promise<AddCouponDTO> => {
        const { code, count, end_date, price, percentage, name, description } = coupon

        const updateCoupon = await this.findOne({ id })

        if (!updateCoupon) throw new NotFoundException("Coupon not found")

        updateCoupon.code = code
        if (end_date) updateCoupon.end_date = end_date
        if (count) updateCoupon.count = count
        if (price) updateCoupon.price = price
        if (percentage) updateCoupon.percentage = percentage
        if (name) updateCoupon.name = name
        if (description) updateCoupon.description = description;

        this.checkValidity(updateCoupon)
        await updateCoupon.save()
        return coupon
    }

    toggleDisability = async (id: number): Promise<AddCouponDTO> => {
        try {
            const coupon = await this.findOne({ id })

            if (!coupon) throw new NotFoundException("Coupon not found")

            coupon.disable = !coupon.disable
            await coupon.save()
            return { ...coupon }
        } catch (e) {
            if (e instanceof NotFoundException) throw new NotFoundException("Coupon not found")
            throw new InternalServerErrorException()
        }
    }
}
