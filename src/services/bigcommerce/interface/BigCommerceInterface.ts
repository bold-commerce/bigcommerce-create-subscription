export interface OrderProducts {
    product_id: string;
    variant_id: string;
    base_price: string;
 }

export interface BigCommerceShippingAddress{
    first_name: string;
    last_name: string;
    company: string;
    street_1: string;
    street_2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    country_iso2: string;
    phone: string;
    email: string;
    form_fields: any[]
}

export interface BigCommerceOrder {
    id: number;
    customer_id: number;
    date_created: string;
    payment_method: string;
    customer_message: string;
    currency_code: string;
    staff_notes: string;
    currency_exchange_rate: string;
    payment_provider_id: string;
    billing_address: {
        first_name: string;
        last_name: string;
        company: string;
        street_1: string;
        street_2: '';
        city: string;
        state: string;
        zip: string;
        country: string;
        country_iso2: string;
        phone: string;
        email: string;
        form_fields: []
    }
}
