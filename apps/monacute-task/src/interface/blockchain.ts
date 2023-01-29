export interface UTXO {
  confirm: number;
  txHash: string;
  txPos: number;
  height: number;
  value: number;
}
