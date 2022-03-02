import path from 'path';

import * as dotenv from 'dotenv';
import express, { Application } from 'express';
import createError from 'http-errors';
import bodyParser from 'body-parser';
import cors from 'cors';

import NewOrderController from './controllers/NewOrderController';
import { createConfigFromEnvironment } from './config';

dotenv.config();
const config = createConfigFromEnvironment();

const app: Application = express();

app.use(cors({ origin: true }));

path.join(__dirname);
app.set('views', `${__dirname}/views`);
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/:shop_slug/webhooks/orders', async (req, res) => {
    if (req.headers['x-webhook-header'] === `${config.platform.accessToken}` && req.body.scope === 'store/order/transaction/created') {
        const newOrder = new NewOrderController(config);

        const orderId = parseInt(req.body.data.order_id, 10);
        const order = await newOrder.handleNewBigCommerceOrder(orderId);

        if (order.error) {
            res.status(order?.status || 500).send(order.error);
        } else {
            res.status(order?.status || 201).send(order.data);
        }
    } else {
        res.status(401).send({ message: 'Unauthorized' });
    }
});

app.use((req, res) => {
    res.json(createError(404));
});

const port = Number.parseInt(config.app.port, 10) || 8000;
// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Server running on port ${port}`));
export default app;
