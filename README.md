# CryptoWedding (Solana Edition)

This is the finished code which is the result of following the [crypto-wedding tutorial](https://github.com/TovarishFin/crypto-wedding-sol-tutorial).

## Setup

You must have the following installed (instructions can be found on the tutorial [README](https://github.com/TovarishFin/crypto-wedding-sol-tutorial))

- rust
- nodejs
- solana cli
- anchor cli

Additionally make sure that you have an account setup for the solana cli:

```sh
solana-keygen new
```

This will **NOT** overwrite any old keys unless you use `--force` **DO NOT** use force unless you
know what you are doing and are sure that you have **NO FUNDS** on the account.

## Running the Tests

simply run:

```sh
anchor test
```

## Possible Updates

There are plenty of little extra bits of functionality that can be added... here are a few ideas:

### Add ability to set a wedding photo

This can be extremely simple where the user sets a url where a wedding photo is saved or it can
be something more complex which uses IPFS, Arweave, or Shadowdrive. AWS S3 bucket is always a dead
solution though :). Make sure to setup permissions so only wedding users can update a wedding's photo!

### Rings as NFTs which are handled by the contract

The contract could act like some kind of an escrow for two NFT rings which are exchanged when
getting married. You could also just add this exchange in 2 simple token instructions which are
included with the wedding instructions. But that would probably be a lot more simple and boring.

### Build a frontend for it

You will need to learn how to use the needed javascript libraries out there for this. There are
plenty of tutorials for this. It should be pretty straightforward.

### Build a CLI for it

If you want to stay in the backend side of things you can build a CLI for it. You can use [this
repository](https://github.com/TovarishFin/crypto-wedding-sol-cli) for inspiration if you need some guidance on how to interact with programs from rust.
