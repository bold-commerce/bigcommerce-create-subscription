import BraintreeTransactionService from '../services/braintree/BraintreeTransactionService';
import StripeTransactionService from '../services/stripe/StripeTransactions';

class PaymentController {
    private braintree: BraintreeTransactionService;

    private stripe: StripeTransactionService;

    constructor() {
        this.braintree = new BraintreeTransactionService();
        this.stripe = new StripeTransactionService();
    }

    async handlePayments(paymentMethodId: string, orderId: number, transactionId: string) {
        if (paymentMethodId === 'stripev3.card') {
            const { token, status, error } = await this.stripe.init(transactionId);

            return ({
                token, gateway_name: 'Stripe Default Name', status, error,
            });
        } if (paymentMethodId === 'braintree.paypal') {
            const { token, status, error } = await this.braintree.transactionSearchInput(orderId, transactionId);

            return {
                token, gateway_name: 'Braintree Paypal', status, error,
            };
        } if (paymentMethodId === 'braintree.card') {
            const { token, status, error } = await this.braintree.transactionSearchInput(orderId, transactionId);

            return {
                token, gateway_name: 'Braintree Credit Card', status, error,
            };
        }

        return {
            status: 'error', error: `3. Payment Method ${paymentMethodId} is not supported`, token: null, gateway_name: paymentMethodId,
        };
    }
}

export default PaymentController;
