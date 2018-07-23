# MiningProt project

## Introduction

This repository contains the smart contracts, test cases, and deployment scirpts for the contracts:

  - MNP token (ERC20) (MNPRTToken.sol)
  - MNPRT token (ERC721) (MiningProtToken.sol)
  - Management (Management.sol)

## Description

MNP token is ERC 20 which are mined every day using the MNPRT (the mining tokens).

  - Name: MiningProt
  - Symbol: MNP
  - Max Supply: 1,000,000,000
  - Type: ERC20
  - Mining: 0.1% daily from remaining unmined tokens.
  - Mining type: Proof of Stake
  - Premine: 0

MNP token is mined by the owners of the mining token - MNPRT.

  - Name: MiningProt Protocol Mining Token
  - Symbol: MNPRT
  - Max Supply: unlimited
  - Type: ERC721
  - Premine: 20

Emissions happen daily. All of the tokens mined within a day are distributed between 3 groups:

Miners get 40% of the overall token amount;

DAO receives 30% of daily mined tokens;

30% is reserved for internal development fund.

## Solidity compiler
- build Version :
> 0.4.24+commit.e67f0147.Emscripten.clang

## Truffle
- Version : Truffle v4.1.11

## Dependencies
We use Truffle in order to compile and test the contracts.

It can be installed:
`npm install -g truffle@4.1.11`

For more information visit https://truffle.readthedocs.io/en/latest/

We use solidity-coverage in order to define the tests coverage.

It can be installed:
`npm install --save-dev solidity-coverage`

For more information visit https://www.npmjs.com/package/solidity-coverage

Also running node with active json-rpc is required. For testing puproses we suggest using https://github.com/trufflesuite/ganache

It can be installed:
`npm install ganache-cli`

## Usage

#### Test

Constracts and scripts for testing are in the branch called "full_tests". Checkout into the branch to run tests.

1. Start ganache node server: `node_modules/.bin/ganache-cli -e 10000 --gasLimit 0xfffffffffff &`

2. `truffle compile` - compile all contracts

3. `truffle test --network ganache` - run tests


#### Test coverage

1. Open a terminal at the project folder.
2. `./node_modules/.bin/solidity-coverage` - run tests and check the coverage
