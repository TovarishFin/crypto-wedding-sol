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

## Repo Layout

```
├── Anchor.toml                         // configuration file for anchor. handles things like network etc.
├── Cargo.lock                          // rust package manager locks in dependencies (similar to package.lock.json)
├── Cargo.toml                          // rust package manager file, dependencies are listed/added here
├── README.md                           // starting file for most users, explains what the repo is about
├── app                                 // this is where you could put your javascript based site/dapp code (if you are into monorepos)
├── external_progs                      // you can store program code that you download off of mainnet or some other chain and store it here. you can then add that code the the test validator when testing via Anchor.toml
│   ├── token.so                        // spl_token code
│   └── token_metadata.so               // token_metadata code
├── migrations                          // directory where you put different code for setup/deployment of programs
│   └── deploy.ts                       // an example script that you could modify to deploy your program to a cluster (mainnet, devnet, etc)
├── package-lock.json                   // javascript version of Cargo.lock, for javascript based tests
├── package.json                        // list of javascript dependencies and scripts
├── programs                            // this is where all developed solana program code should go
│   └── crypto-wedding                  // the directory where all crypto-wedding program code goes
│       ├── Cargo.toml                  // another dependency file for the program itself
│       ├── Xargo.toml                  // beyond the scope of this tutorial. more info can be found here: https://github.com/japaric/xargo
│       └── src                         // all program codes goes in here
│           ├── errors.rs               // a file that generally handles errors for crypto-wedding
│           ├── instructions            // various instructions which can be given to crypto-wedding to be executed
│           │   ├── cancel_wedding.rs
│           │   ├── close_partner.rs
│           │   ├── divorce.rs
│           │   ├── give_answer.rs
│           │   ├── mod.rs
│           │   ├── setup_partner.rs
│           │   ├── setup_wedding.rs
│           │   ├── update_name.rs
│           │   ├── update_partner.rs
│           │   └── update_vows.rs
│           ├── lib.rs                  // the main entrypoint of the program
│           ├── state.rs                // contains code relating to state of crypto-wedding
│           └── util.rs                 // various utility functions that could be used in different places
├── targetYEvD5g                        // not entirely sure tbh :) its a place where builds of some sort would in theory go...
├── tests                               // directory where all tests go.
│   ├── crypto-wedding.ts               // wedding specific tests
│   └── helpers.ts                      // various small helper functions to make testing easier
├── tsconfig.json                       // typescript configuration file. beyond the scope of this tutorial
└── yarn.lock                           // another js dependency lockfile... like package.lock.json
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
