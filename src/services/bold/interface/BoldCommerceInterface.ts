export interface BoldCommerceAddress {
    first_name: string;
    last_name: string;
    company: string;
    phone: string;
    street1: string;
    street2: string;
    city: string;
    province: string;
    province_code: string;
    country: string;
    country_code: string;
    zip: string;
}

export interface SubscriptionItem {
    line_item_id: string;
    interval_id: string;
    interval_text: string;
    subscription_group_id: string
    platform_product_id: string;
    platform_variant_id: string;
    quantity: number;
    price: number
}

export interface SubscriptionGroups {
    id: number;
}

export interface NextDate {
    day: string;
    week: string;
    month: string;
    year: string;
}

export interface BillingRules {
    id: number;
    subscription_group_id: number;
    interval_number: number;
    interval_type: string;
    interval_name: string;
    billing_rule: string
}

export interface SubscriptionPayload {
    customer: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        notes: string
    };
    subscription: {
        idempotency_key: string;
        next_order_datetime: string;
        last_order_datetime: string;
        subscription_status: string;
        order_rrule: string;
        base_currency: string;
        charged_currency: string;
        base_to_charged_exchange_rate: number;
        line_items: SubscriptionItem[];
        billing_address: BoldCommerceAddress;
        shipping_address: BoldCommerceAddress;
        external_id: string;
        note: string;
        payment_details: {
            gateway_name: string;
            gateway_customer_id: string
        }
    }
}
