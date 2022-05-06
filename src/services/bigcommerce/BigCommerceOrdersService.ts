import BigCommerce from 'node-bigcommerce';

import states from '../../states.json';
import { BoldCommerceAddress, SubscriptionItem } from '../bold/schema';

import bigCSchema, { BigCommerceOrder } from './schema';


function bigcommerceClient(apiVersion: string) {
    return new BigCommerce({
        clientId: process.env.PLATFORM_CLIENT,
        accessToken: process.env.PLATFORM_TOKEN,
        storeHash: process.env.PLATFORM_IDENTIFIER,
        responseType: 'json',
        apiVersion,
    });
}

class BigCommerceOrdersService {
    bc2: BigCommerce;

    bc3: BigCommerce;

    constructor() {
        this.bc2 = bigcommerceClient('v2');
        this.bc3 = bigcommerceClient('v3');
    }

    async getOrderTransaction(orderId: number, transactionId: string) {
        const bcTransactionResult = bigCSchema.orderTransactionsResponse.parse(await this.bc3.get(`/orders/${orderId}/transactions`));
        const bcTransaction = bcTransactionResult.data
            .find(data => data && data.gateway_transaction_id.includes(transactionId));

        if (!bcTransaction
            || bcTransaction.status !== 'ok'
            || bcTransaction.event !== 'purchase'
            || bcTransaction.payment_instrument_token === null) {
            const message = bcTransaction
                && bcTransaction.payment_instrument_token === null
                ? 'This was a one time purchase'
                : 'Something went wrong with this transaction, the transaction may have been declined';

            return {
                error: message,
                data: bcTransactionResult,
                payment_method_id: 'error',
                status: 'error',
            };
        }
        return bcTransaction;
    }

    async getOrder(orderId: number) {
        return bigCSchema.order.parse(await this.bc2.get(`/orders/${orderId}`));
    }

    async getSubItems(orderId: number, subsData: Omit<SubscriptionItem, 'price'>[]) {
        const data = bigCSchema.orderProducts.parse(await this.bc2.get(`/orders/${orderId}/products`));

        const subTypes: Pick<SubscriptionItem, 'interval_id' | 'subscription_group_id'>[] = [];

        const items: SubscriptionItem[] = await Promise.all(subsData.map((item) => {
            const orderItem = data.find(x => x.variant_id === parseInt(item.platform_variant_id, 10));
            if (!orderItem) {
                throw new Error(`Could not find order item for BigCommerce variant ID ${item.platform_product_id}`);
            }

            subTypes.push({
                interval_id: item.interval_id,
                subscription_group_id: item.subscription_group_id,
            });

            return {
                line_item_id: item.line_item_id,
                interval_id: item.interval_id,
                interval_text: item.interval_text,
                subscription_group_id: item.subscription_group_id,
                platform_product_id: item.platform_product_id,
                platform_variant_id: item.platform_variant_id,
                quantity: item.quantity,
                price: (Number.parseFloat(orderItem.base_price) * 100),
            };
        }));

        const subSets = [...new Map(subTypes.map(obj => [JSON.stringify(obj), obj])).values()];

        return subSets.map(x => items.filter(item => (
            item.interval_id === x.interval_id
            && item.subscription_group_id === x.subscription_group_id
        )));
    }

    async getShippingAddress(orderId: number): Promise<BoldCommerceAddress> {
        const data = bigCSchema.shippingAddresses.parse(await this.bc2.get(`/orders/${orderId}/shipping_addresses`));
        const address = data[0];
        if (!address) {
            throw new Error(`No shipping addresses for BigCommerce order ID ${orderId}`);
        }

        const country = states.find(territory => territory.abbreviation === address.country_iso2);
        if (country === undefined) {
            throw new Error(`Could not find country mapping for ISO ${address.country_iso2}`);
        }

        const province = country.states.find(state => state.name === address.state);
        if (province === undefined) {
            throw new Error(`Could not find province mapping for state ${address.state}`);
        }

        return {
            first_name: address.first_name,
            last_name: address.last_name,
            company: address.company,
            phone: address.phone,
            street1: address.street_1,
            street2: address.street_2,
            city: address.city,
            province: address.state,
            province_code: province.abbreviation,
            country: address.country,
            country_code: address.country_iso2,
            zip: address.zip,
        };
    }

    // eslint-disable-next-line class-methods-use-this
    async getBillingAddress(billingAddress: BigCommerceOrder['billing_address']): Promise<BoldCommerceAddress> {
        const country = states.find(territory => territory.abbreviation === billingAddress.country_iso2);
        if (country === undefined) {
            throw new Error(`Could not find country mapping for ISO ${billingAddress.country_iso2}`);
        }

        const province = country.states.find(state => state.name === billingAddress.state);
        if (province === undefined) {
            throw new Error(`Could not find province mapping for state ${billingAddress.state}`);
        }

        return {
            first_name: billingAddress.first_name,
            last_name: billingAddress.last_name,
            company: billingAddress.company,
            phone: billingAddress.phone,
            street1: billingAddress.street_1,
            street2: billingAddress.street_2,
            city: billingAddress.city,
            province: billingAddress.state,
            province_code: province.abbreviation,
            country: billingAddress.country,
            country_code: billingAddress.country_iso2,
            zip: billingAddress.zip,
        };
    }

    async gerOrderItems(orderId: number) {
        return bigCSchema.orderProducts.parse(await this.bc2.get(`/orders/${orderId}/products`));
    }
}
export default BigCommerceOrdersService;
