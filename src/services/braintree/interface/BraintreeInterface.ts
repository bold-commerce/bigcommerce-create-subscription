export interface Transaction {
        legacyId: string;
        paymentMethod:{
        usage: string;
        id: string;
        legacyId: string;
        details: {
            __typename: string;
        }
    }
}

export interface TransactionError {
    error: string;
}
