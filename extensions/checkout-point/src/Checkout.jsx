import {
  reactExtension,
  BlockStack,
  Text,
  Checkbox,
  useApplyAttributeChange,
  useCustomer,
  useApi,
} from "@shopify/ui-extensions-react/checkout";
import React from "react";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const applyAttributeChange = useApplyAttributeChange();
  const [points, setPoints] = React.useState(0);
  const [isPointsUsed, setIsPointsUsed] = React.useState(false);
  const customer = useCustomer();
  const customerId = customer?.id;
  const customerIdLastPart = customerId?.split('/').pop();

  const { shop, cost } = useApi();

  React.useEffect(() => {
    async function fetchPoints() {
      try {
        const response = await fetch(
          `https://localhost:3002/api/customer/points?customerId=${customerIdLastPart}`
        );
        const data = await response.json();
        const pointsValue = data.points || 0;

        setPoints(pointsValue);

        await applyAttributeChange({
          key: "customer_points",
          type: "updateAttribute",
          value: pointsValue.toString(),
        });
      } catch (error) {
        console.error("Error fetching points:", error);
      }
    }
    fetchPoints();
  }, [customerIdLastPart, applyAttributeChange]);

  async function onUsePointsChange(isChecked) {
    console.log("Checkbox changed:", isChecked);
    setIsPointsUsed(isChecked);

    const totalAmount = cost.totalAmount?.current?.amount || 0;
    const updatedAmount = isChecked ? totalAmount - points : totalAmount;

    const discountPercentage = isChecked ? (points / totalAmount) * 100 : 0;

    await applyAttributeChange({
      key: "updated_order_amount",
      type: "updateAttribute",
      value: updatedAmount.toFixed(2),
    });

    try {
      const response = await fetch("https://localhost:3002/api/checkbox/state", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ checked: isChecked, discount: discountPercentage.toFixed(2) }), // Gửi discount
      });

      const data = await response.json();
      console.log("API response:", data);
    } catch (error) {
      console.error("Error updating checkbox state:", error);
    }

    await applyAttributeChange({
      key: "use_points",
      type: "updateAttribute",
      value: isChecked ? "yes" : "no",
    });
  }

  return (
    <BlockStack padding={"tight"}>
      <Text>{`Available Points: ${points}`}</Text>
      <Text>Shop name: {shop.name}</Text>
      <Text>Total Amount: {cost.totalAmount?.current?.amount || "N/A"}</Text>
      <Text>Updated Amount: {(isPointsUsed ? (cost.totalAmount?.current?.amount - points).toFixed(2) : cost.totalAmount?.current?.amount) || "N/A"}</Text>
      <Checkbox onChange={onUsePointsChange} checked={isPointsUsed}>
        {"Use my points for this order"}
      </Checkbox>
    </BlockStack>
  );
}
