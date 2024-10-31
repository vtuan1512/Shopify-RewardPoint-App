const { DiscountApplicationStrategy } = require("../generated/api");

const EMPTY_DISCOUNT = {
  discounts: [],
  discountApplicationStrategy: DiscountApplicationStrategy.First,
};

const DEFAULT_DISCOUNT = 220;

function run(input) {
  return {
    discountApplicationStrategy: DiscountApplicationStrategy.First,
    discounts: [
      {
        message: `Default discount of ${DEFAULT_DISCOUNT}% applied`,
        value: {
          fixedAmount: {
            amount: DEFAULT_DISCOUNT,
          },
        },
        targets: [
          {
            orderSubtotal: {
              excludedVariantIds: [],
            },
          },
        ],
      },
    ],
  };
}

module.exports = { run };
