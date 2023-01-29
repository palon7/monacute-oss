import pLimit from "p-limit";

export const limitOne = pLimit(1);
export const limitDB = pLimit(3);
