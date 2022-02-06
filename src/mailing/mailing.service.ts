import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { DateTime } from 'luxon'
import * as AWS from 'aws-sdk'
import { SendEmailResponse } from 'aws-sdk/clients/sesv2'
import { User } from '../auth/entities/user.entity'
import { UserRepository } from '../auth/repositories/user.repository'

const DAY_LIMIT = 5

const emailData: AWS.SES.SendTemplatedEmailRequest = {
    Destination: {
        /* required */
        CcAddresses: [
            'blbumrela98@gmail.com',
            /* more items */
        ],
        ToAddresses: [
            'brijeshbumrela@gmail.com',
            /* more items */
        ],
    },
    Template: "MY TEMPLATE NAME",
    TemplateData: `{ "hi": "balue" }`,
    Source: 'speakerore@gmail.com' /* required */,
}

@Injectable()
export class MailingService {
    constructor(private userRepository: UserRepository) {
        AWS.config.update({ region: 'ap-south-1' })
    }

    async sendMail(): Promise<SendEmailResponse> {
        try {
            return await new AWS.SES({ apiVersion: 'latest' }).sendTemplatedEmail(emailData).promise();
        } catch(e) {
            throw new InternalServerErrorException(e);
        }
    }

    @Cron('0 8 * * *')
    async warningMail() {
        const users = await this.userRepository.find({})
        users.forEach(user => {
            let last_date = this.getLatestExpirationDate(user)
            if (this.lessByDays(DAY_LIMIT, last_date)) {
                // sendmail()
            }
        })
    }

    @Cron('0 10 * * *')
    async checkSubscription() {
        const users = await this.userRepository.find({})

        users.forEach(user => {
            // Setting the latest time from all user plans
            let last_date = this.getLatestExpirationDate(user)

            // If the latest date from plan is smaller than current time, then it's subscription plan has expired
            if (last_date < DateTime.local()) {
                try {
                    user.subscribed = false
                    user.save()
                } catch (e) {
                    throw new InternalServerErrorException(
                        'Unable to automatically unsubscribe the user'
                    )
                }
            }
        })
    }

    // Among the list of plans user has subscribed so far,
    // it returns the the plan with end_time being the closest to current time
    getLatestExpirationDate = (user: User): DateTime => {
        const plans = user.plans
        let last_date: DateTime
        plans.forEach(plan => {
            if (!last_date) last_date = DateTime.fromISO(plan.end_time)
            else if (last_date < DateTime.fromISO(plan.end_time)) {
                last_date = DateTime.fromISO(plan.end_time)
            }
        })
        return last_date
    }

    lessByDays = (day: number, date: DateTime): boolean => {
        return date.plus({ days: day }) > DateTime.local()
    }
}
