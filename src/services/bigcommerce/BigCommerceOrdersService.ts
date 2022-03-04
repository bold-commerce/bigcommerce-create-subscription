import BigCommerce from 'node-bigcommerce';
import { z, ZodError } from 'zod';

import { Config } from '../../config';
import states from '../../states.json';
import { BoldCommerceAddress, SubscriptionItem } from '../bold/schema';
import {
    ResourceNotFoundError,
    DependencyError,
    ConfigurationError,
} from '../../errors';

import bigCSchema, { BigCommerceOrder } from './schema';

const bigCommerceApiErrorSchema = z.object({
    code: z.number(),
    responseBody: z.string().or(z.object({})),
});

type BigCommerceApiError = z.infer<typeof bigCommerceApiErrorSchema> & Error

const isBigCommerceAPiError = (err: unknown): err is BigCommerceApiError => (
    bigCommerceApiErrorSchema.safeParse(err).success
    && err instanceof Error
);

class BigCommerceOrdersService {
    bc2: BigCommerce;

    constructor(config: Pick<Config, 'platform'>) {
        const { clientId, accessToken, identifier } = config.platform;
        this.bc2 = new BigCommerce({
            clientId,
            accessToken,
            storeHash: identifier,
            responseType: 'json',
            apiVersion: 'v2', // Default is v2
        });
    }

    async getOrder(orderId: number) {
        try {
            return bigCSchema.order.parse(await this.bc2.get(`/orders/${orderId}`));
        } catch (err) {
            if (isBigCommerceAPiError(err)) {
                if (err.code === 404) {
                    throw new ResourceNotFoundError(`Could not find order ID ${orderId} in dependency: BigCommerce`, err);
                } else if (err.code === 401 || err.code === 403) {
                    throw new ConfigurationError('Failed to authorize with dependency BigCommerce', err);
                } else {
                    throw new DependencyError('BigCommerce', err);
                }
            } else if (err instanceof ZodError) {
                throw new ResourceNotFoundError(JSON.stringify(err.format()), err);
            } else if (err instanceof Error) {
                throw new DependencyError('BigCommerce', err);
            }
            throw err;
        }
    }

    async getSubItems(orderId: number, subsData: Omit<SubscriptionItem, 'price'>[]) {
        try {
            const data = bigCSchema.orderProducts.parse(await this.bc2.get(`/orders/${orderId}/products`));

            const subTypes: Pick<SubscriptionItem, 'interval_id' | 'subscription_group_id'>[] = [];

            const items = subsData.map((item) => {
                const orderItem = data.find(x => x.variant_id === parseInt(item.platform_variant_id, 10));
                if (!orderItem) {
                    throw new ResourceNotFoundError(`Could not find subscription order item for BigCommerce variant ID ${item.platform_product_id}`);
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
            });

            const subSets = [...new Map(subTypes.map(obj => [JSON.stringify(obj), obj])).values()];

            return subSets.map(x => items.filter(item => (
                item.interval_id === x.interval_id
                && item.subscription_group_id === x.subscription_group_id
            )));
        } catch (err) {
            if (isBigCommerceAPiError(err)) {
                if (err.code === 404) {
                    throw new ResourceNotFoundError(`Could not find order ID ${orderId} in dependency: BigCommerce`, err);
                } else if (err.code === 401 || err.code === 403) {
                    throw new ConfigurationError('Failed to authorize with dependency BigCommerce', err);
                } else {
                    throw new DependencyError('BigCommerce', err);
                }
            } else if (err instanceof ZodError) {
                throw new ResourceNotFoundError(JSON.stringify(err.format()), err);
            } else if (err instanceof Error) {
                throw new DependencyError('BigCommerce', err);
            }
            throw err;
        }
    }

    async getShippingAddress(orderId: number): Promise<BoldCommerceAddress> {
        try {
            const data = bigCSchema.shippingAddresses.parse(await this.bc2.get(`/orders/${orderId}/shipping_addresses`));
            const address = data[0];

            const country = states.find(territory => territory.abbreviation === address.country_iso2);
            if (country === undefined) {
                throw new ResourceNotFoundError(`Unsupported country code: ${address.country_iso2}`);
            }

            const province = country.states.find(state => state.name === address.state);
            if (province === undefined) {
                throw new ResourceNotFoundError(`Unsupported state code: ${address.state}`);
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
        } catch (err) {
            if (isBigCommerceAPiError(err)) {
                if (err.code === 404) {
                    throw new ResourceNotFoundError(`Could not shipping address for order ID ${orderId} in dependency: BigCommerce`, err);
                } else if (err.code === 401 || err.code === 403) {
                    throw new ConfigurationError('Failed to authorize with dependency BigCommerce', err);
                } else {
                    throw new DependencyError('BigCommerce', err);
                }
            } else if (err instanceof ZodError) {
                throw new ResourceNotFoundError(JSON.stringify(err.format()), err);
            } else if (err instanceof Error) {
                throw new DependencyError('BigCommerce', err);
            }
            throw err;
        }
    }

    // eslint-disable-next-line class-methods-use-this
    async getBillingAddress(billingAddress: BigCommerceOrder['billing_address']): Promise<BoldCommerceAddress> {
        const country = states.find(territory => territory.abbreviation === billingAddress.country_iso2);
        if (country === undefined) {
            throw new ResourceNotFoundError(`Unsupported country code: ${billingAddress.country_iso2}`);
        }

        const province = country.states.find(state => state.name === billingAddress.state);
        if (province === undefined) {
            throw new ResourceNotFoundError(`Unsupported state code: ${billingAddress.state}`);
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
        try {
            return bigCSchema.orderProducts.parse(await this.bc2.get(`/orders/${orderId}/products`));
        } catch (err) {
            if (isBigCommerceAPiError(err)) {
                if (err.code === 404) {
                    throw new ResourceNotFoundError(`Could not shipping address for order ID ${orderId} in dependency: BigCommerce`, err);
                } else if (err.code === 401 || err.code === 403) {
                    throw new ConfigurationError('Failed to authorize with dependency BigCommerce', err);
                } else {
                    throw new DependencyError('BigCommerce', err);
                }
            } else if (err instanceof ZodError) {
                throw new ResourceNotFoundError(JSON.stringify(err.format()), err);
            } else if (err instanceof Error) {
                throw new DependencyError('BigCommerce', err);
            }
            throw err;
        }
    }
}
export default BigCommerceOrdersService;
