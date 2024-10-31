import express from 'express';
import bodyParser from 'body-parser';
import {updateCustomerPointsInDatabase} from './app/updateCustomerPoint.js';
import {deductCustomerPointsInDatabase} from './app/deductCustomerPoints.js';

const app = express();
const PORT = 3001;
const SHOPIFY_SECRET = 'key';

app.use(bodyParser.json());

app.post('/webhook/order/paid', async (req, res) => {
  const orderData = req.body;
  const totalPrice = orderData.total_price;
  const customerId = `gid://shopify/Customer/${orderData.customer.id}`;

  console.log('Order data received:');
  console.log(`Total Price: ${totalPrice}`);
  console.log(`Customer ID: ${customerId}`);
  const customerInfo = {
    name: `${orderData.customer.first_name} ${orderData.customer.last_name}`,
    email: orderData.customer.email,
    phone: orderData.customer.phone,
  };
  const pointsEarned = Math.floor(totalPrice / 10);
  console.log(`Total point: ${pointsEarned}`);
  try {
    await updateCustomerPointsInDatabase(customerId, pointsEarned, customerInfo);
    console.log(`Successfully updated points for customer ${customerId}`);
  } catch (error) {
    console.error(`Failed to update points for customer ${customerId}:`, error);
    res.status(500).send('Failed to update points');
    return;
  }
  res.status(200).send('Webhook received and points updated');
});
app.post('/webhook/order/cancelled', async (req, res) => {
  const orderData = req.body;
  const totalPrice = orderData.total_price;
  const customerId = `gid://shopify/Customer/${orderData.customer.id}`;

  const pointsToDeduct = Math.floor(totalPrice / 10);

  try {
    await deductCustomerPointsInDatabase(customerId, pointsToDeduct);
    console.log(`Successfully deducted points for customer ${customerId}`);
    res.status(200).send('Points deducted successfully');
  } catch (error) {
    console.error(`Failed to deduct points for customer ${customerId}:`, error);
    res.status(500).send('Failed to deduct points');
  }
});
app.post('/webhook/order/fulfillment', async (req, res) => {
  const orderData = req.body;
  const totalPrice = orderData.total_price;
  const pointsEarned = Math.floor(totalPrice / 10);

  console.log(`Customer earned ${pointsEarned} points for this order.`);

  res.status(200).send('Webhook received');
});
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
