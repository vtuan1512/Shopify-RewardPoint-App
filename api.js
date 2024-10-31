import express from 'express';
import cors from 'cors';
import https from 'https';
import fs from 'fs';
import db from '../reward-point-app/app/db.server.js';

const app = express();
const port = 3002;

const httpsOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

app.use(cors());

app.get('/api/customer/points', async (req, res) => {
  const { customerId } = req.query;
  const fullCustomerId = `gid://shopify/Customer/${customerId}`;
  console.log(`Received customerId: ${customerId}`);
  console.log(`Full customerId: ${fullCustomerId}`);

  try {
    const CustomerPoint = await db.CustomerPoint.findFirst({
      where: { customerId: fullCustomerId },
    });

    console.log(`Query result: ${JSON.stringify(CustomerPoint)}`);

    if (!CustomerPoint) {
      return res.status(404).json({ error: 'Không tìm thấy khách hàng với customerId đã cho' });
    }
    res.json({
      name: CustomerPoint.name,
      points: CustomerPoint.points,
      email: CustomerPoint.email,
      phone: CustomerPoint.phone,
    });
  } catch (error) {
    console.error('Lỗi khi truy xuất dữ liệu từ database:', error);
    res.status(500).json({ error: 'Lỗi server khi truy xuất dữ liệu' });
  }
});

app.use(cors());
app.use(express.json());

let checkboxState = {
  checked: false,
  discount: "", // Thêm trường discount
};
app.post('/api/checkbox/state', (req, res) => {
  const { checked, discount } = req.body;

  if (typeof checked !== 'boolean') {
    return res.status(400).json({ message: 'Invalid value for checked. Must be boolean.' });
  }

  checkboxState.checked = checked;

  if (discount !== undefined) {
    checkboxState.discount = discount;
  }

  res.json({ message: 'Checkbox state updated successfully', state: checkboxState });
});
app.get('/api/checkbox/state', (req, res) => {
  res.json(checkboxState);
});

// Sử dụng HTTPS để chạy server
https.createServer(httpsOptions, app).listen(port, () => {
  console.log(`API đang chạy trên https://localhost:${port}`);
});
