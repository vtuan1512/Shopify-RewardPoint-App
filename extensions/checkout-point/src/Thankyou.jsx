import {
  reactExtension,
  Text,
  useApi,
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension(
  'purchase.thank-you.cart-line-item.render-after',
  () => <Extension />,
);

function Extension() {
  const {cost} = useApi();
  const totalAmount = cost.totalAmount?.current?.amount || 0;
  const pointsEarned = Math.floor(totalAmount / 10);
  return <Text>You are awarded {pointsEarned} points</Text>;
}
