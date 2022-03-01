import { z } from 'zod';

import schema, {
    BoldCommerceAddress, SubscriptionPayload, SubscriptionItem,
} from '../interface/BoldCommerceInterface';
import { BigCommerceOrder } from '../../bigcommerce/interface/BigCommerceInterface';
import { Transaction } from '../../braintree/interface/BraintreeInterface';
import Boldv2 from '../../api/boldv2';

const axiosErrorSchema = z.object({
    response: z.object({
        error: z.unknown(),
        status: z.number(),
    }),
});

class Subscriptions {
    bold: Boldv2;

    constructor() {
        this.bold = new Boldv2();
    }

    async getBillingRules(groupId: string, intervalId: string, dateCreated: string) {
        try {
            const response = await this.bold.get(`/subscriptions/v1/shops/${process.env.BOLD_SHOP_IDENTIFIER}/subscription_groups/${groupId}`);
            const subscriptionGroup = schema.subscriptionGroup.parse(response.data?.subscription_group);
            const billingRule = subscriptionGroup.billing_rules.find(rule => (
                rule.id === parseInt(intervalId, 10)
                && `${rule.subscription_group_id}` === groupId
            ));

            if (!billingRule) {
                throw new Error('');
            }

            const orderDate: Date = new Date(dateCreated);
            const nextDate = ({
                day: new Date(orderDate.setDate(orderDate.getDate() + 1)).toDateString(),
                week: new Date(orderDate.setDate(orderDate.getDate() + 7)).toDateString(),
                month: new Date(orderDate.setMonth(orderDate.getMonth() + 1)).toDateString(),
                year: new Date(orderDate.setFullYear(orderDate.getFullYear() + 1)).toDateString(),
            })[billingRule.interval_type] ?? '';

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
                order_rrule: `DTSTART:${rrule}T080000Z\nRRULE:${billingRule.billing_rule}`,
            };
        } catch (err) {
            const axiosResponse = axiosErrorSchema.safeParse(err);
            if (axiosResponse.success) {
                const { response: { error, status } } = axiosResponse.data;
                return { error, status };
            }

            throw err; // not sure if this is the best thing to do here
        }
    }

    async createSubscription(
        index: number,
        order: BigCommerceOrder,
        lineItems: SubscriptionItem[],
        billingAddress: BoldCommerceAddress,
        shippingAddress: BoldCommerceAddress,
        braintreeTransaction: Transaction,
    ) {
        try {
            const lineItem = lineItems[0];
            if (!lineItem) {
                throw new Error('lineitems array is empty');
            }

            const billingRules = await this.getBillingRules(lineItem.subscription_group_id, lineItem.interval_id, order.date_created);
            if (billingRules.error) {
                return { status: billingRules.status, error: billingRules.error };
            }

            if (billingRules.next_order_datetime === undefined || billingRules.last_order_datetime === undefined) {
                throw new Error('date not found');
            }
            const gatewayName = braintreeTransaction.paymentMethod.details.__typename === 'PayPalAccountDetails'
                ? 'Braintree Paypal'
                : 'Braintree Credit Card';

            const body: SubscriptionPayload = {
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

            try {
                const { data, status } = await this.bold.post(`/subscriptions/v1/shops/${process.env.BOLD_SHOP_IDENTIFIER}/subscriptions`, body);
                const subscription = schema.subscription.parse(data.subscription);

                return { subscription, status };
            } catch (err) {
                const axiosResponse = axiosErrorSchema.safeParse(err);

                if (axiosResponse.success) {
                    const { response: { error, status } } = axiosResponse.data;
                    return { error, status };
                }

                throw err;
            }
        } catch (error) {
            return error;
        }
    }
}

export default Subscriptions;
