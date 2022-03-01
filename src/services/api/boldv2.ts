import axios, { AxiosResponse } from 'axios';
import * as dotenv from 'dotenv';

import { HttpRequest } from './HttpRequestInterface';

dotenv.config();


const formatAxiosResponse = <T>(promise: Promise<AxiosResponse<T>>) => promise
    .then(({ data, status }) => ({ data, status }))
    .catch((error: any) => ({
        error: error.response.data,
        status: error.response.status as number,
    }));


class Boldv2 {
    host: HttpRequest['host'];

    token: HttpRequest['token'];

    headers: HttpRequest['headers'];

    constructor() {
        this.host = 'https://api.boldcommerce.com';
        const boldDemoApi = process.env.BOLD_ACCESS_TOKEN;
        if (boldDemoApi === undefined) {
            throw new Error('Bold Demo Api is undefined');
        }
        this.token = boldDemoApi;
        this.headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${this.token}`,
        };
    }

    async get(params: string) {
        return formatAxiosResponse(
            axios.get(`${this.host}${params}`, { headers: this.headers }),
        );
    }

    async delete(params: string) {
        return formatAxiosResponse(
            axios.delete(`${this.host}${params}`, { headers: this.headers }),
        );
    }

    async post(params: string, body: any) {
        return formatAxiosResponse(
            axios.post(`${this.host}${params}`, body, { headers: this.headers }),
        );
    }

    async put(params: string, body: any) {
        return formatAxiosResponse(
            axios.put(`${this.host}${params}`, body, { headers: this.headers }),
        );
    }

    async patch(params: string, body: any) {
        return formatAxiosResponse(
            axios.patch(`${this.host}${params}`, body, { headers: this.headers }),
        );
    }
}

export default Boldv2;
