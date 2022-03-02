import axios, { AxiosInstance } from 'axios';

import { Config } from '../config';

interface BraintreeInput {
    input: {
        orderId: {
            is: number,
        },
    }
}

class BraintreeGraphAPIClient {
    private axios: AxiosInstance;

    constructor(config: Pick<Config, 'braintree'>) {
        const token = Buffer.from(`${config.braintree.publicKey}:${config.braintree.privateKey}`).toString('base64');

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
            }));
    }
}

export default BraintreeGraphAPIClient;
