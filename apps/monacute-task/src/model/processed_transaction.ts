import {
  Address,
  ProcessedTransaction,
  TransactionStatus,
} from "@prisma/client";
import { prisma } from "../util/database";

export const createProcessedTransaction = async (
  address: Address,
  senderAddress: string,
  txid: string,
  status: TransactionStatus,
  assetId?: string
): Promise<void> => {
  await prisma.address.update({
    where: {
      id: address.id,
    },
    data: {
      transactions: {
        create: {
          id: txid,
          status,
          assetId,
          senderAddress,
        },
      },
    },
  });
};

export const updateProcessedTransactionStatus = async (
  id: string,
  status: TransactionStatus
): Promise<void> => {
  await prisma.processedTransaction.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
};

export const getProcessedTransaction = async (
  txId: string
): Promise<ProcessedTransaction | null> => {
  const transaction = await prisma.processedTransaction.findFirst({
    where: { id: txId },
  });
  return transaction;
};

export const getProcessedTransactionsByStatus = async (
  status: TransactionStatus
): Promise<ProcessedTransaction[]> => {
  const transaction = await prisma.processedTransaction.findMany({
    where: { status },
  });
  return transaction;
};
