import { Monacute } from "@prisma/client";
import Crypto from "crypto";
import { CreateMonacute } from "../interface/monacute";
import {
  createMonacute,
  GetGen0MonacuteCount,
  getNextNumber,
} from "../model/monacute";
import { useRandomName } from "../model/name";
import { NFTDescription } from "../util/constant";

export const generateGen0Monacute = async (): Promise<Monacute> => {
  // random genarate name
  const name = await useRandomName();
  // description
  const cardDescription = NFTDescription;
  // generate seed
  const seed = Crypto.randomBytes(256);

  const monacute = await createMonacute({
    name,
    cardDescription,
    number: await getNextNumber(),
    generation: 0,
    seed,
  });
  return monacute;
};
