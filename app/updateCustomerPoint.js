import db from './db.server.js';
export const updateCustomerPointsInDatabase = async (customerId, pointsEarned, customerInfo) => {
  const customerPoint = await db.CustomerPoint.findFirst({
    where: { customerId: customerId },
  });

  let newPoints = pointsEarned;

  if (customerPoint) {
    newPoints += customerPoint.points;
    await db.CustomerPoint.update({
      where: { customerId: customerId },
      data: { points: newPoints },
    });
  } else {
    await db.CustomerPoint.create({
      data: {
        customerId: customerId,
        points: newPoints,
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone || "N/A",
      },
    });
  }

  console.log(`Customer ${customerId} now has ${newPoints} points.`);
};
