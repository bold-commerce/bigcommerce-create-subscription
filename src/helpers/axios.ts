import { AxiosError } from 'axios';

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-explicit-any
export function isAxiosError<T>(error: AxiosError | any): error is AxiosError<T> {
    return error && error.isAxiosError;
}
