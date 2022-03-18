import request from 'supertest';

import BigCommerceOrdersService from './services/bigcommerce/BigCommerceOrdersService';
import BraintreeTransactionService from './services/braintree/BraintreeTransactionService';
import PaymentController from './controllers/PaymentController';

import app from './index';


const order: string | undefined = process.env.BIGCOMMERCE_TEST_ORDER;
const bcOrder = new BigCommerceOrdersService();
const braintree = new BraintreeTransactionService();
const payments = new PaymentController();

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

    it('An error occured with the payment method', async () => {
        const bigcommerceOrder = await bcOrder.getOrder(orderId);
        const orderTransactionData = await bcOrder.getOrderTransaction(orderId, bigcommerceOrder.payment_provider_id);

        expect(orderTransactionData.status).toEqual('ok');

        const paymentData: any = await payments.handlePayments(orderTransactionData.payment_method_id, orderId, bigcommerceOrder.payment_provider_id);

        expect(paymentData.status).toEqual('ok');
    });

    it('BigCommerce transaction is created and creates a Bold Subscription', async () => {
        const bigcommerceOrder = await bcOrder.getOrder(orderId);
        const res = await request(app)
            .post('/test/webhooks/orders')
            .send({
                scope: 'store/order/transaction/created',
                data: {
                    order_id: orderId,
                    transaction_id: bigcommerceOrder.payment_provider_id,
                },
            })
            .set({ 'x-webhook-header': process.env.PLATFORM_TOKEN });
        expect(res.body.status).toEqual(201);
        expect(res.statusCode).toEqual(200);
    });
    jest.clearAllTimers();
});
