import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config();


class StripeTransactionService {
    stripe: Stripe;

    constructor() {
        const apiToken = process.env.STRIPE_API_TOKEN;
        if (apiToken === undefined) {
            throw new Error('Bold Demo Api is undefined');
        }

        this.stripe = new Stripe(apiToken, {
            apiVersion: '2020-08-27',
        });
    }

    async init(transactionId: string) {
        const transaction = await this.stripe.paymentIntents.retrieve(transactionId);

        if (!transaction || transaction.customer === null || !transaction.customer) {
            return { status: 'error', error: '2. no Stripe transaction found', token: null };
        }
        const token: any = transaction.customer;
        return { status: 'ok', token, error: null };
    }
}

export default StripeTransactionService;
