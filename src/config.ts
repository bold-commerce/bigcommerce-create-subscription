import { z } from 'zod';

const schema = z.object({
    app: z.object({
        port: z.string().nonempty(),
    }),
    bold: z.object({
        accessToken: z.string().nonempty(),
        shopIdentifier: z.string().nonempty(),
        shopSlug: z.string().nonempty(),
    }),
    platform: z.object({
        clientId: z.string().nonempty(),
        identifier: z.string().nonempty(),
        accessToken: z.string().nonempty(),
    }),
    braintree: z.object({
        publicKey: z.string().nonempty(),
        privateKey: z.string().nonempty(),
    }),
});

export type Config = z.infer<typeof schema>

/**
 * Creates a new app configuration object by loading values from the environment.
 * The result is parsed, so missing values will throw errors.
 *
 * NOTE: This does not call `dotenv`. If you need that, you must do it yourself manually.
 */
export const createConfigFromEnvironment = (): Config => schema.parse({
    app: {
        port: process.env.BOLD_ACCESS_TOKEN,
    },
    bold: {
        accessToken: process.env.BOLD_ACCESS_TOKEN,
        shopIdentifier: process.env.BOLD_SHOP_IDENTIFIER,
        shopSlug: process.env.SHOP_SLUG,
    },
    platform: {
        clientId: process.env.PLATFORM_CLIENT,
        identifier: process.env.PLATFORM_IDENTIFIER,
        accessToken: process.env.PLATFORM_TOKEN,
    },
    braintree: {
        publicKey: process.env.BRAINTREE_PUBLIC_KEY,
        privateKey: process.env.BRAINTREE_PRIVATE_KEY,
    },
});
