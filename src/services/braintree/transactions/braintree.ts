import BraintreeQraphAPI from '../../api/braintree-graph-api';
import { Transaction } from '../interface/BraintreeInterface';

class Braintree {
    braintree: BraintreeQraphAPI;

    constructor() {
        this.braintree = new BraintreeQraphAPI();
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

        return new Promise((resolve, reject) => {
            this.braintree.post(query, variables)
                .then(({ data, status }: any) => {
                    const transactions = data?.search?.transactions;
                    const payload = transactions?.edges.find((transaction: any) => transaction.node?.legacyId === transactionLegacyId);

                    const braintreeTransaction: Transaction = payload?.node;
                    resolve({ braintreeTransaction, status });
                })
                .catch((error: any) => reject(error));
        });
    }
}

export default Braintree;
