import * as anchor from "@project-serum/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";

export const WeddingCreated = { created: {} };
export const WeddingMarrying = { marrying: {} };
export const WeddingMarried = { married: {} };
export const WeddingDivorcing = { divorcing: {} };
export const WeddingDivorced = { divorced: {} };

export const addFunds = async (
  provider: anchor.Provider,
  user: anchor.web3.PublicKey,
  amount: number
): Promise<void> => {
  const [airdropTxHash, { blockhash, lastValidBlockHeight }] =
    await Promise.all([
      provider.connection.requestAirdrop(user, amount * LAMPORTS_PER_SOL),
      provider.connection.getLatestBlockhash(),
    ]);

  await provider.connection.confirmTransaction({
    signature: airdropTxHash,
    blockhash,
    lastValidBlockHeight,
  });

  const balance = await provider.connection.getBalance(user);
  console.log(
    `airdropped ${amount} SOL to ${user.toBase58()} | new balance: ${
      balance / LAMPORTS_PER_SOL
    } SOL`
  );
};

export const sortPubKeys = (
  publicKeyA: PublicKey,
  publicKeyB: PublicKey
): PublicKey[] => {
  const a = new BN(publicKeyA.toBytes());
  const b = new BN(publicKeyB.toBytes());
  let sorted =
    a.cmp(b) == -1 ? [publicKeyA, publicKeyB] : [publicKeyB, publicKeyA];

  return sorted;
};
