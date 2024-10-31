import db from './db.server.js';

export const deductCustomerPointsInDatabase = async (customerId, pointsToDeduct) => {
  const customerPoint = await db.CustomerPoint.findFirst({
    where: { customerId: customerId },
  });

  if (!customerPoint) {
    throw new Error('Customer not found');
  }

  let newPoints = customerPoint.points - pointsToDeduct;

  if (newPoints <= 0) {
    await db.CustomerPoint.delete({
      where: { customerId: customerId },
    });
  }


  await db.CustomerPoint.update({
    where: { customerId: customerId },
    data: { points: newPoints },
  });
};
