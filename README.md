## Description
- This is a sample app demonstrating how to [Programmatically Create Subscriptions with Bold Commerce](https://developer.boldcommerce.com/default/guides/subscriptions-v2/create-subscription).
- This is an example of using the [BigCommerce OS Checkout](https://github.com/bigcommerce/checkout-js) to create the initial order.

## Demo store:
   * [Demo Subscription Items](https://snow-lion.bolddemos.ninja/supplies/)
   * Add an item to cart & proceed to checkout
   * If you have a subscription item in cart it will ask you to first create an account during checkout.
   * Proceed to payment and use test cart 4111 1111 1111 1111
   * After the order is placed navigate to the [Account Area > Manage Subscriptions](https://snow-lion.bolddemos.ninja/manage-subscriptions/) to view your subscription.

## Dependencies/Prerequisites
* Node >= v14.
* NPM >= v6.

## Installation
1. configure your .env file based on the sample-env file.
2. cd into the root directory
3. npm install
4. npm run dev - to test locally
5. Add and start ngrok. Note: use port 8000 to match your Express server.
    * npm install ngrok
    * ngrok http 8000
6. [Register a webhook with BigCommerce](https://developer.bigcommerce.com/api-reference/b3A6MzU5MDUyNzI-create-a-webhook#Request) using the ngrok domain in your destination & webhook header using your BigCommerce Auth Token for security. 

## Testing
1. Add a BigCommerce Order Id in your .env
2. npm run test


## Documentation & Additional Details
   - After the initial order is placed a BigCommerce Webhook is used to capture the order contents, Filter the Payments API & Create a Bold Subscription.
- This example is using the Braintree Sandbox environment which can be updated to production within the .env file. 
    - Please see the sample-env for more details.
    - [Making API Calls with Braintree](https://graphql.braintreepayments.com/guides/making_api_calls/)

- <img src="/api.svg">

## Configuration
1. Platform Configuration
    - [Install Bold Checkout & Bold Subscriptions on BigCommerce](https://www.bigcommerce.com/apps/bold-subscriptions/).
    - Use the same Braintree Credentials in both the [Bold Checkout App](https://www.bigcommerce.com/apps/bold-checkout/) & BigCommerce Payments area.
    - In BigCommerce > Payments > Braintree > Enable Stored Credit Cards with Braintree
    - In BigCommerce > Payments > Braintree > Disable Required CVV when using a stored credit card.
    - In BigCommerce > Payments > Braintree > Enable PayPal & Enable Stored PayPal Account
2. BigCommerce Checkout
    - In BigCommerce > Advanced > Checkout > Checkout Type > Custom Checkout
    - In BigCommerce > Advanced > Checkout > Script URL > Add the checkout source
        -[Checkout Source](https://storage.googleapis.com/bold-sales-demos.appspot.com/dist/auto-loader.js)
    - In BigCommerce > Advanced > Checkout > Order > Disable customers to enter comments with their order.
