export type CreateMonacute = {
  number: number;
  name: string;
  cardDescription: string;
  generation: number;
  seed: Buffer;
};

export type PublishMonacute = {
  id: number;
  assetId: null;
  number: number;
  name: string;
  cardCid: string;
  imageCid: string;
  dnaUrl: string | null;
  cardDescription: string;
  generation: number;
  seed: Buffer;
  published: boolean;
};
