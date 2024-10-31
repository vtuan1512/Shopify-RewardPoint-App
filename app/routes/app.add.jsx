import db from '../db.server';
import { json } from "@remix-run/node";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const points = parseInt(formData.get("points"), 10);
  const customerIds = formData.getAll("customerIds[]"); // Nhận tất cả ID khách hàng
  const firstNames = formData.getAll("firstNames[]"); // Nhận tất cả tên
  const lastNames = formData.getAll("lastNames[]"); // Nhận tất cả họ
  const emails = formData.getAll("emails[]"); // Nhận tất cả email
  const phones = formData.getAll("phones[]"); // Nhận tất cả số điện thoại

  console.log("Form Data Entries:", Array.from(formData.entries()));

  const responses = []; // Mảng để lưu thông báo

  for (let i = 0; i < customerIds.length; i++) {
    const customerId = customerIds[i];
    const email = emails[i];
    const firstName = firstNames[i];
    const lastName = lastNames[i];
    const phone = phones[i];

    const name = `${firstName} ${lastName}`;

    const existingCustomer = await db.CustomerPoint.findFirst({
      where: { customerId: customerId }
    });

    if (existingCustomer) {
      await db.CustomerPoint.update({
        where: { id: existingCustomer.id },
        data: { points: points }
      });
      responses.push(`Points for ${name} updated successfully!`);
    } else {
      await db.CustomerPoint.create({
        data: {
          customerId: customerId,
          points: points,
          email: email,
          name: name,
          phone: phone
        }
      });
      responses.push(`Customer ${name} created and points added successfully!`);
    }
  }

  return json({ success: responses });
};
