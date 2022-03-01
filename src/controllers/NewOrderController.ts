import BigCommerceOrdersService from '../services/bigcommerce/BigCommerceOrdersService';
import BraintreeTransactionService from '../services/braintree/BraintreeTransactionService';
import BoldSubscriptionsService from '../services/bold/BoldSubscriptionsService';
import { BigCommerceOrder } from '../services/bigcommerce/schema';
import {
    SubscriptionItem,
    SubscriptionPayload,
    BoldCommerceAddress,
} from '../services/bold/schema';


class NewOrderController {
    bcOrders: BigCommerceOrdersService;

    braintree: BraintreeTransactionService;

    boldSubs: BoldSubscriptionsService;

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

            const { braintreeTransaction }: any = await this.braintree.transactionSearchInput(orderId, order.payment_provider_id);

            if (!braintreeTransaction || !braintreeTransaction.legacyId || !braintreeTransaction.paymentMethod ) {
                return ({ error: '2. no transaction found', status: 404 });
            }

            const subItemSets: SubscriptionItem[][] = await this.bcOrders.getSubItems(orderId, JSON.parse(order.customer_message).bold_subscriptions);

            const shippingAddress: BoldCommerceAddress = await this.bcOrders.getShippingAddress(orderId);
            const billingAddress: BoldCommerceAddress = await this.bcOrders.getBillingAddress(order.billing_address);


            const createSubscription: any = await Promise.all(subItemSets?.map(async (subItems: SubscriptionItem[], index: number) => await this.boldSubs.createSubscription(index, order, subItems, shippingAddress, billingAddress, braintreeTransaction)));

            const error = createSubscription.find((response: any) => response.error);
            if (error) {
                return { error: error.error, status: error.status };
            }

            const subscription: SubscriptionPayload[] = createSubscription.filter((response:any) => response.subscription);

            return {data: subscription, status: 201}
        } catch (error: any) {
            if (error.code && error.responseBody) {
                return { error: error.responseBody, status: error.code };
            }
            console.error(error);
            return { error, status: 500 };
        }
    }
}

export default NewOrderController;
