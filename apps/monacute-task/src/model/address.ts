import { prisma } from "../util/database";

/**
 * Return last using address index.
 * @returns Address index, return -1 if address is not used
 */
export const getLastAddressIndex = async (): Promise<number> => {
  const address = await prisma.address.findFirst({
    orderBy: {
      addressIndex: "desc",
    },
  });
  return address === null ? -1 : address.addressIndex;
};
