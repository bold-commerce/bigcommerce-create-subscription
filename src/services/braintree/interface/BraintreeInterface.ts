import { z } from 'zod';

const queryResponseSchema = z.object({
    data: z.optional(z.object({
        search: z.optional(z.object({
            transactions: z.optional(z.object({
                edges: z.optional(z.array(z.object({
                    node: z.unknown(),
                }))),
            })),
        })),
    })),
});

const transactionSchema = z.object({
    legacyId: z.string(),
    paymentMethod: z.object({
        usage: z.string(),
        id: z.string(),
        legacyId: z.string(),
        details: z.object({
            __typename: z.string(),
        }),
    }),
});

const transactionErrorSchema = z.object({
    error: z.string(),
});

const schema = {
    queryResponse: queryResponseSchema,
    transaction: transactionSchema,
    transactionError: transactionErrorSchema,
};

export default schema;
export type Transaction = z.infer<typeof transactionSchema>
export type TransactionError = z.infer<typeof transactionErrorSchema>
