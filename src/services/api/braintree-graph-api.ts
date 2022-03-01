import axios, { AxiosError, AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

interface BraintreeInput {
    input: {
        orderId: {
            is: number,
        },
    }
}

class BraintreeQraphAPI {
    private axios: AxiosInstance;

    constructor() {
        const token = Buffer.from(`${process.env.BRAINTREE_PUBLIC_KEY}:${process.env.BRAINTREE_PRIVATE_KEY}`).toString('base64');

        this.axios = axios.create({
            baseURL: 'https://payments.sandbox.braintree-api.com/graphql',
            headers: {
                Accept: 'application/json',
                'Braintree-Version': '2019-01-01',
                Authorization: `Basic ${token}`,
                'Content-Type': 'application/json',
            },
        });
    }

    async post(query: string, variables: BraintreeInput) {
        return this.axios.post('',
            JSON.stringify({
                query: `query ${query}`,
                variables,
            }))
            .then(({ data: { data }, status }) => ({ data, status }))
            .catch((error: AxiosError<unknown>) => ({
                error: error.response?.data,
                status: error.response?.status,
            }));
    }
}

export default BraintreeQraphAPI;
