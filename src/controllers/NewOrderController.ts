import BigCommerceOrdersService from '../services/bigcommerce/BigCommerceOrdersService';
import BraintreeTransactionService from '../services/braintree/BraintreeTransactionService';
import BoldSubscriptionsService from '../services/bold/BoldSubscriptionsService';
import { Config } from '../config';

class NewOrderController {
    private bcOrders: BigCommerceOrdersService;

    private braintree: BraintreeTransactionService;

    private boldSubs: BoldSubscriptionsService;

    constructor(config: Pick<Config, 'platform' | 'bold' | 'braintree'>) {
        this.bcOrders = new BigCommerceOrdersService(config);
        this.braintree = new BraintreeTransactionService(config);
        this.boldSubs = new BoldSubscriptionsService(config);
    }

    async handleNewBigCommerceOrder(orderId: number) {
        const order = await this.bcOrders.getOrder(orderId);
        const { braintreeTransaction } = await this.braintree.transactionSearchInput(orderId, order.payment_provider_id);
        const subItemSets = await this.bcOrders.getSubItems(orderId, JSON.parse(order.customer_message).bold_subscriptions);
        const shippingAddress = await this.bcOrders.getShippingAddress(orderId);
        const billingAddress = await this.bcOrders.getBillingAddress(order.billing_address);

        return Promise.all(
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
    }
}

export default NewOrderController;
