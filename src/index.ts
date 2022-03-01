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
        const order: any = await newOrder.handleNewBigCommerceOrder(orderId);

        res.status(order.status).send(order.error ? order.error : order.data);
    } else {
        res.status(401).send({ message: 'Unauthorized' });
    }
});


app.use((req, res) => {
    res.json(createError(404));
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server running on port ${port}`));
export default app;
