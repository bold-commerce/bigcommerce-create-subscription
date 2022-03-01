import { z } from 'zod';

const shippingAddressSchema = z.object({
    first_name: z.string(),
    last_name: z.string(),
    company: z.string(),
    street_1: z.string(),
    street_2: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    country: z.string(),
    country_iso2: z.string(),
    phone: z.string(),
    email: z.string(),
    form_fields: z.array(z.unknown()),
});

const orderSchema = z.object({
    id: z.number(),
    customer_id: z.number(),
    date_created: z.string(),
    payment_method: z.string(),
    customer_message: z.string(),
    currency_code: z.string(),
    staff_notes: z.string(),
    currency_exchange_rate: z.string(),
    payment_provider_id: z.string(),
    billing_address: shippingAddressSchema,
});

const orderProductSchema = z.object({
    product_id: z.number(),
    variant_id: z.optional(z.number()),
    base_price: z.string(),
});

const schema = {
    shippingAddress: shippingAddressSchema,
    shippingAddresses: z.array(shippingAddressSchema),
    order: orderSchema,
    orders: z.array(orderSchema),
    orderProduct: orderProductSchema,
    orderProducts: z.array(orderProductSchema),
};

export default schema;

export type OrderProduct = z.infer<typeof orderProductSchema>
export type BigCommerceShippingAddress = z.infer<typeof shippingAddressSchema>
export type BigCommerceOrder = z.infer<typeof orderSchema>
