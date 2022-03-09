# Bold Create Subscription Sample Project
- This is a sample of how to use the Bold Create Subscription Endpoint.
- This is an example of a using the BigCommerce OS Checkout to create the initial order
- After the inital order is placed a BigCommece Webhook is used to capture the order contents, Filter the Braintree API & Create a Bold Commerce Subscription.
- This example is using the Braintree Sandbox environment which can be updated to production within the .env file. Please see the sample-env for more details.
- This example highlights how to deploy using Google App Engine.

### Requirements
* Node >= v14.
* NPM >= v3.

### Prerequisites Platform Payment Configuration
1. Install Bold Checkout & Bold Subscriptions on BigCommerce.
2. Use the same Braintree Credentials in both the Bold Checkout App & BigCommerce Payments area.
3. In BigCommerce > Payments > Braintree > Enable Stored Credit Cards with Braintree
4. In BigCommerce > Payments > Braintree > Disable Required CVV when using a stored credit card.
5. In BigCommerce > Payments > Braintree > Enable PayPal & Enable Stored PayPal Accounts

### Prerequisites BigCommerce OS Checkout
1. Use the sample script which uses BigCommerce Checkout-JS <https://github.com/bigcommerce/checkout-js>
    * For non production testing the API you can use this as a POC Checkout Srouce: https://storage.googleapis.com/bold-sales-demos.appspot.com/dist/auto-loader.js
    * <img src="/checkout-js.png">
2. Use BigCommerce Checkout with Bold Dev Tools.
   * Add this script into the header of your BigCommerce theme.
   * ``` <script> window.addEventListener('load', (event) => { window.BOLD?.checkout?.disable();});</script>```

### Development

1. configure your .env file based on the sample-env file.
2. cd server
3. npm install
4. npm run dev - to test locally
5. Add and start ngrok. Note: use port 8000 to match your Express server.
    * npm install ngrok
    * ngrok http 8000
6. register a webhook with BigCommerce using the ngrok domain in your destination & webhook header using your BigCommerce Auth Token for security. https://developer.bigcommerce.com/api-reference/b3A6MzU5MDUyNzI-create-a-webhook#Request

### Build
1. gcloud app deploy app.decoupled.yaml

### Unit testing
1. Add a BigCommerce Order Id in your .env
2. npm run test

<img src="/api.svg">
