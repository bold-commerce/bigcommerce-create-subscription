/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

class BoldApiClient {
    private axios: AxiosInstance;

    constructor() {
        const token = process.env.BOLD_ACCESS_TOKEN;
        if (token === undefined) {
            throw new Error('Bold Demo Api is undefined');
        }

        this.axios = axios.create({
            baseURL: 'https://api.boldcommerce.com',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
    }

    async get(params: string) {
        return this.axios.get(params);
    }

    async delete(params: string) {
        return this.axios.delete(params);
    }

    async post(params: string, body: any) {
        return this.axios.post(params, body);
    }

    async put(params: string, body: any) {
        return this.axios.put(params, body);
    }

    async patch(params: string, body: any) {
        return this.axios.patch(params, body);
    }
}

export default BoldApiClient;
