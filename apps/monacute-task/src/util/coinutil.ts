import Decimal from "decimal.js";
import { satoshiPerCoin } from "./constant";

export const decimalToSatoshi = (decimal: number): number =>
  new Decimal(decimal).mul(satoshiPerCoin).toNumber();

export const satoshiToDecimal = (satoshi: number): number =>
  new Decimal(satoshi).div(satoshiPerCoin).toNumber();
