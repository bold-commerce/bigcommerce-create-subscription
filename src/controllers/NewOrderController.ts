import BigCommerceOrdersService from '../services/bigcommerce/BigCommerceOrdersService';
import BoldSubscriptionsService from '../services/bold/BoldSubscriptionsService';
import { BigCommerceOrder } from '../services/bigcommerce/schema';

import PaymentController from './PaymentController';

interface ResponseBodyError<T> {
    responseBody: T,
    code: number,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isResponseBodyError<T>(error: ResponseBodyError<T> | any): error is ResponseBodyError<T> {
    return error && error.responseBody && error.code;
}

class NewOrderController {
    private bcOrders: BigCommerceOrdersService;

    private boldSubs: BoldSubscriptionsService;

    private payments: PaymentController;

    constructor() {
        this.bcOrders = new BigCommerceOrdersService();
        this.boldSubs = new BoldSubscriptionsService();
        this.payments = new PaymentController();
    }


    async handleNewBigCommerceOrder(orderId: number, transactionId: string) {
        try {
            // check bigcommerce order transaction for successful purchase
            const orderTransaction = await this.bcOrders.getOrderTransaction(orderId, transactionId);
            if (orderTransaction.status === 'error') {
                return { error: JSON.stringify(orderTransaction), status: 500 };
            }

            // get bigcommerce order data
            const order: BigCommerceOrder = await this.bcOrders.getOrder(orderId);

            if (!order || !order?.customer_message?.includes('bold_subscriptions')) {
                return { error: '1. no order found, or no subscription items found on this order', status: 422 };
            }

            // filter payment transaction data
            const paymentTransaction = await this.payments.handlePayments(orderTransaction.payment_method_id, orderId, order.payment_provider_id);

            if (paymentTransaction?.error
                || !paymentTransaction
                || paymentTransaction.status !== 'ok'
                || !paymentTransaction.token
                || !paymentTransaction.gateway_name) {
                return ({ error: paymentTransaction?.error, status: 404 });
            }

            // format subscription
            const subItemSets = await this.bcOrders.getSubItems(orderId, JSON.parse(order.customer_message).bold_subscriptions);
            const shippingAddress = await this.bcOrders.getShippingAddress(orderId);
            const billingAddress = await this.bcOrders.getBillingAddress(order.billing_address);

            // create subscription
            const createSubscriptionResponses = await Promise.all(
                subItemSets?.map(
                    (subItems, index) => this.boldSubs.createSubscription(
                        index,
                        order,
                        subItems,
                        shippingAddress,
                        billingAddress,
                        order.payment_provider_id,
                        paymentTransaction.gateway_name,
                        paymentTransaction.token,
                    ),
                ),
            );

            const error = createSubscriptionResponses.find(response => response.error);
            if (error) {
                return { error: error.error, status: error.status };
            }

            const subscription = createSubscriptionResponses.filter(response => !response.error);
            return { data: subscription, status: 201 };
        } catch (error) {
            if (isResponseBodyError(error)) {
                return { error: error.responseBody, status: error.code };
            }

            throw error;
        }
    }
}

export default NewOrderController;
