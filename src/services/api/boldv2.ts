/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosResponse, AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

interface ErrorObject {
    error: unknown,
    status: number,
}

const formatAxiosResponse = <T>(promise: Promise<AxiosResponse<T>>): Promise<AxiosResponse<T> | ErrorObject> => promise
    .catch((error: any) => ({
        error: error.response.data,
        status: error.response.status as number,
    }));

class Boldv2 {
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
        return formatAxiosResponse(
            this.axios.get(params),
        );
    }

    async delete(params: string) {
        return formatAxiosResponse(
            this.axios.delete(params),
        );
    }

    async post(params: string, body: any) {
        return formatAxiosResponse(
            this.axios.post(params, body),
        );
    }

    async put(params: string, body: any) {
        return formatAxiosResponse(
            this.axios.put(params, body),
        );
    }

    async patch(params: string, body: any) {
        return formatAxiosResponse(
            this.axios.patch(params, body),
        );
    }
}

export default Boldv2;
