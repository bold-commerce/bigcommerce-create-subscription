import path from 'path';

import express, { Application } from 'express';
import createError from 'http-errors';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';

import NewOrderController from './controllers/NewOrderController';

dotenv.config();

const app: Application = express();

app.use(cors({ origin: true }));

path.join(__dirname);
app.set('views', `${__dirname}/views`);
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/:shop_slug/webhooks/orders', async (req, res) => {
    if (req.headers['x-webhook-header'] === `${process.env.PLATFORM_TOKEN}` && req.body.scope === 'store/order/transaction/created') {
        const newOrder = new NewOrderController();


        const orderId = parseInt(req.body.data.order_id, 10);
        const transactionId = req.body.data.transaction_id;

        const order = await newOrder.handleNewBigCommerceOrder(orderId, transactionId);

        // BigCommerce Requires a 200 response from webhooks
        if (order.error) {
            console.log(JSON.stringify({ // eslint-disable-line no-console
                error: order.error,
                order_id: orderId,
                transaction_id: transactionId,
                status: 500,
            }));
            res.status(200).send({ error: order.error, status: 500 });
        } else {
            console.log(JSON.stringify({ // eslint-disable-line no-console
                order_id: orderId,
                transaction_id: transactionId,
            }));
            res.status(200).send({ data: order.data, status: 201 });
        }
    } else {
        res.status(200).send({ message: 'Unauthorized', status: 401 });
    }
});

app.use((req, res) => {
    res.json(createError(404));
});

const port = process.env.PORT || 8000;
// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Server running on port ${port}`));
export default app;
