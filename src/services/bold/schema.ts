import { z } from 'zod';

const addressSchema = z.object({
    first_name: z.string(),
    last_name: z.string(),
    company: z.string(),
    phone: z.string(),
    street1: z.string(),
    street2: z.string(),
    city: z.string(),
    province: z.string(),
    province_code: z.string(),
    country: z.string(),
    country_code: z.string(),
    zip: z.string(),
});

const subscriptionItemSchema = z.object({
    line_item_id: z.string(),
    interval_id: z.string(),
    interval_text: z.string(),
    subscription_group_id: z.string(),
    platform_product_id: z.string(),
    platform_variant_id: z.string(),
    quantity: z.number(),
    price: z.number(),
});

const billingRuleSchema = z.object({
    id: z.number(),
    subscription_group_id: z.number(),
    interval_number: z.number(),
    interval_type: z.string(),
    interval_name: z.string(),
    billing_rule: z.string(),
});

const subscriptionGroupSchema = z.object({
    id: z.number(),
    billing_rules: z.array(billingRuleSchema),
});

const nextDateSchema = z.object({
    day: z.string(),
    week: z.string(),
    month: z.string(),
    year: z.string(),
});

const customerSchema = z.object({
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
    phone: z.string(),
    notes: z.string(),
});

const paymentDetailsSchema = z.object({
    gateway_name: z.string(),
    gateway_customer_id: z.string(),
});

const subscriptionSchema = z.object({
    idempotency_key: z.string(),
    next_order_datetime: z.string(),
    last_order_datetime: z.string(),
    subscription_status: z.string(),
    order_rrule: z.string(),
    base_currency: z.string(),
    charged_currency: z.string(),
    base_to_charged_exchange_rate: z.number(),
    line_items: z.array(subscriptionItemSchema),
    billing_address: addressSchema,
    shipping_address: addressSchema,
    external_id: z.string(),
    note: z.string(),
    payment_details: paymentDetailsSchema,
});

const schema = {
    address: addressSchema,
    subscription: subscriptionSchema,
    subscriptionItem: subscriptionItemSchema,
    subscriptionGroup: subscriptionGroupSchema,
    nextDate: nextDateSchema,
    billingRules: billingRuleSchema,
};

export default schema;

export type BoldCommerceAddress = z.infer<typeof addressSchema>
export type SubscriptionItem = z.infer<typeof subscriptionItemSchema>
export type SubscriptionGroups = z.infer<typeof subscriptionGroupSchema>
export type NextDate = z.infer<typeof nextDateSchema>
export type BillingRule = z.infer<typeof billingRuleSchema>

export interface CreateSubscriptionPayload {
    customer: z.infer<typeof customerSchema>,
    subscription: {
        idempotency_key: string,
        next_order_datetime: string,
        last_order_datetime: string,
        subscription_status: string,
        order_rrule: string,
        base_currency: string,
        charged_currency: string,
        base_to_charged_exchange_rate: number,
        line_items: {
            line_item_id: string,
            interval_id: string,
            interval_text: string,
            subscription_group_id: string,
            platform_product_id: string,
            platform_variant_id: string,
            quantity: number,
            price: number,
        }[],
        billing_address: BoldCommerceAddress,
        shipping_address: BoldCommerceAddress,
        external_id: string,
        note: string,
        payment_details: z.infer<typeof paymentDetailsSchema>,
    },
}
