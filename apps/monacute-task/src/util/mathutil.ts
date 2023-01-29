import Decimal from "decimal.js";

export const ceilAt = (num: number, decimal: number): number =>
  Math.ceil((num + Number.EPSILON) * 10 ** decimal) / 10 ** decimal;

export const ceilSatoshiAt = (num: number, decimal: number): number => {
  const multipier = 10 ** (8 - decimal);
  return new Decimal(num).div(multipier).ceil().mul(multipier).toNumber();
};
