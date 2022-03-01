import BigCommerce from 'node-bigcommerce';

import states from '../../../states.json';
import { BigCommerceShippingAddress, BigCommerceOrder } from '../interface/BigCommerceInterface';
import { BoldCommerceAddress, SubscriptionItem } from '../../bold/interface/BoldCommerceInterface';

class BigCommerceOrders {
    bc2: BigCommerce;

    constructor() {
        this.bc2 = new BigCommerce({
            clientId: process.env.PLATFORM_CLIENT,
            accessToken: process.env.PLATFORM_TOKEN,
            storeHash: process.env.PLATFORM_IDENTIFIER,
            responseType: 'json',
            apiVersion: 'v2', // Default is v2
        });
    }

    async getOrder(orderId: number) {
        const data: BigCommerceOrder = await this.bc2.get(`/orders/${orderId}`);
        return data;
    }

    async getSubItems(orderId: number, subsData: Omit<SubscriptionItem, 'price'>[]) {
        const data = await this.bc2.get(`/orders/${orderId}/products`);

        const subTypes: Pick<SubscriptionItem, 'interval_id' | 'subscription_group_id'>[] = [];

        const items: SubscriptionItem[] = await Promise.all(subsData.map((item) => {
            const orderItem = data.find((x: any) => x.variant_id === parseInt(item.platform_variant_id, 10));

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
                price: (orderItem?.base_price * 100),
            };
        }));

        const subSets = [...new Map(subTypes.map(obj => [JSON.stringify(obj), obj])).values()];

        return subSets.map((x: any) => items?.filter((item: any) => item.interval_id === x.interval_id && item.subscription_group_id === x.subscription_group_id));
    }

    async getShippingAddress(orderId: number) {
        const data: BigCommerceShippingAddress[] = await this.bc2.get(`/orders/${orderId}/shipping_addresses`);

        const country = states.find((territory: any) => territory.abbreviation === data[0].country_iso2);

        if (country === undefined) {
            throw new Error('country is undefined');
        }

        const province = country.states.find((state: any) => state.name === data[0].state);

        if (province === undefined) {
            throw new Error('province is undefined');
        }

        const address: BoldCommerceAddress = {
            first_name: data[0].first_name,
            last_name: data[0].last_name,
            company: data[0].company,
            phone: data[0].phone,
            street1: data[0].street_1,
            street2: data[0].street_2,
            city: data[0].city,
            province: data[0].state,
            province_code: province.abbreviation,
            country: data[0].country,
            country_code: data[0].country_iso2,
            zip: data[0].zip,
        };
        return address;
    }

    async getBillingAddress(billingAddress: BigCommerceOrder['billing_address']) {
        const country = states.find((territory: any) => territory.abbreviation === billingAddress.country_iso2);

        if (country === undefined) {
            throw new Error('country is undefined');
        }

        const province = country.states.find((state: any) => state.name === billingAddress.state);

        if (province === undefined) {
            throw new Error('province is undefined');
        }

        const address: BoldCommerceAddress = {
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
        return address;
    }

    async gerOrderItems(orderId: number) {
        const data = await this.bc2.get(`/orders/${orderId}/products`);

        return data;
    }
}
export default BigCommerceOrders;
