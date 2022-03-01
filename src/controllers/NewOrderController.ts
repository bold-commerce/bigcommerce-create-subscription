import BigCommerceOrdersService from '../services/bigcommerce/BigCommerceOrdersService';
import BraintreeTransactionService from '../services/braintree/BraintreeTransactionService';
import BoldSubscriptionsService from '../services/bold/BoldSubscriptionsService';
import { BigCommerceOrder } from '../services/bigcommerce/schema';

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

    private braintree: BraintreeTransactionService;

    private boldSubs: BoldSubscriptionsService;

    constructor() {
        this.bcOrders = new BigCommerceOrdersService();
        this.braintree = new BraintreeTransactionService();
        this.boldSubs = new BoldSubscriptionsService();
    }


    async handleNewBigCommerceOrder(orderId: number) {
        try {
            const order: BigCommerceOrder = await this.bcOrders.getOrder(orderId);
            if (!order || !order?.customer_message?.includes('bold_subscriptions')) {
                return { error: '1. no order found, or no subscription items found on this order', status: 422 };
            }

            const { braintreeTransaction } = await this.braintree.transactionSearchInput(orderId, order.payment_provider_id);
            if (!braintreeTransaction || !braintreeTransaction.legacyId || !braintreeTransaction.paymentMethod) {
                return ({ error: '2. no transaction found', status: 404 });
            }

            const subItemSets = await this.bcOrders.getSubItems(orderId, JSON.parse(order.customer_message).bold_subscriptions);
            const shippingAddress = await this.bcOrders.getShippingAddress(orderId);
            const billingAddress = await this.bcOrders.getBillingAddress(order.billing_address);

            const createSubscriptionResponses = await Promise.all(
                subItemSets?.map(
                    (subItems, index) => this.boldSubs.createSubscription(
                        index,
                        order,
                        subItems,
                        shippingAddress,
                        billingAddress,
                        braintreeTransaction,
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
