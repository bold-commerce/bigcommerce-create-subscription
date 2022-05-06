
import { APIContracts, APIControllers } from 'authorizenet';
import * as dotenv from 'dotenv';

dotenv.config();


class AuthorizeNetTransactionService {
    apiLogin: string;

    transactionKey: string;

    constructor() {
        if (process.env.AUTHORIZENET_API_LOGIN === undefined || process.env.AUTHORIZENET_TRANSACTION_KEY === undefined) {
            throw new Error('Authorize.Net Demo Api is undefined');
        }

        this.apiLogin = process.env.AUTHORIZENET_API_LOGIN;
        this.transactionKey = process.env.AUTHORIZENET_TRANSACTION_KEY;
    }

    async getTransactionDetails(transactionId: string) {
        const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
        merchantAuthenticationType.setName(this.apiLogin);
        merchantAuthenticationType.setTransactionKey(this.transactionKey);

        const getRequest = new APIContracts.GetTransactionDetailsRequest();
        getRequest.setMerchantAuthentication(merchantAuthenticationType);
        getRequest.setTransId(transactionId);

        const ctrl = await new APIControllers.GetTransactionDetailsController(getRequest.getJSON());

        const data: any = await new Promise((resolve) => {
            ctrl.execute(() => {
                const apiResponse = ctrl.getResponse();
                const response = new APIContracts.GetTransactionDetailsResponse(apiResponse);

                if (response !== null) {
                    const customerPaymentProfileId = response.getTransaction().getProfile().getCustomerPaymentProfileId();
                    const customerProfileId = response.getTransaction().getProfile().getCustomerProfileId();

                    if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK && customerPaymentProfileId && customerProfileId) {
                        resolve({
                            token: `${customerProfileId}-${customerPaymentProfileId}`,
                            error: null,
                            status: 'ok',
                        });
                    } else {
                        resolve({
                            token: null,
                            error: response.getJSON(),
                            status: 'error',
                        });
                    }
                } else {
                    resolve({
                        token: null,
                        error: 'No transaction details found!',
                        status: 'error',
                    });
                }
            });
        });

        return data;
    }
}

export default AuthorizeNetTransactionService;
