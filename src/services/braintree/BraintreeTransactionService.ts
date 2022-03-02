import BraintreeGraphAPIClient from '../../clients/BraintreeGraphAPIClient';
import { Config } from '../../config';

import schema from './schema';

class BraintreeTransactionService {
    braintree: BraintreeGraphAPIClient;

    constructor(config: Pick<Config, 'braintree'>) {
        this.braintree = new BraintreeGraphAPIClient(config);
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

                if (!braintreeTransaction) {
                    throw new Error('Could not find braintree transaction');
                }

                return {
                    braintreeTransaction,
                    status,
                };
            });
    }
}

export default BraintreeTransactionService;
