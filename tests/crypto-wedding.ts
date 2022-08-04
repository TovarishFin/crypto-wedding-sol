import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { CryptoWedding } from "../target/types/crypto_wedding";
import { PublicKey } from "@solana/web3.js";
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
import { expect } from "chai";
import {
  addFunds,
  WeddingCreated,
  WeddingMarrying,
  WeddingMarried,
  sortPubKeys,
  WeddingDivorcing,
} from "./helpers";

describe("when setting up and cancelling a wedding...", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  // e for executable
  const eCryptoWedding = anchor.workspace
    .CryptoWedding as Program<CryptoWedding>;
  const uCreator = anchor.web3.Keypair.generate();
  // u for user
  const uPartner0 = anchor.web3.Keypair.generate();
  // u for user
  const uPartner1 = anchor.web3.Keypair.generate();

  const name0 = "bob";
  const vows0 = "i will do stuff";

  let pWedding: PublicKey;
  let pPartner0: PublicKey;
  let pPartner1: PublicKey;

  before("setup", async () => {
    const sorted = sortPubKeys(uPartner0.publicKey, uPartner1.publicKey);
    const pWeddingPromise = PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("wedding"),
        ...sorted.map((x) => x.toBuffer()),
      ],
      eCryptoWedding.programId
    );
    const pPartner0Promise = PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("partner"),
        uPartner0.publicKey.toBuffer(),
      ],
      eCryptoWedding.programId
    );
    const pPartner1Promise = PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("partner"),
        uPartner1.publicKey.toBuffer(),
      ],
      eCryptoWedding.programId
    );

    const [[pw, _pwb], [pp0, _pp0b], [pp1, _pp1b]] = await Promise.all([
      pWeddingPromise,
      pPartner0Promise,
      pPartner1Promise,
    ]);

    // assign precomputed PDA pub keys to test scope
    pWedding = pw;
    pPartner0 = pp0;
    pPartner1 = pp1;

    // need to add funds to each new account we created
    await Promise.all([
      addFunds(provider, uCreator.publicKey, 100),
      addFunds(provider, uPartner0.publicKey, 100),
      addFunds(provider, uPartner1.publicKey, 100),
    ]);

    console.log(pWedding.toBase58());
  });

  it("should NOT setupPartner when no wedding PDA", async () => {
    try {
      await eCryptoWedding.methods
        .setupPartner(name0, vows0)
        .accounts({
          user: uPartner0.publicKey,
          other: uPartner1.publicKey,
          partner: pPartner0,
          wedding: pWedding,
        })
        .signers([uPartner0])
        .rpc();
      expect.fail("setupPartner should fail before a pWedding is created");
    } catch (err) {
      expect(err.errorLogs[0]).to.contain(
        "Program log: AnchorError caused by account: wedding. Error Code: AccountNotInitialized."
      );
    }
  });

  it("should setup a wedding as a non-partner (creator)", async () => {
    try {
      await eCryptoWedding.methods
        .setupWedding()
        .accounts({
          creator: uCreator.publicKey,
          userPartner0: uPartner0.publicKey,
          userPartner1: uPartner1.publicKey,
          partner0: pPartner0,
          partner1: pPartner1,
          wedding: pWedding,
        })
        .signers([uCreator])
        .rpc();
    } catch (err) {
      console.error(err);
      console.log(err.programErrorStack[0].toBase58());
      throw new Error(err);
    }

    const dWedding = await eCryptoWedding.account.wedding.fetch(pWedding);
    expect(dWedding.partner0).to.eql(pPartner0);
    expect(dWedding.partner1).to.eql(pPartner1);
    expect(dWedding.status).to.eql(WeddingCreated);
  });

  it("should cancel a wedding", async () => {
    try {
      await eCryptoWedding.methods
        .cancelWedding()
        .accounts({
          user: uPartner0.publicKey,
          creator: uCreator.publicKey,
          userPartner0: uPartner0.publicKey,
          userPartner1: uPartner1.publicKey,
          wedding: pWedding,
        })
        .signers([uPartner0])
        .rpc();
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  });
});

describe("when setting up a wedding...", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  // e for executable
  const eCryptoWedding = anchor.workspace
    .CryptoWedding as Program<CryptoWedding>;
  const uCreator = anchor.web3.Keypair.generate();
  // u for user
  const uPartner0 = anchor.web3.Keypair.generate();
  // u for user
  const uPartner1 = anchor.web3.Keypair.generate();

  let name0 = "bob";
  let vows0 = "i will do stuff";
  let name1 = "alice";
  let vows1 = "i will also do stuff";

  let pWedding: PublicKey;
  let pPartner0: PublicKey;
  let pPartner1: PublicKey;

  before("setup", async () => {
    const sorted = sortPubKeys(uPartner0.publicKey, uPartner1.publicKey);
    const pWeddingPromise = PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("wedding"),
        ...sorted.map((x) => x.toBuffer()),
      ],
      eCryptoWedding.programId
    );
    const pPartner0Promise = PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("partner"),
        uPartner0.publicKey.toBuffer(),
      ],
      eCryptoWedding.programId
    );
    const pPartner1Promise = PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("partner"),
        uPartner1.publicKey.toBuffer(),
      ],
      eCryptoWedding.programId
    );

    const [[pw, _pwb], [pp0, _pp0b], [pp1, _pp1b]] = await Promise.all([
      pWeddingPromise,
      pPartner0Promise,
      pPartner1Promise,
    ]);

    // assign precomputed PDA pub keys to test scope
    pWedding = pw;
    pPartner0 = pp0;
    pPartner1 = pp1;

    // need to add funds to each new account we created
    await Promise.all([
      addFunds(provider, uCreator.publicKey, 100),
      addFunds(provider, uPartner0.publicKey, 100),
      addFunds(provider, uPartner1.publicKey, 100),
    ]);
  });

  it("should setup a wedding as uPartner0", async () => {
    try {
      await eCryptoWedding.methods
        .setupWedding()
        .accounts({
          creator: uPartner0.publicKey,
          userPartner0: uPartner0.publicKey,
          userPartner1: uPartner1.publicKey,
          partner0: pPartner0,
          partner1: pPartner1,
          wedding: pWedding,
        })
        .signers([uPartner0])
        .rpc();
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }

    const dWedding = await eCryptoWedding.account.wedding.fetch(pWedding);
    expect(dWedding.partner0).to.eql(pPartner0);
    expect(dWedding.partner1).to.eql(pPartner1);
    expect(dWedding.status).to.eql(WeddingCreated);
  });

  it("should setup partner0 as user0", async () => {
    try {
      await eCryptoWedding.methods
        .setupPartner(name0, vows0)
        .accounts({
          user: uPartner0.publicKey,
          other: uPartner1.publicKey,
          partner: pPartner0,
          wedding: pWedding,
        })
        .signers([uPartner0])
        .rpc();
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }

    const sPartner0 = await eCryptoWedding.account.partner.fetch(pPartner0);
    expect(sPartner0.wedding).to.eql(pWedding);
    expect(sPartner0.user).to.eql(uPartner0.publicKey);
    expect(sPartner0.name).to.equal(name0);
    expect(sPartner0.vows).to.equal(vows0);
    expect(sPartner0.answer).to.equal(false);
  });

  it("should setup partner1 as user1", async () => {
    try {
      await eCryptoWedding.methods
        .setupPartner(name1, vows1)
        .accounts({
          user: uPartner1.publicKey,
          other: uPartner0.publicKey,
          partner: pPartner1,
          wedding: pWedding,
        })
        .signers([uPartner1])
        .rpc();
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }

    const sPartner1 = await eCryptoWedding.account.partner.fetch(pPartner1);
    expect(sPartner1.wedding).to.eql(pWedding);
    expect(sPartner1.user).to.eql(uPartner1.publicKey);
    expect(sPartner1.name).to.equal(name1);
    expect(sPartner1.vows).to.equal(vows1);
    expect(sPartner1.answer).to.equal(false);
  });

  it("should update partner0 as user0", async () => {
    name0 = "hugo the first of his kind second of his greatness";
    vows0 =
      "something much longer in order to make sure that realloc is called for the account";
    try {
      await eCryptoWedding.methods
        .updatePartner(name0, vows0)
        .accounts({
          user: uPartner0.publicKey,
          other: uPartner1.publicKey,
          partner: pPartner0,
          wedding: pWedding,
        })
        .signers([uPartner0])
        .rpc();
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }

    const sPartner0 = await eCryptoWedding.account.partner.fetch(pPartner0);
    expect(sPartner0.wedding).to.eql(pWedding);
    expect(sPartner0.user).to.eql(uPartner0.publicKey);
    expect(sPartner0.name).to.equal(name0);
    expect(sPartner0.vows).to.equal(vows0);
    expect(sPartner0.answer).to.equal(false);
  });

  it("should update partner1 as user1", async () => {
    name1 = "janice of the next area over or something dunno";
    vows1 =
      "another very long thing that is longer than the last vows to enable realloc";
    try {
      await eCryptoWedding.methods
        .updatePartner(name1, vows1)
        .accounts({
          user: uPartner1.publicKey,
          other: uPartner0.publicKey,
          partner: pPartner1,
          wedding: pWedding,
        })
        .signers([uPartner1])
        .rpc();
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }

    const sPartner1 = await eCryptoWedding.account.partner.fetch(pPartner1);
    expect(sPartner1.wedding).to.eql(pWedding);
    expect(sPartner1.user).to.eql(uPartner1.publicKey);
    expect(sPartner1.name).to.equal(name1);
    expect(sPartner1.vows).to.equal(vows1);
    expect(sPartner1.answer).to.equal(false);
  });

  it("should update name as user0", async () => {
    name0 = "jefferino something";
    try {
      await eCryptoWedding.methods
        .updateName(name0)
        .accounts({
          user: uPartner0.publicKey,
          other: uPartner1.publicKey,
          partner: pPartner0,
          wedding: pWedding,
        })
        .signers([uPartner0])
        .rpc();
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }

    const sPartner0 = await eCryptoWedding.account.partner.fetch(pPartner0);
    expect(sPartner0.wedding).to.eql(pWedding);
    expect(sPartner0.user).to.eql(uPartner0.publicKey);
    expect(sPartner0.name).to.equal(name0);
    expect(sPartner0.vows).to.equal(vows0);
    expect(sPartner0.answer).to.equal(false);
  });

  it("should update name as user1", async () => {
    name1 = "julia something";
    try {
      await eCryptoWedding.methods
        .updateName(name1)
        .accounts({
          user: uPartner1.publicKey,
          other: uPartner0.publicKey,
          partner: pPartner1,
          wedding: pWedding,
        })
        .signers([uPartner1])
        .rpc();
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }

    const sPartner1 = await eCryptoWedding.account.partner.fetch(pPartner1);
    expect(sPartner1.wedding).to.eql(pWedding);
    expect(sPartner1.user).to.eql(uPartner1.publicKey);
    expect(sPartner1.name).to.equal(name1);
    expect(sPartner1.vows).to.equal(vows1);
    expect(sPartner1.answer).to.equal(false);
  });

  it("should update vows as user0", async () => {
    vows0 = "doing stuff and things and things and stuff...";
    try {
      await eCryptoWedding.methods
        .updateVows(vows0)
        .accounts({
          user: uPartner0.publicKey,
          other: uPartner1.publicKey,
          partner: pPartner0,
          wedding: pWedding,
        })
        .signers([uPartner0])
        .rpc();
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }

    const sPartner0 = await eCryptoWedding.account.partner.fetch(pPartner0);
    expect(sPartner0.wedding).to.eql(pWedding);
    expect(sPartner0.user).to.eql(uPartner0.publicKey);
    expect(sPartner0.name).to.equal(name0);
    expect(sPartner0.vows).to.equal(vows0);
    expect(sPartner0.answer).to.equal(false);
  });

  it("should update vows as user1", async () => {
    vows1 = "all the things that stuff was said at that one time";
    try {
      await eCryptoWedding.methods
        .updateVows(vows1)
        .accounts({
          user: uPartner1.publicKey,
          other: uPartner0.publicKey,
          partner: pPartner1,
          wedding: pWedding,
        })
        .signers([uPartner1])
        .rpc();
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }

    const sPartner1 = await eCryptoWedding.account.partner.fetch(pPartner1);
    expect(sPartner1.wedding).to.eql(pWedding);
    expect(sPartner1.user).to.eql(uPartner1.publicKey);
    expect(sPartner1.name).to.equal(name1);
    expect(sPartner1.vows).to.equal(vows1);
    expect(sPartner1.answer).to.equal(false);
  });

  it("should answer yes as user0 and be marrying", async () => {
    try {
      await eCryptoWedding.methods
        .giveAnswer(true)
        .accounts({
          user: uPartner0.publicKey,
          other: uPartner1.publicKey,
          partner: pPartner0,
          otherPartner: pPartner1,
          wedding: pWedding,
        })
        .signers([uPartner0])
        .rpc();
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }

    const sPartner0 = await eCryptoWedding.account.partner.fetch(pPartner0);
    expect(sPartner0.wedding).to.eql(pWedding);
    expect(sPartner0.user).to.eql(uPartner0.publicKey);
    expect(sPartner0.name).to.equal(name0);
    expect(sPartner0.vows).to.equal(vows0);
    expect(sPartner0.answer).to.equal(true);

    const sWedding = await eCryptoWedding.account.wedding.fetch(pWedding);
    expect(sWedding.status).to.eql(WeddingMarrying);
  });

  it("should answer yes as user1 and be married", async () => {
    try {
      await eCryptoWedding.methods
        .giveAnswer(true)
        .accounts({
          user: uPartner1.publicKey,
          other: uPartner0.publicKey,
          partner: pPartner1,
          otherPartner: pPartner0,
          wedding: pWedding,
        })
        .signers([uPartner1])
        .rpc();
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }

    const sPartner1 = await eCryptoWedding.account.partner.fetch(pPartner1);
    expect(sPartner1.wedding).to.eql(pWedding);
    expect(sPartner1.user).to.eql(uPartner1.publicKey);
    expect(sPartner1.name).to.equal(name1);
    expect(sPartner1.vows).to.equal(vows1);
    expect(sPartner1.answer).to.equal(true);

    const sWedding = await eCryptoWedding.account.wedding.fetch(pWedding);
    expect(sWedding.status).to.eql(WeddingMarried);
  });

  it("should divorce as user0 and be divorcing", async () => {
    try {
      await eCryptoWedding.methods
        .divorce()
        .accounts({
          user: uPartner0.publicKey,
          other: uPartner1.publicKey,
          creator: uPartner0.publicKey,
          partner: pPartner0,
          otherPartner: pPartner1,
          wedding: pWedding,
        })
        .signers([uPartner0])
        .rpc();
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }

    const sPartner0 = await eCryptoWedding.account.partner.fetch(pPartner0);
    expect(sPartner0.wedding).to.eql(pWedding);
    expect(sPartner0.user).to.eql(uPartner0.publicKey);
    expect(sPartner0.name).to.equal(name0);
    expect(sPartner0.vows).to.equal(vows0);
    expect(sPartner0.answer).to.equal(false);

    const sWedding = await eCryptoWedding.account.wedding.fetch(pWedding);
    expect(sWedding.status).to.eql(WeddingDivorcing);
  });

  it("should divorce as user1 and be divorced", async () => {
    try {
      await eCryptoWedding.methods
        .divorce()
        .accounts({
          user: uPartner1.publicKey,
          other: uPartner0.publicKey,
          creator: uPartner0.publicKey,
          partner: pPartner1,
          otherPartner: pPartner0,
          wedding: pWedding,
        })
        .signers([uPartner1])
        .rpc();
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }

    const sPartner1 = await eCryptoWedding.account.partner.fetch(pPartner1);
    expect(sPartner1.wedding).to.eql(pWedding);
    expect(sPartner1.user).to.eql(uPartner1.publicKey);
    expect(sPartner1.name).to.equal(name1);
    expect(sPartner1.vows).to.equal(vows1);
    expect(sPartner1.answer).to.equal(false);

    try {
      await eCryptoWedding.account.wedding.fetch(pWedding);
      expect.fail("pWedding should no longer contain sWedding");
    } catch (err) {
      expect(err.message).to.contain("Account does not exist");
    }
  });
});
