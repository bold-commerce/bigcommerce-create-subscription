import { ZodError } from 'zod';

import {
    ResourceNotFoundError,
    ConfigurationError,
    DependencyError,
} from '../../errors';
import BraintreeGraphAPIClient from '../../clients/BraintreeGraphAPIClient';
import { Config } from '../../config';

import schema from './schema';

const formatOrderIdErrorMessage = (
    orderId: number,
    transactionLegacyId: string,
    data: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    status: number,
): [string, Error] => [
    `Could not find braintree transaction ID ${transactionLegacyId} for order ID ${orderId}`,
    new Error(JSON.stringify({ data, status })),
];

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
                try {
                    if (status === 404) {
                        throw new ResourceNotFoundError(...formatOrderIdErrorMessage(orderId, transactionLegacyId, data, status));
                    } else if (status === 401 || status === 403) {
                        throw new ConfigurationError('Authorization failed with BrainTree');
                    } else if (status !== 200) {
                        throw new DependencyError('Braintree');
                    }

                    const queryResult = schema.queryResponse.parse(data);

                    const braintreeTransaction = queryResult?.data?.search?.transactions?.edges
                        ?.map(transaction => schema.transaction.parse(transaction.node))
                        .find(transactionNode => transactionNode.legacyId === transactionLegacyId);

                    if (!braintreeTransaction) {
                        throw new ResourceNotFoundError(...formatOrderIdErrorMessage(orderId, transactionLegacyId, data, status));
                    }

                    return { braintreeTransaction };
                } catch (err) {
                    if (err instanceof ZodError) {
                        throw new ResourceNotFoundError(...formatOrderIdErrorMessage(orderId, transactionLegacyId, data, status));
                    }
                    throw err;
                }
            });
    }
}

export default BraintreeTransactionService;
