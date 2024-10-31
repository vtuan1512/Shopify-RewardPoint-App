import db from '../db.server';
import { json } from "@remix-run/node";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const id = parseInt(formData.get("id"), 10) || 0;
  const customerId = formData.get("customerId");
  const points = parseInt(formData.get("points"), 10);
  const email = formData.get("email");
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const phone = formData.get("phone");

  console.log("Form Data Entries:", Array.from(formData.entries()));

  const name = `${firstName} ${lastName}`;

  const existingCustomer = await db.CustomerPoint.findFirst({
    where: { id: id }
  });

  if (existingCustomer !== null) {
    await db.CustomerPoint.update({
      where: { id : id },
      data: { points: points}
    });
    return json({ success: "Customer points updated successfully!" });
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
    return json({ success: "Customer created and points added successfully!" });
  }

};
