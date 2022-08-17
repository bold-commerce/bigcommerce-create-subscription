## Description

This sample app demonstrates how to [Programmatically Create Subscriptions](https://developer.boldcommerce.com/default/guides/subscriptions-v2/create-subscription) with the Bold Commerce Subscriptions API.

This project uses a custom checkout frontend based on the [BigCommerce OS Checkout](https://github.com/bigcommerce/checkout-js).

## Dependencies/Prerequisites

- Custom BigCommerce Checkout to add Bold Subscription meta data into checkout.
- A BigCommerce account and API credentials.
- A BoldCommerce account and API credentials.
- Node.js, version 14 or later.
- NPM, version 6 or later.

### Installation

Use the following steps to install this repo (containing the Bold Subscriptions logic) and run the demo store locally:

1. Clone this repository:

   ```sh
   git clone git@github.com:bold-commerce/bigcommerce-create-subscription.git
   cd bigcommerce-create-subscription
   ```

2. Create a .env file from the sample file:

   ```
    cp sample-env .env
   ```

3. Install the required dependencies:

   ```sh
   npm install
   ```

4. Test the local environment:

   ```sh
   npm run dev
   ```

5. Add and start [ngrok](https://ngrok.com/). Note: use port 8000 to match your Express server.

   ```sh
   npm install ngrok
   ngrok http 8000
   ```

6. [Register a webhook with BigCommerce](https://developer.bigcommerce.com/api-reference/b3A6MzU5MDUyNzI-create-a-webhook#Request) using the ngrok domain in your destination and webhook header using your BigCommerce Auth Token for security.
   1. After the initial order is placed, a BigCommerce Webhook is used to capture the order contents, filter the payments API, and create a Bold Subscription.

### Testing

Use the following steps to ensure that the project is set up correctly:

1. Add a BigCommerce Order Id in your `.env` file.
2. Run the following command:

   ```sh
   npm run test
   ```

## Next Steps

- This example is using the Braintree Sandbox environment, which can be updated to production within the `.env` file.
  - Please see the `sample-env` file for more details.

## Additional Documentation:

- [Programmatically Create Subscriptions](https://developer.boldcommerce.com/default/guides/subscriptions-v2/create-subscription)
- [Making API Calls with Braintree](https://graphql.braintreepayments.com/guides/making_api_calls/)

## Demo store

Bold provides a [demo store](https://snow-lion.bolddemos.ninja/supplies/) that allows you to see this example in action before getting started. Use the following steps to observe the functionality that this example enables:

1. [Visit the store](https://snow-lion.bolddemos.ninja/supplies/).
2. Visit a product page, and select **Subscribe to this product today!** Configure the order frequency, and add the product to your cart.
3. Click **Proceed to checkout**.
4. Since you have a subscription item in cart, the store prompts you to create an account. Create an account with sample customer and shipping information.
5. Use 4111 1111 1111 1111 for the credit card number. Use any name, CVV, and expiration date (in the future).
6. After you place the order, navigate to the [Manage Subscriptions page](https://snow-lion.bolddemos.ninja/manage-subscriptions/) to view your subscription.
