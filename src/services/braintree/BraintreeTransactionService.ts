import BraintreeGraphAPIClient from '../../clients/BraintreeGraphAPIClient';

import schema from './schema';

class BraintreeTransactionService {
    braintree: BraintreeGraphAPIClient;

    constructor() {
        this.braintree = new BraintreeGraphAPIClient();
    }

    async transactionSearchInput(orderId: number, transactionLegacyId: string) {
        const query = `Search($input: TransactionSearchInput!) {
            search {
              transactions(input: $input) {
                pageInfo {
                  hasNextPage
                  startCursor
                  endCursor
                },
                edges {
                  node {
                    legacyId
                    paymentMethod {
                      usage
                      id
                      legacyId
                      details {
                        __typename
                      }
                    __typename
                    }
                  }
                }
              }
            }
          }`;
        const variables = {
            input: {
                orderId: {
                    is: orderId,
                },
            },
        };

        return this.braintree.post(query, variables)
            .then(({ data, status }) => {
                const queryResult = schema.queryResponse.parse(data);

                const braintreeTransaction = queryResult?.data?.search?.transactions?.edges
                    ?.map(transaction => schema.transaction.parse(transaction.node))
                    .find(transactionNode => transactionNode.legacyId === transactionLegacyId);


                if (!braintreeTransaction || !braintreeTransaction.legacyId || !braintreeTransaction.paymentMethod || !braintreeTransaction.paymentMethod.legacyId) {
                    return ({ token: null, error: '2. no Braintree transaction found', status: 'error' });
                }

                return { token: braintreeTransaction.paymentMethod.legacyId, status: 'ok', error: null };
            });
    }
}

export default BraintreeTransactionService;
