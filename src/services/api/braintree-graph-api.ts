import axios, { AxiosResponse } from 'axios';
import * as dotenv from 'dotenv';

import { HttpRequest } from './HttpRequestInterface';

dotenv.config();

interface BraintreeInput {
    input: {
        orderId: {
            is: number,
        },
    }
}

class BraintreeQraphAPI {
    host: HttpRequest['host'];

    token: HttpRequest['token'];

    headers: HttpRequest['headers'];

    constructor() {
        this.host = 'https://payments.sandbox.braintree-api.com/graphql';
        this.token = Buffer.from(`${process.env.BRAINTREE_PUBLIC_KEY}:${process.env.BRAINTREE_PRIVATE_KEY}`).toString('base64');
        this.headers = {
            Accept: 'application/json',
            'Braintree-Version': '2019-01-01',
            Authorization: `Basic ${this.token}`,
            'Content-Type': 'application/json',
        };
    }

    async post(query: string, variables: BraintreeInput) {
        return new Promise((resolve, reject) => {
            axios.post(this.host,
                JSON.stringify({
                    query: `query ${query}`,
                    variables,
                }),
                { headers: this.headers })
                .then((response: AxiosResponse) => {
                    const { data, status } = response;
                    resolve({ data: data.data, status });
                })
                .catch((error: any) => {
                    resolve({ error: error.response.data, status: error.response.status });
                });
        });
    }
}

export default BraintreeQraphAPI;
