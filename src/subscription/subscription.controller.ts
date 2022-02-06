import {
    Controller,
    Get,
    Post,
    Put,
    UseGuards,
    Body,
    ParseIntPipe,
    Param,
    ValidationPipe,
    Query
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { SubscriptionService } from './subscription.service'
import { SubscriptionPlan } from './entities/subscription-plan.entity'
import { UpdateResult } from 'typeorm'
import { SubscriptionPlanDTO } from './dto/subscription-plan.dto'
import { AddCouponDTO } from './dto/coupon.dto'
import { couponWithPlans } from './interfaces/couponWithPlans'
import { ModGuard } from '../auth/guards/mod.guard'

@Controller('subscription')
export class SubscriptionController {
    constructor(private subscriptionService: SubscriptionService) {}

    /*
     * Add COUPON to SUBSCRIPTION plan APIS
     */

    @Post('/setcoupon')
    @UseGuards(new ModGuard())
    async setCouponToPlan(
        @Body('plans', ValidationPipe) addCouponToPlanDto: number[],
        @Body('coupon') addCouponDto: AddCouponDTO
    ): Promise<void> {
        const newCoupon = await this.subscriptionService.postCoupon(
            addCouponDto
        )
        return this.subscriptionService.setCouponToPlans(
            addCouponToPlanDto,
            newCoupon
        )
    }

    @Put('/setcoupon/:id')
    @UseGuards(new ModGuard())
    async updateCouponToPlan(
        @Param('id', ParseIntPipe) id: number,
        @Body('plans', ValidationPipe) addCouponToPlanDto: number[],
    ): Promise<void> {
        const coupon = await this.subscriptionService.getCouponOnly(id);

        return this.subscriptionService.setCouponToPlans(
            addCouponToPlanDto,
            coupon
        )
    }

    /*
     * COUPON APIS
     */

    @Get('/coupon')
    @UseGuards(new ModGuard())
    async getCoupons(): Promise<any> {
        return this.subscriptionService.getCoupons()
    }

    @Get('/coupon/:id')
    @UseGuards(new ModGuard())
    async getCoupon(@Param('id', ParseIntPipe) id: number): Promise<couponWithPlans> {
        return this.subscriptionService.getCoupon(id)
    }

    @Post('/coupon')
    @UseGuards(new ModGuard())
    async postCoupon(@Body() coupon: AddCouponDTO): Promise<AddCouponDTO> {
        return this.subscriptionService.postCoupon(coupon)
    }

    @Put('/coupon/:id')
    @UseGuards(new ModGuard())
    async updateCoupon(
        @Param('id', ParseIntPipe) id: number,
        @Body() coupon: AddCouponDTO
    ): Promise<AddCouponDTO> {
        return this.subscriptionService.updateCoupon(coupon, id)
    }

    @Put('/coupon/toggle/:id')
    @UseGuards(new ModGuard())
    async toggleCouponVisibility(
        @Param('id', ParseIntPipe) id: number
    ): Promise<AddCouponDTO> {
        return this.subscriptionService.toggleCouponVisibility(id)
    }

    @Get()
    async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
        return this.subscriptionService.getSubscriptions()
    }

    @Get('/price')
    @UseGuards(AuthGuard())
    async getUpdatedPrice(
        @Query('plan', ParseIntPipe) event: number,
        @Query('coupon_code') coupon: string
    ): Promise<{ price: number }> {
        return this.subscriptionService.getUpdatedPrice(event, coupon)
    }

    @Get('/:id')
    async getSubscriptionPlan(
        @Param('id', ParseIntPipe) id: number
    ): Promise<SubscriptionPlan> {
        return this.subscriptionService.getSubscription(id)
    }

    @Post()
    @UseGuards(new ModGuard())
    async postSubscriptionPlans(
        @Body() addSubscriptionPlanDto: Omit<SubscriptionPlanDTO, "disable">
    ): Promise<SubscriptionPlan> {
        return this.subscriptionService.postSubscriptionPlan(addSubscriptionPlanDto)
    }

    @Put('/toggle/:id')
    @UseGuards(new ModGuard())
    async togglePlanVisibility(
        @Param('id', ParseIntPipe) id: number
    ): Promise<SubscriptionPlan> {
        return this.subscriptionService.toggleDisability(id)
    }

    @Put('/:id')
    @UseGuards(new ModGuard())
    async updateSubscriptionPlan(
        @Param('id', ParseIntPipe) id: number,
        @Body()
        subscriptionPlanDto: Omit<SubscriptionPlanDTO, 'disable'>
    ): Promise<UpdateResult> {
        return this.subscriptionService.updateSubscriptionPlan(
            subscriptionPlanDto,
            id
        )
    }
}
