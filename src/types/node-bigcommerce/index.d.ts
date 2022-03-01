declare module "node-bigcommerce" {
    export = BigCommerce;
  }
  
  declare class BigCommerce {
    constructor(
      config: {
        logLevel?: "info";
        clientId?: string;
        secret?: string;
        callback?: string;
        accessToken?: string;
        storeHash?: string;
        responseType?: "json" | "xml";
        apiVersion?: "v2" | "v3";
        headers?: any;
      }
    );
  
    verify(signedRequest: any): BcVerifyResponse;
    authorize(query: any): Promise<BcAuthResponse>;
    request(type: "GET" | "POST" | "PUT" | "DELETE", path: string, data?: any): Promise<any>;
    get(path: string): Promise<any>;
    post(path: string, data: any): Promise<any>;
    put(path: string, data: any): Promise<any>;
    delete(path: string): Promise<any>;
  }
  
  interface BcAuthResponse {
    access_token: string;
    scope: string;
    user: {
      id: number;
      username: string;
      email: string;
    };
    context: string;
  }
  
  interface BcVerifyResponse {
    user: {
      id: number;
      email: string;
    };
    owner: { 
      id: number;
      email: string; 
    };
    context: string;
    store_hash: string;
    timestamp: number;
  }