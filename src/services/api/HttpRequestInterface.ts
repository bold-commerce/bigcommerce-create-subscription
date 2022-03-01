export interface HttpRequest {
    host: string;
    token: string;
    headers: {
        Accept: string;
        Authorization: string;
        [key: string]: string;
    }
}
