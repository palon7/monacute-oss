/* eslint-disable camelcase */
export interface ElectrumUTXO {
  tx_hash: string;
  tx_pos: number;
  height: number;
  value: number;
}

export interface ElectrumInfo {
  blockchain_height: number;
  server_height: number;
  fee_per_kb: number;
  connected: boolean;
  spv_nodes: number;
  version: string;
}

export interface ElectrumTxStatus {
  confirmations: number;
}
