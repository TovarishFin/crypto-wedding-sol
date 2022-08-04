import * as anchor from "@project-serum/anchor";
import { IDL as SplTokenIDL } from "@project-serum/anchor/dist/cjs/spl/token";
import { IDL as AssociatedTokenIDL } from "@project-serum/anchor/dist/cjs/spl/associated-token";
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { addFunds } from "./helpers";
import { SplAssociatedTokenCoder } from "@project-serum/anchor/dist/cjs/coder/spl-associated-token";
import { SplTokenCoder } from "@project-serum/anchor/dist/cjs/coder/spl-token";
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SYSVAR_RENT_PUBKEY, PublicKey } from "@solana/web3.js";

chai.use(chaiAsPromised);
const { expect } = chai;

describe("when playing with NFT rings...", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const eToken = new anchor.Program(
    SplTokenIDL,
    TOKEN_PROGRAM_ID,
    provider,
    new SplTokenCoder(SplTokenIDL)
  );
  const eAssociatedToken = new anchor.Program(
    AssociatedTokenIDL,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    provider,
    new SplAssociatedTokenCoder(AssociatedTokenIDL)
  );

  const uMinter = anchor.web3.Keypair.generate();
  const user0 = anchor.web3.Keypair.generate();
  const user1 = anchor.web3.Keypair.generate();

  const aMint = anchor.web3.Keypair.generate();

  const testDecimals = 0;

  let pAssociatedAccount0: PublicKey;
  let pAssociatedAccount1: PublicKey;

  before("setup", async () => {
    [[pAssociatedAccount0], [pAssociatedAccount1]] = await Promise.all([
      PublicKey.findProgramAddress(
        [
          user0.publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          aMint.publicKey.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      ),
      PublicKey.findProgramAddress(
        [
          user1.publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          aMint.publicKey.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      ),
    ]);
    // need to add funds to each new account we created
    await Promise.all([
      addFunds(provider, uMinter.publicKey, 100),
      addFunds(provider, user0.publicKey, 100),
      addFunds(provider, user1.publicKey, 100),
    ]);
  });

  it("should initialize mint as uMinter", async () => {
    try {
      const rent = await provider.connection.getMinimumBalanceForRentExemption(
        MINT_SIZE
      );

      const createAcctIx = anchor.web3.SystemProgram.createAccount({
        fromPubkey: uMinter.publicKey,
        newAccountPubkey: aMint.publicKey,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID,
        lamports: rent,
      });

      const initializeMintIx = await eToken.methods
        .initializeMint(testDecimals, uMinter.publicKey, uMinter.publicKey)
        .accounts({
          mint: aMint.publicKey,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .instruction();

      const initializeMintTx = new anchor.web3.Transaction().add(
        createAcctIx,
        initializeMintIx
      );

      await provider.sendAndConfirm(initializeMintTx, [uMinter, aMint]);
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }

    const sMint = await eToken.account.mint.fetch(aMint.publicKey);
    expect(sMint.isInitialized).to.equal(true);
    expect(sMint.mintAuthority).to.eql(uMinter.publicKey);
    expect(sMint.freezeAuthority).to.eql(uMinter.publicKey);
    expect(sMint.decimals).to.equal(testDecimals);
    expect(sMint.supply.toNumber()).to.eql(0);
  });

  it("should create an associated token account as user0", async () => {
    try {
      await eAssociatedToken.methods
        .create()
        .accounts({
          authority: user0.publicKey,
          associatedAccount: pAssociatedAccount0,
          owner: user0.publicKey,
          mint: aMint.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user0])
        .rpc();
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  });

  it("should create an associated token account as user1", async () => {
    try {
      await eAssociatedToken.methods
        .create()
        .accounts({
          authority: user1.publicKey,
          associatedAccount: pAssociatedAccount1,
          owner: user1.publicKey,
          mint: aMint.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user1])
        .rpc();
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  });

  it("should mint tokens for user0 as uMinter", async () => {
    await eToken.methods
      .mintTo(new anchor.BN(1))
      .accounts({
        mint: aMint.publicKey,
        to: pAssociatedAccount0,
        authority: uMinter.publicKey,
      })
      .signers([uMinter])
      .rpc();
    try {
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  });

  it("should transfer token from user0 to user1 as user0", async () => {
    try {
      await eToken.methods
        .transfer(new anchor.BN(1))
        .accounts({
          source: pAssociatedAccount0,
          destination: pAssociatedAccount1,
          authority: user0.publicKey,
        })
        .signers([user0])
        .rpc();
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  });
});
