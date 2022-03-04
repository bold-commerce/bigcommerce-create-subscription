/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance } from 'axios';

import { Config } from '../config';
import {
    ConfigurationError,
    DependencyError,
} from '../errors';

class BoldApiClient {
    private axios: AxiosInstance;

    constructor(config: Pick<Config, 'bold'>) {
        const token = config.bold.accessToken;
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

        this.axios.interceptors.response.use(
            res => res,
            (err) => {
                if (axios.isAxiosError(err)) {
                    switch (err.response?.status) {
                    case 401:
                        return Promise.reject(new ConfigurationError('Failed to authenticate with Bold', err));
                    case 403:
                        return Promise.reject(new ConfigurationError('Insufficient authorization with Bold', err));
                    default:
                        return Promise.reject(new DependencyError('Bold Subscriptions', err));
                    }
                }
                return Promise.reject(err);
            },
        );
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
