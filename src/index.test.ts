import request from 'supertest';
import * as dotenv from 'dotenv';

import { createConfigFromEnvironment } from './config';
import BigCommerceOrdersService from './services/bigcommerce/BigCommerceOrdersService';
import BraintreeTransactionService from './services/braintree/BraintreeTransactionService';

import app from './index';

dotenv.config();
const config = createConfigFromEnvironment();

const order: string | undefined = process.env.BIGCOMMERCE_TEST_ORDER;
const bcOrder = new BigCommerceOrdersService(config);
const braintree = new BraintreeTransactionService(config);

describe('post /test/webhooks/orders', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setTimeout(100000);
    });

    if (order === undefined) {
        throw new Error('Order is Missing');
    }
    const orderId: number = parseInt(order, 10);

    it('get BigCommerce order data', async () => {
        const res = await bcOrder.getOrder(orderId);
        expect(orderId).toEqual(res.id);
    });

    it('Bold Commerce subscription data found in order', async () => {
        const bigcommerceOrder = await bcOrder.getOrder(orderId);
        expect(bigcommerceOrder.customer_message).toContain('bold_subscriptions');
    });

    it('Braintree transaction data found & matches BigCommerce order data', async () => {
        const bigcommerceOrder = await bcOrder.getOrder(orderId);
        const res: any = await braintree.transactionSearchInput(orderId, bigcommerceOrder.payment_provider_id);
        expect(bigcommerceOrder.payment_provider_id).toEqual(res.braintreeTransaction?.legacyId);
    });

    it('BigCommerce transaction is created and creates a Bold Subscription', async () => {
        const res = await request(app)
            .post('/test/webhooks/orders')
            .send({
                scope: 'store/order/transaction/created',
                data: {
                    order_id: orderId,
                },
            })
            .set({ 'x-webhook-header': config.platform.accessToken });
        expect(res.statusCode).toEqual(201);
    });
    jest.clearAllTimers();
});
