import { Transaction } from '../braintree/schema';
import BoldApiClient from '../../clients/BoldApiClient';
import { BigCommerceOrder } from '../bigcommerce/schema';
import { Config } from '../../config';
import {
    DependencyError,
    InvalidInputError,
    ResourceNotFoundError,
} from '../../errors';

import schema, {
    BoldCommerceAddress,
    CreateSubscriptionPayload,
    SubscriptionItem,
} from './schema';

class BoldSubscriptionsService {
    private bold: BoldApiClient;

    private shopIdentifier: string;

    constructor(config: Pick<Config, 'bold'>) {
        this.bold = new BoldApiClient(config);
        this.shopIdentifier = config.bold.shopIdentifier;
    }

    async getBillingRules(groupId: string, intervalId: string, dateCreated: string) {
        const { data } = await this.bold.get(`/subscriptions/v1/shops/${this.shopIdentifier}/subscription_groups/${groupId}`);
        const subscriptionGroup = schema.subscriptionGroup.safeParse(data.subscription_group);
        if (!subscriptionGroup.success) {
            throw new DependencyError('Bold Subscriptions (failed to parse subscription group)');
        }

        const billingRules = subscriptionGroup.data.billing_rules.find(
            rule => rule.id === parseInt(intervalId, 10) && `${rule.subscription_group_id}` === `${groupId}`,
        );
        if (!billingRules) {
            throw new ResourceNotFoundError(`Could not find subscription group for interval ID ${intervalId}`);
        }

        const orderDate: Date = new Date(dateCreated);
        const nextDate = ({
            day: new Date(orderDate.setDate(orderDate.getDate() + 1)).toDateString(),
            week: new Date(orderDate.setDate(orderDate.getDate() + 7)).toDateString(),
            month: new Date(orderDate.setMonth(orderDate.getMonth() + 1)).toDateString(),
            year: new Date(orderDate.setFullYear(orderDate.getFullYear() + 1)).toDateString(),
        })[billingRules.interval_type] ?? '';

        const createdDate = new Date(dateCreated).toISOString().split('T')[0];
        const rruleDate = new Date(nextDate).toISOString().split('T')[0];
        if (!rruleDate) {
            throw new Error('RRule date not found');
        }
        const rrule = rruleDate.replace(/-/g, '');

        return {
            subscription_group_id: groupId,
            interval_id: intervalId,
            next_order_datetime: `${rruleDate}T08:00:00Z`,
            last_order_datetime: `${createdDate}T08:00:00Z`,
            order_rrule: `DTSTART:${rrule}T080000Z\nRRULE:${billingRules.billing_rule}`,
        };
    }

    async createSubscription(
        index: number,
        order: BigCommerceOrder,
        lineItems: SubscriptionItem[],
        billingAddress: BoldCommerceAddress,
        shippingAddress: BoldCommerceAddress,
        braintreeTransaction: Transaction,
    ) {
        const lineItem = lineItems[0];
        if (!lineItem) {
            throw new InvalidInputError('Order line items array is empty');
        }

        const billingRules = await this.getBillingRules(lineItem.subscription_group_id, lineItem.interval_id, order.date_created);

        if (!braintreeTransaction.paymentMethod) {
            throw new InvalidInputError('Braintree payment method not found. Cannot create subscription for guest shopper.');
        }
        const gatewayName = braintreeTransaction.paymentMethod.details.__typename === 'PayPalAccountDetails'
            ? 'Braintree Paypal'
            : 'Braintree Credit Card';

        const body: CreateSubscriptionPayload = {
            customer: {
                first_name: order.billing_address.first_name,
                last_name: order.billing_address.last_name,
                email: order.billing_address.email,
                phone: order.billing_address.phone,
                notes: '',
            },
            subscription: {
                idempotency_key: `${braintreeTransaction.legacyId}-${index}`,
                next_order_datetime: billingRules.next_order_datetime,
                last_order_datetime: billingRules.last_order_datetime,
                subscription_status: 'active',
                order_rrule: billingRules.order_rrule,
                base_currency: order.currency_code,
                charged_currency: order.currency_code,
                base_to_charged_exchange_rate: parseInt(order.currency_exchange_rate, 10),
                line_items: lineItems,
                billing_address: billingAddress,
                shipping_address: shippingAddress,
                external_id: order.id.toString(),
                note: order.staff_notes,
                payment_details: {
                    gateway_name: gatewayName,
                    gateway_customer_id: braintreeTransaction.paymentMethod.legacyId,
                },
            },
        };

        // TODO: We should probably add parsing to this, so that we can verify the results aren't changing
        // without us knowing
        const { data } = await this.bold.post(`/subscriptions/v1/shops/${this.shopIdentifier}/subscriptions`, body);
        return { subscription: data };
    }
}

export default BoldSubscriptionsService;
